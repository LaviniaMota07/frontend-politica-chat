import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Chat.css';
import { ChatHeader } from './components/ChatHeader';
import { ChatInput } from './components/ChatInput';
import { ChatMessages } from './components/ChatMessages';
import { ChatWelcome } from './components/ChatWelcome';
import { useChat } from './hooks/useChat';
import { aiProviders, chatDepartments, chatSystems } from './mocks/chat.mock';
import type { AiProvider } from './types/chat.types';

export default function Chat() {
  const { user } = useAuth();
  const [selectedDepartments, setSelectedDepartments] = useState([chatDepartments[0]]);
  const [selectedSystems, setSelectedSystems] = useState([chatSystems[0]]);
  const [selectedAiProvider, setSelectedAiProvider] = useState<AiProvider>(aiProviders[0]);
  const {
    messages,
    inputValue,
    setInputValue,
    handleSendMessage,
    isSending,
  } = useChat(selectedDepartments, selectedSystems, selectedAiProvider);

  const hasMessages = messages.length > 0;
  const isAdmin = user.role === '2';
  const latestAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.sender === 'assistant');
  const sourcesCount = latestAssistantMessage?.sources?.length ?? 0;

  return (
    <main className={`chat-page ${isAdmin ? 'admin' : 'user'}`}>
      <section className="chat-main">
        <ChatHeader />

        <div className="chat-content">
          {hasMessages ? (
            <ChatMessages messages={messages} />
          ) : (
            <ChatWelcome />
          )}
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
          selectedSystems={selectedSystems}
          systems={chatSystems}
          onSystemsChange={setSelectedSystems}
          selectedAiProvider={selectedAiProvider}
          aiProviders={aiProviders}
          onAiProviderChange={setSelectedAiProvider}
        />
      </section>
    </main>
  );
}
