import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getJobs } from '../api/jobsApi';
import { useAuth, useScope } from '../context/AuthContext';
import JobTable from '../components/jobs/JobTable';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';

export default function JobsListPage() {
  const { user } = useAuth();
  const scope = useScope();
  const isAdmin = user?.role === 'ADMIN';
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getJobs(scope).then((data) => {
      if (active) {
        setJobs(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <Card
      title={isAdmin ? 'All client jobs' : 'Your jobs'}
      action={
        <Link to="/jobs/new">
          <Button size="sm">New job</Button>
        </Link>
      }
      bodyClassName="p-0"
    >
      {loading ? <Loader label="Loading jobs..." /> : <JobTable jobs={jobs} showCompany={isAdmin} />}
    </Card>
  );
}
