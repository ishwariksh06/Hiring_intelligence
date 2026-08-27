import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createJob, getJobById, updateJob } from '../api/jobsApi';
import JobForm from '../components/jobs/JobForm';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';

export default function JobFormPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(mode === 'edit');

  useEffect(() => {
    if (mode === 'edit' && id) {
      getJobById(id).then((data) => {
        setJob(data);
        setLoading(false);
      });
    }
  }, [mode, id]);

  async function handleSubmit(values) {
    if (mode === 'edit') {
      await updateJob(id, values);
      navigate(`/jobs/${id}`);
    } else {
      const created = await createJob(values);
      navigate(`/jobs/${created.id}`);
    }
  }

  if (loading) return <Loader label="Loading job..." />;

  return (
    <Card title={mode === 'edit' ? 'Edit Job Posting' : 'Create Job Posting'} className="max-w-2xl">
      <JobForm
        defaultValues={job}
        onSubmit={handleSubmit}
        submitLabel={mode === 'edit' ? 'Save Changes' : 'Create Job'}
      />
    </Card>
  );
}
