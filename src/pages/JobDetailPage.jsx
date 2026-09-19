import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getJobById, getJobCandidates, setCandidateStatus } from '../api/jobsApi';
import { useAuth } from '../context/useAuth';
import JobCard from '../components/jobs/JobCard';
import CandidateTable from '../components/candidates/CandidateTable';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('shortlist');

  const load = useCallback(() => {
    return Promise.all([getJobById(id), getJobCandidates(id)]).then(([jobData, candidateData]) => {
      setJob(jobData);
      setCandidates(candidateData);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    let active = true;
    load().catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [load]);

  async function handleStatusChange(candidateId, status) {
    await setCandidateStatus(id, candidateId, status);
    await load();
  }

  if (loading) return <Loader label="Loading job..." />;
  if (!job) return null;

  const shortlist = candidates.filter((c) => c.status === 'SHORTLISTED');
  const visible = tab === 'shortlist' ? shortlist : candidates;

  return (
    <div className="space-y-6">
      <JobCard job={job} showCompanyLink={isAdmin} />

      <Card bodyClassName="p-0">
        <div className="flex items-center gap-1 border-b border-slate-200 px-3 pt-2">
          {[
            ['shortlist', `Shortlist (${shortlist.length})`],
            ['all', `All screened (${candidates.length})`],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-t-md px-3 py-2 text-[13px] font-medium ${
                tab === key ? 'border-b-2 border-slate-800 text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <CandidateTable candidates={visible} canDecide onStatusChange={handleStatusChange} />
      </Card>
    </div>
  );
}
