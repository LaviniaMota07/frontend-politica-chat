export type MessageSender = 'user' | 'assistant';
export type AiProvider = 'GPT' | 'Claude' | 'Gemini';

export const aiProviderMapping: Record<AiProvider, number> = {
  GPT: 1,
  Claude: 2,
  Gemini: 3,
};

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

export interface SystemResponse {
  systemId: number;
  systemNm: string;
  acronym: string;
  active: boolean;
}
