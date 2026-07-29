/**
 * =============================================================================
 * PBOS Runtime Registry
 * =============================================================================
 *
 * Purpose:
 *   Maintains the active constitutional runtimes available to PBOS.
 *
 * =============================================================================
 */

import { KernelRuntime } from "./kernel-runtime";

export class RuntimeRegistry {
  private readonly runtimes = new Map<
    string,
    KernelRuntime
  >();

  public register(
    id: string,
    runtime: KernelRuntime,
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
  ): KernelRuntime {
    const runtime = this.runtimes.get(id);

    if (!runtime) {
      throw new Error(
        `Runtime '${id}' is not registered.`,
      );
    }

    return runtime;
  }

  public has(id: string): boolean {
    return this.runtimes.has(id);
  }

  public list(): readonly KernelRuntime[] {
    return [...this.runtimes.values()];
  }

  public clear(): void {
    this.runtimes.clear();
  }
}
