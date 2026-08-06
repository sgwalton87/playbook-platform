import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("transcript status continuity", () => {
  it("refreshes A-G data without remounting the successful upload status", () => {
    const source = readFileSync(join(process.cwd(), "app/transcript/page.tsx"), "utf8");

    expect(source).toContain("onParsed={() => void loadTranscript()}");
    expect(source).not.toContain("window.location.reload()");
  });
});
