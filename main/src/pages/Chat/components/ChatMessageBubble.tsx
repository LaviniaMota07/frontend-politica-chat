import type { ChatMessage } from '../types/chat.types';
import { formatTime } from '../utils/chat.helpers';

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

  const showAvatar = isAssistant || isOtherUser;
  const isLeftAligned = isAssistant || isOtherUser;

  return (
    <div className={`message-row ${isLeftAligned ? 'left' : 'right'}`}>
      {showAvatar && (
        <div className="message-avatar" aria-hidden="true">
          {isAssistant ? <AssistantAvatarIcon /> : <PersonAvatarIcon />}
        </div>
      )}

      <div className="message-stack">
        {(isAssistant || isOtherUser) && (
          <span className="message-sender">
            {isAssistant ? message.modelIaName : message.userName || 'Usuário'}
          </span>
        )}
        <div className={`message-bubble ${isLeftAligned ? 'left' : 'right'}`}>
          <p className="message-text">{message.messageText}</p>
        </div>

        {isAssistant && message.sources && message.sources.length > 0 && (
          <div className="message-sources">
            {message.sources.map((source) => (
              <span key={source.id} className="source-chip">
                {source.title}
              </span>
            ))}
          </div>
        )}

        <span className="message-time">{formatTime(message.sendAt)}</span>
      </div>
    </div>
  );
}
