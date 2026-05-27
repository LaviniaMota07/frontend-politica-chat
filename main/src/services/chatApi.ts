export interface CreateChatResponse {
  chatId?: string;
}

export interface ShareChatResponse {
  user: {
    name: string;
  };
}

export function buildChatScrollUrl(lastChatId?: string) {
  return lastChatId ? `/chat/scrolling?lastChatId=${lastChatId}` : '/chat/scrolling';
}

export function buildSharedChatScrollUrl(lastChatId?: string) {
  return lastChatId ? `/chat/shared-scrolling?lastChatId=${lastChatId}` : '/chat/shared-scrolling';
}
