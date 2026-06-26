import { createContext, useCallback, useContext, useEffect, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { AUTH_UNAUTHORIZED_EVENT } from '../utils/authSession';
import type { AuthUser, AuthContextData } from '../interfaces/auth.interface';

export type { AuthUser, AuthContextData };

const AuthContext = createContext<AuthContextData | undefined>(undefined);
const AUTH_USER_STORAGE_KEY = 'auth_user';
const DEFAULT_USER: AuthUser = { name: '', email: '', role: '1', userTypeId: '1' };

function getStoredUser() {
  const saved = sessionStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved) as AuthUser;
  } catch {
    sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(() => {
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

  const login = useCallback((userData: AuthUser) => {
    const typeUserId = userData.userTypeId || String(userData.typeUserId ?? '') as AuthUser['role'];
    const normalizedUser: AuthUser = {
      ...userData,
      role: userData.role || typeUserId || '1',
      userTypeId: typeUserId || userData.role || '1',
    };
    setUser(normalizedUser);
    setIsAuthenticated(true);
    sessionStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(normalizedUser));
  }, []);

  const updateProfile = useCallback((profile: Pick<AuthUser, 'name' | 'email'>) => {
    setUser((currentUser) => {
      const updated = {
        ...currentUser,
        ...profile,
      };
      sessionStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      login,
      updateProfile,
      logout,
    }),
    [user, isAuthenticated, login, updateProfile, logout]
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
