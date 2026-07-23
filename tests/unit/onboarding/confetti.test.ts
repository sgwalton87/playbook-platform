import { beforeEach, describe, expect, it, vi } from "vitest";

const confetti = vi.fn();

vi.mock("canvas-confetti", () => ({ default: confetti }));

describe("profile completion celebration", () => {
  beforeEach(() => confetti.mockClear());

  it("fires production confetti with a visible celebration burst", async () => {
    const { fireConfetti } = await import("@/lib/confetti");
    fireConfetti();

    expect(confetti).toHaveBeenCalledWith(
      expect.objectContaining({ particleCount: 120, spread: 80 }),
    );
  });
});
