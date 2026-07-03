import { describe, expect, it } from "vitest";
import { askOracle } from "@/lib/oracle";

describe("Oracle", () => {
  it("answers opportunity questions", () => {
    const answer = askOracle({
      question: "What scholarships match this student?",
      courses: [{ name: "Biology", subject: "science", credits: 10, completed: true }],
    });

    expect(answer.type).toBe("opportunities");
    expect(answer.answer).toContain("matched opportunities");
  });
});
