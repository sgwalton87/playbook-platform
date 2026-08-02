import { describe, expect, it } from "vitest";
import { isLaunchAnalyticsEvent, LAUNCH_ANALYTICS_EVENTS } from "@/lib/launch-controls";
describe("launch analytics taxonomy", () => { it("allows governed events", () => expect(isLaunchAnalyticsEvent("portfolio.shared")).toBe(true)); it("rejects undeclared events", () => expect(isLaunchAnalyticsEvent("user.did_random_thing")).toBe(false)); it("requires declared properties", () => expect(LAUNCH_ANALYTICS_EVENTS["evidence.added"].properties).toEqual(["sourceType", "visibility"])); });
