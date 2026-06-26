import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
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
          {isAssistant ? (
            <div className="prose prose-sm max-w-none wrap-break-word text-sm leading-7 [&_a]:text-(--accent-strong) [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-(--border-neutral) [&_blockquote]:pl-3 [&_blockquote]:text-(--text-secondary) [&_code]:rounded [&_code]:bg-(--bg-body) [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_h1]:mb-2 [&_h1]:text-base [&_h1]:font-bold [&_h2]:mb-1.5 [&_h2]:text-sm [&_h2]:font-bold [&_h3]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_hr]:border-(--border-neutral) [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-(--bg-body) [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_strong]:font-bold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                {message.messageText}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap wrap-break-word text-sm leading-7">{message.messageText}</p>
          )}
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
