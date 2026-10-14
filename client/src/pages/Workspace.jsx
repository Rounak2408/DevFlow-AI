import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api.js';
import { useProjectSocket } from '../hooks/useSocket.js';
import { useWebRTCCall } from '../hooks/useWebRTCCall.js';
import { useAuthStore } from '../store/authStore.js';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { ErrorFallback } from '../components/ui/ErrorFallback.jsx';
import { ChatListPanel } from '../components/workspace/ChatListPanel.jsx';
import { ChatMessagesPanel } from '../components/workspace/ChatMessagesPanel.jsx';
import { ChatRightPanel } from '../components/workspace/ChatRightPanel.jsx';
import { CallOverlay, MemberPickerModal } from '../components/workspace/CallOverlay.jsx';

export function Workspace() {
  const { projectId } = useParams();
  const user = useAuthStore((s) => s.user);
  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [github, setGithub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [input, setInput] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [aiSpec, setAiSpec] = useState('');
  const [aiBug, setAiBug] = useState('');
  const [aiOut, setAiOut] = useState(null);
  const [repoEdit, setRepoEdit] = useState('');
  const [typing, setTyping] = useState(false);
  const [chatTab, setChatTab] = useState('All');
  const [mobileListOpen, setMobileListOpen] = useState(false);
  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pickerKind, setPickerKind] = useState(null);
  const typingTimeout = useRef(null);
  const bottomRef = useRef(null);

  const { socket, connected } = useProjectSocket(projectId);
  const call = useWebRTCCall(socket, projectId, user?.id);

  useEffect(() => {
    if (call.error) toast.error(call.error);
  }, [call.error]);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const [proj, msgs, tsk, gh] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/messages`),
        api.get(`/projects/${projectId}/tasks`),
        api.get(`/projects/${projectId}/github/activity`).catch(() => ({ data: null })),
      ]);
      setProject(proj.data.project);
      setRepoEdit(proj.data.project.githubRepo || '');
      setMessages(msgs.data.messages);
      setTasks(tsk.data.tasks.slice(0, 8));
      setGithub(gh.data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [projectId]);

  useEffect(() => {
    if (!socket) return undefined;
    const onMsg = (m) => setMessages((prev) => [...prev, m]);
    const onTyping = (payload) => {
      if (payload.isTyping) setTyping(true);
      else setTyping(false);
    };
    socket.on('chat:message', onMsg);
    socket.on('chat:typing', onTyping);
    return () => {
      socket.off('chat:message', onMsg);
      socket.off('chat:typing', onTyping);
    };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function sendChat(e) {
    e.preventDefault();
    if (!input.trim() || !socket) return;
    socket.emit('chat:message', { projectId, content: input.trim(), attachments: [] }, (res) => {
      if (!res?.ok) toast.error(res?.error || 'Failed to send');
    });
    setInput('');
    socket.emit('chat:typing', { projectId, isTyping: false });
  }

  async function sendFile(file) {
    if (!socket || !projectId || !file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post(`/projects/${projectId}/messages/upload`, form);
      const attachments = [{ type: data.type, url: data.url, name: data.name }];
      const caption = input.trim();
      await new Promise((resolve, reject) => {
        socket.emit('chat:message', { projectId, content: caption, attachments }, (res) => {
          if (res?.ok) resolve();
          else reject(new Error(res?.error || 'Failed to send'));
        });
      });
      setInput('');
      socket.emit('chat:typing', { projectId, isTyping: false });
      toast.success('Sent');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function onInputChange(v) {
    setInput(v);
    if (!socket) return;
    socket.emit('chat:typing', { projectId, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('chat:typing', { projectId, isTyping: false });
    }, 1200);
  }

  async function saveRepo() {
    try {
      await api.patch(`/projects/${projectId}`, { githubRepo: repoEdit.trim() });
      setProject((p) => (p ? { ...p, githubRepo: repoEdit.trim() } : p));
      toast.success('Repo updated');
      const gh = await api.get(`/projects/${projectId}/github/activity`).catch(() => ({ data: null }));
      setGithub(gh.data);
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function invite() {
    try {
      await api.post(`/projects/${projectId}/invite`, { email: inviteEmail, role: 'member' });
      toast.success('Invitation sent or user added');
      setInviteEmail('');
      load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function runAi(kind) {
    try {
      setAiOut(null);
      const path = kind === 'tasks' ? '/ai/task-breakdown' : '/ai/bug-suggest';
      const text = kind === 'tasks' ? aiSpec : aiBug;
      const { data } = await api.post(path, { text });
      setAiOut(data);
      toast.success(data.fromCache ? 'From cache' : 'AI ready');
    } catch (e) {
      toast.error(e.message);
    }
  }

  const members = useMemo(() => {
    if (!project) return [];
    const list = [{ ...project.owner, role: 'owner' }];
    project.members?.forEach((m) => {
      if (m.user) list.push({ ...m.user, role: m.role });
    });
    return list;
  }, [project]);

  const lastPreview = useMemo(() => {
    if (!messages.length) return 'No messages yet';
    const last = messages[messages.length - 1];
    const t = (last.content || '').trim();
    if (t) return t.length > 56 ? `${t.slice(0, 56)}…` : t;
    const a = last.attachments?.[0];
    if (a?.type === 'image') return '📷 Photo';
    if (a?.type === 'video') return '🎬 Video';
    if (a?.type === 'audio') return '🎤 Voice';
    return 'Attachment';
  }, [messages]);

  const rightPanelProps = {
    project,
    tasks,
    members,
    inviteEmail,
    setInviteEmail,
    onInvite: invite,
    repoEdit,
    setRepoEdit,
    saveRepo,
    github,
    aiSpec,
    setAiSpec,
    aiBug,
    setAiBug,
    aiOut,
    onRunAi: runAi,
  };

  if (err && !loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <ErrorFallback message={err} onRetry={load} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#0B0F19]">
      {loading && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[#0B0F19]/70 backdrop-blur-[2px]">
          <Skeleton className="h-12 w-48 rounded-xl" />
        </div>
      )}

      <div className="grid h-full min-h-0 w-full flex-1 grid-cols-1 overflow-hidden md:grid-cols-[minmax(220px,280px)_1fr] xl:grid-cols-[minmax(220px,280px)_1fr_minmax(260px,340px)]">
        <aside className="hidden h-full min-h-0 flex-col overflow-hidden border-r border-white/[0.05] md:flex">
          <ChatListPanel
            project={project}
            lastPreview={lastPreview}
            activeTab={chatTab}
            onTabChange={setChatTab}
          />
        </aside>

        {mobileListOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-[#0B0F19]/70 backdrop-blur-sm md:hidden"
              aria-label="Close conversations"
              onClick={() => setMobileListOpen(false)}
            />
            <aside className="fixed bottom-0 left-0 top-14 z-50 flex w-[min(92vw,300px)] flex-col border-r border-white/[0.05] bg-[#111827] shadow-2xl md:hidden">
              <ChatListPanel
                project={project}
                lastPreview={lastPreview}
                activeTab={chatTab}
                onTabChange={setChatTab}
              />
            </aside>
          </>
        )}

        <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <ChatMessagesPanel
            project={project}
            messages={messages}
            me={user}
            connected={connected}
            typing={typing}
            input={input}
            onInputChange={onInputChange}
            onSubmit={sendChat}
            bottomRef={bottomRef}
            onToggleDetails={() => setMobileDetailsOpen((o) => !o)}
            showDetailsBtn
            onOpenConversations={() => setMobileListOpen(true)}
            showConversationsBtn
            onSendFile={sendFile}
            uploading={uploading}
            onRequestVideoCall={() => setPickerKind('video')}
            onRequestAudioCall={() => setPickerKind('audio')}
          />
        </section>

        <aside className="hidden h-full min-h-0 flex-col overflow-hidden border-l border-white/[0.05] xl:flex">
          <ChatRightPanel {...rightPanelProps} />
        </aside>

        {mobileDetailsOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-[#0B0F19]/70 backdrop-blur-sm xl:hidden"
              aria-label="Close details"
              onClick={() => setMobileDetailsOpen(false)}
            />
            <aside className="fixed bottom-0 right-0 top-14 z-50 flex w-[min(94vw,360px)] flex-col overflow-hidden border-l border-white/[0.05] bg-[#111827] shadow-2xl xl:hidden">
              <ChatRightPanel {...rightPanelProps} />
            </aside>
          </>
        )}
      </div>

      <MemberPickerModal
        open={pickerKind != null}
        kind={pickerKind || 'video'}
        members={members}
        meId={user?.id}
        onClose={() => setPickerKind(null)}
        onPick={(targetId) => {
          const k = pickerKind;
          setPickerKind(null);
          if (k) call.startCall(targetId, k);
        }}
      />
      <CallOverlay
        phase={call.phase}
        incoming={call.incoming}
        callKind={call.callKind}
        localStream={call.localStream}
        remoteStream={call.remoteStream}
        members={members}
        onAccept={call.acceptCall}
        onDecline={call.declineCall}
        onHangup={call.hangup}
      />
    </div>
  );
}
