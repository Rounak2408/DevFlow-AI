import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Video,
  Phone,
  MoreVertical,
  Image as ImageIcon,
  Camera,
  Mic,
  Reply,
  Copy,
  Pin,
  Star,
  Forward,
  Trash2,
  Smile,
  PanelRight,
  MessagesSquare,
  Square,
} from 'lucide-react';
import { timeAgo, extractUrl, isOwnMessage } from './chatUtils.js';
import { EmptyState } from '../ui/EmptyState.jsx';
import { mediaUrl } from '../../lib/mediaUrl.js';

function LinkPreviewCard({ url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="mt-2 block overflow-hidden rounded-xl border border-white/[0.08] bg-[#0B0F19] transition duration-300 hover:border-blue-500/30"
    >
      <div className="flex h-28 bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="flex flex-1 items-center justify-center text-[11px] text-slate-500">Preview</div>
      </div>
      <div className="p-3">
        <p className="text-[12px] font-medium text-white line-clamp-1">Shared link</p>
        <p className="mt-0.5 truncate text-[11px] text-blue-400/90">{url}</p>
      </div>
    </a>
  );
}

function AttachmentBlock({ a }) {
  const src = mediaUrl(a.url);
  if (a.type === 'image') {
    return (
      <a href={src} target="_blank" rel="noreferrer" className="mt-2 block">
        <img src={src} alt={a.name || ''} className="max-h-64 w-full rounded-xl object-cover" loading="lazy" />
      </a>
    );
  }
  if (a.type === 'video') {
    return <video src={src} controls className="mt-2 max-h-72 w-full rounded-xl" playsInline />;
  }
  return (
    <div className="mt-2 rounded-xl border border-white/[0.08] bg-[#0B0F19] p-3">
      <audio src={src} controls className="w-full" />
      {a.name ? <p className="mt-1 truncate text-[11px] text-slate-500">{a.name}</p> : null}
    </div>
  );
}

export function ChatMessagesPanel({
  project,
  messages,
  me,
  connected,
  typing,
  input,
  onInputChange,
  onSubmit,
  bottomRef,
  onToggleDetails,
  showDetailsBtn,
  onOpenConversations,
  showConversationsBtn,
  onSendFile,
  uploading,
  onRequestVideoCall,
  onRequestAudioCall,
}) {
  const [menuId, setMenuId] = useState(null);
  const [recording, setRecording] = useState(false);
  const menuRef = useRef(null);
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);
  const recRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    function close(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuId(null);
    }
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const members = [];
  if (project?.owner) members.push(project.owner);
  project?.members?.forEach((m) => m.user && members.push(m.user));
  const avatars = members.slice(0, 4);

  async function startVoice() {
    if (!onSendFile || recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';
      const mr = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      mr.start(250);
      recRef.current = { mr, stream, mime };
      setRecording(true);
    } catch {
      setRecording(false);
    }
  }

  function stopVoice() {
    const r = recRef.current;
    if (!r?.mr) return;
    const { mr, stream, mime } = r;
    mr.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunksRef.current, { type: mime });
      chunksRef.current = [];
      recRef.current = null;
      setRecording(false);
      if (blob.size > 0 && onSendFile) {
        const ext = mime.includes('webm') ? 'webm' : 'm4a';
        onSendFile(new File([blob], `voice-${Date.now()}.${ext}`, { type: blob.type || mime }));
      }
    };
    mr.stop();
  }

  function onGalleryPick(e) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (f && onSendFile) onSendFile(f);
  }

  function onCameraPick(e) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (f && onSendFile) onSendFile(f);
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden bg-[#0B0F19]">
      <input ref={galleryRef} type="file" accept="image/*,video/*" className="hidden" onChange={onGalleryPick} />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        className="hidden"
        onChange={onCameraPick}
      />

      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.05] px-4 py-3 sm:px-5">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[16px] font-semibold text-white">{project?.name || 'Chat'}</h2>
          <p className="text-[11px] text-slate-500">
            {connected ? (
              <span className="text-emerald-400/90">● Live</span>
            ) : (
              <span className="text-amber-400/90">Connecting…</span>
            )}{' '}
            · {members.length} members
          </p>
        </div>
        <div className="flex items-center gap-1">
          {showConversationsBtn && onOpenConversations && (
            <motion.button
              type="button"
              onClick={onOpenConversations}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-lg p-2 text-slate-400 transition-colors duration-300 hover:bg-white/[0.06] hover:text-white md:hidden"
              aria-label="Conversations"
            >
              <MessagesSquare className="h-[18px] w-[18px]" />
            </motion.button>
          )}
          <div className="mr-2 hidden items-center -space-x-2 sm:flex">
            {avatars.map((u, i) => (
              <div
                key={(u._id || u.id) + i}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0B0F19] bg-gradient-to-br from-blue-600 to-violet-600 text-[10px] font-bold text-white"
                style={{ zIndex: 10 - i }}
                title={u.name}
              >
                {(u.name || '?').slice(0, 1).toUpperCase()}
              </div>
            ))}
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRequestVideoCall}
            className="rounded-lg p-2 text-slate-400 transition-colors duration-300 hover:bg-white/[0.06] hover:text-white"
            aria-label="Video call"
          >
            <Video className="h-[18px] w-[18px]" />
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRequestAudioCall}
            className="rounded-lg p-2 text-slate-400 transition-colors duration-300 hover:bg-white/[0.06] hover:text-white"
            aria-label="Voice call"
          >
            <Phone className="h-[18px] w-[18px]" />
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg p-2 text-slate-400 transition-colors duration-300 hover:bg-white/[0.06] hover:text-white"
            aria-label="More"
          >
            <MoreVertical className="h-[18px] w-[18px]" />
          </motion.button>
          {showDetailsBtn && (
            <motion.button
              type="button"
              onClick={onToggleDetails}
              whileHover={{ scale: 1.05 }}
              className="rounded-lg p-2 text-slate-400 xl:hidden"
              aria-label="Details"
            >
              <PanelRight className="h-[18px] w-[18px]" />
            </motion.button>
          )}
        </div>
      </header>

      <div className="scroll-thin min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
        {!messages.length && (
          <div className="flex min-h-[200px] flex-col items-center justify-center py-12">
            <EmptyState
              title="No messages yet"
              description="Say hello — your team sees updates in real time."
            />
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const own = isOwnMessage(m, me?.id);
            const url = extractUrl(m.content);
            const showPreview = Boolean(url) && !((m.attachments || []).length);
            const idKey = String(m.id);
            return (
              <motion.div
                key={idKey}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group relative flex gap-2 ${own ? 'flex-row-reverse' : ''}`}
              >
                {!own && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-[11px] font-semibold text-slate-200">
                    {(m.user?.name || '?').slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className={`relative max-w-[min(85%,520px)] ${own ? 'items-end' : ''}`}>
                  <div className="flex items-center gap-2 px-1">
                    {!own && (
                      <span className="text-[12px] font-medium text-slate-300">{m.user?.name}</span>
                    )}
                    <span className="text-[11px] text-slate-500">{timeAgo(m.createdAt)}</span>
                  </div>
                  <div
                    className={`relative mt-1 rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed shadow-lg transition duration-300 ${
                      own
                        ? 'rounded-br-md bg-blue-600 text-white shadow-blue-900/20'
                        : 'rounded-bl-md border border-white/[0.06] bg-[#1a2234] text-slate-100'
                    }`}
                  >
                    {m.content ? (
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    ) : null}
                    {(m.attachments || []).map((a, i) => (
                      <AttachmentBlock key={i} a={a} />
                    ))}
                    {showPreview && <LinkPreviewCard url={url} />}
                    {/* Always visible: hover-only failed for images (link/img) and touch devices */}
                    <div
                      className={`pointer-events-auto relative z-10 mt-2 flex flex-wrap gap-1 border-t pt-2 ${
                        own ? 'border-white/25' : 'border-white/10'
                      }`}
                    >
                      {['👍', '❤️'].map((e) => (
                        <button
                          key={e}
                          type="button"
                          className={`rounded-full px-2 py-0.5 text-[11px] ring-1 ${
                            own
                              ? 'bg-white/15 ring-white/25 hover:bg-white/25'
                              : 'bg-black/25 ring-white/10 hover:bg-black/40'
                          }`}
                        >
                          {e} {idKey.charCodeAt(0) % 3}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="absolute -right-1 top-6 z-20 opacity-80 transition hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuId(String(menuId) === String(m.id) ? null : m.id);
                      }}
                      className="rounded-lg p-1 text-slate-500 hover:bg-white/[0.08] hover:text-white"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                  {String(menuId) === String(m.id) && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 top-10 z-20 min-w-[180px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#151c2e] py-1 shadow-2xl ring-1 ring-black/40"
                    >
                      {[
                        [Reply, 'Reply'],
                        [Copy, 'Copy'],
                        [Pin, 'Pin'],
                        [Star, 'Star'],
                        [Forward, 'Forward'],
                        [Trash2, 'Delete', true],
                      ].map(([Icon, label, danger]) => (
                        <button
                          key={label}
                          type="button"
                          className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] transition hover:bg-white/[0.06] ${
                            danger ? 'text-rose-400' : 'text-slate-200'
                          }`}
                          onClick={() => {
                            setMenuId(null);
                            if (label === 'Copy') {
                              const text = m.content || (m.attachments || []).map((x) => x.url).join('\n');
                              navigator.clipboard?.writeText(text);
                            }
                          }}
                        >
                          <Icon className="h-3.5 w-3.5 opacity-70" />
                          {label}
                        </button>
                      ))}
                      <div className="border-t border-white/[0.06] px-2 py-1.5">
                        <div className="flex gap-1">
                          {['😀', '🎉', '🔥', '👀'].map((e) => (
                            <button key={e} type="button" className="rounded p-1 hover:bg-white/10">
                              {e}
                            </button>
                          ))}
                          <Smile className="ml-auto h-4 w-4 text-slate-500" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {typing && (
          <p className="text-[12px] italic text-slate-500">Someone is typing…</p>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={onSubmit}
        className="relative z-20 shrink-0 border-t border-white/[0.08] bg-[#0B0F19] p-3 backdrop-blur-md sm:p-4"
      >
        <div className="flex items-end gap-2 rounded-2xl border border-white/[0.08] bg-[#111827] p-2 shadow-inner transition duration-300 focus-within:border-blue-500/35 focus-within:ring-2 focus-within:ring-blue-500/15">
          <div className="flex shrink-0 gap-0.5 pb-1.5 pl-1">
            <button
              type="button"
              disabled={uploading || recording}
              onClick={() => galleryRef.current?.click()}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-300 disabled:opacity-40"
              aria-label="Attach photo or video"
            >
              <ImageIcon className="h-[18px] w-[18px]" />
            </button>
            <button
              type="button"
              disabled={uploading || recording}
              onClick={() => cameraRef.current?.click()}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-300 disabled:opacity-40"
              aria-label="Camera"
            >
              <Camera className="h-[18px] w-[18px]" />
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={() => (recording ? stopVoice() : startVoice())}
              className={`rounded-lg p-2 transition hover:bg-white/[0.06] ${
                recording ? 'bg-rose-600/25 text-rose-300' : 'text-slate-500 hover:text-slate-300'
              }`}
              aria-label={recording ? 'Stop recording' : 'Voice message'}
            >
              {recording ? <Square className="h-[18px] w-[18px]" /> : <Mic className="h-[18px] w-[18px]" />}
            </button>
          </div>
          <textarea
            rows={1}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e);
              }
            }}
            placeholder={recording ? 'Recording… tap mic to stop' : 'Type a message…'}
            readOnly={recording}
            className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent py-2.5 text-[14px] text-slate-100 placeholder:text-slate-500 focus:outline-none read-only:opacity-70"
          />
          <motion.button
            type="submit"
            disabled={uploading || recording}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </div>
      </form>
    </div>
  );
}
