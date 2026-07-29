/**
 * =============================================================================
 * PBOS Kernel Validator Adapter
 * =============================================================================
 *
 * Authority:
 *   - PPS-4009 Kernel Security
 *   - PPS-4013 Kernel Certification
 *
 * Purpose:
 *   Adapts existing PBOS validation engines to the constitutional Kernel.
 *
 * =============================================================================
 */

export interface Validator {
  validate(): Promise<void>;
}

export class KernelValidatorAdapter {
  public constructor(
    private readonly validator: Validator,
  ) {}

  public async execute(): Promise<void> {
    await this.validator.validate();
  }
}
