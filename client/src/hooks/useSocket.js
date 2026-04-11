import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore.js';

const url = import.meta.env.VITE_SOCKET_URL || '';

export function useProjectSocket(projectId) {
  const token = useAuthStore((s) => s.token);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token || !projectId) {
      setSocket(null);
      setConnected(false);
      return undefined;
    }
    const s = io(url || undefined, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    setSocket(s);
    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    s.emit('project:join', projectId, () => {});

    return () => {
      s.emit('project:leave', projectId);
      s.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [token, projectId]);

  return { socket, connected };
}
