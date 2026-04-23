import { describe, test, expect } from "vitest";
import { ExecutionGateService } from "../../src/services/execution/execution-gate-service.js";
import { buildValidGovernedRequest } from "../../src/domain/builders/request-fixtures.js";

describe("System Integration Flow", () => {
  test("Full flow produces valid GateResult", () => {
    const gate = new ExecutionGateService();
    const request = buildValidGovernedRequest();
    const result = gate.evaluate(request);

    expect(result.decisionEnvelope).toBeDefined();
    expect(result.decisionEnvelope.finalState).toBeDefined();
  });
});
