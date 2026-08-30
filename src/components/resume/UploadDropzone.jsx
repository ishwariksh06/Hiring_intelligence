import { useCallback, useRef, useState } from 'react';

const ACCEPTED = /\.(pdf|txt|csv|json|md|docx?)$/i;

export default function UploadDropzone({ onFilesSelected, multiple = true }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback(
    (fileList) => {
      const files = Array.from(fileList).filter((f) => ACCEPTED.test(f.name));
      if (files.length > 0) onFilesSelected(files);
    },
    [onFilesSelected]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
        isDragging ? 'border-slate-500 bg-slate-50' : 'border-slate-300 bg-slate-50 hover:border-slate-400'
      }`}
    >
      <svg className="h-9 w-9 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16.5V4.5m0 0L6.75 9.75M12 4.5l5.25 5.25M4.5 19.5h15" />
      </svg>
      <p className="text-sm font-medium text-slate-700">
        Drop resume files here, or click to browse
      </p>
      <p className="text-xs text-slate-400">.txt / .csv / .json parsed directly · .pdf / .docx stored for manual review</p>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.csv,.json,.md,.doc,.docx"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
