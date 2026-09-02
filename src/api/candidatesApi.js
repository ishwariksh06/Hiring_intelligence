import axiosClient from './axiosClient';

export async function getCandidates() {
  const { data } = await axiosClient.get('/candidates');
  return data;
}

export async function getCandidateById(id) {
  const { data } = await axiosClient.get(`/candidates/${id}`);
  return data;
}

export async function getInterviewQuestions(id) {
  const { data } = await axiosClient.get(`/candidates/${id}`);
  return data?.interviewQuestions || [];
}
