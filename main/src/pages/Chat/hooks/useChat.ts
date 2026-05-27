import { useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useSocketConnection } from './useSocketConnection';
import { useChatMessages } from './useChatMessages';
import { useChatTyping } from './useChatTyping';
import { useChatSend } from './useChatSend';

export function useChat(
  chatId: string,
  modelIaId: number,
  selectedDepartments: number[] = [],
  selectedSystems: number[] = [],
) {
  const { user } = useAuth();
  const userId = user?.userId ?? null;
  const userEmail = user?.email ?? '';
  const currentUserIdRef = useRef<number | null>(user?.userId ?? null);

  useEffect(() => {
    currentUserIdRef.current = userId;
  }, [userId]);

  const { socketRef, isConnected } = useSocketConnection({
    chatId,
    userEmail,
    currentUserIdRef,
  });
  const {
    messages,
    setMessages,
    loadMoreMessages,
    hasMoreMessages,
    isLoadingMore,
  } = useChatMessages({ chatId, socketRef, currentUserIdRef });
  const {
    inputValue,
    setInputValue,
    setInputValueState,
    typingUsers,
  } = useChatTyping({
    chatId,
    isConnected,
    socketRef,
    currentUserIdRef,
  });
  const { handleSendMessage, isSending } = useChatSend({
    chatId,
    inputValue,
    modelIaId,
    selectedDepartments,
    selectedSystems,
    user,
    socketRef,
    setInputValueState,
    setMessages,
  });

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !isConnected || !chatId) return;

    socket.emit('join-chat', { chatId });

    return () => {
      socket.emit('leave-chat', { chatId });
    };
  }, [chatId, isConnected, socketRef]);

  const handleClearChat = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave-chat', { chatId });
    }
    setMessages([]);
    toast.success('Nova conversa iniciada!');
  };

  return {
    messages,
    inputValue,
    setInputValue,
    handleSendMessage,
    isSending,
    isConnected,
    typingUsers,
    handleClearChat,
    loadMoreMessages,
    hasMoreMessages,
    isLoadingMore,
  };
}
