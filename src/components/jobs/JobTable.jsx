import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../common/EmptyState';

const COLUMNS = [
  { key: 'title', label: 'Job Title' },
  { key: 'requiredSkills', label: 'Required Skills', sortable: false },
  { key: 'experience', label: 'Experience' },
  { key: 'applicantCount', label: 'Applicants' },
  { key: 'status', label: 'Status' },
];

export default function JobTable({ jobs }) {
  const [sortKey, setSortKey] = useState('title');
  const [sortDir, setSortDir] = useState('asc');
  const navigate = useNavigate();

  const sortedJobs = useMemo(() => {
    const sorted = [...jobs].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      if (sortKey === 'experience') {
        aVal = a.minExperience;
        bVal = b.minExperience;
      }
      if (typeof aVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [jobs, sortKey, sortDir]);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  if (jobs.length === 0) {
    return <EmptyState title="No jobs yet" message="Create your first job posting to start ranking candidates." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable !== false && handleSort(col.key)}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                  col.sortable !== false ? 'cursor-pointer select-none hover:text-slate-700' : ''
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable !== false && sortKey === col.key && (
                    <span>{sortDir === 'asc' ? '▲' : '▼'}</span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sortedJobs.map((job) => (
            <tr
              key={job.id}
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="cursor-pointer hover:bg-slate-50"
            >
              <td className="px-4 py-3 text-sm font-medium text-slate-800">{job.title}</td>
              <td className="px-4 py-3 text-sm text-slate-600">
                <div className="flex flex-wrap gap-1">
                  {job.requiredSkills.slice(0, 4).map((s) => (
                    <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {s}
                    </span>
                  ))}
                  {job.requiredSkills.length > 4 && (
                    <span className="text-xs text-slate-400">+{job.requiredSkills.length - 4}</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">
                {job.minExperience}-{job.maxExperience} yrs
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">{job.applicantCount}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    job.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {job.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
