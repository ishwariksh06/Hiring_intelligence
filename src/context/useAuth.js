import { useContext } from 'react';
import { AuthContext } from './authState';

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
