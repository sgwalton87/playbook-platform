/**
 * =============================================================================
 * PBOS Kernel Command Bus
 * =============================================================================
 *
 * Authority:
 *   - PPS-4002 Kernel Services
 *   - PPS-4006 Kernel Scheduling
 *
 * Purpose:
 *   Routes constitutional commands through the PBOS Kernel.
 *
 * =============================================================================
 */

import { ExecutionContext } from "./execution-context";
import { KernelCommand } from "./command";

export class CommandBus {
  private readonly commands = new Map<
    string,
    KernelCommand
  >();

  public register(
    command: KernelCommand,
  ): void {
    if (this.commands.has(command.name)) {
      throw new Error(
        `Command '${command.name}' is already registered.`,
      );
    }

    this.commands.set(
      command.name,
      command,
    );
  }

  public async dispatch(
    name: string,
    context: ExecutionContext,
  ): Promise<void> {
    const command = this.commands.get(name);

    if (!command) {
      throw new Error(
        `Unknown command '${name}'.`,
      );
    }

    await command.execute(context);
  }

  public list(): readonly string[] {
    return [...this.commands.keys()];
  }
}
