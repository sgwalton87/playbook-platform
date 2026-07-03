export function getSupportNetwork() {
  return {
    scholar: "Maya Johnson",
    center: "Scholar Record",
    nodes: [
      { role: "Scholar", name: "Maya", connection: "Owns the record" },
      { role: "Family", name: "Parent / Guardian", connection: "Supports deadlines and documents" },
      { role: "Educator", name: "Teacher / Counselor", connection: "Verifies readiness" },
      { role: "Mentor", name: "Trusted Adult", connection: "Coaches follow-through" },
      { role: "District", name: "District Team", connection: "Monitors access gaps" },
      { role: "University", name: "Admissions / Outreach", connection: "Identifies pathway fit" },
      { role: "Employer", name: "Workforce Partner", connection: "Reviews verified talent" },
    ],
  };
}
