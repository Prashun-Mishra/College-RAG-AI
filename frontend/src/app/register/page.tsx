"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { AuthShell } from "@/components/AuthShell";
import { useAuth } from "@/store/auth";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuth((s) => s.register);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await register(form.name, form.email, form.password);
      router.push(user.role === "admin" ? "/admin" : "/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create the account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <AuthShell
        title="Create your account"
        subtitle="The first account created on a fresh installation becomes the administrator."
      >
        <>
          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input id="name" required className="field" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" required className="field" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" type="password" required minLength={8} className="field" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <p className="mt-1 text-xs text-[var(--color-ink-soft)]">Minimum 8 characters.</p>
            </div>

            {error && <p className="text-sm text-[var(--color-crimson)]">{error}</p>}

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-[var(--color-ink-soft)]">
            Already registered?{" "}
            <Link href="/login" className="text-[var(--color-crimson)] underline">
              Sign in
            </Link>
          </p>
        </>
      </AuthShell>
    </div>
  );
}
