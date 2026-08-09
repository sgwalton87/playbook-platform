import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});
const pages = walk(join(root, "app")).filter((path) => /\/page\.(tsx?|jsx?)$/.test(path) && !path.includes("/api/"));
const verifiedDesktopAndMobile = new Set(["/", "/login", "/check-email", "/reset-password", "/role-select"]);
const route = (path) => {
  const value = relative(join(root, "app"), path).replace(/(^|\/)page\.(tsx?|jsx?)$/, "").replace(/\([^/]+\)\//g, "");
  return value ? `/${value}` : "/";
};
const rows = pages.sort().map((path) => {
  const source = readFileSync(path, "utf8");
  const target = route(path);
  const canonical = /data-visual-canon=|CanonicalAuthShell|ScholarDashboardExperience/.test(source);
  const generation = canonical ? "Canonical marker present" : /style=\{\{|React\.CSSProperties|<style>/.test(source) ? "Legacy/inline presentation" : "Shared or unclassified presentation";
  const dependency = ["/login", "/check-email", "/reset-password", "/role-select", "/start", "/pending", "/auth/callback"].some((prefix) => target === prefix || target.startsWith(prefix + "/")) ? "Authentication shell" : target === "/" ? "Public shell" : "Unified authenticated shell";
  const verified = verifiedDesktopAndMobile.has(target);
  const status = verified ? "IMPLEMENTED_AND_VERIFIED" : canonical ? "IN_PROGRESS_UNVERIFIED" : "PENDING";
  return `| \`${target}\` | ${generation} | PGDS-001 | ${dependency} | ${status} | ${verified ? "PASSED" : "PENDING"} | ${verified ? "PASSED" : "PENDING"} |`;
});
const verifiedSurfaces = [
  "| `AUTHENTICATED_PRODUCT_SHELL` | Canonical shared implementation | PGDS-001 | Root layout | IMPLEMENTED_AND_VERIFIED | PASSED | PASSED |",
  "| `STUDIO_SHELL_AUTHORITY` | Dedicated operator implementation | PGDS-001 | Studio layout | IMPLEMENTED_AND_VERIFIED | PASSED | N/A |",
];
const output = `# Playbook UI Recovery Implementation Matrix\n\nExact base: \`724fa10a9577586598127da77b336cbadfd2455b\`\n\nThis is an implementation control artifact. A mapping or marker is not completion.\n\n| Route or surface | Current UI generation | Canonical target | Shared dependency | Implementation status | Desktop verification | Mobile verification |\n|---|---|---|---|---|---|---|\n${[...verifiedSurfaces, ...rows].join("\n")}\n`;
writeFileSync(join(root, "docs/audits/PLAYBOOK-UI-RECOVERY-MATRIX.md"), output);
console.log(`${rows.length} visible routes inventoried.`);
