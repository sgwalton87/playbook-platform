import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ScholarDashboardExperience from "@/components/dashboard/ScholarDashboardExperience";
import { buildScholarRecord } from "@/lib/scholar";

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a">) => <a href={href} {...props}>{children}</a>,
}));
vi.mock("next/image", () => ({
  default: (props: ComponentProps<"img"> & { fill?: boolean; priority?: boolean }) => {
    const imageProps = { ...props };
    delete imageProps.fill;
    delete imageProps.priority;
    return (
      // eslint-disable-next-line @next/next/no-img-element -- unit boundary for next/image
      <img {...imageProps} alt={props.alt ?? ""} />
    );
  },
}));
vi.mock("@/components/ag/AGTracker", () => ({ default: () => <div>Academic readiness tracker</div> }));
vi.mock("@/components/experience/ExperienceModeBanner", () => ({ default: () => null }));

describe("PGSL-007 Scholar Dashboard canon", () => {
  it("renders the future-facing dashboard with real Scholar Record values", () => {
    const record = buildScholarRecord({
      profile: { id: "scholar-1", first_name: "Jaylen", full_name: "Jaylen Carter", grad_year: "2027", weighted_gpa: "3.42" },
      agProgress: [{ subject: "A", years_completed: 2, years_required: 2 }],
      badges: [{ id: "badge-1" }],
    });

    render(<ScholarDashboardExperience record={record} loading={false} loadError={null} />);

    expect(screen.getByTestId("scholar-dashboard-canon").getAttribute("data-visual-canon")).toBe("PGSL-007");
    expect(screen.getByRole("heading", { name: "Welcome back, Jaylen." })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Own the record that opens your next door." })).toBeTruthy();
    expect(screen.getByRole("img", { name: /Black male Scholar/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Continue your journey/i }).getAttribute("href")).toBe("/transcript");
    expect(screen.getByText("Academic readiness tracker")).toBeTruthy();
  });

  it("rejects missing, empty, or altered canonical assets", () => {
    const manifest = JSON.parse(readFileSync("docs/design/canon/scholar-dashboard/manifest.json", "utf8")) as {
      assets: Array<{ path: string; sha256: string; required: boolean }>;
    };

    for (const asset of manifest.assets.filter((candidate) => candidate.required)) {
      const content = readFileSync(asset.path);
      expect(content.byteLength, `${asset.path} must not be empty`).toBeGreaterThan(0);
      expect(createHash("sha256").update(content).digest("hex"), `${asset.path} must match its approved digest`).toBe(asset.sha256);
    }
  });
});
