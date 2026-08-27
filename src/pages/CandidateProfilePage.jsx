import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getCandidateById, getInterviewQuestions } from '../api/candidatesApi';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import SkillTag from '../components/candidates/SkillTag';
import MatchScoreBadge from '../components/candidates/MatchScoreBadge';
import InterviewQuestionsList from '../components/candidates/InterviewQuestionsList';
import EmptyState from '../components/common/EmptyState';

export default function CandidateProfilePage() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getCandidateById(id), getInterviewQuestions(id)]).then(([candidateData, questionData]) => {
      if (active) {
        setCandidate(candidateData);
        setQuestions(questionData);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <Loader label="Loading candidate profile..." />;
  if (!candidate) return null;

  const chartData = candidate.appliedJobs.map((a) => ({ job: a.jobTitle, score: a.matchScore }));

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">{candidate.name}</h2>
            <p className="text-sm text-slate-500">{candidate.email} &middot; {candidate.phone}</p>
            <p className="mt-1 text-sm text-slate-500">{candidate.education}</p>
          </div>
          <span className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
            {candidate.experienceYears} yrs experience
          </span>
        </div>

        <div className="mt-4">
          <p className="mb-1.5 text-xs font-semibold uppercase text-slate-400">Resume Summary</p>
          <p className="text-sm text-slate-600">{candidate.resumeSummary}</p>
        </div>

        <div className="mt-4">
          <p className="mb-1.5 text-xs font-semibold uppercase text-slate-400">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {candidate.skills.map((s) => (
              <SkillTag key={s}>{s}</SkillTag>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Match Score History">
          {chartData.length > 0 ? (
            <div className="space-y-4">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="job" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2">
                {candidate.appliedJobs.map((a) => (
                  <li key={a.jobId} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{a.jobTitle}</span>
                    <MatchScoreBadge score={a.matchScore} showLabel={false} />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <EmptyState title="No applications yet" />
          )}
        </Card>

        <Card title="AI-Generated Interview Questions">
          <InterviewQuestionsList questions={questions} />
        </Card>
      </div>
    </div>
  );
}
