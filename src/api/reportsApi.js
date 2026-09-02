import axiosClient from './axiosClient';

export async function getReports() {
  const { data } = await axiosClient.get('/reports');
  return data;
}

export async function generateReport(payload) {
  const { data } = await axiosClient.post('/reports/generate', payload || {});
  return data; // { reportUrl, report }
}
