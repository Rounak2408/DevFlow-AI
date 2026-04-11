const MAX_ATTACHMENTS = 5;

/**
 * Only allow URLs we issued for this project (stored under /api/uploads/chat/:projectId/).
 */
export function sanitizeAttachments(projectId, attachments) {
  if (!Array.isArray(attachments) || !attachments.length) return [];
  const pid = String(projectId);
  const base = `/api/uploads/chat/${pid}/`;
  const out = [];
  for (const a of attachments.slice(0, MAX_ATTACHMENTS)) {
    if (!a || !a.url || !['image', 'video', 'audio'].includes(a.type)) continue;
    const u = String(a.url).trim();
    if (!u.startsWith(base) || u.includes('..') || u.split('/').length > 6) continue;
    out.push({
      type: a.type,
      url: u,
      name: String(a.name || '').slice(0, 200),
    });
  }
  return out;
}
