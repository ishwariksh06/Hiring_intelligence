import axiosClient from './axiosClient';
import { SAMPLE_RESUME_BATCH } from './sampleBatch';

// Ingests dropped files by POSTing them to the backend as multipart/form-data.
// The backend parses text/CSV/JSON resumes for real; binary PDFs/DOCX are stored
// and flagged by the ATS check for manual review.
export async function uploadResumes(files, { onFileStatusChange } = {}) {
  const form = new FormData();
  for (const file of files) {
    form.append('files', file);
    onFileStatusChange?.(file.name, 'uploading');
  }
  files.forEach((f) => onFileStatusChange?.(f.name, 'parsing'));

  const { data } = await axiosClient.post('/resumes', form, {
    headers: { 'Content-Type': undefined },
  });

  files.forEach((f) => onFileStatusChange?.(f.name, 'done'));
  return data;
}

// One-click loader for the bundled Kaggle-style dataset (sent as a JSON batch).
export async function loadSampleDataset() {
  const { data } = await axiosClient.post('/resumes', SAMPLE_RESUME_BATCH, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
}

// Admin only: wipe every table and restore the seed dataset.
export async function resetDatabase() {
  const { data } = await axiosClient.post('/admin/reset');
  return data;
}
