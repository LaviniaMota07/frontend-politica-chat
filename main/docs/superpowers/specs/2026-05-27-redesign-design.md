# Redesign — Editorial Warm SaaS
**Data:** 2026-05-27  
**Status:** Aprovado  
**Direcao aprovada:** Opcao B — Editorial Warm SaaS  
**Escopo:** Todas as telas — Login, Chat, Sidebar, Admin Panels  
**Stack:** React 19 + Vite + Tailwind v4 (sem novas dependencias obrigatorias; fontes via Google Fonts; animacoes CSS-first)

---

## 1. Contexto

O sistema **Assistente de Politicas** e um chat corporativo com IA para consultar documentos de politica e normas internas. Ele atende usuarios finais no fluxo de conversa e administradores na gestao de usuarios, documentos, departamentos, sistemas e tokens.

O redesign anterior ficou visualmente carregado por excesso de dark neon, gradientes e brilho. A nova direcao busca uma experiencia mais moderna, institucional e direta: superficies claras e quentes, sidebar escura solida, acento cobre/terracota e tipografia simples. A interface deve parecer uma ferramenta de trabalho confiavel, nao uma landing page futurista.

---

## 2. Principios de Design

- **Produto antes do efeito:** remover gradientes decorativos, glows fortes e glass morphism como linguagem principal.
- **Calor institucional:** usar fundo marfim quente e acento cobre para uma sensacao humana, editorial e corporativa.
- **Contraste claro:** sidebar escura cria orientacao; area principal clara melhora leitura prolongada no chat e nas tabelas.
- **Tipografia direta:** uma familia sem serifa simples conduz toda a interface; peso, tamanho e espacamento definem hierarquia.
- **Superficies tacteis:** cards e inputs usam bordas finas, sombras discretas e fundos solidos, com poucos efeitos translucidos.
- **Movimento contido:** transicoes rapidas e funcionais, sem pulso constante ou animacoes ornamentais.

---

## 3. Fundacoes de Design

### Paleta de Cores

```css
--bg-base:      #eee8dc;  /* fundo geral marfim quente */
--bg-body:      #f5f1e8;  /* area principal */
--bg-surface:   #fffaf0;  /* cards, tabelas, bubbles */
--bg-elevated:  #ffffff;  /* modais, dropdowns */

--sidebar-bg:   #20231f;  /* navegacao escura solida */
--sidebar-soft: #2b2f2a;  /* secoes internas da sidebar */

--accent:       #a86535;  /* cobre primario */
--accent-strong:#8d4f25;  /* hover/pressed */
--accent-soft:  #efe0cf;  /* backgrounds sutis */

--text-primary:   #1f1d19;
--text-secondary: #625d54;
--text-muted:     #8a8378;
--text-inverse:   #fbf6ea;

--border-neutral: rgba(31, 29, 25, 0.12);
--border-strong:  rgba(31, 29, 25, 0.2);
```

### Tipografia

- **UI e headings:** `IBM Plex Sans` via Google Fonts.
- **Dados e tokens:** `IBM Plex Mono` via Google Fonts.
- **Racional:** substituir fontes expressivas por uma familia mais simples e direta. Headings usam a mesma familia da UI, apenas com peso `700/800`, tracking levemente negativo e tamanhos maiores.
- **Fallback:** `system-ui, sans-serif` para UI; `ui-monospace, monospace` para dados.

### Superficies

- **Card padrao:** `background: var(--bg-surface); border: 1px solid var(--border-neutral); border-radius: 20px; box-shadow: 0 18px 50px rgba(31,29,25,0.08);`
- **Painel escuro:** `background: var(--sidebar-bg); color: var(--text-inverse); border: 1px solid rgba(255,255,255,0.08);`
- **Botao primario:** fundo `--accent`, texto claro, hover `--accent-strong`, sombra curta e quente.
- **Botao secundario:** fundo transparente ou marfim, borda neutra, texto grafite.
- **Botao danger:** vermelho seco, sem glass; hover aumenta contraste.
- **Inputs:** fundo branco quente, borda neutra, focus ring cobre suave.

---

## 4. Layout & Navegacao

### Sidebar — "Editorial Rail"

- **Dimensoes:** expandida `280px`, colapsada `72px`.
- **Posicao:** `fixed`, margem `12px`, altura `calc(100dvh - 24px)`, border-radius `18px`.
- **Estilo:** painel escuro solido; sem blur como efeito central.
- **Topo:** logo compacto + nome da empresa em texto claro; sem gradiente de texto.
- **Navegacao:** itens em pills escuras com hover por preenchimento sutil; ativo usa fundo cobre e texto claro.
- **Lista de chats:** separada por bloco com borda interna; scrollbar discreta em tons neutros.
- **Perfil:** card escuro levemente elevado com avatar simples, nome, email e link "Editar perfil".
- **Collapse:** icones permanecem; labels somem; tooltip pode usar fundo escuro solido.

### DashboardLayout

- Main content com `padding-left: 304px` quando sidebar expandida.
- Background principal `var(--bg-body)` sem gradientes radiais globais.
- Conteudo com largura maxima por pagina, preservando leitura confortavel.
- Topbar global continua dispensavel; cada pagina apresenta seu titulo e acoes no proprio conteudo.
- `overflow: auto` no main para paginas administrativas e chat.

---

## 5. Tela de Login — "Editorial Access"

### Estrutura

- Full-screen `min-h-screen`, fundo marfim quente.
- Layout em duas colunas no desktop:
  - esquerda com mensagem institucional, marca e pequena lista de beneficios;
  - direita com card de login.
- Mobile empilha conteudo e card.
- Sem mesh gradient animado. Pode usar uma faixa escura lateral ou bloco editorial com borda, mas sem decoracao pesada.

### Conteudo do Card

1. Logo + nome em topo.
2. Headline: **"Acesse as politicas da sua empresa."**
3. Subtitulo: "Consulte normas, procedimentos e documentos internos em uma conversa simples."
4. Formulario:
   - Labels acima dos campos, texto direto.
   - Inputs com fundo `--bg-elevated`, borda `--border-neutral`, focus ring cobre.
   - Toggle de senha discreto, sem brilho.
5. Botao CTA full-width em cobre.
6. Link "Solicitar acesso" como texto abaixo do botao, em cobre escuro.

---

## 6. Interface de Chat

### Estado Vazio / Welcome

- Remover icone brilhante e pulso.
- Usar bloco central editorial: titulo forte, subtitulo curto e cards/chips de sugestao.
- Headline: "O que voce precisa consultar hoje?"
- Sugestoes como pills claras com borda neutra; hover usa borda cobre e fundo `--accent-soft`.
- Icone, se mantido, deve ser pequeno e contido dentro de um quadrado arredondado, sem glow.

### Mensagens

- **Assistente:**
  - Bubble em `--bg-surface`, borda neutra, raio `18px 18px 18px 6px`.
  - Avatar opcional com fundo escuro solido e icone claro.
  - Font-size confortavel para leitura; line-height generoso.
  - Fontes/documentos aparecem como chips claros com borda neutra.

- **Usuario:**
  - Bubble cobre `--accent`, texto `--text-inverse`, raio `18px 18px 6px 18px`.
  - Sem sombras coloridas.

- **Typing indicator:** tres pontos neutros com animacao curta; sem cor neon.

### Input Dock

- Painel sticky no rodape com fundo `--bg-surface`, borda neutra e sombra discreta.
- Textarea integrada, sem fundo escuro.
- Filter chips acima do input como tags compactas em marfim/cobre suave.
- Botao send quadrado-arredondado ou circular em cobre solido.

---

## 7. Admin Panels

### Estrutura Comum

Todas as paginas admin seguem `padding: 32px`, max-width `1200px`, heading em `IBM Plex Sans` com `font-weight: 800`.

### Stats Cards

- Cards claros com borda neutra e sombra baixa.
- Numero grande em grafite, sem efeito de cor.
- Label em uppercase pequeno, tom `--text-muted`.
- Hover apenas aumenta borda e desloca `translateY(-1px)`.

### Tabelas

- Wrapper claro com borda neutra.
- Header row em `#ebe3d6` ou `--accent-soft`, sem transparencia escura.
- Body rows com hover `rgba(168,101,53,0.06)`.
- Separadores `border-bottom: 1px solid var(--border-neutral)`.
- Badges:
  - Admin: fundo cobre suave, texto cobre escuro.
  - Blocked: fundo vermelho seco suave, texto vermelho escuro.
  - Active: fundo verde suave, texto verde escuro.
- Paginacao com botoes claros, borda neutra e estado ativo cobre.

### Modais

- Backdrop escuro translucido simples: `rgba(31,29,25,0.52)`.
- Panel claro, borda neutra, raio `22px`.
- Stripe superior opcional em cobre com 3px.
- Acoes: primario cobre, secundario neutro, danger vermelho.

### AdminDocuments

- Cards de documento claros.
- Status dot solido: synced verde, pending amber, error vermelho.
- Pending pode ter animacao leve apenas se necessario para indicar processamento.

### AdminTokens

- Valores de token em `IBM Plex Mono`, truncados com copy-on-click.
- Chips e codigos usam fundo marfim mais escuro, nao fundo neon.

---

## 8. Componentes Compartilhados

### SurfaceCard

- Substitui o conceito de `GlassCard`.
- Props sugeridas: `tone` (`light`, `dark`, `accentSoft`), `interactive`, `className`.
- Aplica fundo solido, borda, radius e sombra de acordo com o tom.

### Button

- Variantes: `primary`, `secondary`, `ghost`, `danger`.
- Primario cobre solido.
- Secundario claro com borda.
- Ghost sem borda, hover neutro.
- Danger vermelho seco.

### Badge

- Variantes: `success`, `warning`, `error`, `info`, `admin`, `user`.
- Todos em estilo pill solido/claro, sem blur.

### ModalBase

- Reutilizavel com `children`, `title`, `description`, `onClose`.
- Aplica backdrop simples e painel claro.

---

## 9. Animacoes

- **Entrada de pagina:** fade-in + slide-up `6px`, `180ms`.
- **Sidebar collapse:** `width` + opacidade dos labels, `240ms ease`.
- **Botoes:** `translateY(-1px)` no hover e `scale(0.98)` no active.
- **Cards:** border-color + shadow, `160ms`.
- **Typing dots:** opacity/translate discreto, `600ms`.
- **Sem:** glow pulsante, mesh animado, gradiente radial global ou sombras coloridas permanentes.

---

## 10. Arquivos a Criar / Modificar

### Arquivos base

- `src/index.css` — atualizar tokens CSS, imports de `IBM Plex Sans` / `IBM Plex Mono`, body e scrollbar.
- `src/utils/tailwindStyles.ts` — reescrever style strings para a paleta Editorial Warm SaaS.

### Componentes compartilhados

- `src/components/ui/SurfaceCard.tsx` — card solido reutilizavel.
- `src/components/ui/Button.tsx` — sistema de botoes.
- `src/components/ui/Badge.tsx` — badges por variante.
- `src/components/ui/Modal.tsx` — modal base reutilizavel.

### Telas a redesenhar

- `src/layouts/DashboardLayout.tsx`
- `src/pages/Sidebar/Sidebar.tsx`
- `src/pages/Login/`
- `src/pages/Chat/`
- `src/pages/AdminUsers/`
- `src/pages/AdminDocuments/`
- `src/pages/AdminCatalogs/`
- `src/pages/AdminTokens/`
- `src/pages/ProfileEdit/`

---

## 11. O que NAO muda

- Logica de autenticacao e rotas (`App.tsx`, `ProtectedRoute`, `AuthContext`).
- Servicos de API (`adminApi.ts`, hooks de dados).
- Validacao Zod.
- Estrutura de contexto e estado de chat.
- Regras de role (`allowedRoles`).
- Contratos de dados consumidos por componentes existentes.
