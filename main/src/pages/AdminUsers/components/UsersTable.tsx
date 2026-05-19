import type { User } from '../../../types/user';
import { UserRoleBadge } from './UserRoleBadge';
import { UserStatusBadge } from './UserStatusBadge';

interface UsersTableProps {
  users: User[];
  onEditRole: (user: User) => void;
}

export function UsersTable({ users, onEditRole }: UsersTableProps) {
  return (
    <div className="users-table-wrapper">
      <table className="users-table">
        <thead>
          <tr>
            <th>USUÁRIO</th>
            <th>PAPEL</th>
            <th>DEPARTAMENTO</th>
            <th>STATUS</th>
            <th>AÇÕES</th>
          </tr>
        </thead>

        <tbody>
          {users.length === 0 && (
            <tr>
              <td className="users-empty-cell" colSpan={5}>
                Nenhum usuário encontrado.
              </td>
            </tr>
          )}

          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <div className="user-cell">
                  <strong className="user-name">{user.name}</strong>
                  <span className="user-email">{user.email}</span>
                </div>
              </td>

              <td>
                <UserRoleBadge role={user.role} />
              </td>

              <td>
                <span className="department-badge">{user.department}</span>
              </td>

              <td>
                <UserStatusBadge status={user.status} />
              </td>

              <td>
                <button
                  type="button"
                  className="edit-role-btn"
                  onClick={() => onEditRole(user)}
                >
                  Editar papel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
