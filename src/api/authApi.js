import axiosClient from './axiosClient';

// POST /api/auth/login -> { token, id, name, email, role, companyId, title, companyName }
export async function login({ email, password }) {
  const { data } = await axiosClient.post('/auth/login', { email, password });
  return data;
}
