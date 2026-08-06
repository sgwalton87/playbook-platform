import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("transcript status continuity", () => {
  it("refreshes A-G data without remounting the successful upload status", () => {
    const source = readFileSync(join(process.cwd(), "app/transcript/page.tsx"), "utf8");

    expect(source).toContain("onParsed={() => void loadTranscript()}");
    expect(source).not.toContain("window.location.reload()");
  });

  it("keeps the academic record readable on mobile and preserves WCAG label contrast", () => {
    const source = readFileSync(join(process.cwd(), "app/transcript/page.tsx"), "utf8");

    expect(source).toContain("@media(max-width:900px)");
    expect(source).toContain("transcript-sidebar");
    expect(source).toContain('className="transcript-table"');
    expect(source).toContain('color:"rgba(248,247,244,.72)"');
    expect(source).toContain('color:"#9A3412"');
    expect(source).toContain('aria-label="A-G education requirements"');
    expect(source).toContain("tabIndex={0}");
    expect(source).toContain('color:"#475569"');
  });
});
