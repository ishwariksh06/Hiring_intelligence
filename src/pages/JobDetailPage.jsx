import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getJobById, getJobCandidates } from '../api/jobsApi';
import JobCard from '../components/jobs/JobCard';
import CandidateTable from '../components/candidates/CandidateTable';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';

export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getJobById(id), getJobCandidates(id)]).then(([jobData, candidateData]) => {
      if (active) {
        setJob(jobData);
        setCandidates(candidateData);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <Loader label="Loading job details..." />;
  if (!job) return null;

  return (
    <div className="space-y-6">
      <JobCard job={job} />
      <Card
        title={`Ranked Candidates (${candidates.length})`}
        action={
          <Link to={`/upload?jobId=${job.id}`}>
            <Button size="sm">Upload Resumes for this Job</Button>
          </Link>
        }
        bodyClassName="p-0"
      >
        <CandidateTable candidates={candidates} />
      </Card>
    </div>
  );
}
