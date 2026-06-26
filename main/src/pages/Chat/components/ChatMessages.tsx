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

  const lastMessageId = messages.at(-1)?.messageId ?? null;

  useEffect(() => {
    if (lastMessageId === null) {
      isFirstLoad.current = true;
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    isFirstLoad.current = false;
  }, [lastMessageId]);

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
          <div className="self-center rounded-full border border-[rgba(0,212,170,0.16)] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-[#7a9ab8]">
            <span>Carregando mais mensagens...</span>
          </div>
        )}
        {messages.length === 0 && !isLoadingMore && (
          <div className="m-auto flex flex-col items-center rounded-[1.5rem] border border-[rgba(0,212,170,0.14)] bg-white/[0.035] p-8 text-center backdrop-blur-[14px]">
            <strong className="font-[var(--heading)] text-lg font-bold text-[#eef2f7]">Nenhuma mensagem carregada nesta conversa.</strong>
            <span className="mt-2 text-sm text-[#7a9ab8]">Envie uma pergunta para consultar as políticas disponíveis.</span>
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
