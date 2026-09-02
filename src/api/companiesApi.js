import axiosClient from './axiosClient';

export async function getCompanies() {
  const { data } = await axiosClient.get('/companies');
  return data;
}

export async function getCompanyById(id) {
  const { data } = await axiosClient.get(`/companies/${id}`);
  return data;
}

export async function createCompany(payload) {
  const { data } = await axiosClient.post('/companies', payload);
  return data;
}
