import { createContext, useCallback, useContext, useEffect, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { AUTH_UNAUTHORIZED_EVENT } from '../utils/authSession';

type UserRole = '2' | '1';

interface User {
  userId?: number;
  name: string;
  email: string;
  role: UserRole;
  userTypeId?: UserRole;
  typeUserId?: number;
}

interface AuthContextData {
  user: User;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  updateProfile: (profile: Pick<User, 'name' | 'email'>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);
const AUTH_USER_STORAGE_KEY = 'auth_user';
const DEFAULT_USER: User = { name: '', email: '', role: '1', userTypeId: '1' };

function getStoredUser() {
  const saved = sessionStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved) as User;
  } catch {
    sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(() => {
    return getStoredUser() ?? DEFAULT_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return getStoredUser() !== null;
  });

  const logout = useCallback(() => {
    setUser(DEFAULT_USER);
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
  }, []);

  useEffect(() => {
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, logout);

    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, logout);
    };
  }, [logout]);

  function login(userData: User) {
    const typeUserId = userData.userTypeId || String(userData.typeUserId ?? '') as UserRole;
    const normalizedUser: User = {
      ...userData,
      role: userData.role || typeUserId || '1',
      userTypeId: typeUserId || userData.role || '1',
    };
    setUser(normalizedUser);
    setIsAuthenticated(true);
    sessionStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(normalizedUser));
  }

  function updateProfile(profile: Pick<User, 'name' | 'email'>) {
    setUser((currentUser) => {
      const updated = {
        ...currentUser,
        ...profile,
      };
      sessionStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      login,
      updateProfile,
      logout,
    }),
    [user, isAuthenticated, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
