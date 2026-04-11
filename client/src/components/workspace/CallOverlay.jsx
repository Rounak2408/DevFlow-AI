import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, X } from 'lucide-react';

function memberName(members, id) {
  if (!id) return '';
  const u = members.find((x) => String(x._id || x.id) === String(id));
  return u?.name || 'Teammate';
}

export function MemberPickerModal({ open, kind, members, meId, onPick, onClose }) {
  if (!open) return null;
  const others = members.filter((u) => String(u._id || u.id) !== String(meId));
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-label="Close" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111827] p-4 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[15px] font-semibold text-white">
            {kind === 'video' ? 'Video call' : 'Voice call'}
          </h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-[12px] text-slate-500">Choose a teammate (1:1)</p>
        <ul className="mt-4 max-h-64 space-y-1 overflow-y-auto scroll-thin">
          {others.map((u) => (
            <li key={u._id || u.id}>
              <button
                type="button"
                onClick={() => onPick(String(u._id || u.id))}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] text-slate-200 transition hover:bg-white/[0.06]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-xs font-bold text-white">
                  {(u.name || '?').slice(0, 1).toUpperCase()}
                </span>
                {u.name}
              </button>
            </li>
          ))}
        </ul>
        {!others.length && <p className="mt-4 text-center text-[13px] text-slate-500">No other members in this workspace.</p>}
      </motion.div>
    </div>
  );
}

export function CallOverlay({
  phase,
  incoming,
  callKind,
  localStream,
  remoteStream,
  members,
  onAccept,
  onDecline,
  onHangup,
}) {
  const localVid = useRef(null);
  const remoteVid = useRef(null);
  const localAud = useRef(null);
  const remoteAud = useRef(null);

  useEffect(() => {
    if (callKind === 'video' && localVid.current && localStream) {
      localVid.current.srcObject = localStream;
    }
  }, [callKind, localStream]);

  useEffect(() => {
    if (callKind === 'video' && remoteVid.current && remoteStream) {
      remoteVid.current.srcObject = remoteStream;
    }
  }, [callKind, remoteStream]);

  useEffect(() => {
    if (callKind === 'audio' && localAud.current && localStream) {
      localAud.current.srcObject = localStream;
    }
  }, [callKind, localStream]);

  useEffect(() => {
    if (callKind === 'audio' && remoteAud.current && remoteStream) {
      remoteAud.current.srcObject = remoteStream;
    }
  }, [callKind, remoteStream]);

  const show = phase === 'calling-out' || phase === 'ringing-in' || phase === 'connected';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex flex-col bg-[#0B0F19]/95 backdrop-blur-md"
        >
          <div className="relative flex flex-1 flex-col items-center justify-center p-4">
            {callKind === 'video' && (
              <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-2xl border border-white/[0.08] bg-black">
                <video ref={remoteVid} autoPlay playsInline className="h-full w-full object-cover" />
                {!remoteStream && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/90 text-[14px] text-slate-400">
                    {phase === 'ringing-in' ? (
                      <>
                        <span className="text-lg font-medium text-white">{memberName(members, incoming?.fromUserId)}</span>
                        <span>Incoming video call…</span>
                      </>
                    ) : (
                      <span>Calling…</span>
                    )}
                  </div>
                )}
                <div className="absolute bottom-3 right-3 h-28 w-40 overflow-hidden rounded-lg border border-white/20 bg-black shadow-lg">
                  <video ref={localVid} autoPlay playsInline muted className="h-full w-full object-cover" />
                </div>
              </div>
            )}

            {callKind === 'audio' && (
              <div className="flex flex-col items-center gap-6 py-12">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-4xl font-bold text-white shadow-xl shadow-blue-900/40">
                  {(memberName(members, incoming?.fromUserId) || 'C').slice(0, 1)}
                </div>
                <p className="text-center text-[16px] font-medium text-white">
                  {phase === 'ringing-in'
                    ? `${memberName(members, incoming?.fromUserId)} is calling…`
                    : phase === 'calling-out'
                      ? 'Calling…'
                      : 'Connected'}
                </p>
                <audio ref={localAud} autoPlay playsInline muted className="hidden" />
                <audio ref={remoteAud} autoPlay playsInline className="hidden" />
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {phase === 'ringing-in' && incoming && (
                <>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={onAccept}
                    className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-[14px] font-semibold text-white shadow-lg"
                  >
                    <Phone className="h-5 w-5" />
                    Accept
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={onDecline}
                    className="flex items-center gap-2 rounded-full bg-rose-600/90 px-6 py-3 text-[14px] font-semibold text-white"
                  >
                    <PhoneOff className="h-5 w-5" />
                    Decline
                  </motion.button>
                </>
              )}
              {(phase === 'calling-out' || phase === 'connected') && (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={onHangup}
                  className="flex items-center gap-2 rounded-full bg-rose-600 px-8 py-3 text-[14px] font-semibold text-white shadow-lg"
                >
                  <PhoneOff className="h-5 w-5" />
                  End call
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
