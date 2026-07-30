import { artifactDigest } from "../identity";
import {
  contractResult,
  requireDigest,
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
  validateCertificationTrustEnvelope,
  type ContractValidationResult,
} from "../contracts";
import {
  ENGINE_CLASSIFICATIONS,
  ENGINE_LIFECYCLE_STATES,
  type EngineAdmissionRequest,
  type EngineManifest,
  type EngineRegistration,
} from "./types";

function manifestIdentity(manifest: EngineManifest): string {
  return artifactDigest({
    manifest_version: manifest.manifest_version,
    engine_id: manifest.engine_id,
    name: manifest.name,
    purpose: manifest.purpose,
    owner: manifest.owner,
    version: manifest.version,
    classification: manifest.classification,
    lifecycle_state: manifest.lifecycle_state,
    capabilities: manifest.capabilities,
    authority_scope: manifest.authority_scope,
    required_permissions: manifest.required_permissions,
    input_contracts: manifest.input_contracts,
    output_contracts: manifest.output_contracts,
    lifecycle_requirements: manifest.lifecycle_requirements,
    evidence_requirements: manifest.evidence_requirements,
    security_requirements: manifest.security_requirements,
    certification_requirements: manifest.certification_requirements,
    operational_requirements: manifest.operational_requirements,
    dependencies: manifest.dependencies,
  });
}

function requireNonEmptyIdentifiers(
  errors: string[],
  field: string,
  values: readonly string[]
): void {
  requireIdentifiers(errors, field, values);
  if (values.length === 0) errors.push(`${field} is required.`);
}

export function engineManifestDigest(manifest: EngineManifest): string {
  return manifestIdentity(manifest);
}

export function createEngineManifest(
  content: Omit<EngineManifest, "manifest_digest">
): EngineManifest {
  const manifest = { ...content, manifest_digest: "" };
  return { ...manifest, manifest_digest: manifestIdentity(manifest) };
}

export function validateEngineManifest(
  manifest: EngineManifest
): ContractValidationResult {
  const errors: string[] = [];
  requireDigest(errors, "engine.manifest_digest", manifest.manifest_digest);
  requireIdentifier(errors, "engine.engine_id", manifest.engine_id);
  requireIdentifier(errors, "engine.name", manifest.name);
  requireIdentifier(errors, "engine.purpose", manifest.purpose);
  requireIdentifier(errors, "engine.owner", manifest.owner);
  requireIdentifier(errors, "engine.version", manifest.version);
  if (!ENGINE_CLASSIFICATIONS.includes(manifest.classification)) {
    errors.push("engine.classification is not governed.");
  }
  if (!ENGINE_LIFECYCLE_STATES.includes(manifest.lifecycle_state)) {
    errors.push("engine.lifecycle_state is not governed.");
  }
  if (manifest.manifest_digest !== manifestIdentity(manifest)) {
    errors.push("engine.manifest_digest does not match manifest content.");
  }
  if (manifest.capabilities.length === 0) {
    errors.push("engine.capabilities is required.");
  }
  const capabilityIds = manifest.capabilities.map(
    ({ capability_id }) => capability_id
  );
  requireIdentifiers(errors, "engine.capabilities", capabilityIds);
  for (const capability of manifest.capabilities) {
    requireIdentifier(
      errors,
      "engine.capability.capability_id",
      capability.capability_id
    );
    requireIdentifier(
      errors,
      "engine.capability.description",
      capability.description
    );
    requireNonEmptyIdentifiers(
      errors,
      `engine.capability.${capability.capability_id}.operations`,
      capability.operations
    );
  }
  requireNonEmptyIdentifiers(
    errors,
    "engine.authority_scope",
    manifest.authority_scope
  );
  requireNonEmptyIdentifiers(
    errors,
    "engine.required_permissions",
    manifest.required_permissions
  );
  requireNonEmptyIdentifiers(
    errors,
    "engine.input_contracts",
    manifest.input_contracts
  );
  requireNonEmptyIdentifiers(
    errors,
    "engine.output_contracts",
    manifest.output_contracts
  );
  requireIdentifier(
    errors,
    "engine.lifecycle_requirements.lifecycle_id",
    manifest.lifecycle_requirements.lifecycle_id
  );
  if (manifest.lifecycle_requirements.compatible_states.length === 0) {
    errors.push(
      "engine.lifecycle_requirements.compatible_states is required."
    );
  }
  requireIdentifiers(
    errors,
    "engine.lifecycle_requirements.compatible_states",
    manifest.lifecycle_requirements.compatible_states
  );
  requireNonEmptyIdentifiers(
    errors,
    "engine.evidence_requirements",
    manifest.evidence_requirements
  );
  requireNonEmptyIdentifiers(
    errors,
    "engine.security_requirements",
    manifest.security_requirements
  );
  requireNonEmptyIdentifiers(
    errors,
    "engine.certification_requirements",
    manifest.certification_requirements
  );
  requireNonEmptyIdentifiers(
    errors,
    "engine.operational_requirements",
    manifest.operational_requirements
  );
  requireIdentifiers(errors, "engine.dependencies", manifest.dependencies);
  if (manifest.dependencies.includes(manifest.engine_id)) {
    errors.push("engine cannot depend on itself.");
  }
  return contractResult(errors);
}

export function validateEngineRegistration(
  manifest: EngineManifest,
  registration: EngineRegistration
): ContractValidationResult {
  const errors = [...validateEngineManifest(manifest).errors];
  requireIdentifier(
    errors,
    "registration.registration_id",
    registration.registration_id
  );
  requireIdentifier(
    errors,
    "registration.authority_id",
    registration.authority_id
  );
  requireIdentifier(
    errors,
    "registration.registered_by",
    registration.registered_by
  );
  requireTimestamp(
    errors,
    "registration.registered_at",
    registration.registered_at
  );
  if (registration.engine_id !== manifest.engine_id) {
    errors.push("registration engine identity does not match manifest.");
  }
  if (registration.manifest_digest !== manifest.manifest_digest) {
    errors.push("registration manifest identity does not match manifest.");
  }
  if (registration.status !== "REGISTERED") {
    errors.push("registration status must be REGISTERED.");
  }
  if (
    registration.authority_id === manifest.engine_id ||
    registration.registered_by === manifest.engine_id
  ) {
    errors.push("engine cannot own its registration authority.");
  }
  return contractResult(errors);
}

function requireEvery(
  errors: string[],
  required: readonly string[],
  available: ReadonlySet<string>,
  message: (value: string) => string
): void {
  for (const value of required) {
    if (!available.has(value)) errors.push(message(value));
  }
}

export function validateEngineAdmissionRequest(
  request: EngineAdmissionRequest
): ContractValidationResult {
  const errors = [
    ...validateEngineRegistration(
      request.manifest,
      request.registration
    ).errors,
  ];
  requireIdentifier(errors, "admission.request_id", request.request_id);
  if (request.manifest.lifecycle_state !== "REGISTERED") {
    errors.push("engine must be REGISTERED before admission.");
  }
  requireIdentifier(
    errors,
    "admission.authority.authority_id",
    request.authority.authority_id
  );
  requireIdentifiers(
    errors,
    "admission.authority.capability_ids",
    request.authority.capability_ids
  );
  requireIdentifiers(
    errors,
    "admission.authority.permission_ids",
    request.authority.permission_ids
  );
  requireIdentifiers(
    errors,
    "admission.authority.scope_ids",
    request.authority.scope_ids
  );
  if (request.authority.status !== "AUTHORIZED") {
    errors.push("engine authority status must be AUTHORIZED.");
  }
  if (request.authority.authority_id === request.manifest.engine_id) {
    errors.push("engine cannot own its execution authority.");
  }
  if (
    request.authority.engine_id !== request.manifest.engine_id ||
    request.authority.owner !== request.manifest.owner
  ) {
    errors.push("engine authority identity or owner does not match manifest.");
  }
  const declaredCapabilities = new Set(
    request.manifest.capabilities.map(({ capability_id }) => capability_id)
  );
  requireEvery(
    errors,
    request.authority.capability_ids,
    declaredCapabilities,
    (id) => `engine authority contains hidden capability: ${id}.`
  );
  requireEvery(
    errors,
    request.manifest.capabilities.map(({ capability_id }) => capability_id),
    new Set(request.authority.capability_ids),
    (id) => `engine capability lacks authority: ${id}.`
  );
  requireEvery(
    errors,
    request.manifest.required_permissions,
    new Set(request.authority.permission_ids),
    (id) => `engine permission unavailable: ${id}.`
  );
  requireEvery(
    errors,
    request.manifest.authority_scope,
    new Set(request.authority.scope_ids),
    (id) => `engine authority scope unavailable: ${id}.`
  );
  if (
    request.lifecycle.lifecycle_id !==
      request.manifest.lifecycle_requirements.lifecycle_id ||
    !request.manifest.lifecycle_requirements.compatible_states.includes(
      request.lifecycle.state
    )
  ) {
    errors.push("engine lifecycle is incompatible.");
  }
  requireEvery(
    errors,
    request.manifest.dependencies,
    new Set(request.available_dependency_ids),
    (id) => `engine dependency unavailable: ${id}.`
  );
  requireEvery(
    errors,
    request.manifest.evidence_requirements,
    new Set(request.available_evidence_requirement_ids),
    (id) => `engine evidence requirement unavailable: ${id}.`
  );
  requireEvery(
    errors,
    request.manifest.security_requirements,
    new Set(request.available_security_requirement_ids),
    (id) => `engine security requirement unavailable: ${id}.`
  );
  requireEvery(
    errors,
    request.manifest.operational_requirements,
    new Set(request.available_operational_requirement_ids),
    (id) => `engine operational requirement unavailable: ${id}.`
  );
  const certifications = new Map(
    request.certifications.map((certification) => [
      certification.id,
      certification,
    ])
  );
  if (certifications.size !== request.certifications.length) {
    errors.push("engine certifications contain duplicate identities.");
  }
  for (const requirement of request.manifest.certification_requirements) {
    const certification = certifications.get(requirement);
    if (!certification) {
      errors.push(`engine certification unavailable: ${requirement}.`);
      continue;
    }
    errors.push(...validateCertificationTrustEnvelope(certification).errors);
    if (certification.issuerId === request.manifest.engine_id) {
      errors.push("engine cannot own its certification authority.");
    }
    if (
      certification.subjectId !== request.manifest.engine_id ||
      certification.subjectDigest !== request.manifest.manifest_digest
    ) {
      errors.push(
        `engine certification identity does not match manifest: ${requirement}.`
      );
    }
  }
  return contractResult(errors);
}
