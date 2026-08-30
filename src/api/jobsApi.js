import { mockDelay, mockError } from './mockHelpers';
import * as q from '../db/queries';

export async function getJobs(ctx = {}) {
  return mockDelay(q.listJobs(ctx));
}

export async function getJobById(id) {
  const job = q.getJob(id);
  if (!job) return mockError('Job not found');
  return mockDelay(job);
}

export async function createJob(payload, ctx = {}) {
  return mockDelay(q.createJob(payload, ctx), 700);
}

export async function updateJob(id, payload) {
  const job = q.updateJob(id, payload);
  if (!job) return mockError('Job not found');
  return mockDelay(job, 700);
}

export async function getJobCandidates(jobId) {
  return mockDelay(q.getJobRanking(jobId));
}

export async function setCandidateStatus(jobId, candidateId, status) {
  return mockDelay(q.setMatchStatus(jobId, candidateId, status), 250);
}
