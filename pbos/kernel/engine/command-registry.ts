/**
 * =============================================================================
 * PBOS Kernel Command Registry
 * =============================================================================
 *
 * Authority:
 *   - PPS-4002 Kernel Services
 *
 * Purpose:
 *   Maintains the authoritative registry of constitutional Kernel commands.
 *
 * =============================================================================
 */

import { KernelCommand } from "./command";

export class CommandRegistry {
  private readonly commands = new Map<string, KernelCommand>();

  public register(command: KernelCommand): void {
    if (this.commands.has(command.name)) {
      throw new Error(
        `Command '${command.name}' is already registered.`,
      );
    }

    this.commands.set(command.name, command);
  }

  public resolve(name: string): KernelCommand {
    const command = this.commands.get(name);

    if (!command) {
      throw new Error(
        `Unknown command '${name}'.`,
      );
    }

    return command;
  }

  public list(): readonly KernelCommand[] {
    return [...this.commands.values()];
  }
}
