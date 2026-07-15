import { describe, expect, it } from "vitest";
import {
  CALIFORNIA_DISTRICT_NAMES,
  GPA_OPTIONS,
  GRADUATION_YEARS,
  MAJOR_OPTIONS,
  addCustomSchool,
  getSchoolOptions,
  resetCustomSchoolsForTesting,
  searchDistricts,
  searchMajors,
  validateAcademicPath,
} from "@/lib/education";

describe("Playbook Education Engine", () => {
  it("provides GPA values in descending order", () => {
    expect(GPA_OPTIONS[0]).toBe("5.00");
    expect(GPA_OPTIONS).toContain("4.00");
    expect(GPA_OPTIONS).toContain("0.00");
  });

  it("provides future graduation years", () => {
    const currentYear = new Date().getFullYear();

    expect(GRADUATION_YEARS).toContain(
      String(currentYear)
    );

    expect(GRADUATION_YEARS).toContain(
      String(currentYear + 5)
    );
  });

  it("sorts and deduplicates districts", () => {
    const sorted = [...CALIFORNIA_DISTRICT_NAMES].sort(
      (a, b) => a.localeCompare(b)
    );

    expect(CALIFORNIA_DISTRICT_NAMES).toEqual(sorted);

    expect(
      new Set(
        CALIFORNIA_DISTRICT_NAMES.map((name) =>
          name.toLowerCase()
        )
      ).size
    ).toBe(CALIFORNIA_DISTRICT_NAMES.length);
  });

  it("searches districts and majors", () => {
    expect(searchDistricts("Oakland").length).toBeGreaterThan(0);
    expect(searchMajors("computer").length).toBeGreaterThan(0);
  });

  it("supports custom schools without duplicates", () => {
    resetCustomSchoolsForTesting();

    const first = addCustomSchool({
      label: "Playbook Academy",
      district: "Oakland Unified",
    });

    const second = addCustomSchool({
      label: "Playbook Academy",
      district: "Oakland Unified",
    });

    expect(first.id).toBe(second.id);
    expect(
      getSchoolOptions().filter(
        (school) =>
          school.label === "Playbook Academy"
      )
    ).toHaveLength(1);
  });

  it("requires core academic fields but not assessment scores", () => {
    const result = validateAcademicPath({
      school: "Oakland Technical High School",
      school_district: "Oakland Unified",
      grade: "11",
      gpa: "3.50",
      graduation_year: "2027",
      dream_school: "Howard University",
      top_schools: ["Howard University"],
      ela_score: null,
      math_score: null,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("returns errors for missing academic fields", () => {
    const result = validateAcademicPath({});

    expect(result.valid).toBe(false);
    expect(result.errors.school).toBeTruthy();
    expect(result.errors.gpa).toBeTruthy();
    expect(result.errors.top_schools).toBeTruthy();
  });
});

describe("California school dataset", () => {
  it("loads generated California schools", async () => {
    const {
      CALIFORNIA_PUBLIC_SCHOOLS,
      CALIFORNIA_PUBLIC_SCHOOL_COUNT,
    } = await import(
      "@/lib/education/providers/californiaSchools.generated"
    );

    expect(CALIFORNIA_PUBLIC_SCHOOL_COUNT).toBe(
      CALIFORNIA_PUBLIC_SCHOOLS.length
    );

    expect(CALIFORNIA_PUBLIC_SCHOOL_COUNT).toBeGreaterThan(10000);

    expect(
      CALIFORNIA_PUBLIC_SCHOOLS.every(
        (school) =>
          Boolean(school.label) &&
          school.source ===
            "California Department of Education"
      )
    ).toBe(true);
  });
});
