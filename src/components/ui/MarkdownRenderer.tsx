'use client';

import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Parse markdown blocks (code blocks, headings, lists, paragraphs, quotes)
  const renderFormattedText = (text: string) => {
    // Check for code blocks ```lang ... ```
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, pIdx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const firstLineEnd = part.indexOf('\n');
        const lang = part.slice(3, firstLineEnd > -1 ? firstLineEnd : 3).trim() || 'code';
        const codeContent = firstLineEnd > -1 ? part.slice(firstLineEnd + 1, -3) : part.slice(3, -3);

        return (
          <div key={pIdx} className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md">
            <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900/90 border-b border-slate-800/80 text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-synapse-cyan" />
                <span className="uppercase text-slate-300 font-bold">{lang}</span>
              </div>
              <button
                onClick={() => copyCode(codeContent, pIdx)}
                className="flex items-center gap-1 text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800 transition-colors"
              >
                {copiedIndex === pIdx ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto custom-scrollbar leading-relaxed">
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      }

      // Process regular lines with headers, lists, bold, inline code
      const lines = part.split('\n');
      return (
        <div key={pIdx} className="space-y-2">
          {lines.map((line, lIdx) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={lIdx} className="h-1.5" />;

            // H3
            if (trimmed.startsWith('### ')) {
              return (
                <h3 key={lIdx} className="text-base font-bold text-white pt-2 pb-1 border-b border-slate-800/60 flex items-center gap-2">
                  {formatInline(trimmed.slice(4))}
                </h3>
              );
            }
            // H2
            if (trimmed.startsWith('## ')) {
              return (
                <h2 key={lIdx} className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-synapse-cyan pt-3 pb-1">
                  {formatInline(trimmed.slice(3))}
                </h2>
              );
            }
            // H1
            if (trimmed.startsWith('# ')) {
              return (
                <h1 key={lIdx} className="text-xl font-black text-white pt-3 pb-1">
                  {formatInline(trimmed.slice(2))}
                </h1>
              );
            }

            // Bullet list
            if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
              return (
                <div key={lIdx} className="flex items-start gap-2 pl-2 text-slate-200">
                  <span className="text-synapse-cyan font-bold mt-0.5">•</span>
                  <div className="flex-1 leading-relaxed">{formatInline(trimmed.slice(2))}</div>
                </div>
              );
            }

            // Numbered list (e.g. 1. 2. etc)
            const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
            if (numMatch) {
              return (
                <div key={lIdx} className="flex items-start gap-2.5 pl-2 text-slate-200">
                  <span className="text-synapse-cyan font-bold font-mono text-xs mt-0.5">{numMatch[1]}.</span>
                  <div className="flex-1 leading-relaxed">{formatInline(numMatch[2])}</div>
                </div>
              );
            }

            // Standard Paragraph
            return (
              <p key={lIdx} className="leading-relaxed text-slate-200">
                {formatInline(line)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  // Helper to format bold, italic, and inline code
  const formatInline = (text: string) => {
    // Split by inline code `...`
    const codeParts = text.split(/(`[^`]+`)/g);

    return codeParts.map((cPart, cIdx) => {
      if (cPart.startsWith('`') && cPart.endsWith('`')) {
        return (
          <code
            key={cIdx}
            className="px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-synapse-cyan text-[12px] font-mono mx-0.5"
          >
            {cPart.slice(1, -1)}
          </code>
        );
      }

      // Split by bold **...**
      const boldParts = cPart.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bPart, bIdx) => {
        if (bPart.startsWith('**') && bPart.endsWith('**')) {
          return (
            <strong key={bIdx} className="font-bold text-white">
              {bPart.slice(2, -2)}
            </strong>
          );
        }

        // Split by italic *...*
        const italicParts = bPart.split(/(\*[^*]+\*)/g);
        return italicParts.map((iPart, iIdx) => {
          if (iPart.startsWith('*') && iPart.endsWith('*') && !iPart.startsWith('**')) {
            return (
              <em key={iIdx} className="italic text-slate-300">
                {iPart.slice(1, -1)}
              </em>
            );
          }
          return <React.Fragment key={iIdx}>{iPart}</React.Fragment>;
        });
      });
    });
  };

  return <div className={`space-y-2.5 text-sm ${className}`}>{renderFormattedText(content)}</div>;
};
