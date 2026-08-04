export const PBOS_API_VERSION = "v1" as const;

export type PbosOperation =
    | "REGISTER_SYSTEM"
    | "CERTIFY_SYSTEM"
    | "REGISTER_DOMAIN"
    | "ACTIVATE_DOMAIN"
    | "REGISTER_IDENTITY"
    | "HEALTH_CHECK";

export interface PbosRequest<T = unknown> {
    readonly apiVersion: typeof PBOS_API_VERSION;
    readonly operation: PbosOperation;
    readonly correlationId: string;
    readonly payload: T;
}

export type PbosResponse<T = unknown> =
    | { readonly success: true; readonly apiVersion: "v1"; readonly correlationId: string; readonly output: T; readonly provenance: readonly string[] }
    | { readonly success: false; readonly apiVersion: "v1"; readonly correlationId: string; readonly error: { readonly code: string; readonly message: string } };

export interface PlaybookIdentityMapping {
    readonly mappingId: string;
    readonly externalIdentity: {
        readonly externalIdentityId: string;
        readonly externalSystemId: "PLAYBOOK-SYSTEM-001";
        readonly role: PlaybookRole;
        readonly authorityReferences: readonly string[];
        readonly active: boolean;
    };
    readonly pbosIdentity: {
        readonly actorId: string;
        readonly systemId: "PLAYBOOK-OS-001";
        readonly role: PlaybookRole;
        readonly authorityContext: readonly string[];
        readonly provenance: string;
        readonly active: boolean;
    };
    readonly mappedAt: Date;
}

export type PlaybookRole = "SCHOLAR" | "SCHOLAR_ATHLETE" | "FAMILY" | "MENTOR" | "COACH" | "EDUCATOR";

export interface PbosTransport {
    send<T>(request: PbosRequest): Promise<PbosResponse<T>>;
}
