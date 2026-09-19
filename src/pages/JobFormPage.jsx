import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { createJob, getJobById, updateJob } from '../api/jobsApi';
import { getCompanies } from '../api/companiesApi';
import { useAuth, useScope } from '../context/useAuth';
import JobForm from '../components/jobs/JobForm';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';

export default function JobFormPage({ mode }) {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const scope = useScope();
  const isAdmin = user?.role === 'ADMIN';

  const [job, setJob] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const tasks = [];
      if (mode === 'edit' && id) tasks.push(getJobById(id).then(setJob));
      if (isAdmin) tasks.push(getCompanies().then(setCompanies));
      await Promise.all(tasks);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, id]);

  async function handleSubmit(values) {
    if (mode === 'edit') {
      await updateJob(id, values);
      navigate(`/jobs/${id}`);
    } else {
      const created = await createJob(values, scope);
      navigate(`/jobs/${created.id}`);
    }
  }

  if (loading) return <Loader label="Loading..." />;

  const preselectCompany = searchParams.get('companyId');
  const recruiterCompanyName = !isAdmin ? user?.companyName ?? null : null;
  const editingCompanyName = mode === 'edit' && job ? job.companyName : null;

  return (
    <Card title={mode === 'edit' ? 'Edit job' : 'New job'} className="max-w-2xl">
      <JobForm
        defaultValues={job || (preselectCompany ? { companyId: preselectCompany } : null)}
        companies={mode === 'create' && isAdmin ? companies : []}
        lockedCompanyName={mode === 'edit' ? editingCompanyName : recruiterCompanyName}
        onSubmit={handleSubmit}
        submitLabel={mode === 'edit' ? 'Save changes' : 'Create job'}
      />
    </Card>
  );
}
