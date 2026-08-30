import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getCandidateById } from '../api/candidatesApi';
import { useScope } from '../context/AuthContext';
import { CATEGORICAL, CHART_CHROME, TOOLTIP_STYLE } from '../components/analytics/chartTheme';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import SkillTag from '../components/candidates/SkillTag';
import MatchScoreBadge from '../components/candidates/MatchScoreBadge';
import InterviewQuestionsList from '../components/candidates/InterviewQuestionsList';
import EmptyState from '../components/common/EmptyState';

export default function CandidateProfilePage() {
  const { id } = useParams();
  const scope = useScope();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getCandidateById(id, scope)
      .then((data) => active && setCandidate(data))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <Loader label="Loading candidate..." />;
  if (!candidate) return null;

  const chartData = candidate.matches.slice(0, 6).map((m) => ({ job: m.jobTitle, score: m.matchScore }));

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{candidate.name}</h2>
            <p className="text-sm text-slate-500">
              {[candidate.email, candidate.phone].filter(Boolean).join(' · ') || 'No contact details parsed'}
            </p>
            {candidate.education && <p className="mt-1 text-sm text-slate-500">{candidate.education}</p>}
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-600">
              {candidate.experienceYears} yrs
            </span>
            <span
              className={`rounded-md px-2.5 py-1 text-sm font-medium ${
                candidate.atsScore >= 60 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              ATS {candidate.atsScore}
            </span>
          </div>
        </div>

        {candidate.atsFlags?.length > 0 && (
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            ATS check flagged: {candidate.atsFlags.join('; ')}.
          </div>
        )}

        {candidate.resumeSummary && (
          <div className="mt-4">
            <p className="mb-1 text-[11px] font-semibold uppercase text-slate-400">Resume summary</p>
            <p className="text-sm text-slate-600">{candidate.resumeSummary}</p>
          </div>
        )}

        <div className="mt-4">
          <p className="mb-1.5 text-[11px] font-semibold uppercase text-slate-400">Skills ({candidate.skills.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {candidate.skills.map((s) => (
              <SkillTag key={s}>{s}</SkillTag>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Match scores by job">
          {chartData.length > 0 ? (
            <div className="space-y-4">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_CHROME.grid} />
                    <XAxis dataKey="job" tick={{ fontSize: 10, fill: CHART_CHROME.tick }} interval={0} angle={-15} textAnchor="end" height={54} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: CHART_CHROME.tick }} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Bar dataKey="score" fill={CATEGORICAL.blue} radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2">
                {candidate.matches.map((m) => (
                  <li key={m.id} className="flex items-center justify-between text-sm">
                    <Link to={`/jobs/${m.jobId}`} className="text-slate-600 hover:underline">
                      {m.jobTitle}
                      <span className="text-slate-400"> · {m.companyName}</span>
                    </Link>
                    <MatchScoreBadge score={m.matchScore} showLabel={false} />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <EmptyState title="Not matched to any open job" />
          )}
        </Card>

        <Card title="Suggested interview questions">
          <InterviewQuestionsList questions={candidate.interviewQuestions} />
        </Card>
      </div>
    </div>
  );
}
