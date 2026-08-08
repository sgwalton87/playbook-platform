// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "@/app/page";

describe("Playbook landing canon", () => {
  it("renders the approved future-facing local Scholar experience", () => {
    render(<HomePage />);

    expect(screen.getByRole("main").getAttribute("data-visual-canon")).toBe("PLAYBOOK-LANDING-001");
    expect(screen.getByRole("heading", { name: /Your Playbook.*Your team.*Your future/i })).toBeTruthy();
    expect(screen.getByAltText(/Black male Scholar/i).getAttribute("src"))
      .toContain("scholar-future-hero-v1.png");
    expect(screen.getAllByRole("link", { name: /Join The Playbook/i }))
      .toHaveLength(2);
    expect(screen.getAllByRole("link", { name: /Join The Playbook/i })
      .every(link => link.getAttribute("href") === "/login?mode=signup"))
      .toBe(true);
  });
});
