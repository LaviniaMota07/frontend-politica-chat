import type { User } from '../../../types/user';
import { UserRoleBadge } from './UserRoleBadge';
import { UserStatusBadge } from './UserStatusBadge';
import { AdminTable } from '../../../components/admin/AdminTable';
import { adminStyles } from '../../../utils/tailwindStyles';

interface UsersTableProps {
  users: User[];
  onEditRole: (user: User) => void;
}

export function UsersTable({ users, onEditRole }: UsersTableProps) {
  return (
    <AdminTable
      columns={['USUÁRIO', 'PAPEL', 'DEPARTAMENTO', 'STATUS', 'AÇÕES']}
      isEmpty={users.length === 0}
      emptyMessage="Nenhum usuário encontrado."
    >
      {users.map((user) => (
        <tr key={user.id}>
          <td className={adminStyles.td}>
            <div className={adminStyles.userCell}>
              <strong className={adminStyles.userName}>{user.name}</strong>
              <span className={adminStyles.userEmail}>{user.email}</span>
            </div>
          </td>

          <td className={adminStyles.td}>
            <UserRoleBadge role={user.role} />
          </td>

          <td className={adminStyles.td}>
            <span className={adminStyles.departmentBadge}>{user.department}</span>
          </td>

          <td className={adminStyles.td}>
            <UserStatusBadge status={user.status} />
          </td>

          <td className={adminStyles.td}>
            <button
              type="button"
              className={adminStyles.editButton}
              onClick={() => onEditRole(user)}
            >
              Editar papel
            </button>
          </td>
        </tr>
      ))}
    </AdminTable>
  );
}
