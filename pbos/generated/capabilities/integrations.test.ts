import { describe, expect, it } from "vitest";
import { executeIntegrations } from "./integrations";
describe("INTEGRATIONS governed capability", () => { it("requires authority and provenance", () => { expect(() => executeIntegrations({ actorId: "actor", approvalId: "", provenance: ["source"] })).toThrow("approval"); expect(executeIntegrations({ actorId: "actor", approvalId: "approval", provenance: ["source"] }).provenance).toContain("approval"); }); });
