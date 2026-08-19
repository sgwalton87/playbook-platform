export type PlatformQaGate = {
  id: string;
  title: string;
  category: "role-e2e" | "experience" | "security" | "release" | "launch";
  evidence: "automated" | "operator" | "human-program";
  releaseBlocking: boolean;
  description: string;
};

export const PLATFORM_QA_GATES: readonly PlatformQaGate[] = [
  { id: "QA-ROLE-001", title: "Scholar End-to-End QA", category: "role-e2e", evidence: "operator", releaseBlocking: true, description: "Verify the complete Scholar journey against canonical identity, onboarding, record, learning, opportunity, application, network, messaging, and support services." },
  { id: "QA-ROLE-002", title: "Scholar-Athlete End-to-End QA", category: "role-e2e", evidence: "operator", releaseBlocking: true, description: "Verify Scholar-Athlete academics, athlete evidence, recruiting, eligibility, NIL readiness, opportunity, messaging, and support journeys." },
  { id: "QA-ROLE-003", title: "Parent Guardian End-to-End QA", category: "role-e2e", evidence: "operator", releaseBlocking: true, description: "Verify consented family access, support relationships, notifications, messaging, and Scholar-owned data boundaries." },
  { id: "QA-ROLE-004", title: "Teacher Educator End-to-End QA", category: "role-e2e", evidence: "operator", releaseBlocking: true, description: "Verify educator onboarding, role authority, support context, learning and academic workflows without direct Scholar Record ownership." },
  { id: "QA-ROLE-005", title: "Counselor End-to-End QA", category: "role-e2e", evidence: "operator", releaseBlocking: true, description: "Verify counselor academic planning, application support, relationship authority, messaging, and consent boundaries." },
  { id: "QA-ROLE-006", title: "Mentor End-to-End QA", category: "role-e2e", evidence: "operator", releaseBlocking: true, description: "Verify mentorship matching, active support context, goal support, messaging, and revocation boundaries." },
  { id: "QA-ROLE-007", title: "High School Coach End-to-End QA", category: "role-e2e", evidence: "operator", releaseBlocking: true, description: "Verify coach identity, athlete support, recruiting collaboration, messaging, and least-privilege access." },
  { id: "QA-ROLE-008", title: "College Coach End-to-End QA", category: "role-e2e", evidence: "operator", releaseBlocking: true, description: "Verify verified recruiter discovery, athlete portfolio access, communication, visits/offers, and consented evidence boundaries." },
  { id: "QA-ROLE-009", title: "Admissions End-to-End QA", category: "role-e2e", evidence: "operator", releaseBlocking: true, description: "Verify admissions role authority, published Scholar evidence access, opportunity/application pathways, and privacy controls." },
  { id: "QA-ROLE-010", title: "Brand Partner End-to-End QA", category: "role-e2e", evidence: "operator", releaseBlocking: true, description: "Verify organization verification, campaigns, Marketplace publication, applicant consent projection, outcome tracking, and moderation boundaries." },
  { id: "QA-ROLE-011", title: "Employer End-to-End QA", category: "role-e2e", evidence: "operator", releaseBlocking: true, description: "Verify employer role authority, opportunity publication, applications, messaging, and applicant privacy boundaries." },
  { id: "QA-ROLE-012", title: "Founder End-to-End QA", category: "role-e2e", evidence: "operator", releaseBlocking: true, description: "Verify platform-operator access, Studio, PBOS audit, analytics, verification, moderation, and release governance surfaces." },
  { id: "QA-ROLE-013", title: "Athlete Abroad End-to-End QA", category: "role-e2e", evidence: "operator", releaseBlocking: true, description: "Verify global-readiness gating and all Athlete Abroad shared-service pathways without parallel canonical data owners." },
  { id: "QA-EXP-001", title: "Desktop QA", category: "experience", evidence: "operator", releaseBlocking: true, description: "Verify all critical journeys at supported desktop widths without changing the underlying workflow." },
  { id: "QA-EXP-002", title: "Tablet QA", category: "experience", evidence: "operator", releaseBlocking: true, description: "Verify critical journeys across supported tablet layouts, orientation changes, and touch interactions." },
  { id: "QA-EXP-003", title: "Mobile QA", category: "experience", evidence: "operator", releaseBlocking: true, description: "Verify mobile-first critical journeys, safe areas, touch targets, navigation, forms, and responsive content." },
  { id: "QA-EXP-004", title: "Accessibility QA", category: "experience", evidence: "operator", releaseBlocking: true, description: "Verify keyboard navigation, focus, semantic structure, labels, screen-reader behavior, contrast, reduced motion, and responsive typography." },
  { id: "QA-EXP-005", title: "Performance QA", category: "experience", evidence: "automated", releaseBlocking: true, description: "Verify production build health and measurable performance signals without masking regressions with hard-coded status." },
  { id: "QA-SEC-001", title: "Security QA", category: "security", evidence: "automated", releaseBlocking: true, description: "Verify authentication, authorization, least privilege, secure defaults, dependency audit, and protected administrative boundaries." },
  { id: "QA-SEC-002", title: "RLS Audit", category: "security", evidence: "automated", releaseBlocking: true, description: "Replay and certify database authority boundaries with RLS and explicit RPC contracts from a clean migration chain." },
  { id: "QA-REL-001", title: "Production Build", category: "release", evidence: "automated", releaseBlocking: true, description: "Require exact-head lint, PBOS audit, tests, and production build success before release certification." },
  { id: "QA-LAUNCH-001", title: "Soft Launch", category: "launch", evidence: "human-program", releaseBlocking: true, description: "Run a controlled release with real users, documented scope, rollback criteria, and observed support channels." },
  { id: "QA-LAUNCH-002", title: "Beta Feedback", category: "launch", evidence: "human-program", releaseBlocking: true, description: "Collect, classify, prioritize, and close the loop on beta feedback without treating engagement as automatic approval." },
  { id: "QA-LAUNCH-003", title: "Final Launch QA", category: "launch", evidence: "operator", releaseBlocking: true, description: "Re-run critical journeys and release-blocking evidence on the final immutable release candidate before launch." },
] as const;

export function assertPlatformQaManifest() {
  if (PLATFORM_QA_GATES.length !== 24) throw new Error(`Phase 15 requires 24 QA gates; received ${PLATFORM_QA_GATES.length}.`);
  const ids = new Set(PLATFORM_QA_GATES.map((gate) => gate.id));
  const titles = new Set(PLATFORM_QA_GATES.map((gate) => gate.title));
  if (ids.size !== PLATFORM_QA_GATES.length) throw new Error("Platform QA gate IDs must be unique.");
  if (titles.size !== PLATFORM_QA_GATES.length) throw new Error("Platform QA gate titles must be unique.");
  if (PLATFORM_QA_GATES.some((gate) => !gate.releaseBlocking)) throw new Error("Every canonical Phase 15 QA gate is release blocking.");
}
