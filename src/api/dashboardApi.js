import axiosClient from './axiosClient';
import { mockDelay, USE_MOCK_API } from './mockHelpers';
import { mockJobs } from './mockData/jobs';
import { mockCandidates } from './mockData/candidates';

export async function getDashboardSummary() {
  if (USE_MOCK_API) {
    const activeJobs = mockJobs.filter((j) => j.status === 'OPEN').length;
    const resumesProcessed = mockCandidates.length;
    const allScores = mockCandidates.flatMap((c) => c.appliedJobs.map((a) => a.matchScore));
    const avgMatchScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

    const recentActivity = [
      { id: 'act1', type: 'UPLOAD', message: '5 resumes uploaded for Senior Backend Engineer (Java)', timestamp: '2026-08-01T15:20:00Z' },
      { id: 'act2', type: 'JOB_CREATED', message: 'New job posted: Engineering Manager', timestamp: '2026-07-18T14:45:00Z' },
      { id: 'act3', type: 'REPORT', message: 'Report generated: Q2 2026 Skill Gap Analysis', timestamp: '2026-06-28T16:45:00Z' },
      { id: 'act4', type: 'UPLOAD', message: '3 resumes uploaded for DevOps Engineer', timestamp: '2026-06-15T11:05:00Z' },
    ];

    return mockDelay({
      activeJobs,
      resumesProcessed,
      avgMatchScore,
      recentJobs: mockJobs.slice(0, 4),
      recentActivity,
    });
  }
  const { data } = await axiosClient.get('/dashboard/summary');
  return data;
}
