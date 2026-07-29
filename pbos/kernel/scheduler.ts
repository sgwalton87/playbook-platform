/**
 * =============================================================================
 * PBOS Kernel Scheduler
 * =============================================================================
 *
 * Authority:
 *   - PPS-4006 Kernel Scheduling
 *
 * Purpose:
 *   Coordinates constitutional execution scheduling for the PBOS Kernel.
 *
 * The Scheduler determines execution order but never performs work itself.
 *
 * =============================================================================
 */

export interface ScheduledTask {
  readonly id: string;
  readonly priority: number;
  readonly description: string;

  execute(): Promise<void>;
}

export interface Scheduler {
  register(task: ScheduledTask): void;

  schedule(): Promise<void>;
}

export class DefaultScheduler implements Scheduler {
  private readonly tasks: ScheduledTask[] = [];

  public register(task: ScheduledTask): void {
    this.tasks.push(task);

    this.tasks.sort((a, b) => b.priority - a.priority);
  }

  public async schedule(): Promise<void> {
    for (const task of this.tasks) {
      await task.execute();
    }
  }
}
