export type ApplicationRequirement = {
  id: string;
  label: string;
  completed: boolean;
  required: boolean;
};

export function buildApplicationWorkspace(input: {
  scholarId: string;
  opportunityName: string;
  opportunityType: "college" | "scholarship" | "internship" | "job" | "recruiting" | "nil";
  deadline?: string;
  requirements: ApplicationRequirement[];
  evidence?: string[];
}) {
  const required = input.requirements.filter((item) => item.required);
  const completed = required.filter((item) => item.completed);

  const readiness =
    required.length === 0
      ? 100
      : Math.round((completed.length / required.length) * 100);

  return {
    scholar_id: input.scholarId,
    opportunity_name: input.opportunityName,
    opportunity_type: input.opportunityType,
    deadline: input.deadline || null,
    requirements: input.requirements,
    evidence: input.evidence || [],
    status: readiness === 100 ? "ready" : "building",
    readiness,
  };
}

export function getMissingApplicationRequirements(
  workspace: ReturnType<typeof buildApplicationWorkspace>
) {
  return workspace.requirements.filter(
    (item) => item.required && !item.completed
  );
}

export function buildApplicationWorkspaceRecommendations(
  workspace: ReturnType<typeof buildApplicationWorkspace>
) {
  const missing = getMissingApplicationRequirements(workspace);

  if (!missing.length) {
    return ["Review packet one final time", "Submit before the deadline"];
  }

  return missing.map((item) => `Complete: ${item.label}`);
}
