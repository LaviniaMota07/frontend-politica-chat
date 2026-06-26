import type { ReactNode } from 'react';

interface ChatEmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  suggestions?: string[];
}

export function ChatEmptyState({
  icon,
  title,
  description,
  suggestions = [],
}: ChatEmptyStateProps) {
  return (
    <div className="m-auto flex max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-[18px] border border-[var(--border-neutral)] bg-[var(--accent-soft)] text-[var(--accent-strong)]" aria-hidden="true">
        {icon}
      </div>
      <h2 className="font-[var(--heading)] text-[clamp(1.85rem,3.5vw,2.4rem)] font-extrabold tracking-[-0.05em] text-[var(--text-primary)]">
        {title}
      </h2>
      <p className="mt-3 max-w-lg text-base leading-7 text-[var(--text-secondary)]">{description}</p>
      {suggestions.length > 0 && (
        <div className="mt-7 flex flex-wrap justify-center gap-2" aria-label="Sugestões de consulta">
          {suggestions.map((suggestion) => (
            <span
              key={suggestion}
              className="cursor-default rounded-full border border-[var(--border-neutral)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]"
            >
              {suggestion}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
