import type { FormEventHandler, ReactNode } from 'react';
import { modalStyles } from '../../utils/tailwindStyles';

interface AdminModalProps {
  open: boolean;
  title: ReactNode;
  titleId: string;
  description?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  actions: ReactNode;
  as?: 'section' | 'form';
  onSubmit?: FormEventHandler<HTMLFormElement>;
  panelClassName?: string;
}

export function AdminModal({
  open,
  title,
  titleId,
  description,
  onClose,
  children,
  actions,
  as = 'section',
  onSubmit,
  panelClassName = modalStyles.formPanel,
}: AdminModalProps) {
  if (!open) {
    return null;
  }

  const header = (
    <header className={modalStyles.header}>
      <div>
        <h2 id={titleId} className={modalStyles.title}>{title}</h2>
        {description && <p className={modalStyles.description}>{description}</p>}
      </div>

      <button
        type="button"
        className={modalStyles.close}
        onClick={onClose}
        aria-label="Fechar"
      >
        x
      </button>
    </header>
  );

  const content = (
    <>
      {header}
      {children}
      <footer className={modalStyles.actions}>{actions}</footer>
    </>
  );

  return (
    <div className={modalStyles.backdrop} role="presentation">
      {as === 'form' ? (
        <form
          className={panelClassName}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onSubmit={onSubmit}
        >
          {content}
        </form>
      ) : (
        <section
          className={panelClassName}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          {content}
        </section>
      )}
    </div>
  );
}
