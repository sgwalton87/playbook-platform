import { artifactDigest } from "../../kernel/identity";
import { ExecutionLifecycleAdapter } from "../adapters";
import { buildExecutionEvidence } from "../evidence";
import { validateExecutionAuthorization } from "../authority";
import type { ExecutionFabricRequest, ExecutionFabricResult } from "./types";

export class ExecutionFabricRunner {
  async execute(request: ExecutionFabricRequest): Promise<ExecutionFabricResult> {
    const providerId = request.assignment.task.provider_id;
    const provider = request.providers.get(providerId);
    const authorizationFindings = provider
      ? validateExecutionAuthorization({
          authorization: request.authorization,
          context: request.context,
          package: request.package,
          provider: provider.contract,
          timestamp: request.requested_at,
        })
      : ["Execution provider is unavailable."];
    if (
      !request.admission.decision.admitted ||
      !provider ||
      authorizationFindings.length > 0 ||
      request.assignment.task.execution_authorization_id !==
        request.authorization.authorization_id ||
      request.assignment.task.provider_contract_id !==
        request.authorization.provider_contract_id ||
      request.assignment.task.assigned_agent !== request.authorization.agent_id ||
      provider.contract.executable_agent_id !== request.authority.agent_id ||
      !request.authority.required_capabilities.every((capability) =>
        provider.contract.capabilities.includes(capability)
      ) ||
      !request.authority.evidence_requirements.every((requirement) =>
        provider.contract.evidence_contract.includes(requirement)
      )
    ) {
      throw new Error("Execution fabric admission rejected.");
    }
    const result = await new ExecutionLifecycleAdapter(
      new Map([[providerId, provider.adapter]])
    ).execute(request.admission, request.assignment);
    const evidence = buildExecutionEvidence({
      result,
      package_digest: request.package.digest,
      context_digest: request.context.digest,
      approval_id: request.approval.approval_id,
      authorization_id: request.authorization.authorization_id,
      provider_id: provider.contract.provider_id,
      provider_contract_id: provider.contract.provider_contract_id,
      required_validations: request.assignment.task.validation_requirements,
      required_evidence: request.assignment.task.evidence_requirements,
    });
    const body = {
      provider_id: providerId,
      evidence,
      advancement_eligible: evidence.completion.advancement_eligible,
    };
    return { ...body, digest: artifactDigest(body) };
  }
}
