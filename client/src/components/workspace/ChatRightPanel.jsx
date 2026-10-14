import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Pencil,
  FolderOpen,
  Link2,
  Plus,
  Github,
  Bot,
  LayoutGrid,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function ChatRightPanel({
  project,
  tasks = [],
  members,
  inviteEmail,
  setInviteEmail,
  onInvite,
  repoEdit,
  setRepoEdit,
  saveRepo,
  github,
  aiSpec,
  setAiSpec,
  aiBug,
  setAiBug,
  aiOut,
  onRunAi,
}) {
  const [notifOn, setNotifOn] = useState(true);
  const [assetTab, setAssetTab] = useState('Media');

  return (
    <div className="flex h-full w-full flex-col overflow-hidden border-l border-white/[0.05] bg-[#111827]/95 backdrop-blur-sm">
      <div className="shrink-0 border-b border-white/[0.05] p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-[15px] font-semibold text-white">{project?.name}</h3>
            <p className="mt-0.5 text-[12px] text-slate-500">{members.length} members</p>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-slate-500">
          {project?.description || 'Workspace for design, engineering, and delivery — chat stays next to the work.'}
        </p>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.05] bg-[#0B0F19] px-3 py-2.5">
          <span className="text-[12px] font-medium text-slate-300">Notifications</span>
          <button
            type="button"
            role="switch"
            aria-checked={notifOn}
            onClick={() => setNotifOn((v) => !v)}
            className={`relative h-6 w-11 rounded-full transition duration-300 ${
              notifOn ? 'bg-blue-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${
                notifOn ? 'left-5' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scroll-thin">
        <div className="grid grid-cols-2 gap-2 p-3">
          <div className="rounded-xl border border-white/[0.05] bg-[#0B0F19] p-3">
            <div className="flex items-center gap-2 text-slate-400">
              <FolderOpen className="h-4 w-4" />
              <span className="text-[11px] font-medium">Files</span>
            </div>
            <p className="mt-2 text-lg font-semibold text-white">12</p>
            <p className="text-[10px] text-slate-500">of 500</p>
          </div>
          <div className="rounded-xl border border-white/[0.05] bg-[#0B0F19] p-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Link2 className="h-4 w-4" />
              <span className="text-[11px] font-medium">Links</span>
            </div>
            <p className="mt-2 text-lg font-semibold text-white">4</p>
            <p className="text-[10px] text-slate-500">shared</p>
          </div>
        </div>

        <div className="flex gap-1 border-b border-white/[0.05] px-3">
          {['Media', 'Document', 'Links'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setAssetTab(t)}
              className={`px-2 py-2 text-[11px] font-medium transition ${
                assetTab === t ? 'border-b-2 border-blue-500 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1 p-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-gradient-to-br from-slate-700/50 to-slate-800/80"
            />
          ))}
        </div>

        <div className="border-t border-white/[0.05] p-4">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-blue-600/20"
        >
          <Plus className="h-4 w-4" />
          Add member
        </motion.button>
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Members</p>
          {members.map((u) => (
            <div
              key={u._id || u.id}
              className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-[#0B0F19]/80 px-3 py-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-xs font-bold text-white">
                {(u.name || '?').slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-white">{u.name}</p>
                <p className="truncate text-[11px] text-slate-500 capitalize">{u.role}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Invite</p>
          <div className="flex gap-2">
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@…"
              className="min-w-0 flex-1 rounded-xl border border-white/[0.05] bg-[#0B0F19] px-3 py-2 text-[12px] text-white placeholder:text-slate-600"
            />
            <button
              type="button"
              onClick={onInvite}
              className="shrink-0 rounded-xl bg-white px-3 py-2 text-[12px] font-semibold text-[#0B0F19]"
            >
              Send
            </button>
          </div>
        </div>

        {project?.role === 'admin' && (
          <div className="mt-6 space-y-2">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <Github className="h-3 w-3" /> GitHub
            </p>
            <div className="flex gap-2">
              <input
                value={repoEdit}
                onChange={(e) => setRepoEdit(e.target.value)}
                placeholder="owner/repo"
                className="min-w-0 flex-1 rounded-xl border border-white/[0.05] bg-[#0B0F19] px-3 py-2 font-mono text-[11px] text-white"
              />
              <button
                type="button"
                onClick={saveRepo}
                className="rounded-xl bg-white/[0.08] px-3 py-2 text-[11px] font-medium text-white"
              >
                Save
              </button>
            </div>
            {github?.commits?.length > 0 && (
              <ul className="max-h-24 space-y-1 overflow-y-auto text-[10px] text-slate-500">
                {github.commits.slice(0, 4).map((c) => (
                  <li key={c.sha} className="truncate">
                    <span className="font-mono text-blue-400/80">{c.sha}</span> {c.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-6">
          <Link
            to={project?.id ? `/app/projects/${project.id}/board` : '/app'}
            className="flex items-center gap-2 rounded-xl border border-white/[0.05] bg-[#0B0F19] px-3 py-2.5 text-[12px] font-medium text-slate-300 transition hover:border-blue-500/30"
          >
            <LayoutGrid className="h-4 w-4 text-blue-400" />
            Open task board
          </Link>
          {tasks.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {tasks.slice(0, 6).map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.04] bg-[#0B0F19]/60 px-2.5 py-1.5 text-[11px]"
                >
                  <span className="truncate text-slate-300">{t.title}</span>
                  <span className="shrink-0 uppercase text-[9px] text-slate-500">{t.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-white/[0.05] bg-[#0B0F19] p-3">
          <p className="flex items-center gap-2 text-[12px] font-semibold text-white">
            <Bot className="h-4 w-4 text-blue-400" />
            AI assistant
          </p>
          <textarea
            value={aiSpec}
            onChange={(e) => setAiSpec(e.target.value)}
            rows={2}
            placeholder="Feature → task breakdown"
            className="mt-2 w-full rounded-lg border border-white/[0.05] bg-[#111827] px-2 py-1.5 text-[11px] text-white"
          />
          <button
            type="button"
            onClick={() => onRunAi('tasks')}
            className="mt-1 w-full rounded-lg bg-blue-600 py-1.5 text-[11px] font-semibold text-white"
          >
            Generate
          </button>
          <textarea
            value={aiBug}
            onChange={(e) => setAiBug(e.target.value)}
            rows={2}
            placeholder="Bug → suggestions"
            className="mt-2 w-full rounded-lg border border-white/[0.05] bg-[#111827] px-2 py-1.5 text-[11px] text-white"
          />
          <button
            type="button"
            onClick={() => onRunAi('bug')}
            className="mt-1 w-full rounded-lg border border-white/[0.08] py-1.5 text-[11px] font-medium text-slate-300"
          >
            Suggest fix
          </button>
          {aiOut && (
            <pre className="mt-2 max-h-32 overflow-auto rounded-lg bg-black/40 p-2 text-[9px] text-emerald-300/90">
              {JSON.stringify(aiOut, null, 2)}
            </pre>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-600">
          Created {project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : '—'}
        </p>
        <button type="button" className="mt-2 w-full text-center text-[12px] font-medium text-rose-400/90 hover:text-rose-300">
          Leave workspace
        </button>
      </div>
    </div>
  </div>
  );
}
