import { Link } from 'react-router-dom';
import Button from '../common/Button';

export default function JobCard({ job }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">{job.title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {job.minExperience}-{job.maxExperience} years experience &middot; {job.applicantCount} applicants
          </p>
        </div>
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            job.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {job.status}
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-600">{job.description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {job.requiredSkills.map((s) => (
          <span key={s} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
            {s}
          </span>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <Link to={`/jobs/${job.id}/edit`}>
          <Button variant="secondary" size="sm">Edit Job</Button>
        </Link>
        <Link to={`/upload?jobId=${job.id}`}>
          <Button variant="primary" size="sm">Upload Resumes</Button>
        </Link>
      </div>
    </div>
  );
}
