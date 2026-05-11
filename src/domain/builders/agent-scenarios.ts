import { ExecutionGateService } from "../../services/execution/execution-gate-service.js";
import { buildValidGovernedRequest } from "./request-fixtures.js";
import { executeIfAuthorized } from "../../services/execution/tools.js";
import type { GovernedRequest, GateResult } from "../types/core.js";
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
  const request: GovernedRequest = {
    ...base,
    requestId: "agent-reject-001",
    actorId: "ai-agent-001",
    actorAuthorityClass: "ai",
    proposedActionClass: "escalate",
    proposal: {
      ...base.proposal,
      proposalSourceKind: "ai",
      requestedActionClass: "escalate",
    },
    approvalRequired: false,
    approvalArtifact: null,
  };
  const gateResult = gate.evaluate(request);
  const toolResult = executeIfAuthorized(toolName, gateResult);
  return { toolName, gateResult, toolResult };
}

export function runAgentHoldScenario(): AgentScenarioResult {
  const gate = new ExecutionGateService();
  const toolName: ToolName = "apply_hold";
  const base = buildValidGovernedRequest();
  const request: GovernedRequest = {
    ...base,
    requestId: "agent-hold-001",
    actorId: "analyst-001",
    actorAuthorityClass: "analyst",
    proposedActionClass: "account_hold",
    proposal: {
      ...base.proposal,
      proposalSourceKind: "deterministic_rule",
      requestedActionClass: "account_hold",
    },
    approvalRequired: true,
    approvalArtifact: null,
  };
  const gateResult = gate.evaluate(request);
  const toolResult = executeIfAuthorized(toolName, gateResult);
  return { toolName, gateResult, toolResult };
}

export function runAgentAllowScenario(): AgentScenarioResult {
  const gate = new ExecutionGateService();
  const toolName: ToolName = "apply_hold";
  const base = buildValidGovernedRequest();
  const requestId = "agent-allow-001";
  const request: GovernedRequest = {
    ...base,
    requestId,
    actorId: "analyst-001",
    actorAuthorityClass: "analyst",
    proposedActionClass: "account_hold",
    proposal: {
      ...base.proposal,
      proposalSourceKind: "deterministic_rule",
      requestedActionClass: "account_hold",
    },
    approvalRequired: true,
    approvalArtifact: {
      ...base.approvalArtifact!,
      forRequestId: requestId,
      approvalId: "approval-agent-001",
    },
  };
  const gateResult = gate.evaluate(request);
  const toolResult = executeIfAuthorized(toolName, gateResult);
  return { toolName, gateResult, toolResult };
}
