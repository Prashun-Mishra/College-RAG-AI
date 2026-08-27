"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/store/auth";

export function Protected({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status !== "ready") return;
    if (!user) router.replace("/login");
    else if (adminOnly && user.role !== "admin") router.replace("/chat");
  }, [status, user, adminOnly, router]);

  if (status !== "ready" || !user || (adminOnly && user.role !== "admin")) {
    return (
      <div className="container-editorial space-y-3 py-16">
        <div className="skeleton h-8 w-56" />
        <div className="skeleton h-4 w-full max-w-lg" />
        <div className="skeleton h-4 w-full max-w-md" />
      </div>
    );
  }

  return <>{children}</>;
}
