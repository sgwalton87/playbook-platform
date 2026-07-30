import type {
  EngineAdmissionDecision,
  EngineAdmissionRequest,
} from "../admission";
import { KernelEngineAdmissionAuthority } from "../admission";
import type {
  CapabilityAdmissionInvocation,
  CapabilityAdmissionResult,
} from "./types";
import { KernelCapabilityAdmissionGate } from "./gate";

export interface CapabilityEngineAdmissionHandoffResult {
  readonly capability_admission: CapabilityAdmissionResult;
  readonly engine_admission: EngineAdmissionDecision | null;
  readonly execution_eligible: boolean;
}

export class KernelCapabilityEngineAdmissionHandoff {
  constructor(
    private readonly capabilityGate: KernelCapabilityAdmissionGate,
    private readonly engineAuthority: KernelEngineAdmissionAuthority
  ) {}

  admit(
    invocation: CapabilityAdmissionInvocation,
    engineRequest: EngineAdmissionRequest
  ): CapabilityEngineAdmissionHandoffResult {
    const capabilityAdmission = this.capabilityGate.admit(invocation);
    if (capabilityAdmission.decision.decision !== "ADMITTED") {
      return {
        capability_admission: capabilityAdmission,
        engine_admission: null,
        execution_eligible: false,
      };
    }
    if (engineRequest.manifest.engine_id !== invocation.request.engine_id) {
      throw new Error(
        "Capability-to-engine admission handoff identity does not match."
      );
    }
    const engineAdmission = this.engineAuthority.admit(engineRequest);
    return {
      capability_admission: capabilityAdmission,
      engine_admission: engineAdmission,
      execution_eligible: engineAdmission.status === "ADMITTED",
    };
  }
}
