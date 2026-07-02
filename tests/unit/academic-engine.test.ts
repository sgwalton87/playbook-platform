import { describe, expect, it, vi } from "vitest";
import { handleTranscriptImportedForAcademic } from "@/lib/engines/academic/academicEngine";

vi.mock("@/lib/supabaseClient", () => {
  const chain = {
    insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
  };

  return {
    supabase: {
      from: vi.fn(() => chain),
    },
  };
});

describe("Academic Engine", () => {
  it("processes transcript import events", async () => {
    const report = await handleTranscriptImportedForAcademic({
      recordId: "record-1",
      profileId: "profile-1",
      courses: [
        { name: "English 10", credits: 10 },
        { name: "Algebra II", credits: 10 },
        { name: "Biology", credits: 10 },
      ],
    });

    expect(report?.collegeReadiness).toBeGreaterThan(0);
    expect(report?.passedCredits).toBe(30);
  });
});
