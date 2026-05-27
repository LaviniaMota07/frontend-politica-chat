import { useState } from 'react';
import { useLocation, useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ChatInput } from './components/ChatInput';
import { ChatMessages } from './components/ChatMessages';
import { useChatAiProviders } from './hooks/useChatAiProviders';
import { useChat } from './hooks/useChat';
import { useChatFilterOptions } from './hooks/useChatFilterOptions';
import { chatDepartments, chatSystems } from './mocks/chat.mock';
import type { ChatNavigationState } from './types/chat.types';
import { chatStyles } from '../../utils/tailwindStyles';

export default function ChatRoom() {
  const { chatId } = useParams<{ chatId: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const navigationState = getChatNavigationState(location.state);
  const { fetchDepartments, fetchSystems } = useChatFilterOptions();

  const [selectedDepartments, setSelectedDepartments] = useState<number[]>(
    navigationState.selectedDepartments ?? []
  );
  const [selectedSystems, setSelectedSystems] = useState<number[]>(
    navigationState.selectedSystems ?? []
  );
  const { aiProviders, selectedAiProvider, setSelectedAiProvider } = useChatAiProviders(
    navigationState.selectedAiProvider ?? 1
  );

  const {
    messages,
    inputValue,
    setInputValue,
    handleSendMessage,
    isSending,
    typingUsers,
    loadMoreMessages,
    hasMoreMessages,
    isLoadingMore,
  } = useChat(chatId ?? '', selectedAiProvider ?? 0, selectedDepartments, selectedSystems);

  if (!chatId) {
    return <Navigate to="/chat" replace />;
  }

  const isAdmin = user.userTypeId === '1';
  const latestAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.sender === 'assistant');
  const sourcesCount = latestAssistantMessage?.sources?.length ?? 0;

  return (
    <main className={chatStyles.page} data-role={isAdmin ? 'admin' : 'user'}>
      <section className={chatStyles.main}>
        <div className={chatStyles.content}>
          <div className="flex h-full min-h-0 w-full flex-col">
            <ChatMessages
              messages={messages}
              currentUserId={user.userId ?? null}
              loadMoreMessages={loadMoreMessages}
              hasMoreMessages={hasMoreMessages}
              isLoadingMore={isLoadingMore}
            />
            {typingUsers.length > 0 && (
              <div className="mx-auto mb-3 flex w-fit items-center gap-3 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)]">
                <div className="flex gap-1">
                  <span className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-[var(--text-muted)]" />
                  <span className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-[var(--text-muted)] [animation-delay:200ms]" />
                  <span className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-[var(--text-muted)] [animation-delay:400ms]" />
                </div>
                <span>Alguém está digitando...</span>
              </div>
            )}
          </div>
        </div>

        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          isSending={isSending}
          sourcesCount={sourcesCount}
          selectedDepartments={selectedDepartments}
          departments={chatDepartments}
          onDepartmentsChange={setSelectedDepartments}
          fetchDepartments={fetchDepartments}
          selectedSystems={selectedSystems}
          systems={chatSystems}
          onSystemsChange={setSelectedSystems}
          fetchSystems={fetchSystems}
          selectedAiProvider={selectedAiProvider}
          aiProviders={aiProviders}
          onAiProviderChange={setSelectedAiProvider}
        />
      </section>
    </main>
  );
}

function getChatNavigationState(state: unknown): ChatNavigationState {
  if (!state || typeof state !== 'object') {
    return {};
  }

  const candidate = state as ChatNavigationState;

  return {
    selectedDepartments: Array.isArray(candidate.selectedDepartments)
      ? candidate.selectedDepartments.filter(isNumber)
      : undefined,
    selectedSystems: Array.isArray(candidate.selectedSystems)
      ? candidate.selectedSystems.filter(isNumber)
      : undefined,
    selectedAiProvider: typeof candidate.selectedAiProvider === 'number'
      ? candidate.selectedAiProvider
      : undefined,
  };
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}
