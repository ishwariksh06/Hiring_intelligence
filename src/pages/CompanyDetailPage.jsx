import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCompanyById } from '../api/companiesApi';
import { getJobs } from '../api/jobsApi';
import { getAll } from '../db/store';
import JobTable from '../components/jobs/JobTable';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';

export default function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCompanyById(id), getJobs({ role: 'RECRUITER', companyId: id })])
      .then(([c, j]) => {
        setCompany(c);
        setJobs(j);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader label="Loading company..." />;
  if (!company) return null;

  const recruiter = getAll('users').find((u) => u.companyId === id && u.role === 'RECRUITER');

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{company.name}</h2>
            <p className="text-sm text-slate-500">
              {[company.industry, company.location].filter(Boolean).join(' · ') || 'No details'}
            </p>
            {company.contactName && (
              <p className="mt-1 text-sm text-slate-500">
                Contact: {company.contactName}
                {company.contactEmail ? ` · ${company.contactEmail}` : ''}
              </p>
            )}
            {recruiter && <p className="mt-1 text-xs text-slate-400">Recruiter login: {recruiter.email}</p>}
          </div>
          <Link to={`/jobs/new?companyId=${company.id}`}>
            <Button size="sm">Post a job for this client</Button>
          </Link>
        </div>
      </Card>

      <Card title={`Jobs (${jobs.length})`} bodyClassName="p-0">
        <JobTable jobs={jobs} />
      </Card>

      <button onClick={() => navigate('/companies')} className="text-xs font-medium text-slate-500 hover:text-slate-800">
        ← All companies
      </button>
    </div>
  );
}
