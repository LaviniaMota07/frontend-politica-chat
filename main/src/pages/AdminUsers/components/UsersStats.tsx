import { AdminStatsGrid } from '../../../components/admin/AdminStatsGrid';

interface UsersStatsProps {
  totalUsers: number;
  totalAdmins: number;
  totalDefault: number;
  activeUsers: number;
}

export function UsersStats({
  totalUsers,
  totalAdmins,
  totalDefault,
  activeUsers,
}: UsersStatsProps) {
  const stats = [
    { label: 'USUÁRIOS TOTAIS', value: totalUsers },
    { label: 'ADMINS', value: totalAdmins.toString().padStart(2, '0') },
    { label: 'DEFAULT', value: totalDefault },
    { label: 'USUÁRIOS ATIVOS', value: activeUsers.toString().padStart(2, '0') },
  ];

  return <AdminStatsGrid cards={stats} />;
}
