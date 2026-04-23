import { describe, it, expect } from "vitest";
import { ExecutionGateService } from "../../src/services/execution/execution-gate-service.js";
import { EvidenceBundleService } from "../../src/services/evidence/evidence-bundle-service.js";
import { AppendOnlyLogService } from "../../src/services/audit/append-only-log-service.js";
import { buildValidGovernedRequest } from "../../src/domain/builders/request-fixtures.js";

describe("Fail-Closed Guarantee", () => {

  it("unexpected runtime exception inside evaluate() produces a controlled REJECT, not an unhandled throw", () => {
    const gate = new ExecutionGateService();
    const request = buildValidGovernedRequest();

    // Inject a property that throws a TypeError when accessed.
    // This simulates an unexpected runtime error inside the gate's evaluation loop.
    Object.defineProperty(request, "policyPackRef", {
      get() {
        throw new TypeError("Simulated unexpected runtime error");
      },
      configurable: true
    });

    // The gate must not throw. It must return a structured REJECT result.
    let result: ReturnType<typeof gate.evaluate> | undefined;
    expect(() => {
      result = gate.evaluate(request);
    }).not.toThrow();

    expect(result).toBeDefined();
    expect(result!.decisionEnvelope.finalState).toBe("REJECT");
    expect(result!.decisionEnvelope.trace.reasonCodes).toContain("MALFORMED_REQUEST");
    expect(result!.releaseAuthorization).toBeNull();
    expect(result!.blockedActionRecord).not.toBeNull();
    expect(result!.blockedActionRecord!.finalState).toBe("REJECT");
  });

  it("fail-closed REJECT result is accepted by EvidenceBundleService (registered in gate-issued set)", () => {
    const gate = new ExecutionGateService();
    const log = new AppendOnlyLogService();
    const evidenceService = new EvidenceBundleService(log);

    // Use a fresh request for the evidence bundle (the original request object
    // with the broken property can't be safely re-used for bundle construction,
    // but the gate-issued result is what matters for the WeakSet check).
    const request = buildValidGovernedRequest();
    const brokenRequest = buildValidGovernedRequest();

    Object.defineProperty(brokenRequest, "policyPackRef", {
      get() {
        throw new TypeError("Simulated unexpected runtime error");
      },
      configurable: true
    });

    const result = gate.evaluate(brokenRequest);

    // The fallback REJECT result is registered in the gate-issued WeakSet.
    // EvidenceBundleService must accept it without throwing.
    expect(() => {
      evidenceService.createBundle({ request, gateResult: result });
    }).not.toThrow();
  });

});
