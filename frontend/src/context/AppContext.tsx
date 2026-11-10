"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

export interface FlashMessage {
  type: "success" | "error";
  message: string;
}

interface AppContextValue {
  user: User | null;
  authLoading: boolean;
  flash: FlashMessage | null;
  notify: (type: FlashMessage["type"], message: string) => void;
  dismissFlash: () => void;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [flash, setFlash] = useState<FlashMessage | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    api
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  const dismissFlash = useCallback(() => setFlash(null), []);

  const notify = useCallback((type: FlashMessage["type"], message: string) => {
    clearTimeout(timer.current);
    setFlash({ type, message });
    timer.current = setTimeout(() => setFlash(null), 5000);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setUser(await api.login(username, password));
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string) => {
    setUser(await api.signup(username, email, password));
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  return (
    <AppContext.Provider value={{ user, authLoading, flash, notify, dismissFlash, login, signup, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
