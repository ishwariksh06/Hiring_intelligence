import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../common/EmptyState';

export default function JobTable({ jobs, showCompany = false }) {
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const navigate = useNavigate();

  const columns = useMemo(
    () =>
      [
        { key: 'title', label: 'Job title' },
        showCompany && { key: 'companyName', label: 'Company' },
        { key: 'requiredSkills', label: 'Required skills', sortable: false },
        { key: 'experience', label: 'Experience' },
        { key: 'shortlistedCount', label: 'Shortlisted' },
        { key: 'status', label: 'Status' },
      ].filter(Boolean),
    [showCompany]
  );

  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
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
  }, [jobs, sortKey, sortDir]);

  function handleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  if (jobs.length === 0) {
    return <EmptyState title="No jobs yet" message="Create a job posting to start screening candidates against it." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable !== false && handleSort(col.key)}
                className={`px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 ${
                  col.sortable !== false ? 'cursor-pointer select-none hover:text-slate-700' : ''
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable !== false && sortKey === col.key && <span>{sortDir === 'asc' ? '▲' : '▼'}</span>}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sortedJobs.map((job) => (
            <tr key={job.id} onClick={() => navigate(`/jobs/${job.id}`)} className="cursor-pointer hover:bg-slate-50">
              <td className="px-4 py-2.5 text-sm font-medium text-slate-800">{job.title}</td>
              {showCompany && <td className="px-4 py-2.5 text-sm text-slate-600">{job.companyName}</td>}
              <td className="px-4 py-2.5 text-sm text-slate-600">
                <div className="flex flex-wrap gap-1">
                  {job.requiredSkills.slice(0, 4).map((s) => (
                    <span key={s} className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">
                      {s}
                    </span>
                  ))}
                  {job.requiredSkills.length > 4 && (
                    <span className="text-[11px] text-slate-400">+{job.requiredSkills.length - 4}</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-2.5 text-sm text-slate-600">
                {job.minExperience}-{job.maxExperience} yrs
              </td>
              <td className="px-4 py-2.5 text-sm text-slate-600">
                {job.shortlistedCount}
                <span className="text-slate-400"> / {job.applicantCount}</span>
              </td>
              <td className="px-4 py-2.5">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
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
