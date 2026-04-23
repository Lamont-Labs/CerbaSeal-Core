import { ExecutionGateService } from "../src/services/execution/execution-gate-service.js";
import { buildValidGovernedRequest } from "../src/domain/builders/request-fixtures.js";

const gate = new ExecutionGateService();

function runScenario(name: string, request: any) {
  const result = gate.evaluate(request);

  console.log(`\n=== ${name} ===`);
  console.log("Decision:", result.decisionEnvelope.finalState);
  console.log("Reasons:", result.decisionEnvelope.trace.reasonCodes);
}

function main() {
  // 1. REJECT — AI self-authorization
  const rejectRequest = {
    ...buildValidGovernedRequest(),
    actorAuthorityClass: "ai",
    proposal: {
      ...buildValidGovernedRequest().proposal,
      proposalSourceKind: "ai"
    },
    approvalRequired: false,
    approvalArtifact: null
  };

  // 2. HOLD — missing approval
  const holdRequest = {
    ...buildValidGovernedRequest(),
    actorAuthorityClass: "analyst",
    approvalRequired: true,
    approvalArtifact: null
  };

  // 3. ALLOW — valid approval
  const allowRequest = buildValidGovernedRequest();

  runScenario("REJECT (AI self-authorization)", rejectRequest);
  runScenario("HOLD (missing approval)", holdRequest);
  runScenario("ALLOW (valid execution)", allowRequest);
}

main();
