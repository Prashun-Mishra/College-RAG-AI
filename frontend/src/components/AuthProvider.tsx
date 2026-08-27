"use client";

import { useEffect } from "react";
import { useAuth } from "@/store/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const loadSession = useAuth((s) => s.loadSession);
  const status = useAuth((s) => s.status);

  useEffect(() => {
    if (status === "idle") void loadSession();
  }, [status, loadSession]);

  return <>{children}</>;
}
