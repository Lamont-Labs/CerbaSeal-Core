import { describe, it, expect } from "vitest";
import { createOperatorActionReport } from "../../src/services/support/operator-action-service.js";
import { runSystemHealthCheck } from "../../src/services/support/system-health-service.js";
import { runSystemIntegrityVerification } from "../../src/services/support/system-integrity-service.js";
import {
  buildSupportRejectScenario,
  buildSupportHoldScenario,
  buildSupportAllowScenario
} from "../../src/services/support/support-fixtures.js";
import { ExecutionGateService } from "../../src/services/execution/execution-gate-service.js";
import { buildValidGovernedRequest } from "../../src/domain/builders/request-fixtures.js";

describe("Operator Action Service", () => {
  it("ALLOW produces INFO severity and no-action recommendation", () => {
    const { gateResult } = buildSupportAllowScenario();
    const report = createOperatorActionReport(gateResult);
    expect(report.finalState).toBe("ALLOW");
    expect(report.severity).toBe("INFO");
    expect(report.recommendedAction).toMatch(/no operator action required/i);
    expect(report.operatorChecklist.length).toBeGreaterThan(0);
  });

  it("AI_CANNOT_AUTHORIZE REJECT produces CRITICAL severity and do-not-execute recommendation", () => {
    const { gateResult } = buildSupportRejectScenario();
    expect(gateResult.decisionEnvelope.finalState).toBe("REJECT");
    const report = createOperatorActionReport(gateResult);
    expect(report.severity).toBe("CRITICAL");
    expect(report.recommendedAction).toMatch(/do not execute/i);
    expect(report.operatorChecklist.length).toBeGreaterThan(0);
  });

  it("REQUIRED_APPROVAL_MISSING HOLD produces WARNING severity and pause recommendation", () => {
    const { gateResult } = buildSupportHoldScenario();
    expect(gateResult.decisionEnvelope.finalState).toBe("HOLD");
    const report = createOperatorActionReport(gateResult);
    expect(report.severity).toBe("WARNING");
    expect(report.recommendedAction).toMatch(/pause execution/i);
    expect(report.operatorChecklist.length).toBeGreaterThan(0);
  });

  it("MALFORMED_REQUEST rejection produces correction recommendation", () => {
    const gate = new ExecutionGateService();
    const base = buildValidGovernedRequest();
    const result = gate.evaluate({ ...base, requestId: "" } as any);
    const report = createOperatorActionReport(result);
    expect(report.finalState).toBe("REJECT");
    expect(report.recommendedAction).toMatch(/correct request structure/i);
  });

  it("NO_POLICY_PACK rejection produces policy recommendation", () => {
    const gate = new ExecutionGateService();
    const base = buildValidGovernedRequest();
    const result = gate.evaluate({ ...base, policyPackRef: null });
    const report = createOperatorActionReport(result);
    expect(report.finalState).toBe("REJECT");
    expect(report.recommendedAction).toMatch(/policyPackRef/i);
    expect(report.severity).toBe("WARNING");
  });

  it("NO_PROVENANCE rejection produces provenance recommendation", () => {
    const gate = new ExecutionGateService();
    const base = buildValidGovernedRequest();
    const result = gate.evaluate({ ...base, provenanceRef: null });
    const report = createOperatorActionReport(result);
    expect(report.finalState).toBe("REJECT");
    expect(report.recommendedAction).toMatch(/provenance/i);
  });

  it("PROHIBITED_USE rejection produces CRITICAL escalation recommendation", () => {
    const gate = new ExecutionGateService();
    const base = buildValidGovernedRequest();
    const result = gate.evaluate({ ...base, prohibitedUse: true });
    const report = createOperatorActionReport(result);
    expect(report.severity).toBe("CRITICAL");
    expect(report.recommendedAction).toMatch(/escalate/i);
  });

  it("TRUST_STATE_INVALID produces CRITICAL severity", () => {
    const gate = new ExecutionGateService();
    const base = buildValidGovernedRequest();
    const result = gate.evaluate({
      ...base,
      trustState: { trusted: false, trustStateId: "ts_invalid" }
    });
    const report = createOperatorActionReport(result);
    expect(report.severity).toBe("CRITICAL");
    expect(report.recommendedAction).toMatch(/trust state/i);
  });

  it("report always includes primaryReasonCode on non-ALLOW outcomes", () => {
    const { gateResult } = buildSupportRejectScenario();
    const report = createOperatorActionReport(gateResult);
    expect(report.primaryReasonCode).not.toBeNull();
  });

  it("ALLOW report has null primaryReasonCode", () => {
    const { gateResult } = buildSupportAllowScenario();
    const report = createOperatorActionReport(gateResult);
    expect(report.primaryReasonCode).toBeNull();
  });
});

describe("System Health Check", () => {
  it("runSystemHealthCheck returns PASS", () => {
    const result = runSystemHealthCheck();
    expect(result.status).toBe("PASS");
  });

  it("includes a check for the REJECT scenario", () => {
    const result = runSystemHealthCheck();
    expect(result.checks.some((c) => c.name.includes("reject"))).toBe(true);
  });

  it("includes a check for the HOLD scenario", () => {
    const result = runSystemHealthCheck();
    expect(result.checks.some((c) => c.name.includes("hold"))).toBe(true);
  });

  it("includes a check for the ALLOW scenario", () => {
    const result = runSystemHealthCheck();
    expect(result.checks.some((c) => c.name.includes("allow"))).toBe(true);
  });

  it("all individual checks pass", () => {
    const result = runSystemHealthCheck();
    const failed = result.checks.filter((c) => c.status === "FAIL");
    expect(failed).toHaveLength(0);
  });

  it("checkedAt is a valid ISO timestamp", () => {
    const result = runSystemHealthCheck();
    expect(() => new Date(result.checkedAt)).not.toThrow();
    expect(new Date(result.checkedAt).toISOString()).toBe(result.checkedAt);
  });
});

describe("System Integrity Verification", () => {
  it("runSystemIntegrityVerification returns PASS", () => {
    const result = runSystemIntegrityVerification();
    expect(result.status).toBe("PASS");
  });

  it("summary.totalChecks is greater than 0", () => {
    const result = runSystemIntegrityVerification();
    expect(result.summary.totalChecks).toBeGreaterThan(0);
  });

  it("summary.failed is 0", () => {
    const result = runSystemIntegrityVerification();
    expect(result.summary.failed).toBe(0);
  });

  it("summary.passed equals totalChecks", () => {
    const result = runSystemIntegrityVerification();
    expect(result.summary.passed).toBe(result.summary.totalChecks);
  });

  it("repeatability checks are included and pass", () => {
    const result = runSystemIntegrityVerification();
    const repeatChecks = result.checks.filter((c) =>
      c.name.includes("repeatability")
    );
    expect(repeatChecks.length).toBeGreaterThan(0);
    repeatChecks.forEach((c) => {
      expect(c.status).toBe("PASS");
    });
  });

  it("interleaving check is included and passes", () => {
    const result = runSystemIntegrityVerification();
    const interleave = result.checks.find((c) => c.name.includes("interleaving"));
    expect(interleave).toBeDefined();
    expect(interleave!.status).toBe("PASS");
  });

  it("checkedAt is a valid ISO timestamp", () => {
    const result = runSystemIntegrityVerification();
    expect(() => new Date(result.checkedAt)).not.toThrow();
    expect(new Date(result.checkedAt).toISOString()).toBe(result.checkedAt);
  });
});
