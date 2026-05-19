export type MessageSender = 'user' | 'assistant';
export type AiProvider = 'GPT' | 'Claude' | 'Gemini';

export interface ChatSource {
  id: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  content: string;
  createdAt: string;
  sources?: ChatSource[];
}
