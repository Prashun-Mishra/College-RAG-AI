"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/store/auth";

const COLLEGE = process.env.NEXT_PUBLIC_COLLEGE_NAME ?? "College Knowledge Portal";

export function SiteHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/chat", label: "Ask AI" },
    ...(user?.role === "admin"
      ? [
          { href: "/documents", label: "Documents" },
          { href: "/admin", label: "Dashboard" },
        ]
      : []),
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-line)] bg-white/95 backdrop-blur">
      <div className="hidden bg-[var(--color-ink)] text-white md:block">
        <div className="container-editorial flex h-8 items-center justify-between text-[0.7rem] uppercase tracking-[0.16em] text-white/70">
          <span>{COLLEGE}</span>
          <span>Official student information service</span>
        </div>
      </div>

      <div className="container-editorial flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/images/crest.png" alt="" width={36} height={36} className="h-9 w-9" priority />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-base font-bold text-[var(--color-crimson)] sm:text-lg">
              CollegeRAG AI
            </span>
            <span className="hidden text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-ink-soft)] sm:block">
              {COLLEGE}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`border-b-2 pb-1 text-sm transition ${
                pathname === link.href
                  ? "border-[var(--color-crimson)] text-[var(--color-crimson)]"
                  : "border-transparent text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/settings" className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
                {user.name}
              </Link>
              <button onClick={handleLogout} className="btn btn-outline">
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
                Sign in
              </Link>
              <Link href="/register" className="btn btn-primary">
                Create account
              </Link>
            </div>
          )}
        </nav>

        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle navigation">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--color-line)] bg-white md:hidden">
          <div className="container-editorial flex flex-col gap-3 py-4">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-sm">
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/settings" onClick={() => setOpen(false)} className="text-sm">
                  Settings
                </Link>
                <button onClick={handleLogout} className="text-left text-sm text-[var(--color-crimson)]">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="text-sm">
                  Sign in
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="text-sm text-[var(--color-crimson)]">
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
