import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardSummary } from '../api/dashboardApi';
import { useAuth, useScope } from '../context/useAuth';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold text-slate-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const scope = useScope();
  const isAdmin = user?.role === 'ADMIN';
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getDashboardSummary(scope).then((data) => {
      if (active) {
        setSummary(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (loading) return <Loader label="Loading overview..." />;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">
          {isAdmin
            ? 'Agency-wide view across every client company you screen for.'
            : 'Screening results for your open roles, prepared by the agency.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {isAdmin && <StatCard label="Client companies" value={summary.companies} hint="Active engagements" />}
        <StatCard label="Open jobs" value={summary.openJobs} hint={isAdmin ? 'Across all clients' : 'Your roles'} />
        <StatCard label="Candidates screened" value={summary.candidatesScreened} hint={isAdmin ? 'In the pool' : 'Matched to your jobs'} />
        <StatCard label="Shortlisted" value={summary.shortlisted} hint="Passed screening" />
        <StatCard label="Avg match score" value={`${summary.avgMatchScore}%`} hint="All scored matches" />
      </div>

      <Card title={isAdmin ? 'Recent job postings (all clients)' : 'Your job postings'} bodyClassName="p-0">
        {summary.recentJobs.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">No jobs yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {summary.recentJobs.map((job) => (
              <li key={job.id}>
                <Link to={`/jobs/${job.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{job.title}</p>
                    <p className="text-xs text-slate-500">
                      {isAdmin && <span className="text-slate-600">{job.companyName} · </span>}
                      {job.minExperience}-{job.maxExperience} yrs · {job.requiredSkills.slice(0, 3).join(', ')}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-slate-500">{job.shortlistedCount} shortlisted</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
