import { ShieldCheck } from 'lucide-react';
import { ChatEmptyState } from './ChatEmptyState';

export function ChatWelcome() {
  return (
    <ChatEmptyState
      icon={<ShieldCheck size={22} strokeWidth={2.1} />}
      title="O que você precisa consultar hoje?"
      description="Pergunte sobre normas internas, documentos, segurança ou processos oficiais da empresa."
    />
  );
}
