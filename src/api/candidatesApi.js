import axiosClient from './axiosClient';
import { mockDelay, mockError, USE_MOCK_API } from './mockHelpers';
import { mockCandidates, mockInterviewQuestions } from './mockData/candidates';
import { mockMyApplications } from './mockData/candidatePortal';

export async function getCandidateById(id) {
  if (USE_MOCK_API) {
    const candidate = mockCandidates.find((c) => c.id === id);
    if (!candidate) return mockError('Candidate not found');
    return mockDelay(candidate);
  }
  const { data } = await axiosClient.get(`/candidates/${id}`);
  return data;
}

export async function getInterviewQuestions(id) {
  if (USE_MOCK_API) {
    return mockDelay(mockInterviewQuestions[id] || []);
  }
  const { data } = await axiosClient.get(`/candidates/${id}/interview-questions`);
  return data;
}

export async function getMyApplications() {
  if (USE_MOCK_API) {
    return mockDelay(mockMyApplications);
  }
  const { data } = await axiosClient.get('/candidates/me/applications');
  return data;
}
