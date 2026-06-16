const focusRing = 'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(168,101,53,0.16)]';

export const buttonStyles = {
  primary:
    `inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--accent)] bg-[var(--accent)] px-5 text-sm font-bold text-[var(--text-inverse)] shadow-[0_10px_24px_rgba(168,101,53,0.18)] transition duration-200 hover:-translate-y-px hover:bg-[var(--accent-strong)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${focusRing}`,
  secondary:
    `inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] px-5 text-sm font-bold text-[var(--text-primary)] transition duration-200 hover:-translate-y-px hover:border-[var(--border-strong)] hover:bg-[var(--accent-soft)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${focusRing}`,
  danger:
    `inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 text-sm font-bold text-red-800 transition duration-200 hover:-translate-y-px hover:border-red-300 hover:bg-red-100 active:scale-[0.98] ${focusRing}`,
  icon:
    `inline-flex size-9 items-center justify-center rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition duration-200 hover:-translate-y-px hover:border-[var(--border-strong)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`,
  iconDanger:
    `inline-flex size-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-800 transition duration-200 hover:-translate-y-px hover:border-red-300 hover:bg-red-100 ${focusRing}`,
};

export const formStyles = {
  input:
    `h-11 w-full rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-elevated)] px-4 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(168,101,53,0.12)] disabled:cursor-not-allowed disabled:opacity-60`,
  select:
    `h-11 rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-elevated)] px-4 text-sm font-semibold text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(168,101,53,0.12)]`,
  label: 'flex flex-col gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)]',
  error: 'mt-1 text-xs font-bold text-red-700',
};

export const modalStyles = {
  backdrop:
    'fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(31,29,25,0.52)] p-4',
  panel:
    'w-full max-w-[520px] overflow-hidden rounded-[22px] border border-[var(--border-neutral)] border-t-[3px] border-t-[var(--accent)] bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-[0_28px_80px_rgba(31,29,25,0.24)]',
  formPanel:
    'w-full max-w-[560px] overflow-hidden rounded-[22px] border border-[var(--border-neutral)] border-t-[3px] border-t-[var(--accent)] bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-[0_28px_80px_rgba(31,29,25,0.24)]',
  header: 'flex items-start justify-between gap-5 border-b border-[var(--border-neutral)] px-6 py-5',
  title: 'font-[var(--heading)] text-xl font-extrabold tracking-[-0.035em] text-[var(--text-primary)]',
  description: 'mt-1 text-sm leading-6 text-[var(--text-secondary)]',
  close:
    `inline-flex size-8 items-center justify-center rounded-lg border border-transparent text-[var(--text-secondary)] transition hover:border-[var(--border-neutral)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)] ${focusRing}`,
  body: 'flex flex-col gap-5 px-6 py-5',
  actions: 'flex justify-end gap-3 border-t border-[var(--border-neutral)] px-6 py-5',
  option:
    'flex cursor-pointer gap-3 rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-4 text-sm text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]',
  optionText: 'flex flex-col gap-1 leading-5 [&_strong]:text-[var(--text-primary)]',
};

export const adminStyles = {
  page:
    'flex h-full min-h-dvh w-full flex-1 overflow-y-auto bg-[var(--bg-body)] px-8 py-8 text-[var(--text-primary)] max-[760px]:px-4',
  content: 'mx-auto flex w-full max-w-[1200px] flex-col gap-6 animate-fade-slide-up',
  header: 'flex items-center justify-between gap-4 max-[760px]:flex-col max-[760px]:items-start',
  title: 'font-[var(--heading)] text-[clamp(1.9rem,3vw,2.45rem)] font-extrabold tracking-[-0.055em] text-[var(--text-primary)]',
  subtitle: 'mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]',
  headerActions: 'flex flex-wrap items-center gap-3',
  statsGrid: 'grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1',
  statCard:
    'group flex items-start justify-between gap-4 rounded-[20px] border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-5 shadow-[0_18px_50px_rgba(31,29,25,0.08)] transition duration-200 hover:-translate-y-px hover:border-[var(--border-strong)]',
  statLabel: 'block text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]',
  statValue: 'mt-3 block font-[var(--heading)] text-4xl font-extrabold tracking-[-0.06em] text-[var(--text-primary)]',
  section:
    'rounded-[20px] border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-5 shadow-[0_18px_50px_rgba(31,29,25,0.08)]',
  sectionHeader: 'mb-5 flex items-center justify-between gap-4 max-[900px]:flex-col max-[900px]:items-start',
  sectionTitle: 'font-[var(--heading)] text-xl font-extrabold tracking-[-0.035em] text-[var(--text-primary)]',
  filtersRow: 'flex flex-wrap items-center gap-3',
  filterInput: 'min-w-[230px]',
  tableWrapper:
    'overflow-hidden rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-elevated)]',
  table: 'w-full border-collapse text-left text-sm',
  th:
    'border-b border-[var(--border-neutral)] bg-[#ebe3d6] px-4 py-3 text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[var(--text-secondary)]',
  td: 'border-b border-[var(--border-neutral)] px-4 py-4 align-middle text-[var(--text-secondary)] transition group-hover:bg-[rgba(168,101,53,0.06)]',
  emptyCell: 'px-4 py-10 text-center text-sm font-semibold text-[var(--text-secondary)]',
  userCell: 'flex flex-col gap-1',
  userName: 'font-bold text-[var(--text-primary)]',
  userEmail: 'text-xs text-[var(--text-secondary)]',
  departmentBadge:
    'inline-flex rounded-full border border-[var(--border-neutral)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold text-[var(--accent-strong)]',
  pagination: 'mt-5 flex items-center justify-between gap-3 max-[700px]:flex-col max-[700px]:items-start',
  paginationSummary: 'text-xs font-semibold text-[var(--text-secondary)]',
  paginationActions: 'flex items-center gap-2',
  paginationButton:
    `inline-flex size-9 items-center justify-center rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-35 ${focusRing}`,
  paginationPage:
    'inline-flex h-9 items-center rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] px-3 text-xs font-bold text-[var(--text-primary)]',
  badgeActive:
    'inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.06em] text-emerald-800',
  badgeBlocked:
    'inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.06em] text-red-800',
  badgeRoleAdmin:
    'inline-flex rounded-full border border-[var(--border-neutral)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold uppercase tracking-[0.06em] text-[var(--accent-strong)]',
  badgeRoleDefault:
    'inline-flex rounded-full border border-[var(--border-neutral)] bg-[#ebe3d6] px-3 py-1 text-xs font-bold uppercase tracking-[0.06em] text-[var(--text-secondary)]',
  editButton:
    `inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] px-3 text-xs font-bold text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] ${focusRing}`,
  formGrid: 'grid grid-cols-2 gap-4 max-[700px]:grid-cols-1',
  deleteBody: 'flex flex-col gap-3 rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-body)] p-4 text-sm leading-6 text-[var(--text-secondary)]',
  monoValue: 'font-[var(--mono)] text-xs font-bold tracking-[-0.03em] text-[var(--text-primary)]',
  statusDotSynced: 'size-2.5 rounded-full bg-emerald-600',
  statusDotPending: 'size-2.5 animate-pulse rounded-full bg-amber-500',
  statusDotError: 'size-2.5 rounded-full bg-red-600',
};

export const chatStyles = {
  page:
    'flex h-full min-h-dvh flex-1 overflow-hidden bg-[var(--bg-body)] text-[var(--text-primary)]',
  main: 'flex min-h-0 w-full flex-1 flex-col',
  header:
    'flex items-center justify-between gap-5 border-b border-[var(--border-neutral)] bg-[var(--bg-surface)] px-8 py-5 max-[760px]:flex-col max-[760px]:items-start max-[760px]:px-5',
  headerMain: 'flex items-center gap-5',
  eyebrow: 'text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-strong)]',
  headerTitle: 'mt-1 font-[var(--heading)] text-2xl font-extrabold tracking-[-0.045em] text-[var(--text-primary)]',
  headerActions: 'flex items-center gap-3',
  content: 'flex min-h-0 flex-1 flex-col overflow-hidden pb-[calc(var(--chat-input-height,220px)+0.75rem)]',
  messages: 'min-h-0 flex-1 overflow-y-auto px-8 py-6 max-[760px]:px-4',
  messagesInner: 'mx-auto flex w-full max-w-4xl flex-col gap-5',
  inputShell: 'fixed bottom-0 left-[344px] right-0 z-30 bg-[var(--bg-body)] px-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 max-[900px]:left-0 max-[760px]:px-4',
  inputWrapper:
    'mx-auto flex max-w-4xl flex-col gap-3 rounded-[20px] border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-4 shadow-[0_18px_50px_rgba(31,29,25,0.1)]',
  textArea:
    'min-h-12 max-h-[140px] resize-none border-0 bg-transparent text-base leading-7 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]',
  inputActions: 'flex items-center justify-between gap-3',
  sendButton:
    `inline-flex size-12 items-center justify-center rounded-2xl border border-[var(--accent)] bg-[var(--accent)] text-[var(--text-inverse)] shadow-[0_10px_24px_rgba(168,101,53,0.2)] transition duration-200 hover:-translate-y-px hover:bg-[var(--accent-strong)] active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 ${focusRing}`,
  filterStrip: 'flex flex-wrap items-center gap-2',
  filterMenu: 'relative',
  filterSummary:
    `flex h-9 cursor-pointer list-none items-center gap-2 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-body)] px-3 text-xs font-bold text-[var(--text-secondary)] transition marker:hidden hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)] [&::-webkit-details-marker]:hidden ${focusRing}`,
  filterOptions:
    'absolute bottom-[calc(100%+8px)] left-0 z-30 flex max-h-64 min-w-64 flex-col gap-1 overflow-y-auto rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-2 shadow-[0_24px_70px_rgba(31,29,25,0.18)]',
  filterOption:
    'flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]',
};

export const sidebarStyles = {
  aside:
    'fixed left-3 top-3 z-40 flex h-[calc(100dvh-24px)] w-[320px] flex-col overflow-hidden rounded-[18px] border border-white/10 bg-[var(--sidebar-bg)] text-[var(--text-inverse)] shadow-[18px_0_50px_rgba(31,29,25,0.2)]',
  collapsed: 'w-[72px]',
  topIcons: 'flex min-h-[76px] items-center justify-between gap-2 px-3',
  iconButton:
    'inline-flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[var(--text-inverse)]/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-[var(--text-inverse)]',
  brand:
    'inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--text-inverse)]',
  brandText: 'min-w-0 flex-1 overflow-hidden',
  brandName:
    'block truncate font-[var(--heading)] text-sm font-extrabold tracking-[-0.035em] text-[var(--text-inverse)]',
  brandCaption: 'block truncate text-[0.67rem] font-bold uppercase tracking-[0.12em] text-[var(--text-inverse)]/45',
  content: 'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 pb-4',
  divider: 'h-px bg-white/10',
  section: 'rounded-[1.25rem] border border-white/10 bg-[var(--sidebar-soft)] p-3',
  sectionHeader: 'flex items-center justify-between gap-3 text-[var(--text-inverse)]',
  sectionTitle: 'text-sm font-bold tracking-[-0.02em] text-white',
  newChatButton:
    `flex w-full items-center gap-2 rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-bold text-[var(--text-inverse)] transition duration-200 hover:bg-[var(--accent-strong)] active:scale-[0.98] ${focusRing}`,
  addButton:
    'mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-3 text-xs font-bold text-[var(--text-inverse)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)]',
  kicker: 'mb-3 text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[var(--text-inverse)]/42',
  nav: 'flex flex-col gap-2',
  navLink:
    'flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-[var(--text-inverse)]/68 transition hover:bg-white/[0.06] hover:text-[var(--text-inverse)] [&.active]:bg-[var(--accent)] [&.active]:text-[var(--text-inverse)]',
  savedEmpty:
    'flex flex-col items-center gap-3 rounded-[1.25rem] border border-dashed border-white/12 bg-white/[0.03] p-5 text-center text-sm text-[var(--text-inverse)]/58',
  profileCard: 'mt-auto rounded-[1.25rem] border border-white/10 bg-white/[0.05] p-4',
  profileInfo: 'flex flex-col gap-1 overflow-hidden',
  profileName: 'truncate text-sm font-bold text-[var(--text-inverse)]',
  profileEmail: 'truncate text-xs text-[var(--text-inverse)]/55',
  profileLink:
    'mt-3 inline-flex items-center gap-2 rounded-xl text-xs font-bold text-[var(--accent-soft)] transition hover:text-[var(--text-inverse)]',
  logoutButton:
    'mt-6 flex w-fit items-center gap-2 rounded-xl text-xs font-bold text-[var(--text-inverse)]/60 transition hover:text-[var(--text-inverse)]',
  backdrop: 'fixed inset-0 z-30 bg-[rgba(31,29,25,0.45)] min-[901px]:hidden',
};
