export function requireOwner(actorId: string, ownerId: string): void { if (actorId !== ownerId) throw new Error("Access denied."); }
export function requireApproval(approvalId?: string): string { if (!approvalId) throw new Error("Explicit approval required."); return approvalId; }
