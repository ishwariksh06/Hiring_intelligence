import { mockDelay, mockError } from './mockHelpers';
import { getAll } from '../db/store';

function publicUser(user) {
  return {
    token: `local.${user.role}.${user.id}`,
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    companyId: user.companyId ?? null,
    title: user.title ?? '',
  };
}

export async function login({ email, password }) {
  const user = getAll('users').find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password
  );
  if (!user) return mockError('Invalid email or password');
  return mockDelay(publicUser(user));
}
