/**
 * External signal examples integration tests.
 *
 * Validates consumer example, agent-gate demo, and auditor view
 * using real ExecutionGateService results. No mocked decisions.
 */

import { describe, test, expect } from "vitest";
import { runRejectScenario, runHoldScenario, runAllowScenario } from "../../src/domain/builders/consumer-scenarios.js";
import { runAgentRejectScenario, runAgentHoldScenario, runAgentAllowScenario } from "../../src/domain/builders/agent-scenarios.js";
import { renderCertificate } from "../../src/domain/formatters/certificate.js";
import { getRejectScenario, getHoldScenario, getAllowScenario } from "../../src/domain/builders/gate-scenarios.js";

describe("Consumer example — execution gating", () => {
  test("REJECT scenario does not execute", () => {
    const { gateResult, executionResult } = runRejectScenario();
    expect(gateResult.decisionEnvelope.finalState).toBe("REJECT");
    expect(executionResult.executed).toBe(false);
    expect(gateResult.releaseAuthorization).toBeNull();
  });

  test("HOLD scenario does not execute", () => {
    const { gateResult, executionResult } = runHoldScenario();
    expect(gateResult.decisionEnvelope.finalState).toBe("HOLD");
    expect(executionResult.executed).toBe(false);
    expect(gateResult.releaseAuthorization).toBeNull();
  });

  test("ALLOW scenario executes", () => {
    const { gateResult, executionResult } = runAllowScenario();
    expect(gateResult.decisionEnvelope.finalState).toBe("ALLOW");
    expect(executionResult.executed).toBe(true);
    expect(executionResult.releaseAuthorizationId).toBeTruthy();
    expect(gateResult.releaseAuthorization).not.toBeNull();
  });

  test("REJECT and HOLD are stable across 3 repeated calls each", () => {
    for (let i = 0; i < 3; i++) {
      expect(runRejectScenario().executionResult.executed).toBe(false);
      expect(runHoldScenario().executionResult.executed).toBe(false);
    }
  });
});

describe("Agent-gate demo — tool execution gating", () => {
  test("REJECT scenario blocks tool call", () => {
    const { gateResult, toolResult } = runAgentRejectScenario();
    expect(gateResult.decisionEnvelope.finalState).toBe("REJECT");
    expect(toolResult.executed).toBe(false);
    expect(toolResult.toolName).toBe("escalate_case");
  });

  test("HOLD scenario blocks tool call", () => {
    const { gateResult, toolResult } = runAgentHoldScenario();
    expect(gateResult.decisionEnvelope.finalState).toBe("HOLD");
    expect(toolResult.executed).toBe(false);
    expect(toolResult.toolName).toBe("apply_hold");
  });

  test("ALLOW scenario executes tool", () => {
    const { gateResult, toolResult } = runAgentAllowScenario();
    expect(gateResult.decisionEnvelope.finalState).toBe("ALLOW");
    expect(toolResult.executed).toBe(true);
    expect(toolResult.releaseAuthorizationId).toBeTruthy();
    expect(toolResult.toolName).toBe("apply_hold");
  });

  test("Repeated REJECT/HOLD/ALLOW agent calls remain stable", () => {
    for (let i = 0; i < 3; i++) {
      expect(runAgentRejectScenario().toolResult.executed).toBe(false);
      expect(runAgentHoldScenario().toolResult.executed).toBe(false);
      expect(runAgentAllowScenario().toolResult.executed).toBe(true);
    }
  });
});

describe("Auditor view — certificate rendering", () => {
  test("REJECT certificate contains Decision: REJECT", () => {
    const cert = renderCertificate(getRejectScenario());
    expect(cert).toContain("Decision:         REJECT");
  });

  test("HOLD certificate contains Decision: HOLD", () => {
    const cert = renderCertificate(getHoldScenario());
    expect(cert).toContain("Decision:         HOLD");
  });

  test("ALLOW certificate contains Decision: ALLOW", () => {
    const cert = renderCertificate(getAllowScenario());
    expect(cert).toContain("Decision:         ALLOW");
  });

  test("ALLOW certificate contains Release Authorization: present", () => {
    const cert = renderCertificate(getAllowScenario());
    expect(cert).toContain("Release Authorization: present");
  });

  test("REJECT certificate contains Blocked Action Record: present", () => {
    const cert = renderCertificate(getRejectScenario());
    expect(cert).toContain("Blocked Action Record: present");
  });

  test("HOLD certificate contains Blocked Action Record: present", () => {
    const cert = renderCertificate(getHoldScenario());
    expect(cert).toContain("Blocked Action Record: present");
  });

  test("ALLOW certificate contains Release Authorization, REJECT/HOLD do not", () => {
    expect(renderCertificate(getAllowScenario())).toContain("Release Authorization: present");
    expect(renderCertificate(getRejectScenario())).toContain("Release Authorization: none");
    expect(renderCertificate(getHoldScenario())).toContain("Release Authorization: none");
  });

  test("Certificate rendering is stable across 3 repeated calls per state", () => {
    for (let i = 0; i < 3; i++) {
      expect(renderCertificate(getRejectScenario())).toContain("Decision:         REJECT");
      expect(renderCertificate(getHoldScenario())).toContain("Decision:         HOLD");
      expect(renderCertificate(getAllowScenario())).toContain("Decision:         ALLOW");
    }
  });
});
