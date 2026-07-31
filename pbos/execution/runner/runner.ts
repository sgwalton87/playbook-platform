import { artifactDigest } from "../../kernel/identity";
import { ExecutionLifecycleAdapter } from "../adapters";
import { buildExecutionEvidence, evaluateExecutionValidations } from "../evidence";
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
    const validationEvidence = evaluateExecutionValidations({
      rootDir: request.rootDir,
      task: request.assignment.task,
      package: request.package,
      authority: request.authority,
      authorization: request.authorization,
      artifacts: result.artifacts,
      provider_validation_results: result.validation_results,
    });
    const evidence = buildExecutionEvidence({
      result,
      package_id: request.package.package_id,
      milestone_id: request.package.milestone_id,
      package_digest: request.package.digest,
      context_digest: request.context.digest,
      approval_id: request.approval.approval_id,
      authorization_id: request.authorization.authorization_id,
      authority_digest: request.authority.digest,
      provider_id: provider.contract.provider_id,
      provider_contract_id: provider.contract.provider_contract_id,
      assigned_agent_id: request.assignment.task.assigned_agent,
      required_validations: request.assignment.task.validation_requirements,
      required_evidence: request.assignment.task.evidence_requirements,
      validation_evidence: validationEvidence,
    });
    const body = {
      provider_id: providerId,
      evidence,
      advancement_eligible: evidence.completion.advancement_eligible,
    };
    return { ...body, digest: artifactDigest(body) };
  }
}
