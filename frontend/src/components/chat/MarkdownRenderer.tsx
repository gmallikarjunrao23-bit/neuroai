"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-0 prose-code:text-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;
            
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 rounded-md bg-[#1E1E2E] text-[#E6EDF3] text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            }

            const codeContent = String(children).replace(/\n$/, "");
            const language = match ? match[1] : "text";

            return <CodeBlock code={codeContent} language={language} />;
          },
          pre({ children }) {
            return <>{children}</>;
          },
          p({ children }) {
            return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
          },
          ul({ children }) {
            return <ul className="mb-3 space-y-1.5 list-disc pl-5">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="mb-3 space-y-1.5 list-decimal pl-5">{children}</ol>;
          },
          li({ children }) {
            return <li className="text-sm leading-relaxed">{children}</li>;
          },
          h1({ children }) {
            return <h1 className="text-lg font-bold mb-3 mt-4">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-base font-bold mb-2 mt-3">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-sm font-semibold mb-2 mt-3">{children}</h3>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-2 border-[#6366F1] pl-4 italic text-muted-foreground mb-3">
                {children}
              </blockquote>
            );
          },
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#6366F1] hover:underline">
                {children}
              </a>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto mb-3 rounded-lg border border-border">
                <table className="w-full text-sm">{children}</table>
              </div>
            );
          },
          th({ children }) {
            return <th className="px-3 py-2 bg-secondary font-medium text-left border-b border-border">{children}</th>;
          },
          td({ children }) {
            return <td className="px-3 py-2 border-b border-border">{children}</td>;
          },
          hr() {
            return <hr className="my-4 border-border" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
