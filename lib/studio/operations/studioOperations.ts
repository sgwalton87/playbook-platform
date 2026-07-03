export function getArchitectureNodes() {
  return [
    { id: "record", title: "Scholar Record", detail: "The learner-owned source of truth." },
    { id: "trust", title: "Trust Layer", detail: "Evidence, verification, and confidence." },
    { id: "academic", title: "Academic Intelligence", detail: "Transcript, A-G, readiness, and Academic DNA." },
    { id: "opportunities", title: "Opportunity Graph", detail: "Matches learners to scholarships, mentors, careers, and pathways." },
    { id: "compass", title: "Compass", detail: "Explainable guidance and next actions." },
    { id: "oracle", title: "Oracle", detail: "Query engine over learner intelligence." },
    { id: "studio", title: "Playbook Studio", detail: "Operating console for Playbook OS." },
  ];
}

export function getDocumentationModules() {
  return [
    "PLAYBOOK_OS.md",
    "PRODUCT_ROADMAP.md",
    "DOCUMENTATION_INDEX.md",
    "DOC_REGISTRY.md",
    "CURRENT_ARCHITECTURE.md",
    "PLAYBOOK_DESIGN_SYSTEM.md",
    "PLAYBOOK_SDK.md",
    "ALPHA_1_COMPLETE.md",
  ];
}

export function getReleaseChecks() {
  return [
    { label: "Tests", status: "green" },
    { label: "Build", status: "green" },
    { label: "Sentinel", status: "green" },
    { label: "Cartographer", status: "green" },
    { label: "Doc Governor", status: "green" },
    { label: "Unified Ledger", status: "green" },
  ];
}

export function getSDKModules() {
  return [
    "Academic",
    "Opportunities",
    "Compass",
    "Oracle",
    "Trust",
    "Record",
    "Timeline",
    "Events",
    "Repositories",
    "Graph",
    "UI",
  ];
}

export function getThemes() {
  return [
    { name: "Sunrise", accent: "#F97316", description: "Warm, energetic, opportunity-forward." },
    { name: "Midnight", accent: "#0F172A", description: "Deep, premium, focused." },
    { name: "Academic", accent: "#2563EB", description: "Clear, trusted, school-ready." },
    { name: "Athletics", accent: "#10B981", description: "Momentum, performance, growth." },
    { name: "Healthcare", accent: "#8B5CF6", description: "Calm, human, care-centered." },
    { name: "Accessibility", accent: "#111827", description: "High contrast and clarity." },
  ];
}

export function getSystemMapLayers() {
  return [
    "Living Scholar Experience",
    "Academic Intelligence",
    "Opportunity Graph",
    "Compass",
    "Oracle",
    "Scholar Record",
    "Trust Layer",
    "Event Bus",
    "Unified Ledger",
    "Documentation Intelligence",
    "Playbook Studio",
  ];
}
