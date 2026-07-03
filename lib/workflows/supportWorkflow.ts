export function getSupportWorkflow() {
  return {
    scholar: "Maya Johnson",
    opportunity: "Kaiser Permanente Health Careers Summer Internship",
    progress: 57,
    steps: [
      { role: "scholar", task: "Start application", status: "complete" },
      { role: "family", task: "Upload support documents", status: "pending" },
      { role: "educator", task: "Verify readiness evidence", status: "complete" },
      { role: "mentor", task: "Schedule mock interview", status: "pending" },
      { role: "district", task: "Track access gap", status: "watching" },
      { role: "university", task: "Add to outreach list", status: "pending" },
      { role: "employer", task: "Review candidate", status: "pending" },
    ],
  };
}

export function getCompletedWorkflowCount() {
  return getSupportWorkflow().steps.filter(step => step.status === "complete").length;
}
