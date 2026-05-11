import type { GateResult } from "../../domain/types/core.js";

export const TOOLS = {
  escalate_case:     { actionClass: "escalate" as const,      label: "Escalate Case" },
  apply_hold:        { actionClass: "account_hold" as const,   label: "Apply Hold" },
  send_notification: { actionClass: "escalate" as const,      label: "Send Notification" },
} as const;

export type ToolName = keyof typeof TOOLS;

export interface ToolCallResult {
  toolName: ToolName;
  executed: boolean;
  releaseAuthorizationId?: string;
  blockedReason?: string;
}

export function executeIfAuthorized(toolName: ToolName, gateResult: GateResult): ToolCallResult {
  const state = gateResult.decisionEnvelope.finalState;
  const release = gateResult.releaseAuthorization;

  if (state === "ALLOW" && release !== null) {
    return {
      toolName,
      executed: true,
      releaseAuthorizationId: release.releaseAuthorizationId,
    };
  }

  return {
    toolName,
    executed: false,
    blockedReason: state,
  };
}
