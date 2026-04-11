import OpenAI from 'openai';
import { runGeminiCompletion, streamGeminiCompletion, isGeminiConfigured } from './geminiAssistant.js';

const RETRIES = 3;
const BASE_DELAY_MS = 500;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** @returns {'openai' | 'ollama' | 'gemini'} */
export function getAssistantLlmProvider() {
  return (process.env.LLM_PROVIDER || 'openai').trim().toLowerCase();
}

function getOpenAICompatible() {
  const provider = getAssistantLlmProvider();
  if (provider === 'ollama') {
    return {
      client: new OpenAI({
        baseURL: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434/v1',
        apiKey: process.env.OLLAMA_API_KEY || 'ollama',
        timeout: Number(process.env.OPENAI_TIMEOUT_MS || 120000),
      }),
      model: process.env.OLLAMA_MODEL || 'llama3.2',
    };
  }
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error(
      'OPENAI_API_KEY is not configured (set LLM_PROVIDER=ollama for local Ollama, or gemini with GEMINI_API_KEY)'
    );
  }
  return {
    client: new OpenAI({
      apiKey: key,
      timeout: Number(process.env.OPENAI_TIMEOUT_MS || 60000),
    }),
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  };
}

async function withRetry(fn) {
  let lastErr;
  for (let attempt = 0; attempt < RETRIES; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const retryable =
        e?.status === 429 ||
        e?.status >= 500 ||
        e?.code === 'ECONNRESET' ||
        e?.message?.includes('timeout');
      if (!retryable || attempt === RETRIES - 1) throw e;
      await sleep(BASE_DELAY_MS * 2 ** attempt);
    }
  }
  throw lastErr;
}

function trimMessages(messages, maxPairs = 12) {
  const safe = messages.filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content);
  if (safe.length <= maxPairs * 2) return safe;
  return safe.slice(-maxPairs * 2);
}

export const BASE_SYSTEM = `You are DevFlow AI, a premium productivity copilot inside the DevFlow SaaS product.
You help with tasks, sprints, reports, roadmaps, emails, code debugging, meeting notes, and team coordination.
Rules:
- Use the provided "## DevFlow workspace context" as ground truth for tasks, workspaces, and deadlines. If context is empty, say so honestly.
- Never invent other users' private data. Never claim access outside the supplied context.
- Answer in clear Markdown: use headings, bullet lists, tables where helpful, and fenced code blocks for code or logs.
- Be concise but actionable. When listing tasks, group by workspace or priority when it helps.
- If the user asks to change data (create tasks, etc.), explain what they should do in DevFlow UI or offer step-by-step text — you cannot mutate the database from chat.`;

function buildFullSystem(devFlowContextBlock) {
  return `${BASE_SYSTEM}\n\n${devFlowContextBlock}`;
}

async function runOpenAIStyleCompletion(devFlowContextBlock, historyMessages) {
  const { client, model } = getOpenAICompatible();
  const system = buildFullSystem(devFlowContextBlock);
  const msgs = trimMessages(historyMessages).map((m) => ({
    role: m.role,
    content: String(m.content).slice(0, 32000),
  }));

  const completion = await withRetry(() =>
    client.chat.completions.create({
      model,
      messages: [{ role: 'system', content: system }, ...msgs],
      temperature: 0.45,
      max_tokens: 4096,
    })
  );

  return completion.choices[0]?.message?.content?.trim() || '';
}

async function streamOpenAIStyleCompletion(devFlowContextBlock, historyMessages, onDelta, options = {}) {
  const { signal } = options;
  const { client, model } = getOpenAICompatible();
  const system = buildFullSystem(devFlowContextBlock);
  const msgs = trimMessages(historyMessages).map((m) => ({
    role: m.role,
    content: String(m.content).slice(0, 32000),
  }));

  const stream = await client.chat.completions.create(
    {
      model,
      messages: [{ role: 'system', content: system }, ...msgs],
      temperature: 0.45,
      max_tokens: 4096,
      stream: true,
    },
    signal ? { signal } : undefined
  );

  let full = '';
  for await (const chunk of stream) {
    const t = chunk.choices[0]?.delta?.content || '';
    if (t) {
      full += t;
      onDelta(t);
    }
  }
  return full;
}

export async function runAssistantCompletion(devFlowContextBlock, historyMessages) {
  const provider = getAssistantLlmProvider();
  if (provider === 'gemini') {
    if (!isGeminiConfigured()) {
      throw new Error('GEMINI_API_KEY or GOOGLE_API_KEY is not configured');
    }
    const system = buildFullSystem(devFlowContextBlock);
    const msgs = trimMessages(historyMessages).map((m) => ({
      role: m.role,
      content: String(m.content).slice(0, 32000),
    }));
    return withRetry(() => runGeminiCompletion(system, msgs));
  }
  return runOpenAIStyleCompletion(devFlowContextBlock, historyMessages);
}

export async function streamAssistantCompletion(devFlowContextBlock, historyMessages, onDelta, options = {}) {
  const provider = getAssistantLlmProvider();
  if (provider === 'gemini') {
    if (!isGeminiConfigured()) {
      throw new Error('GEMINI_API_KEY or GOOGLE_API_KEY is not configured');
    }
    const system = buildFullSystem(devFlowContextBlock);
    const msgs = trimMessages(historyMessages).map((m) => ({
      role: m.role,
      content: String(m.content).slice(0, 32000),
    }));
    return streamGeminiCompletion(system, msgs, onDelta, options);
  }
  return streamOpenAIStyleCompletion(devFlowContextBlock, historyMessages, onDelta, options);
}
