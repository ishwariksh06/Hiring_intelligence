import axiosClient from './axiosClient';
import { mockDelay, mockError, USE_MOCK_API } from './mockHelpers';
import { mockJobs } from './mockData/jobs';
import { mockCandidates } from './mockData/candidates';

let jobsStore = [...mockJobs];

export async function getJobs() {
  if (USE_MOCK_API) {
    return mockDelay([...jobsStore]);
  }
  const { data } = await axiosClient.get('/jobs');
  return data;
}

export async function getJobById(id) {
  if (USE_MOCK_API) {
    const job = jobsStore.find((j) => j.id === id);
    if (!job) return mockError('Job not found');
    return mockDelay(job);
  }
  const { data } = await axiosClient.get(`/jobs/${id}`);
  return data;
}

export async function createJob(payload) {
  if (USE_MOCK_API) {
    const newJob = {
      id: `j${jobsStore.length + 1}`,
      applicantCount: 0,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      ...payload,
    };
    jobsStore = [newJob, ...jobsStore];
    return mockDelay(newJob);
  }
  const { data } = await axiosClient.post('/jobs', payload);
  return data;
}

export async function updateJob(id, payload) {
  if (USE_MOCK_API) {
    let updated = null;
    jobsStore = jobsStore.map((j) => {
      if (j.id === id) {
        updated = { ...j, ...payload };
        return updated;
      }
      return j;
    });
    if (!updated) return mockError('Job not found');
    return mockDelay(updated);
  }
  const { data } = await axiosClient.put(`/jobs/${id}`, payload);
  return data;
}

export async function getJobCandidates(jobId) {
  if (USE_MOCK_API) {
    const ranked = mockCandidates
      .map((c) => {
        const application = c.appliedJobs.find((a) => a.jobId === jobId);
        if (!application) return null;
        return {
          candidateId: c.id,
          name: c.name,
          email: c.email,
          experienceYears: c.experienceYears,
          skills: c.skills,
          matchScore: application.matchScore,
          strengths: application.strengths,
          missingSkills: application.missingSkills,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.matchScore - a.matchScore);
    return mockDelay(ranked);
  }
  const { data } = await axiosClient.get(`/jobs/${jobId}/candidates`);
  return data;
}
