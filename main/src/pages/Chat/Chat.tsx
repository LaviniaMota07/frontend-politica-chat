import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { ChatHeader } from './components/ChatHeader';
import { ChatInput } from './components/ChatInput';
import { ChatWelcome } from './components/ChatWelcome';
import { aiProviders, chatDepartments, chatSystems } from './mocks/chat.mock';
import type { ChatNavigationState, CreateMessageRequest, CreateMessageResponse } from './types/chat.types';
import { chatStyles } from '../../utils/tailwindStyles';
import { useChatHistory } from '../../contexts/ChatHistoryContext';
import { useChatFilterOptions } from './hooks/useChatFilterOptions';

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { post, loading } = useFetch<CreateMessageResponse>();
  const { notifyChatCreated } = useChatHistory();
  const { fetchDepartments, fetchSystems } = useChatFilterOptions();

  const [inputValue, setInputValue] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
  const [selectedSystems, setSelectedSystems] = useState<number[]>([]);
  const [selectedAiProvider, setSelectedAiProvider] = useState<number>(1);

  const isAdmin = user.userTypeId === '1';

  async function handleSendMessage() {
    const trimmed = inputValue.trim();
    if (!trimmed || loading) return;

    const body: CreateMessageRequest = {
      messageText: trimmed,
      modelIaId: selectedAiProvider,
      departmentsIds: selectedDepartments.length > 0 ? selectedDepartments : undefined,
      systemsIds: selectedSystems.length > 0 ? selectedSystems : undefined,
    };

    const response = await post('/message', { body });
    const chatId = getCreatedChatId(response);

    if (chatId) {
      notifyChatCreated();
      const navigationState: ChatNavigationState = {
        selectedDepartments,
        selectedSystems,
        selectedAiProvider,
      };

      navigate(`/chat/${chatId}`, { state: navigationState });
    }
  }

  return (
    <main className={chatStyles.page} data-role={isAdmin ? 'admin' : 'user'}>
      <section className={chatStyles.main}>
        <ChatHeader isConnected={false} />

        <div className={chatStyles.content}>
          <ChatWelcome />
        </div>

        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          isSending={loading}
          sourcesCount={0}
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

function getCreatedChatId(response: CreateMessageResponse | null) {
  if (!response) {
    return null;
  }

  if (typeof response === 'string') {
    return response;
  }

  return response.chatId ?? null;
}
