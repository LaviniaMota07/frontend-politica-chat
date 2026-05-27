import { FileText } from 'lucide-react';
import type { ChatMessage } from '../types/chat.types';
import { formatTime } from '../utils/chat.helpers';
import { cn } from '@/lib/utils';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  currentUserId: number | null;
}

function AssistantAvatarIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="36" height="36" rx="10" fill="#20231f" />
      <rect x="11" y="12" width="14" height="12" rx="2.5" stroke="#fbf6ea" strokeWidth="1.7" />
      <path d="M18 9V12" stroke="#fbf6ea" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M8.5 18H11" stroke="#fbf6ea" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M25 18H27.5" stroke="#fbf6ea" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M14.5 27V24" stroke="#fbf6ea" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M21.5 27V24" stroke="#fbf6ea" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="15.8" cy="17.8" r="1.1" fill="#fbf6ea" />
      <circle cx="20.2" cy="17.8" r="1.1" fill="#fbf6ea" />
    </svg>
  );
}

function PersonAvatarIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="36" height="36" rx="10" fill="#efe0cf" />
      <circle cx="18" cy="14" r="5" fill="#a86535" />
      <path d="M18 21C12.477 21 8 25.03 8 30H28C28 25.03 23.523 21 18 21Z" fill="#a86535" />
    </svg>
  );
}

export function ChatMessageBubble({ message, currentUserId }: ChatMessageBubbleProps) {
  const isCurrentUser = message.userId === currentUserId;
  const isAssistant = message.sender === 'assistant';
  const isOtherUser = message.sender === 'user' && !isCurrentUser;
  const isProcessing = message.messageId === 'processing-placeholder';

  const showAvatar = isAssistant || isOtherUser;
  const isLeftAligned = isAssistant || isOtherUser;

  return (
    <div className={cn('flex w-full gap-3', isLeftAligned ? 'justify-start' : 'justify-end')}>
      {showAvatar && (
        <div className="mt-6 shrink-0" aria-hidden="true">
          {isAssistant ? <AssistantAvatarIcon /> : <PersonAvatarIcon />}
        </div>
      )}

      <div className={cn('flex max-w-[76%] flex-col gap-2 max-[700px]:max-w-[90%]', isLeftAligned ? 'items-start' : 'items-end')}>
        {(isAssistant || isOtherUser) && (
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
            {isAssistant ? message.modelIaName : message.userName || 'Usuário'}
          </span>
        )}

        <div className={cn(
          'px-5 py-4',
          isLeftAligned
            ? 'rounded-[18px_18px_18px_6px] border border-[var(--border-neutral)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[0_2px_12px_rgba(31,29,25,0.06)]'
            : 'rounded-[18px_18px_6px_18px] bg-[var(--accent)] text-[var(--text-inverse)]',
          isProcessing && 'opacity-60',
        )}>
          <p className="whitespace-pre-wrap text-sm leading-7">{message.messageText}</p>
        </div>

        {isAssistant && message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.sources.map((source) => (
              <span key={source.id} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                <FileText size={12} strokeWidth={1.8} />
                {source.title}
              </span>
            ))}
          </div>
        )}

        <span className="text-[0.7rem] font-medium text-[var(--text-muted)]">{formatTime(message.sendAt)}</span>
      </div>
    </div>
  );
}
