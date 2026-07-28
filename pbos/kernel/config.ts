/**
 * PBOS Kernel Configuration
 *
 * Centralized configuration shared by all PBOS engines.
 */

export const PBOSConfig = {
  name: "PBOS",
  version: "0.4.0",
  engineVersion: "3.0.0",

  runtime: {
    directory: "pbos/runtime",
  },

  repository: {
    productionBranch: "main",
    remote: "origin",
    url: "https://github.com/sgwalton87/playbook-platform.git",
  },

  logging: {
    enabled: true,
    verbose: false,
  },

  validation: {
    strict: true,
  },
} as const;

export type PBOSConfigType = typeof PBOSConfig;
