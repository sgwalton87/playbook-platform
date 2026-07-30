import type {
  CapabilityDefinition,
  CapabilityPolicy,
  EntitlementRecord,
} from "./types";
import {
  validateCapabilityDefinition,
  validateCapabilityPolicy,
  validateEntitlementRecord,
} from "./validator";

function cloneCapability(value: CapabilityDefinition): CapabilityDefinition {
  return {
    ...value,
    dependencies: [...value.dependencies],
    security_requirements: [...value.security_requirements],
    evidence_requirements: [...value.evidence_requirements],
  };
}

function cloneEntitlement(value: EntitlementRecord): EntitlementRecord {
  return {
    ...value,
    evidence_ids: [...value.evidence_ids],
    policy_ids: [...value.policy_ids],
  };
}

function clonePolicy(value: CapabilityPolicy): CapabilityPolicy {
  return {
    ...value,
    allowed_beneficiary_types: [...value.allowed_beneficiary_types],
    allowed_sources: [...value.allowed_sources],
    required_permission_ids: [...value.required_permission_ids],
    required_evidence_ids: [...value.required_evidence_ids],
  };
}

export interface RegistryDecision {
  readonly status: "REGISTERED" | "REJECTED";
  readonly findings: readonly string[];
}

export class CapabilityRegistry {
  readonly #definitions = new Map<string, CapabilityDefinition>();
  readonly #registrationAuthorities: ReadonlySet<string>;

  constructor(registrationAuthorities: readonly string[]) {
    this.#registrationAuthorities = new Set(registrationAuthorities);
  }

  register(
    definition: CapabilityDefinition,
    authorityId: string
  ): RegistryDecision {
    const findings = [...validateCapabilityDefinition(definition).errors];
    if (!this.#registrationAuthorities.has(authorityId)) {
      findings.push("capability registration authority is not recognized.");
    }
    if (
      authorityId === definition.capability_id ||
      authorityId === definition.owning_engine_id
    ) {
      findings.push("capability or owning engine cannot register itself.");
    }
    if (
      definition.lifecycle_state !== "REGISTERED" &&
      definition.lifecycle_state !== "AVAILABLE" &&
      definition.lifecycle_state !== "ACTIVATED" &&
      definition.lifecycle_state !== "SUSPENDED" &&
      definition.lifecycle_state !== "DEPRECATED" &&
      definition.lifecycle_state !== "RETIRED"
    ) {
      findings.push(
        "capability must be REGISTERED, AVAILABLE, or ACTIVATED for registry admission."
      );
    }
    if (this.#definitions.has(definition.capability_id)) {
      findings.push("capability identity is already registered.");
    }
    if (findings.length === 0) {
      this.#definitions.set(
        definition.capability_id,
        cloneCapability(definition)
      );
    }
    return {
      status: findings.length === 0 ? "REGISTERED" : "REJECTED",
      findings,
    };
  }

  get(capabilityId: string): CapabilityDefinition | null {
    const value = this.#definitions.get(capabilityId);
    return value ? cloneCapability(value) : null;
  }
}

export class EntitlementRegistry {
  readonly #records = new Map<string, EntitlementRecord>();
  readonly #issuerAuthorities: ReadonlySet<string>;

  constructor(issuerAuthorities: readonly string[]) {
    this.#issuerAuthorities = new Set(issuerAuthorities);
  }

  register(record: EntitlementRecord): RegistryDecision {
    const findings = [...validateEntitlementRecord(record).errors];
    if (!this.#issuerAuthorities.has(record.grant_authority_id)) {
      findings.push("entitlement grant authority is not recognized.");
    }
    if (this.#records.has(record.entitlement_id)) {
      findings.push("entitlement identity is already registered.");
    }
    if (findings.length === 0) {
      this.#records.set(record.entitlement_id, cloneEntitlement(record));
    }
    return {
      status: findings.length === 0 ? "REGISTERED" : "REJECTED",
      findings,
    };
  }

  find(
    capabilityId: string,
    subjectId: string
  ): readonly EntitlementRecord[] {
    return [...this.#records.values()]
      .filter(
        (record) =>
          record.capability_id === capabilityId &&
          record.subject_id === subjectId
      )
      .sort((left, right) =>
        left.entitlement_id.localeCompare(right.entitlement_id)
      )
      .map(cloneEntitlement);
  }
}

export class CapabilityPolicyRegistry {
  readonly #policies = new Map<string, CapabilityPolicy>();

  register(policy: CapabilityPolicy): RegistryDecision {
    const findings = [...validateCapabilityPolicy(policy).errors];
    if (this.#policies.has(policy.policy_id)) {
      findings.push("capability policy identity is already registered.");
    }
    if (findings.length === 0) {
      this.#policies.set(policy.policy_id, clonePolicy(policy));
    }
    return {
      status: findings.length === 0 ? "REGISTERED" : "REJECTED",
      findings,
    };
  }

  get(policyId: string): CapabilityPolicy | null {
    const value = this.#policies.get(policyId);
    return value ? clonePolicy(value) : null;
  }
}
