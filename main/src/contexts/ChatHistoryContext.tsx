import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface ChatHistoryContextValue {
  historyVersion: number;
  notifyChatCreated: () => void;
  notifyChatUpdated: () => void;
}

const ChatHistoryContext = createContext<ChatHistoryContextValue | null>(null);

interface ChatHistoryProviderProps {
  children: ReactNode;
}

export function ChatHistoryProvider({ children }: ChatHistoryProviderProps) {
  const [historyVersion, setHistoryVersion] = useState(0);
  const notifyChatListChanged = useCallback(() => {
    setHistoryVersion((version) => version + 1);
  }, []);

  const value = useMemo<ChatHistoryContextValue>(
    () => ({
      historyVersion,
      notifyChatCreated: notifyChatListChanged,
      notifyChatUpdated: notifyChatListChanged,
    }),
    [historyVersion, notifyChatListChanged],
  );

  return (
    <ChatHistoryContext.Provider value={value}>
      {children}
    </ChatHistoryContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useChatHistory() {
  const context = useContext(ChatHistoryContext);

  if (!context) {
    throw new Error('useChatHistory must be used within ChatHistoryProvider');
  }

  return context;
}
