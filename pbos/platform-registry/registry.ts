import { existsSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import type {
  PlatformAccessContract,
  PlatformRegistry,
  PlatformResource,
  RoleOperatingSystemContract,
} from "./types";

const ROOT = resolve(process.cwd());
const AUDIT = "docs/REVIEWS/PLAYBOOK_PLATFORM_SYSTEM_AUDIT_001.md";

function filesBelow(directory: string, names: readonly string[]): string[] {
  const root = resolve(ROOT, directory);
  if (!existsSync(root)) return [];
  const found: string[] = [];
  const visit = (path: string): void => {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const child = join(path, entry.name);
      if (entry.isDirectory()) visit(child);
      else if (names.includes(entry.name)) found.push(relative(ROOT, child).replaceAll("\\", "/"));
    }
  };
  visit(root);
  return found.sort();
}

function routePath(file: string, api: boolean): string {
  const withoutRoot = file.replace(/^app/, "").replace(api ? /\/route\.tsx?$/ : /\/page\.tsx$/, "");
  return withoutRoot || "/";
}

function routeOwner(path: string): string {
  if (path.startsWith("/admin")) return "Administrator OS Engineering";
  if (path.startsWith("/scholar-athlete") || path.startsWith("/api/athlete")) return "Scholar-Athlete OS Engineering";
  if (path.startsWith("/brand-partner")) return "Brand Partner OS Engineering";
  if (/^\/(family|mentor|educator|district|university|employer)-os/.test(path)) return "Role OS Engineering";
  if (path.startsWith("/api")) return "Platform API Engineering";
  return "Playbook Application Engineering";
}

function discoveredRoutes(): PlatformResource[] {
  const pages = filesBelow("app", ["page.tsx"]);
  const apis = filesBelow("app/api", ["route.ts", "route.tsx"]);
  return [
    ...pages.map((file): PlatformResource => {
      const path = routePath(file, false);
      const demo = path === "/demo" || path.startsWith("/demo/") || path.startsWith("/studio/");
      return {
        id: `ROUTE:${path}`,
        kind: "ROUTE",
        purpose: `Deliver the ${path} application experience through the Next.js App Router.`,
        owner: routeOwner(path),
        dependencies: ["APPLICATION:WEB"],
        status: demo ? "DEMO_ONLY" : "PARTIAL",
        evidence: [file, AUDIT],
        definition_of_done: [
          "The route has authenticated and authorized data boundaries appropriate to its audience.",
          "Loading, empty, error, success, responsive, and accessible states have executable evidence.",
        ],
      };
    }),
    ...apis.map((file): PlatformResource => {
      const path = routePath(file, true);
      return {
        id: `API:${path}`,
        kind: "API",
        purpose: `Expose the governed server contract at ${path}.`,
        owner: routeOwner(path),
        dependencies: ["APPLICATION:WEB", "CONTROL:AUTHORIZATION", "ENTITY:PERSON"],
        status: "PARTIAL",
        evidence: [file, AUDIT],
        definition_of_done: [
          "Authentication, authorization, validation, abuse controls, persistence, and audit behavior are tested.",
          "Positive and negative integration tests pass against a disposable production-equivalent database.",
        ],
      };
    }),
  ];
}

const ownerAccess: PlatformAccessContract = {
  view: "OWN", edit: "OWN", approve: "NONE", verify: "NONE", administer: "NONE", audit_required: true,
};
const relationshipAccess: PlatformAccessContract = {
  view: "RELATIONSHIP", edit: "RELATIONSHIP", approve: "RELATIONSHIP", verify: "RELATIONSHIP", administer: "NONE", audit_required: true,
};
const adminAccess: PlatformAccessContract = {
  view: "GLOBAL", edit: "GLOBAL", approve: "GLOBAL", verify: "GLOBAL", administer: "GLOBAL", audit_required: true,
};

const dataEntities: PlatformResource[] = [
  ["PERSON", "Canonical human identity anchored by auth.users and profiles.", "profiles", ownerAccess],
  ["ROLE", "Canonical role assignment and role-specific profile state.", "role_profiles", adminAccess],
  ["SCHOLAR_RECORD", "Longitudinal academic, evidence, achievement, and journey record.", "scholar_records", ownerAccess],
  ["ATHLETE_RECORD", "Athletic identity, development, recruiting, and NIL projection.", "athlete_profiles", ownerAccess],
  ["OPPORTUNITY", "Governed opportunity identity, eligibility, and application state.", "opportunities", relationshipAccess],
  ["RELATIONSHIP_GRAPH", "Consented person, supporter, institution, and athlete-network relationships.", "support_relationships", relationshipAccess],
  ["EVIDENCE", "Provenanced artifacts and audited verification decisions.", "evidence_items", relationshipAccess],
  ["PORTFOLIO", "Scholar-owned portfolio packets, snapshots, and controlled shares.", "portfolio_shares", ownerAccess],
].map(([name, purpose, table, access]) => ({
  id: `ENTITY:${name}`,
  kind: "DATABASE_ENTITY" as const,
  purpose: String(purpose),
  owner: "Data Architecture and Security",
  dependencies: name === "PERSON" ? [] : ["ENTITY:PERSON"],
  status: "PARTIAL" as const,
  evidence: ["supabase/migrations", "docs/DATABASE.md", AUDIT],
  definition_of_done: [
    `${String(table)} and all mapped tables have deterministic migration, constraint, index, ownership, and RLS evidence.`,
    "Positive and negative live-database authorization tests pass for every supported actor.",
  ],
  access: access as PlatformAccessContract,
}));

const roleDefinitions = [
  ["SCHOLAR", "Scholar"], ["SCHOLAR_ATHLETE", "Scholar Athlete"], ["PARENT", "Parent or guardian"],
  ["MENTOR", "Mentor"], ["COACH", "Coach"], ["COUNSELOR", "Counselor"],
  ["INSTITUTION", "Institution operator"], ["BRAND_PARTNER", "Brand partner"],
  ["FINANCIAL_ADVISOR", "Financial advisor"], ["ADMINISTRATOR", "Platform administrator"],
] as const;

const roles: PlatformResource[] = roleDefinitions.map(([id, name]) => ({
  id: `ROLE:${id}`,
  kind: "ROLE",
  purpose: `Represent the distinct ${name} authority boundary without aliasing it to another role.`,
  owner: id === "ADMINISTRATOR" ? "Security Governance" : "Identity and Access Governance",
  dependencies: ["ENTITY:PERSON", "ENTITY:ROLE"],
  status: ["FINANCIAL_ADVISOR", "ADMINISTRATOR", "COUNSELOR"].includes(id) ? "BLOCKED" : "PARTIAL",
  evidence: ["lib/roles/registry.ts", "docs/GOVERNANCE/ROLE_REGISTRY.md", AUDIT],
  definition_of_done: [
    "The role has a unique canonical identifier, assignment authority, onboarding path, and route boundary.",
    "Least-privilege positive and negative access tests pass without role aliasing.",
  ],
}));

function osContract(name: string, dashboard: string): RoleOperatingSystemContract {
  return {
    users: [name],
    dashboard,
    workflows: ["onboarding", "relationship management", "governed actions", "review and follow-up"],
    permissions: ["view", "edit", "approve", "verify", "administer"],
    data_access: ["own data", "explicit relationship grants", "role-scoped projections"],
    notifications: ["action required", "verification", "milestone", "safety and intervention"],
    metrics: ["activation", "workflow completion", "time to action", "safe outcome rate"],
  };
}

const operatingSystems: PlatformResource[] = [
  ["SCHOLAR", "Scholar", "/dashboard", "ROLE:SCHOLAR"],
  ["SCHOLAR_ATHLETE", "Scholar Athlete", "/scholar-athlete-os", "ROLE:SCHOLAR_ATHLETE"],
  ["PARENT", "Parent", "/family-os", "ROLE:PARENT"],
  ["MENTOR", "Mentor", "/mentor-os", "ROLE:MENTOR"],
  ["COACH", "Coach", "/educator-os", "ROLE:COACH"],
  ["COUNSELOR", "Counselor", "/educator-os", "ROLE:COUNSELOR"],
  ["INSTITUTION", "Institution", "/university-os", "ROLE:INSTITUTION"],
  ["BRAND_PARTNER", "Brand Partner", "/brand-partner-os", "ROLE:BRAND_PARTNER"],
  ["FINANCIAL_ADVISOR", "Financial Advisor", "/beta-unavailable", "ROLE:FINANCIAL_ADVISOR"],
  ["ADMINISTRATOR", "Administrator", "/admin", "ROLE:ADMINISTRATOR"],
].map(([id, name, dashboard, role]) => ({
  id: `OS:${id}`,
  kind: "OPERATING_SYSTEM" as const,
  purpose: `Govern the complete ${name} experience, permissions, workflows, data, notifications, and outcomes.`,
  owner: `${name} OS Governance`,
  dependencies: [role, "CONTROL:AUTHORIZATION", `ROUTE:${dashboard}`],
  status: dashboard === "/beta-unavailable" ? "MISSING" as const : "PARTIAL" as const,
  evidence: ["docs/PRODUCT/ROLE_OS_ARCHITECTURE.md", AUDIT],
  definition_of_done: [
    "Dashboard, workflows, permissions, data access, notifications, and metrics have end-to-end evidence.",
    "Representative role journeys pass browser and live-database authorization tests.",
  ],
  operating_system: osContract(name, dashboard),
}));

const fixedResources: PlatformResource[] = [
  {
    id: "APPLICATION:WEB", kind: "APPLICATION", purpose: "Deliver the governed Playbook web platform.",
    owner: "Platform Engineering", dependencies: ["CONTROL:ENVIRONMENT", "CONTROL:CI_CD"], status: "PARTIAL",
    evidence: ["app", "next.config.ts", "package.json"], definition_of_done: ["All beta routes pass build, browser, accessibility, performance, and security gates."],
  },
  {
    id: "FEATURE:SCHOLAR_GOVERNED_LOOP", kind: "FEATURE", purpose: "Connect authentication, onboarding, record, opportunity, support, evidence, portfolio, and notifications.",
    owner: "Scholar OS Engineering", dependencies: ["OS:SCHOLAR", "ENTITY:SCHOLAR_RECORD", "ENTITY:OPPORTUNITY", "ENTITY:PORTFOLIO"], status: "BLOCKED",
    evidence: [AUDIT], definition_of_done: ["A seeded Scholar completes the critical loop in a production-equivalent browser and database environment."],
  },
  {
    id: "FEATURE:ATHLETE_NIL_LOOP", kind: "FEATURE", purpose: "Connect athlete identity, recruiting, opportunity, agreement, deliverable, and compliance workflows.",
    owner: "Scholar-Athlete OS Engineering", dependencies: ["OS:SCHOLAR_ATHLETE", "ENTITY:ATHLETE_RECORD", "ENTITY:RELATIONSHIP_GRAPH"], status: "PARTIAL",
    evidence: ["lib/scholar-athlete", "supabase/migrations/202608010009_athlete_network_nil_foundation.sql", AUDIT], definition_of_done: ["Athlete, coach, institution, brand, and compliance journeys pass governed end-to-end tests."],
  },
  ...[
    ["COMPASS", "Explainable navigation and decision support."], ["OPPORTUNITY", "Eligible opportunity discovery and matching."],
    ["CAREER", "Provenanced career pathway intelligence."], ["RESUME", "Human-controlled resume intelligence."],
    ["MENTOR", "Explainable mentor discovery and matching."], ["RECOMMENDATION", "Governed recommendation systems."],
    ["FINANCIAL_LITERACY", "Educational financial literacy guidance without outcome guarantees."],
  ].map(([id, purpose]): PlatformResource => ({
    id: `ENGINE:${id}`, kind: "ENGINE", purpose, owner: "Product Intelligence Governance",
    dependencies: ["CONTROL:AI_GOVERNANCE", "ENTITY:EVIDENCE"], status: "PARTIAL", evidence: ["docs/PRODUCT/ENGINE_REGISTRY.md", AUDIT],
    definition_of_done: ["Inputs, outputs, provenance, explanation, human authority, evaluation, monitoring, and rollback are production-certified."],
  })),
  ...[
    ["AUTHORIZATION", "Enforce canonical role, ownership, relationship, and administrative decisions.", "lib/authorization"],
    ["CI_CD", "Run deterministic lint, test, build, browser, migration, and supply-chain gates.", ".github/workflows/quality.yml"],
    ["ENVIRONMENT", "Validate non-secret runtime configuration and fail closed by deployment tier.", "lib/config/environment.ts"],
    ["DATABASE", "Validate migrations, RLS, constraints, and recovery against a production-equivalent database.", "scripts/validate-rls-contract.ts"],
    ["OBSERVABILITY", "Provide correlated logs, errors, metrics, alerts, and health signals.", "docs/OPERATIONS/PBOS_OBSERVABILITY_ARCHITECTURE_001.md"],
    ["RECOVERY", "Provide tested backup, restore, rollback, and incident procedures.", "docs/RELEASE_PROCESS.md"],
    ["SECURITY", "Validate headers, API abuse boundaries, dependencies, secrets, and negative authorization.", "lib/security/headers.ts"],
    ["AI_GOVERNANCE", "Require consent, provenance, bounded inputs, human authority, and non-fabrication.", "lib/ai/governance.ts"],
  ].map(([id, purpose, evidence]): PlatformResource => ({
    id: `CONTROL:${id}`, kind: "PRODUCTION_CONTROL", purpose, owner: "Platform Reliability and Security",
    dependencies: id === "AUTHORIZATION" ? ["ENTITY:ROLE"] : [], status: id === "RECOVERY" ? "BLOCKED" : "PARTIAL",
    evidence: [evidence, AUDIT], definition_of_done: ["The control has automated validation, operational ownership, retained evidence, alerting where applicable, and a tested failure procedure."],
  })),
  ...dataEntities,
  ...roles,
  ...operatingSystems,
];

export function buildPlatformRegistry(): PlatformRegistry {
  return {
    registry_id: "PLAYBOOK-PLATFORM-REGISTRY-001",
    version: "1.0.0",
    authority: "PBOS-KERNEL",
    milestone_authority: "pbos/manifests/playbook-master-manifest.yaml",
    generated_from_repository: true,
    resources: [...fixedResources, ...discoveredRoutes()],
  };
}

export function repositoryArtifactExists(path: string): boolean {
  return existsSync(resolve(ROOT, path));
}
