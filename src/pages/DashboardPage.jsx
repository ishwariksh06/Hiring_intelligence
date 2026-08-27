import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardSummary } from '../api/dashboardApi';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';

const ACTIVITY_ICON = {
  UPLOAD: 'bg-indigo-100 text-indigo-600',
  JOB_CREATED: 'bg-emerald-100 text-emerald-600',
  REPORT: 'bg-amber-100 text-amber-600',
};

function StatCard({ label, value, hint }) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-800">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </Card>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getDashboardSummary().then((data) => {
      if (active) {
        setSummary(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Loader label="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active Jobs" value={summary.activeJobs} hint="Currently open postings" />
        <StatCard label="Resumes Processed" value={summary.resumesProcessed} hint="Across all jobs" />
        <StatCard label="Avg. Match Score" value={`${summary.avgMatchScore}%`} hint="All candidates" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          title="Recent Job Postings"
          className="lg:col-span-2"
          action={
            <Link to="/jobs">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          }
        >
          <div className="divide-y divide-slate-100">
            {summary.recentJobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{job.title}</p>
                  <p className="text-xs text-slate-500">
                    {job.minExperience}-{job.maxExperience} yrs &middot; {job.requiredSkills.slice(0, 3).join(', ')}
                  </p>
                </div>
                <span className="text-xs font-medium text-slate-500">{job.applicantCount} applicants</span>
              </Link>
            ))}
          </div>
        </Card>

        <Card title="Recent Activity">
          <ul className="space-y-4">
            {summary.recentActivity.map((activity) => (
              <li key={activity.id} className="flex gap-3">
                <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${ACTIVITY_ICON[activity.type] || 'bg-slate-100 text-slate-600'}`}>
                  •
                </span>
                <div>
                  <p className="text-sm text-slate-700">{activity.message}</p>
                  <p className="text-xs text-slate-400">{new Date(activity.timestamp).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
