import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("frontend quality convergence", () => {
  it("uses Next routing for authenticated vault and network redirects", () => {
    const badges = read("app/badges/page.tsx");
    const certificates = read("app/certificates/page.tsx");
    const connectionButton = read("components/network/ConnectionButton.tsx");
    expect(badges).toContain('router.replace("/login?next=/badges")');
    expect(certificates).toContain('router.replace("/login?next=/certificates")');
    expect(connectionButton).toContain('router.push("/login")');
    expect(badges).not.toContain("location.href");
    expect(certificates).not.toContain("location.href");
    expect(connectionButton).not.toContain("window.location.href");
  });

  it("uses the canonical avatar component in Network discovery", () => {
    const connections = read("app/connections/page.tsx");
    expect(connections).toContain('import ProfileAvatar from "@/components/ProfileAvatar"');
    expect(connections).toContain('<ProfileAvatar src={person.avatar_url} name={person.name} size={54} />');
    expect(connections).not.toContain("<img src={person.avatar_url}");
  });
});
