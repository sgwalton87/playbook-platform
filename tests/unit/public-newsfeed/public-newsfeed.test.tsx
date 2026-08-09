import { describe, expect, it } from "vitest";
import { isPublicRoute, shouldUseAppShell } from "@/lib/app-shell";
import PublicNewsPage from "@/app/news/page";
import PublicNewsFeed from "@/components/public/PublicNewsFeed";

describe("public Playbook newsfeed", () => {
  it("is public and does not inherit the authenticated application shell", () => {
    expect(isPublicRoute("/news")).toBe(true);
    expect(shouldUseAppShell("/news")).toBe(false);
  });

  it("registers the canonical public page and evidence-backed feed", () => {
    expect(PublicNewsPage).toBeTruthy();
    expect(PublicNewsFeed).toBeTruthy();
  });
});
