import { ExecutionGateService } from "../../services/execution/execution-gate-service.js";
import { buildValidGovernedRequest } from "./request-fixtures.js";
import type { GateResult } from "../types/core.js";

export function getRejectScenario(): GateResult {
  const gate = new ExecutionGateService();
  const base = buildValidGovernedRequest();
  const request = {
    ...base,
    actorAuthorityClass: "ai" as const,
    proposal: {
      ...base.proposal,
      proposalSourceKind: "ai" as const,
    },
    approvalRequired: false,
    approvalArtifact: null,
  };
  return gate.evaluate(request as unknown as Parameters<typeof gate.evaluate>[0]);
}

export function getHoldScenario(): GateResult {
  const gate = new ExecutionGateService();
  const request = {
    ...buildValidGovernedRequest(),
    actorAuthorityClass: "analyst" as const,
    approvalRequired: true,
    approvalArtifact: null,
  };
  return gate.evaluate(request as unknown as Parameters<typeof gate.evaluate>[0]);
}

export function getAllowScenario(): GateResult {
  const gate = new ExecutionGateService();
  return gate.evaluate(buildValidGovernedRequest());
}
