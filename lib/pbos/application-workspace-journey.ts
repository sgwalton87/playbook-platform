import type { PlaybookIdentityMapping, PlaybookRole } from "../../pbos/connector/contracts";
import { authorizePlaybookFoundation } from "./foundation";

export const APPLICATION_TYPES = ["college", "scholarship", "internship", "job", "sponsorship", "recruiting", "nil", "mentor", "mentorship", "career",
  "summer_program", "competition", "grant", "volunteer", "research"] as const;
export type ApplicationType = typeof APPLICATION_TYPES[number];
export type ApplicationTaskInput = { key: string; title: string; dueAt?: string | null };

export interface ApplicationWorkspaceRepository {
  createPending(input: { ownerId: string; opportunityId: string; opportunityName: string; opportunityType: ApplicationType;
    deadline: string | null; tasks: readonly ApplicationTaskInput[]; idempotencyKey: string; provenance: readonly string[] }): Promise<{ workspaceId: string }>;
  activate(input: { ownerId: string; workspaceId: string; provenance: readonly string[] }): Promise<void>;
  transition(input: { ownerId: string; workspaceId: string; action: "TASK_COMPLETED" | "TASK_REOPENED" | "APPLICATION_SUBMITTED";
    taskId?: string; idempotencyKey: string; provenance: readonly string[] }): Promise<{ readiness: number; status: "building" | "ready" | "submitted" }>;
  recordTransition(input: { ownerId: string; workspaceId: string; action: string; idempotencyKey: string; provenance: readonly string[] }): Promise<void>;
}

export interface ApplicationWorkspaceRuntime {
  registerIdentity(userId: string, role: PlaybookRole): Promise<PlaybookIdentityMapping>;
  publish(identity: PlaybookIdentityMapping, input: { eventType: "APPLICATION_WORKSPACE_CREATED" | "APPLICATION_WORKSPACE_PROGRESS_UPDATED";
    workspaceId: string; opportunityId?: string; action?: string; readiness?: number; status?: string; correlationId: string }): Promise<readonly string[]>;
}

export interface CreateApplicationWorkspaceInput {
  actorId: string; ownerId: string; role: PlaybookRole; approvalId: string; opportunityId: string; opportunityName: string;
  opportunityType: ApplicationType; deadline?: string | null; tasks?: readonly ApplicationTaskInput[]; idempotencyKey: string;
}

const DEFAULT_TASKS: readonly ApplicationTaskInput[] = [
  { key: "review", title: "Review opportunity requirements" },
  { key: "resume", title: "Prepare resume" },
  { key: "documents", title: "Collect required documents" },
  { key: "submit", title: "Review and submit application" }
];

function validateDeadline(value?: string | null): string | null {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value + "T00:00:00Z"))) {
    throw new Error("Application deadline must be a valid ISO date.");
  }
  return value;
}

export class ApplicationWorkspaceJourneyService {
  constructor(private readonly repository: ApplicationWorkspaceRepository, private readonly runtime: ApplicationWorkspaceRuntime) {}

  async create(input: CreateApplicationWorkspaceInput) {
    if (!input.idempotencyKey.trim()) throw new Error("Application workspace idempotency key required.");
    if (!input.opportunityId.trim() || !input.opportunityName.trim()) throw new Error("A governed opportunity is required.");
    if (!(APPLICATION_TYPES as readonly string[]).includes(input.opportunityType)) throw new Error("Application opportunity type is invalid.");
    const tasks = (input.tasks?.length ? input.tasks : DEFAULT_TASKS).slice(0, 20);
    if (tasks.some(task => !task.key.trim() || !task.title.trim())) throw new Error("Application tasks require stable keys and titles.");
    const authority = authorizePlaybookFoundation({ userId: input.actorId, ownerId: input.ownerId, role: input.role, approvalId: input.approvalId });
    const identity = await this.runtime.registerIdentity(input.actorId, input.role);
    const baseProvenance = [...authority.provenance, identity.pbosIdentity.provenance, input.approvalId];
    const record = await this.repository.createPending({ ownerId: input.ownerId, opportunityId: input.opportunityId,
      opportunityName: input.opportunityName.trim(), opportunityType: input.opportunityType, deadline: validateDeadline(input.deadline),
      tasks, idempotencyKey: input.idempotencyKey, provenance: baseProvenance });
    const runtimeProvenance = await this.runtime.publish(identity, { eventType: "APPLICATION_WORKSPACE_CREATED",
      workspaceId: record.workspaceId, opportunityId: input.opportunityId, correlationId: input.idempotencyKey });
    const provenance = [...baseProvenance, ...runtimeProvenance];
    await this.repository.activate({ ownerId: input.ownerId, workspaceId: record.workspaceId, provenance });
    return { workspaceId: record.workspaceId, status: "building" as const, provenance };
  }

  async transition(input: { actorId: string; ownerId: string; role: PlaybookRole; approvalId: string; workspaceId: string;
    action: "TASK_COMPLETED" | "TASK_REOPENED" | "APPLICATION_SUBMITTED"; taskId?: string; idempotencyKey: string }) {
    if (!input.idempotencyKey.trim()) throw new Error("Application transition idempotency key required.");
    if (!input.workspaceId.trim()) throw new Error("Application workspace required.");
    if (input.action !== "APPLICATION_SUBMITTED" && !input.taskId) throw new Error("Application task required.");
    const authority = authorizePlaybookFoundation({ userId: input.actorId, ownerId: input.ownerId, role: input.role, approvalId: input.approvalId });
    const identity = await this.runtime.registerIdentity(input.actorId, input.role);
    const baseProvenance = [...authority.provenance, identity.pbosIdentity.provenance, input.approvalId];
    const state = await this.repository.transition({ ownerId: input.ownerId, workspaceId: input.workspaceId,
      action: input.action, taskId: input.taskId, idempotencyKey: input.idempotencyKey, provenance: baseProvenance });
    const runtimeProvenance = await this.runtime.publish(identity, { eventType: "APPLICATION_WORKSPACE_PROGRESS_UPDATED",
      workspaceId: input.workspaceId, action: input.action, readiness: state.readiness, status: state.status,
      correlationId: input.idempotencyKey });
    const provenance = [...baseProvenance, ...runtimeProvenance];
    await this.repository.recordTransition({ ownerId: input.ownerId, workspaceId: input.workspaceId,
      action: input.action, idempotencyKey: input.idempotencyKey, provenance });
    return { ...state, provenance };
  }
}