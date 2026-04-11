import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api.js';
import { useAuthStore } from '../store/authStore.js';
import { streamAssistantChat } from '../lib/streamAssistantChat.js';
import { AssistantSidebar } from '../components/assistant/Sidebar.jsx';
import { ChatWindow } from '../components/assistant/ChatWindow.jsx';
import { PromptCards } from '../components/assistant/PromptCards.jsx';
import { InsightsPanel } from '../components/assistant/InsightsPanel.jsx';
import { InputBar } from '../components/assistant/InputBar.jsx';
import { SUGGESTION_PROMPTS } from '../components/assistant/assistantConstants.js';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function AssistantPage() {
  const token = useAuthStore((s) => s.token);

  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [sideCollapsed, setSideCollapsed] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState(false);
  const [isLg, setIsLg] = useState(
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : true
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const fn = () => setIsLg(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const refreshHistory = useCallback(async () => {
    try {
      const { data } = await api.get('/assistant/history', { params: { q: debouncedSearch || undefined } });
      setChats(data.chats || []);
    } catch (e) {
      toast.error(e.message || 'Failed to load chats');
    }
  }, [debouncedSearch]);

  useEffect(() => {
    void refreshHistory();
  }, [refreshHistory]);

  const refreshInsights = useCallback(async () => {
    setInsightsLoading(true);
    try {
      const { data } = await api.get('/assistant/insights');
      setInsights(data);
    } catch {
      setInsights(null);
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshInsights();
  }, [refreshInsights]);

  const loadChat = async (id) => {
    try {
      const { data } = await api.get(`/assistant/chat/${id}`);
      setActiveChatId(data.chat.id);
      setMessages(data.chat.messages || []);
      setMobileDrawer(false);
    } catch (e) {
      toast.error(e.message || 'Failed to open chat');
    }
  };

  const newChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setDraft('');
    setStreamingText('');
    setMobileDrawer(false);
  };

  const sendInternal = async (text, { regenerate = false } = {}) => {
    const trimmed = String(text || '').trim();
    if (!regenerate && !trimmed) return;
    if (!token) {
      toast.error('Not signed in');
      return;
    }

    const draftBackup = !regenerate ? trimmed : '';

    setSending(true);
    if (!regenerate) setDraft('');
    setStreamingText('');
    if (regenerate) {
      setMessages((prev) => {
        const copy = [...prev];
        if (copy.length && copy[copy.length - 1].role === 'assistant') copy.pop();
        return copy;
      });
    } else {
      setMessages((prev) => [...prev, { role: 'user', content: trimmed, id: `tmp-${Date.now()}` }]);
    }
    setIsTyping(true);

    try {
      const chat = await streamAssistantChat({
        apiBase: API_BASE,
        token,
        body: {
          chatId: activeChatId || undefined,
          ...(regenerate ? {} : { message: trimmed }),
          regenerate,
        },
        onDelta: (d) => {
          setIsTyping(false);
          setStreamingText((prev) => prev + d);
        },
      });
      if (chat) {
        setActiveChatId(chat.id);
        setMessages(chat.messages || []);
      }
      setStreamingText('');
      void refreshHistory();
      void refreshInsights();
    } catch (e) {
      toast.error(e.message || 'AI request failed');
      if (!regenerate && draftBackup) setDraft(draftBackup);
      if (!regenerate) {
        setMessages((prev) => prev.filter((m) => !String(m.id || '').startsWith('tmp-')));
      }
      if (activeChatId) {
        try {
          const { data } = await api.get(`/assistant/chat/${activeChatId}`);
          setMessages(data.chat?.messages || []);
        } catch {
          /* ignore */
        }
      }
    } finally {
      setSending(false);
      setIsTyping(false);
      setStreamingText('');
    }
  };

  const onSend = () => sendInternal(draft, {});

  const onRegenerate = () => {
    if (!activeChatId) return;
    void sendInternal('', { regenerate: true });
  };

  const onFeedback = async (messageId, feedback) => {
    if (!activeChatId) return;
    try {
      await api.patch(`/assistant/chat/${activeChatId}/messages/${messageId}/feedback`, { feedback });
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, feedback } : m))
      );
    } catch (e) {
      toast.error(e.message || 'Failed to save feedback');
    }
  };

  const onDeleteChat = async (id) => {
    try {
      await api.delete(`/assistant/chat/${id}`);
      if (activeChatId === id) newChat();
      void refreshHistory();
      toast.success('Chat deleted');
    } catch (e) {
      toast.error(e.message || 'Delete failed');
    }
  };

  const onTogglePin = async (id, pinned) => {
    try {
      await api.patch(`/assistant/chat/${id}`, { pinned });
      void refreshHistory();
    } catch (e) {
      toast.error(e.message || 'Update failed');
    }
  };

  const onRenameChat = async (id, title) => {
    try {
      await api.patch(`/assistant/chat/${id}`, { title });
      void refreshHistory();
    } catch (e) {
      toast.error(e.message || 'Rename failed');
    }
  };

  const onClearAll = async () => {
    try {
      await api.delete('/assistant/history');
      newChat();
      void refreshHistory();
      toast.success('History cleared');
    } catch (e) {
      toast.error(e.message || 'Clear failed');
    }
  };

  const emptyState = !messages.length && !streamingText && !isTyping;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative isolate flex min-h-[calc(100dvh-3.5rem)] w-full flex-1 flex-col overflow-hidden bg-[#05070d] text-slate-100"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-90"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 15% 0%, rgba(255,255,255,0.07), transparent 55%), radial-gradient(ellipse 60% 45% at 85% 10%, rgba(59,130,246,0.12), transparent 50%), radial-gradient(ellipse 50% 40% at 50% 100%, rgba(139,92,246,0.08), transparent 45%)',
        }}
      />

      <header className="relative z-20 flex shrink-0 items-center justify-between border-b border-white/[0.06] px-3 py-2 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileDrawer(true)}
          className="flex items-center gap-2 rounded-xl bg-white/[0.06] px-3 py-2 text-sm text-slate-200 ring-1 ring-white/[0.08]"
        >
          <Menu className="h-4 w-4" />
          Chats
        </button>
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Sparkles className="h-4 w-4 text-blue-400" />
          Assistant
        </div>
        <span className="w-16" />
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col lg:flex-row">
        {mobileDrawer && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            aria-label="Close menu"
            onClick={() => setMobileDrawer(false)}
          />
        )}
        <div
          className={`fixed inset-y-0 left-0 z-50 h-full min-h-0 w-[280px] max-w-[85vw] transition-transform duration-300 lg:static lg:z-10 lg:w-auto lg:max-w-none lg:translate-x-0 ${
            mobileDrawer ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <AssistantSidebar
            chats={chats}
            search={search}
            onSearchChange={setSearch}
            activeChatId={activeChatId}
            onSelectChat={loadChat}
            onNewChat={newChat}
            onDeleteChat={onDeleteChat}
            onTogglePin={onTogglePin}
            onRenameChat={onRenameChat}
            onClearAll={onClearAll}
            onPickPrompt={(t) => setDraft(t)}
            collapsed={isLg && sideCollapsed}
            onToggleCollapse={() => isLg && setSideCollapsed((c) => !c)}
            showCollapse={isLg}
          />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] sm:px-5 lg:px-6">
          <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col">
            {emptyState && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="shrink-0 pb-4 text-center"
              >
                <div className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br from-blue-500/30 via-violet-500/25 to-white/5 ring-1 ring-white/15 shadow-[0_0_80px_-20px_rgba(59,130,246,0.5)]">
                  <Sparkles className="h-9 w-9 text-blue-100" />
                </div>
                <h1 className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
                  How can I help you today?
                </h1>
                <p className="mx-auto mt-2 max-w-xl text-balance text-sm text-slate-400">
                  Your personal AI workspace for tasks, reports, planning, and execution — powered by your live DevFlow data.
                </p>
              </motion.div>
            )}

            {emptyState && (
              <div className="mb-4 shrink-0">
                <PromptCards items={SUGGESTION_PROMPTS} onPick={(t) => setDraft(t)} disabled={sending} />
              </div>
            )}

            <ChatWindow
              messages={messages}
              streamingText={streamingText}
              isTyping={isTyping}
              chatId={activeChatId}
              onRegenerate={onRegenerate}
              onFeedback={onFeedback}
              disabledActions={sending}
            />

            <InputBar value={draft} onChange={setDraft} onSend={onSend} sending={sending} />

            <div className="mt-4 shrink-0 xl:hidden">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Insights</p>
              <InsightsPanel data={insights} loading={insightsLoading} compact />
            </div>
          </div>
        </div>

        <aside className="relative hidden w-[300px] shrink-0 flex-col border-l border-white/[0.06] bg-[#05070d]/80 px-3 py-4 backdrop-blur-xl xl:flex">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Live workspace</p>
          <InsightsPanel data={insights} loading={insightsLoading} />
        </aside>
      </div>
    </motion.div>
  );
}
