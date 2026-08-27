import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  FileSearch,
  Layers,
  Lock,
  MessageSquareQuote,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const STEPS = [
  { title: "Documents are published", body: "Administrators upload official notices, calendars and policy PDFs." },
  { title: "Text is indexed", body: "Each document is cleaned, split into passages and embedded into a vector index." },
  { title: "Your question is matched", body: "We retrieve the passages that actually address your question." },
  { title: "A grounded answer is written", body: "The assistant answers only from those passages and cites every source." },
];

const CATEGORIES = [
  "Admissions", "Academics", "Examinations", "Fees",
  "Scholarships", "Hostel", "Placements", "Departments",
  "Library", "Student Affairs", "Policies", "Notices",
];

const FEATURES = [
  { icon: FileSearch, title: "Source-cited answers", body: "Every factual answer lists the document name and page it came from." },
  { icon: Layers, title: "Hybrid retrieval", body: "Semantic search combined with keyword search for notice numbers and exact dates." },
  { icon: MessageSquareQuote, title: "Conversation history", body: "Revisit previous questions and continue where you left off." },
  { icon: BookOpen, title: "Knowledge collections", body: "Documents organised by category and department for precise retrieval." },
];

const STATS = [
  { value: "12", label: "Knowledge collections" },
  { value: "100%", label: "Answers with citations" },
  { value: "24/7", label: "Student availability" },
  { value: "<3s", label: "Typical first token" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative isolate overflow-hidden">
          <Image
            src="/images/campus-hero.jpg"
            alt="Historic red-brick college building with a clock tower at golden hour"
            width={1920}
            height={1088}
            priority
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[rgba(20,17,15,0.92)] via-[rgba(20,17,15,0.72)] to-[rgba(20,17,15,0.35)]" />

          <div className="container-editorial py-24 sm:py-32 lg:py-40">
            <div className="max-w-2xl text-white">
              <p className="text-[0.7rem] uppercase tracking-[0.28em] text-white/70">
                Official information assistant
              </p>
              <h1 className="mt-6 text-4xl leading-[1.1] text-white sm:text-5xl lg:text-6xl">
                Answers about your college, drawn from your college&rsquo;s own documents.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80">
                CollegeRAG AI reads the notices, academic calendars, fee schedules and policy documents
                published by the institution, and answers student questions with citations — never
                guesswork.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/chat" className="btn btn-primary">
                  Ask the assistant <ArrowRight size={16} />
                </Link>
                <Link
                  href="/register"
                  className="btn border border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20"
                >
                  Create a student account
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-y border-[var(--color-line)] bg-white">
          <div className="container-editorial grid grid-cols-2 divide-[var(--color-line)] sm:grid-cols-4 sm:divide-x">
            {STATS.map((stat) => (
              <div key={stat.label} className="px-2 py-8 text-center sm:px-6">
                <p className="font-display text-3xl text-[var(--color-crimson)]">{stat.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Sample answer + library image */}
        <section className="container-editorial grid items-center gap-10 py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
          <div className="relative overflow-hidden rounded-md border border-[var(--color-line)]">
            <Image
              src="/images/library.jpg"
              alt="Students studying in a historic university reading room"
              width={1280}
              height={960}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-crimson)]">
              Grounded in the archive
            </p>
            <h2 className="mt-4 text-2xl sm:text-3xl">Every answer traceable to a page</h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--color-ink-soft)]">
              Ask in plain language. The assistant retrieves the exact passages from official documents
              and shows you where each fact came from.
            </p>

            <aside className="card mt-8 p-6 sm:p-7">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">Sample answer</p>
              <p className="mt-4 font-display text-lg">When do the semester examinations begin?</p>
              <p className="mt-4 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                The semester examinations begin on 10 December 2026 and conclude on 24 December 2026.
              </p>
              <div className="mt-6 rule pt-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">Sources</p>
                <p className="mt-2 text-sm">
                  Academic Calendar 2026&ndash;27 <span className="text-[var(--color-ink-soft)]">· Page 4</span>
                </p>
              </div>
            </aside>
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-[var(--color-line)] bg-white py-20">
          <div className="container-editorial">
            <h2 className="text-2xl sm:text-3xl">How it works</h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, i) => (
                <div key={step.title} className="border-t-2 border-[var(--color-crimson)]/25 pt-5">
                  <span className="font-display text-sm text-[var(--color-crimson)]">0{i + 1}</span>
                  <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="container-editorial py-20">
          <h2 className="text-2xl sm:text-3xl">Knowledge categories</h2>
          <p className="mt-3 max-w-2xl text-sm text-[var(--color-ink-soft)]">
            Documents are organised into collections so retrieval stays precise.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <span
                key={category}
                className="rounded-full border border-[var(--color-line)] bg-white px-4 py-1.5 text-sm text-[var(--color-ink-soft)] transition hover:border-[var(--color-crimson)] hover:text-[var(--color-ink)]"
              >
                {category}
              </span>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="border-y border-[var(--color-line)] bg-white py-20">
          <div className="container-editorial">
            <h2 className="text-2xl sm:text-3xl">Built for accuracy</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <div key={title} className="card flex gap-4 p-6">
                  <Icon size={20} className="mt-1 shrink-0 text-[var(--color-crimson)]" />
                  <div>
                    <h3 className="text-base font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="container-editorial grid items-center gap-10 py-20 lg:grid-cols-2 lg:gap-16">
          <div className="grid gap-8">
            <div className="flex gap-4">
              <ShieldCheck size={20} className="mt-1 shrink-0 text-[var(--color-crimson)]" />
              <div>
                <h3 className="text-base font-semibold">Grounded, never invented</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                  If the knowledge base does not contain the answer, the assistant says so instead of
                  fabricating dates, fees or rules.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Lock size={20} className="mt-1 shrink-0 text-[var(--color-crimson)]" />
              <div>
                <h3 className="text-base font-semibold">Secure by design</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                  Hashed passwords, JWT sessions, role-based access and validated uploads. Credentials
                  live only in environment variables.
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-md border border-[var(--color-line)]">
            <Image
              src="/images/students.jpg"
              alt="Students walking together across the campus quad in autumn"
              width={1280}
              height={960}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-[var(--color-line)] bg-[var(--color-crimson)]">
          <div className="container-editorial flex flex-col items-start gap-6 py-16 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl text-white sm:text-3xl">Have a question about your college?</h2>
              <p className="mt-2 text-sm text-white/80">
                Get a cited answer in seconds — from documents your institution actually published.
              </p>
            </div>
            <Link href="/chat" className="btn bg-white text-[var(--color-crimson)] hover:bg-white/90">
              Start asking <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
