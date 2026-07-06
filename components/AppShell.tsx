"use client";
import { supabase } from "@/lib/supabaseClient";

async function handleSignOut() {
  await supabase.auth.signOut();
  window.location.href = "/login";
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
