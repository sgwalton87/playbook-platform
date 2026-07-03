import type { SupportRole } from "@/lib/collaboration";

export function getRoleNotifications() {
  return [
    {
      role: "scholar" as SupportRole,
      message: "You matched with Kaiser Permanente Health Careers Summer Internship.",
      actionLabel: "Start application",
      route: "/opportunities",
      priority: "high",
    },
    {
      role: "family" as SupportRole,
      message: "Maya needs support gathering documents for an internship application.",
      actionLabel: "View family checklist",
      route: "/family-os",
      priority: "high",
    },
    {
      role: "educator" as SupportRole,
      message: "Maya requested readiness verification for a health careers opportunity.",
      actionLabel: "Verify evidence",
      route: "/educator-os",
      priority: "medium",
    },
    {
      role: "mentor" as SupportRole,
      message: "Maya has an interview-related opportunity and needs practice.",
      actionLabel: "Schedule mock interview",
      route: "/mentor-os",
      priority: "medium",
    },
    {
      role: "district" as SupportRole,
      message: "Health career internship access should be monitored across schools.",
      actionLabel: "View access gap",
      route: "/district-os",
      priority: "low",
    },
    {
      role: "university" as SupportRole,
      message: "A verified health science scholar is emerging in the pipeline.",
      actionLabel: "Add to outreach list",
      route: "/university-os",
      priority: "low",
    },
    {
      role: "employer" as SupportRole,
      message: "A candidate has verified evidence related to your internship pathway.",
      actionLabel: "Review candidate",
      route: "/employer-os",
      priority: "medium",
    },
  ];
}

export function getNotificationForRole(role: SupportRole) {
  return getRoleNotifications().find(item => item.role === role);
}
