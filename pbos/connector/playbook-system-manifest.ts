export const PLAYBOOK_CONNECTOR_ID = "PLAYBOOK-CONNECTOR-001" as const;
export const PLAYBOOK_SYSTEM_ID = "PLAYBOOK-SYSTEM-001" as const;
export const PLAYBOOK_OS_ID = "PLAYBOOK-OS-001" as const;

export const PLAYBOOK_DOMAINS = [
    "PLAYBOOK-DOMAIN-SCHOLAR",
    "PLAYBOOK-DOMAIN-SCHOLAR-ATHLETE",
    "PLAYBOOK-DOMAIN-FAMILY",
    "PLAYBOOK-DOMAIN-MENTOR",
    "PLAYBOOK-DOMAIN-COACH",
    "PLAYBOOK-DOMAIN-EDUCATION"
] as const;

export const playbookSystemManifest = {
    connectorId: PLAYBOOK_CONNECTOR_ID,
    externalSystemId: PLAYBOOK_SYSTEM_ID,
    pbosSystemId: PLAYBOOK_OS_ID,
    name: "Playbook Platform",
    version: "1.0.0",
    domainIds: PLAYBOOK_DOMAINS,
    capabilities: [{
        capabilityId: "PLAYBOOK-RUNTIME-HEALTH",
        name: "PBOS Runtime Health",
        type: "SERVICE",
        version: "1.0.0",
        requiredPermissions: ["READ_RUNTIME_HEALTH"],
        inputSchemaId: "pbos.health.request.v1",
        outputSchemaId: "pbos.health.response.v1",
        active: true
    }],
    permissions: ["READ_RUNTIME_HEALTH"],
    communicationRules: ["HEALTH_CHECK"]
} as const;

export const playbookDomainManifests = PLAYBOOK_DOMAINS.map((domainId) => ({
    registrationId: `${domainId}-REGISTRATION-001`,
    connectorId: PLAYBOOK_CONNECTOR_ID,
    externalSystemId: PLAYBOOK_SYSTEM_ID,
    pbosSystemId: PLAYBOOK_OS_ID,
    domainId,
    capabilityIds: ["PLAYBOOK-RUNTIME-HEALTH"],
    workflowIds: domainId === "PLAYBOOK-DOMAIN-SCHOLAR" ? ["PLAYBOOK-SCHOLAR-ONBOARDING"] : [],
    requiredServiceIds: ["PBOS-RUNTIME-HEALTH"],
    governanceRequirementIds: ["PBOS-AUTHORITY-BOUNDARY", "PLAYBOOK-DATA-OWNERSHIP"]
}));
