/**
 * Shared PBOS Kernel Types
 */

/**
 * Standard engine execution result.
 */
export interface EngineResult<T = unknown> {
  success: boolean;
  engine: string;
  runtimeArtifact?: string;
  data?: T;
  message?: string;
  durationMs?: number;
}

/**
 * Common runtime artifact metadata.
 */
export interface RuntimeArtifact {
  name: string;
  path: string;
  createdAt: string;
}

/**
 * Standard health check.
 */
export interface HealthCheck {
  name: string;
  passed: boolean;
  message: string;
}

/**
 * Engine registration contract.
 */
export interface EngineDefinition {
  id: string;
  name: string;
  version: string;
  order: number;
  enabled: boolean;
  dependsOn: string[];
  produces: string[];
  run: () => Promise<void> | void;
}
