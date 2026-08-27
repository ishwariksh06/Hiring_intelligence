import { useCallback, useRef, useState } from 'react';

export default function UploadDropzone({ onFilesSelected, multiple = true }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback(
    (fileList) => {
      const files = Array.from(fileList).filter((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
      if (files.length > 0) onFilesSelected(files);
    },
    [onFilesSelected]
  );

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors ${
        isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:border-indigo-400'
      }`}
    >
      <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16.5V4.5m0 0L6.75 9.75M12 4.5l5.25 5.25M4.5 19.5h15" />
      </svg>
      <p className="text-sm font-medium text-slate-700">
        Drag &amp; drop {multiple ? 'resumes' : 'a resume'} here, or click to browse
      </p>
      <p className="text-xs text-slate-400">PDF files only{multiple ? ' · bulk upload supported' : ''}</p>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
