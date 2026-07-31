import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { artifactDigest } from "../../kernel";
import type { BuildMilestone } from "../../manifests";
import type {
  ScholarPackageArtifact,
  ScholarPackageSet,
  ScholarPackageType,
  ScholarPackageValidation,
} from "./types";

const MILESTONE_ID = "SCHOLAR-EXPERIENCE-V1-PRODUCT-DEFINITION-001" as const;
const SOURCES = [
  "docs/EXPERIENCE/PBOS_SCHOLAR_OS_PRODUCT_ARCHITECTURE.md",
  "docs/EXPERIENCE/PBOS_SCHOLAR_OS_SCREEN_SPECIFICATIONS.md",
  "docs/EXPERIENCE/PBOS_SCHOLAR_OS_USER_JOURNEY_ARCHITECTURE.md",
  "docs/EXPERIENCE/PBOS_SCHOLAR_OS_APPLICATION_ARCHITECTURE.md",
  "docs/EXPERIENCE/PBOS_SCHOLAR_OS_APPLICATION_COMPOSITION_ARCHITECTURE.md",
] as const;

const OUTPUTS: Readonly<Record<ScholarPackageType, string>> = {
  PRODUCT_REQUIREMENTS: "docs/release-evidence/SCHOLAR_EXPERIENCE_V1_PRODUCT_REQUIREMENTS_001.md",
  EXPERIENCE: "docs/release-evidence/SCHOLAR_EXPERIENCE_V1_EXPERIENCE_PACKAGE_001.md",
  ENGINEERING: "docs/release-evidence/SCHOLAR_EXPERIENCE_V1_ENGINEERING_PACKAGE_001.md",
};

function markdown(type: ScholarPackageType): string {
  if (type === "PRODUCT_REQUIREMENTS") return `# Scholar Experience V1 Product Requirements 001

## Product Vision

Give every Scholar one trusted operating experience for understanding identity, current reality, goals, available paths, next actions, human support, and measurable growth.

## User Problem

Scholar information, opportunities, goals, evidence, and support are fragmented. Scholars need an evidence-backed view that explains what is true, what is available, and what governed action can happen next without transferring human agency to software or AI.

## Primary Users

- Scholars own goals, choices, consent, and personal development outcomes.
- Parents, mentors, coaches, counselors, and institutions participate only through explicit role, permission, visibility, consent, and expiration boundaries.

## Scholar Journey

Identity -> Story -> Goals -> Journey -> Opportunities -> Connections -> Growth. The sequence is navigational, supports revision, and preserves historical evidence.

## Capabilities

Scholar Home, Profile, Journey, Goals, Academic and Athletic paths, Opportunities, Connections, Growth, Notifications, Settings, and evidence-linked decision support.

## Feature Requirements

- Present provenance-backed Scholar Record facts without creating canonical truth.
- Explain recommendations through source, evidence, reasoning, confidence, alternatives, and confirmation.
- Enforce role, capability, permission, privacy, and consent at navigation, route, action, and data boundaries.
- Preserve loading, empty, success, error, permission, privacy, offline, stale-evidence, and recovery behavior.
- Keep consequential and irreversible decisions under human authority.

## Success Metrics

- Scholars can identify current state and a governed next action.
- Recommendation acceptance and rejection remain explainable and auditable.
- Permission, privacy, and stale-evidence violations remain fail-closed.
- Core journeys meet accessibility, responsive, performance, and recovery requirements.

## Acceptance Criteria

- Every declared screen and workflow maps to canonical architecture and an accountable owner.
- Every required state is implemented and tested.
- No application surface fabricates facts, authority, eligibility, consent, or completion.
- Build evidence passes PBOS validation before Scholar OS advancement.

## Dependencies

Volumes 30-35, Scholar Record contracts, Product Factory, trusted repository context, Kernel capability decisions, human authorization, execution evidence, and certification separation.
`;
  if (type === "EXPERIENCE") return `# Scholar Experience V1 Experience Package 001

## User Flows

Establish goals; review evidence; choose a next action; discover and evaluate opportunities; request guidance; submit or verify evidence; evaluate progress; recover from failure; revise the journey.

## Screen Inventory

Scholar Home, Profile, Journey, Goals, Academic Path, Athletic Path, Opportunities, Connections and Human Network, Growth, Notifications, and Settings.

## Navigation Architecture

Primary navigation follows Home -> Profile -> Journey -> Goals -> Opportunities -> Connections -> Growth -> Notifications -> Settings. Deep links preserve role, organization, permission, and return context. Navigation visibility never substitutes for route authorization.

## Component Requirements

Journey timeline, evidence item, recommendation explanation, progress measure, opportunity match, mentor interaction, consent control, status panel, recovery action, global navigation, and governed action confirmation.

## Loading States

Preserve layout, label loading regions, and never invent placeholder facts.

## Empty States

Distinguish missing evidence from zero progress and provide a governed creation or recovery path.

## Error States

Identify the unavailable source, preserve last trusted state only when authorized, expose retry or recovery, and never silently degrade authority.

## Success States

Confirm the human action, resulting state, evidence identity, and available next action.

## Accessibility Requirements

Use semantic landmarks, keyboard access, visible focus, assistive-technology labels, readable contrast, reduced-motion support, logical focus order, and non-color status meaning.

## Mobile Requirements

Prioritize current state, next action, evidence capture, deadlines, messages, support, and navigation continuity. Desktop may add comparison and planning without introducing separate truth or authority.

## Data Dependencies

Scholar Record references, goals, milestones, journey and outcome evidence, governed opportunities, support consent, permission decisions, capability decisions, notifications, and provenance-preserving organization sources.
`;
  return `# Scholar Experience V1 Engineering Package 001

## Application Scope

Implement the Scholar Experience V1 shell and governed read experiences defined by the canonical Scholar product, screen, journey, application, and composition architecture. Do not activate unavailable engines or create new authority.

## Routes

Home, profile, journey, goals, academic, athletic, opportunities, connections, growth, notifications, and settings routes must use the existing application routing architecture and preserve deep-link context.

## Components

Use governed shared primitives for navigation, journey timelines, evidence, recommendations, progress, opportunities, consent, statuses, confirmation, and recovery. Component ownership and versioning must conform to Volumes 34 and 35.

## Database Objects

No schema creation is authorized by this package. Implementations consume mapped, permission-safe Scholar Record, goal, milestone, opportunity, relationship, consent, and notification contracts. Any missing database object requires separate governance and migration approval.

## API Requirements

Use server-governed read models and authorized mutation boundaries for Scholar Home, Journey, Goals, Opportunities, Connections, Growth, Notifications, Settings, evidence submission, and consent. APIs must preserve provenance, identity, organization, permission, and audit context.

## Permissions

Enforce module-specific Scholar permissions plus scoped, expiring consent for supporter roles. Hidden navigation, client state, or role labels cannot grant data or mutation authority.

## Testing Requirements

Validate every interface state, route authorization, permission and privacy boundary, keyboard and assistive-technology flow, mobile and desktop behavior, source failure, stale evidence, recommendation explanation, human confirmation, telemetry, and recovery path.

## Implementation Boundaries

- Reuse existing application, design-system, Kernel, capability, authorization, and evidence owners.
- Do not modify constitutional or runtime truth from application code.
- Do not fabricate engine availability, records, eligibility, consent, validation, or completion.
- Keep AI advisory, explainable, provenance-bound, reversible, and subordinate to human authority.
- Require PBOS execution authorization and evidence-gated advancement.
`;
}

function sourceDigests(rootDir: string): Readonly<Record<string, string>> {
  return Object.fromEntries(SOURCES.map((path) => {
    const content = readFileSync(resolve(rootDir, path), "utf8");
    if (!content.trim()) throw new Error(`Scholar package source is empty: ${path}`);
    return [path, artifactDigest(content)];
  }));
}

function compileArtifact(
  type: ScholarPackageType,
  sources: Readonly<Record<string, string>>
): ScholarPackageArtifact {
  const content = markdown(type);
  const contentDigest = artifactDigest(content);
  const identity = artifactDigest({ type, milestone: MILESTONE_ID, sources, content_digest: contentDigest });
  const body = {
    package_id: `SCHOLAR-${type}-${identity.slice(0, 16)}`,
    package_type: type,
    milestone_id: MILESTONE_ID,
    source_digests: sources,
    content_digest: contentDigest,
    path: OUTPUTS[type],
    content,
  };
  return { ...body, artifact_digest: artifactDigest(body) };
}

export function compileScholarExperiencePackageSet(rootDir = process.cwd()): ScholarPackageSet {
  const sources = sourceDigests(rootDir);
  const packages = (["PRODUCT_REQUIREMENTS", "EXPERIENCE", "ENGINEERING"] as const)
    .map((type) => compileArtifact(type, sources));
  return { milestone_id: MILESTONE_ID, packages, digest: artifactDigest({ milestone_id: MILESTONE_ID, packages }) };
}

function renderArtifact(artifact: ScholarPackageArtifact, packageSetDigest: string): string {
  const metadata = JSON.stringify({
    package_id: artifact.package_id,
    package_type: artifact.package_type,
    milestone_id: artifact.milestone_id,
    source_digests: artifact.source_digests,
    content_digest: artifact.content_digest,
    artifact_digest: artifact.artifact_digest,
    package_set_digest: packageSetDigest,
  });
  return `<!-- PBOS_PACKAGE_METADATA ${metadata} -->\n\n${artifact.content}`;
}

export function persistScholarExperiencePackageSet(rootDir = process.cwd()): ScholarPackageSet {
  const packageSet = compileScholarExperiencePackageSet(rootDir);
  for (const artifact of packageSet.packages) {
    const path = resolve(rootDir, artifact.path);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, renderArtifact(artifact, packageSet.digest), "utf8");
  }
  return packageSet;
}

export function validateScholarExperiencePackageSet(
  milestone: BuildMilestone,
  rootDir = process.cwd()
): ScholarPackageValidation {
  const packageSet = compileScholarExperiencePackageSet(rootDir);
  const findings: string[] = [];
  if (milestone.id !== MILESTONE_ID) findings.push("Scholar package milestone authority does not match.");
  for (const artifact of packageSet.packages) {
    if (!milestone.outputs.includes(artifact.path)) findings.push(`Package output is not declared: ${artifact.path}`);
    try {
      const actual = readFileSync(resolve(rootDir, artifact.path), "utf8");
      const expected = renderArtifact(artifact, packageSet.digest);
      if (actual !== expected) findings.push(`Package artifact identity is stale or invalid: ${artifact.path}`);
    } catch {
      findings.push(`Package artifact is missing: ${artifact.path}`);
    }
  }
  return { valid: findings.length === 0, findings, package_set: packageSet };
}
