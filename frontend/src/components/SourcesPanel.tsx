"use client";

import { FileText } from "lucide-react";
import type { Retrieval, Source } from "@/lib/types";

const CONFIDENCE_LABEL: Record<string, string> = { high: "High", medium: "Medium", low: "Low" };

export function SourcesPanel({ sources, retrieval }: { sources: Source[]; retrieval?: Retrieval }) {
  return (
    <div className="flex h-full flex-col">
      <h2 className="text-xs uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">Sources</h2>

      {retrieval && (
        <div className="mt-4 space-y-1 border-b border-[var(--color-line)] pb-4 text-sm">
          <p className="text-[var(--color-ink-soft)]">
            Sources found: <span className="text-[var(--color-ink)]">{retrieval.chunksUsed} relevant sections</span>
          </p>
          <p className="text-[var(--color-ink-soft)]">
            Answer confidence:{" "}
            <span className="text-[var(--color-ink)]">{CONFIDENCE_LABEL[retrieval.confidence] ?? "—"}</span>
          </p>
          <p className="text-xs text-[var(--color-ink-soft)]">
            {retrieval.chunksRetrieved} passages retrieved · {retrieval.chunksUsed} used
          </p>
        </div>
      )}

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
        {!sources.length && (
          <p className="text-sm text-[var(--color-ink-soft)]">
            Ask a question to see the documents behind the answer.
          </p>
        )}

        {sources.map((source, index) => (
          <a
            key={`${source.documentId}-${source.page}-${index}`}
            href={`/documents?highlight=${source.documentId}`}
            className="card block p-4 transition hover:border-[var(--color-crimson)]"
          >
            <div className="flex items-start gap-2">
              <FileText size={15} className="mt-0.5 shrink-0 text-[var(--color-crimson)]" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{source.documentName}</p>
                <p className="text-xs text-[var(--color-ink-soft)]">
                  Page {source.page}
                  {source.category ? ` · ${source.category}` : ""}
                  {typeof source.score === "number" ? ` · relevance ${source.score.toFixed(2)}` : ""}
                </p>
                <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-[var(--color-ink-soft)]">
                  {source.snippet}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
