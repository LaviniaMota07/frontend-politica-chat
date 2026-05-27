# Redesign — AI Observatory
**Data:** 2026-05-27  
**Status:** Aprovado  
**Escopo:** Todas as telas — Login, Chat, Sidebar, Admin Panels  
**Stack:** React 19 + Vite + Tailwind v4 (sem novas dependências obrigatórias; fontes via Google Fonts; animações CSS-first)

---

## 1. Contexto

O sistema **Assistente de Políticas** é um chat corporativo com IA que permite consultar documentos de política e normas da empresa. Possui dois perfis: usuário final (chat, perfil) e administrador (gestão de usuários, documentos, departamentos, tokens).

O objetivo do redesign é elevar a experiência visual de um SaaS navy genérico para uma identidade **dark premium AI-first**, com inspiração em Perplexity/Claude — limpo, focado no chat, com profundidade e sofisticação.

---

## 2. Princípios de Design

- **Profundidade sobre flatness:** camadas de background criam hierarquia visual sem necessidade de sombras agressivas
- **Cyan-teal como alma:** o acento principal deve emergir do escuro com vida própria, não apenas colorir botões
- **Tipografia faz o trabalho pesado:** headings com personalidade, body limpo
- **Glass morphism real:** backdrop-blur + bordas sutis, não simulado com opacidade de cor
- **Animações com propósito:** fade-in staggered no load, transições de sidebar, glow pulsante no welcome state

---

## 3. Fundações de Design (Design Tokens)

### Paleta de Cores

```css
--bg-base:      #050d1a;   /* background mais fundo */
--bg-body:      #07121f;   /* body da aplicação */
--bg-surface:   #0d1b2f;   /* cards, painéis */
--bg-elevated:  #0f2040;   /* modais, dropdowns */

--accent:       #00d4aa;   /* cyan-teal primário */
--accent-glow:  #00fff2;   /* glow, highlights */
--accent-muted: rgba(0,212,170,0.12); /* bordas, bg sutis */

--text-primary:   #eef2f7; /* texto principal */
--text-secondary: #7a9ab8; /* texto secundário */
--text-muted:     #3d5c78; /* placeholders, labels */

--border-cyan:    rgba(0,212,170,0.12);
--border-neutral: rgba(255,255,255,0.06);
```

### Tipografia

| Papel | Fonte | Onde |
|---|---|---|
| Display / Headings | **Syne** (Google Fonts) | Títulos de página, welcome state, headings |
| Body / UI | **DM Sans** (Google Fonts) | Todo texto de interface, labels, mensagens |
| Dados / Mono | **JetBrains Mono** (Google Fonts) | Tabelas de tokens, IDs, código |

### Superfícies

- **Card glass:** `background: rgba(13,27,47,0.7); backdrop-filter: blur(12px); border: 1px solid var(--border-cyan);`
- **Botão primário:** `background: #00d4aa; color: #050d1a; box-shadow: 0 0 20px rgba(0,212,170,0.3);`
- **Botão secundário:** glass com borda `cyan/20`, texto `--accent`
- **Botão danger:** glass red/20, texto red-400; hover → solid red

---

## 4. Layout & Navegação

### Sidebar — "Glass Rail"

- **Dimensões:** expandida `280px`, colapsada `64px`
- **Posição:** `position: fixed; margin: 12px; border-radius: 16px` — flutuante, não anexada à borda
- **Estilo:** glass card (`backdrop-blur: 20px`, `border: 1px solid rgba(0,212,170,0.1)`)
- **Transição:** `width 300ms ease` com opacidade dos labels
- **Seções:**
  - Topo: logo + nome da empresa (gradiente de texto `cyan → white`), botão de nova conversa
  - Nav de fontes (Documentos, Usuários, Departamentos, Sistemas, Tokens) — ícones com pill hover
  - Lista de chats com scroll personalizado (`scrollbar: 2px, color: cyan/30`)
  - Bottom: glass card com avatar + nome + link "Editar perfil"
- **Comportamento de collapse:** ícones permanecem, labels desaparecem; tooltip no hover dos ícones

### DashboardLayout

- Main content: `padding-left: 292px` (sidebar 280px + 12px gap)
- Background: `var(--bg-body)` uniforme
- Topbar: removida — contexto e breadcrumb vivem dentro de cada página
- Overflow: `auto` no main, sem `overflow: hidden` no body

---

## 5. Tela de Login — "Borealis Login"

### Estrutura

- Full-screen `min-h-screen`, fundo `--bg-base`
- **Mesh gradient animado** (CSS puro): 3 nódulos de cor (`#00d4aa`, `#007acc`, `#00fff2`) se movendo em círculo com `@keyframes` — opacidade baixa (`0.15`) para não distrair
- Card central: `width: 420px`, glass card com `backdrop-blur(24px)`, `border-radius: 20px`

### Conteúdo do Card

1. Logo + nome em topo (sem link)
2. Headline `Syne` 24px: **"Consulte. Entenda. Decida."**
3. Subtítulo `DM Sans` muted 14px: "Acesse as políticas e normas da sua empresa."
4. Formulário:
   - Input email: label acima, `background: rgba(255,255,255,0.04)`, `border: 1px solid rgba(255,255,255,0.08)`, focus ring `2px solid rgba(0,212,170,0.6)`
   - Input senha: idem + toggle show/hide
5. Botão CTA: full-width, dark-on-cyan com glow
6. Link "Solicitar acesso" como texto abaixo do botão — underline cyan, discrete

---

## 6. Interface de Chat

### Estado Vazio / Welcome

- Ícone grande em glass circle (`80px`) com glow cyan pulsante (`@keyframes pulse-glow`)
- Headline `Syne` 32px: "O que você precisa consultar hoje?"
- Subtítulo muted 16px
- 3 suggestion chips em glass pills com `border: 1px solid cyan/20`, hover → `border-color: cyan/60` + glow sutil

### Mensagens

- **Assistente (left):**
  - Bubble: glass card `border: 1px solid cyan/15`, `border-radius: 16px 16px 16px 4px`
  - Avatar: glass circle com ícone robot, ring `2px solid cyan/40`
  - Source attribution: pills abaixo com ícone `FileText` + nome do documento; hover revela trecho em tooltip
  
- **Usuário (right):**
  - Bubble: `background: rgba(0,212,170,0.12)`, `border: 1px solid cyan/20`, `border-radius: 16px 16px 4px 16px`
  - Sem avatar excessivo (apenas inicial no mobile)

- **Typing indicator:** 3 dots com stagger animation em cyan

### Input Dock

- Floating bottom: glass panel `border-radius: 20px`, `border: 1px solid rgba(0,212,170,0.2)`, `backdrop-blur: 16px`
- Posição: `position: sticky; bottom: 24px; margin: 0 24px`
- Textarea auto-expand integrada ao glass, sem borda própria
- Filter chips acima do input como tags compactas com ícone × para remover
- Botão send: `48px` circle, `background: #00d4aa`, `color: #050d1a`, `box-shadow: 0 0 12px rgba(0,212,170,0.4)`

---

## 7. Admin Panels

### Estrutura Comum

Todas as páginas admin seguem: `padding: 32px`, max-width `1200px`, heading de página em `Syne` 28px.

### Stats Cards (AdminUsers)

- 4 cards glass em grid, `border: 1px solid cyan/10`
- Número grande: `Syne` 40px, `--text-primary`
- Label: `DM Sans` 11px uppercase tracked, `--text-muted`
- Hover: `border-color: cyan/30` + glow sutil

### Tabelas

- Wrapper: glass card com border `cyan/10`
- Header row: `background: rgba(0,212,170,0.05)`, texto `DM Sans` 11px uppercase tracked, `--text-muted`
- Body rows: hover `rgba(255,255,255,0.02)`, separador `border-bottom: 1px solid rgba(255,255,255,0.05)`
- Badges:
  - Admin: `background: rgba(0,212,170,0.15); color: #00d4aa; border: 1px solid rgba(0,212,170,0.3)`
  - Blocked: `background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3)`
  - Active: `background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.3)`
- Paginação: pill nav com números

### Modais

- Backdrop: `backdrop-blur(32px)` + overlay `rgba(5,13,26,0.8)`
- Panel: glass card, `border-top: 2px solid #00d4aa` como accent stripe
- Formulários: `DM Sans`, labels acima dos inputs, espaçamento generoso
- Ações: botões primário (cyan) + secundário (glass) + danger (red glass → red solid hover)

### AdminDocuments

- Cards de documento com status dot: synced = verde sólido, pending = amarelo pulsante, error = vermelho

### AdminTokens

- Valores de token em `JetBrains Mono`, truncado com copy-on-click

---

## 8. Componentes Compartilhados

### ModalBase
- Reutilizável com `children`, `title`, `onClose`
- Aplica backdrop blur + panel glass + accent stripe cyan

### GlassCard
- Componente wrapper: glass + border + border-radius padrão
- Props: `hover` (activa hover glow), `accent` (muda borda para cyan/30)

### Badge
- Variantes: `success`, `warning`, `error`, `info`, `admin`, `user`
- Todos no estilo glass pill

### Button
- Variantes: `primary` (cyan solid), `secondary` (glass), `ghost`, `danger`
- Tamanhos: `sm`, `md`, `lg`

---

## 9. Animações

| Elemento | Animação | Duração |
|---|---|---|
| Entrada de página | fade-in + slide-up 8px staggered | 200ms + delay por item |
| Sidebar collapse | width + opacity labels | 300ms ease |
| Botões | scale(0.97) no active | 100ms |
| Hover nos cards | border-color + box-shadow | 200ms |
| Welcome glow | pulse-glow cyan | 2s infinite |
| Typing dots | stagger bounce | 600ms |
| Mesh background | rotate/float nódulos | 8–12s linear infinite |

---

## 10. Arquivos a Criar / Modificar

### Novos arquivos
- `src/index.css` — atualizar com novos tokens CSS e imports de fontes
- `src/utils/tailwindStyles.ts` — reescrever todos os style strings com nova paleta
- `src/components/ui/GlassCard.tsx` — componente glass reutilizável
- `src/components/ui/Button.tsx` — sistema de botões
- `src/components/ui/Badge.tsx` — badges por variante
- `src/components/ui/Modal.tsx` — modal base reutilizável

### Telas a redesenhar
- `src/layouts/DashboardLayout.tsx`
- `src/pages/Sidebar/Sidebar.tsx`
- `src/pages/Login/` — novo layout Borealis
- `src/pages/Chat/` — welcome state + chat room
- `src/pages/AdminUsers/`
- `src/pages/AdminDocuments/`
- `src/pages/AdminCatalogs/`
- `src/pages/AdminTokens/`
- `src/pages/ProfileEdit/`

---

## 11. O que NÃO muda

- Lógica de autenticação e rotas (`App.tsx`, `ProtectedRoute`, `AuthContext`)
- Serviços de API (`adminApi.ts`, hooks de dados)
- Validação Zod
- Estrutura de contexto e estado de chat
- Regras de role (`allowedRoles`)
