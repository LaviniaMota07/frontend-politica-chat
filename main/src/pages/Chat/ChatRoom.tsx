import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Chat.css';
import { ChatHeader } from './components/ChatHeader';
import { ChatInput } from './components/ChatInput';
import { ChatMessages } from './components/ChatMessages';
import { useChat } from './hooks/useChat';
import { aiProviders, chatDepartments, chatSystems } from './mocks/chat.mock';

export default function ChatRoom() {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();

  const [selectedDepartments, setSelectedDepartments] = useState([chatDepartments[0]]);
  const [selectedSystems, setSelectedSystems] = useState([chatSystems[0]]);
  const [selectedAiProvider, setSelectedAiProvider] = useState<number>(1);

  const {
    messages,
    inputValue,
    setInputValue,
    handleSendMessage,
    isSending,
    isConnected,
    typingUsers,
    loadMoreMessages,
    hasMoreMessages,
    isLoadingMore,
  } = useChat(chatId ?? '', selectedAiProvider, selectedDepartments, selectedSystems);

  if (!chatId) {
    return <Navigate to="/chat" replace />;
  }

  const isAdmin = user.userTypeId === '2';
  const latestAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.sender === 'assistant');
  const sourcesCount = latestAssistantMessage?.sources?.length ?? 0;

  return (
    <main className={`chat-page ${isAdmin ? 'admin' : 'user'}`}>
      <section className="chat-main">
        <ChatHeader
          isConnected={isConnected}
        />

        <div className="chat-content">
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', minHeight: 0 }}>
            <ChatMessages
              messages={messages}
              currentUserId={user.userId ?? null}
              loadMoreMessages={loadMoreMessages}
              hasMoreMessages={hasMoreMessages}
              isLoadingMore={isLoadingMore}
            />
            {typingUsers.length > 0 && (
              <div className="chat-typing-indicator-container">
                <div className="typing-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="typing-text">Alguém está digitando...</span>
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
