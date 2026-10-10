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
        'relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3 group',
        isDragging
          ? 'border-sky-500 bg-sky-50 shadow-md'
          : 'border-slate-200 bg-slate-50/60 hover:border-sky-300 hover:bg-sky-50/40'
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptTypes}
        onChange={handleChange}
        className="hidden"
      />

      <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-all shadow-xs">
        <UploadCloud className="w-6 h-6" />
      </div>

      <div>
        <p className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-sky-700 transition-colors">
          {currentFileName ? `Selected File: ${currentFileName}` : label}
        </p>
        <p className="text-xs text-slate-500 mt-1">{sublabel}</p>
      </div>

      {currentFileName && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold mt-1 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Ready for AI Processing</span>
        </div>
      )}
    </div>
  );
};
