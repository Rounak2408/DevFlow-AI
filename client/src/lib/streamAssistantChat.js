/**
 * POST /api/assistant/chat with stream: true — parses SSE `data: {...}` frames.
 */
export async function streamAssistantChat({ apiBase, token, body, onDelta, signal }) {
  const url = `${apiBase.replace(/\/$/, '')}/assistant/chat`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...body, stream: true }),
    signal,
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const j = await res.json();
      if (j.message) msg = j.message;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const dec = new TextDecoder();
  let buf = '';

  let finalChat = null;

  const consume = (chunk) => {
    const parts = chunk.split('\n\n');
    const rest = parts.pop() ?? '';
    for (const block of parts) {
      const line = block.trim();
      if (!line.startsWith('data:')) continue;
      const raw = line.slice(5).trim();
      if (raw === '[DONE]') continue;
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        continue;
      }
      if (data.error) throw new Error(data.error);
      if (data.delta) onDelta(data.delta);
      if (data.done && data.chat) finalChat = data.chat;
    }
    return rest;
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (value) {
      buf += dec.decode(value, { stream: true });
      buf = consume(buf);
    }
    if (done) {
      if (buf.trim()) buf = consume(`${buf}\n\n`);
      break;
    }
  }

  return finalChat;
}
