"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getCanonicalOnboardingRoute } from "@/lib/onboarding";
import { resolveAuthCallbackRole } from "@/lib/auth/callbackRole";
import { getGoogleRequestedRole } from "@/lib/auth/google";
import { PKCE_CALLBACK_ERROR_MESSAGE } from "@/lib/auth/pkce";
import { getEmailVerificationOtpType, hasVerifiedEmail } from "@/lib/auth/emailVerification";
import { getRoleDestination } from "@/lib/roles/registry";

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
      const emailVerificationType = getEmailVerificationOtpType(params.get("type"));

      if (tokenHash) {
        if (!emailVerificationType) {
          window.location.replace("/check-email?status=invalid");
          return;
        }

        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: emailVerificationType,
        });

        if (error) {
          console.error("Auth token verification failed.");
          window.location.replace("/check-email?status=invalid");
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

      if (error || !data.user || !hasVerifiedEmail(data.user)) {
        await supabase.auth.signOut();
        if (tokenHash) {
          window.location.replace("/check-email?status=invalid");
          return;
        }
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
      const verifiedSignupRole = tokenHash && emailVerificationType === "signup"
        ? data.user.user_metadata?.profile_mode ||
          data.user.user_metadata?.role ||
          data.user.user_metadata?.requested_role
        : null;

      let role;
      try {
        role = resolveAuthCallbackRole({
          // Durable profile identity always outranks mutable auth metadata.
          existingProfileMode: existing?.profile_mode,
          existingProfileRole: existing?.role,
          verifiedSignupRole,
          googleRequestedRole,
          metadataProfileMode: data.user.user_metadata?.profile_mode,
          metadataRole: data.user.user_metadata?.role,
          metadataRequestedRole: data.user.user_metadata?.requested_role,
        });
      } catch {
        console.error("Auth callback role resolution failed closed.");
        await supabase.auth.signOut();
        window.location.replace("/login?error=role_required");
        return;
      }

      const { error: profileWriteError } = await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          role,
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
        window.location.replace(getRoleDestination(role));
      } else {
        window.location.replace(getCanonicalOnboardingRoute(role));
      }
    }

    void finishAuth();
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
