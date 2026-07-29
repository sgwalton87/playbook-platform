import { dispatchKernelCommand } from "./kernel-command-bus";

export async function runExecute() {
  const result = await dispatchKernelCommand("execute");
  if (!result.successful) throw new Error(result.output);
  return result;
}
