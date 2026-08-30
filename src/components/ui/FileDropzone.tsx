'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  acceptTypes?: string;
  label?: string;
  sublabel?: string;
  currentFileName?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelect,
  acceptTypes = '.csv, .xlsx, .pdf, .txt, .json, .docx',
  label = 'Drag and drop your file here or click to browse',
  sublabel = 'Supports CSV, XLSX, PDF, DOCX, TXT up to 50MB',
  currentFileName,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3 group',
        isDragging
          ? 'border-synapse-cyan bg-synapse-cyan/10 shadow-[0_0_25px_rgba(0,242,254,0.2)]'
          : 'border-slate-800 bg-slate-900/40 hover:border-synapse-cyan/50 hover:bg-slate-900/80'
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptTypes}
        onChange={handleChange}
        className="hidden"
      />

      <div className="w-14 h-14 rounded-2xl bg-synapse-cyan/10 border border-synapse-cyan/30 flex items-center justify-center text-synapse-cyan group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(0,242,254,0.4)] transition-all">
        <UploadCloud className="w-7 h-7" />
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-200 group-hover:text-synapse-cyan transition-colors">
          {currentFileName ? `Selected File: ${currentFileName}` : label}
        </p>
        <p className="text-xs text-slate-400 mt-1">{sublabel}</p>
      </div>

      {currentFileName && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-medium mt-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Ready for AI Processing</span>
        </div>
      )}
    </div>
  );
};
