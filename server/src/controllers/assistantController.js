import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { AssistantChat } from '../models/AssistantChat.js';
import { User } from '../models/User.js';
import { buildDevFlowContextBlock, buildInsightsPayload } from '../services/assistantContextService.js';
import { runAssistantCompletion, streamAssistantCompletion } from '../services/assistantAiService.js';
import { enqueueAssistantCompletion } from '../services/aiQueue.js';

const MAX_CHATS_LIST = 80;
const TITLE_LEN = 56;

function chatToClient(c) {
  return {
    id: String(c._id),
    title: c.title,
    pinned: c.pinned,
    messages: (c.messages || []).map((m) => ({
      id: String(m._id),
      role: m.role,
      content: m.content,
      feedback: m.feedback ?? null,
      createdAt: m.createdAt,
    })),
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export async function listHistory(req, res, next) {
  try {
    const q = (req.query.q || req.query.search || '').trim();
    const filter = { userId: req.userId };
    if (q) {
      filter.title = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }
    const chats = await AssistantChat.find(filter)
      .sort({ pinned: -1, updatedAt: -1 })
      .limit(MAX_CHATS_LIST)
      .select('title pinned updatedAt createdAt messages')
      .lean();

    const slim = chats.map((c) => ({
      id: String(c._id),
      title: c.title,
      pinned: c.pinned,
      updatedAt: c.updatedAt,
      createdAt: c.createdAt,
      preview: c.messages?.length ? String(c.messages[c.messages.length - 1].content).slice(0, 120) : '',
    }));
    res.json({ chats: slim });
  } catch (e) {
    next(e);
  }
}

export async function getSuggestions(req, res, next) {
  try {
    const name = req.user?.name || 'User';
    const insights = await buildInsightsPayload(req.userId, name);
    const staticSuggestions = [
      { id: 's1', label: 'Summarize sprint report', prompt: 'Summarize my current sprint using my real DevFlow tasks and status breakdown.' },
      { id: 's2', label: 'Prioritize my tasks', prompt: 'Prioritize my open tasks by impact and deadlines using DevFlow data.' },
      { id: 's3', label: 'Build weekly roadmap', prompt: 'Propose a weekly roadmap based on my workspaces and open tasks.' },
      { id: 's4', label: 'Write client email', prompt: 'Draft a concise client update email based on progress in my DevFlow workspaces.' },
      { id: 's5', label: 'Analyze blockers', prompt: 'Identify likely blockers from my open tasks and suggest next steps.' },
      { id: 's6', label: 'Explain bug from logs', prompt: 'I will paste logs below — explain likely root cause and a fix plan.' },
      { id: 's7', label: 'Generate standup notes', prompt: 'Generate standup notes from my tasks: yesterday, today, blockers.' },
      { id: 's8', label: 'Improve productivity', prompt: 'Give 3 concrete productivity improvements based on my current workload in DevFlow.' },
    ];
    const dynamic = [];
    if (insights.totals.overdue > 0) {
      dynamic.push({
        id: 'd_overdue',
        label: `Clear ${insights.totals.overdue} overdue tasks`,
        prompt: `I have ${insights.totals.overdue} overdue tasks. Help me triage and propose a plan.`,
      });
    }
    if (insights.totals.mineOpen > 0) {
      dynamic.push({
        id: 'd_mine',
        label: 'Focus on my open work',
        prompt: `I have ${insights.totals.mineOpen} open tasks assigned to or created by me. What should I do first?`,
      });
    }
    res.json({ suggestions: [...dynamic, ...staticSuggestions], insightsSnippet: insights.totals });
  } catch (e) {
    next(e);
  }
}

export async function getInsights(req, res, next) {
  try {
    const name = req.user?.name || 'User';
    const insights = await buildInsightsPayload(req.userId, name);
    res.json(insights);
  } catch (e) {
    next(e);
  }
}

async function loadChatForUser(chatId, userId) {
  if (!mongoose.Types.ObjectId.isValid(chatId)) return null;
  return AssistantChat.findOne({ _id: chatId, userId });
}

export async function postChat(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      return next(new Error(errors.array()[0].msg));
    }

    const userId = req.userId;
    const { chatId, message, stream, regenerate } = req.body;
    const text = String(message || '').trim();
    if (!regenerate && !text) {
      res.status(400);
      return next(new Error('Message is required'));
    }
    if (regenerate && !chatId) {
      res.status(400);
      return next(new Error('chatId is required to regenerate'));
    }

    const user = await User.findById(userId).select('name');
    const userName = user?.name || 'User';
    const contextBlock = await buildDevFlowContextBlock(userId, userName);

    let chat;
    if (chatId) {
      chat = await loadChatForUser(chatId, userId);
      if (!chat) {
        res.status(404);
        return next(new Error('Chat not found'));
      }
    } else {
      chat = await AssistantChat.create({
        userId,
        title: text.slice(0, TITLE_LEN) + (text.length > TITLE_LEN ? '…' : ''),
        messages: [],
      });
    }

    if (regenerate && chat.messages.length) {
      const last = chat.messages[chat.messages.length - 1];
      if (last.role === 'assistant') {
        chat.messages.pop();
      }
    } else {
      chat.messages.push({ role: 'user', content: text });
    }

    if (!regenerate && chat.messages.filter((m) => m.role === 'user').length === 1) {
      chat.title = text.slice(0, TITLE_LEN) + (text.length > TITLE_LEN ? '…' : '');
    }

    await chat.save();

    const historyForModel = chat.messages.map((m) => ({ role: m.role, content: m.content }));

    const useStream = Boolean(stream);
    const useQueue = process.env.ASSISTANT_USE_QUEUE === '1' && !useStream;

    if (useStream) {
      res.status(200);
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), Number(process.env.OPENAI_TIMEOUT_MS || 90000));
      let full = '';
      try {
        full = await streamAssistantCompletion(contextBlock, historyForModel, (delta) => {
          res.write(`data: ${JSON.stringify({ delta })}\n\n`);
        }, { signal: ac.signal });
        clearTimeout(t);
        chat.messages.push({ role: 'assistant', content: full || '_(no response)_' });
        chat.updatedAt = new Date();
        await chat.save();
        res.write(`data: ${JSON.stringify({ done: true, chat: chatToClient(chat) })}\n\n`);
      } catch (e) {
        clearTimeout(t);
        const configHint =
          e?.message?.includes('OPENAI_API_KEY') ||
          e?.message?.includes('GEMINI_API_KEY') ||
          e?.message?.includes('GOOGLE_API_KEY') ||
          e?.message?.includes('not configured');
        const msg =
          e?.name === 'AbortError'
            ? 'The AI request timed out. Try a shorter question.'
            : configHint
              ? 'AI provider is not configured. Set OPENAI_API_KEY, or LLM_PROVIDER=ollama (Ollama running locally), or LLM_PROVIDER=gemini with GEMINI_API_KEY.'
              : e?.message || 'AI request failed.';
        res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
      }
      res.end();
      return;
    }

    let assistantText;
    try {
      if (useQueue) {
        assistantText = await enqueueAssistantCompletion(userId, contextBlock, historyForModel);
      } else {
        assistantText = await runAssistantCompletion(contextBlock, historyForModel);
      }
    } catch (e) {
      assistantText =
        e?.message?.includes('OPENAI_API_KEY') ||
        e?.message?.includes('GEMINI_API_KEY') ||
        e?.message?.includes('GOOGLE_API_KEY') ||
        e?.message?.includes('not configured')
          ? 'AI provider is not configured. Set OPENAI_API_KEY, LLM_PROVIDER=ollama, or LLM_PROVIDER=gemini with GEMINI_API_KEY.'
          : `I could not complete that request: ${e.message || 'unknown error'}.`;
    }

    chat.messages.push({ role: 'assistant', content: assistantText || '_(no response)_' });
    chat.updatedAt = new Date();
    await chat.save();

    res.json({ chat: chatToClient(chat), assistantMessage: chat.messages[chat.messages.length - 1] });
  } catch (e) {
    next(e);
  }
}

export async function patchChat(req, res, next) {
  try {
    const { id } = req.params;
    const chat = await loadChatForUser(id, req.userId);
    if (!chat) {
      res.status(404);
      return next(new Error('Chat not found'));
    }
    const { title, pinned } = req.body;
    if (title !== undefined) chat.title = String(title).slice(0, 200).trim() || chat.title;
    if (pinned !== undefined) chat.pinned = Boolean(pinned);
    await chat.save();
    res.json({ chat: chatToClient(chat) });
  } catch (e) {
    next(e);
  }
}

export async function deleteChat(req, res, next) {
  try {
    const { id } = req.params;
    const r = await AssistantChat.deleteOne({ _id: id, userId: req.userId });
    if (!r.deletedCount) {
      res.status(404);
      return next(new Error('Chat not found'));
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

export async function deleteAllChats(req, res, next) {
  try {
    await AssistantChat.deleteMany({ userId: req.userId });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

export async function patchMessageFeedback(req, res, next) {
  try {
    const { id, messageId } = req.params;
    const { feedback } = req.body;
    if (!('feedback' in req.body)) {
      res.status(400);
      return next(new Error('feedback is required'));
    }
    if (feedback !== null && feedback !== 'up' && feedback !== 'down') {
      res.status(400);
      return next(new Error('feedback must be up, down, or null'));
    }
    const chat = await loadChatForUser(id, req.userId);
    if (!chat) {
      res.status(404);
      return next(new Error('Chat not found'));
    }
    const sub = chat.messages.id(messageId);
    if (!sub) {
      res.status(404);
      return next(new Error('Message not found'));
    }
    if (sub.role !== 'assistant') {
      res.status(400);
      return next(new Error('Feedback only on assistant messages'));
    }
    sub.feedback = feedback;
    await chat.save();
    res.json({ ok: true, message: { id: String(sub._id), feedback: sub.feedback } });
  } catch (e) {
    next(e);
  }
}

export async function getOneChat(req, res, next) {
  try {
    const { id } = req.params;
    const chat = await loadChatForUser(id, req.userId);
    if (!chat) {
      res.status(404);
      return next(new Error('Chat not found'));
    }
    res.json({ chat: chatToClient(chat) });
  } catch (e) {
    next(e);
  }
}
