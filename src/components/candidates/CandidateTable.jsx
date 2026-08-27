import { Fragment, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MatchScoreBadge from './MatchScoreBadge';
import SkillTag from './SkillTag';
import EmptyState from '../common/EmptyState';

export default function CandidateTable({ candidates }) {
  const [sortDir, setSortDir] = useState('desc');
  const [expandedId, setExpandedId] = useState(null);

  const sorted = useMemo(
    () => [...candidates].sort((a, b) => (sortDir === 'desc' ? b.matchScore - a.matchScore : a.matchScore - b.matchScore)),
    [candidates, sortDir]
  );

  if (candidates.length === 0) {
    return <EmptyState title="No candidates yet" message="Upload resumes for this job to see ranked candidates." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Candidate</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Experience</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Skills</th>
            <th
              onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
              className="cursor-pointer select-none px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700"
            >
              Match Score {sortDir === 'desc' ? '▼' : '▲'}
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sorted.map((c) => (
            <Fragment key={c.candidateId}>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link to={`/candidates/${c.candidateId}`} className="text-sm font-medium text-indigo-700 hover:underline">
                    {c.name}
                  </Link>
                  <p className="text-xs text-slate-400">{c.email}</p>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{c.experienceYears} yrs</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {c.skills.slice(0, 3).map((s) => (
                      <SkillTag key={s}>{s}</SkillTag>
                    ))}
                    {c.skills.length > 3 && <span className="text-xs text-slate-400">+{c.skills.length - 3}</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <MatchScoreBadge score={c.matchScore} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setExpandedId(expandedId === c.candidateId ? null : c.candidateId)}
                    className="text-xs font-medium text-indigo-600 hover:underline"
                  >
                    {expandedId === c.candidateId ? 'Hide details' : 'View details'}
                  </button>
                </td>
              </tr>
              {expandedId === c.candidateId && (
                <tr className="bg-slate-50">
                  <td colSpan={5} className="px-4 py-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="mb-1.5 text-xs font-semibold uppercase text-emerald-600">Strengths</p>
                        <div className="flex flex-wrap gap-1.5">
                          {c.strengths.length > 0 ? (
                            c.strengths.map((s) => (
                              <SkillTag key={s} variant="strength">{s}</SkillTag>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">No standout strengths identified</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="mb-1.5 text-xs font-semibold uppercase text-red-600">Missing Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {c.missingSkills.length > 0 ? (
                            c.missingSkills.map((s) => (
                              <SkillTag key={s} variant="missing">{s}</SkillTag>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">No gaps identified</span>
                          )}
                        </div>
                      </div>
                    </div>
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
