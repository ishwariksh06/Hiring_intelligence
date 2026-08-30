import { mockDelay } from './mockHelpers';
import * as q from '../db/queries';

export async function getSkillAnalytics(ctx = {}) {
  return mockDelay(q.skillDemand(ctx));
}

export async function getScreeningFunnel(ctx = {}) {
  return mockDelay(q.screeningFunnel(ctx));
}

export async function getSkillGap(ctx = {}) {
  return mockDelay(q.skillGap(ctx));
}

export async function getIngestTrend(ctx = {}) {
  return mockDelay(q.ingestTrend(ctx));
}
