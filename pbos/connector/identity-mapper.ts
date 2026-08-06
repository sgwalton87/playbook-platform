import { PlaybookIdentityMapping, PlaybookRole } from "./contracts";
import { PLAYBOOK_OS_ID, PLAYBOOK_SYSTEM_ID } from "./playbook-system-manifest";

const ROLE_AUTHORITIES: Readonly<Record<PlaybookRole, string>> = {
    SCHOLAR: "PLAYBOOK-SCHOLAR-AUTHORITY",
    SCHOLAR_ATHLETE: "PLAYBOOK-SCHOLAR-ATHLETE-AUTHORITY",
    FAMILY: "PLAYBOOK-FAMILY-AUTHORITY",
    MENTOR: "PLAYBOOK-MENTOR-AUTHORITY",
    COACH: "PLAYBOOK-COACH-AUTHORITY",
    EDUCATOR: "PLAYBOOK-EDUCATOR-AUTHORITY"
};

export class PlaybookIdentityMapper {
    mapSupabaseIdentity(userId: string, role: PlaybookRole): PlaybookIdentityMapping {
        if (!userId) throw new Error("Supabase user ID is required for PBOS identity mapping.");
        const authority = ROLE_AUTHORITIES[role];
        return {
            mappingId: `PLAYBOOK-IDENTITY-${userId}`,
            externalIdentity: {
                externalIdentityId: userId,
                externalSystemId: PLAYBOOK_SYSTEM_ID,
                role,
                authorityReferences: [authority],
                active: true
            },
            pbosIdentity: {
                actorId: `PLAYBOOK-ACTOR-${userId}`,
                systemId: PLAYBOOK_OS_ID,
                role,
                authorityContext: [authority],
                provenance: userId,
                active: true
            },
            mappedAt: new Date()
        };
    }
}
