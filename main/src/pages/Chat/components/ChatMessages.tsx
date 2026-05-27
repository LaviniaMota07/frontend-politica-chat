import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types/chat.types';
import { ChatMessageBubble } from './ChatMessageBubble';
import { chatStyles } from '../../../utils/tailwindStyles';

interface ChatMessagesProps {
  messages: ChatMessage[];
  currentUserId: number | null;
  loadMoreMessages: () => void;
  hasMoreMessages: boolean;
  isLoadingMore: boolean;
}

export function ChatMessages({ messages, currentUserId, loadMoreMessages, hasMoreMessages, isLoadingMore }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (messages.length === 0) {
      isFirstLoad.current = true;
    } else if (isFirstLoad.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      isFirstLoad.current = false;
    }
  }, [messages.length]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.scrollTop === 0 && hasMoreMessages && !isLoadingMore) {
      loadMoreMessages();
    }
  };

  return (
    <div className={chatStyles.messages} aria-live="polite" ref={messagesRef} onScroll={handleScroll}>
      <div className={chatStyles.messagesInner}>
        {isLoadingMore && (
          <div className="self-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-400">
            <span>Carregando mais mensagens...</span>
          </div>
        )}
        {messages.length === 0 && !isLoadingMore && (
          <div className="m-auto flex flex-col items-center rounded-3xl border border-white/10 bg-white/[0.035] p-8 text-center">
            <strong className="text-lg font-black text-slate-100">Nenhuma mensagem carregada nesta conversa.</strong>
            <span className="mt-2 text-sm text-slate-400">Envie uma pergunta para consultar as políticas disponíveis.</span>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessageBubble key={message.messageId} message={message} currentUserId={currentUserId} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
