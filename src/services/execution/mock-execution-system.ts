import type { GateResult } from "../../domain/types/core.js";

export interface ExecutionResult {
  executed: boolean;
  reason?: string;
  actionClass?: string;
  releaseAuthorizationId?: string;
}

export function attemptExecution(
  _actionLabel: string,
  gateResult: GateResult
): ExecutionResult {
  const state = gateResult.decisionEnvelope.finalState;
  const release = gateResult.releaseAuthorization;

  if (state === "ALLOW" && release !== null) {
    return {
      executed: true,
      actionClass: release.actionClass,
      releaseAuthorizationId: release.releaseAuthorizationId,
    };
  }

  return {
    executed: false,
    reason: state,
  };
}
