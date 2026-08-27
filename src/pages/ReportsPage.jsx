import { useEffect, useState } from 'react';
import { generateReport, getReports } from '../api/reportsApi';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    let active = true;
    getReports().then((data) => {
      if (active) {
        setReports(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    const { report } = await generateReport({ title: 'Hiring Report' });
    setReports((prev) => [report, ...prev]);
    setGenerating(false);
  }

  return (
    <Card
      title="Generated Reports"
      action={
        <Button size="sm" loading={generating} onClick={handleGenerate}>
          + Generate New Report
        </Button>
      }
    >
      {loading ? (
        <Loader label="Loading reports..." />
      ) : reports.length === 0 ? (
        <EmptyState title="No reports yet" message="Generate your first hiring report to see it listed here." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {reports.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <svg className="h-8 w-8 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 3.75h6M13.5 3.75H6.75a1.5 1.5 0 00-1.5 1.5v13.5a1.5 1.5 0 001.5 1.5h10.5a1.5 1.5 0 001.5-1.5V8.25L13.5 3.75z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-slate-800">{r.title}</p>
                  <p className="text-xs text-slate-400">Generated {new Date(r.generatedAt).toLocaleString()}</p>
                </div>
              </div>
              <a
                href={r.reportUrl}
                onClick={(e) => r.reportUrl === '#' && e.preventDefault()}
                className="text-xs font-medium text-indigo-600 hover:underline"
              >
                Download PDF
              </a>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
