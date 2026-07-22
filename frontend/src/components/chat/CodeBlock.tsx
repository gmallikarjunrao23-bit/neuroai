"use client";

import { useState } from "react";
import { Copy, Check, Terminal, FileCode } from "lucide-react";

const LANG_CONFIG: Record<string, { label: string; color: string }> = {
  javascript: { label: "JavaScript", color: "#F7DF1E" },
  typescript: { label: "TypeScript", color: "#3178C6" },
  python: { label: "Python", color: "#3572A5" },
  java: { label: "Java", color: "#B07219" },
  go: { label: "Go", color: "#00ADD8" },
  rust: { label: "Rust", color: "#DEA584" },
  cpp: { label: "C++", color: "#F34B7D" },
  c: { label: "C", color: "#555" },
  csharp: { label: "C#", color: "#178600" },
  ruby: { label: "Ruby", color: "#701516" },
  php: { label: "PHP", color: "#4F5D95" },
  swift: { label: "Swift", color: "#F05138" },
  kotlin: { label: "Kotlin", color: "#A97BFF" },
  scala: { label: "Scala", color: "#DC322F" },
  shell: { label: "Shell", color: "#89E051" },
  bash: { label: "Bash", color: "#89E051" },
  sql: { label: "SQL", color: "#E38C00" },
  html: { label: "HTML", color: "#E34F26" },
  css: { label: "CSS", color: "#1572B6" },
  json: { label: "JSON", color: "#5C5C5C" },
  yaml: { label: "YAML", color: "#CB171E" },
  md: { label: "Markdown", color: "#083FA1" },
  markdown: { label: "Markdown", color: "#083FA1" },
  docker: { label: "Dockerfile", color: "#2496ED" },
  diff: { label: "Diff", color: "#E5534B" },
  jsx: { label: "JSX", color: "#61DAFB" },
  tsx: { label: "TSX", color: "#3178C6" },
  text: { label: "Text", color: "#666" },
};

export function CodeBlock({ code, language = "text", className = "" }: { code: string; language?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const lang = language.toLowerCase() || "text";
  const config = LANG_CONFIG[lang] || { label: lang.charAt(0).toUpperCase() + lang.slice(1), color: "#6B7280" };
  const lines = code.split("\n");

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`my-4 rounded-2xl overflow-hidden border border-[#30363D] bg-[#0D1117] shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161B22] border-b border-[#30363D]">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: config.color }} />
          <FileCode className="w-4 h-4 text-[#8B949E]" />
          <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">{config.label}</span>
        </div>
        <button onClick={copyCode} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#21262D] hover:bg-[#30363D] text-xs text-[#8B949E] hover:text-[#E6EDF3] transition-all">
          {copied ? (
            <><Check className="w-3.5 h-3.5 text-green-500" /><span className="text-green-500">Copied!</span></>
          ) : (
            <><Copy className="w-3.5 h-3.5" /><span>Copy code</span></>
          )}
        </button>
      </div>
      {/* Code content with line numbers */}
      <div className="flex">
        {/* Line numbers */}
        <div className="select-none text-right px-3 pt-3 pb-3 text-xs leading-6 text-[#484F58] border-r border-[#21262D] bg-[#0D1117]" style={{ minWidth: `${String(lines.length).length * 10 + 24}px` }}>
          {lines.map((_, i) => (
            <div key={i} className="leading-6 font-mono text-[11px]">{i + 1}</div>
          ))}
        </div>
        {/* Code */}
        <div className="flex-1 overflow-x-auto">
          <pre className="px-4 pt-3 pb-3 text-sm leading-6 text-[#E6EDF3] font-mono whitespace-pre">
            <code>{code}</code>
          </pre>
        </div>
      </div>
      {/* Bottom bar with chars count */}
      <div className="flex items-center gap-3 px-4 py-1.5 bg-[#161B22] border-t border-[#30363D]">
        <span className="text-[10px] text-[#484F58]">{lines.length} lines</span>
        <span className="text-[10px] text-[#484F58]">{code.length} chars</span>
      </div>
    </div>
  );
}
