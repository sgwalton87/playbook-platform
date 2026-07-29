/**
 * =============================================================================
 * PBOS Kernel Command Executor
 * =============================================================================
 *
 * Authority:
 *   - PPS-4001 Kernel Architecture
 *
 * Purpose:
 *   Executes registered Kernel commands through the constitutional runtime.
 *
 * =============================================================================
 */

import { ExecutionContext } from "./execution-context";
import { CommandRegistry } from "./command-registry";

export class CommandExecutor {
  public constructor(
    private readonly registry: CommandRegistry,
  ) {}

  public async execute(
    commandName: string,
    context: ExecutionContext,
  ): Promise<void> {
    const command =
      this.registry.resolve(commandName);

    await command.execute(context);
  }
}
