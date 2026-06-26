import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import type { TypingSocketPayload, UserRoomSocketPayload } from '../types/chat.types';
import type { ChatSocketRef } from './useSocketConnection';

interface UseChatTypingParams {
  chatId: string;
  isConnected: boolean;
  socketRef: ChatSocketRef;
  currentUserIdRef: MutableRefObject<number | null>;
}

export function useChatTyping({
  chatId,
  isConnected,
  socketRef,
  currentUserIdRef,
}: UseChatTypingParams) {
  const [inputValue, setInputValueState] = useState('');
  const [typingUsers, setTypingUsers] = useState<number[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCurrentlyTypingRef = useRef(false);

  useEffect(() => {
    queueMicrotask(() => {
      setTypingUsers([]);
      setInputValueState('');
      isCurrentlyTypingRef.current = false;
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [chatId]);

  const setInputValue = useCallback(
    (text: string) => {
      setInputValueState(text);

      if (!chatId || !socketRef.current || !isConnected) return;

      if (!isCurrentlyTypingRef.current) {
        isCurrentlyTypingRef.current = true;
        socketRef.current.emit('typing', { chatId, isTyping: true });
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        isCurrentlyTypingRef.current = false;
        socketRef.current?.emit('typing', { chatId, isTyping: false });
      }, 2000);
    },
    [chatId, isConnected, socketRef],
  );

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    function handleUserLeft(payload: UserRoomSocketPayload) {
      setTypingUsers((prev) => prev.filter((id) => id !== payload.userId));
    }

    function handleUserTyping(payload: TypingSocketPayload) {
      if (payload.userId === currentUserIdRef.current) return;

      setTypingUsers((prev) => {
        if (payload.isTyping) {
          if (prev.includes(payload.userId)) return prev;
          return [...prev, payload.userId];
        }

        return prev.filter((id) => id !== payload.userId);
      });
    }

    function handleUserJoined() {
      return undefined;
    }

    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('user-typing', handleUserTyping);

    return () => {
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('user-typing', handleUserTyping);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [currentUserIdRef, socketRef]);

  return { inputValue, setInputValue, setInputValueState, typingUsers };
}
