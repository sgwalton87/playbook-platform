export function buildApplicationPlan(input: {
  opportunityName: string;
  opportunityType: "college" | "scholarship" | "internship" | "job" | "recruiting" | "nil";
  deadline?: string;
  missingItems: string[];
}) {
  return {
    opportunityName: input.opportunityName,
    opportunityType: input.opportunityType,
    deadline: input.deadline || null,
    nextSteps: input.missingItems.length
      ? input.missingItems.map((item) => `Complete: ${item}`)
      : ["Review application packet", "Submit before deadline"],
    status: input.missingItems.length ? "action_needed" : "ready_to_submit",
  };
}
