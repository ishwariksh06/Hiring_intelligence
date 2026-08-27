import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getJobs } from '../api/jobsApi';
import JobTable from '../components/jobs/JobTable';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';

export default function JobsListPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getJobs().then((data) => {
      if (active) {
        setJobs(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Card
      title="Job Postings"
      action={
        <Link to="/jobs/new">
          <Button size="sm">+ Create Job</Button>
        </Link>
      }
      bodyClassName="p-0"
    >
      {loading ? <Loader label="Loading jobs..." /> : <JobTable jobs={jobs} />}
    </Card>
  );
}
