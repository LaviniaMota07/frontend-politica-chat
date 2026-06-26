import { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';

type UserRole = '2' | '1';

interface User {
  userId?: number;
  name: string;
  email: string;
  role: UserRole;
  userTypeId?: UserRole;
}

interface AuthContextData {
  user: User;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  loginAsAdmin: () => void;
  loginAsUser: () => void;
  updateProfile: (profile: Pick<User, 'name' | 'email'>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(() => {
    const saved = sessionStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : { name: '', email: '', role: '1', userTypeId: '1' };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!sessionStorage.getItem('auth_user');
  });

  function login(userData: User) {
    const normalizedUser: User = {
      ...userData,
      role: userData.role || userData.userTypeId || '1',
      userTypeId: userData.userTypeId || userData.role || '1',
    };
    setUser(normalizedUser);
    setIsAuthenticated(true);
    sessionStorage.setItem('auth_user', JSON.stringify(normalizedUser));
  }

  function loginAsAdmin() {
    const mockUser: User = {
      name: 'Admin',
      email: 'admin@email.com',
      role: '2',
      userTypeId: '2',
    };
    setUser(mockUser);
    setIsAuthenticated(true);
    sessionStorage.setItem('auth_user', JSON.stringify(mockUser));
  }

  function loginAsUser() {
    const mockUser: User = {
      name: 'User',
      email: 'user@email.com',
      role: '1',
      userTypeId: '1',
    };
    setUser(mockUser);
    setIsAuthenticated(true);
    sessionStorage.setItem('auth_user', JSON.stringify(mockUser));
  }

  function logout() {
    setIsAuthenticated(false);
    sessionStorage.removeItem('auth_user');
  }

  function updateProfile(profile: Pick<User, 'name' | 'email'>) {
    setUser((currentUser) => {
      const updated = {
        ...currentUser,
        ...profile,
      };
      sessionStorage.setItem('auth_user', JSON.stringify(updated));
      return updated;
    });
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      login,
      loginAsAdmin,
      loginAsUser,
      updateProfile,
      logout,
    }),
    [user, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
