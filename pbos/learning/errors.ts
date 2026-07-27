import type { LearningFailure, LearningFailureCode } from "./contracts";
export class LearningError extends Error { constructor(public readonly failures: LearningFailure[]) { super(failures.map(({ code, message }) => `${code}: ${message}`).join("; ")); this.name = "LearningError"; } }
export const learningFailure = (code: LearningFailureCode, message: string): LearningFailure => ({ code, message });
