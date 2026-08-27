const STATUS_META = {
  uploading: { label: 'Uploading...', classes: 'text-indigo-600' },
  parsing: { label: 'Parsing...', classes: 'text-amber-600' },
  done: { label: 'Parsed', classes: 'text-emerald-600' },
  error: { label: 'Failed', classes: 'text-red-600' },
};

export default function UploadProgressList({ files }) {
  if (files.length === 0) return null;

  return (
    <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
      {files.map((file) => {
        const meta = STATUS_META[file.status] || STATUS_META.uploading;
        return (
          <li key={file.name} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 3.75h6M13.5 3.75H6.75a1.5 1.5 0 00-1.5 1.5v13.5a1.5 1.5 0 001.5 1.5h10.5a1.5 1.5 0 001.5-1.5V8.25L13.5 3.75z" />
              </svg>
              <span className="text-sm text-slate-700">{file.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {(file.status === 'uploading' || file.status === 'parsing') && (
                <svg className="h-3.5 w-3.5 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
              <span className={`text-xs font-medium ${meta.classes}`}>{meta.label}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
