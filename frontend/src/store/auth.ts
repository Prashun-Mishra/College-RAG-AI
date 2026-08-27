"use client";

import { create } from "zustand";
import { api, tokenStore } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "ready";
  loadSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  status: "idle",

  loadSession: async () => {
    set({ status: "loading" });
    try {
      const { user } = await api<{ user: User }>("/auth/me");
      set({ user, status: "ready" });
    } catch {
      tokenStore.clear();
      set({ user: null, status: "ready" });
    }
  },

  login: async (email, password) => {
    const { user, token } = await api<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    tokenStore.set(token);
    set({ user, status: "ready" });
    return user;
  },

  register: async (name, email, password) => {
    const { user, token } = await api<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    tokenStore.set(token);
    set({ user, status: "ready" });
    return user;
  },

  logout: async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => undefined);
    tokenStore.clear();
    set({ user: null, status: "ready" });
  },

  setUser: (user) => set({ user }),
}));
