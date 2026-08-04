import {
    PbosResponse,
    PlaybookIdentityMapping,
    ScholarDashboardProjection,
    ScholarOnboardingEvent
} from "./contracts";
import { PlaybookIdentityMapper } from "./identity-mapper";
import {
    PLAYBOOK_CONNECTOR_ID,
    playbookDomainManifests,
    playbookSystemManifest
} from "./playbook-system-manifest";
import { PlaybookPbosRuntimeClient } from "./pbos-runtime-client";

export interface PlaybookActivationApprovals {
    readonly systemCertificationApprovalId: string;
    readonly domainActivationApprovalIds: Readonly<Record<string, string>>;
    readonly certifiedBy: string;
}

export class PlaybookConnector {
    constructor(
        private readonly client: PlaybookPbosRuntimeClient,
        private readonly identities = new PlaybookIdentityMapper()
    ) {}

    async activate(approvals: PlaybookActivationApprovals): Promise<readonly PbosResponse[]> {
        const responses: PbosResponse[] = [];
        responses.push(await this.requireSuccess(this.client.send("REGISTER_SYSTEM", playbookSystemManifest, "playbook-register-system")));
        responses.push(await this.requireSuccess(this.client.send("CERTIFY_SYSTEM", {
            connectorId: PLAYBOOK_CONNECTOR_ID,
            approvalId: approvals.systemCertificationApprovalId,
            certifiedBy: approvals.certifiedBy
        }, "playbook-certify-system")));
        for (const domain of playbookDomainManifests) {
            responses.push(await this.requireSuccess(this.client.send("REGISTER_DOMAIN", domain, `playbook-register-${domain.domainId}`)));
            const approvalId = approvals.domainActivationApprovalIds[domain.domainId];
            if (!approvalId) throw new Error(`Missing PBOS activation approval for ${domain.domainId}.`);
            responses.push(await this.requireSuccess(this.client.send("ACTIVATE_DOMAIN", {
                registrationId: domain.registrationId,
                approvalId
            }, `playbook-activate-${domain.domainId}`)));
        }
        return responses;
    }

    async registerIdentity(userId: string, role: Parameters<PlaybookIdentityMapper["mapSupabaseIdentity"]>[1]): Promise<PlaybookIdentityMapping> {
        const mapping = this.identities.mapSupabaseIdentity(userId, role);
        await this.requireSuccess(this.client.send("REGISTER_IDENTITY", mapping, `playbook-map-${userId}`));
        return mapping;
    }

    health(identity: PlaybookIdentityMapping, purpose = "Verify Playbook PBOS runtime readiness."): Promise<PbosResponse> {
        return this.client.send("HEALTH_CHECK", {
            connectorId: PLAYBOOK_CONNECTOR_ID,
            domainRegistrationId: "PLAYBOOK-DOMAIN-SCHOLAR-REGISTRATION-001",
            identityMappingId: identity.mappingId,
            purpose,
            correlationId: `playbook-health-${identity.externalIdentity.externalIdentityId}`
        }, `playbook-health-${identity.externalIdentity.externalIdentityId}`);
    }

    discoverCapabilities(grantedPermissions: readonly string[], correlationId: string): Promise<PbosResponse> {
        return this.client.send("DISCOVER_CAPABILITIES", {
            connectorId: PLAYBOOK_CONNECTOR_ID,
            grantedPermissions
        }, correlationId);
    }

    publishScholarOnboarding(
        identity: PlaybookIdentityMapping,
        event: ScholarOnboardingEvent,
        correlationId: string
    ): Promise<PbosResponse> {
        return this.client.send("PUBLISH_LIFECYCLE_EVENT", {
            ...this.scholarRuntimeBoundary(identity, correlationId),
            purpose: "Publish an approved Scholar onboarding milestone.",
            payload: event
        }, correlationId, correlationId);
    }

    async projectScholarDashboard(
        identity: PlaybookIdentityMapping,
        projection: ScholarDashboardProjection,
        exchangeApprovalId: string,
        correlationId: string
    ): Promise<PbosResponse> {
        if (!exchangeApprovalId) throw new Error("PBOS approval is required for Scholar dashboard exchange.");
        return await this.client.send("EXCHANGE_APPROVED_DATA", {
            ...this.scholarRuntimeBoundary(identity, correlationId),
            purpose: "Project approved Scholar onboarding state to the dashboard.",
            payload: projection,
            dataClassification: "PRIVATE",
            exchangeApprovalId
        }, correlationId, correlationId);
    }

    private scholarRuntimeBoundary(identity: PlaybookIdentityMapping, correlationId: string) {
        if (!correlationId) throw new Error("Scholar runtime operations require a correlation ID.");
        return {
            connectorId: PLAYBOOK_CONNECTOR_ID,
            domainRegistrationId: "PLAYBOOK-DOMAIN-SCHOLAR-REGISTRATION-001",
            identityMappingId: identity.mappingId,
            correlationId
        } as const;
    }

    private async requireSuccess(response: Promise<PbosResponse>): Promise<PbosResponse> {
        const resolved = await response;
        if (!resolved.success) throw new Error(`PBOS ${resolved.error.code}: ${resolved.error.message}`);
        return resolved;
    }
}
