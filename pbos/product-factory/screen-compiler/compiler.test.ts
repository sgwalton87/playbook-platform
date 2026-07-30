import { describe, expect, it } from "vitest";
import {
  ProductBuildPackageGenerator,
  screenSpecificationDigest,
  validateScreenSpecification,
  type ScreenSpecificationContract,
} from ".";

function specification(): ScreenSpecificationContract {
  const body: ScreenSpecificationContract = {
    screen_id: "SCHOLAR-HOME",
    purpose: "Personal growth command center.",
    primary_role: "SCHOLAR",
    secondary_roles: ["PARENT", "MENTOR"],
    user_goals: ["Understand progress", "Choose a next action"],
    visual_hierarchy: ["Identity", "Next action", "Progress", "Opportunity"],
    required_data: ["ScholarHome", "ScholarJourney"],
    components: ["PB-NAV-001", "PB-JOURNEY-001", "PB-OPPORTUNITY-001"],
    actions: ["Confirm action", "Review evidence"],
    permissions: ["VIEW_SCHOLAR_HOME"],
    navigation: {
      route: "/scholar",
      entry_points: ["/"],
      exit_points: ["/journey", "/opportunities"],
    },
    api_requirements: ["Scholar Home read model"],
    database_dependencies: ["Governed Scholar Record adapter"],
    states: {
      LOADING: "Show stable skeletons.",
      EMPTY: "Explain missing evidence.",
      ERROR: "Show recoverable source error.",
      SUCCESS: "Show trusted home.",
      PERMISSION: "Explain required permission.",
      PRIVACY: "Show visibility and consent.",
    },
    mobile_behavior: ["Prioritize next action."],
    desktop_behavior: ["Support path comparison."],
    accessibility: ["Semantic landmarks", "Keyboard navigation"],
    brand_references: [
      "PLAYBOOK_BRAND_CONSTITUTION",
      "PLAYBOOK_COLOR_SYSTEM",
      "PLAYBOOK_COMPONENT_LIBRARY",
    ],
    digest: "",
  };
  return { ...body, digest: screenSpecificationDigest(body) };
}

describe("PBOS Product Factory screen compiler", () => {
  it("generates deterministic, authorization-bound build packages", () => {
    const value = specification();
    const generator = new ProductBuildPackageGenerator();
    expect(generator.generate(value)).toEqual(generator.generate(value));
    expect(generator.generate(value).human_authorization_required).toBe(true);
    expect(generator.generate(value).routes).toEqual(["/scholar"]);
  });

  it("rejects incomplete and modified screen specifications", () => {
    const value = specification();
    expect(validateScreenSpecification({ ...value, permissions: [] })).toContain(
      "Screen permissions are missing."
    );
    expect(() =>
      new ProductBuildPackageGenerator().generate({
        ...value,
        purpose: "Modified",
      })
    ).toThrow("digest");
  });
});
