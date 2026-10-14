import Queue from 'bull';
import crypto from 'crypto';
import { getRedis } from '../config/redis.js';
import { generateTaskBreakdown, suggestBugFix } from './openaiService.js';
import { runAssistantCompletion } from './assistantAiService.js';
import { cacheGet, cacheSet } from '../config/redis.js';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

function hashPayload(prefix, text) {
  return crypto.createHash('sha256').update(`${prefix}:${text}`).digest('hex');
}

let taskBreakdownQueue;
let bugSuggestQueue;
let assistantChatQueue;

export function getTaskBreakdownQueue() {
  if (!taskBreakdownQueue) {
    taskBreakdownQueue = new Queue('ai-task-breakdown', redisUrl, {
      defaultJobOptions: { removeOnComplete: 100, removeOnFail: 50, attempts: 2 },
    });
    taskBreakdownQueue.process(async (job) => {
      const { text } = job.data;
      return generateTaskBreakdown(text);
    });
  }
  return taskBreakdownQueue;
}

export function getBugSuggestQueue() {
  if (!bugSuggestQueue) {
    bugSuggestQueue = new Queue('ai-bug-suggest', redisUrl, {
      defaultJobOptions: { removeOnComplete: 100, removeOnFail: 50, attempts: 2 },
    });
    bugSuggestQueue.process(async (job) => {
      const { text } = job.data;
      return suggestBugFix(text);
    });
  }
  return bugSuggestQueue;
}

export function getAssistantChatQueue() {
  if (!assistantChatQueue) {
    assistantChatQueue = new Queue('assistant-chat', redisUrl, {
      defaultJobOptions: {
        removeOnComplete: 40,
        removeOnFail: 20,
        attempts: 2,
        timeout: Number(process.env.ASSISTANT_JOB_MS || 120000),
      },
    });
    assistantChatQueue.process(async (job) => {
      const { contextBlock, historyMessages } = job.data;
      return runAssistantCompletion(contextBlock, historyMessages);
    });
  }
  return assistantChatQueue;
}

/**
 * Run assistant completion via Bull (Redis). Optional short-lived cache for identical context+history.
 */
export async function enqueueAssistantCompletion(userId, contextBlock, historyMessages) {
  const lastUser = [...historyMessages].reverse().find((m) => m.role === 'user');
  const fingerprint = `${userId}:${hashPayload('ctx', contextBlock)}:${hashPayload('tail', JSON.stringify(historyMessages.slice(-6)))}:${lastUser?.content || ''}`;
  const ck = `ai:asst:${hashPayload('asst', fingerprint)}`;
  if (process.env.ASSISTANT_CACHE_TTL !== '0') {
    const cached = await cacheGet(ck);
    if (typeof cached === 'string' && cached.length) return cached;
  }

  const queue = getAssistantChatQueue();
  const job = await queue.add({ contextBlock, historyMessages });
  const text = await job.finished();
  if (process.env.ASSISTANT_CACHE_TTL !== '0') {
    await cacheSet(ck, text, Number(process.env.ASSISTANT_CACHE_TTL || 180));
  }
  return text;
}

export async function enqueueTaskBreakdown(text) {
  const ck = `ai:tb:${hashPayload('tb', text)}`;
  const cached = await cacheGet(ck);
  if (cached) return { fromCache: true, tasks: cached };

  let tasks;
  if (process.env.AI_USE_QUEUE === '1') {
    try {
      const queue = getTaskBreakdownQueue();
      const job = await queue.add({ text });
      tasks = await job.finished();
    } catch (e) {
      console.warn('[aiQueue] Bull queue failed, running direct fallback:', e.message);
      tasks = await generateTaskBreakdown(text);
    }
  } else {
    tasks = await generateTaskBreakdown(text);
  }

  await cacheSet(ck, tasks, Number(process.env.AI_CACHE_TTL || 3600));
  return { fromCache: false, tasks };
}

export async function enqueueBugSuggest(text) {
  const ck = `ai:bug:${hashPayload('bug', text)}`;
  const cached = await cacheGet(ck);
  if (typeof cached === 'string') return { fromCache: true, suggestion: cached };

  let suggestion;
  if (process.env.AI_USE_QUEUE === '1') {
    try {
      const queue = getBugSuggestQueue();
      const job = await queue.add({ text });
      suggestion = await job.finished();
    } catch (e) {
      console.warn('[aiQueue] Bull queue failed, running direct fallback:', e.message);
      suggestion = await suggestBugFix(text);
    }
  } else {
    suggestion = await suggestBugFix(text);
  }

  await cacheSet(ck, suggestion, Number(process.env.AI_CACHE_TTL || 1800));
  return { fromCache: false, suggestion };
}

export function ensureRedisForBull() {
  if (process.env.AI_USE_QUEUE === '1') {
    getRedis();
  }
}
