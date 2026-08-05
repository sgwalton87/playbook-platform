import { describe, expect, it } from "vitest";
import { executeIntelligence } from "./intelligence";
describe("INTELLIGENCE governed capability", () => { it("requires authority and provenance", () => { expect(() => executeIntelligence({ actorId: "actor", approvalId: "", provenance: ["source"] })).toThrow("approval"); expect(executeIntelligence({ actorId: "actor", approvalId: "approval", provenance: ["source"] }).provenance).toContain("approval"); }); });
