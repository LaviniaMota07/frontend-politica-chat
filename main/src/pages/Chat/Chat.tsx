import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import '../../styles/Chat.css';
import { ChatHeader } from './components/ChatHeader';
import { ChatInput } from './components/ChatInput';
import { ChatWelcome } from './components/ChatWelcome';
import { aiProviders, chatDepartments, chatSystems } from './mocks/chat.mock';

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { post, loading } = useFetch<string>();

  const [inputValue, setInputValue] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState([chatDepartments[0]]);
  const [selectedSystems, setSelectedSystems] = useState([chatSystems[0]]);
  const [selectedAiProvider, setSelectedAiProvider] = useState<number>(1);

  const isAdmin = user.userTypeId === '2';

  async function handleSendMessage() {
    const trimmed = inputValue.trim();
    if (!trimmed || loading) return;

    const chatId = await post('/message', {
      body: {
        messageText: trimmed,
        modelIaId: selectedAiProvider,
        selectedDepartments,
        selectedSystems,
      },
    });

    if (chatId) {
      navigate(`/chat/${chatId}`);
    }
  }

  return (
    <main className={`chat-page ${isAdmin ? 'admin' : 'user'}`}>
      <section className="chat-main">
        <ChatHeader isConnected={false} />

        <div className="chat-content">
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
