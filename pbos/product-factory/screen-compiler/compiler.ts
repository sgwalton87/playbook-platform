import { artifactDigest } from "../../kernel/identity";
import type {
  EngineeringImplementationPackage,
  ProductScreenState,
  ScreenSpecificationContract,
} from "./types";

const REQUIRED_STATES: readonly ProductScreenState[] = [
  "LOADING",
  "EMPTY",
  "ERROR",
  "SUCCESS",
  "PERMISSION",
  "PRIVACY",
];

export function screenSpecificationDigest(
  value: ScreenSpecificationContract
): string {
  return artifactDigest({ ...value, digest: undefined });
}

export function validateScreenSpecification(
  value: ScreenSpecificationContract
): readonly string[] {
  return [
    ...(!value.screen_id || !value.purpose
      ? ["Screen identity or purpose is missing."]
      : []),
    ...(value.user_goals.length === 0 ||
    value.visual_hierarchy.length === 0 ||
    value.required_data.length === 0 ||
    value.components.length === 0 ||
    value.actions.length === 0
      ? ["Screen experience contract is incomplete."]
      : []),
    ...(value.permissions.length === 0
      ? ["Screen permissions are missing."]
      : []),
    ...(!value.navigation.route.startsWith("/")
      ? ["Screen route is invalid."]
      : []),
    ...(REQUIRED_STATES.some((state) => !value.states[state])
      ? ["Screen states are incomplete."]
      : []),
    ...(value.mobile_behavior.length === 0 ||
    value.desktop_behavior.length === 0 ||
    value.accessibility.length === 0
      ? ["Responsive or accessibility contract is incomplete."]
      : []),
    ...(value.brand_references.length === 0
      ? ["Brand governance references are missing."]
      : []),
    ...(value.digest !== screenSpecificationDigest(value)
      ? ["Screen specification digest is invalid."]
      : []),
  ];
}

export class ProductBuildPackageGenerator {
  generate(
    specification: ScreenSpecificationContract
  ): EngineeringImplementationPackage {
    const findings = validateScreenSpecification(specification);
    if (findings.length > 0) {
      throw new Error(`Product build package rejected: ${findings.join(" ")}`);
    }
    const body: EngineeringImplementationPackage = {
      package_id: `PRODUCT-BUILD-${specification.digest.slice(0, 16)}`,
      screen_id: specification.screen_id,
      source_specification_digest: specification.digest,
      components: [...specification.components].sort(),
      routes: [specification.navigation.route],
      data_models: [...specification.required_data].sort(),
      apis: [...specification.api_requirements].sort(),
      permissions: [...specification.permissions].sort(),
      testing_requirements: [
        ...REQUIRED_STATES.map((state) => `Validate ${state} state.`),
        "Validate role permissions and privacy boundaries.",
        "Validate keyboard and assistive-technology workflows.",
        "Validate mobile and desktop behavior.",
        "Validate brand token and component conformance.",
      ],
      accessibility_requirements: [...specification.accessibility].sort(),
      responsive_requirements: [
        ...specification.mobile_behavior.map((rule) => `Mobile: ${rule}`),
        ...specification.desktop_behavior.map((rule) => `Desktop: ${rule}`),
      ].sort(),
      brand_requirements: [...specification.brand_references].sort(),
      human_authorization_required: true,
      implementation_authority: "PBOS-PRODUCT-FACTORY",
      digest: "",
    };
    return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
  }
}
