import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AIProcessingConsentControl } from "@/components/settings/AIProcessingConsentControl";

describe("AI processing consent control", () => {
  it("explains optional processing, human authority, and withdrawal", () => {
    render(<AIProcessingConsentControl initialStatus="denied" />);
    expect(screen.getByText(/Human authority stays with you/i)).toBeTruthy();
    expect(screen.getByText(/Core workflows remain available without consent/i)).toBeTruthy();
    expect((screen.getByRole("button", { name: /Grant AI processing consent/i }) as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByRole("button", { name: /Withdraw consent/i }) as HTMLButtonElement).disabled).toBe(true);
  });
});
