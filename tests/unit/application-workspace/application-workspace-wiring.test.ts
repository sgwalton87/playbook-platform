import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const page = readFileSync("app/application-workspaces/page.tsx", "utf8");
const component = readFileSync("components/application-workspace/ApplicationWorkspaceDashboard.tsx", "utf8");
describe("application workspace wiring", () => {
  it("loads persisted workspaces through authorized Scholar context", () => { expect(page).toContain("resolveServerAuthorization"); expect(page).toContain('.from("application_workspaces")'); });
  it("creates real workspaces without demo Scholar fixtures", () => { expect(component).toContain('fetch("/api/application-workspaces"'); expect(component).not.toContain("scholar-maya"); expect(component).not.toContain("Health Careers Internship"); });
  it("models empty, error, and loading states", () => { expect(component).toContain('state="empty"'); expect(readFileSync("app/application-workspaces/error.tsx", "utf8")).toContain('state="error"'); expect(readFileSync("app/application-workspaces/loading.tsx", "utf8")).toContain('state="loading"'); });
});
