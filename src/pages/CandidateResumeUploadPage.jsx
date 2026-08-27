import { useState } from 'react';
import { uploadResumes } from '../api/resumeApi';
import UploadDropzone from '../components/resume/UploadDropzone';
import UploadProgressList from '../components/resume/UploadProgressList';
import ParsedDataTable from '../components/resume/ParsedDataTable';
import Card from '../components/common/Card';

export default function CandidateResumeUploadPage() {
  const [fileStatuses, setFileStatuses] = useState([]);
  const [results, setResults] = useState([]);

  async function handleFilesSelected(files) {
    const singleFile = [files[0]];
    setResults([]);
    setFileStatuses(singleFile.map((f) => ({ name: f.name, status: 'uploading' })));

    function onFileStatusChange(fileName, status) {
      setFileStatuses((prev) => prev.map((f) => (f.name === fileName ? { ...f, status } : f)));
    }

    const parsedResults = await uploadResumes(singleFile, { onFileStatusChange });
    setResults(parsedResults);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card title="Upload Your Resume">
        <div className="space-y-4">
          <UploadDropzone onFilesSelected={handleFilesSelected} multiple={false} />
          <UploadProgressList files={fileStatuses} />
        </div>
      </Card>

      {results.length > 0 && (
        <Card title="Here's what we extracted from your resume">
          <ParsedDataTable results={results} />
        </Card>
      )}
    </div>
  );
}
