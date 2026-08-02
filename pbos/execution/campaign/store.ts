import path from "node:path";
import { Artifacts, Runtime, artifactDigest } from "../../kernel";
import type { CampaignApproval, CampaignProgress, ExecutionCampaign } from "./types";

function load<T>(rootDir: string, artifact: string): T | null {
  const target = path.join(rootDir, artifact);
  if (!Runtime.exists(target)) return null;
  const value = Runtime.load(target) as T & { digest?: string };
  if (!value || typeof value !== "object" ||
      value.digest !== artifactDigest({ ...value, digest: undefined })) return null;
  return value;
}

function save<T extends { readonly digest: string }>(
  rootDir: string, artifact: string, owner: string, value: Omit<T, "digest"> | T
): T {
  const body = { ...value, digest: undefined };
  const persisted = { ...value, digest: artifactDigest(body) } as T;
  Runtime.save(path.join(rootDir, artifact), persisted, owner);
  return persisted;
}

export const loadExecutionCampaign = (rootDir = process.cwd()) =>
  load<ExecutionCampaign>(rootDir, Artifacts.executionCampaign);
export const persistExecutionCampaign = (rootDir: string, value: ExecutionCampaign) =>
  save<ExecutionCampaign>(rootDir, Artifacts.executionCampaign, "execution-campaign-authority", value);
export const loadCampaignApproval = (rootDir = process.cwd()) =>
  load<CampaignApproval>(rootDir, Artifacts.campaignApproval);
export const persistCampaignApproval = (rootDir: string, value: CampaignApproval) =>
  save<CampaignApproval>(rootDir, Artifacts.campaignApproval, "execution-campaign-approval", value);
export const loadCampaignProgress = (rootDir = process.cwd()) =>
  load<CampaignProgress>(rootDir, Artifacts.campaignProgress);
export const persistCampaignProgress = (rootDir: string, value: CampaignProgress) =>
  save<CampaignProgress>(rootDir, Artifacts.campaignProgress, "execution-campaign-progress", value);
