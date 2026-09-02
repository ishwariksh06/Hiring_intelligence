import axiosClient from './axiosClient';

// The backend scopes results by the caller's role/company from the JWT, so the
// old `ctx` argument is accepted for call-site compatibility but ignored.

export async function getJobs() {
  const { data } = await axiosClient.get('/jobs');
  return data;
}

export async function getJobById(id) {
  const { data } = await axiosClient.get(`/jobs/${id}`);
  return data;
}

function clean(payload) {
  const body = { ...payload };
  if (!body.companyId) delete body.companyId; // recruiters have no company select
  return body;
}

export async function createJob(payload) {
  const { data } = await axiosClient.post('/jobs', clean(payload));
  return data;
}

export async function updateJob(id, payload) {
  const { data } = await axiosClient.put(`/jobs/${id}`, clean(payload));
  return data;
}

export async function getJobCandidates(jobId) {
  const { data } = await axiosClient.get(`/jobs/${jobId}/candidates`);
  return data;
}

export async function setCandidateStatus(jobId, candidateId, status) {
  await axiosClient.patch(`/jobs/${jobId}/candidates/${candidateId}`, { status });
}
