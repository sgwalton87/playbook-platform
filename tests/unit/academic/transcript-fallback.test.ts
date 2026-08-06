import { describe, expect, it } from "vitest";
import { parseTextPdfTranscript } from "@/lib/academic-transcript-fallback";

function textPdf(text: string): string {
  return Buffer.from(`%PDF-1.4\n1 0 obj\n<<>>\nstream\nBT (${text}) Tj ET\nendstream\nendobj\n%%EOF\n`, "latin1").toString("base64");
}

describe("deterministic transcript fallback", () => {
  it("maps visible text-based PDF coursework into all seven A-G categories", () => {
    const result = parseTextPdfTranscript(
      textPdf("English 9 English 10 Algebra I Geometry Biology World History"),
      "application/pdf",
    );

    expect(result).not.toBeNull();
    expect(Object.keys(result ?? {})).toEqual(["A", "B", "C", "D", "E", "F", "G"]);
    expect(result?.A.courses_taken).toContain("World History");
    expect(result?.B.courses_taken).toEqual(expect.arrayContaining(["English 9", "English 10"]));
    expect(result?.C.courses_taken).toEqual(expect.arrayContaining(["Algebra I", "Geometry"]));
    expect(result?.D.courses_taken).toContain("Biology");
  });

  it("fails closed for images and PDFs without extractable text", () => {
    expect(parseTextPdfTranscript(textPdf("English 9"), "image/png")).toBeNull();
    expect(parseTextPdfTranscript(Buffer.from("%PDF-1.4").toString("base64"), "application/pdf")).toBeNull();
  });
});
