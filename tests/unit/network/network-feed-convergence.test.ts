import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("canonical network and feed convergence", () => {
  it("keeps public news author identity behind the bounded projection", () => {
    const source = read("components/public/PublicNewsFeed.tsx");
    expect(source).toContain('rpc("get_public_member_identities"');
    expect(source).not.toContain('.from("profiles")');
  });

  it("keeps member discovery behind the authenticated directory projection", () => {
    const source = read("app/connections/page.tsx");
    expect(source).toContain('rpc("get_public_network_directory"');
    expect(source).toContain('rpc("get_network_member_identities"');
    expect(source).not.toContain('.from("profiles")');
  });

  it("uses durable post_type rather than fabricated category metadata", () => {
    const source = read("app/feed/page.tsx");
    expect(source).toContain("categoryFromPostType");
    expect(source).toContain("post_type: category.toLowerCase()");
    expect(source).not.toContain('pillar:"Leadership"');
    expect(source).not.toContain('pillar: "Leadership"');
  });

  it("keeps comments inline instead of using browser prompt or confirm", () => {
    const source = read("app/feed/page.tsx");
    expect(source).not.toContain("window.prompt");
    expect(source).not.toContain("window.confirm");
    expect(source).toContain("Write a comment");
  });
});
