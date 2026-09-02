import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import * as authApi from '../api/authApi';

const AuthContext = createContext(null);

const TOKEN_KEY = 'hip_token';
const USER_KEY = 'hip_user';

function loadStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.login(credentials);
      const userData = {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role,
        companyId: result.companyId,
        companyName: result.companyName ?? null,
        title: result.title,
      };
      localStorage.setItem(TOKEN_KEY, result.token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, loading, error, login, logout }),
    [user, loading, error, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

// Convenience: the scope object every data query expects.
export function useScope() {
  const { user } = useAuth();
  return { role: user?.role, companyId: user?.companyId ?? null };
}
