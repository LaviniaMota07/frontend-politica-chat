import type { UserRole } from '../../../types/user';
import { adminStyles } from '../../../utils/tailwindStyles';

interface UserRoleBadgeProps {
  role: UserRole;
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  return (
    <span className={role === 'Admin' ? adminStyles.badgeRoleAdmin : adminStyles.badgeRoleDefault}>
      {role}
    </span>
  );
}