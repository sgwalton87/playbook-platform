export type LifeGraphNodeType =
  | "scholar"
  | "course"
  | "evidence"
  | "skill"
  | "goal"
  | "opportunity"
  | "relationship"
  | "career"
  | "college";

export type LifeGraphEdgeType =
  | "completed"
  | "verified"
  | "supports"
  | "mentors"
  | "unlocked"
  | "applied_to"
  | "interested_in"
  | "working_toward";

export function buildLifeGraph() {
  const nodes = [
    { id: "scholar-maya", type: "scholar", label: "Maya Johnson" },
    { id: "course-biology", type: "course", label: "Biology" },
    { id: "skill-stem", type: "skill", label: "STEM Readiness" },
    { id: "goal-health-career", type: "goal", label: "Health Science Career" },
    { id: "opp-kaiser", type: "opportunity", label: "Kaiser Internship" },
    { id: "mentor-coach", type: "relationship", label: "Mentor" },
  ];

  const edges = [
    { from: "scholar-maya", to: "course-biology", type: "completed" },
    { from: "course-biology", to: "skill-stem", type: "unlocked" },
    { from: "skill-stem", to: "opp-kaiser", type: "unlocked" },
    { from: "mentor-coach", to: "scholar-maya", type: "mentors" },
    { from: "scholar-maya", to: "goal-health-career", type: "working_toward" },
  ];

  return { nodes, edges };
}
