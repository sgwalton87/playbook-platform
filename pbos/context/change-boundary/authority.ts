import { artifactDigest } from "../../kernel/identity";
import type {
  BaselineActivationIdentity,
  ChangeBoundaryDeclaration,
  ChangeBoundaryType,
  ChangeBoundaryValidation,
  ChangeInventory,
} from "./types";

export function validateChangeBoundary(
  declaration: ChangeBoundaryDeclaration,
  inventory: ChangeInventory,
  timestamp: string,
  expectedBaseline?: BaselineActivationIdentity
): ChangeBoundaryValidation {
  const inventoryFiles = inventory.changes.map(({ file_path }) => file_path).sort();
  const approved = [...declaration.approved_files].sort();
  const excluded = [...declaration.excluded_files].sort();
  const classified = [...approved, ...excluded].sort();
  const isBaseline = declaration.boundary_type === "BASELINE_ACTIVATION";
  const baselineFields = [
    declaration.context_digest,
    declaration.manifest_digest,
    declaration.architecture_digest,
    declaration.artifact_digest,
    declaration.governance_digest,
  ];
  const findings = [
    ...(artifactDigest({ ...declaration, digest: undefined }) !== declaration.digest
      ? ["Change boundary digest is invalid."]
      : []),
    ...(declaration.inventory_identity !== inventory.content_identity
      ? ["Change inventory identity does not match."]
      : []),
    ...(declaration.repository_identity !== inventory.repository_identity ||
    declaration.commit_identity !== inventory.commit_identity ||
    declaration.branch_identity !== inventory.branch_identity
      ? ["Repository identity does not match change boundary."]
      : []),
    ...(!declaration.repository_identity ||
    !declaration.commit_identity ||
    !declaration.branch_identity
      ? ["Repository, commit, and branch identities are required."]
      : []),
    ...(!["CHANGE", "BASELINE_ACTIVATION"].includes(declaration.boundary_type)
      ? ["Change boundary type is invalid."]
      : []),
    ...(artifactDigest({
      included: [...declaration.included_files].sort(),
      excluded: [...declaration.excluded_files].sort(),
    }) !== declaration.scope_digest
      ? ["Change boundary scope digest is invalid."]
      : []),
    ...(!declaration.requester_identity ||
    !declaration.business_purpose ||
    !declaration.technical_purpose ||
    !declaration.risk_acknowledgment
      ? ["Requester, business purpose, technical purpose, and risk acknowledgment are required."]
      : []),
    ...(isBaseline && inventory.changes.length > 0
      ? ["Baseline activation requires a clean repository."]
      : []),
    ...(isBaseline &&
    (approved.length > 0 ||
      declaration.included_files.length > 0 ||
      excluded.length > 0)
      ? ["Baseline activation file classifications must be empty."]
      : []),
    ...(isBaseline && baselineFields.some((value) => !value)
      ? ["Baseline activation identity digests are required."]
      : []),
    ...(isBaseline && expectedBaseline &&
    (declaration.context_digest !== expectedBaseline.context_digest ||
      declaration.manifest_digest !== expectedBaseline.manifest_digest ||
      declaration.architecture_digest !== expectedBaseline.architecture_digest ||
      declaration.artifact_digest !== expectedBaseline.artifact_digest ||
      declaration.governance_digest !== expectedBaseline.governance_digest)
      ? ["Baseline activation digest does not match current context."]
      : []),
    ...(new Set(classified).size !== classified.length
      ? ["Files cannot be both approved and excluded."]
      : []),
    ...(JSON.stringify([...declaration.approved_files].sort()) !==
    JSON.stringify([...declaration.included_files].sort())
      ? ["Approved and included file identities do not match."]
      : []),
    ...(JSON.stringify(classified) !== JSON.stringify(inventoryFiles)
      ? ["Every changed file must be classified exactly once."]
      : []),
    ...(inventory.changes.some(({ owner }) => owner === "UNKNOWN")
      ? ["Unknown change ownership is prohibited."]
      : []),
    ...(!Number.isFinite(Date.parse(declaration.expiration_timestamp)) ||
    Date.parse(declaration.expiration_timestamp) <= Date.parse(timestamp)
      ? ["Change boundary is expired."]
      : []),
  ];
  return { valid: findings.length === 0, findings };
}

export function createChangeBoundary(input: {
  readonly inventory: ChangeInventory;
  readonly boundaryType: ChangeBoundaryType;
  readonly baselineIdentity?: BaselineActivationIdentity;
  readonly requesterIdentity: string;
  readonly approvedFiles: readonly string[];
  readonly excludedFiles: readonly string[];
  readonly purpose: string;
  readonly businessPurpose: string;
  readonly technicalPurpose: string;
  readonly riskAcknowledgment: string;
  readonly creationTimestamp: string;
  readonly expirationTimestamp: string;
}): ChangeBoundaryDeclaration {
  const body = {
    boundary_id: `${input.boundaryType}-BOUNDARY-${artifactDigest({
      inventory: input.inventory.digest,
      requester: input.requesterIdentity,
      created: input.creationTimestamp,
    }).slice(0, 16)}`,
    boundary_type: input.boundaryType,
    repository_identity: input.inventory.repository_identity,
    commit_identity: input.inventory.commit_identity,
    branch_identity: input.inventory.branch_identity,
    requester_identity: input.requesterIdentity,
    inventory_digest: input.inventory.digest,
    inventory_identity: input.inventory.content_identity,
    approved_files: [...input.approvedFiles].sort(),
    included_files: [...input.approvedFiles].sort(),
    excluded_files: [...input.excludedFiles].sort(),
    scope_digest: artifactDigest({
      included: [...input.approvedFiles].sort(),
      excluded: [...input.excludedFiles].sort(),
    }),
    context_digest: input.baselineIdentity?.context_digest ?? "",
    manifest_digest: input.baselineIdentity?.manifest_digest ?? "",
    architecture_digest: input.baselineIdentity?.architecture_digest ?? "",
    artifact_digest: input.baselineIdentity?.artifact_digest ?? "",
    governance_digest: input.baselineIdentity?.governance_digest ?? "",
    purpose: input.purpose,
    business_purpose: input.businessPurpose,
    technical_purpose: input.technicalPurpose,
    owner_identity: input.requesterIdentity,
    risk_acknowledgment: input.riskAcknowledgment,
    creation_timestamp: input.creationTimestamp,
    created_at: input.creationTimestamp,
    expiration_timestamp: input.expirationTimestamp,
    expiration: input.expirationTimestamp,
  };
  const declaration = { ...body, digest: artifactDigest(body) };
  const validation = validateChangeBoundary(
    declaration,
    input.inventory,
    input.creationTimestamp,
    input.baselineIdentity
  );
  if (!validation.valid) {
    throw new Error(`Change boundary rejected: ${validation.findings.join(" ")}`);
  }
  return declaration;
}
