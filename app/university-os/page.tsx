"use client";

import RoleDashboardExperience from "@/components/role-os/dashboards/RoleDashboardExperience";

export default function UniversityOSPage() {
  return (
    <RoleDashboardExperience
      role="college-coach"
      allowedRoles={["college-coach", "college-admissions"]}
    />
  );
}
