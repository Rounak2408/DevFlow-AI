import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Loader2,
  Camera,
  X,
  Check,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import api from '../../lib/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { useThemeStore } from '../../store/themeStore.js';
import { useSidebarStore } from '../../store/sidebarStore.js';
import { SETTINGS_TABS, ROLE_PERMISSIONS } from './settingsConstants.js';
import { SettingsField, settingsInputClass } from './SettingsField.jsx';
import { MemberAvatar } from '../workspace/MemberAvatar.jsx';
import { Skeleton } from '../ui/Skeleton.jsx';

function ToggleRow({ label, hint, checked, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-[#0B0F19]/50 px-4 py-3">
      <div>
        <p className="text-[13px] font-medium text-white">{label}</p>
        {hint ? <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-slate-700'
        } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            checked ? 'left-5' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsAccountPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const updateAuthUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);
  const setTheme = useThemeStore((s) => s.setTheme);
  const setCollapsed = useSidebarStore((s) => s.setCollapsed);

  const [tab, setTab] = useState('profile');
  const [me, setMe] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const [profile, setProfile] = useState({});
  const [prefs, setPrefs] = useState({});
  const [notif, setNotif] = useState({});
  const [integ, setInteg] = useState({});
  const [openaiInput, setOpenaiInput] = useState('');
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [ghToken, setGhToken] = useState('');
  const [inviteToken, setInviteToken] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErr(null);
    try {
      const { data } = await api.get('/user/me');
      const u = data.user;
      setMe(u);
      setWorkspace(data.workspace);
      updateAuthUser(u);
      setProfile({
        name: u.name || '',
        email: u.email || '',
        username: u.username || '',
        phone: u.phone || '',
        bio: u.bio || '',
        jobTitle: u.jobTitle || '',
        company: u.company || '',
        location: u.location || '',
        website: u.website || '',
        skills: u.skills || [],
      });
      setPrefs({ ...(u.preferences || {}) });
      setNotif({ ...(u.notifications || {}) });
      setInteg({ google: !!u.integrations?.google, slack: !!u.integrations?.slack });
      setOpenaiInput('');
      if (u.preferences?.theme) setTheme(u.preferences.theme);
      if (u.preferences?.sidebarCollapsedDefault != null) {
        setCollapsed(u.preferences.sidebarCollapsedDefault);
      }
    } catch (e) {
      setErr(e.message || 'Failed to load account');
    } finally {
      setLoading(false);
    }
  }, [token, updateAuthUser, setTheme, setCollapsed]);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    load();
  }, [token, navigate, load]);

  const applyServerUser = (u, ws) => {
    setMe(u);
    if (ws !== undefined) setWorkspace(ws);
    updateAuthUser(u);
    setProfile({
      name: u.name || '',
      email: u.email || '',
      username: u.username || '',
      phone: u.phone || '',
      bio: u.bio || '',
      jobTitle: u.jobTitle || '',
      company: u.company || '',
      location: u.location || '',
      website: u.website || '',
      skills: u.skills || [],
    });
    if (u.preferences?.theme) setTheme(u.preferences.theme);
  };

  async function putUpdate(body) {
    setSaving(true);
    try {
      const { data } = await api.put('/user/update', body);
      applyServerUser(data.user, data.workspace);
      toast.success('Saved');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveProfile(e) {
    e?.preventDefault();
    await putUpdate({
      name: profile.name,
      email: profile.email,
      username: profile.username,
      phone: profile.phone,
      bio: profile.bio,
      jobTitle: profile.jobTitle,
      company: profile.company,
      location: profile.location,
      website: profile.website,
      skills: profile.skills,
    });
  }

  function cancelProfile() {
    if (!me) return;
    setProfile({
      name: me.name || '',
      email: me.email || '',
      username: me.username || '',
      phone: me.phone || '',
      bio: me.bio || '',
      jobTitle: me.jobTitle || '',
      company: me.company || '',
      location: me.location || '',
      website: me.website || '',
      skills: me.skills || [],
    });
    toast.success('Reverted changes');
  }

  async function savePreferences() {
    await putUpdate({ preferences: prefs });
    if (prefs.theme) setTheme(prefs.theme);
    if (prefs.sidebarCollapsedDefault != null) setCollapsed(prefs.sidebarCollapsedDefault);
  }

  async function saveNotifications() {
    await putUpdate({ notifications: notif });
  }

  async function saveIntegrations() {
    const body = {
      integrations: {
        google: Boolean(integ.google),
        slack: Boolean(integ.slack),
      },
    };
    if (openaiInput.trim()) body.openaiKey = openaiInput.trim();
    await putUpdate(body);
    setOpenaiInput('');
  }

  async function uploadFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please choose an image');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const { data } = await api.post('/user/avatar', fd);
      applyServerUser(data.user);
      toast.success('Photo updated');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeAvatar() {
    setSaving(true);
    try {
      const { data } = await api.put('/user/update', { avatar: '', avatarEmoji: '' });
      applyServerUser(data.user);
      toast.success('Avatar removed');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    if (pwd.next !== pwd.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await api.put('/user/password', {
        currentPassword: pwd.current,
        newPassword: pwd.next,
      });
      setPwd({ current: '', next: '', confirm: '' });
      toast.success('Password updated');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function connectGithub(ev) {
    ev.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/github/connect', { accessToken: ghToken });
      updateAuthUser({ githubUsername: data.githubUsername });
      setGhToken('');
      await load();
      toast.success('GitHub connected');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function disconnectGithub() {
    setSaving(true);
    try {
      await api.post('/github/disconnect');
      await load();
      toast.success('Disconnected');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function acceptInvite(ev) {
    ev.preventDefault();
    try {
      const { data } = await api.post('/projects/invite/accept', { token: inviteToken });
      toast.success('Joined project');
      setInviteToken('');
      window.location.href = `/app/projects/${data.projectId}`;
    } catch (e) {
      toast.error(e.message);
    }
  }

  const [skillDraft, setSkillDraft] = useState('');

  function addSkill() {
    const s = skillDraft.trim();
    if (!s || profile.skills?.includes(s)) return;
    setProfile((p) => ({ ...p, skills: [...(p.skills || []), s] }));
    setSkillDraft('');
  }

  function removeSkill(s) {
    setProfile((p) => ({ ...p, skills: (p.skills || []).filter((x) => x !== s) }));
  }

  const perms = me && workspace ? ROLE_PERMISSIONS[workspace.role] || ROLE_PERMISSIONS.Developer : [];

  if (!token) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        Loading session…
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-6xl gap-8">
        <div className="hidden w-52 shrink-0 space-y-2 md:block">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-xl" />
          ))}
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (err || !me) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg rounded-2xl border border-rose-500/20 bg-rose-500/[0.06] p-8 text-center"
      >
        <AlertCircle className="mx-auto h-10 w-10 text-rose-400" />
        <p className="mt-4 text-sm text-rose-200/90">{err || 'Unable to load profile'}</p>
        <button
          type="button"
          onClick={load}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto w-full max-w-full overflow-x-hidden sm:max-w-6xl"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[28px]">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your DevFlow account, workspace access, and preferences. Only you can edit this profile.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        <nav className="flex gap-1 overflow-x-auto pb-1 scroll-thin lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-visible lg:pb-0">
          {SETTINGS_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition lg:w-full ${
                tab === t.id
                  ? 'bg-blue-500/15 text-white ring-1 ring-blue-500/30'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.22 }}
              className="rounded-2xl border border-white/[0.06] bg-[#111827]/85 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset,0_24px_48px_-24px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-8"
            >
              {tab === 'profile' && (
                <div className="space-y-8">
                  <h2 className="text-lg font-semibold text-white">Profile</h2>
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                    <div className="relative shrink-0">
                      <div
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOver(false);
                          uploadFile(e.dataTransfer.files?.[0]);
                        }}
                        className={`group relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B0F19] transition ${
                          dragOver ? 'ring-2 ring-blue-500/50' : ''
                        }`}
                        onClick={() => fileRef.current?.click()}
                      >
                        <MemberAvatar user={me} size="lg" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 opacity-0 transition group-hover:opacity-100">
                          <Camera className="h-6 w-6 text-white" />
                          <span className="text-[10px] font-medium text-white">Change</span>
                        </div>
                      </div>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => uploadFile(e.target.files?.[0])}
                      />
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className="text-xs font-medium text-blue-400 hover:text-blue-300"
                        >
                          Upload
                        </button>
                        {(me.avatar || me.avatarEmoji) && (
                          <button
                            type="button"
                            onClick={removeAvatar}
                            disabled={saving}
                            className="text-xs font-medium text-slate-500 hover:text-rose-400"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                    <form onSubmit={saveProfile} className="min-w-0 flex-1 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <SettingsField label="Full name">
                          <input
                            className={settingsInputClass()}
                            value={profile.name}
                            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                            required
                          />
                        </SettingsField>
                        <SettingsField label="Username" hint="Unique handle across DevFlow">
                          <input
                            className={settingsInputClass()}
                            value={profile.username}
                            onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
                            placeholder="your_handle"
                          />
                        </SettingsField>
                        <SettingsField label="Email">
                          <input
                            type="email"
                            className={settingsInputClass()}
                            value={profile.email}
                            onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                            required
                          />
                        </SettingsField>
                        <SettingsField label="Phone">
                          <input
                            className={settingsInputClass()}
                            value={profile.phone}
                            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                            placeholder="+91 …"
                          />
                        </SettingsField>
                        <SettingsField label="Job title" className="sm:col-span-2">
                          <input
                            className={settingsInputClass()}
                            value={profile.jobTitle}
                            onChange={(e) => setProfile((p) => ({ ...p, jobTitle: e.target.value }))}
                          />
                        </SettingsField>
                        <SettingsField label="Company">
                          <input
                            className={settingsInputClass()}
                            value={profile.company}
                            onChange={(e) => setProfile((p) => ({ ...p, company: e.target.value }))}
                          />
                        </SettingsField>
                        <SettingsField label="Location">
                          <input
                            className={settingsInputClass()}
                            value={profile.location}
                            onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                          />
                        </SettingsField>
                        <SettingsField label="Website / portfolio" className="sm:col-span-2">
                          <input
                            className={settingsInputClass()}
                            value={profile.website}
                            onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
                            placeholder="https://"
                          />
                        </SettingsField>
                      </div>
                      <SettingsField label="Bio">
                        <textarea
                          rows={4}
                          className={`${settingsInputClass()} resize-y min-h-[100px]`}
                          value={profile.bio}
                          onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                        />
                      </SettingsField>
                      <SettingsField label="Skills">
                        <div className="flex flex-wrap gap-2">
                          {(profile.skills || []).map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center gap-1 rounded-lg border border-violet-500/25 bg-violet-500/10 px-2.5 py-1 text-xs text-violet-200"
                            >
                              {s}
                              <button type="button" onClick={() => removeSkill(s)} className="text-violet-400 hover:text-white">
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="mt-2 flex gap-2">
                          <input
                            className={settingsInputClass()}
                            value={skillDraft}
                            onChange={(e) => setSkillDraft(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                            placeholder="Add a skill"
                          />
                          <button type="button" onClick={addSkill} className="rounded-xl bg-white/[0.08] px-3 text-sm text-white">
                            Add
                          </button>
                        </div>
                      </SettingsField>
                      <div className="flex flex-wrap gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 disabled:opacity-60"
                        >
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          Save changes
                        </button>
                        <button
                          type="button"
                          onClick={cancelProfile}
                          className="rounded-xl border border-white/[0.1] px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/[0.04]"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {tab === 'account' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-white">Account</h2>
                  <div className="rounded-xl border border-white/[0.06] bg-[#0B0F19]/60 p-4 text-sm text-slate-400">
                    <p>
                      Signed in as <span className="font-medium text-white">{me.email}</span>
                    </p>
                    <p className="mt-2">
                      User ID: <span className="font-mono text-xs text-slate-500">{String(me.id)}</span>
                    </p>
                    {me.globalRole === 'admin' && (
                      <span className="mt-3 inline-block rounded-md bg-amber-500/15 px-2 py-1 text-[10px] font-semibold uppercase text-amber-300">
                        Platform admin
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">Accept invitation</h3>
                    <p className="mt-1 text-xs text-slate-500">Paste an invite token to join a workspace.</p>
                    <form onSubmit={acceptInvite} className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <input
                        value={inviteToken}
                        onChange={(e) => setInviteToken(e.target.value)}
                        placeholder="Invite token"
                        className={`${settingsInputClass()} sm:flex-1 font-mono text-xs`}
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
                      >
                        Join workspace
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {tab === 'workspace' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-white">Role & workspace</h2>
                  {workspace ? (
                    <>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-slate-400">Primary workspace</span>
                        <span className="rounded-lg border border-white/[0.08] bg-[#0B0F19] px-3 py-1.5 text-sm font-semibold text-white">
                          {workspace.name}
                        </span>
                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/25">
                          {workspace.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Joined{' '}
                        {workspace.joinedAt
                          ? new Date(workspace.joinedAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : '—'}
                      </p>
                      <div>
                        <h3 className="text-sm font-medium text-slate-300">
                          {workspace.role === 'Viewer' ? 'Viewer' : workspace.role} can
                        </h3>
                        <ul className="mt-3 space-y-2">
                          {perms.map((line) => (
                            <li key={line} className="flex items-start gap-2 text-sm text-slate-400">
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-400" />
                              {line}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">
                      You are not in a workspace yet. Create one from Boards or accept an invite — your role will appear
                      here.
                    </p>
                  )}
                </div>
              )}

              {tab === 'preferences' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-white">Preferences</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SettingsField label="Theme">
                      <select
                        className={settingsInputClass()}
                        value={prefs.theme || 'dark'}
                        onChange={(e) => setPrefs((p) => ({ ...p, theme: e.target.value }))}
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="system">System</option>
                      </select>
                    </SettingsField>
                    <SettingsField label="Language">
                      <select
                        className={settingsInputClass()}
                        value={prefs.language || 'en'}
                        onChange={(e) => setPrefs((p) => ({ ...p, language: e.target.value }))}
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="es">Spanish</option>
                      </select>
                    </SettingsField>
                    <SettingsField label="Timezone">
                      <select
                        className={settingsInputClass()}
                        value={prefs.timezone || 'auto'}
                        onChange={(e) => setPrefs((p) => ({ ...p, timezone: e.target.value }))}
                      >
                        <option value="auto">Auto (browser)</option>
                        <option value="Asia/Kolkata">Asia / Kolkata</option>
                        <option value="America/New_York">America / New York</option>
                        <option value="Europe/London">Europe / London</option>
                      </select>
                    </SettingsField>
                    <SettingsField label="Date format">
                      <select
                        className={settingsInputClass()}
                        value={prefs.dateFormat || 'mdy'}
                        onChange={(e) => setPrefs((p) => ({ ...p, dateFormat: e.target.value }))}
                      >
                        <option value="mdy">MM/DD/YYYY</option>
                        <option value="dmy">DD/MM/YYYY</option>
                        <option value="ymd">YYYY-MM-DD</option>
                      </select>
                    </SettingsField>
                    <SettingsField label="Dashboard layout" className="sm:col-span-2">
                      <select
                        className={settingsInputClass()}
                        value={prefs.dashboardLayout || 'comfortable'}
                        onChange={(e) => setPrefs((p) => ({ ...p, dashboardLayout: e.target.value }))}
                      >
                        <option value="comfortable">Comfortable</option>
                        <option value="compact">Compact</option>
                        <option value="wide">Wide</option>
                      </select>
                    </SettingsField>
                  </div>
                  <ToggleRow
                    label="Compact mode"
                    hint="Tighter spacing across the app UI"
                    checked={Boolean(prefs.compactMode)}
                    onChange={(v) => setPrefs((p) => ({ ...p, compactMode: v }))}
                  />
                  <ToggleRow
                    label="Sidebar collapsed by default"
                    hint="Applies when you open the app on desktop"
                    checked={Boolean(prefs.sidebarCollapsedDefault)}
                    onChange={(v) => setPrefs((p) => ({ ...p, sidebarCollapsedDefault: v }))}
                  />
                  <button
                    type="button"
                    disabled={saving}
                    onClick={savePreferences}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Save preferences
                  </button>
                </div>
              )}

              {tab === 'security' && (
                <div className="space-y-8">
                  <h2 className="text-lg font-semibold text-white">Security</h2>
                  <form onSubmit={changePassword} className="max-w-md space-y-4">
                    <SettingsField label="Current password">
                      <input
                        type="password"
                        autoComplete="current-password"
                        className={settingsInputClass()}
                        value={pwd.current}
                        onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
                        required
                      />
                    </SettingsField>
                    <SettingsField label="New password" hint="At least 8 characters">
                      <input
                        type="password"
                        autoComplete="new-password"
                        className={settingsInputClass()}
                        value={pwd.next}
                        onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
                        required
                        minLength={8}
                      />
                    </SettingsField>
                    <SettingsField label="Confirm new password">
                      <input
                        type="password"
                        autoComplete="new-password"
                        className={settingsInputClass()}
                        value={pwd.confirm}
                        onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
                        required
                      />
                    </SettingsField>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-white/[0.1] px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.14] disabled:opacity-60"
                    >
                      Update password
                    </button>
                  </form>
                  <ToggleRow
                    label="Two-factor authentication"
                    hint="Adds a second step at sign-in. Store-backed enforcement ships next."
                    checked={Boolean(me.twoFactorEnabled)}
                    onChange={(v) => {
                      void putUpdate({ twoFactorEnabled: v });
                    }}
                    disabled={saving}
                  />
                  <div>
                    <h3 className="text-sm font-medium text-white">Active sessions</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      You are signed in on this browser. Per-device session revocation is on the roadmap.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      navigate('/login');
                      toast.success('Signed out');
                    }}
                    className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-200 hover:bg-rose-500/15"
                  >
                    Log out on this device
                  </button>
                  <div>
                    <h3 className="text-sm font-medium text-white">Last sign-in</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      {me.lastLoginAt
                        ? new Date(me.lastLoginAt).toLocaleString()
                        : 'No recorded sign-in yet — it updates on each login.'}
                    </p>
                  </div>
                </div>
              )}

              {tab === 'integrations' && (
                <div className="space-y-8">
                  <h2 className="text-lg font-semibold text-white">Integrations</h2>
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-[#0B0F19]/50 p-4">
                      <div>
                        <p className="font-medium text-white">GitHub</p>
                        <p className="text-xs text-slate-500">Link a PAT to show repo activity in projects.</p>
                      </div>
                      {me.githubUsername ? (
                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/25">
                          Connected @{me.githubUsername}
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-400">Not connected</span>
                      )}
                    </div>
                    <form onSubmit={connectGithub} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                      <SettingsField label="Personal access token" className="sm:flex-1">
                        <input
                          type="password"
                          className={`${settingsInputClass()} font-mono text-xs`}
                          placeholder="ghp_…"
                          value={ghToken}
                          onChange={(e) => setGhToken(e.target.value)}
                        />
                      </SettingsField>
                      <div className="flex gap-2">
                        <button type="submit" disabled={saving} className="rounded-xl bg-slate-700 px-4 py-2.5 text-sm text-white hover:bg-slate-600">
                          Connect
                        </button>
                        {me.githubUsername && (
                          <button type="button" onClick={disconnectGithub} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300">
                            Disconnect
                          </button>
                        )}
                      </div>
                    </form>
                    <ToggleRow
                      label="Google"
                      hint="Sign-in and calendar (placeholder toggle — wire your OAuth provider)"
                      checked={Boolean(integ.google)}
                      onChange={(v) => setInteg((i) => ({ ...i, google: v }))}
                    />
                    <ToggleRow
                      label="Slack"
                      hint="Workspace notifications bridge"
                      checked={Boolean(integ.slack)}
                      onChange={(v) => setInteg((i) => ({ ...i, slack: v }))}
                    />
                    <SettingsField label="OpenAI API key" hint="Stored server-side only; the key is never returned after save.">
                      <input
                        type="password"
                        className={`${settingsInputClass()} font-mono text-xs`}
                        placeholder={me.openaiConnected ? '•••••••• (connected) — enter new key to replace' : 'sk-…'}
                        value={openaiInput}
                        onChange={(e) => setOpenaiInput(e.target.value)}
                      />
                    </SettingsField>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={saveIntegrations}
                      className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      Save integrations
                    </button>
                  </div>
                </div>
              )}

              {tab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-white">Notifications</h2>
                  <div className="space-y-3">
                    <ToggleRow
                      label="Email alerts"
                      checked={notif.email !== false}
                      onChange={(v) => setNotif((n) => ({ ...n, email: v }))}
                    />
                    <ToggleRow
                      label="Mentions"
                      checked={notif.mentions !== false}
                      onChange={(v) => setNotif((n) => ({ ...n, mentions: v }))}
                    />
                    <ToggleRow
                      label="Weekly reports"
                      checked={notif.weekly !== false}
                      onChange={(v) => setNotif((n) => ({ ...n, weekly: v }))}
                    />
                    <ToggleRow
                      label="Task reminders"
                      checked={notif.tasks !== false}
                      onChange={(v) => setNotif((n) => ({ ...n, tasks: v }))}
                    />
                    <ToggleRow
                      label="Product updates"
                      checked={Boolean(notif.product)}
                      onChange={(v) => setNotif((n) => ({ ...n, product: v }))}
                    />
                  </div>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={saveNotifications}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Save notifications
                  </button>
                </div>
              )}

              {tab === 'billing' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-white">Billing</h2>
                  <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] to-transparent p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-200/80">Current plan</p>
                    <p className="mt-2 text-2xl font-bold capitalize text-white">{me.billing?.plan || 'free'}</p>
                    {me.billing?.plan === 'premium' && me.billing?.periodEnd && (
                      <p className="mt-1 text-sm text-slate-400">
                        Renews {new Date(me.billing.periodEnd).toLocaleDateString()}
                      </p>
                    )}
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => toast.success('Upgrade flow — connect Stripe in production')}
                        className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-black"
                      >
                        Upgrade plan
                      </button>
                      <button
                        type="button"
                        onClick={() => toast('Billing portal coming soon')}
                        className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300"
                      >
                        Manage subscription
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Usage and invoices will appear here once billing is connected.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
