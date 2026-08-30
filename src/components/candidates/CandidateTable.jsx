import { Fragment, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MatchScoreBadge from './MatchScoreBadge';
import SkillTag from './SkillTag';
import EmptyState from '../common/EmptyState';

const STATUS_STYLE = {
  SHORTLISTED: 'bg-emerald-50 text-emerald-700',
  REVIEW: 'bg-slate-100 text-slate-600',
  REJECTED: 'bg-red-50 text-red-700',
};

export default function CandidateTable({ candidates, canDecide = false, onStatusChange }) {
  const [sortDir, setSortDir] = useState('desc');
  const [expandedId, setExpandedId] = useState(null);

  const sorted = useMemo(
    () => [...candidates].sort((a, b) => (sortDir === 'desc' ? b.matchScore - a.matchScore : a.matchScore - b.matchScore)),
    [candidates, sortDir]
  );

  if (candidates.length === 0) {
    return <EmptyState title="No candidates screened yet" message="Once resumes are ingested they are scored against this job automatically." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr>
            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Candidate</th>
            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Exp.</th>
            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">ATS</th>
            <th
              onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
              className="cursor-pointer select-none px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700"
            >
              Match {sortDir === 'desc' ? '▼' : '▲'}
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sorted.map((c) => (
            <Fragment key={c.candidateId}>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2.5">
                  <Link to={`/candidates/${c.candidateId}`} className="text-sm font-medium text-slate-800 hover:underline">
                    {c.name}
                  </Link>
                  {c.email && <p className="text-[11px] text-slate-400">{c.email}</p>}
                </td>
                <td className="px-4 py-2.5 text-sm text-slate-600">{c.experienceYears} yrs</td>
                <td className="px-4 py-2.5 text-sm">
                  <span className={c.atsScore >= 60 ? 'text-slate-600' : 'text-amber-600'}>{c.atsScore}</span>
                </td>
                <td className="px-4 py-2.5">
                  <MatchScoreBadge score={c.matchScore} />
                </td>
                <td className="px-4 py-2.5">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[c.status] || STATUS_STYLE.REVIEW}`}>
                    {c.status === 'REVIEW' ? 'Review' : c.status[0] + c.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    onClick={() => setExpandedId(expandedId === c.candidateId ? null : c.candidateId)}
                    className="text-[11px] font-medium text-slate-600 hover:underline"
                  >
                    {expandedId === c.candidateId ? 'Hide' : 'Details'}
                  </button>
                </td>
              </tr>
              {expandedId === c.candidateId && (
                <tr className="bg-slate-50">
                  <td colSpan={6} className="px-4 py-4">
                    <p className="mb-3 text-sm text-slate-600">{c.explanation}</p>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <p className="mb-1.5 text-[11px] font-semibold uppercase text-emerald-600">Matched skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {c.matchedSkills.length ? (
                            c.matchedSkills.map((s) => <SkillTag key={s} variant="strength">{s}</SkillTag>)
                          ) : (
                            <span className="text-xs text-slate-400">None</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="mb-1.5 text-[11px] font-semibold uppercase text-red-600">Missing skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {c.missingSkills.length ? (
                            c.missingSkills.map((s) => <SkillTag key={s} variant="missing">{s}</SkillTag>)
                          ) : (
                            <span className="text-xs text-slate-400">None</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {canDecide && (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => onStatusChange?.(c.candidateId, 'SHORTLISTED')}
                          className="rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-emerald-500"
                        >
                          Shortlist
                        </button>
                        <button
                          onClick={() => onStatusChange?.(c.candidateId, 'REJECTED')}
                          className="rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-white"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => onStatusChange?.(c.candidateId, 'REVIEW')}
                          className="rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-white"
                        >
                          Reset
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
