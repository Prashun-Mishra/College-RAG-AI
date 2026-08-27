import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-ink)] text-white/70">
      <div className="container-editorial grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <Image src="/images/crest.png" alt="" width={40} height={40} className="h-10 w-10" />
            <p className="font-display text-base font-bold text-white">CollegeRAG AI</p>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Retrieval-augmented answers grounded in official college documents.
          </p>
        </div>

        <div className="text-sm">
          <p className="mb-3 font-semibold uppercase tracking-[0.14em] text-white">Explore</p>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/chat" className="hover:text-white">Ask the assistant</Link></li>
            <li><Link href="/login" className="hover:text-white">Sign in</Link></li>
            <li><Link href="/register" className="hover:text-white">Create account</Link></li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="mb-3 font-semibold uppercase tracking-[0.14em] text-white">Knowledge areas</p>
          <p>Admissions · Academics · Examinations</p>
          <p className="mt-1">Fees · Scholarships · Hostel</p>
          <p className="mt-1">Placements · Library · Policies</p>
        </div>

        <div className="text-sm">
          <p className="mb-3 font-semibold uppercase tracking-[0.14em] text-white">Note</p>
          <p className="leading-relaxed">
            Answers are generated from uploaded documents. Always verify critical deadlines with the
            respective college office.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-editorial py-5 text-xs">
          © {new Date().getFullYear()} CollegeRAG AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
