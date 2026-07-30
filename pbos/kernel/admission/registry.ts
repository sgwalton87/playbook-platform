import type {
  EngineManifest,
  EngineRegistration,
  EngineRegistrationDecision,
} from "./types";
import { validateEngineRegistration } from "./validator";

function cloneManifest(manifest: EngineManifest): EngineManifest {
  return {
    ...manifest,
    capabilities: manifest.capabilities.map((capability) => ({
      ...capability,
      operations: [...capability.operations],
    })),
    authority_scope: [...manifest.authority_scope],
    required_permissions: [...manifest.required_permissions],
    input_contracts: [...manifest.input_contracts],
    output_contracts: [...manifest.output_contracts],
    lifecycle_requirements: {
      ...manifest.lifecycle_requirements,
      compatible_states: [
        ...manifest.lifecycle_requirements.compatible_states,
      ],
    },
    evidence_requirements: [...manifest.evidence_requirements],
    security_requirements: [...manifest.security_requirements],
    certification_requirements: [...manifest.certification_requirements],
    operational_requirements: [...manifest.operational_requirements],
    dependencies: [...manifest.dependencies],
  };
}

export class CertifiedEngineManifestRegistry {
  readonly #manifests = new Map<string, EngineManifest>();
  readonly #registrationAuthorityIds: ReadonlySet<string>;

  constructor(registrationAuthorityIds: readonly string[]) {
    this.#registrationAuthorityIds = new Set(registrationAuthorityIds);
  }

  register(
    manifest: EngineManifest,
    registration: EngineRegistration
  ): EngineRegistrationDecision {
    const findings = [
      ...validateEngineRegistration(manifest, registration).errors,
    ];
    if (!this.#registrationAuthorityIds.has(registration.authority_id)) {
      findings.push("registration authority is not recognized.");
    }
    const existing = this.#manifests.get(manifest.engine_id);
    if (existing) {
      findings.push(
        existing.manifest_digest === manifest.manifest_digest
          ? "engine manifest is already registered."
          : "engine identity is already registered with different content."
      );
    }
    if (findings.length === 0) {
      this.#manifests.set(manifest.engine_id, cloneManifest(manifest));
    }
    return {
      engine_id: manifest.engine_id,
      manifest_digest: manifest.manifest_digest,
      status: findings.length === 0 ? "REGISTERED" : "REJECTED",
      findings,
    };
  }

  get(engineId: string): EngineManifest | null {
    const manifest = this.#manifests.get(engineId);
    return manifest ? cloneManifest(manifest) : null;
  }

  list(): readonly EngineManifest[] {
    return [...this.#manifests.values()]
      .sort((left, right) => left.engine_id.localeCompare(right.engine_id))
      .map(cloneManifest);
  }
}
