import { useState } from 'react';
import { Share2 } from 'lucide-react';
import ShareChat from '../../../components/shareChat/Index';
import CreateChatModal from '../../../components/modalCreateChat/Index';
import { buttonStyles, chatStyles } from '../../../utils/tailwindStyles';
import { cn } from '../../../utils/classNames';

interface ChatHeaderProps {
  isConnected?: boolean;
  chatId?: string;
}

export function ChatHeader({ isConnected = false, chatId }: ChatHeaderProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);

  const [openCreateChat, setOpenCreateChat] = useState(false);
  const canShare = Boolean(chatId);

  function handleCloseShare() {
    setIsShareOpen(false);
  }

  return (
    <header className={chatStyles.header}>
      <div className={chatStyles.headerMain}>
        <div>
          <span className={chatStyles.eyebrow}>Governança de conhecimento interno</span>
          <h1 className={chatStyles.headerTitle}>Assistente de Políticas</h1>
        </div>
        <div className={cn(
          'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.08em]',
          isConnected
            ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200'
            : 'border-amber-300/20 bg-amber-400/10 text-amber-200',
        )}>
          <span className={cn('h-2 w-2 rounded-full', isConnected ? 'bg-emerald-300' : 'bg-amber-300')} />
          {isConnected ? 'Conectado' : 'Reconectando'}
        </div>
      </div>

      <div className={chatStyles.headerActions} aria-label="Ações do chat">
        <button
          type="button"
          className={buttonStyles.primary}
          onClick={()=> setOpenCreateChat(true)}
          title="Limpar conversa e iniciar uma nova"
        >
          Nova Conversa
        </button>

        <button
          type="button"
          className={buttonStyles.icon}
          onClick={() => setIsShareOpen(true)}
          disabled={!canShare}
          aria-label="Compartilhar chat"
          title={canShare ? 'Compartilhar' : 'Abra uma conversa para compartilhar'}
        >
          <Share2 size={16} />
        </button>
      </div>

      {isShareOpen && canShare && (
        <ShareChat onClose={handleCloseShare} />
      )}

    
      <CreateChatModal isOpen={openCreateChat} onClose={() => setOpenCreateChat(false)} />
      

    </header>
  );
}
