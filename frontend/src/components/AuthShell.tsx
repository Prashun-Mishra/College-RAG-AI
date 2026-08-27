import Image from "next/image";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image
          src="/images/campus-hero.jpg"
          alt="Historic college building at golden hour"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[rgba(20,17,15,0.65)]" />
        <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
          <Image src="/images/crest.png" alt="" width={56} height={56} className="h-14 w-14" />
          <p className="mt-6 font-display text-2xl leading-snug text-white">
            Every answer cited. Every source from your college.
          </p>
          <p className="mt-3 max-w-sm text-sm text-white/70">
            Admissions, examinations, fees, scholarships and placements — grounded in official
            documents.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-14 sm:px-10">
        <div className="w-full max-w-md">
          <h1 className="text-2xl sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{subtitle}</p>
          {children}
        </div>
      </div>
    </main>
  );
}
