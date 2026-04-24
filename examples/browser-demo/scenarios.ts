import { ExecutionGateService } from "../../src/services/execution/execution-gate-service.js";
import { buildValidGovernedRequest } from "../../src/domain/builders/request-fixtures.js";
import type { GateResult } from "../../src/domain/types/core.js";

const gate = new ExecutionGateService();

export function getRejectScenario(): GateResult {
  const base = buildValidGovernedRequest();
  const request = {
    ...base,
    actorAuthorityClass: "ai" as const,
    proposal: {
      ...base.proposal,
      proposalSourceKind: "ai" as const
    },
    approvalRequired: false,
    approvalArtifact: null
  };
  return gate.evaluate(request as any);
}

export function getHoldScenario(): GateResult {
  const request = {
    ...buildValidGovernedRequest(),
    actorAuthorityClass: "analyst" as const,
    approvalRequired: true,
    approvalArtifact: null
  };
  return gate.evaluate(request as any);
}

export function getAllowScenario(): GateResult {
  return gate.evaluate(buildValidGovernedRequest());
}
