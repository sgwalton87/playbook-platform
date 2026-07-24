import commands from "./commands.json";

export interface PbosCommandDefinition {
  name: string;
  description: string;
  mode: "planning" | "execution" | "audit" | "doctor" | "release" | "ship";
  status: "active" | "reserved";
}

export class CommandRegistry {
  private readonly commands = commands as PbosCommandDefinition[];

  all(): PbosCommandDefinition[] {
    return [...this.commands];
  }

  active(): PbosCommandDefinition[] {
    return this.commands.filter((command) => command.status === "active");
  }

  count(): number {
    return this.commands.length;
  }
}
