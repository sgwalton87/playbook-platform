import type {
  ConstitutionalSource,
  ContextCompilationInput,
  ContextFailure,
  ContextFailureCode,
  PBOSRuntimeContext,
  RegistryDocument,
  ValidatedRule,
} from "./contracts";
import { digestValue, sha256 } from "./digest";

const PPS_IDENTIFIER = /^PPS-\d+$/;
const SEMANTIC_VERSION = /^\d+\.\d+\.\d+$/;
const SHA256 = /^[a-f0-9]{64}$/;

export class ContextCompilationError extends Error {
  constructor(public readonly failures: ContextFailure[]) {
    super(failures.map((failure) => `${failure.code}: ${failure.message}`).join("; "));
    this.name = "ContextCompilationError";
  }
}

function failure(code: ContextFailureCode, artifact: string, message: string): ContextFailure {
  return { code, artifact, message };
}

function sourceFailures(source: ConstitutionalSource): ContextFailure[] {
  const failures: ContextFailure[] = [];
  if (
    !PPS_IDENTIFIER.test(source.identifier) ||
    !source.title.trim() ||
    !SEMANTIC_VERSION.test(source.version) ||
    !source.location.startsWith("docs/PPS/") ||
    !source.owner.trim() ||
    source.status !== "Canonical" ||
    source.dependencies.some((dependency) => !PPS_IDENTIFIER.test(dependency))
  ) {
    failures.push(failure("INVALID_SOURCE", source.identifier, "Required constitutional source metadata is invalid."));
  }
  if (source.validationState !== "verified") {
    failures.push(failure("INVALID_SOURCE", source.identifier, "Constitutional source is not verified."));
  }
  if (!SHA256.test(source.digest) || sha256(source.content) !== source.digest) {
    failures.push(failure("INVALID_DIGEST", source.identifier, "Source digest does not match canonical source content."));
  }
  return failures;
}

function registryConflict(source: ConstitutionalSource, entry: RegistryDocument | undefined): ContextFailure | null {
  if (!entry) {
    return failure("MISSING_AUTHORITY", source.identifier, "Source is absent from the validated canonical registry.");
  }
  if (entry.location !== source.location || entry.owner !== source.owner || entry.version !== source.version) {
    return failure("CONFLICTING_AUTHORITY", source.identifier, "Source metadata conflicts with canonical registry authority.");
  }
  return null;
}

export function compileContext(input: ContextCompilationInput): PBOSRuntimeContext {
  const failures: ContextFailure[] = [];
  if (!input.sources.length) {
    failures.push(failure("MISSING_AUTHORITY", "PPS", "At least one verified constitutional source is required."));
  }
  if (input.registry.validationState !== "verified") {
    failures.push(failure("INVALID_SOURCE", "registry", "Canonical registry validation has not passed."));
  }
  if (!SEMANTIC_VERSION.test(input.registry.version) || Number.isNaN(Date.parse(input.compilationTimestamp))) {
    failures.push(failure("INVALID_SOURCE", "compiler-input", "Registry version or compilation timestamp is invalid."));
  }

  const sources = [...input.sources].sort((left, right) => left.identifier.localeCompare(right.identifier));
  const sourceIds = new Set<string>();
  for (const source of sources) {
    failures.push(...sourceFailures(source));
    if (sourceIds.has(source.identifier)) {
      failures.push(failure("CONFLICTING_AUTHORITY", source.identifier, "Multiple sources declare the same identifier."));
    }
    sourceIds.add(source.identifier);
  }

  const registryEntries = new Map<string, RegistryDocument>();
  for (const entry of input.registry.documents) {
    if (registryEntries.has(entry.identifier)) {
      failures.push(failure("CONFLICTING_AUTHORITY", entry.identifier, "Canonical registry contains duplicate authority."));
    }
    registryEntries.set(entry.identifier, entry);
  }

  for (const source of sources) {
    const conflict = registryConflict(source, registryEntries.get(source.identifier));
    if (conflict) failures.push(conflict);
    for (const dependency of source.dependencies) {
      if (!sourceIds.has(dependency)) {
        failures.push(failure("UNRESOLVED_DEPENDENCY", source.identifier, `Required dependency ${dependency} is unresolved.`));
      }
    }
  }

  for (const decision of input.governanceDecisions) {
    if (decision.approvalStatus === "pending") {
      failures.push(failure("PENDING_GOVERNANCE", decision.issueIdentifier, "Pending governance decisions cannot enter Runtime Context."));
    } else if (decision.approvalStatus !== "approved") {
      failures.push(failure("INVALID_SOURCE", decision.issueIdentifier, "Only approved governance decisions are compilable."));
    }
    if (!decision.evidence.length || !SEMANTIC_VERSION.test(decision.effectiveVersion)) {
      failures.push(failure("INVALID_SOURCE", decision.issueIdentifier, "Governance evidence or effective version is invalid."));
    }
  }

  if (failures.length) {
    throw new ContextCompilationError(failures);
  }

  const documentInventory = sources.map(({ identifier, title, version, location, owner, digest }) => ({
    identifier,
    title,
    version,
    location,
    owner,
    digest,
  }));
  const dependencyGraph = sources.flatMap((source) =>
    [...source.dependencies]
      .sort((left, right) => left.localeCompare(right))
      .map((target) => ({ source: source.identifier, target }))
  );
  const validatedRules: ValidatedRule[] = sources.flatMap((source) =>
    [...(source.rules ?? [])]
      .sort((left, right) => left.id.localeCompare(right.id))
      .map((rule) => ({
        ...rule,
        provenance: {
          sourceDocument: source.location,
          sourceIdentifier: source.identifier,
          version: source.version,
          digest: source.digest,
          compilationTimestamp: input.compilationTimestamp,
          validationStatus: "verified" as const,
        },
      }))
  );
  const constraints = sources.flatMap((source) =>
    [...(source.constraints ?? [])]
      .sort((left, right) => left.id.localeCompare(right.id))
      .map((constraint) => ({ ...constraint, sourceIdentifier: source.identifier }))
  );
  const approvedDecisions = [...input.governanceDecisions].sort((left, right) =>
    left.issueIdentifier.localeCompare(right.issueIdentifier)
  );
  const sourceDigest = digestValue(documentInventory);
  const registryDigest = digestValue({ ...input.registry, documents: [...input.registry.documents].sort((left, right) => left.identifier.localeCompare(right.identifier)) });
  const governanceDigest = digestValue(approvedDecisions);
  const contextWithoutDigest = {
    contextVersion: "1.0.0" as const,
    compilationTimestamp: input.compilationTimestamp,
    sourceDigest,
    registryDigest,
    governanceDigest,
    documentInventory,
    validatedRules,
    constraints,
    dependencyGraph,
    exclusionRecords: [],
  };

  return { ...contextWithoutDigest, contextDigest: digestValue(contextWithoutDigest) };
}
