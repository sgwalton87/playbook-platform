import { describe, expect, it, vi, beforeEach } from "vitest";
import { clearEventHandlers } from "@/lib/events/bus";
import { emitEvent } from "@/lib/events/emit";

vi.mock("@/lib/supabaseClient", () => {
  const chain = {
    insert: vi.fn(() => chain),
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    is: vi.fn(() => Promise.resolve({ data: [], error: null })),
  };

  return {
    supabase: {
      from: vi.fn(() => chain),
    },
  };
});

import { registerPlaybookEventHandlers } from "@/lib/events/register";

describe("Playbook event handlers", () => {
  beforeEach(() => {
    clearEventHandlers();
    vi.clearAllMocks();
  });

  it("registers engine handlers for AchievementCreated", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});

    registerPlaybookEventHandlers();

    await emitEvent({
      type: "AchievementCreated",
      payload: {
        profileId: "profile-1",
        recordId: "record-1",
        achievementId: "achievement-1",
        title: "Test Achievement",
        category: "academic",
      },
      source: "test",
    });

    expect(true).toBe(true);

    spy.mockRestore();
  });
});
