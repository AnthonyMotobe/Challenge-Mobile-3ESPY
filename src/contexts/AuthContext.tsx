import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi } from '@/api/auth';
import { registerAuthFailureHandler } from '@/api/client';
import { tokenStorage } from '@/storage/tokenStorage';
import type { LoginPayload, RegisterPayload, User } from '@/types/api';

interface AuthState {
  user: User | null;
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const logout = useCallback(async () => {
    await tokenStorage.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    registerAuthFailureHandler(() => {
      setUser(null);
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = await tokenStorage.getAccessToken();
        if (!token) {
          setUser(null);
          return;
        }
        const profile = await authApi.me();
        setUser(profile);
      } catch {
        setUser(null);
      } finally {
        setIsBootstrapping(false);
      }
    })();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const tokens = await authApi.login(payload);
    await tokenStorage.saveTokens(tokens.access_token, tokens.refresh_token);
    const profile = await authApi.me();
    setUser(profile);
  }, []);

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await authApi.register(payload);
      await login({ email: payload.email, password: payload.password });
    },
    [login],
  );

  const refreshProfile = useCallback(async () => {
    const profile = await authApi.me();
    setUser(profile);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isBootstrapping,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, isBootstrapping, login, register, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
