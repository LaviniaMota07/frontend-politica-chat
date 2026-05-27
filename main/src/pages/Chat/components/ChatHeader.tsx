import { useState } from 'react';
import { Share2 } from 'lucide-react';
import ShareChat from '../../../components/ShareChat/ShareChat';
import CreateChatModal from '../../../components/CreateChatModal/CreateChatModal';
import { buttonStyles, chatStyles } from '../../../utils/tailwindStyles';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  isConnected?: boolean;
  chatId?: string;
}

export function ChatHeader({ isConnected, chatId }: ChatHeaderProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);

  const [openCreateChat, setOpenCreateChat] = useState(false);
  const canShare = Boolean(chatId);
  const shouldShowConnection = typeof isConnected === 'boolean';

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
        {shouldShowConnection && (
          <div className={cn(
            'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em]',
            isConnected
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-amber-200 bg-amber-50 text-amber-800',
          )}>
            <span className={cn('h-2 w-2 rounded-full', isConnected ? 'bg-emerald-500' : 'bg-amber-500')} />
            {isConnected ? 'Conectado' : 'Reconectando'}
          </div>
        )}
      </div>

      <div className={chatStyles.headerActions} aria-label="Ações do chat">
        <button
          type="button"
          className={buttonStyles.primary}
          onClick={()=> setOpenCreateChat(true)}
          title="Nova conversa"
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
