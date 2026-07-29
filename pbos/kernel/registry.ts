/**
 * =============================================================================
 * PBOS Kernel Registry
 * =============================================================================
 *
 * Authority:
 *   - PPS-4008 Kernel Extension Model
 *   - PPS-4002 Kernel Services
 *
 * Purpose:
 *   Provides the constitutional registry for Kernel capabilities, services,
 *   extensions, and runtime components.
 *
 * The Registry is the authoritative source of Kernel-discoverable components.
 *
 * =============================================================================
 */

export interface KernelComponent {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
}

export interface KernelExtension extends KernelComponent {
  initialize(): Promise<void>;
}

export class KernelRegistry {
  private readonly components = new Map<
    string,
    KernelComponent
  >();

  /**
   * Register a constitutional Kernel component.
   */
  public register(component: KernelComponent): void {
    if (this.components.has(component.id)) {
      throw new Error(
        `Kernel component '${component.id}' is already registered.`,
      );
    }

    this.components.set(component.id, component);
  }

  /**
   * Retrieve a registered component.
   */
  public resolve<T extends KernelComponent>(
    id: string,
  ): T {
    const component = this.components.get(id);

    if (!component) {
      throw new Error(
        `Kernel component '${id}' is not registered.`,
      );
    }

    return component as T;
  }

  /**
   * Determine whether a component exists.
   */
  public has(id: string): boolean {
    return this.components.has(id);
  }

  /**
   * Return all registered components.
   */
  public list(): readonly KernelComponent[] {
    return [...this.components.values()];
  }

  /**
   * Remove every registered component.
   */
  public clear(): void {
    this.components.clear();
  }

  /**
   * Initialize all registered Kernel extensions.
   */
  public async initializeExtensions(): Promise<void> {
    for (const component of this.components.values()) {
      if ("initialize" in component) {
        await (component as KernelExtension).initialize();
      }
    }
  }
}
