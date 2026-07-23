"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getPathway, normalizeRole } from "@/lib/onboarding/pathwayMap";
import type { EmailOtpType } from "@supabase/supabase-js";
import { withTimeout } from "@/lib/async/withTimeout";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<main style={{ padding: 40 }}>Confirming...</main>}>
      <AuthCallbackContent />
    </Suspense>
  );
}

function AuthCallbackContent() {
  const params = useSearchParams();

  useEffect(() => {
    async function finishAuth() {
      const tokenHash = params.get("token_hash");
      const type = params.get("type") || "email";

      if (tokenHash) {
        const { error } = await withTimeout(supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as EmailOtpType,
        }), 12_000, "Email confirmation is taking too long.");

        if (error) {
          console.error("Auth token verification failed:", error.message);
          window.location.href = `/login?error=${encodeURIComponent(error.message)}`;
          return;
        }
      } else {
        const code = params.get("code");

        if (code) {
          const { error } = await withTimeout(supabase.auth.exchangeCodeForSession(code), 12_000, "Sign-in confirmation is taking too long.");
          if (error) {
            console.error("Auth callback exchange failed:", error.message);
            window.location.href = `/login?error=${encodeURIComponent(error.message)}`;
            return;
          }
        }
      }

      const { data, error } = await withTimeout(supabase.auth.getUser(), 10_000, "Your session is taking too long to confirm.");

      if (error || !data.user) {
        window.location.href = "/login";
        return;
      }

      const role = normalizeRole(
        params.get("role") ||
        data.user.user_metadata?.profile_mode ||
        data.user.user_metadata?.role ||
        data.user.user_metadata?.requested_role ||
        "scholar"
      );

      const { data: existing } = await withTimeout(
        supabase.from("profiles").select("id,onboarding_completed,profile_mode,role").eq("id", data.user.id).maybeSingle(),
        10_000,
        "Your Playbook Record is taking too long to load.",
      );

      await withTimeout(supabase.from("profiles").upsert(
        {
          id: data.user.id,
          email: data.user.email,
          role: role,
          profile_mode: role,
          requested_role: role,
          verification_status: "email_confirmed",
          onboarding_completed: existing?.onboarding_completed || false,
        },
        { onConflict: "id" }
      ), 10_000, "Your Playbook Record is taking too long to save.");

      if (existing?.onboarding_completed) {
        window.location.href = getPathway(existing.profile_mode || existing.role || role).osRoute;
      } else {
        window.location.href = `/start?first=1&role=${encodeURIComponent(role)}`;
      }
    }

    finishAuth().catch((error) => {
      const message = error instanceof Error ? error.message : "Authentication could not finish.";
      window.location.href = `/login?error=${encodeURIComponent(message)}`;
    });
  }, [params]);

  return (
    <main style={{ padding: 40 }}>
      Confirming your email and opening your Playbook...
    </main>
  );
}
