import { ROLE_ONBOARDING } from "./config/roleConfigs";
import { getPathway } from "./pathwayMap";
import {
  PLAYBOOK_ROLES,
  ROLE_ALIASES,
  type PlaybookRole,
} from "@/lib/roles/registry";
import type { OnboardingData, OnboardingStep } from "./types";

function resolveExplicitOnboardingRole(role?: string | null): PlaybookRole {
  const raw = String(role ?? "").trim().toLowerCase();
  if (!raw) return "scholar";
  if (raw in PLAYBOOK_ROLES) return raw as PlaybookRole;
  const alias = ROLE_ALIASES[raw];
  if (alias) return alias;
  throw new Error(`Unsupported Playbook onboarding role: ${raw}`);
}

export function getOnboardingSteps(role?: string | null): OnboardingStep[] {
  const normalized = resolveExplicitOnboardingRole(role);
  const configured = ROLE_ONBOARDING[normalized];
  if (!configured) {
    throw new Error(`No onboarding contract is registered for ${normalized}.`);
  }

  // Transition-Aged Youth is an independent pathway. It may reuse shared
  // Scholar components, but it must never inherit Scholar-Athlete questions.
  if (normalized === "transition-youth") {
    return configured.filter((step) => step.id !== "athlete-profile" && step.id !== "athlete-recruiting");
  }

  return configured;
}

export function getCanonicalOnboardingRoute(role?: string | null): string {
  const normalized = resolveExplicitOnboardingRole(role);
  return `/start?first=1&role=${encodeURIComponent(normalized)}`;
}

export function getOnboardingCompletionDestination(role?: string | null): string {
  const normalized = resolveExplicitOnboardingRole(role);
  return getPathway(normalized).osRoute;
}

export function getOnboardingCompletionEndpoint(role?: string | null): string {
  const normalized = resolveExplicitOnboardingRole(role);
  return `/api/pbos/onboarding/${encodeURIComponent(normalized)}`;
}

export function normalizeOnboardingRole(role?: string | null): PlaybookRole {
  return resolveExplicitOnboardingRole(role);
}

export function createInitialOnboardingData(profile: Record<string, unknown> | null | undefined): OnboardingData {
  const onboarding = (profile?.onboarding_data || {}) as OnboardingData;
  return {
    full_name: (profile?.full_name as string) || "",
    username: (profile?.username as string) || "",
    avatar_url: (profile?.avatar_url as string) || "",
    bio: (profile?.bio as string) || "",
    school: (profile?.school as string) || "",
    grade: (profile?.grade as string) || "",
    dream_school: (profile?.dream_school as string) || "",
    ideal_profession: (profile?.ideal_profession as string) || "",
    top_schools: Array(10).fill(""),
    activities: Array(8).fill(""),
    invite_supporters: Array(5).fill(""),
    ...onboarding,
  };
}
