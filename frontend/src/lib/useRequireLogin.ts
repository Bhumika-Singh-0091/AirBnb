"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "@/context/AppContext";

/** Redirects to /login (remembering where you were) when signed out. */
export function useRequireLogin(message = "You must be logged in to create listing") {
  const { user, authLoading, notify } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading && !user) {
      notify("error", message);
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [authLoading, user, router, pathname, notify, message]);

  return { user, ready: !authLoading && !!user };
}
