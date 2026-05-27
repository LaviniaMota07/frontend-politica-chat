import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { io, type Socket } from 'socket.io-client';
import { notifyUnauthorizedSession } from '../../../utils/authSession';
import type { ClientToServerChatEvents, ServerToClientChatEvents } from '../types/chat.types';

const SOCKET_URL = (import.meta.env.VITE_URL_API || 'http://localhost:8080') + '/chat';

export type ChatSocket = Socket<ServerToClientChatEvents, ClientToServerChatEvents>;
export type ChatSocketRef = MutableRefObject<ChatSocket | null>;

interface UseSocketConnectionParams {
  chatId: string;
  userEmail: string;
  currentUserIdRef: MutableRefObject<number | null>;
}

export function useSocketConnection({
  chatId,
  userEmail,
  currentUserIdRef,
}: UseSocketConnectionParams) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<ChatSocket | null>(null);
  const isConnectingRef = useRef(false);
  const chatIdRef = useRef(chatId);

  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  useEffect(() => {
    if (!userEmail) return;
    if (isConnectingRef.current || socketRef.current) return;

    isConnectingRef.current = true;
    let cancelled = false;

    const socket: ChatSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      if (cancelled) {
        socket.disconnect();
        return;
      }

      isConnectingRef.current = false;
    });

    socket.on('connected', (payload) => {
      if (cancelled) return;

      isConnectingRef.current = false;
      setIsConnected(true);

      if (payload?.userId) {
        currentUserIdRef.current = payload.userId;
      }
    });

    socket.on('connect_error', () => {
      if (cancelled) return;

      isConnectingRef.current = false;
      setIsConnected(false);
    });

    socket.on('disconnect', (reason) => {
      if (cancelled) return;

      isConnectingRef.current = false;
      setIsConnected(false);

      if (reason === 'io server disconnect') {
        notifyUnauthorizedSession();
      }
    });

    return () => {
      cancelled = true;
      isConnectingRef.current = false;
      socket.removeAllListeners();
      socket.emit('leave-chat', { chatId: chatIdRef.current });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUserIdRef, userEmail]);

  return { socketRef, isConnected };
}
