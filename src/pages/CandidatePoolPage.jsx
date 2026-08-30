import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCandidates } from '../api/candidatesApi';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import SkillTag from '../components/candidates/SkillTag';
import MatchScoreBadge from '../components/candidates/MatchScoreBadge';

export default function CandidatePoolPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getCandidates({ role: 'ADMIN' }).then((data) => {
      setCandidates(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return candidates.filter((c) => {
      if (filter === 'flagged' && c.atsScore >= 60) return false;
      if (filter === 'shortlistable' && (c.bestMatchScore ?? 0) < 55) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.category || '').toLowerCase().includes(q) ||
        (c.skills || []).some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [candidates, query, filter]);

  if (loading) return <Loader label="Loading candidate pool..." />;

  return (
    <Card title={`Candidate pool (${filtered.length} of ${candidates.length})`}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, skill or category"
          className="w-64 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
        >
          <option value="all">All candidates</option>
          <option value="shortlistable">Strong match somewhere (≥55)</option>
          <option value="flagged">ATS flagged (&lt;60)</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr>
              {['Candidate', 'Category', 'Exp.', 'ATS', 'Best match', 'Skills'].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-3 py-2.5">
                  <Link to={`/candidates/${c.id}`} className="text-sm font-medium text-slate-800 hover:underline">
                    {c.name}
                  </Link>
                  <p className="text-[11px] text-slate-400">{c.sourceFile}</p>
                </td>
                <td className="px-3 py-2.5 text-sm text-slate-600">{c.category || '—'}</td>
                <td className="px-3 py-2.5 text-sm text-slate-600">{c.experienceYears} yrs</td>
                <td className="px-3 py-2.5 text-sm">
                  <span className={c.atsScore >= 60 ? 'text-slate-600' : 'text-amber-600'}>{c.atsScore}</span>
                </td>
                <td className="px-3 py-2.5">
                  {c.bestMatchScore != null ? <MatchScoreBadge score={c.bestMatchScore} showLabel={false} /> : <span className="text-xs text-slate-400">—</span>}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {(c.skills || []).slice(0, 4).map((s) => (
                      <SkillTag key={s}>{s}</SkillTag>
                    ))}
                    {(c.skills || []).length > 4 && <span className="text-[11px] text-slate-400">+{c.skills.length - 4}</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
