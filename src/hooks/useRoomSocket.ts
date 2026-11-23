import { useCallback, useEffect, useRef, useState } from 'react';
import { AvatarConfig, RoomStateSnapshot, StudentInfo } from '../types/game';

interface UseRoomSocketOptions {
  role: 'host' | 'player';
  pin: string | null;
  hostToken?: string | null;
}

export function useRoomSocket({ role, pin, hostToken }: UseRoomSocketOptions) {
  const [roomState, setRoomState] = useState<RoomStateSnapshot | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clockOffsetMs, setClockOffsetMs] = useState(0);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerToken, setPlayerToken] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const attemptRef = useRef(0);
  const unmountedRef = useRef(false);

  const authRef = useRef<{
    pin: string | null;
    hostToken: string | null | undefined;
    playerId: string | null;
    playerToken: string | null;
    pendingJoin: { student: StudentInfo; avatar: AvatarConfig } | null;
  }>({
    pin,
    hostToken,
    playerId: null,
    playerToken: null,
    pendingJoin: null,
  });

  authRef.current.pin = pin;
  authRef.current.hostToken = hostToken;

  const sendPayload = useCallback((payload: unknown) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }, []);

  const connect = useCallback(() => {
    if (unmountedRef.current || !authRef.current.pin) return;

    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (unmountedRef.current) {
        ws.close();
        return;
      }
      attemptRef.current = 0;
      setConnected(true);
      setError(null);

      const current = authRef.current;
      if (role === 'host' && current.pin && current.hostToken) {
        ws.send(
          JSON.stringify({
            type: 'host:auth',
            pin: current.pin,
            hostToken: current.hostToken,
          })
        );
      } else if (role === 'player' && current.pin) {
        if (current.playerId && current.playerToken) {
          ws.send(
            JSON.stringify({
              type: 'room:sync',
              role: 'player',
              pin: current.pin,
              playerId: current.playerId,
              playerToken: current.playerToken,
            })
          );
        } else if (current.pendingJoin) {
          ws.send(
            JSON.stringify({
              type: 'player:join',
              pin: current.pin,
              student: current.pendingJoin.student,
              avatar: current.pendingJoin.avatar,
            })
          );
        }
      }
    };

    ws.onmessage = (event) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(event.data as string);
      } catch {
        return;
      }

      if (msg.type === 'room:error' && typeof msg.message === 'string') {
        setError(msg.message);
        return;
      }

      if (msg.type === 'player:joined') {
        const nextPid = typeof msg.playerId === 'string' ? msg.playerId : null;
        const nextPtok = typeof msg.playerToken === 'string' ? msg.playerToken : null;
        authRef.current.playerId = nextPid;
        authRef.current.playerToken = nextPtok;
        authRef.current.pendingJoin = null;
        setPlayerId(nextPid);
        setPlayerToken(nextPtok);
        if (msg.state && typeof msg.state === 'object') {
          const snap = msg.state as RoomStateSnapshot;
          setClockOffsetMs(snap.serverNowMs - Date.now());
          setRoomState(snap);
        }
        setError(null);
        return;
      }

      if (msg.type === 'room:state' && msg.state && typeof msg.state === 'object') {
        const snap = msg.state as RoomStateSnapshot;
        setClockOffsetMs(snap.serverNowMs - Date.now());
        setRoomState(snap);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      if (unmountedRef.current || !authRef.current.pin) return;
      const delay = Math.min(5000, 600 * Math.pow(1.6, attemptRef.current));
      attemptRef.current += 1;
      reconnectTimerRef.current = window.setTimeout(connect, delay);
    };

    ws.onerror = () => {
      // Close handler manages reconnection
    };
  }, [role]);

  useEffect(() => {
    unmountedRef.current = false;
    if (pin && (role === 'player' || hostToken)) {
      connect();
    }
    return () => {
      unmountedRef.current = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [pin, hostToken, role, connect]);

  const joinAsPlayer = useCallback(
    (student: StudentInfo, avatar: AvatarConfig) => {
      authRef.current.pendingJoin = { student, avatar };
      if (!authRef.current.pin) return;
      const sent = sendPayload({
        type: 'player:join',
        pin: authRef.current.pin,
        student,
        avatar,
        playerId: authRef.current.playerId,
        playerToken: authRef.current.playerToken,
      });
      if (!sent) {
        connect();
      }
    },
    [connect, sendPayload]
  );

  const submitAnswer = useCallback(
    (questionIndex: number, selectedIndex: number) => {
      if (!authRef.current.pin || !authRef.current.playerId || !authRef.current.playerToken) {
        return;
      }
      sendPayload({
        type: 'player:answer',
        pin: authRef.current.pin,
        playerId: authRef.current.playerId,
        playerToken: authRef.current.playerToken,
        questionIndex,
        selectedIndex,
      });
    },
    [sendPayload]
  );

  const hostStartGame = useCallback(() => {
    sendPayload({
      type: 'host:start',
      pin: authRef.current.pin,
      hostToken: authRef.current.hostToken,
    });
  }, [sendPayload]);

  const hostRevealEarly = useCallback(() => {
    sendPayload({
      type: 'host:reveal',
      pin: authRef.current.pin,
      hostToken: authRef.current.hostToken,
    });
  }, [sendPayload]);

  const hostNextStep = useCallback(() => {
    sendPayload({
      type: 'host:next',
      pin: authRef.current.pin,
      hostToken: authRef.current.hostToken,
    });
  }, [sendPayload]);

  const hostRestartRoom = useCallback(
    (nextDeckId?: string) => {
      sendPayload({
        type: 'host:restart',
        pin: authRef.current.pin,
        hostToken: authRef.current.hostToken,
        deckId: nextDeckId,
      });
    },
    [sendPayload]
  );

  return {
    roomState,
    connected,
    error,
    clockOffsetMs,
    playerId,
    joinAsPlayer,
    submitAnswer,
    hostStartGame,
    hostRevealEarly,
    hostNextStep,
    hostRestartRoom,
  };
}
