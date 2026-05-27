import type { ReactNode } from 'react';

interface ChatEmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function ChatEmptyState({
  icon,
  title,
  description,
}: ChatEmptyStateProps) {
  return (
    <div className="m-auto flex max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-3xl border border-blue-300/20 bg-blue-500/15 text-blue-200 shadow-[0_18px_42px_rgba(47,110,242,0.2)]" aria-hidden="true">
        {icon}
      </div>
      <h2 className="text-3xl font-black tracking-[-0.05em] text-slate-50">{title}</h2>
      <p className="mt-3 text-base leading-7 text-slate-400">{description}</p>
    </div>
  );
}
