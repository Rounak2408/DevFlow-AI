import { GoogleGenerativeAI } from '@google/generative-ai';

function apiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
}

export function isGeminiConfigured() {
  return Boolean(apiKey()?.trim());
}

function assertGemini() {
  if (!isGeminiConfigured()) {
    throw new Error('GEMINI_API_KEY or GOOGLE_API_KEY is not configured');
  }
}

/** Gemini expects alternating user/model; merge consecutive same-role turns. */
function toGeminiContents(historyMessages) {
  const raw = (historyMessages || [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && String(m.content || '').trim())
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content).slice(0, 32000) }],
    }));
  const merged = [];
  for (const m of raw) {
    const last = merged[merged.length - 1];
    if (last && last.role === m.role) {
      last.parts[0].text += `\n\n${m.parts[0].text}`;
    } else merged.push({ ...m, parts: [{ text: m.parts[0].text }] });
  }
  return merged;
}

function getModel(fullSystemInstruction) {
  assertGemini();
  const genAI = new GoogleGenerativeAI(apiKey());
  // `gemini-1.5-flash` often 404s on newer AI Studio keys; use a current ID (override via GEMINI_MODEL).
  const modelName = (process.env.GEMINI_MODEL || 'gemini-2.0-flash').trim();
  return genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: fullSystemInstruction,
  });
}

export async function runGeminiCompletion(fullSystemInstruction, historyMessages) {
  const model = getModel(fullSystemInstruction);
  const contents = toGeminiContents(historyMessages);
  if (!contents.length) return '';
  const generationConfig = { temperature: 0.45, maxOutputTokens: 4096 };
  const result = await model.generateContent({ contents, generationConfig });
  return result.response.text().trim() || '';
}

export async function streamGeminiCompletion(fullSystemInstruction, historyMessages, onDelta, options = {}) {
  const { signal } = options;
  const model = getModel(fullSystemInstruction);
  const contents = toGeminiContents(historyMessages);
  if (!contents.length) return '';

  const generationConfig = { temperature: 0.45, maxOutputTokens: 4096 };
  const streamResult = await model.generateContentStream(
    { contents, generationConfig },
    signal ? { signal } : undefined
  );

  let full = '';
  for await (const chunk of streamResult.stream) {
    let t = '';
    try {
      t = chunk.text();
    } catch {
      /* empty chunk */
    }
    if (t) {
      full += t;
      onDelta(t);
    }
  }
  return full;
}
