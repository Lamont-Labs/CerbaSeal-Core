import { ExecutionGateService } from "../../services/execution/execution-gate-service.js";
import { buildValidGovernedRequest } from "./request-fixtures.js";
import type { GovernedRequest, GateResult } from "../types/core.js";

export function getRejectScenario(): GateResult {
  const gate = new ExecutionGateService();
  const base = buildValidGovernedRequest();
  const request: GovernedRequest = {
    ...base,
    actorAuthorityClass: "ai",
    proposal: {
      ...base.proposal,
      proposalSourceKind: "ai",
    },
    approvalRequired: false,
    approvalArtifact: null,
  };
  return gate.evaluate(request);
}

export function getHoldScenario(): GateResult {
  const gate = new ExecutionGateService();
  const base = buildValidGovernedRequest();
  const request: GovernedRequest = {
    ...base,
    actorAuthorityClass: "analyst",
    approvalRequired: true,
    approvalArtifact: null,
  };
  return gate.evaluate(request);
}

export function getAllowScenario(): GateResult {
  const gate = new ExecutionGateService();
  return gate.evaluate(buildValidGovernedRequest());
}
