export type RequirementEvidenceState = {
  requirementKey: string;
  reportedState: "complete" | "incomplete";
  athleteEvidenceVerificationState?: "self_reported" | "submitted" | "verified" | "rejected" | "superseded" | null;
};

export type EligibilityRequirementNode = {
  key: string;
  label?: string;
  type?: string;
  logic?: "ALL" | "ANY" | "AT_LEAST";
  count?: number;
  requirements?: EligibilityRequirementNode[];
  options?: EligibilityRequirementNode[];
  [key: string]: unknown;
};

export type SourceBackedEligibilityRuleset = {
  id: string;
  rulesetKey: string;
  governingBody: string;
  pathway: string;
  certificationAuthority: string;
  authorityNote: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceRetrievedAt: string;
  requirements: {
    logic?: "ALL" | "ANY" | "AT_LEAST" | "INSTITUTION_SPECIFIC";
    count?: number;
    requirements?: EligibilityRequirementNode[];
  };
};

export type RequirementReadinessState = "verified" | "reported" | "incomplete" | "unknown";

export type RequirementFinding = {
  key: string;
  label: string;
  state: RequirementReadinessState;
  children: RequirementFinding[];
};

type EvaluatedNode = RequirementFinding & {
  complete: boolean;
  verifiedComplete: boolean;
};

function latestEvidenceByRequirement(evidence: RequirementEvidenceState[]) {
  const map = new Map<string, RequirementEvidenceState>();
  for (const item of evidence) {
    if (!map.has(item.requirementKey)) map.set(item.requirementKey, item);
  }
  return map;
}

function resolveCompositeState(children: EvaluatedNode[], logic: string, count?: number) {
  const requiredCount = logic === "AT_LEAST" ? Math.max(1, count || 1) : children.length;
  const completeCount = children.filter((child) => child.complete).length;
  const verifiedCount = children.filter((child) => child.verifiedComplete).length;

  const complete = logic === "ANY"
    ? completeCount >= 1
    : logic === "AT_LEAST"
      ? completeCount >= requiredCount
      : completeCount === children.length && children.length > 0;

  const verifiedComplete = logic === "ANY"
    ? verifiedCount >= 1
    : logic === "AT_LEAST"
      ? verifiedCount >= requiredCount
      : verifiedCount === children.length && children.length > 0;

  const hasIncomplete = children.some((child) => child.state === "incomplete");
  const hasReported = children.some((child) => child.state === "reported");

  const state: RequirementReadinessState = verifiedComplete
    ? "verified"
    : complete
      ? "reported"
      : hasIncomplete
        ? "incomplete"
        : hasReported
          ? "reported"
          : "unknown";

  return { complete, verifiedComplete, state };
}

function evaluateNode(
  node: EligibilityRequirementNode,
  evidenceMap: Map<string, RequirementEvidenceState>,
): EvaluatedNode {
  const childNodes = node.requirements || node.options || [];
  const logic = node.logic || (childNodes.length ? "ALL" : undefined);

  if (childNodes.length && logic) {
    const children = childNodes.map((child) => evaluateNode(child, evidenceMap));
    const composite = resolveCompositeState(children, logic, node.count);
    return {
      key: node.key,
      label: node.label || node.key,
      state: composite.state,
      complete: composite.complete,
      verifiedComplete: composite.verifiedComplete,
      children,
    };
  }

  const evidence = evidenceMap.get(node.key);
  if (!evidence) {
    return {
      key: node.key,
      label: node.label || node.key,
      state: "unknown",
      complete: false,
      verifiedComplete: false,
      children: [],
    };
  }

  if (evidence.reportedState === "incomplete") {
    return {
      key: node.key,
      label: node.label || node.key,
      state: "incomplete",
      complete: false,
      verifiedComplete: false,
      children: [],
    };
  }

  const verifiedComplete = evidence.athleteEvidenceVerificationState === "verified";
  return {
    key: node.key,
    label: node.label || node.key,
    state: verifiedComplete ? "verified" : "reported",
    complete: true,
    verifiedComplete,
    children: [],
  };
}

export function flattenRequirementNodes(nodes: EligibilityRequirementNode[]): EligibilityRequirementNode[] {
  return nodes.flatMap((node) => [
    node,
    ...flattenRequirementNodes(node.requirements || []),
    ...flattenRequirementNodes(node.options || []),
  ]);
}

export function evaluateSourceBackedEligibilityReadiness(
  ruleset: SourceBackedEligibilityRuleset,
  evidence: RequirementEvidenceState[],
) {
  const evidenceMap = latestEvidenceByRequirement(evidence);
  const topLevel = ruleset.requirements.requirements || [];
  const findings = topLevel.map((node) => evaluateNode(node, evidenceMap));
  const logic = ruleset.requirements.logic || "ALL";
  const overall = resolveCompositeState(findings, logic, ruleset.requirements.count);

  const total = findings.length;
  const complete = findings.filter((finding) => finding.complete).length;
  const verified = findings.filter((finding) => finding.verifiedComplete).length;

  return {
    rulesetId: ruleset.id,
    rulesetKey: ruleset.rulesetKey,
    governingBody: ruleset.governingBody,
    pathway: ruleset.pathway,
    certificationAuthority: ruleset.certificationAuthority,
    authorityNote: ruleset.authorityNote,
    sourceTitle: ruleset.sourceTitle,
    sourceUrl: ruleset.sourceUrl,
    sourceRetrievedAt: ruleset.sourceRetrievedAt,
    readiness: total === 0 ? 0 : Math.round((complete / total) * 100),
    verifiedReadiness: total === 0 ? 0 : Math.round((verified / total) * 100),
    readinessState: overall.complete ? "record_ready" : complete > 0 ? "in_progress" : "unknown",
    officialEligibilityState: "not_determined" as const,
    findings,
  };
}
