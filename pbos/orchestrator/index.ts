import { runRuntime } from "../runtime/runtime";

export * from "./governed";
export * from "./governed-contracts";

export async function orchestrate() {
  return runRuntime();
}
