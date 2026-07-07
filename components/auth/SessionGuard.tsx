"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/check-email",
  "/auth/callback",
  "/reset-password",
];

const INACTIVITY_LIMIT_MS = 5 * 60 * 1000;

export default function SessionGuard() {
  const pathname = usePathname();

  useEffect(() => {
    const isPublic = PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );

    if (isPublic) return;

    let timer: ReturnType<typeof setTimeout>;

    async function logout() {
      await supabase.auth.signOut();
      window.location.href = "/login";
    }

    function resetTimer() {
      clearTimeout(timer);
      timer = setTimeout(logout, INACTIVITY_LIMIT_MS);
    }

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    function signOutOnClose() {
      const isReloading =
        performance
          .getEntriesByType("navigation")
          .some((entry: any) => entry.type === "reload");

      if (!isReloading) {
        navigator.sendBeacon?.("/api/auth/logout-beacon");
      }
    }

    window.addEventListener("pagehide", signOutOnClose);

    return () => {
      clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      window.removeEventListener("pagehide", signOutOnClose);
    };
  }, [pathname]);

  return null;
}
