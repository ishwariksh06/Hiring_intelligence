import { useEffect, useState } from 'react';
import { getMyApplications } from '../api/candidatesApi';
import { applicationStatusMeta } from '../api/mockData/candidatePortal';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import MatchScoreBadge from '../components/candidates/MatchScoreBadge';

const COLOR_CLASSES = {
  amber: 'bg-amber-50 text-amber-700',
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-emerald-50 text-emerald-700',
  red: 'bg-red-50 text-red-700',
};

export default function ApplicationStatusPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getMyApplications().then((data) => {
      if (active) {
        setApplications(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Card title="Your Applications">
      {loading ? (
        <Loader label="Loading applications..." />
      ) : applications.length === 0 ? (
        <EmptyState title="No applications yet" message="Once you apply to a job, its status will show up here." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {applications.map((app) => {
            const meta = applicationStatusMeta[app.status];
            return (
              <li key={app.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">{app.jobTitle}</p>
                  <p className="text-xs text-slate-400">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <MatchScoreBadge score={app.matchScore} showLabel={false} />
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${COLOR_CLASSES[meta.color]}`}>
                    {meta.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
