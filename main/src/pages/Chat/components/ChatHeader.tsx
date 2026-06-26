import { useState } from 'react';
import { Share2 } from 'lucide-react';
import ShareChat from '../../../components/shareChat/Index';
import CreateChatModal from '../../../components/modalCreateChat/Index';

interface ChatHeaderProps {
  isConnected?: boolean;
}

export function ChatHeader({ isConnected = false }: ChatHeaderProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);

  const [openCreateChat, setOpenCreateChat] = useState(false);

  function handleCloseShare() {
    setIsShareOpen(false);
  }

  return (
    <header className="chat-header">
      <div className="chat-header-main">
        <h1 className="chat-header-title">Assistente de Políticas</h1>
        <div className={`connection-badge ${isConnected ? 'connected' : ''}`}>
          <span className="connection-badge-dot" />
          {isConnected ? 'Online' : 'Offline'}
        </div>
      </div>

      <div className="chat-header-actions" aria-label="Ações do chat">
        <button
          type="button"
          className="chat-share-invite-btn"
          style={{ height: '30px', padding: '0 12px', fontSize: '0.78rem', borderRadius: '999px' }}
          onClick={()=> setOpenCreateChat(true)}
          title="Limpar conversa e iniciar uma nova"
        >
          Nova Conversa
        </button>

        <button
          type="button"
          className="chat-icon-button"
          onClick={() => setIsShareOpen(true)}
          aria-label="Compartilhar chat"
          title="Compartilhar"
        >
          <Share2 size={16} />
        </button>
      </div>

      {isShareOpen && (
        <ShareChat onClose={handleCloseShare} />
      )}

    
      <CreateChatModal isOpen={openCreateChat} onClose={() => setOpenCreateChat(false)} />
      

    </header>
  );
}
