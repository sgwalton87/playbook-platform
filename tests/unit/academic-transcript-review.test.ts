import { describe, expect, it } from "vitest";
import { normalizeTranscriptDraft, reviewedDraftToAcademicCourses } from "../../lib/academic-transcript-review";

describe("transcript review contract", () => {
  it("normalizes all seven A-G categories to canonical labels and requirements", () => {
    const draft = normalizeTranscriptDraft({
      C: { years_required: 99, years_completed: 2.5, in_progress: true, courses_taken: ["Geometry", "Geometry", "Algebra II"], current_course: "Precalculus" },
    });

    expect(Object.keys(draft)).toEqual(["A", "B", "C", "D", "E", "F", "G"]);
    expect(draft.C.years_required).toBe(3);
    expect(draft.C.years_completed).toBe(2.5);
    expect(draft.C.courses_taken).toEqual(["Geometry", "Algebra II"]);
    expect(draft.C.current_course).toBe("Precalculus");
    expect(draft.A.years_required).toBe(2);
    expect(draft.G.years_required).toBe(1);
  });

  it("keeps generated parser output separate from scholar-confirmed course projection", () => {
    const draft = normalizeTranscriptDraft({
      B: { years_required: 4, years_completed: 2, in_progress: true, courses_taken: ["English 9", "English 10"], current_course: "English 11" },
    });
    const courses = reviewedDraftToAcademicCourses(draft);

    expect(courses).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: "English 9", agCategory: "B", completed: true }),
      expect.objectContaining({ name: "English 11", agCategory: "B", completed: false }),
    ]));
  });
});
