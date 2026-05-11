/**
 * Browser demo route handler tests.
 *
 * Tests scenario functions and the unified response shape built by
 * buildDemoResponse. No HTTP server started. No brittle lifecycle handling.
 *
 * All decisions originate from real ExecutionGateService evaluation.
 */

import { describe, test, expect } from "vitest";
import { getRejectScenario, getHoldScenario, getAllowScenario } from "../../src/domain/builders/gate-scenarios.js";
import { buildDemoResponse } from "../../src/domain/formatters/demo-response.js";

describe("Browser demo scenario handlers — single call", () => {
  test("REJECT scenario returns finalState REJECT", () => {
    const result = getRejectScenario();
    expect(result.decisionEnvelope.finalState).toBe("REJECT");
    expect(result.blockedActionRecord).not.toBeNull();
    expect(result.releaseAuthorization).toBeNull();
  });

  test("HOLD scenario returns finalState HOLD", () => {
    const result = getHoldScenario();
    expect(result.decisionEnvelope.finalState).toBe("HOLD");
    expect(result.blockedActionRecord).not.toBeNull();
    expect(result.releaseAuthorization).toBeNull();
  });

  test("ALLOW scenario returns finalState ALLOW", () => {
    const result = getAllowScenario();
    expect(result.decisionEnvelope.finalState).toBe("ALLOW");
    expect(result.releaseAuthorization).not.toBeNull();
    expect(result.blockedActionRecord).toBeNull();
  });
});

describe("Browser demo — unified response shape (REJECT)", () => {
  test("scenario.id is reject", () => {
    expect(buildDemoResponse("reject", getRejectScenario()).scenario.id).toBe("reject");
  });
  test("outcome.finalState is REJECT", () => {
    expect(buildDemoResponse("reject", getRejectScenario()).outcome.finalState).toBe("REJECT");
  });
  test("outcome.displayState is BLOCKED", () => {
    expect(buildDemoResponse("reject", getRejectScenario()).outcome.displayState).toBe("BLOCKED");
  });
  test("execution.executed is false", () => {
    expect(buildDemoResponse("reject", getRejectScenario()).execution.executed).toBe(false);
  });
  test("execution.label is NOT EXECUTED", () => {
    expect(buildDemoResponse("reject", getRejectScenario()).execution.label).toBe("NOT EXECUTED");
  });
  test("proof.blockedActionRecordExists is true", () => {
    expect(buildDemoResponse("reject", getRejectScenario()).proof.blockedActionRecordExists).toBe(true);
  });
  test("proof.releaseAuthorizationExists is false", () => {
    expect(buildDemoResponse("reject", getRejectScenario()).proof.releaseAuthorizationExists).toBe(false);
  });
});

describe("Browser demo — unified response shape (HOLD)", () => {
  test("scenario.id is hold", () => {
    expect(buildDemoResponse("hold", getHoldScenario()).scenario.id).toBe("hold");
  });
  test("outcome.finalState is HOLD", () => {
    expect(buildDemoResponse("hold", getHoldScenario()).outcome.finalState).toBe("HOLD");
  });
  test("outcome.displayState is PAUSED", () => {
    expect(buildDemoResponse("hold", getHoldScenario()).outcome.displayState).toBe("PAUSED");
  });
  test("execution.executed is false", () => {
    expect(buildDemoResponse("hold", getHoldScenario()).execution.executed).toBe(false);
  });
  test("execution.label is PAUSED", () => {
    expect(buildDemoResponse("hold", getHoldScenario()).execution.label).toBe("PAUSED");
  });
  test("proof.blockedActionRecordExists is true", () => {
    expect(buildDemoResponse("hold", getHoldScenario()).proof.blockedActionRecordExists).toBe(true);
  });
  test("proof.releaseAuthorizationExists is false", () => {
    expect(buildDemoResponse("hold", getHoldScenario()).proof.releaseAuthorizationExists).toBe(false);
  });
});

describe("Browser demo — unified response shape (ALLOW)", () => {
  test("scenario.id is allow", () => {
    expect(buildDemoResponse("allow", getAllowScenario()).scenario.id).toBe("allow");
  });
  test("outcome.finalState is ALLOW", () => {
    expect(buildDemoResponse("allow", getAllowScenario()).outcome.finalState).toBe("ALLOW");
  });
  test("outcome.displayState is ALLOWED", () => {
    expect(buildDemoResponse("allow", getAllowScenario()).outcome.displayState).toBe("ALLOWED");
  });
  test("execution.executed is true", () => {
    expect(buildDemoResponse("allow", getAllowScenario()).execution.executed).toBe(true);
  });
  test("execution.label is EXECUTED", () => {
    expect(buildDemoResponse("allow", getAllowScenario()).execution.label).toBe("EXECUTED");
  });
  test("proof.releaseAuthorizationExists is true", () => {
    expect(buildDemoResponse("allow", getAllowScenario()).proof.releaseAuthorizationExists).toBe(true);
  });
  test("proof.blockedActionRecordExists is false", () => {
    expect(buildDemoResponse("allow", getAllowScenario()).proof.blockedActionRecordExists).toBe(false);
  });
});

describe("Browser demo — repeatability (3 calls each)", () => {
  test("REJECT response shape is stable across 3 calls", () => {
    for (let i = 0; i < 3; i++) {
      const r = buildDemoResponse("reject", getRejectScenario());
      expect(r.outcome.finalState).toBe("REJECT");
      expect(r.outcome.displayState).toBe("BLOCKED");
      expect(r.execution.executed).toBe(false);
      expect(r.proof.blockedActionRecordExists).toBe(true);
    }
  });
  test("HOLD response shape is stable across 3 calls", () => {
    for (let i = 0; i < 3; i++) {
      const r = buildDemoResponse("hold", getHoldScenario());
      expect(r.outcome.finalState).toBe("HOLD");
      expect(r.outcome.displayState).toBe("PAUSED");
      expect(r.execution.executed).toBe(false);
      expect(r.proof.blockedActionRecordExists).toBe(true);
    }
  });
  test("ALLOW response shape is stable across 3 calls", () => {
    for (let i = 0; i < 3; i++) {
      const r = buildDemoResponse("allow", getAllowScenario());
      expect(r.outcome.finalState).toBe("ALLOW");
      expect(r.outcome.displayState).toBe("ALLOWED");
      expect(r.execution.executed).toBe(true);
      expect(r.proof.releaseAuthorizationExists).toBe(true);
    }
  });
});

describe("Browser demo — interleaved calls", () => {
  test("Alternating scenario calls produce correct states", () => {
    type Row = [() => ReturnType<typeof getRejectScenario>, "reject"|"hold"|"allow", string, string, boolean];
    const pairs: Row[] = [
      [getRejectScenario, "reject", "REJECT", "BLOCKED", false],
      [getAllowScenario,  "allow",  "ALLOW",  "ALLOWED", true ],
      [getHoldScenario,  "hold",   "HOLD",   "PAUSED",  false],
      [getRejectScenario, "reject", "REJECT", "BLOCKED", false],
      [getHoldScenario,  "hold",   "HOLD",   "PAUSED",  false],
      [getAllowScenario,  "allow",  "ALLOW",  "ALLOWED", true ],
    ];
    for (const [fn, id, expectedFinal, expectedDisplay, expectedExec] of pairs) {
      const r = buildDemoResponse(id, fn());
      expect(r.outcome.finalState).toBe(expectedFinal);
      expect(r.outcome.displayState).toBe(expectedDisplay);
      expect(r.execution.executed).toBe(expectedExec);
    }
  });
});
