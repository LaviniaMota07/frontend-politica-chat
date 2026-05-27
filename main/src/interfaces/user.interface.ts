export type UserRole = 'Admin' | 'Default';

export type UserStatus = 'Ativo' | 'Bloqueado';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
}
