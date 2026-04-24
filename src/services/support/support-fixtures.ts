import { ExecutionGateService } from "../execution/execution-gate-service.js";
import { buildValidGovernedRequest } from "../../domain/builders/request-fixtures.js";
import type { GateResult, GovernedRequest } from "../../domain/types/core.js";

export interface ScenarioResult {
  request: GovernedRequest;
  gateResult: GateResult;
}

export function buildSupportRejectScenario(): ScenarioResult {
  const gate = new ExecutionGateService();
  const base = buildValidGovernedRequest();
  const request: GovernedRequest = {
    ...base,
    actorAuthorityClass: "ai" as const,
    proposal: {
      ...base.proposal,
      proposalSourceKind: "ai" as const
    },
    approvalRequired: false,
    approvalArtifact: null
  };
  return { request, gateResult: gate.evaluate(request as any) };
}

export function buildSupportHoldScenario(): ScenarioResult {
  const gate = new ExecutionGateService();
  const base = buildValidGovernedRequest();
  const request: GovernedRequest = {
    ...base,
    actorAuthorityClass: "analyst" as const,
    approvalRequired: true,
    approvalArtifact: null
  };
  return { request, gateResult: gate.evaluate(request as any) };
}

export function buildSupportAllowScenario(): ScenarioResult {
  const gate = new ExecutionGateService();
  const request = buildValidGovernedRequest();
  return { request, gateResult: gate.evaluate(request) };
}
