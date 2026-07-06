"use client";
import { supabase } from "@/lib/supabaseClient";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
