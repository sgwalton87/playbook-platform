"use client";
import { supabase } from "@/lib/supabaseClient";
import { usePathname } from "next/navigation";

async function handleSignOut() {
  await supabase.auth.signOut();
  window.location.href = "/login";
}

const FULLSCREEN_ROUTES = [
  "/",
  "/login",
  "/check-email",
  "/start",
  "/auth/callback",
  "/pending",
  "/role-select",
  "/reset-password",
];

const AUTH_FULLSCREEN_ROUTES = [
  "/",
  "/login",
  "/check-email",
  "/start",
  "/auth/callback",
  "/pending",
  "/role-select",
  "/reset-password"
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (FULLSCREEN_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return <>{children}</>;
  }
  return <>{children}</>;
}
