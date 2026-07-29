/**
 * =============================================================================
 * PBOS Kernel Validation
 * =============================================================================
 *
 * Authority:
 *   - PPS-4009 Kernel Security
 *   - PPS-4013 Kernel Certification
 *
 * Purpose:
 *   Performs constitutional validation before execution.
 *
 * The Kernel fails closed.
 *
 * =============================================================================
 */

export interface ValidationRule {
  readonly id: string;
  readonly description: string;

  validate(): Promise<void>;
}

export interface ValidationReport {
  readonly executedAt: Date;
  readonly rulesEvaluated: number;
  readonly passed: boolean;
}

export class KernelValidator {
  public constructor(
    private readonly rules: readonly ValidationRule[],
  ) {}

  public async validate(): Promise<ValidationReport> {
    for (const rule of this.rules) {
      await rule.validate();
    }

    return {
      executedAt: new Date(),
      rulesEvaluated: this.rules.length,
      passed: true,
    };
  }
}
