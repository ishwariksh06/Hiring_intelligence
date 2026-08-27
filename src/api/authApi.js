import axiosClient from './axiosClient';
import { mockDelay, mockError, USE_MOCK_API } from './mockHelpers';
import { mockUsers } from './mockData/users';

function makeToken(user) {
  return `mock-jwt.${user.role}.${user.id}`;
}

export async function login({ email, password }) {
  if (USE_MOCK_API) {
    const user = mockUsers.find((u) => u.email === email && u.password === password);
    if (!user) {
      return mockError('Invalid email or password');
    }
    return mockDelay({
      token: makeToken(user),
      role: user.role,
      name: user.name,
      email: user.email,
    });
  }

  const { data } = await axiosClient.post('/auth/login', { email, password });
  return data;
}

export async function register({ name, email, password, role }) {
  if (USE_MOCK_API) {
    const exists = mockUsers.some((u) => u.email === email);
    if (exists) {
      return mockError('An account with this email already exists');
    }
    const newUser = { id: `u${mockUsers.length + 1}`, name, email, password, role };
    mockUsers.push(newUser);
    return mockDelay({
      token: makeToken(newUser),
      role: newUser.role,
      name: newUser.name,
      email: newUser.email,
    });
  }

  const { data } = await axiosClient.post('/auth/register', { name, email, password, role });
  return data;
}
