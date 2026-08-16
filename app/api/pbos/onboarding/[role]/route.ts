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
      .select("role,profile_mode")
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
