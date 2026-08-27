import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CollegeRAG AI — Grounded College Information Assistant" },
      {
        name: "description",
        content:
          "CollegeRAG AI answers student questions from official college PDFs using a retrieval-augmented pipeline with cited sources.",
      },
      { property: "og:title", content: "CollegeRAG AI — Grounded College Information Assistant" },
      {
        property: "og:description",
        content:
          "A Next.js + Express + MongoDB + Pinecone RAG assistant that answers only from your college's documents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const steps = [
  { title: "Backend", body: "cd backend && npm install && cp .env.example .env && npm run dev" },
  { title: "Frontend", body: "cd frontend && npm install && cp .env.example .env.local && npm run dev" },
  { title: "Admin", body: "Register the first account at localhost:3000/register — it becomes admin." },
];

function Index() {
  return (
    <main className="min-h-screen bg-background px-6 py-20 text-foreground">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Retrieval-Augmented Generation
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">CollegeRAG AI</h1>
        <p className="mt-4 text-muted-foreground">
          An AI college information assistant that answers strictly from your institution's own PDFs and
          cites the document and page for every answer. The application is built as a standalone
          Next.js frontend and Express API in <code>frontend/</code> and <code>backend/</code>, so it
          runs locally rather than in this preview.
        </p>

        <ol className="mt-10 space-y-4">
          {steps.map((step, i) => (
            <li key={step.title} className="rounded-lg border border-border p-5">
              <h2 className="text-sm font-semibold">
                {i + 1}. {step.title}
              </h2>
              <p className="mt-2 break-words font-mono text-xs text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>

        <p className="mt-10 text-sm text-muted-foreground">
          Full instructions, environment variables and API reference live in <code>README.md</code>;
          the pipeline design is in <code>docs/architecture.md</code>.
        </p>
      </div>
    </main>
  );
}
