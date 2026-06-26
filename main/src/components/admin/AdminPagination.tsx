import { ChevronLeft, ChevronRight } from 'lucide-react';
import { adminStyles } from '../../utils/tailwindStyles';

interface AdminPaginationProps {
  currentPage: number;
  totalItems: number;
  perPage: number;
  itemLabel: string;
  onChange: (page: number) => void;
  ariaLabel?: string;
}

export function AdminPagination({
  currentPage,
  totalItems,
  perPage,
  itemLabel,
  onChange,
  ariaLabel = 'Paginação',
}: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const pageStart = (currentPage - 1) * perPage;
  const pageEnd = pageStart + perPage;
  const firstVisibleItem = totalItems === 0 ? 0 : pageStart + 1;
  const lastVisibleItem = Math.min(pageEnd, totalItems);

  return (
    <div className={adminStyles.pagination} aria-label={ariaLabel}>
      <span className={adminStyles.paginationSummary}>
        Mostrando {firstVisibleItem}-{lastVisibleItem} de {totalItems} {itemLabel}
      </span>

      <div className={adminStyles.paginationActions}>
        <button
          type="button"
          className={adminStyles.paginationButton}
          onClick={() => onChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Página anterior"
          title="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>

        <span className={adminStyles.paginationPage}>
          Página {currentPage} de {totalPages}
        </span>

        <button
          type="button"
          className={adminStyles.paginationButton}
          onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Próxima página"
          title="Próxima página"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
