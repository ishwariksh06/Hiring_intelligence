import { mockDelay, mockError } from './mockHelpers';
import * as q from '../db/queries';

export async function getCandidates(ctx = {}) {
  return mockDelay(q.listCandidates(ctx));
}

export async function getCandidateById(id, ctx = {}) {
  const candidate = q.getCandidate(id, ctx);
  if (!candidate) return mockError('Candidate not found');
  return mockDelay(candidate);
}

export async function getInterviewQuestions(id, ctx = {}) {
  const candidate = q.getCandidate(id, ctx);
  return mockDelay(candidate?.interviewQuestions || []);
}
