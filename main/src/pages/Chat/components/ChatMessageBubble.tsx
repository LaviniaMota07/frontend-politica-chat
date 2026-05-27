import type { ChatMessage } from '../types/chat.types';
import { formatTime } from '../utils/chat.helpers';
import { cn } from '../../../utils/classNames';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  currentUserId: number | null;
}

function AssistantAvatarIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="20" fill="#2F6EF2" />
      <rect x="13.5" y="14.5" width="13" height="11" rx="2.5" stroke="white" strokeWidth="1.9" />
      <path d="M20 11V14.5" stroke="white" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M10.8 20H13.5" stroke="white" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M26.5 20H29.2" stroke="white" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M16.4 28V25.5" stroke="white" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M23.6 28V25.5" stroke="white" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="17.9" cy="19.6" r="1.15" fill="white" />
      <circle cx="22.1" cy="19.6" r="1.15" fill="white" />
    </svg>
  );
}

function PersonAvatarIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="20" fill="#10B981" />
      <circle cx="20" cy="16" r="6" fill="white" />
      <path d="M20 24C14.4772 24 10 28.4772 10 34H30C30 28.4772 25.5228 24 20 24Z" fill="white" />
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
          <span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">
            {isAssistant ? message.modelIaName : message.userName || 'Usuário'}
          </span>
        )}
        <div className={cn(
          'rounded-[24px] px-5 py-4 shadow-[0_18px_44px_rgba(0,0,0,0.18)]',
          isLeftAligned
            ? 'rounded-tl-md border border-white/10 bg-[#101b2e] text-slate-100'
            : 'rounded-tr-md bg-blue-500 text-white',
          isProcessing && 'animate-pulse',
        )}>
          <p className="whitespace-pre-wrap text-sm leading-7">{message.messageText}</p>
        </div>

        {isAssistant && message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.sources.map((source) => (
              <span key={source.id} className="rounded-full border border-blue-300/20 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-200">
                {source.title}
              </span>
            ))}
          </div>
        )}

        {isAssistant && !isProcessing && (!message.sources || message.sources.length === 0) && (
          <div className="text-xs text-slate-500">
            Fontes ainda não foram enviadas pelo backend.
          </div>
        )}

        <span className="text-[0.7rem] font-semibold text-slate-600">{formatTime(message.sendAt)}</span>
      </div>
    </div>
  );
}
