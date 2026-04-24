/**
 * Browser demo route handler tests.
 *
 * Tests the scenario functions backing the browser demo routes directly,
 * without starting an HTTP server. No brittle lifecycle handling required.
 *
 * Each scenario is called multiple times to verify repeatability.
 */

import { describe, test, expect } from "vitest";
import { getRejectScenario, getHoldScenario, getAllowScenario } from "../../examples/browser-demo/scenarios.js";

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

describe("Browser demo scenario handlers — repeatability (3 calls each)", () => {
  test("REJECT scenario is stable across 3 calls", () => {
    for (let i = 0; i < 3; i++) {
      const result = getRejectScenario();
      expect(result.decisionEnvelope.finalState).toBe("REJECT");
      expect(result.blockedActionRecord).not.toBeNull();
      expect(result.releaseAuthorization).toBeNull();
    }
  });

  test("HOLD scenario is stable across 3 calls", () => {
    for (let i = 0; i < 3; i++) {
      const result = getHoldScenario();
      expect(result.decisionEnvelope.finalState).toBe("HOLD");
      expect(result.blockedActionRecord).not.toBeNull();
      expect(result.releaseAuthorization).toBeNull();
    }
  });

  test("ALLOW scenario is stable across 3 calls", () => {
    for (let i = 0; i < 3; i++) {
      const result = getAllowScenario();
      expect(result.decisionEnvelope.finalState).toBe("ALLOW");
      expect(result.releaseAuthorization).not.toBeNull();
      expect(result.blockedActionRecord).toBeNull();
    }
  });
});

describe("Browser demo scenario handlers — interleaved calls", () => {
  test("Alternating REJECT / ALLOW / HOLD calls all produce correct states", () => {
    const pairs: Array<[() => ReturnType<typeof getRejectScenario>, string]> = [
      [getRejectScenario, "REJECT"],
      [getAllowScenario,  "ALLOW"],
      [getHoldScenario,  "HOLD"],
      [getRejectScenario, "REJECT"],
      [getHoldScenario,  "HOLD"],
      [getAllowScenario,  "ALLOW"]
    ];
    for (const [fn, expected] of pairs) {
      expect(fn().decisionEnvelope.finalState).toBe(expected);
    }
  });
});
