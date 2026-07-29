/**
 * =============================================================================
 * PBOS Runtime Factory
 * =============================================================================
 *
 * Purpose:
 *   Creates the canonical runtime used by PBOS.
 *
 * =============================================================================
 */

import { ExecutionEngine } from "../kernel/engine/execution-engine";
import { ExecutionPipeline } from "../kernel/engine/execution-pipeline";
import { KernelRuntime } from "./kernel-runtime";

export function createRuntime(): KernelRuntime {
  const pipeline = new ExecutionPipeline();

  const engine = new ExecutionEngine(
    pipeline,
  );

  return new KernelRuntime(engine);
}
