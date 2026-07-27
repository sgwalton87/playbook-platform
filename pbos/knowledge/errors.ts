import type { KnowledgeFailure, KnowledgeFailureCode } from "./governed-contracts";
export class KnowledgeError extends Error { constructor(public readonly failures: KnowledgeFailure[]) { super(failures.map(({ code, message }) => `${code}: ${message}`).join("; ")); this.name = "KnowledgeError"; } }
export const knowledgeFailure = (code: KnowledgeFailureCode, message: string): KnowledgeFailure => ({ code, message });
