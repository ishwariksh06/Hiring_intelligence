import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadSampleDataset, uploadResumes } from '../api/resumeApi';
import { resetDb } from '../db/store';
import UploadDropzone from '../components/resume/UploadDropzone';
import UploadProgressList from '../components/resume/UploadProgressList';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SkillTag from '../components/candidates/SkillTag';
import EmptyState from '../components/common/EmptyState';

function ResultTable({ rows }) {
  if (rows.length === 0) return <EmptyState title="Nothing ingested yet" message="Ingested resumes appear here with their ATS score and matched skills." />;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr>
            {['Candidate', 'Exp.', 'ATS', 'Skills', 'ATS flags'].map((h) => (
              <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-2.5 text-sm font-medium text-slate-800">
                <Link to={`/candidates/${r.id}`} className="hover:underline">
                  {r.name}
                </Link>
                <p className="text-[11px] text-slate-400">{r.sourceFile}</p>
              </td>
              <td className="px-4 py-2.5 text-sm text-slate-600">{r.experienceYears} yrs</td>
              <td className="px-4 py-2.5 text-sm">
                <span className={r.atsScore >= 60 ? 'text-emerald-600' : 'text-amber-600'}>{r.atsScore}</span>
              </td>
              <td className="px-4 py-2.5">
                <div className="flex flex-wrap gap-1">
                  {r.skills.slice(0, 5).map((s) => (
                    <SkillTag key={s}>{s}</SkillTag>
                  ))}
                  {r.skills.length > 5 && <span className="text-[11px] text-slate-400">+{r.skills.length - 5}</span>}
                </div>
              </td>
              <td className="px-4 py-2.5 text-[11px] text-amber-700">{r.atsFlags?.join('; ') || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function IngestPage() {
  const [fileStatuses, setFileStatuses] = useState([]);
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const summary = useMemo(() => {
    if (results.length === 0) return null;
    const passed = results.filter((r) => r.atsScore >= 60).length;
    return { total: results.length, passed, flagged: results.length - passed };
  }, [results]);

  async function handleFiles(files) {
    setBusy(true);
    setFileStatuses(files.map((f) => ({ name: f.name, status: 'uploading' })));
    const rows = await uploadResumes(files, {
      onFileStatusChange: (name, status) =>
        setFileStatuses((prev) => prev.map((f) => (f.name === name ? { ...f, status } : f))),
    });
    setResults((prev) => [...rows, ...prev]);
    setBusy(false);
  }

  async function handleSample() {
    setBusy(true);
    const rows = await loadSampleDataset();
    setResults((prev) => [...rows, ...prev]);
    setBusy(false);
  }

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetDb();
    setResults([]);
    setFileStatuses([]);
    setConfirmReset(false);
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Feed candidate resumes in on behalf of your client companies. Each resume is parsed, checked by the ATS
        rules, then scored against every open job automatically.
      </p>

      <Card title="Add resumes">
        <div className="space-y-4">
          <UploadDropzone onFilesSelected={handleFiles} multiple />
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="secondary" loading={busy} onClick={handleSample}>
              Load bundled sample dataset (15 resumes)
            </Button>
            <button onClick={handleReset} className="text-xs font-medium text-slate-400 hover:text-red-600">
              {confirmReset ? 'Click again to confirm reset' : 'Reset local database'}
            </button>
            {confirmReset && (
              <button onClick={() => setConfirmReset(false)} className="text-xs font-medium text-slate-400 hover:text-slate-700">
                Cancel
              </button>
            )}
          </div>
          <UploadProgressList files={fileStatuses} />
        </div>
      </Card>

      {summary && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
            <p className="text-xl font-semibold text-slate-900">{summary.total}</p>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Ingested this session</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
            <p className="text-xl font-semibold text-emerald-600">{summary.passed}</p>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Passed ATS</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
            <p className="text-xl font-semibold text-amber-600">{summary.flagged}</p>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Flagged for review</p>
          </div>
        </div>
      )}

      <Card title="Ingestion results" bodyClassName="p-0">
        <ResultTable rows={results} />
      </Card>
    </div>
  );
}
