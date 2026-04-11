import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Copy, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { MarkdownMessage } from './MarkdownMessage.jsx';

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-slate-500"
          animate={{ opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

export function ChatWindow({
  messages,
  streamingText,
  isTyping,
  chatId,
  onRegenerate,
  onFeedback,
  disabledActions,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, isTyping]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-1 py-2 pr-2">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          const isLastAssistant = !isUser && idx === messages.length - 1 && m.role === 'assistant';
          return (
            <motion.div
              key={m.id || `${m.role}-${idx}`}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[min(100%,720px)] rounded-[22px] border px-4 py-3 shadow-lg ${
                  isUser
                    ? 'border-blue-500/25 bg-gradient-to-br from-blue-600/25 to-violet-600/15 text-slate-100'
                    : 'border-white/[0.08] bg-white/[0.05] text-slate-100 backdrop-blur-md'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{m.content}</p>
                ) : (
                  <>
                    <MarkdownMessage content={m.content} />
                    <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-white/[0.06] pt-2">
                      <button
                        type="button"
                        disabled={disabledActions}
                        onClick={() => {
                          navigator.clipboard.writeText(m.content);
                          toast.success('Copied');
                        }}
                        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-slate-200"
                        title="Copy"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      {isLastAssistant && chatId && (
                        <button
                          type="button"
                          disabled={disabledActions}
                          onClick={() => onRegenerate?.()}
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-slate-200"
                          title="Regenerate"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {m.id && (
                        <>
                          <button
                            type="button"
                            disabled={disabledActions}
                            onClick={() => onFeedback?.(m.id, m.feedback === 'up' ? null : 'up')}
                            className={`rounded-lg p-1.5 transition hover:bg-white/10 ${
                              m.feedback === 'up' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-200'
                            }`}
                            title="Helpful"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={disabledActions}
                            onClick={() => onFeedback?.(m.id, m.feedback === 'down' ? null : 'down')}
                            className={`rounded-lg p-1.5 transition hover:bg-white/10 ${
                              m.feedback === 'down' ? 'text-rose-400' : 'text-slate-500 hover:text-slate-200'
                            }`}
                            title="Not helpful"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}

        {(streamingText || isTyping) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="max-w-[min(100%,720px)] rounded-[22px] border border-white/[0.08] bg-white/[0.05] px-4 py-3 backdrop-blur-md">
              {streamingText ? <MarkdownMessage content={streamingText} /> : <TypingDots />}
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
