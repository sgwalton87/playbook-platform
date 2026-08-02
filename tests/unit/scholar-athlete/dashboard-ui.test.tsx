import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ScholarAthleteDashboard from "@/components/scholar-athlete/ScholarAthleteDashboard";
import type { ScholarAthleteDashboardData } from "@/lib/scholar-athlete/dashboard";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

const data: ScholarAthleteDashboardData = {
  scholar: { id: "scholar", name: "Jordan Scholar", school: "Playbook High", gpa: 3.6 },
  athleteProfile: null,
  nilProfile: null,
  recruitingTargets: [],
  nilDeals: [],
  recentRecruitingActivityCount: 0,
};

describe("Scholar-Athlete OS UI", () => {
  beforeEach(() => refresh.mockReset());

  it("renders athlete-owned live state without demo fixtures", () => {
    render(<ScholarAthleteDashboard initialData={data} />);
    expect(screen.getByRole("heading", { name: /Jordan Scholar's athlete command center/i })).toBeTruthy();
    expect(screen.getByText(/Academics remain first/i)).toBeTruthy();
    expect(screen.queryByText("Target University")).toBeNull();
  });

  it("provides keyboard-addressable profile, recruiting, and NIL workspaces", () => {
    render(<ScholarAthleteDashboard initialData={data} />);
    fireEvent.click(screen.getByRole("button", { name: "Profile" }));
    expect(screen.getByRole("heading", { name: "Athletic identity under your control" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Recruiting" }));
    expect(screen.getByRole("heading", { name: "Athlete-controlled pipeline" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "NIL" }));
    expect(screen.getByRole("heading", { name: "Brand, opportunity, compliance, and agency" })).toBeTruthy();
    expect(screen.getByText(/does not guarantee selection, compensation, approval, or payment/i)).toBeTruthy();
  });
});
