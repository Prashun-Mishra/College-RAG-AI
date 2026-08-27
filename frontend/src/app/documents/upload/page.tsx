"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { CATEGORIES } from "@/lib/types";
import { Protected } from "@/components/Protected";
import { SiteHeader } from "@/components/SiteHeader";

export default function UploadPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", description: "", category: "General", department: "", year: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError("Please attach a PDF file.");
      return;
    }
    setLoading(true);
    setError(null);

    const body = new FormData();
    body.append("title", form.title);
    body.append("description", form.description);
    body.append("category", form.category);
    body.append("department", form.department);
    if (form.year) body.append("year", form.year);
    body.append("file", file);

    try {
      await api("/documents", { method: "POST", body });
      router.push("/documents");
    } catch (err) {
      setError(err instanceof Error ? err.message : "The upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Protected adminOnly>
        <main className="container-editorial py-12">
          <h1 className="text-2xl">Upload a document</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-ink-soft)]">
            PDFs only, up to the configured size limit. After upload the document is extracted,
            chunked, embedded and indexed automatically.
          </p>

          <form onSubmit={onSubmit} className="card mt-8 max-w-2xl space-y-5 p-7">
            <div>
              <label className="label" htmlFor="title">Document title</label>
              <input id="title" required className="field" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="category">Category</label>
                <select id="category" className="field" value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="department">Department</label>
                <input id="department" className="field" value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="year">Document year</label>
              <input id="year" type="number" min={1900} max={2200} className="field" value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })} />
            </div>

            <div>
              <label className="label" htmlFor="description">Description</label>
              <textarea id="description" rows={3} className="field" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div>
              <label className="label" htmlFor="file">PDF file</label>
              <input id="file" type="file" accept="application/pdf" required className="field"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>

            {error && <p className="text-sm text-[var(--color-crimson)]">{error}</p>}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Uploading..." : "Upload and process"}
            </button>
          </form>
        </main>
      </Protected>
    </div>
  );
}
