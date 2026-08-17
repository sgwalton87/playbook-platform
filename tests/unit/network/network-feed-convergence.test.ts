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

  it("sends discovery search to the server instead of filtering a capped directory snapshot", () => {
    const source = read("app/connections/page.tsx");
    expect(source).toContain("const normalizedSearch = discoverySearch.trim()");
    expect(source).toContain("search_text: normalizedSearch || null");
    expect(source).toContain('tab === "discover" ? search : ""');
    expect(source).toContain('if (tab === "discover") return source');
    expect(source).not.toContain("search_text: null, result_limit: 100");
  });

  it("resolves every relationship identity in bounded RPC batches rather than dropping relationships after 100", () => {
    const source = read("app/connections/page.tsx");
    expect(source).toContain("chunks(relationshipIds, 100)");
    expect(source).toContain('rpc("get_network_member_identities"');
    expect(source).not.toContain("relationshipIds = [...new Set([...connectedIds, ...sentRequests.keys(), ...incomingRequests.keys()])].slice(0, 100)");
  });

  it("links only Network identities that satisfy the public-profile publication boundary", () => {
    const source = read("app/connections/page.tsx");
    expect(source).toContain('rpc("get_network_public_profile_linkable_ids"');
    expect(source).toContain("publicProfileLinkable: publicProfileIds.has(person.id)");
    expect(source).toContain("person.publicProfileLinkable ? <Link");
    expect(source).toContain("Private profile");
  });

  it("routes the Network connection lifecycle through governed RPCs only", () => {
    const source = read("app/connections/page.tsx");
    expect(source).toContain('rpc("send_connection_request"');
    expect(source).toContain('rpc("respond_to_connection_request"');
    expect(source).toContain('rpc("cancel_connection_request"');
    expect(source).toContain('rpc("remove_connection"');
    expect(source).not.toMatch(/\.from\(["']connection_requests["']\)[\s\S]*?\.(insert|update|delete|upsert)/);
    expect(source).not.toMatch(/\.from\(["']user_connections["']\)[\s\S]*?\.(insert|update|delete|upsert)/);
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
