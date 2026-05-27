# AI Observatory Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved AI Observatory redesign across login, dashboard navigation, chat, profile, and admin screens without changing authentication, routing, API contracts, or chat behavior.

**Architecture:** Keep the existing React/Vite/Tailwind v4 structure and move the visual system into global CSS variables, centralized class exports, and small reusable UI primitives. Existing feature components continue to own data fetching and behavior; the redesign replaces presentation and shared surfaces.

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind CSS v4, lucide-react, CSS custom properties, CSS-only animations.

---

## File Map

- Modify `src/index.css`: font imports, tokens, base background, scrollbar, keyframes, utility classes.
- Modify `src/utils/tailwindStyles.ts`: migrate existing exported style groups to AI Observatory classes while preserving export names.
- Create `src/components/ui/GlassCard.tsx`: reusable glass container.
- Create `src/components/ui/Button.tsx`: reusable button primitive for new or gradually migrated UI.
- Create `src/components/ui/Badge.tsx`: reusable glass badge primitive.
- Create `src/components/ui/Modal.tsx`: reusable modal shell for future migrations; existing modalStyles remain compatible.
- Modify `src/layouts/DashboardLayout.tsx`: floating-sidebar layout and scroll ownership.
- Modify `src/pages/Sidebar/Sidebar.tsx`: glass rail visual treatment and cyan accents.
- Modify `src/pages/Login/Login.tsx`: Borealis centered login.
- Modify `src/pages/Chat/components/*` and `src/pages/Chat/Chat*.tsx`: welcome state, message bubbles, source pills, typing indicator, input dock.
- Modify `src/components/filterChat/Index.tsx`: filter dropdown styling to match the new input dock.
- Modify `src/components/admin/*`: shared admin table/stats/modal/pagination styling.
- Modify `src/pages/AdminUsers/*`, `src/pages/AdminDocuments/AdminDocuments.tsx`, `src/pages/AdminCatalogs/AdminCatalogs.tsx`, `src/pages/AdminTokens/AdminTokens.tsx`: use the new shared admin surface classes.
- Modify `src/pages/ProfileEdit/ProfileEdit.tsx`: align profile cards and password modal with glass system.

---

## Task 1: Global Design Tokens

**Files:**
- Modify: `src/index.css`

- [ ] Replace current system font tokens with Google Font imports and AI Observatory CSS variables:

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=JetBrains+Mono:wght@500;700&family=Syne:wght@600;700;800&display=swap');
@import "tailwindcss";

:root {
  --sans: 'DM Sans', system-ui, sans-serif;
  --heading: 'Syne', 'DM Sans', system-ui, sans-serif;
  --mono: 'JetBrains Mono', ui-monospace, monospace;
  --bg-base: #050d1a;
  --bg-body: #07121f;
  --bg-surface: #0d1b2f;
  --bg-elevated: #0f2040;
  --accent: #00d4aa;
  --accent-glow: #00fff2;
  --accent-muted: rgba(0, 212, 170, 0.12);
  --text-primary: #eef2f7;
  --text-secondary: #7a9ab8;
  --text-muted: #3d5c78;
  --border-cyan: rgba(0, 212, 170, 0.12);
  --border-neutral: rgba(255, 255, 255, 0.06);
  --text: var(--text-secondary);
  --text-h: var(--text-primary);
  --bg: var(--bg-body);
}
```

- [ ] Change `body` to allow page-level scrolling and apply the layered dark background:

```css
body {
  margin: 0;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(0, 212, 170, 0.12), transparent 34rem),
    radial-gradient(circle at bottom right, rgba(0, 122, 204, 0.1), transparent 30rem),
    var(--bg-body);
  color: var(--text);
  font-family: var(--sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

- [ ] Add CSS animations and utilities used by the redesign:

```css
@keyframes borealis-float {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(2rem, -1.5rem, 0) scale(1.08); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 rgba(0, 212, 170, 0); }
  50% { box-shadow: 0 0 36px rgba(0, 212, 170, 0.35); }
}

.animate-borealis { animation: borealis-float 10s ease-in-out infinite; }
.animate-pulse-glow { animation: pulse-glow 2.4s ease-in-out infinite; }
.glass-panel {
  background: rgba(13, 27, 47, 0.72);
  border: 1px solid var(--border-cyan);
  backdrop-filter: blur(18px);
}
```

- [ ] Run `npm run build` after this task to catch CSS/Tailwind syntax errors.

---

## Task 2: UI Primitives

**Files:**
- Create: `src/components/ui/GlassCard.tsx`
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/Modal.tsx`

- [ ] Add `GlassCard` with `hover`, `accent`, and `className` props:

```tsx
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../../utils/classNames';

interface GlassCardProps extends ComponentPropsWithoutRef<'div'> {
  hover?: boolean;
  accent?: boolean;
}

export function GlassCard({ hover = false, accent = false, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-[1.25rem] border bg-[rgba(13,27,47,0.72)] shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-[18px]',
        accent ? 'border-[rgba(0,212,170,0.28)]' : 'border-[rgba(0,212,170,0.12)]',
        hover && 'transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(0,212,170,0.34)] hover:shadow-[0_24px_80px_rgba(0,212,170,0.1)]',
        className,
      )}
      {...props}
    />
  );
}
```

- [ ] Add `Button` variants `primary`, `secondary`, `ghost`, `danger` and sizes `sm`, `md`, `lg`.
- [ ] Add `Badge` variants `success`, `warning`, `error`, `info`, `admin`, `user`.
- [ ] Add `Modal` shell with backdrop blur, close button, `title`, `description`, `children`, `actions`.
- [ ] Keep these primitives additive; do not migrate every callsite in this task.

---

## Task 3: Central Style Exports

**Files:**
- Modify: `src/utils/tailwindStyles.ts`

- [ ] Preserve all existing export object names: `buttonStyles`, `formStyles`, `modalStyles`, `adminStyles`, `chatStyles`, `sidebarStyles`.
- [ ] Replace blue classes with cyan-teal classes and CSS-variable-backed arbitrary values.
- [ ] Update buttons:

```ts
primary:
  'inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[rgba(0,212,170,0.45)] bg-[#00d4aa] px-5 text-sm font-black text-[#050d1a] shadow-[0_0_24px_rgba(0,212,170,0.28)] transition duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0',
```

- [ ] Update form inputs/selects to `bg-white/[0.04]`, `border-white/[0.08]`, focus `border-[#00d4aa]/60`, and cyan focus ring.
- [ ] Update modal styles to use `bg-[rgba(15,32,64,0.86)]`, `backdrop-blur-[32px]`, and cyan accent stripe through `before:` or `border-t-2 border-t-[#00d4aa]`.
- [ ] Update admin styles to max-width `1200px`, glass sections/tables, cyan headers, cyan admin badge, mono token utility.
- [ ] Update chat styles to sticky/floating input dock, glass bubbles, cyan filters, and content backgrounds.
- [ ] Update sidebar styles to fixed glass rail with `left-3 top-3 h-[calc(100dvh-24px)] w-[280px] rounded-[1rem]`.

---

## Task 4: Dashboard Layout and Sidebar

**Files:**
- Modify: `src/layouts/DashboardLayout.tsx`
- Modify: `src/pages/Sidebar/Sidebar.tsx`
- Modify: `src/pages/Sidebar/components/chat/Chat.tsx`

- [ ] Update `DashboardLayout` wrapper:

```tsx
<div className="min-h-dvh w-full overflow-hidden bg-[var(--bg-body)]">
  <Sidebar />
  <main className="h-dvh min-w-0 overflow-y-auto pl-[304px] pr-3 py-3 transition-[padding] duration-300 max-[900px]:pl-[88px] max-[640px]:pl-[76px]">
    <div className="min-h-full overflow-hidden rounded-[1.25rem] border border-white/[0.04] bg-[rgba(5,13,26,0.24)]">
      <Outlet />
    </div>
  </main>
</div>
```

- [ ] In `Sidebar`, keep collapse logic and data fetching unchanged.
- [ ] Add visible brand text when expanded: `Assistente de Políticas` with cyan-to-white gradient.
- [ ] Keep icon-only collapsed state functional and accessible with `aria-label`/`title` on nav links.
- [ ] Replace policy upload modal blue classes with cyan classes or shared modal styles.
- [ ] Update chat menu list items in `Sidebar/components/chat/Chat.tsx` to glass pills with cyan hover.

---

## Task 5: Borealis Login

**Files:**
- Modify: `src/pages/Login/Login.tsx`

- [ ] Keep hooks, submit handlers, request-access modal behavior, and route navigation unchanged.
- [ ] Replace split layout with centered full-screen card.
- [ ] Add three absolute animated gradient blobs:

```tsx
<div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#00d4aa]/15 blur-3xl animate-borealis" />
<div className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 rounded-full bg-[#007acc]/12 blur-3xl animate-borealis [animation-delay:1.4s]" />
<div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#00fff2]/10 blur-3xl animate-borealis [animation-delay:2.2s]" />
```

- [ ] Use headline `Consulte. Entenda. Decida.` and subtitle from the spec.
- [ ] Apply cyan button and formStyles to login/request-access actions.
- [ ] Preserve error display from react-hook-form.

---

## Task 6: Observatory Chat

**Files:**
- Modify: `src/pages/Chat/Chat.tsx`
- Modify: `src/pages/Chat/ChatRoom.tsx`
- Modify: `src/pages/Chat/components/ChatHeader.tsx`
- Modify: `src/pages/Chat/components/ChatWelcome.tsx`
- Modify: `src/pages/Chat/components/ChatEmptyState.tsx`
- Modify: `src/pages/Chat/components/ChatMessages.tsx`
- Modify: `src/pages/Chat/components/ChatMessageBubble.tsx`
- Modify: `src/pages/Chat/components/ChatInput.tsx`
- Modify: `src/components/filterChat/Index.tsx`

- [ ] Update empty state to headline `O que você precisa consultar hoje?`, cyan glow icon, and three suggestion chips.
- [ ] Keep suggestion chips presentational unless wiring them to input can be done with a small callback prop.
- [ ] Update `ChatMessageBubble`:
  - Assistant bubble: glass, `rounded-[18px_18px_18px_6px]`, cyan border.
  - User bubble: `bg-[rgba(0,212,170,0.12)]`, `rounded-[18px_18px_6px_18px]`, cyan border.
  - Source pills: add `FileText` icon and cyan glass pill styling.
  - Processing state: keep pulse but use cyan dots if possible.
- [ ] Update typing indicator in `ChatRoom` from blue dots to cyan dots.
- [ ] Update input dock through `chatStyles.inputShell`, `inputWrapper`, `sendButton`, and filter styles.

---

## Task 7: Admin Shared Surfaces

**Files:**
- Modify: `src/components/admin/AdminStatsGrid.tsx`
- Modify: `src/components/admin/AdminTable.tsx`
- Modify: `src/components/admin/AdminPagination.tsx`
- Modify: `src/components/admin/AdminModal.tsx`
- Modify: `src/pages/AdminUsers/components/UserRoleBadge.tsx`
- Modify: `src/pages/AdminUsers/components/UserStatusBadge.tsx`

- [ ] Prefer class changes via `adminStyles`; keep component props and behavior stable.
- [ ] Update stats cards so number typography uses `font-heading`, large size, and hover glass glow.
- [ ] Update table header to `bg-[rgba(0,212,170,0.05)]`, uppercase muted text, and row hover.
- [ ] Update pagination to compact glass pill controls.
- [ ] Replace modal close text `x` in `AdminModal` with a lucide `X` icon if imports remain lightweight.
- [ ] Keep user badge components consuming `adminStyles` so all pages update consistently.

---

## Task 8: Page-Level Admin and Profile Polish

**Files:**
- Modify: `src/pages/AdminUsers/AdminUsers.tsx`
- Modify: `src/pages/AdminDocuments/AdminDocuments.tsx`
- Modify: `src/pages/AdminCatalogs/AdminCatalogs.tsx`
- Modify: `src/pages/AdminTokens/AdminTokens.tsx`
- Modify: `src/pages/ProfileEdit/ProfileEdit.tsx`

- [ ] Replace remaining hardcoded blue utility classes with cyan equivalents.
- [ ] Ensure admin headings use the shared `adminStyles.title` and subtitles use `adminStyles.subtitle`.
- [ ] In `AdminDocuments`, add status dot classes for synced/pending/error states where status is already rendered.
- [ ] In `AdminTokens`, apply mono font styling to token/key previews using `font-[var(--mono)]` or `adminStyles.monoValue`.
- [ ] In `ProfileEdit`, replace local blue cards/buttons with the new glass/cyan classes while keeping form state unchanged.

---

## Task 9: Verification

**Files:**
- Verify the entire app build.

- [ ] Run `npm run build`.
- [ ] Run `npm run lint`.
- [ ] Use IDE diagnostics on changed files with `ReadLints`.
- [ ] If a dev server is available or can be started safely, visually inspect:
  - `/login`
  - `/chat`
  - `/admin/users`
  - `/admin/documents`
  - `/admin/departments`
  - `/admin/systems`
  - `/admin/tokens`
  - `/profile/edit`
- [ ] Fix any TypeScript, lint, or obvious visual regressions from the changed files.

---

## Self-Review

- Spec coverage: tokens, typography, glass surfaces, sidebar, login, chat, admin, shared components, profile, and verification are covered.
- Scope: one visual redesign implementation; no backend/API/auth changes.
- Compatibility: existing style export names remain stable, reducing callsite breakage.
- Commit policy: no commits are included because this session has not been explicitly asked to commit.
