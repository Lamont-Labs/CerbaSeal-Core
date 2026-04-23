import { describe, test, expect } from "vitest";
import { ExecutionGateService } from "../../src/services/execution/execution-gate-service.js";
import { buildValidGovernedRequest } from "../../src/domain/builders/request-fixtures.js";

describe("Full System Flow", () => {
  test("Produces complete enforcement cycle", () => {
    const gate = new ExecutionGateService();
    const request = buildValidGovernedRequest();

    const result = gate.evaluate(request);

    expect(result.decisionEnvelope).toBeDefined();
    expect(result.decisionEnvelope.finalState).toBeDefined();

    if (result.decisionEnvelope.finalState === "ALLOW") {
      expect(result.releaseAuthorization).toBeDefined();
    } else {
      expect(result.blockedActionRecord).toBeDefined();
    }
  });
});
