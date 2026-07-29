/**
 * =============================================================================
 * PBOS Service Registry
 * =============================================================================
 *
 * Authority:
 *   - PPS-4002 Kernel Services
 *   - PPS-4008 Kernel Extension Model
 *
 * Purpose:
 *   Provides dependency resolution for constitutional Kernel services.
 *
 * =============================================================================
 */

export class ServiceRegistry {
  private readonly services = new Map<string, unknown>();

  public register<T>(
    name: string,
    service: T,
  ): void {
    if (this.services.has(name)) {
      throw new Error(
        `Service '${name}' is already registered.`,
      );
    }

    this.services.set(name, service);
  }

  public resolve<T>(
    name: string,
  ): T {
    const service = this.services.get(name);

    if (!service) {
      throw new Error(
        `Service '${name}' is not registered.`,
      );
    }

    return service as T;
  }

  public has(name: string): boolean {
    return this.services.has(name);
  }

  public clear(): void {
    this.services.clear();
  }
}
