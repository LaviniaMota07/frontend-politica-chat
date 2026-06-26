import type { ReactNode } from 'react';
import { adminStyles } from '../../utils/tailwindStyles';

interface AdminTableProps {
  columns: ReactNode[];
  colSpan?: number;
  isLoading?: boolean;
  loadingMessage?: string;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
}

export function AdminTable({
  columns,
  colSpan = columns.length,
  isLoading = false,
  loadingMessage = 'Carregando...',
  isEmpty = false,
  emptyMessage = 'Nenhum registro encontrado.',
  children,
}: AdminTableProps) {
  return (
    <div className={adminStyles.tableWrapper}>
      <table className={adminStyles.table}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th className={adminStyles.th} key={String(column) || index}>
                {column}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading && (
            <tr>
              <td className={adminStyles.emptyCell} colSpan={colSpan}>
                {loadingMessage}
              </td>
            </tr>
          )}

          {!isLoading && children}

          {!isLoading && isEmpty && (
            <tr>
              <td className={adminStyles.emptyCell} colSpan={colSpan}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
