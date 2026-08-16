import { NextRequest, NextResponse } from "next/server";
import { POST as completeScholarRecord } from "@/app/api/pbos/scholar/onboarding/route";
import {
  buildInstitutionalVerificationEvidence,
  getRoleOnboardingCompletionContract,
  isInstitutionalVerificationRole,
  normalizeOnboardingRole,
} from "@/lib/onboarding";
import { requireUser } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const endpointRoleRaw = request.nextUrl.pathname.split("/").filter(Boolean).at(-1);
    const endpointRole = normalizeOnboardingRole(endpointRoleRaw);
    const contract = getRoleOnboardingCompletionContract(endpointRole);

    const { supabase, user } = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const profile = await supabase
      .from("profiles")
      .select("role,profile_mode,onboarding_data,verification_status")
      .eq("id", user.id)
      .maybeSingle();
    if (profile.error) throw new Error(profile.error.message);

    const durableRole = normalizeOnboardingRole(profile.data?.profile_mode ?? profile.data?.role);
    if (durableRole !== endpointRole) {
      return NextResponse.json(
        {
          error: `Onboarding endpoint role ${endpointRole} does not match authenticated profile role ${durableRole}.`,
        },
        { status: 403 }
      );
    }

    if (contract.state === "verification-gated") {
      if (!isInstitutionalVerificationRole(endpointRole)) {
        throw new Error(`Verification-gated adapter is not registered for ${endpointRole}.`);
      }

      const evidence = buildInstitutionalVerificationEvidence(
        endpointRole,
        (profile.data?.onboarding_data ?? {}) as Record<string, unknown>
      );

      const existing = await supabase
        .from("role_verification_requests")
        .select("id,status,expires_at")
        .eq("user_id", user.id)
        .eq("requested_role", endpointRole)
        .eq("status", "pending")
        .maybeSingle();
      if (existing.error) throw new Error(existing.error.message);

      let verificationRequest = existing.data;
      if (!verificationRequest) {
        const inserted = await supabase
          .from("role_verification_requests")
          .insert({
            user_id: user.id,
            requested_role: endpointRole,
            official_email: evidence.officialEmail,
            organization_name: evidence.organizationName,
            evidence: evidence.evidence,
            status: "pending",
          })
          .select("id,status,expires_at")
          .single();
        if (inserted.error || !inserted.data) {
          throw new Error(inserted.error?.message ?? "Verification request persistence failed.");
        }
        verificationRequest = inserted.data;
      }

      // The browser currently persists onboarding answers before invoking the
      // governed adapter. Institutional roles remain incomplete until privileged
      // verification succeeds; explicitly restore the durable completion flag.
      const incomplete = await supabase
        .from("profiles")
        .update({ onboarding_completed: false, onboarding_completed_at: null })
        .eq("id", user.id);
      if (incomplete.error) throw new Error(incomplete.error.message);

      return NextResponse.json(
        {
          ok: true,
          role: endpointRole,
          adapter: contract.adapter,
          state: "pending_verification",
          destination: "/pending",
          verificationRequest,
          eventualDestination: contract.destination,
        },
        { status: 202 }
      );
    }

    if (contract.state !== "implemented") {
      return NextResponse.json(
        {
          error: `${contract.role} onboarding cannot be completed until its independent governed adapter is certified.`,
          role: contract.role,
          adapter: contract.adapter,
          requirement: contract.requirement,
          destination: contract.destination,
          state: contract.state,
        },
        { status: 409 }
      );
    }

    // The three currently implemented learner roles share the canonical Scholar
    // Record service, but only after this role-bound endpoint proves that the URL
    // role and durable profile role are identical. The underlying service then
    // enforces its own PBOS identity-role equality before persistence.
    return await completeScholarRecord(request);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Role onboarding dispatch failed." },
      { status: 400 }
    );
  }
}
