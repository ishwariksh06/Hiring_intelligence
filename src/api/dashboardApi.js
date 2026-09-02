import axiosClient from './axiosClient';

export async function getDashboardSummary() {
  const { data } = await axiosClient.get('/dashboard/summary');
  return data;
}
