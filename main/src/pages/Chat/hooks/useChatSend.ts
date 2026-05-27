import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import toast from 'react-hot-toast';
import type { ChatMessage, MessageResponseSocketPayload, SendMessageSocketPayload } from '../types/chat.types';
import type { ChatSocketRef } from './useSocketConnection';

interface ChatUser {
  userId?: number;
  name: string;
}

interface UseChatSendParams {
  chatId: string;
  inputValue: string;
  modelIaId: number;
  selectedDepartments: number[];
  selectedSystems: number[];
  user: ChatUser;
  socketRef: ChatSocketRef;
  setInputValueState: Dispatch<SetStateAction<string>>;
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
}

export function useChatSend({
  chatId,
  inputValue,
  modelIaId,
  selectedDepartments,
  selectedSystems,
  user,
  socketRef,
  setInputValueState,
  setMessages,
}: UseChatSendParams) {
  const [isSending, setIsSending] = useState(false);
  const isSendingRef = useRef(false);

  const handleSendMessage = useCallback(async () => {
    const trimmed = inputValue.trim();

    if (!trimmed || isSendingRef.current || !socketRef.current) return;

    isSendingRef.current = true;
    setIsSending(true);
    setInputValueState('');

    const userMessage: ChatMessage = {
      messageId: crypto.randomUUID(),
      sender: 'user',
      messageText: trimmed,
      sendAt: new Date().toISOString(),
      modelIaName: 'OpenIa',
      userId: user.userId || null,
      userName: user.name || null,
    };

    const assistantPlaceholder: ChatMessage = {
      messageId: 'processing-placeholder',
      sender: 'assistant',
      messageText: 'Processando resposta...',
      sendAt: new Date().toISOString(),
      modelIaName: 'OpenIa',
      userId: null,
      userName: null,
    };

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);

    const payload: SendMessageSocketPayload = {
      chatId,
      messageText: trimmed,
      modelIaId,
      randomUUID: crypto.randomUUID(),
      selectedDepartments,
      selectedSystems,
    };

    socketRef.current.emit('send-message', payload);
  }, [
    chatId,
    inputValue,
    modelIaId,
    selectedDepartments,
    selectedSystems,
    setInputValueState,
    setMessages,
    socketRef,
    user.name,
    user.userId,
  ]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    function clearSending() {
      isSendingRef.current = false;
      setIsSending(false);
    }

    function handleMessageResponse(res: MessageResponseSocketPayload) {
      if (res.status === 'ERROR') {
        toast.error(res.error || 'Erro ao processar resposta da IA.');
        clearSending();
        return;
      }

      setMessages((prev) => {
        const botMsg: ChatMessage = {
          messageId: res.messageId || crypto.randomUUID(),
          sender: 'assistant',
          messageText: res.messageText,
          sendAt: res.timestamp || new Date().toISOString(),
          sources: res.sources ?? [],
          modelIaName: res.modelIaName || 'OpenIa',
          userId: null,
          userName: null,
        };

        if (prev.some((message) => message.messageId === res.messageId)) {
          return prev.map((message) => (message.messageId === res.messageId ? botMsg : message));
        }

        const lastIndex = [...prev].reverse().findIndex(
          (message) => message.sender === 'assistant' && message.messageId === 'processing-placeholder',
        );

        if (lastIndex !== -1) {
          const actualIndex = prev.length - 1 - lastIndex;
          const updated = [...prev];
          updated[actualIndex] = botMsg;
          return updated;
        }

        return [...prev, botMsg];
      });

      clearSending();
    }

    function handleException(error: unknown) {
      toast.error(getSocketErrorMessage(error));
      clearSending();
    }

    socket.on('message-response', handleMessageResponse);
    socket.on('exception', handleException);

    return () => {
      socket.off('message-response', handleMessageResponse);
      socket.off('exception', handleException);
    };
  }, [setMessages, socketRef]);

  return { isSending, handleSendMessage };
}

function getSocketErrorMessage(error: unknown) {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }

  return 'Ocorreu um erro no servidor';
}
