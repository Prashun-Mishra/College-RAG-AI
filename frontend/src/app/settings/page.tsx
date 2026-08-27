"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Protected } from "@/components/Protected";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/store/auth";
import type { User } from "@/lib/types";

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({ name: "", department: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) setProfile({ name: user.name, department: user.department ?? "" });
  }, [user]);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const data = await api<{ user: User }>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify(profile),
      });
      setUser(data.user);
      setMessage("Your profile has been updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update your profile.");
    }
  };

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await api("/auth/password", { method: "PATCH", body: JSON.stringify(passwords) });
      setPasswords({ currentPassword: "", newPassword: "" });
      setMessage("Your password has been changed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change your password.");
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Protected>
        <main className="container-editorial max-w-3xl py-12">
          <h1 className="text-2xl">Settings</h1>

          {message && <p className="mt-4 text-sm text-emerald-700">{message}</p>}
          {error && <p className="mt-4 text-sm text-[var(--color-crimson)]">{error}</p>}

          <form onSubmit={saveProfile} className="card mt-8 space-y-5 p-7">
            <h2 className="text-base font-semibold">Account information</h2>
            <div>
              <label className="label" htmlFor="name">Name</label>
              <input id="name" className="field" value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="department">Department</label>
              <input id="department" className="field" value={profile.department}
                onChange={(e) => setProfile({ ...profile, department: e.target.value })} />
            </div>
            <div>
              <label className="label">Email</label>
              <p className="text-sm text-[var(--color-ink-soft)]">{user?.email}</p>
            </div>
            <div>
              <label className="label">Role</label>
              <p className="text-sm text-[var(--color-ink-soft)] capitalize">{user?.role}</p>
            </div>
            <button className="btn btn-primary" type="submit">Save changes</button>
          </form>

          <form onSubmit={savePassword} className="card mt-8 space-y-5 p-7">
            <h2 className="text-base font-semibold">Change password</h2>
            <div>
              <label className="label" htmlFor="currentPassword">Current password</label>
              <input id="currentPassword" type="password" required className="field"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="newPassword">New password</label>
              <input id="newPassword" type="password" required minLength={8} className="field"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
            </div>
            <button className="btn btn-primary" type="submit">Update password</button>
          </form>
        </main>
      </Protected>
    </div>
  );
}
