"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      await supabase.auth.getSession();
      router.replace("/onboarding");
    }

    handleCallback();
  }, [router]);

  return (
    <main style={{ padding: 40 }}>
      <p>Signing you in...</p>
    </main>
  );
}