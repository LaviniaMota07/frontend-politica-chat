import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';
import type { ChatMessage } from '../types/chat.types';

const SOCKET_URL = (import.meta.env.VITE_URL_API || 'http://localhost:8080') + '/chat';

export function useChat(
  chatId: string,
  modelIaId: number,
  selectedDepartments?: string[],
  selectedSystems?: string[],
) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValueState] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const isConnectingRef = useRef(false); // Guard against StrictMode double-mount
  const isSendingRef = useRef(false);    // Synchronous guard — prevents double-send before React re-renders
  const currentUserIdRef = useRef<number | null>(user?.userId ?? null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCurrentlyTypingRef = useRef(false);

  // Expose setInputValue with integrated typing notification debouncing
  const setInputValue = (text: string) => {
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
      if (socketRef.current) {
        socketRef.current.emit('typing', { chatId, isTyping: false });
      }
    }, 2000);
  };

  // Ref to track chatId for the connection-level listeners without causing reconnects
  const chatIdRef = useRef(chatId);
  useEffect(() => {
    chatIdRef.current = chatId;
    setMessages([])
  }, [chatId]);

  // 1. Connection and Listeners setup on mount / auth change
  useEffect(() => {
    if (!user || !user.email) return;

    // Guard: prevent StrictMode's double-mount from creating two sockets.
    // isConnectingRef persists across the StrictMode unmount/remount cycle,
    // ensuring only one socket is ever created.
    if (isConnectingRef.current || socketRef.current) return;

    isConnectingRef.current = true;

    let cancelled = false; // ← flag local, imune ao StrictMode

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
    });

    socketRef.current = socket;

    // ─── Connection Listeners ──────────────────────────────────────────
    socket.on('connect', () => {
      if (cancelled) {          // ← se já foi desmontado, mata imediatamente
        socket.disconnect();
        return;
      }
    });

    socket.on('connected', (payload: { status: string; message: string; userId: number }) => {
      if (cancelled) return;
      isConnectingRef.current = false;
      setIsConnected(true);
      if (payload?.userId) {
        currentUserIdRef.current = payload.userId;
      }
    });

    // ─── Registrado UMA vez — não aninhado dentro de 'connected' ─────────
    socket.on('joined-chat', (ack) => {
      if (!ack?.chatId) return;

      // Resetar estados de paginação ao entrar no chat
      setHasMoreMessages(true);
      setIsLoadingMore(false);

      socket.emit(
        'get-chat-messages',
        {
          chatId: ack.chatId,
        }
      );
    });

    // ─── Listener de histórico — registrado UMA vez no nível do efeito ──
    socket.on('chat-messages', (historyAck: any) => {
      if (historyAck) {
        const finish = historyAck.finish !== undefined ? historyAck.finish : true;
        setHasMoreMessages(!finish);

        const fetched = Array.isArray(historyAck.data)
          ? historyAck.data
          : historyAck.data?.data || [];

        const mapped: ChatMessage[] = fetched.map((msg: any): ChatMessage => {
          const isUser = msg.userId !== null && msg.userId !== undefined;
          return {
            messageId: msg.messageId || crypto.randomUUID(),
            sender: isUser ? 'user' : 'assistant',
            messageText: msg.messageText,
            sendAt: msg.sendAt || new Date().toISOString(),
            sources: [],
            modelIaName: "OpenIa",
            userId: msg.userId,
            userName: msg.userName
          };
        }); // Mensagens vêm da mais nova para a mais antiga

        setMessages((prev) => {
          // Se é a primeira carga ou não tem mensagens, inverter e substituir
          if (prev.length === 0) {
            return [...mapped].reverse(); // Mais antiga no topo
          }
          // Se é paginação, inverter e adicionar no início (mensagens mais antigas)
          setIsLoadingMore(false);
          return [...mapped].reverse().concat(prev);
        });
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('WebSocket disconnected.');
    });

    // ─── Chat Message Listeners ─────────────────────────────────────────
    socket.on('new-message', (msg: { chatId: string; messageText: string; userId: number; timestamp: string; status: string; userName?: string }) => {
      if (Number(msg.userId) === Number(currentUserIdRef.current)) return;

      setMessages((prev) => {
        const newMsg: ChatMessage = {
          messageId: crypto.randomUUID(),
          sender: 'user',
          messageText: msg.messageText,
          sendAt: msg.timestamp || new Date().toISOString(),
          modelIaName: "OpenIa",
          userId: msg.userId,
          userName: msg.userName || null
        };
        return [...prev, newMsg];
      });
    });


    socket.on('message-response', (res: { messageId: string; messageText: string; status: string; error?: string; timestamp?: string }) => {
      if (res.status === 'ERROR') {
        toast.error(res.error || 'Erro ao processar resposta da IA.');
        isSendingRef.current = false;
        setIsSending(false);
        return;
      }

      setMessages((prev) => {
        const botMsg: ChatMessage = {
          messageId: res.messageId || crypto.randomUUID(),
          sender: 'assistant',
          messageText: res.messageText,
          sendAt: res.timestamp || new Date().toISOString(),
          sources: [],
          modelIaName: "OpenIa",
          userId: user.userId || null,
          userName: user.name || null
        };

        if (prev.some((m) => m.messageId === res.messageId)) {
          return prev.map((m) => (m.messageId === res.messageId ? botMsg : m));
        }

        // Replace the last processing placeholder if present
        const lastIndex = [...prev].reverse().findIndex(
          (m) => m.sender === 'assistant' && m.messageId === 'processing-placeholder'
        );
        if (lastIndex !== -1) {
          const actualIndex = prev.length - 1 - lastIndex;
          const updated = [...prev];
          updated[actualIndex] = botMsg;
          return updated;
        }

        return [...prev, botMsg];
      });

      isSendingRef.current = false;
      setIsSending(false);
    });

    // ─── Room User Lifecycle ──────────────────────────────────────────
    socket.on('user-joined', (payload: { userId: number; timestamp: string }) => {
      console.log(`User ${payload.userId} joined the room.`);
    });

    socket.on('user-left', (payload: { userId: number; timestamp: string }) => {
      console.log(`User ${payload.userId} left the room.`);
      setTypingUsers((prev) => prev.filter((id) => id !== payload.userId));
    });

    socket.on('user-typing', (payload: { userId: number; isTyping: boolean; timestamp: string }) => {
      if (payload.userId === currentUserIdRef.current) return;
      setTypingUsers((prev) => {
        if (payload.isTyping) {
          if (prev.includes(payload.userId)) return prev;
          return [...prev, payload.userId];
        } else {
          return prev.filter((id) => id !== payload.userId);
        }
      });
    });

    // ─── Error Handling ───────────────────────────────────────────────
    socket.on('exception', (error: any) => {
      const errorMsg = typeof error === 'string' ? error : error?.message || 'Ocorreu um erro no servidor';
      toast.error(errorMsg);
      isSendingRef.current = false;
      setIsSending(false);
    });

    return () => {
      if (socketRef.current) {
        cancelled = true;
        isConnectingRef.current = false;
        socket.removeAllListeners(); // ← remove tudo de uma vez
        socket.emit('leave-chat', { chatId: chatIdRef.current });
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?.userId]);

  // 2. Effect to handle changing the room when chatId or connection state changes
  useEffect(() => {
    if (!socketRef.current || !isConnected || !chatId) return;

    console.log('emitindo join-chat para room:', chatId);
    socketRef.current.emit('join-chat', { chatId });

    return () => {
      if (socketRef.current && isConnected) {
        console.log('emitindo leave-chat para room:', chatId);
        socketRef.current.emit('leave-chat', { chatId });
      }
    };
  }, [chatId, isConnected]);


  // ─── Operations ───────────────────────────────────────────────────
  async function handleSendMessage() {
    const trimmed = inputValue.trim();

    // Synchronous ref guard prevents double-send before React re-renders
    if (!trimmed || isSendingRef.current || !socketRef.current) return;

    isSendingRef.current = true;
    setIsSending(true);
    setInputValueState('');

    // Optimistic UI: add user message and processing placeholder immediately
    const userMessage: ChatMessage = {
      messageId: crypto.randomUUID(),
      sender: 'user',
      messageText: trimmed,
      sendAt: new Date().toISOString(),
      modelIaName: "OpenIa",
      userId: user.userId || null,
      userName: user.name || null
    };

    const assistantPlaceholder: ChatMessage = {
      messageId: 'processing-placeholder',
      sender: 'assistant',
      messageText: 'Processando resposta...',
      sendAt: new Date().toISOString(),
      modelIaName: "OpenIa",
      userId: null,
      userName: null
    };

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);

    // Emit send - message — chatId is always known(from URL param)
    (() => {
      socketRef.current.emit("send-message", {
        chatId,
        messageText: trimmed,
        modelIaId,
        randomUUID: crypto.randomUUID(),
        selectedDepartments,
        selectedSystems,
      })

      //console.log("AAAAA")

    })()

  }

  // Load more messages (pagination)
  const loadMoreMessages = () => {
    if (!hasMoreMessages || isLoadingMore || !socketRef.current || messages.length === 0) {
      return;
    }

    setIsLoadingMore(true);
    const oldestMessage = messages[0]; // Primeira mensagem (mais antiga)

    socketRef.current.emit('get-chat-messages', {
      chatId,
      lastMessageId: oldestMessage.messageId
    });
  }

  // Clear current active chat and local history
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
