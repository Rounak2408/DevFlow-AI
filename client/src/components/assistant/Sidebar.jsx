import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Pin,
  Trash2,
  ChevronDown,
  Sparkles,
  Bookmark,
  LayoutTemplate,
  Wand2,
  Eraser,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { AI_TOOLS, SAVED_PROMPTS, TEMPLATE_PROMPTS } from './assistantConstants.js';

function Section({ title, icon: Icon, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/[0.06] py-3 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500"
      >
        <span className="flex items-center gap-2">
          {Icon && <Icon className="h-3.5 w-3.5 text-blue-400/80" />}
          {title}
        </span>
        <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-0' : '-rotate-90'}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AssistantSidebar({
  chats,
  search,
  onSearchChange,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onTogglePin,
  onRenameChat,
  onClearAll,
  onPickPrompt,
  collapsed,
  onToggleCollapse,
  showCollapse = true,
}) {
  const pinned = useMemo(() => chats.filter((c) => c.pinned), [chats]);
  const rest = useMemo(() => chats.filter((c) => !c.pinned), [chats]);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 280 }}
      className="relative flex h-full min-h-0 flex-col border-r border-white/[0.06] bg-[#05070d]/95 backdrop-blur-2xl"
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] p-3">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/30 to-violet-600/25 ring-1 ring-white/10">
              <Sparkles className="h-4 w-4 text-blue-100" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">DevFlow AI</p>
              <p className="truncate text-[10px] text-slate-500">Personal workspace</p>
            </div>
          </div>
        )}
        {showCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="rounded-lg p-2 text-slate-500 hover:bg-white/10 hover:text-slate-200"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        ) : (
          <span className="w-2" />
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        <div className="sticky top-0 z-10 space-y-2 bg-[#05070d]/95 py-3 backdrop-blur-md">
          <button
            type="button"
            onClick={onNewChat}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:scale-[1.01] ${collapsed ? 'px-0' : ''}`}
          >
            <Plus className="h-4 w-4 shrink-0" />
            {!collapsed && 'New chat'}
          </button>
          {!collapsed && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search conversations"
                className="w-full rounded-xl border border-white/[0.08] bg-black/30 py-2.5 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-600 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
          )}
        </div>

        {!collapsed && pinned.length > 0 && (
          <div className="mb-2">
            <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Pinned</p>
            <ul className="space-y-1">
              {pinned.map((c) => (
                <li key={c.id}>
                  <ChatRow
                    chat={c}
                    active={c.id === activeChatId}
                    onSelect={() => onSelectChat(c.id)}
                    onDelete={() => onDeleteChat(c.id)}
                    onPin={() => onTogglePin(c.id, !c.pinned)}
                    onRename={() => {
                      const t = window.prompt('Rename chat', c.title);
                      if (t != null && t.trim()) onRenameChat(c.id, t.trim());
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        {!collapsed && (
          <>
            <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Recent</p>
            <ul className="space-y-1">
              {rest.map((c) => (
                <li key={c.id}>
                  <ChatRow
                    chat={c}
                    active={c.id === activeChatId}
                    onSelect={() => onSelectChat(c.id)}
                    onDelete={() => onDeleteChat(c.id)}
                    onPin={() => onTogglePin(c.id, !c.pinned)}
                    onRename={() => {
                      const t = window.prompt('Rename chat', c.title);
                      if (t != null && t.trim()) onRenameChat(c.id, t.trim());
                    }}
                  />
                </li>
              ))}
            </ul>
          </>
        )}

        {!collapsed && (
          <>
            <Section title="Saved prompts" icon={Bookmark} defaultOpen={false}>
              <div className="flex flex-col gap-1">
                {SAVED_PROMPTS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onPickPrompt(p.text)}
                    className="rounded-xl px-2 py-1.5 text-left text-xs text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-200"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </Section>
            <Section title="Templates" icon={LayoutTemplate} defaultOpen={false}>
              <div className="flex flex-col gap-1">
                {TEMPLATE_PROMPTS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onPickPrompt(p.text)}
                    className="rounded-xl px-2 py-1.5 text-left text-xs text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-200"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </Section>
            <Section title="AI tools" icon={Wand2} defaultOpen={false}>
              <div className="flex max-h-48 flex-col gap-1 overflow-y-auto pr-1">
                {AI_TOOLS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onPickPrompt(t.prompt)}
                    className="rounded-xl px-2 py-1.5 text-left text-[11px] text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-200"
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </Section>
          </>
        )}

        {!collapsed && (
          <div className="mt-4 space-y-1 border-t border-white/[0.06] pt-4">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Delete all AI chat history? This cannot be undone.')) onClearAll();
              }}
              className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-xs text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-300"
            >
              <Eraser className="h-3.5 w-3.5" />
              Clear history
            </button>
            <Link
              to="/app/settings"
              className="flex items-center gap-2 rounded-xl px-2 py-2 text-xs text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-200"
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </Link>
          </div>
        )}
      </div>
    </motion.aside>
  );
}

function ChatRow({ chat, active, onSelect, onDelete, onPin, onRename }) {
  return (
    <div
      className={`group flex items-start gap-1 rounded-xl px-2 py-1.5 transition ${
        active ? 'bg-white/[0.08] ring-1 ring-blue-500/25' : 'hover:bg-white/[0.05]'
      }`}
    >
      <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
        <span className="line-clamp-2 text-xs font-medium text-slate-200">{chat.title || 'Chat'}</span>
        {chat.preview && <span className="mt-0.5 line-clamp-1 text-[10px] text-slate-600">{chat.preview}</span>}
      </button>
      <div className="flex shrink-0 flex-col gap-0.5 opacity-0 transition group-hover:opacity-100">
        <button type="button" onClick={onPin} className="rounded p-1 text-slate-500 hover:bg-white/10 hover:text-amber-300" title="Pin">
          <Pin className={`h-3 w-3 ${chat.pinned ? 'text-amber-400' : ''}`} />
        </button>
        <button type="button" onClick={onRename} className="rounded p-1 text-slate-500 hover:bg-white/10" title="Rename">
          <span className="text-[10px] font-bold">Aa</span>
        </button>
        <button type="button" onClick={onDelete} className="rounded p-1 text-slate-500 hover:bg-rose-500/15 hover:text-rose-400" title="Delete">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
