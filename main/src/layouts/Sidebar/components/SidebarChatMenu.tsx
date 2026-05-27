import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronRight, MessageSquare } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { NavLink } from 'react-router-dom';
import { z } from 'zod';
import type { Chat, ChatListResponse } from '../../../types/chat';
import { useScrolling } from '../../../hooks/useScrolling';
import { formStyles, sidebarStyles } from '../../../utils/tailwindStyles';
import { useChatHistory } from '../../../contexts/ChatHistoryContext';

interface ChatMenuProp {
  title: string;
  emptyMessage: string;
  handleGetChat: (lastChatId?: string) => Promise<ChatListResponse>;
}

const searchSchema = z.object({
  query: z.string().max(150, 'Nome do chat não pode ser maior que 150 caracteres'),
});

const SidebarChatMenu = ({ title, emptyMessage, handleGetChat }: ChatMenuProp) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isConversationHistoryOpen, setIsConversationHistoryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const finished = useRef(false);
  const { historyVersion } = useChatHistory();

  const { register, watch, formState: { errors } } = useForm({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: '',
    },
  });

  const query = watch('query');

  const filteredChats = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return chats;
    }

    return chats.filter((chat) => chat.title.toLowerCase().includes(normalizedQuery));
  }, [chats, query]);

  const reloadChats = useCallback(async () => {
    setIsLoading(true);
    try {
      finished.current = false;
      const result = await handleGetChat();
      finished.current = result.finished;
      setChats(mergeUniqueChats(result.data));
      setHasLoaded(true);
    } finally {
      setIsLoading(false);
    }
  }, [handleGetChat]);

  useEffect(() => {
    void reloadChats();
  }, [reloadChats]);

  useEffect(() => {
    if (historyVersion > 0) {
      void reloadChats();
    }
  }, [historyVersion, reloadChats]);

  useScrolling(
    scrollContainerRef,
    async () => {
      if (chats.length > 0 && !finished.current) {
        const lastChatId = chats[chats.length - 1].chatId;
        const newChats = await handleGetChat(lastChatId);
        setChats((prev) => mergeUniqueChats([...prev, ...newChats.data]));
        finished.current = newChats.finished;
      }
    },
    { threshold: 100 }
  );

  return (
    <section className={sidebarStyles.section} aria-label={title}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-sm font-bold text-[var(--text-inverse)]"
        onClick={() => setIsConversationHistoryOpen((current) => !current)}
        aria-expanded={isConversationHistoryOpen}
      >
        <span>{title}</span>
        {isConversationHistoryOpen ? (
          <ChevronDown size={16} strokeWidth={1.8} />
        ) : (
          <ChevronRight size={16} strokeWidth={1.8} />
        )}
      </button>

      {isConversationHistoryOpen && (
        <>
          <label className="mt-3 block">
            <input
              type="search"
              placeholder={`Buscar em ${title.toLowerCase()}`}
              className={`${formStyles.input} h-10 text-xs`}
              {...register('query')}
            />
          </label>

          {errors.query && <p className="mt-2 text-xs font-semibold text-red-400">{errors.query.message}</p>}

          <nav className="mt-3 flex max-h-52 flex-col gap-1 overflow-y-auto pr-1" ref={scrollContainerRef}>
            {filteredChats.map((item) => (
              <NavLink
                to={`/chat/${item.chatId}`}
                className={`${sidebarStyles.navLink} border border-transparent`}
                key={item.chatId}
                title={item.title}
              >
                <MessageSquare size={17} strokeWidth={1.8} />
                <span className="truncate">{item.title}</span>
              </NavLink>
            ))}
          </nav>

          {isLoading && (
            <p className="mt-3 text-sm text-[var(--text-inverse)]/50">Carregando conversas...</p>
          )}

          {!isLoading && hasLoaded && filteredChats.length === 0 && (
            <p className="mt-3 text-sm text-[var(--text-inverse)]/50">{emptyMessage}</p>
          )}
        </>
      )}
    </section>
  );
};

export default SidebarChatMenu;

function mergeUniqueChats(chats: Chat[]) {
  const chatsById = new Map<string, Chat>();

  for (const chat of chats) {
    chatsById.set(chat.chatId, chat);
  }

  return Array.from(chatsById.values());
}
