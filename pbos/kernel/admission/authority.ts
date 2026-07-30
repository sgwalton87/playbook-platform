import { artifactDigest } from "../identity";
import type {
  EngineAdmissionDecision,
  EngineAdmissionRequest,
} from "./types";
import { validateEngineAdmissionRequest } from "./validator";
import type { CertifiedEngineManifestRegistry } from "./registry";

export class KernelEngineAdmissionAuthority {
  constructor(
    private readonly registry: CertifiedEngineManifestRegistry
  ) {}

  admit(request: EngineAdmissionRequest): EngineAdmissionDecision {
    const findings = [...validateEngineAdmissionRequest(request).errors];
    const registered = this.registry.get(request.manifest.engine_id);
    if (!registered) {
      findings.push("engine is not registered.");
    } else if (
      registered.manifest_digest !== request.manifest.manifest_digest
    ) {
      findings.push("registered engine manifest identity does not match.");
    }
    const body = {
      request_id: request.request_id,
      engine_id: request.manifest.engine_id,
      manifest_digest: request.manifest.manifest_digest,
      status: findings.length === 0 ? "ADMITTED" as const : "REJECTED" as const,
      findings,
    };
    return { ...body, decision_digest: artifactDigest(body) };
  }
}
