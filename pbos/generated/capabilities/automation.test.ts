import { describe, expect, it } from "vitest";
import { executeAutomation } from "./automation";
describe("AUTOMATION governed capability", () => { it("requires authority and provenance", () => { expect(() => executeAutomation({ actorId: "actor", approvalId: "", provenance: ["source"] })).toThrow("approval"); expect(executeAutomation({ actorId: "actor", approvalId: "approval", provenance: ["source"] }).provenance).toContain("approval"); }); });
