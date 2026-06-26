import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import type { ChatHistoryResponse, ChatMessage, ChatMessageResponse, NewMessageSocketPayload } from '../types/chat.types';
import type { ChatSocketRef } from './useSocketConnection';
import { createClientMessageId } from '../utils/chat.helpers';

interface UseChatMessagesParams {
  chatId: string;
  socketRef: ChatSocketRef;
  currentUserIdRef: MutableRefObject<number | null>;
  awaitingAssistantResponse?: boolean;
}

export function useChatMessages({
  chatId,
  socketRef,
  currentUserIdRef,
  awaitingAssistantResponse = false,
}: UseChatMessagesParams) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => (
    awaitingAssistantResponse ? [createAssistantPlaceholder()] : []
  ));
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const chatIdRef = useRef(chatId);

  useEffect(() => {
    chatIdRef.current = chatId;
    queueMicrotask(() => {
      setMessages([]);
      if (awaitingAssistantResponse) {
        setMessages([createAssistantPlaceholder()]);
      }
      setHasMoreMessages(true);
      setIsLoadingMore(false);
    });
  }, [awaitingAssistantResponse, chatId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const activeSocket = socket;

    function handleJoinedChat(ack: { chatId: string }) {
      if (!ack?.chatId) return;

      setHasMoreMessages(true);
      setIsLoadingMore(false);
      activeSocket.emit('get-chat-messages', { chatId: ack.chatId });
    }

    function handleChatMessages(historyAck: ChatHistoryResponse) {
      if (!historyAck) return;

      const finish = historyAck.finish ?? historyAck.finished ?? true;
      setHasMoreMessages(!finish);

      const fetched = Array.isArray(historyAck.data)
        ? historyAck.data
        : historyAck.data?.data || [];
      const mapped = fetched.map(mapHistoryMessage);

      setMessages((prev) => {
        const historyMessages = [...mapped].reverse();
        const currentMessages = historyMessages.some(isRealAssistantMessage)
          ? prev.filter((message) => message.messageId !== 'processing-placeholder')
          : prev;

        if (currentMessages.length === 0) {
          return historyMessages;
        }

        const currentIds = new Set(currentMessages.map((message) => message.messageId));
        const uniqueHistoryMessages = historyMessages.filter(
          (message) => !currentIds.has(message.messageId),
        );

        return uniqueHistoryMessages.concat(currentMessages);
      });
      setIsLoadingMore(false);
    }

    function handleNewMessage(msg: NewMessageSocketPayload) {
      if (msg.chatId !== chatIdRef.current) return;
      if (Number(msg.userId) === Number(currentUserIdRef.current)) return;

      setMessages((prev) => [
        ...prev,
        {
          messageId: createClientMessageId(),
          sender: 'user',
          messageText: msg.messageText,
          sendAt: msg.timestamp || new Date().toISOString(),
          modelIaName: msg.modelIaName || 'IA',
          userId: msg.userId,
          userName: msg.userName || null,
        },
      ]);
    }

    activeSocket.on('joined-chat', handleJoinedChat);
    activeSocket.on('chat-messages', handleChatMessages);
    activeSocket.on('new-message', handleNewMessage);

    return () => {
      activeSocket.off('joined-chat', handleJoinedChat);
      activeSocket.off('chat-messages', handleChatMessages);
      activeSocket.off('new-message', handleNewMessage);
    };
  }, [currentUserIdRef, socketRef]);

  const loadMoreMessages = useCallback(() => {
    if (!hasMoreMessages || isLoadingMore || !socketRef.current || messages.length === 0) {
      return;
    }

    setIsLoadingMore(true);
    const oldestMessage = messages[0];

    socketRef.current.emit('get-chat-messages', {
      chatId,
      lastMessageId: oldestMessage.messageId,
    });
  }, [chatId, hasMoreMessages, isLoadingMore, messages, socketRef]);

  return {
    messages,
    setMessages,
    loadMoreMessages,
    hasMoreMessages,
    isLoadingMore,
  };
}

function createAssistantPlaceholder(): ChatMessage {
  return {
    messageId: 'processing-placeholder',
    sender: 'assistant',
    messageText: 'Processando resposta...',
    sendAt: new Date().toISOString(),
    modelIaName: 'IA',
    userId: null,
    userName: null,
  };
}

function isRealAssistantMessage(message: ChatMessage) {
  return message.sender === 'assistant' && message.messageId !== 'processing-placeholder';
}

function mapHistoryMessage(msg: ChatMessageResponse): ChatMessage {
  const isUser = msg.userId !== null && msg.userId !== undefined;

  return {
    messageId: msg.messageId || createClientMessageId(),
    sender: isUser ? 'user' : 'assistant',
    messageText: msg.messageText,
    sendAt: msg.sendAt || msg.timestamp || new Date().toISOString(),
    sources: msg.sources ?? [],
    modelIaName: msg.modelIaName || 'IA',
    userId: msg.userId ?? null,
    userName: msg.userName ?? null,
  };
}
