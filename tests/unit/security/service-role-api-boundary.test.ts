import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const apiRoot = path.join(process.cwd(), "app/api");
const allowedPrivilegedRoutes = new Set([
  path.normalize("mail-gateway/hostinger/route.ts"),
]);

function collectRouteFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectRouteFiles(absolute);
    return entry.isFile() && entry.name === "route.ts" ? [absolute] : [];
  });
}

describe("service-role API boundary", () => {
  it("keeps service-role credentials out of user-facing API routes", () => {
    const offenders = collectRouteFiles(apiRoot)
      .filter((file) => fs.readFileSync(file, "utf8").includes("SUPABASE_SERVICE_ROLE_KEY"))
      .map((file) => path.normalize(path.relative(apiRoot, file)))
      .filter((relative) => !allowedPrivilegedRoutes.has(relative));

    expect(offenders, `Unexpected privileged API routes: ${offenders.join(", ")}`).toEqual([]);
  });

  it("keeps the one privileged webhook fail-closed", () => {
    const hostinger = fs.readFileSync(path.join(apiRoot, "mail-gateway/hostinger/route.ts"), "utf8");
    expect(hostinger).toContain("MAIL_GATEWAY_SECRET");
    expect(hostinger).toContain("timingSafeEqual");
    expect(hostinger).toContain("if (!expectedSecret)");
    expect(hostinger).toContain("messageId");
    expect(hostinger).toContain("candidates.length !== 1");
  });
});
