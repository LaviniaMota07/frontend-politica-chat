export const buttonStyles = {
  primary:
    'inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-400/35 bg-gradient-to-b from-[#3268ff] to-[#2a5cff] px-5 text-sm font-bold text-white shadow-[0_12px_26px_rgba(38,92,255,0.28)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:brightness-100',
  secondary:
    'inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-bold text-slate-300 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50',
  danger:
    'inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-400/35 bg-gradient-to-b from-red-500 to-red-600 px-5 text-sm font-bold text-white shadow-[0_12px_26px_rgba(239,68,68,0.24)] transition hover:-translate-y-0.5 hover:brightness-110',
  icon:
    'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-blue-300/30 hover:bg-blue-500/10 hover:text-blue-200 disabled:cursor-not-allowed disabled:opacity-40',
  iconDanger:
    'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-red-300/30 hover:bg-red-500/10 hover:text-red-200',
};

export const formStyles = {
  input:
    'h-11 w-full rounded-xl border border-white/10 bg-[#0f1726] px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-300/55 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60',
  select:
    'h-11 rounded-xl border border-white/10 bg-[#0f1726] px-4 text-sm font-semibold text-slate-200 outline-none transition focus:border-blue-300/55 focus:ring-4 focus:ring-blue-500/10',
  label: 'flex flex-col gap-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-500',
  error: 'mt-1 text-xs font-semibold text-red-300',
};

export const modalStyles = {
  backdrop: 'fixed inset-0 z-[1000] flex items-center justify-center bg-black/65 p-4 backdrop-blur-md',
  panel:
    'w-full max-w-[520px] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#171d29] to-[#111827] text-slate-200 shadow-[0_28px_80px_rgba(0,0,0,0.55)]',
  formPanel:
    'w-full max-w-[560px] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#171d29] to-[#111827] text-slate-200 shadow-[0_28px_80px_rgba(0,0,0,0.55)]',
  header: 'flex items-start justify-between gap-5 border-b border-white/10 px-6 py-5',
  title: 'text-lg font-bold tracking-[-0.03em] text-slate-50',
  description: 'mt-1 text-sm leading-6 text-slate-400',
  close:
    'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-500 transition hover:border-white/10 hover:bg-white/[0.05] hover:text-slate-200',
  body: 'flex flex-col gap-5 px-6 py-5',
  actions: 'flex justify-end gap-3 border-t border-white/10 px-6 py-5',
  option:
    'flex cursor-pointer gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm text-slate-300 transition hover:border-blue-300/25 hover:bg-blue-500/[0.06]',
  optionText: 'flex flex-col gap-1 leading-5 [&_strong]:text-slate-100',
};

export const adminStyles = {
  page: 'flex h-screen min-h-0 w-full flex-1 overflow-y-auto bg-[#071a30] px-6 py-7 text-slate-200 max-[760px]:px-4',
  content: 'mx-auto flex w-full max-w-7xl flex-col gap-6',
  header: 'flex items-center justify-between gap-4 max-[760px]:flex-col max-[760px]:items-start',
  title: 'text-[clamp(1.7rem,3vw,2.45rem)] font-black tracking-[-0.05em] text-slate-50',
  subtitle: 'mt-2 max-w-2xl text-sm leading-6 text-slate-400',
  headerActions: 'flex flex-wrap items-center gap-3',
  statsGrid: 'grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1',
  statCard:
    'rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.22)] backdrop-blur',
  statLabel: 'block text-[0.68rem] font-black uppercase tracking-[0.13em] text-slate-500',
  statValue: 'mt-3 block text-3xl font-black tracking-[-0.05em] text-slate-50',
  section:
    'rounded-[28px] border border-white/10 bg-[#0c1628]/90 p-5 shadow-[0_22px_60px_rgba(0,0,0,0.26)]',
  sectionHeader: 'mb-5 flex items-center justify-between gap-4 max-[900px]:flex-col max-[900px]:items-start',
  sectionTitle: 'text-xl font-black tracking-[-0.04em] text-slate-50',
  filtersRow: 'flex flex-wrap items-center gap-3',
  filterInput: 'min-w-[230px]',
  tableWrapper: 'overflow-hidden rounded-2xl border border-white/10 bg-[#081221]',
  table: 'w-full border-collapse text-left text-sm',
  th:
    'border-b border-white/10 bg-white/[0.03] px-4 py-3 text-[0.68rem] font-black uppercase tracking-[0.12em] text-slate-500',
  td: 'border-b border-white/[0.06] px-4 py-4 align-middle text-slate-300',
  emptyCell: 'px-4 py-10 text-center text-sm font-semibold text-slate-500',
  userCell: 'flex flex-col gap-1',
  userName: 'font-bold text-slate-100',
  userEmail: 'text-xs text-slate-500',
  departmentBadge:
    'inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-slate-300',
  pagination: 'mt-5 flex items-center justify-between gap-3 max-[700px]:flex-col max-[700px]:items-start',
  paginationSummary: 'text-xs font-semibold text-slate-500',
  paginationActions: 'flex items-center gap-2',
  paginationButton:
    'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition hover:border-blue-300/30 hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:opacity-35',
  paginationPage:
    'inline-flex h-9 items-center rounded-xl border border-white/10 bg-white/[0.03] px-3 text-xs font-bold text-slate-300',
  badgeActive:
    'inline-flex rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.06em] text-emerald-300',
  badgeBlocked:
    'inline-flex rounded-full border border-red-300/20 bg-red-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.06em] text-red-300',
  badgeRoleAdmin:
    'inline-flex rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.06em] text-blue-200',
  badgeRoleDefault:
    'inline-flex rounded-full border border-slate-300/15 bg-slate-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.06em] text-slate-300',
  editButton:
    'inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-blue-300/20 bg-blue-500/10 px-3 text-xs font-bold text-blue-200 transition hover:bg-blue-500/15',
  formGrid: 'grid grid-cols-2 gap-4 max-[700px]:grid-cols-1',
  deleteBody: 'flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm leading-6 text-slate-300',
};

export const chatStyles = {
  page: 'flex h-screen min-h-0 flex-1 overflow-hidden bg-[#071a30] text-slate-200',
  main: 'flex min-h-0 w-full flex-1 flex-col',
  header:
    'flex items-center justify-between gap-5 border-b border-white/10 bg-[#071a30]/95 px-8 py-5 backdrop-blur max-[760px]:flex-col max-[760px]:items-start max-[760px]:px-5',
  headerMain: 'flex items-center gap-5',
  eyebrow: 'text-[0.68rem] font-black uppercase tracking-[0.18em] text-blue-300/80',
  headerTitle: 'mt-1 text-2xl font-black tracking-[-0.05em] text-slate-50',
  headerActions: 'flex items-center gap-3',
  content: 'flex min-h-0 flex-1 flex-col overflow-hidden',
  messages: 'min-h-0 flex-1 overflow-y-auto px-8 py-6 max-[760px]:px-4',
  messagesInner: 'mx-auto flex w-full max-w-4xl flex-col gap-5',
  inputShell: 'border-t border-white/10 bg-[#071a30]/95 px-8 py-5 max-[760px]:px-4',
  inputWrapper:
    'mx-auto flex max-w-4xl flex-col gap-3 rounded-[28px] border border-white/10 bg-[#0c1628] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.25)]',
  textArea:
    'min-h-12 max-h-[140px] resize-none border-0 bg-transparent text-base leading-7 text-slate-100 outline-none placeholder:text-slate-500',
  inputActions: 'flex items-center justify-between gap-3',
  sendButton:
    'inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-300/35 bg-blue-500 text-white shadow-[0_12px_28px_rgba(47,110,242,0.35)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0',
  filterStrip: 'flex flex-wrap items-center gap-2',
  filterMenu: 'relative',
  filterSummary:
    'flex h-9 cursor-pointer list-none items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs font-bold text-slate-300 transition marker:hidden hover:border-blue-300/30 hover:bg-blue-500/10 [&::-webkit-details-marker]:hidden',
  filterOptions:
    'absolute bottom-[calc(100%+8px)] left-0 z-30 flex max-h-64 min-w-64 flex-col gap-1 overflow-y-auto rounded-2xl border border-white/10 bg-[#101827] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.45)]',
  filterOption:
    'flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.05]',
};

export const sidebarStyles = {
  aside:
    'fixed left-0 top-0 z-40 flex h-screen w-[304px] flex-col border-r border-white/10 bg-[#08111f] text-slate-200 shadow-[18px_0_50px_rgba(0,0,0,0.28)] transition-[width] duration-200 max-[900px]:w-[76px]',
  collapsed: 'w-[76px]',
  topIcons: 'flex h-[76px] items-center justify-between gap-2 px-4',
  iconButton:
    'inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-blue-300/30 hover:bg-blue-500/10 hover:text-blue-200',
  brand:
    'inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-[0_12px_28px_rgba(47,110,242,0.35)]',
  content: 'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-5',
  divider: 'h-px bg-white/10',
  section: 'rounded-3xl border border-white/10 bg-white/[0.025] p-4',
  sectionHeader: 'flex items-center justify-between gap-3 text-slate-100',
  sectionTitle: 'text-sm font-black tracking-[-0.02em]',
  addButton:
    'mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-300/25 bg-blue-500/10 px-3 py-3 text-xs font-bold text-blue-200 transition hover:bg-blue-500/15',
  kicker: 'mb-3 text-[0.66rem] font-black uppercase tracking-[0.18em] text-slate-500',
  nav: 'flex flex-col gap-2',
  navLink:
    'flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-slate-400 transition hover:bg-white/[0.05] hover:text-slate-100 [&.active]:bg-blue-500/12 [&.active]:text-blue-200',
  savedEmpty:
    'flex flex-col items-center gap-3 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-center text-sm text-slate-500',
  profileCard: 'mt-auto rounded-3xl border border-white/10 bg-white/[0.035] p-4',
  profileInfo: 'flex flex-col gap-1 overflow-hidden',
  profileName: 'truncate text-sm font-black text-slate-100',
  profileEmail: 'truncate text-xs text-slate-500',
  profileLink:
    'mt-3 inline-flex items-center gap-2 rounded-xl text-xs font-bold text-blue-200 transition hover:text-blue-100',
  backdrop: 'fixed inset-0 z-30 bg-black/50 backdrop-blur-sm min-[901px]:hidden',
};

