import EmptyState from '../common/EmptyState';

export default function InterviewQuestionsList({ questions }) {
  if (!questions || questions.length === 0) {
    return <EmptyState title="No questions generated" message="AI-generated interview questions will appear here." />;
  }

  return (
    <ol className="space-y-3">
      {questions.map((q, idx) => (
        <li key={idx} className="flex gap-3 rounded-md border border-slate-100 bg-slate-50 px-3.5 py-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-semibold text-indigo-700">
            {idx + 1}
          </span>
          <p className="text-sm text-slate-700">{q}</p>
        </li>
      ))}
    </ol>
  );
}
