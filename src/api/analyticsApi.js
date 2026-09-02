import axiosClient from './axiosClient';

export async function getSkillAnalytics() {
  const { data } = await axiosClient.get('/analytics/skills');
  return data;
}

export async function getScreeningFunnel() {
  const { data } = await axiosClient.get('/analytics/funnel');
  return data;
}

export async function getSkillGap() {
  const { data } = await axiosClient.get('/analytics/skill-gap');
  return data;
}

export async function getIngestTrend() {
  const { data } = await axiosClient.get('/analytics/trend');
  return data;
}
