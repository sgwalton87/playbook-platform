export interface AuthenticatedActor { actorId: string; organizationId: string; roles: readonly string[] }
export function requireActor(actor?: AuthenticatedActor): AuthenticatedActor { if (!actor) throw new Error("Authentication required."); return actor; }
