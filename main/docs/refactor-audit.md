# Auditoria de Drilling e Duplicação

Esta auditoria registra pontos de acoplamento encontrados durante o polimento visual. Nenhum item abaixo foi refatorado nesta rodada para evitar mudança comportamental junto com a migração completa para Tailwind.

## Prioridade Alta

- `src/pages/Chat/hooks/useChat.ts` concentra ciclo de vida do socket, entrada/saída de sala, paginação de histórico, debounce de digitação, envio otimista, mapeamento de mensagens e tratamento de erros. A próxima rodada deveria separar socket/listeners, paginação e envio em unidades menores.
- `src/pages/Chat/components/ChatInput.tsx` recebe muitos estados de filtro por props e ainda busca departamentos/sistemas internamente. Isso mistura apresentação do input com carregamento de dados.
- `src/pages/Chat/Chat.tsx`, `src/components/modalCreateChat/Index.tsx` e `src/pages/Sidebar/components/chat/Chat.tsx` coordenam atualização da sidebar via eventos globais `window.dispatchEvent`/`window.addEventListener`. Um contexto ou hook de histórico de chats deixaria essa dependência explícita.

## Prioridade Média

- `src/pages/AdminCatalogs/AdminCatalogs.tsx` e `src/pages/AdminDocuments/AdminDocuments.tsx` duplicam a paginação cursor-based de departamentos e sistemas. Um helper de scrolling/fetch por cursor reduziria divergência com mudanças futuras no backend.
- `src/pages/AdminUsers/AdminUsers.tsx`, `src/pages/AdminCatalogs/AdminCatalogs.tsx`, `src/pages/AdminDocuments/AdminDocuments.tsx` e `src/pages/AdminTokens/AdminTokens.tsx` repetem padrões de cards, tabelas, paginação e modais. A migração Tailwind centralizou classes, mas ainda não criou componentes de UI compartilhados.
- `src/components/shareChat/Index.tsx` e `src/components/shareChat/components/SharedUsers.tsx` usam evento global para inserir usuário compartilhado recém-criado. Um estado controlado no componente pai evitaria listeners implícitos.

## Itens Funcionais Incompletos

- `src/components/shareChat/components/CopyLinkButton.tsx` ainda usa `alert()` e `https://exemplo.com/link-compartilhado`; é comportamento placeholder e precisa de endpoint real antes de ser tratado como feature final.
- `src/pages/Register/Register.tsx` continua como placeholder de rota.
- `src/pages/Sidebar/Sidebar.tsx` mantém `AddPolicyModal` como fluxo visual incompleto; a seleção de departamentos/sistemas está marcada como pendente de integração com catálogos.

## Sugestão de Próxima Rodada

1. Extrair um hook de histórico de chats para substituir eventos globais de criação/edição.
2. Extrair helpers de cursor scrolling para departamentos/sistemas.
3. Separar `useChat` em hooks menores: conexão socket, mensagens, typing e envio.
4. Criar componentes compartilhados de admin para tabela, paginação e modal.

