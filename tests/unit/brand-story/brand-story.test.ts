import { describe, expect, it } from "vitest";
import fs from "node:fs";
import {
  PLAYBOOK_AUDIENCE_NOTE,
  PLAYBOOK_QUOTES,
  PLAYBOOK_STORY_IMAGES,
} from "@/lib/brand-story";

describe("Playbook brand storytelling layer", () => {
  it("has reusable brand story components", () => {
    expect(fs.existsSync("components/brand-story/PlaybookQuote.tsx")).toBe(true);
    expect(fs.existsSync("components/brand-story/PlaybookStoryBanner.tsx")).toBe(true);
    expect(fs.existsSync("components/brand-story/PlaybookImageCard.tsx")).toBe(true);
  });

  it("centers the scholar journey with original Playbook language", () => {
    expect(PLAYBOOK_QUOTES.start).toContain("Playbook");
    expect(PLAYBOOK_QUOTES.transcript).toContain("transcript");
  });

  it("documents the intended centered audience", () => {
    expect(PLAYBOOK_AUDIENCE_NOTE).toContain("inclusive");
    expect(PLAYBOOK_AUDIENCE_NOTE).toContain("traditionally underserved");
    expect(PLAYBOOK_AUDIENCE_NOTE).toContain("LGBTQIA+");
  });

  it("has story image categories", () => {
    expect(PLAYBOOK_STORY_IMAGES.academic).toContain("unsplash");
    expect(PLAYBOOK_STORY_IMAGES.mentorship).toContain("unsplash");
  });
});
