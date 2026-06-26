export type AuthUserRole = '1' | '2';

export interface AuthUser {
  userId?: number;
  name: string;
  email: string;
  role: AuthUserRole;
  userTypeId?: AuthUserRole;
  typeUserId?: number;
}

export interface AuthContextData {
  user: AuthUser;
  isAuthenticated: boolean;
  login: (userData: AuthUser) => void;
  updateProfile: (profile: Pick<AuthUser, 'name' | 'email'>) => void;
  logout: () => void;
}

export interface LoginResponse {
  user: {
    userId: number;
    name: string;
    email: string;
    typeUserId: number;
  };
}

export interface UserSuggestion {
  email: string;
  name: string;
  userId: number;
}
