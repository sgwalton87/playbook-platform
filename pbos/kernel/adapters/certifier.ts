/**
 * =============================================================================
 * PBOS Kernel Certification Adapter
 * =============================================================================
 *
 * Authority:
 *   - PPS-4013 Kernel Certification
 *
 * Purpose:
 *   Adapts existing PBOS certification engines to the constitutional Kernel.
 *
 * =============================================================================
 */

export interface Certifier {
  certify(): Promise<void>;
}

export class KernelCertificationAdapter {
  public constructor(
    private readonly certifier: Certifier,
  ) {}

  public async execute(): Promise<void> {
    await this.certifier.certify();
  }
}
