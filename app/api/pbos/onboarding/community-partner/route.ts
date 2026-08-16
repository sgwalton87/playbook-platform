import { NextRequest } from "next/server";
import { POST as completeRoleOnboarding } from "@/app/api/pbos/onboarding/[role]/route";

export async function POST(request: NextRequest) {
  return completeRoleOnboarding(request);
}
