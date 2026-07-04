import { describe, expect, it } from "vitest";
import {
  buildCoinLedgerEntry,
  buildRewardEvent,
  calculateRewardBalance,
  getRewardValue,
} from "@/lib/reward-events";

describe("Persistent Coin Ledger + Reward Events", () => {
  it("returns reward values", () => {
    expect(getRewardValue("course.completed").coins).toBe(100);
    expect(getRewardValue("application.ready").xp).toBeGreaterThan(0);
  });

  it("builds reward event", () => {
    const event = buildRewardEvent({
      scholarId: "scholar-1",
      eventType: "portfolio.shared",
    });

    expect(event.processed).toBe(false);
  });

  it("builds coin ledger entry", () => {
    const entry = buildCoinLedgerEntry({
      scholarId: "scholar-1",
      eventType: "recommendation.approved",
    });

    expect(entry.coins).toBeGreaterThan(0);
  });

  it("calculates balance", () => {
    const entries = [
      buildCoinLedgerEntry({ scholarId: "s1", eventType: "course.completed" }),
      buildCoinLedgerEntry({ scholarId: "s1", eventType: "message.sent" }),
    ];

    expect(calculateRewardBalance(entries).coins).toBe(105);
  });
});
