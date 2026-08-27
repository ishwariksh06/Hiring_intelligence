import axiosClient from './axiosClient';
import { mockDelay, USE_MOCK_API } from './mockHelpers';
import { mockReports } from './mockData/reports';

let reportsStore = [...mockReports];

export async function getReports() {
  if (USE_MOCK_API) return mockDelay([...reportsStore]);
  const { data } = await axiosClient.get('/reports');
  return data;
}

export async function generateReport(payload) {
  if (USE_MOCK_API) {
    const newReport = {
      id: `r${reportsStore.length + 1}`,
      title: payload?.title || `Custom Report - ${new Date().toISOString().slice(0, 10)}`,
      generatedAt: new Date().toISOString(),
      reportUrl: '#',
    };
    reportsStore = [newReport, ...reportsStore];
    return mockDelay({ reportUrl: newReport.reportUrl, report: newReport }, 1200);
  }
  const { data } = await axiosClient.post('/reports/generate', payload);
  return data;
}
