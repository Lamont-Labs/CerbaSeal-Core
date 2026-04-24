/**
 * Browser demo route handler tests.
 *
 * Tests the scenario functions backing the browser demo routes directly,
 * without starting an HTTP server. No brittle lifecycle handling required.
 */

import { describe, test, expect } from "vitest";
import { getRejectScenario, getHoldScenario, getAllowScenario } from "../../examples/browser-demo/scenarios.js";

describe("Browser demo scenario handlers", () => {
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
