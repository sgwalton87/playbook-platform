import fs from "node:fs";
import type {
  GateStatus,
  TransitionRequest,
  GateTransition,
} from "./contracts";

function allowedTransition(
  from: GateStatus,
  to: GateStatus
): boolean {

  const transitions: Record<GateStatus, GateStatus[]> = {
    proposed: ["in_progress"],
    in_progress: ["complete", "blocked"],
    blocked: ["in_progress"],
    complete: [],
  };

  return transitions[from].includes(to);
}


export function transitionGate(
  request: TransitionRequest
): GateTransition {

  const raw = fs.readFileSync(
    request.gatePath,
    "utf8"
  );

  const gate = JSON.parse(raw);

  const current = gate.status as GateStatus;


  if (!allowedTransition(current, request.nextStatus)) {
    throw new Error(
      `Invalid gate transition ${current} -> ${request.nextStatus}`
    );
  }


  if (request.nextStatus === "complete" &&
      request.evidence.length === 0) {
    throw new Error(
      "Completion requires evidence."
    );
  }


  gate.status = request.nextStatus;
  if ("completion_state" in gate) {
    gate.completion_state =
      request.nextStatus === "complete" ? "satisfied" : "pending";
  }

  fs.writeFileSync(
    request.gatePath,
    JSON.stringify(
      gate,
      null,
      2
    ) + "\n"
  );


  return {
    gateId: request.gateId,
    from: current,
    to: request.nextStatus,
    reason: request.reason,
    evidence: request.evidence,
    timestamp: new Date().toISOString(),
  };
}
