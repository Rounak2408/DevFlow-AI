export function timeAgo(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 45) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function extractUrl(text) {
  const m = String(text).match(/https?:\/\/[^\s<]+/i);
  return m ? m[0].replace(/[),.]+$/, '') : null;
}

export function isOwnMessage(m, meId) {
  const uid = m.user?._id || m.user?.id;
  return uid && meId && String(uid) === String(meId);
}
