import { useCallback, useEffect, useRef, useState } from 'react';

const ICE = [{ urls: 'stun:stun.l.google.com:19302' }];

export function useWebRTCCall(socket, projectId, myUserId) {
  const [phase, setPhase] = useState('idle');
  const [incoming, setIncoming] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callKind, setCallKind] = useState('video');
  const [error, setError] = useState(null);

  const pcRef = useRef(null);
  const peerIdRef = useRef(null);
  const pendingRemoteRef = useRef([]);
  const remoteDescSetRef = useRef(false);
  const projectIdRef = useRef(projectId);
  const myIdRef = useRef(myUserId);
  const incomingRef = useRef(null);
  const pendingEarlyIceRef = useRef([]);

  useEffect(() => {
    projectIdRef.current = projectId;
  }, [projectId]);
  useEffect(() => {
    myIdRef.current = myUserId;
  }, [myUserId]);
  useEffect(() => {
    incomingRef.current = incoming;
  }, [incoming]);

  const cleanupPc = useCallback(() => {
    pendingRemoteRef.current = [];
    pendingEarlyIceRef.current = [];
    remoteDescSetRef.current = false;
    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch (_) {}
      pcRef.current = null;
    }
  }, []);

  const stopMedia = useCallback(() => {
    setLocalStream((s) => {
      s?.getTracks?.().forEach((t) => t.stop());
      return null;
    });
    setRemoteStream(null);
  }, []);

  const reset = useCallback(() => {
    cleanupPc();
    stopMedia();
    setPhase('idle');
    setIncoming(null);
    peerIdRef.current = null;
    setError(null);
  }, [cleanupPc, stopMedia]);

  const flushCandidates = useCallback(async (pc) => {
    const q = pendingRemoteRef.current;
    pendingRemoteRef.current = [];
    for (const c of q) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(c));
      } catch (_) {}
    }
  }, []);

  const attachPeer = useCallback(
    (pc) => {
      pc.onicecandidate = (e) => {
        if (!e.candidate || !peerIdRef.current) return;
        socket?.emit('call:candidate', {
          projectId: projectIdRef.current,
          toUserId: peerIdRef.current,
          candidate: e.candidate.toJSON(),
        });
      };
      pc.ontrack = (e) => {
        const [stream] = e.streams;
        if (stream) setRemoteStream(stream);
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed') {
          setError('Connection failed');
        }
      };
    },
    [socket]
  );

  const getMedia = useCallback(async (kind) => {
    const video = kind === 'video';
    return navigator.mediaDevices.getUserMedia({
      audio: true,
      video: video ? { facingMode: 'user' } : false,
    });
  }, []);

  const startCall = useCallback(
    async (toUserId, kind) => {
      if (!socket || !projectId || !toUserId || String(toUserId) === String(myUserId)) return;
      setError(null);
      setCallKind(kind);
      peerIdRef.current = String(toUserId);
      remoteDescSetRef.current = false;
      setPhase('calling-out');
      try {
        const stream = await getMedia(kind);
        setLocalStream(stream);
        const pc = new RTCPeerConnection({ iceServers: ICE });
        pcRef.current = pc;
        attachPeer(pc);
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit(
          'call:offer',
          {
            projectId,
            toUserId: String(toUserId),
            offer: pc.localDescription,
            kind,
          },
          (ack) => {
            if (!ack?.ok) setError(ack?.error || 'Call failed');
          }
        );
      } catch (e) {
        setError(e.message || 'Could not start call');
        reset();
      }
    },
    [socket, projectId, myUserId, getMedia, attachPeer, reset]
  );

  const acceptCall = useCallback(async () => {
    if (!socket || !incoming) return;
    const { fromUserId, offer, kind } = incoming;
    setCallKind(kind);
    peerIdRef.current = String(fromUserId);
    setIncoming(null);
    remoteDescSetRef.current = false;
    setPhase('connected');
    try {
      const stream = await getMedia(kind);
      setLocalStream(stream);
      const pc = new RTCPeerConnection({ iceServers: ICE });
      pcRef.current = pc;
      attachPeer(pc);
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      remoteDescSetRef.current = true;
      for (const c of pendingEarlyIceRef.current.splice(0)) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(c));
        } catch (_) {}
      }
      await flushCandidates(pc);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('call:answer', {
        projectId,
        toUserId: String(fromUserId),
        answer: pc.localDescription,
      });
    } catch (e) {
      setError(e.message || 'Could not answer');
      socket.emit('call:decline', { projectId, toUserId: String(fromUserId) });
      reset();
    }
  }, [socket, incoming, projectId, getMedia, attachPeer, flushCandidates, reset]);

  const declineCall = useCallback(() => {
    if (!socket || !incoming) {
      setIncoming(null);
      setPhase('idle');
      return;
    }
    socket.emit('call:decline', { projectId, toUserId: String(incoming.fromUserId) });
    setIncoming(null);
    setPhase('idle');
  }, [socket, incoming, projectId]);

  const hangup = useCallback(() => {
    const peer = peerIdRef.current;
    if (socket && peer) {
      socket.emit('call:hangup', { projectId, toUserId: String(peer) });
    }
    reset();
  }, [socket, projectId, reset]);

  useEffect(() => {
    if (!socket) return undefined;

    const onAnswered = async ({ fromUserId, answer, projectId: pid }) => {
      if (pid !== projectIdRef.current || String(fromUserId) !== String(peerIdRef.current)) return;
      const pc = pcRef.current;
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        remoteDescSetRef.current = true;
        await flushCandidates(pc);
        setPhase('connected');
      } catch (e) {
        setError(e.message || 'Answer failed');
        reset();
      }
    };

    const onCandidate = async ({ fromUserId, candidate, projectId: pid }) => {
      if (pid !== projectIdRef.current || !candidate) return;
      const expectedPeer =
        peerIdRef.current ||
        (incomingRef.current && String(incomingRef.current.fromUserId)) ||
        null;
      if (!expectedPeer || String(fromUserId) !== String(expectedPeer)) return;
      const pc = pcRef.current;
      if (!pc) {
        pendingEarlyIceRef.current.push(candidate);
        return;
      }
      if (!remoteDescSetRef.current) {
        pendingRemoteRef.current.push(candidate);
        return;
      }
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (_) {}
    };

    const onIncoming = (payload) => {
      if (payload.projectId !== projectIdRef.current) return;
      if (String(payload.fromUserId) === String(myIdRef.current)) return;
      if (pcRef.current) return;
      setIncoming(payload);
      setPhase('ringing-in');
    };

    const onHangup = ({ fromUserId, projectId: pid }) => {
      if (pid !== projectIdRef.current) return;
      if (String(fromUserId) !== String(peerIdRef.current)) return;
      reset();
    };

    const onDeclined = ({ fromUserId, projectId: pid }) => {
      if (pid !== projectIdRef.current) return;
      if (String(fromUserId) !== String(peerIdRef.current)) return;
      setError('Call declined');
      reset();
    };

    socket.on('call:answered', onAnswered);
    socket.on('call:candidate', onCandidate);
    socket.on('call:incoming', onIncoming);
    socket.on('call:hangup', onHangup);
    socket.on('call:declined', onDeclined);

    return () => {
      socket.off('call:answered', onAnswered);
      socket.off('call:candidate', onCandidate);
      socket.off('call:incoming', onIncoming);
      socket.off('call:hangup', onHangup);
      socket.off('call:declined', onDeclined);
    };
  }, [socket, flushCandidates, reset]);

  return {
    phase,
    incoming,
    localStream,
    remoteStream,
    callKind,
    error,
    startCall,
    acceptCall,
    declineCall,
    hangup,
    reset,
  };
}
