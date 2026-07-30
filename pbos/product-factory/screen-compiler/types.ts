export type ProductRole =
  | "SCHOLAR"
  | "SCHOLAR_ATHLETE"
  | "PARENT"
  | "COUNSELOR"
  | "COACH"
  | "MENTOR"
  | "INSTITUTION";

export type ProductScreenState =
  | "LOADING"
  | "EMPTY"
  | "ERROR"
  | "SUCCESS"
  | "PERMISSION"
  | "PRIVACY";

export interface ScreenSpecificationContract {
  readonly screen_id: string;
  readonly purpose: string;
  readonly primary_role: ProductRole;
  readonly secondary_roles: readonly ProductRole[];
  readonly user_goals: readonly string[];
  readonly visual_hierarchy: readonly string[];
  readonly required_data: readonly string[];
  readonly components: readonly string[];
  readonly actions: readonly string[];
  readonly permissions: readonly string[];
  readonly navigation: {
    readonly route: string;
    readonly entry_points: readonly string[];
    readonly exit_points: readonly string[];
  };
  readonly api_requirements: readonly string[];
  readonly database_dependencies: readonly string[];
  readonly states: Readonly<Record<ProductScreenState, string>>;
  readonly mobile_behavior: readonly string[];
  readonly desktop_behavior: readonly string[];
  readonly accessibility: readonly string[];
  readonly brand_references: readonly string[];
  readonly digest: string;
}

export interface EngineeringImplementationPackage {
  readonly package_id: string;
  readonly screen_id: string;
  readonly source_specification_digest: string;
  readonly components: readonly string[];
  readonly routes: readonly string[];
  readonly data_models: readonly string[];
  readonly apis: readonly string[];
  readonly permissions: readonly string[];
  readonly testing_requirements: readonly string[];
  readonly accessibility_requirements: readonly string[];
  readonly responsive_requirements: readonly string[];
  readonly brand_requirements: readonly string[];
  readonly human_authorization_required: true;
  readonly implementation_authority: "PBOS-PRODUCT-FACTORY";
  readonly digest: string;
}
