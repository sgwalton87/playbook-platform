/**
 * =============================================================================
 * PBOS Kernel Event System
 * =============================================================================
 *
 * Authority:
 *   - PPS-4007 Kernel Event System
 *
 * Purpose:
 *   Provides immutable constitutional event publication for PBOS.
 *
 * Events are historical facts and must never be mutated after publication.
 *
 * =============================================================================
 */

export interface KernelEvent {
  readonly id: string;
  readonly type: string;
  readonly timestamp: Date;
  readonly payload: Readonly<Record<string, unknown>>;
}

export interface EventSubscriber {
  handle(event: KernelEvent): Promise<void>;
}

export class KernelEventBus {
  private readonly subscribers = new Map<
    string,
    EventSubscriber[]
  >();

  public subscribe(
    eventType: string,
    subscriber: EventSubscriber,
  ): void {
    const existing = this.subscribers.get(eventType) ?? [];

    existing.push(subscriber);

    this.subscribers.set(eventType, existing);
  }

  public async publish(
    event: KernelEvent,
  ): Promise<void> {
    const subscribers =
      this.subscribers.get(event.type) ?? [];

    for (const subscriber of subscribers) {
      await subscriber.handle(event);
    }
  }
}
