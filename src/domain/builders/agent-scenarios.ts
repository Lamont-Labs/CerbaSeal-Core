import { ExecutionGateService } from "../../services/execution/execution-gate-service.js";
import { buildValidGovernedRequest } from "./request-fixtures.js";
import { executeIfAuthorized } from "../../services/execution/tools.js";
import type { GateResult } from "../types/core.js";
import type { ToolCallResult, ToolName } from "../../services/execution/tools.js";

export interface AgentScenarioResult {
  toolName: ToolName;
  gateResult: GateResult;
  toolResult: ToolCallResult;
}

export function runAgentRejectScenario(): AgentScenarioResult {
  const gate = new ExecutionGateService();
  const toolName: ToolName = "escalate_case";
  const base = buildValidGovernedRequest();
  const request = {
    ...base,
    requestId: "agent-reject-001",
    actorId: "ai-agent-001",
    actorAuthorityClass: "ai" as const,
    proposedActionClass: "escalate" as const,
    proposal: {
      ...base.proposal,
      proposalSourceKind: "ai" as const,
      requestedActionClass: "escalate" as const,
    },
    approvalRequired: false,
    approvalArtifact: null,
  };
  const gateResult = gate.evaluate(request as any);
  const toolResult = executeIfAuthorized(toolName, gateResult);
  return { toolName, gateResult, toolResult };
}

export function runAgentHoldScenario(): AgentScenarioResult {
  const gate = new ExecutionGateService();
  const toolName: ToolName = "apply_hold";
  const base = buildValidGovernedRequest();
  const request = {
    ...base,
    requestId: "agent-hold-001",
    actorId: "analyst-001",
    actorAuthorityClass: "analyst" as const,
    proposedActionClass: "account_hold" as const,
    proposal: {
      ...base.proposal,
      proposalSourceKind: "deterministic_rule" as const,
      requestedActionClass: "account_hold" as const,
    },
    approvalRequired: true,
    approvalArtifact: null,
  };
  const gateResult = gate.evaluate(request as any);
  const toolResult = executeIfAuthorized(toolName, gateResult);
  return { toolName, gateResult, toolResult };
}

export function runAgentAllowScenario(): AgentScenarioResult {
  const gate = new ExecutionGateService();
  const toolName: ToolName = "apply_hold";
  const base = buildValidGovernedRequest();
  const requestId = "agent-allow-001";
  const request = {
    ...base,
    requestId,
    actorId: "analyst-001",
    actorAuthorityClass: "analyst" as const,
    proposedActionClass: "account_hold" as const,
    proposal: {
      ...base.proposal,
      proposalSourceKind: "deterministic_rule" as const,
      requestedActionClass: "account_hold" as const,
    },
    approvalRequired: true,
    approvalArtifact: {
      ...base.approvalArtifact!,
      forRequestId: requestId,
      approvalId: "approval-agent-001",
    },
  };
  const gateResult = gate.evaluate(request as any);
  const toolResult = executeIfAuthorized(toolName, gateResult);
  return { toolName, gateResult, toolResult };
}
