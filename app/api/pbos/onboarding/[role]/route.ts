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
      .select("role,profile_mode,verification_status")
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

    if (contract.state !== "implemented") {
      const completion = await supabase.rpc("complete_playbook_onboarding", {
        expected_role: endpointRole,
        mark_verification_pending: true,
      });
      if (completion.error) throw new Error(completion.error.message);

      const completedProfile = await supabase
        .from("profiles")
        .select("onboarding_completed_at")
        .eq("id", user.id)
        .single();
      if (completedProfile.error) throw new Error(completedProfile.error.message);
      if (!completedProfile.data.onboarding_completed_at) {
        throw new Error("Governed onboarding completion did not persist a completion timestamp.");
      }

      return NextResponse.json(
        {
          ok: true,
          role: contract.role,
          adapter: contract.adapter,
          onboardingSubmitted: true,
          onboardingCompletedAt: completedProfile.data.onboarding_completed_at,
          activationState: contract.state,
          requirement: contract.requirement,
          destination: contract.destination,
          message: `${contract.role} onboarding is complete. Role authority remains fail-closed until its independent activation requirement is satisfied.`,
        },
        { status: 202 }
      );
    }

    // Implemented learner roles delegate only after URL-role and authenticated
    // durable-role equality are proven. The underlying service performs PBOS
    // role equality, persistence, and final profile completion atomically from
    // the user's perspective: any failure leaves onboarding incomplete.
    return await completeScholarRecord(request);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Role onboarding dispatch failed." },
      { status: 400 }
    );
  }
}
