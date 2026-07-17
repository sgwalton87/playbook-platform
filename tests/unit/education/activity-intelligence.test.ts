import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ACTIVITY_CATEGORIES,
  getActivityOptions,
  searchActivities,
} from "@/lib/education";

import {
  normalizeScholarActivities,
} from "@/lib/scholar-record";

describe("Activities Intelligence", () => {
  it("provides category-specific activity options", () => {
    expect(
      getActivityOptions(
        "Athletics"
      )
    ).toContain("Basketball");

    expect(
      getActivityOptions(
        "Leadership"
      )
    ).toContain(
      "Student Government"
    );

    expect(
      getActivityOptions(
        "Community Service"
      )
    ).toContain(
      "Food Bank Volunteer"
    );
  });

  it("searches only within the selected category", () => {
    expect(
      searchActivities(
        "Athletics",
        "basket"
      )
    ).toContain("Basketball");

    expect(
      searchActivities(
        "Leadership",
        "basket"
      )
    ).toEqual([]);
  });

  it("contains unique categories", () => {
    expect(
      new Set(
        ACTIVITY_CATEGORIES
      ).size
    ).toBe(
      ACTIVITY_CATEGORIES.length
    );
  });

  it("normalizes legacy and new activity entries", () => {
    const activities =
      normalizeScholarActivities([
        {
          activity_type:
            "Community Service",
          activity_name:
            "Food Bank Volunteer",
          role_title: "Volunteer",
          hours_per_week: 3,
          total_hours: 60,
        },
        {
          id: "two",
          category: "Leadership",
          activity:
            "Student Government",
          roleTitle: "President",
          hoursPerWeek: "5",
          totalHours: "120",
        },
      ]);

    expect(activities).toHaveLength(2);

    expect(
      activities[0].activity
    ).toBe(
      "Food Bank Volunteer"
    );

    expect(
      activities[0]
        .hoursPerWeek
    ).toBe("3");

    expect(
      activities[1].roleTitle
    ).toBe("President");
  });
});
