/** Chat attachment paths are `/api/uploads/...` — same-origin + Vite proxy in dev. */
export function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return path;
}
