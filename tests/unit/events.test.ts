import { describe, expect, it, vi, beforeEach } from "vitest";
import { clearEventHandlers, onEvent } from "@/lib/events/bus";
import { emitEvent } from "@/lib/events/emit";

describe("Playbook Event Bus", () => {
  beforeEach(() => {
    clearEventHandlers();
  });

  it("publishes events to registered handlers", async () => {
    const handler = vi.fn();

    onEvent("AchievementCreated", handler);

    await emitEvent({
      type: "AchievementCreated",
      payload: { achievementId: "achievement-1" },
      source: "test",
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].type).toBe("AchievementCreated");
    expect(handler.mock.calls[0][0].payload.achievementId).toBe("achievement-1");
  });
});
