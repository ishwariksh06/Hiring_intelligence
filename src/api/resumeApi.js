import { mockDelay } from './mockHelpers';
import { ingestResumes } from '../db/queries';
import { SAMPLE_RESUME_BATCH } from '../db/sampleBatch';

function readFileText(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => resolve('');
    reader.readAsText(file);
  });
}

// Ingests dropped files. Text/CSV/JSON resumes are parsed for real; binary PDFs
// can't be read in-browser for the demo, so a placeholder record is created and
// flagged by the ATS check for manual review.
export async function uploadResumes(files, { onFileStatusChange } = {}) {
  const entries = [];
  for (const file of files) {
    onFileStatusChange?.(file.name, 'uploading');
    const isText = /\.(txt|csv|json|md)$/i.test(file.name) || file.type.startsWith('text/');
    let raw = '';
    if (isText) raw = await readFileText(file);
    onFileStatusChange?.(file.name, 'parsing');
    await mockDelay(null, 300 + Math.random() * 400);

    if (file.name.toLowerCase().endsWith('.json') && raw.trim().startsWith('[')) {
      try {
        JSON.parse(raw).forEach((row) => entries.push({ ...row, sourceFile: file.name }));
        onFileStatusChange?.(file.name, 'done');
        continue;
      } catch {
        /* fall through to single-record handling */
      }
    }

    entries.push({
      rawText: raw || `${file.name.replace(/\.[a-z]+$/i, '').replace(/[_-]+/g, ' ')}\n(Resume text could not be extracted from this file.)`,
      sourceFile: file.name,
    });
    onFileStatusChange?.(file.name, 'done');
  }

  return mockDelay(ingestResumes(entries), 400);
}

// One-click loader for the bundled Kaggle-style dataset.
export async function loadSampleDataset() {
  return mockDelay(ingestResumes(SAMPLE_RESUME_BATCH), 900);
}
