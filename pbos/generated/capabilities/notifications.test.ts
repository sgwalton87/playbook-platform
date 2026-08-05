import { describe, expect, it } from "vitest";
import { executeNotifications } from "./notifications";
describe("NOTIFICATIONS governed capability", () => { it("requires authority and provenance", () => { expect(() => executeNotifications({ actorId: "actor", approvalId: "", provenance: ["source"] })).toThrow("approval"); expect(executeNotifications({ actorId: "actor", approvalId: "approval", provenance: ["source"] }).provenance).toContain("approval"); }); });
