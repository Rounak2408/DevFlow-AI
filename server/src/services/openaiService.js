import OpenAI from 'openai';

const RETRIES = 3;
const BASE_DELAY_MS = 500;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function getOpenAIClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not configured');
  return new OpenAI({ apiKey: key });
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

export async function generateTaskBreakdown(text) {
  const client = getOpenAIClient();
  const completion = await withRetry(() =>
    client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a senior engineering lead. Given a goal or feature description, return a JSON array of task objects: [{"title": string, "description": string, "priority": "low"|"medium"|"high"|"urgent"}]. No markdown, only valid JSON.',
        },
        { role: 'user', content: text },
      ],
      temperature: 0.4,
    })
  );
  const raw = completion.choices[0]?.message?.content?.trim() || '[]';
  try {
    const parsed = JSON.parse(raw.replace(/^```json\n?|\n?```$/g, ''));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function suggestBugFix(description) {
  const client = getOpenAIClient();
  const completion = await withRetry(() =>
    client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a debugging assistant. Provide concise steps: hypothesis, checks, and a likely fix. Use short bullet points.',
        },
        { role: 'user', content: description },
      ],
      temperature: 0.3,
    })
  );
  return completion.choices[0]?.message?.content?.trim() || '';
}
