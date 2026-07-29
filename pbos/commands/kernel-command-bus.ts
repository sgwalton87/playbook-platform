import { runRepositoryKernel } from "../engine/kernel-repository-adapter";
import { formatEngineHealth, getEngineHealth } from "../health/engine-health";
import { runKernelRuntime } from "../runtime/kernel-runtime";

export const KERNEL_COMMANDS = [
  "next",
  "plan",
  "report",
  "certify",
  "status",
  "execute",
] as const;

export type KernelCommandName = (typeof KERNEL_COMMANDS)[number];

export interface KernelCommandResult {
  readonly command: KernelCommandName;
  readonly output: string;
  readonly successful: boolean;
}

export function isKernelCommand(value: string): value is KernelCommandName {
  return KERNEL_COMMANDS.some((command) => command === value);
}

export async function dispatchKernelCommand(
  command: KernelCommandName,
  rootDir = process.cwd(),
  actorId = process.env.PBOS_ACTOR_ID ?? ""
): Promise<KernelCommandResult> {
  if (command === "execute") {
    const result = await runKernelRuntime({ rootDir, actorId });
    return {
      command,
      successful: result.successful,
      output: JSON.stringify(result.envelope, null, 2),
    };
  }

  const kernel = await runRepositoryKernel(rootDir);

  if (command === "status") {
    const health = await getEngineHealth(rootDir);
    return {
      command,
      successful: true,
      output: [
        formatEngineHealth(health),
        `Kernel Decision: ${kernel.decision.selectedObjectiveId ?? "NONE"}`,
        `Kernel Certification: ${kernel.certification.status}`,
        `Kernel Report Digest: ${kernel.report.digest}`,
      ].join("\n"),
    };
  }

  if (command === "next" || command === "report") {
    return {
      command,
      successful: kernel.status === "CERTIFIED",
      output: kernel.report.markdown,
    };
  }

  if (command === "plan") {
    return {
      command,
      successful: kernel.status === "CERTIFIED" && kernel.plan !== null,
      output: kernel.plan
        ? JSON.stringify(kernel.plan, null, 2)
        : "No execution plan is eligible.",
    };
  }

  if (command === "certify") {
    return {
      command,
      successful: kernel.certification.status === "CERTIFIED",
      output: JSON.stringify(kernel.certification, null, 2),
    };
  }

  throw new Error(`Unhandled PBOS kernel command '${command}'.`);
}
