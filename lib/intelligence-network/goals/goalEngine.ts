export type GoalType =
  | "graduate_high_school"
  | "complete_ag"
  | "submit_fafsa"
  | "earn_scholarships"
  | "get_internship"
  | "college_acceptance"
  | "career_pathway";

export function createGoal(type: GoalType) {
  const tasks: Record<GoalType, string[]> = {
    graduate_high_school: ["Track credits", "Complete required courses", "Maintain attendance"],
    complete_ag: ["Review A-G gaps", "Choose next required course", "Meet counselor"],
    submit_fafsa: ["Create FSA ID", "Gather tax documents", "Submit FAFSA"],
    earn_scholarships: ["Find matches", "Draft essays", "Request recommendations"],
    get_internship: ["Prepare resume", "Add evidence", "Practice interview"],
    college_acceptance: ["Build college list", "Submit applications", "Track decisions"],
    career_pathway: ["Identify career interest", "Find mentor", "Complete pathway opportunity"],
  };

  return {
    id: `goal-${type}`,
    type,
    title: type.replaceAll("_", " "),
    tasks: tasks[type],
    progress: 0,
  };
}
