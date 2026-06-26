import type { UserStatus } from '../../../types/user';
import { adminStyles } from '../../../utils/tailwindStyles';

interface UserStatusBadgeProps {
  status: UserStatus;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  return (
    <span className={status === 'Ativo' ? adminStyles.badgeActive : adminStyles.badgeBlocked}>
      {status}
    </span>
  );
}