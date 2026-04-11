import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, Mic, Loader2 } from 'lucide-react';

export function InputBar({ value, onChange, onSend, sending, placeholder }) {
  const fileRef = useRef(null);
  const [listening, setListening] = useState(false);

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = 'en-US';
    r.interimResults = false;
    r.onresult = (ev) => {
      const t = ev.results[0]?.[0]?.transcript;
      if (t) onChange((value ? `${value} ` : '') + t);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    setListening(true);
    r.start();
  };

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (f.size > 120_000) {
      onChange((value ? `${value}\n\n` : '') + `[Attached file too large: ${f.name}]`);
      return;
    }
    const text = await f.text().catch(() => null);
    if (text != null) {
      onChange((value ? `${value}\n\n` : '') + `--- ${f.name} ---\n${text}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mt-2 shrink-0 rounded-[28px] border border-white/[0.1] bg-white/[0.05] p-2 shadow-[0_24px_80px_-40px_rgba(59,130,246,0.35)] backdrop-blur-xl"
    >
      <span
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        aria-hidden
      />
      <div className="flex items-end gap-2">
        <input ref={fileRef} type="file" className="hidden" accept=".txt,.md,.json,.log,.csv" onChange={onFile} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] text-slate-400 ring-1 ring-white/[0.08] transition hover:bg-white/10 hover:text-white"
          title="Attach text file"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <textarea
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={placeholder || 'Ask anything about your tasks, sprints, or reports…'}
          className="max-h-40 min-h-[44px] flex-1 resize-none rounded-2xl border border-transparent bg-black/25 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
        />
        <button
          type="button"
          onClick={startVoice}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 ring-white/[0.08] transition ${
            listening ? 'bg-rose-500/20 text-rose-300' : 'bg-white/[0.06] text-slate-400 hover:bg-white/10 hover:text-white'
          }`}
          title="Voice input"
        >
          <Mic className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={sending || !value.trim()}
          onClick={onSend}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-900/40 transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </div>
    </motion.div>
  );
}
