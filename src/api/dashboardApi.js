import { mockDelay } from './mockHelpers';
import * as q from '../db/queries';

export async function getDashboardSummary(ctx = {}) {
  return mockDelay(q.dashboardSummary(ctx));
}
