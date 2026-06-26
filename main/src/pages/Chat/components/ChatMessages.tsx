import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types/chat.types';
import { ChatMessageBubble } from './ChatMessageBubble';

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
    <div className="chat-messages" aria-live="polite" ref={messagesRef} onScroll={handleScroll}>
      <div className="chat-messages-inner">
        {isLoadingMore && (
          <div className="loading-more-messages">
            <span>Carregando mais mensagens...</span>
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
