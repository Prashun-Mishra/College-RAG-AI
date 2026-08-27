"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Trash2, Upload } from "lucide-react";
import { api } from "@/lib/api";
import { CATEGORIES, type CollegeDocument, type DocumentStatus } from "@/lib/types";
import { Protected } from "@/components/Protected";
import { SiteHeader } from "@/components/SiteHeader";

const STATUS_STYLE: Record<DocumentStatus, string> = {
  UPLOADED: "text-[var(--color-ink-soft)]",
  PROCESSING: "text-amber-700",
  PROCESSED: "text-emerald-700",
  FAILED: "text-[var(--color-crimson)]",
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<CollegeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (search) params.set("search", search);
      const data = await api<{ documents: CollegeDocument[] }>(`/documents?${params.toString()}`);
      setDocuments(data.documents);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load documents.");
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    void load();
  }, [load]);

  // Poll while any document is still being ingested.
  useEffect(() => {
    const pending = documents.some((d) => d.status === "PROCESSING" || d.status === "UPLOADED");
    if (!pending) return;
    const timer = setInterval(() => void load(), 4000);
    return () => clearInterval(timer);
  }, [documents, load]);

  const reprocess = async (id: string) => {
    await api(`/documents/${id}/reprocess`, { method: "POST" }).catch(() => undefined);
    void load();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this document and its indexed passages?")) return;
    await api(`/documents/${id}`, { method: "DELETE" }).catch(() => undefined);
    void load();
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Protected adminOnly>
        <main className="container-editorial py-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl">Knowledge base documents</h1>
              <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                Upload, monitor and manage the documents that power every answer.
              </p>
            </div>
            <Link href="/documents/upload" className="btn btn-primary">
              <Upload size={15} /> Upload document
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <input
              className="field max-w-xs"
              placeholder="Search by title"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="field max-w-[220px]" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {error && <p className="mt-6 text-sm text-[var(--color-crimson)]">{error}</p>}

          {loading ? (
            <div className="mt-8 space-y-2">
              {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-14 w-full" />)}
            </div>
          ) : (
            <>
              <div className="mt-8 hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
                      <th className="py-3 pr-4">Document</th>
                      <th className="py-3 pr-4">Category</th>
                      <th className="py-3 pr-4">Department</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Uploaded</th>
                      <th className="py-3 pr-4">Chunks</th>
                      <th className="py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc._id} className="border-b border-[var(--color-line)]">
                        <td className="py-3 pr-4">
                          <p className="font-medium">{doc.title}</p>
                          {doc.errorMessage && (
                            <p className="text-xs text-[var(--color-crimson)]">{doc.errorMessage}</p>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-[var(--color-ink-soft)]">{doc.category}</td>
                        <td className="py-3 pr-4 text-[var(--color-ink-soft)]">{doc.department || "—"}</td>
                        <td className={`py-3 pr-4 ${STATUS_STYLE[doc.status]}`}>{doc.status}</td>
                        <td className="py-3 pr-4 text-[var(--color-ink-soft)]">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 pr-4 text-[var(--color-ink-soft)]">{doc.chunkCount}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-xs underline">
                              View
                            </a>
                            <button onClick={() => void reprocess(doc._id)} aria-label="Reprocess">
                              <RefreshCw size={14} />
                            </button>
                            <button
                              onClick={() => void remove(doc._id)}
                              aria-label="Delete"
                              className="hover:text-[var(--color-crimson)]"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 space-y-3 md:hidden">
                {documents.map((doc) => (
                  <div key={doc._id} className="card p-4">
                    <p className="font-medium">{doc.title}</p>
                    <p className="mt-1 text-xs text-[var(--color-ink-soft)]">
                      {doc.category} · {doc.department || "No department"} · {doc.chunkCount} chunks
                    </p>
                    <p className={`mt-2 text-xs ${STATUS_STYLE[doc.status]}`}>{doc.status}</p>
                    <div className="mt-3 flex gap-4 text-xs">
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="underline">View</a>
                      <button onClick={() => void reprocess(doc._id)}>Reprocess</button>
                      <button onClick={() => void remove(doc._id)} className="text-[var(--color-crimson)]">Delete</button>
                    </div>
                  </div>
                ))}
              </div>

              {!documents.length && (
                <p className="mt-10 text-sm text-[var(--color-ink-soft)]">
                  No documents yet. Upload a PDF to build the knowledge base.
                </p>
              )}
            </>
          )}
        </main>
      </Protected>
    </div>
  );
}
