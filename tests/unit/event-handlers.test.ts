import { describe, expect, it, vi, beforeEach } from "vitest";
import { clearEventHandlers } from "@/lib/events/bus";
import { emitEvent } from "@/lib/events/emit";
import { registerPlaybookEventHandlers } from "@/lib/events/register";

describe("Playbook event handlers", () => {
  beforeEach(() => {
    clearEventHandlers();
  });

  it("registers engine handlers for AchievementCreated", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});

    registerPlaybookEventHandlers();

    await emitEvent({
      type: "AchievementCreated",
      payload: { achievementId: "achievement-1" },
      source: "test",
    });

    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });
});
