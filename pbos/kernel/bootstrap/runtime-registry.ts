/**
 * =============================================================================
 * PBOS Runtime Registry
 * =============================================================================
 *
 * Authority:
 *   - PPS-4008 Kernel Extension Model
 *
 * Purpose:
 *   Maintains the active Runtime instances managed by the Kernel.
 *
 * =============================================================================
 */

import { DefaultKernelRuntime } from "../runtime/kernel-runtime";

export class RuntimeRegistry {
  private readonly runtimes = new Map<
    string,
    DefaultKernelRuntime
  >();

  public register(
    id: string,
    runtime: DefaultKernelRuntime,
  ): void {
    if (this.runtimes.has(id)) {
      throw new Error(
        `Runtime '${id}' is already registered.`,
      );
    }

    this.runtimes.set(id, runtime);
  }

  public resolve(
    id: string,
  ): DefaultKernelRuntime {
    const runtime = this.runtimes.get(id);

    if (!runtime) {
      throw new Error(
        `Runtime '${id}' is not registered.`,
      );
    }

    return runtime;
  }

  public list(): readonly DefaultKernelRuntime[] {
    return [...this.runtimes.values()];
  }

  public clear(): void {
    this.runtimes.clear();
  }
}
