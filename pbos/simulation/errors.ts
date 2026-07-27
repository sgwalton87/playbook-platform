import type { SimulationFailure, SimulationFailureCode } from "./contracts";
export class SimulationError extends Error { constructor(public readonly failures: SimulationFailure[]) { super(failures.map(({ code, message }) => `${code}: ${message}`).join("; ")); this.name = "SimulationError"; } }
export const simulationFailure = (code: SimulationFailureCode, message: string): SimulationFailure => ({ code, message });
