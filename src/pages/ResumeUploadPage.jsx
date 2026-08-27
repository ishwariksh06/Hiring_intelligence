import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { uploadResumes } from '../api/resumeApi';
import { getJobById } from '../api/jobsApi';
import UploadDropzone from '../components/resume/UploadDropzone';
import UploadProgressList from '../components/resume/UploadProgressList';
import ParsedDataTable from '../components/resume/ParsedDataTable';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function ResumeUploadPage() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const [job, setJob] = useState(null);
  const [fileStatuses, setFileStatuses] = useState([]);
  const [results, setResults] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (jobId) {
      getJobById(jobId).then(setJob).catch(() => setJob(null));
    }
  }, [jobId]);

  const allDone = useMemo(
    () => fileStatuses.length > 0 && fileStatuses.every((f) => f.status === 'done' || f.status === 'error'),
    [fileStatuses]
  );

  async function handleFilesSelected(files) {
    setResults([]);
    setFileStatuses(files.map((f) => ({ name: f.name, status: 'uploading' })));
    setIsUploading(true);

    function onFileStatusChange(fileName, status) {
      setFileStatuses((prev) => prev.map((f) => (f.name === fileName ? { ...f, status } : f)));
    }

    const parsedResults = await uploadResumes(files, { jobId, onFileStatusChange });
    setResults(parsedResults);
    setIsUploading(false);
  }

  function reset() {
    setFileStatuses([]);
    setResults([]);
  }

  return (
    <div className="space-y-6">
      {job && (
        <div className="rounded-md border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
          Uploading resumes for <span className="font-semibold">{job.title}</span>
        </div>
      )}

      <Card title="Upload Resumes">
        <div className="space-y-4">
          <UploadDropzone onFilesSelected={handleFilesSelected} multiple />
          {fileStatuses.length > 0 && (
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-slate-700">Upload Status</h4>
              {allDone && (
                <Button variant="ghost" size="sm" onClick={reset}>
                  Upload more
                </Button>
              )}
            </div>
          )}
          <UploadProgressList files={fileStatuses} />
        </div>
      </Card>

      {(isUploading || results.length > 0) && (
        <Card title="Parsed Data Preview">
          <ParsedDataTable results={results} />
        </Card>
      )}
    </div>
  );
}
