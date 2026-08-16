import { NextRequest, NextResponse } from "next/server";
import { POST as completeScholarRecord } from "@/app/api/pbos/scholar/onboarding/route";
import {
  getRoleOnboardingCompletionContract,
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
      .select("role,profile_mode,onboarding_completed,verification_status")
      .eq("id", user.id)
      .maybeSingle();
    if (profile.error) throw new Error(profile.error.message);
    if (!profile.data) {
      return NextResponse.json({ error: "A durable Playbook profile is required." }, { status: 409 });
    }

    const durableRole = normalizeOnboardingRole(profile.data.profile_mode ?? profile.data.role);
    if (durableRole !== endpointRole) {
      return NextResponse.json(
        {
          error: `Onboarding endpoint role ${endpointRole} does not match authenticated profile role ${durableRole}.`,
        },
        { status: 403 }
      );
    }

    if (!profile.data.onboarding_completed) {
      return NextResponse.json(
        { error: `${contract.role} must finish its role-specific onboarding form before completion can be submitted.` },
        { status: 409 }
      );
    }

    if (contract.state !== "implemented") {
      if (profile.data.verification_status !== "approved") {
        const pending = await supabase
          .from("profiles")
          .update({ verification_status: "pending" })
          .eq("id", user.id)
          .eq("profile_mode", endpointRole);
        if (pending.error) throw new Error(pending.error.message);
      }

      return NextResponse.json(
        {
          ok: true,
          role: contract.role,
          adapter: contract.adapter,
          onboardingSubmitted: true,
          activationState: contract.state,
          requirement: contract.requirement,
          destination: contract.destination,
          message: `${contract.role} onboarding is complete. Role authority remains fail-closed until its independent activation requirement is satisfied.`,
        },
        { status: 202 }
      );
    }

    // The three currently implemented learner roles share the canonical Scholar
    // Record service, but only after this role-bound endpoint proves that the URL
    // role and durable profile role are identical. The underlying service then
    // enforces PBOS identity-role equality before persistence.
    return await completeScholarRecord(request);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Role onboarding dispatch failed." },
      { status: 400 }
    );
  }
}
