import { describe, expect, it } from "vitest";
import { executeAnalytics } from "./analytics";
describe("ANALYTICS governed capability", () => { it("requires authority and provenance", () => { expect(() => executeAnalytics({ actorId: "actor", approvalId: "", provenance: ["source"] })).toThrow("approval"); expect(executeAnalytics({ actorId: "actor", approvalId: "approval", provenance: ["source"] }).provenance).toContain("approval"); }); });
