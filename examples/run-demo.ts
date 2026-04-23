import { ExecutionGateService } from "../src/services/execution/execution-gate-service.js";
import { buildValidGovernedRequest } from "../src/domain/builders/request-fixtures.js";

function run() {
  const gate = new ExecutionGateService();
  const request = buildValidGovernedRequest();

  const result = gate.evaluate(request);

  console.log("=== DECISION ===");
  console.log(result.decisionEnvelope.finalState);

  console.log("\n=== FULL RESULT ===");
  console.log(JSON.stringify(result, null, 2));
}

run();
