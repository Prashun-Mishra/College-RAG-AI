"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Protected } from "@/components/Protected";
import { SiteHeader } from "@/components/SiteHeader";
import type { CollegeDocument } from "@/lib/types";

interface Dashboard {
  documents: { total: number; processed: number; processing: number; failed: number };
  totalChunks: number;
  totalQuestions: number;
  topCategories: { category: string; count: number }[];
  recentUploads: CollegeDocument[];
}

interface Analytics {
  questionsPerDay: { date: string; count: number }[];
  topDocuments: { documentName: string; count: number }[];
  topTopics: { category: string; count: number }[];
  feedback: { up: number; down: number };
  unansweredQuestions: number;
  totalAnswers: number;
  averageRelevanceScore: number;
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">{label}</p>
      <p className="mt-2 font-display text-2xl">{value}</p>
    </div>
  );
}

export default function AdminPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [d, a] = await Promise.all([
          api<Dashboard>("/admin/dashboard"),
          api<Analytics>("/admin/analytics"),
        ]);
        setDashboard(d);
        setAnalytics(a);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load the dashboard.");
      }
    })();
  }, []);

  const maxPerDay = Math.max(1, ...(analytics?.questionsPerDay.map((d) => d.count) ?? [1]));

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Protected adminOnly>
        <main className="container-editorial py-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl">Administrator dashboard</h1>
              <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                Knowledge base health and assistant usage.
              </p>
            </div>
            <Link href="/documents" className="btn btn-outline">Manage documents</Link>
          </div>

          {error && <p className="mt-6 text-sm text-[var(--color-crimson)]">{error}</p>}

          {!dashboard || !analytics ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <div key={i} className="skeleton h-24 w-full" />)}
            </div>
          ) : (
            <>
              <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Total documents" value={dashboard.documents.total} />
                <Stat label="Processed" value={dashboard.documents.processed} />
                <Stat label="Processing" value={dashboard.documents.processing} />
                <Stat label="Failed" value={dashboard.documents.failed} />
                <Stat label="Indexed chunks" value={dashboard.totalChunks} />
                <Stat label="Questions asked" value={dashboard.totalQuestions} />
                <Stat label="Answers with no source" value={analytics.unansweredQuestions} />
                <Stat label="Avg. relevance" value={analytics.averageRelevanceScore} />
              </section>

              <section className="mt-12 grid gap-8 lg:grid-cols-2">
                <div className="card p-6">
                  <h2 className="text-base font-semibold">Questions per day</h2>
                  <div className="mt-6 flex h-40 items-end gap-2">
                    {analytics.questionsPerDay.length === 0 && (
                      <p className="text-sm text-[var(--color-ink-soft)]">No questions yet.</p>
                    )}
                    {analytics.questionsPerDay.map((day) => (
                      <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                        <div
                          className="w-full bg-[var(--color-crimson)]"
                          style={{ height: `${(day.count / maxPerDay) * 100}%`, minHeight: 3 }}
                          title={`${day.date}: ${day.count}`}
                        />
                        <span className="text-[10px] text-[var(--color-ink-soft)]">{day.date.slice(5)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-6">
                  <h2 className="text-base font-semibold">Feedback</h2>
                  <div className="mt-6 space-y-3 text-sm">
                    <p className="text-[var(--color-ink-soft)]">
                      Helpful: <span className="text-[var(--color-ink)]">{analytics.feedback.up}</span>
                    </p>
                    <p className="text-[var(--color-ink-soft)]">
                      Not helpful: <span className="text-[var(--color-ink)]">{analytics.feedback.down}</span>
                    </p>
                    <p className="text-[var(--color-ink-soft)]">
                      Total answers: <span className="text-[var(--color-ink)]">{analytics.totalAnswers}</span>
                    </p>
                  </div>
                </div>

                <div className="card p-6">
                  <h2 className="text-base font-semibold">Most searched categories</h2>
                  <ul className="mt-4 space-y-2 text-sm text-[var(--color-ink-soft)]">
                    {(analytics.topTopics.length ? analytics.topTopics : dashboard.topCategories).map((t) => (
                      <li key={t.category} className="flex justify-between">
                        <span>{t.category}</span>
                        <span className="text-[var(--color-ink)]">{t.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card p-6">
                  <h2 className="text-base font-semibold">Most used documents</h2>
                  <ul className="mt-4 space-y-2 text-sm text-[var(--color-ink-soft)]">
                    {analytics.topDocuments.length === 0 && <li>No answers cited yet.</li>}
                    {analytics.topDocuments.map((d) => (
                      <li key={d.documentName} className="flex justify-between gap-4">
                        <span className="truncate">{d.documentName}</span>
                        <span className="text-[var(--color-ink)]">{d.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="mt-12">
                <h2 className="text-base font-semibold">Recent uploads</h2>
                <ul className="mt-4 divide-y divide-[var(--color-line)] text-sm">
                  {dashboard.recentUploads.map((doc) => (
                    <li key={doc._id} className="flex flex-wrap justify-between gap-2 py-3">
                      <span>{doc.title}</span>
                      <span className="text-[var(--color-ink-soft)]">
                        {doc.category} · {doc.status} · {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </main>
      </Protected>
    </div>
  );
}
