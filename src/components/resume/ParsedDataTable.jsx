import EmptyState from '../common/EmptyState';
import SkillTag from '../candidates/SkillTag';

export default function ParsedDataTable({ results }) {
  const parsed = results.filter((r) => !r.error);

  if (parsed.length === 0) {
    return <EmptyState title="No parsed data yet" message="Parsed resume data will appear here once processing completes." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Skills</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Experience</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Education</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {parsed.map((r) => (
            <tr key={r.fileName}>
              <td className="px-4 py-3 text-sm font-medium text-slate-800">{r.name}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {r.skills.map((s) => (
                    <SkillTag key={s}>{s}</SkillTag>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">{r.experienceYears} yrs</td>
              <td className="px-4 py-3 text-sm text-slate-600">{r.education}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
