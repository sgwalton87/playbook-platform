export const SCHOLAR_PACKAGE_TYPES = [
  "PRODUCT_REQUIREMENTS",
  "EXPERIENCE",
  "ENGINEERING",
] as const;

export type ScholarPackageType = (typeof SCHOLAR_PACKAGE_TYPES)[number];

export interface ScholarPackageArtifact {
  readonly package_id: string;
  readonly package_type: ScholarPackageType;
  readonly milestone_id: "SCHOLAR-EXPERIENCE-V1-PRODUCT-DEFINITION-001";
  readonly source_digests: Readonly<Record<string, string>>;
  readonly content_digest: string;
  readonly artifact_digest: string;
  readonly path: string;
  readonly content: string;
}

export interface ScholarPackageSet {
  readonly milestone_id: "SCHOLAR-EXPERIENCE-V1-PRODUCT-DEFINITION-001";
  readonly packages: readonly ScholarPackageArtifact[];
  readonly digest: string;
}

export interface ScholarPackageValidation {
  readonly valid: boolean;
  readonly findings: readonly string[];
  readonly package_set: ScholarPackageSet;
}
