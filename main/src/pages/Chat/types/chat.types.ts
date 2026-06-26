export type MessageSender = 'user' | 'assistant';

export interface ChatSource {
  id: string;
  title: string;
}

export interface ChatMessage {
  messageId: string;
  sender: MessageSender;
  messageText: string;
  sendAt: string;
  sources?: ChatSource[];
  modelIaName: string;
  userId: number | null;
  userName: string | null;
}

export interface DepartmentResponse {
  departmentId: number;
  departmentNm: string;
  acronym: string;
  active: boolean;
}

export interface ChatHistoryResponse {
  data: ChatMessageResponse[] | { data: ChatMessageResponse[] };
  finish?: boolean;
  finished?: boolean;
}

export interface ChatMessageResponse {
  messageId?: string;
  messageText: string;
  sendAt?: string;
  timestamp?: string;
  userId?: number | null;
  userName?: string | null;
  modelIaName?: string | null;
  sources?: ChatSource[];
}

export interface NewMessageSocketPayload {
  chatId: string;
  messageText: string;
  userId: number;
  timestamp: string;
  status: string;
  userName?: string | null;
  modelIaName?: string | null;
}

export interface MessageResponseSocketPayload {
  messageId: string;
  messageText: string;
  status: 'DONE' | 'ERROR' | string;
  error?: string;
  timestamp?: string;
  sources?: ChatSource[];
  modelIaName?: string | null;
}

export interface SendMessageSocketPayload {
  chatId: string;
  messageText: string;
  modelIaId: number;
  selectedDepartments: number[];
  selectedSystems: number[];
}

export interface ConnectedSocketPayload {
  status: string;
  message: string;
  userId: number;
}

export interface JoinedChatSocketPayload {
  chatId: string;
}

export interface TypingSocketPayload {
  userId: number;
  isTyping: boolean;
  timestamp: string;
}

export interface UserRoomSocketPayload {
  userId: number;
  timestamp: string;
}

export interface ServerToClientChatEvents {
  connect: () => void;
  connected: (payload: ConnectedSocketPayload) => void;
  'joined-chat': (payload: JoinedChatSocketPayload) => void;
  'chat-messages': (payload: ChatHistoryResponse) => void;
  disconnect: () => void;
  'new-message': (payload: NewMessageSocketPayload) => void;
  'message-response': (payload: MessageResponseSocketPayload) => void;
  'user-joined': (payload: UserRoomSocketPayload) => void;
  'user-left': (payload: UserRoomSocketPayload) => void;
  'user-typing': (payload: TypingSocketPayload) => void;
  exception: (error: unknown) => void;
}

export interface ClientToServerChatEvents {
  typing: (payload: { chatId: string; isTyping: boolean }) => void;
  'join-chat': (payload: { chatId: string }) => void;
  'leave-chat': (payload: { chatId: string }) => void;
  'get-chat-messages': (payload: { chatId: string; lastMessageId?: string }) => void;
  'send-message': (payload: SendMessageSocketPayload) => void;
}

export interface CreateMessageRequest {
  messageText: string;
  modelIaId: number;
  departmentsIds?: number[];
  systemsIds?: number[];
}

export type CreateMessageResponse = string | { chatId?: string };

export interface ChatNavigationState {
  selectedDepartments?: number[];
  selectedSystems?: number[];
  selectedAiProvider?: number;
  awaitingAssistantResponse?: boolean;
}

export interface SystemResponse {
  systemId: number;
  systemNm: string;
  acronym: string;
  active: boolean;
}
