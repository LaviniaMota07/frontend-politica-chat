import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/classNames';
import { Button } from './button';

interface ModalProps {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  onClose: () => void;
  titleId?: string;
  className?: string;
}

export function Modal({
  title,
  description,
  children,
  actions,
  onClose,
  titleId = 'modal-title',
  className,
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(31,29,25,0.52)] p-4">
      <section
        className={cn(
          'w-full max-w-[560px] overflow-hidden rounded-[22px] border border-[var(--border-neutral)] border-t-[3px] border-t-[var(--accent)] bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-[0_28px_80px_rgba(31,29,25,0.24)]',
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="flex items-start justify-between gap-5 border-b border-[var(--border-neutral)] px-6 py-5">
          <div>
            <h2 id={titleId} className="font-[var(--heading)] text-xl font-extrabold tracking-[-0.035em] text-[var(--text-primary)]">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>}
          </div>

          <Button variant="ghost" size="sm" className="h-9 w-9 px-0" onClick={onClose} aria-label="Fechar">
            <X size={16} strokeWidth={1.8} />
          </Button>
        </header>

        <div className="px-6 py-5">{children}</div>
        {actions && <footer className="flex justify-end gap-3 border-t border-[var(--border-neutral)] px-6 py-5">{actions}</footer>}
      </section>
    </div>
  );
}
