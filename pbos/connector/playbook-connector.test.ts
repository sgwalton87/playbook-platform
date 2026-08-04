import { describe, expect, it } from "vitest";
import { PbosRequest, PbosTransport } from "./contracts";
import { PlaybookConnector } from "./playbook-connector";
import { PLAYBOOK_DOMAINS } from "./playbook-system-manifest";
import { PlaybookPbosRuntimeClient } from "./pbos-runtime-client";

class RecordingTransport implements PbosTransport {
    readonly requests: PbosRequest[] = [];
    constructor(private readonly deniedOperation?: string) {}

    async send<T>(request: PbosRequest) {
        this.requests.push(request);
        if (request.operation === this.deniedOperation) return {
            success: false as const,
            apiVersion: "v1" as const,
            correlationId: request.correlationId,
            error: { code: "AUTHORITY_DENIED", message: "Governance approval denied." }
        };
        return {
            success: true as const,
            apiVersion: "v1" as const,
            correlationId: request.correlationId,
            output: {} as T,
            provenance: ["PBOS-V1", request.operation]
        };
    }
}

const approvals = {
    systemCertificationApprovalId: "PLAYBOOK-CERTIFICATION-APPROVAL-001",
    certifiedBy: "PBOS-CERTIFICATION-AUTHORITY",
    domainActivationApprovalIds: Object.fromEntries(PLAYBOOK_DOMAINS.map(domain => [domain, `${domain}-APPROVAL`]))
};

describe("PLAYBOOK-SYSTEM-001 connector", () => {
    it("declares, registers, certifies, and activates all Playbook domains", async () => {
        const transport = new RecordingTransport();
        const connector = new PlaybookConnector(new PlaybookPbosRuntimeClient(transport));
        await connector.activate(approvals);
        expect(transport.requests[0].operation).toBe("REGISTER_SYSTEM");
        expect(transport.requests.filter(request => request.operation === "ACTIVATE_DOMAIN")).toHaveLength(6);
    });

    it("maps Supabase identity with PBOS provenance before health communication", async () => {
        const transport = new RecordingTransport();
        const connector = new PlaybookConnector(new PlaybookPbosRuntimeClient(transport));
        const identity = await connector.registerIdentity("supabase-user-001", "SCHOLAR");
        expect(identity.pbosIdentity.provenance).toContain("supabase-user-001");
        await connector.health(identity);
        expect(transport.requests.at(-1)?.operation).toBe("HEALTH_CHECK");
    });

    it("stops activation when PBOS denies certification", async () => {
        const connector = new PlaybookConnector(new PlaybookPbosRuntimeClient(new RecordingTransport("CERTIFY_SYSTEM")));
        await expect(connector.activate(approvals)).rejects.toThrow("AUTHORITY_DENIED");
    });
});
