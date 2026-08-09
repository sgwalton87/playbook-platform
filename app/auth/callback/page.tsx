"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getPathway, normalizeRole } from "@/lib/onboarding/pathwayMap";
import { getCanonicalOnboardingRoute } from "@/lib/onboarding";
import { getGoogleRequestedRole } from "@/lib/auth/google";
import { PKCE_CALLBACK_ERROR_MESSAGE } from "@/lib/auth/pkce";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<main style={{ padding: 40 }}>Confirming...</main>}>
      <AuthCallbackContent />
    </Suspense>
  );
}

function AuthCallbackContent() {
  const params = useSearchParams();
  const exchangeStarted = useRef(false);

  useEffect(() => {
    if (exchangeStarted.current) return;
    exchangeStarted.current = true;

    async function finishAuth() {
      const tokenHash = params.get("token_hash");
      const type = params.get("type") || "email";

      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as LegacyValue,
        });

        if (error) {
          console.error("Auth token verification failed.");
          window.location.replace("/login?error=auth_callback");
          return;
        }
      } else {
        const code = params.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("Auth callback exchange failed.");
            window.location.replace("/login?error=auth_callback");
            return;
          }
        }
      }

      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        window.location.replace("/login?error=auth_callback");
        return;
      }

      const { data: existing, error: profileReadError } = await supabase
        .from("profiles")
        .select("id,onboarding_completed,profile_mode,role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileReadError) {
        console.error("Auth profile lookup failed.");
        window.location.replace("/login?error=profile_unavailable");
        return;
      }

      const googleRequestedRole = getGoogleRequestedRole(
        params.get("provider"),
        params.get("role"),
        typeof data.user.app_metadata?.provider === "string"
          ? data.user.app_metadata.provider
          : null,
        Boolean(existing)
      );
      const role = normalizeRole(
        existing?.profile_mode ||
        existing?.role ||
        googleRequestedRole ||
        data.user.user_metadata?.profile_mode ||
        data.user.user_metadata?.role ||
        data.user.user_metadata?.requested_role ||
        "scholar"
      );

      const { error: profileWriteError } = await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          role: role,
          profile_mode: role,
          requested_role: role,
          verification_status: "email_confirmed",
          onboarding_completed: existing?.onboarding_completed || false,
        },
        { onConflict: "id" }
      );

      if (profileWriteError) {
        console.error("Auth profile persistence failed.");
        await supabase.auth.signOut();
        window.location.replace("/login?error=profile_unavailable");
        return;
      }

      if (existing?.onboarding_completed) {
        window.location.replace(getPathway(existing.profile_mode || existing.role || role).osRoute);
      } else {
        window.location.replace(getCanonicalOnboardingRoute(role));
      }
    }

    finishAuth();
  }, [params]);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <section aria-labelledby="auth-callback-title" aria-live="polite" style={{ maxWidth: 520 }}>
        <p style={{ margin: "0 0 8px", fontWeight: 700 }}>Secure sign-in</p>
        <h1 id="auth-callback-title" style={{ margin: "0 0 12px" }}>Opening your Playbook</h1>
        <p style={{ margin: 0 }}>
          Confirming your identity with a one-time protected code. You will continue automatically.
        </p>
        <noscript>{PKCE_CALLBACK_ERROR_MESSAGE}</noscript>
      </section>
    </main>
  );
}
