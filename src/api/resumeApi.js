import axiosClient from './axiosClient';
import { USE_MOCK_API } from './mockHelpers';

const SAMPLE_NAMES = [
  'Ishaan Kapoor', 'Meera Pillai', 'Aditya Singh', 'Tanvi Deshmukh', 'Rohan Chatterjee',
  'Kavya Reddy', 'Yash Agarwal', 'Simran Kaur', 'Nikhil Bhat', 'Pooja Menon',
];
const SAMPLE_SKILLS = [
  'Java', 'Spring Boot', 'React', 'AWS', 'Docker', 'Kubernetes', 'Python', 'SQL',
  'PostgreSQL', 'JavaScript', 'TypeScript', 'Terraform', 'Kafka', 'Node.js',
];
const SAMPLE_EDUCATION = [
  'B.Tech Computer Science, IIT Bombay',
  'B.E. Information Technology, VJTI Mumbai',
  'M.Tech Software Engineering, BITS Pilani',
  'B.Sc Computer Science, Delhi University',
  'B.Tech Electronics & Communication, NIT Trichy',
];

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function fakeParsedResult(fileName) {
  return {
    fileName,
    name: SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)],
    skills: pickRandom(SAMPLE_SKILLS, 3 + Math.floor(Math.random() * 4)),
    experienceYears: 1 + Math.floor(Math.random() * 9),
    education: SAMPLE_EDUCATION[Math.floor(Math.random() * SAMPLE_EDUCATION.length)],
  };
}

// Uploads and "parses" resumes. onFileStatusChange(fileName, status, data?) is called
// as each file progresses through 'uploading' -> 'parsing' -> 'done' | 'error'.
export async function uploadResumes(files, { jobId, onFileStatusChange } = {}) {
  if (USE_MOCK_API) {
    const results = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            onFileStatusChange?.(file.name, 'uploading');
            setTimeout(() => {
              onFileStatusChange?.(file.name, 'parsing');
              setTimeout(() => {
                const shouldFail = Math.random() < 0.08;
                if (shouldFail) {
                  onFileStatusChange?.(file.name, 'error');
                  resolve({ fileName: file.name, error: 'Could not parse resume' });
                  return;
                }
                const parsed = fakeParsedResult(file.name);
                onFileStatusChange?.(file.name, 'done', parsed);
                resolve(parsed);
              }, 700 + Math.random() * 900);
            }, 500 + Math.random() * 500);
          })
      )
    );
    return results;
  }

  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  if (jobId) formData.append('jobId', jobId);

  const { data } = await axiosClient.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
