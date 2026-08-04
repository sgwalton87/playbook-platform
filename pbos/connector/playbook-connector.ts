import { PbosResponse, PlaybookIdentityMapping } from "./contracts";
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

    private async requireSuccess(response: Promise<PbosResponse>): Promise<PbosResponse> {
        const resolved = await response;
        if (!resolved.success) throw new Error(`PBOS ${resolved.error.code}: ${resolved.error.message}`);
        return resolved;
    }
}
