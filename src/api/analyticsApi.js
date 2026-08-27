import axiosClient from './axiosClient';
import { mockDelay, USE_MOCK_API } from './mockHelpers';
import {
  mockSkillAnalytics,
  mockHiringFunnel,
  mockSkillGap,
  mockMonthlyTrends,
} from './mockData/analytics';

export async function getSkillAnalytics() {
  if (USE_MOCK_API) return mockDelay(mockSkillAnalytics);
  const { data } = await axiosClient.get('/analytics/skills');
  return data;
}

export async function getHiringFunnel() {
  if (USE_MOCK_API) return mockDelay(mockHiringFunnel);
  const { data } = await axiosClient.get('/analytics/funnel');
  return data;
}

export async function getSkillGap() {
  if (USE_MOCK_API) return mockDelay(mockSkillGap);
  const { data } = await axiosClient.get('/analytics/skill-gap');
  return data;
}

export async function getMonthlyTrends() {
  if (USE_MOCK_API) return mockDelay(mockMonthlyTrends);
  const { data } = await axiosClient.get('/analytics/trends');
  return data;
}
