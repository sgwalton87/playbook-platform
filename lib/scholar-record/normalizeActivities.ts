import type {
  ActivityCategory,
} from "@/lib/education";

export type CanonicalScholarActivity = {
  id: string;
  category: ActivityCategory | "";
  activity: string;
  roleTitle: string;
  organization: string;
  supervisor: string;
  hoursPerWeek: string;
  totalHours: string;
  description: string;
};

export function normalizeScholarActivities(
  value: unknown
): CanonicalScholarActivity[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (
        !item ||
        typeof item !== "object"
      ) {
        return null;
      }

      const row = item as Record<
        string,
        unknown
      >;

      const activity = String(
        row.activity ||
          row.activity_name ||
          row.name ||
          ""
      ).trim();

      if (!activity) {
        return null;
      }

      return {
        id:
          String(
            row.id || ""
          ).trim() ||
          `activity-${index}`,

        category: String(
          row.category ||
            row.activity_type ||
            ""
        ) as ActivityCategory | "",

        activity,

        roleTitle: String(
          row.roleTitle ||
            row.role_title ||
            row.role ||
            ""
        ).trim(),

        organization: String(
          row.organization || ""
        ).trim(),

        supervisor: String(
          row.supervisor ||
            row.mentor_supervisor ||
            ""
        ).trim(),

        hoursPerWeek: String(
          row.hoursPerWeek ||
            row.hours_per_week ||
            ""
        ).trim(),

        totalHours: String(
          row.totalHours ||
            row.total_hours ||
            row.hours ||
            ""
        ).trim(),

        description: String(
          row.description || ""
        ).trim(),
      };
    })
    .filter(
      (
        activity
      ): activity is CanonicalScholarActivity =>
        activity !== null
    );
}
