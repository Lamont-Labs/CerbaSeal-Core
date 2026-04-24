import { fileURLToPath } from "node:url";
import { ExecutionGateService } from "../../src/services/execution/execution-gate-service.js";
import { buildValidGovernedRequest } from "../../src/domain/builders/request-fixtures.js";
import { attemptExecution } from "./mock-execution-system.js";
import type { GateResult } from "../../src/domain/types/core.js";
import type { ExecutionResult } from "./mock-execution-system.js";

export interface ScenarioResult {
  label: string;
  gateResult: GateResult;
  executionResult: ExecutionResult;
}

export function runRejectScenario(): ScenarioResult {
  const gate = new ExecutionGateService();
  const base = buildValidGovernedRequest();
  const request = {
    ...base,
    requestId: "consumer-reject-001",
    actorId: "ai-agent-001",
    actorAuthorityClass: "ai" as const,
    proposal: {
      ...base.proposal,
      proposalSourceKind: "ai" as const
    },
    approvalRequired: false,
    approvalArtifact: null
  };
  const gateResult = gate.evaluate(request as any);
  const executionResult = attemptExecution("escalate", gateResult);
  return { label: "Unauthorized AI Action", gateResult, executionResult };
}

export function runHoldScenario(): ScenarioResult {
  const gate = new ExecutionGateService();
  const base = buildValidGovernedRequest();
  const request = {
    ...base,
    requestId: "consumer-hold-001",
    actorId: "analyst-001",
    actorAuthorityClass: "analyst" as const,
    proposal: {
      ...base.proposal,
      proposalSourceKind: "deterministic_rule" as const
    },
    approvalRequired: true,
    approvalArtifact: null
  };
  const gateResult = gate.evaluate(request as any);
  const executionResult = attemptExecution("escalate", gateResult);
  return { label: "Missing Approval", gateResult, executionResult };
}

export function runAllowScenario(): ScenarioResult {
  const gate = new ExecutionGateService();
  const base = buildValidGovernedRequest();
  const requestId = "consumer-allow-001";
  const request = {
    ...base,
    requestId,
    actorId: "analyst-001",
    actorAuthorityClass: "analyst" as const,
    proposal: {
      ...base.proposal,
      proposalSourceKind: "deterministic_rule" as const
    },
    approvalRequired: true,
    approvalArtifact: {
      ...base.approvalArtifact!,
      forRequestId: requestId,
      approvalId: "approval-consumer-001"
    }
  };
  const gateResult = gate.evaluate(request as any);
  const executionResult = attemptExecution("escalate", gateResult);
  return { label: "Valid Approved Action", gateResult, executionResult };
}

function runDemo() {
  console.log("\nCERBASEAL CONSUMER EXAMPLE\n");

  for (const run of [runRejectScenario, runHoldScenario, runAllowScenario]) {
    const { label, gateResult, executionResult } = run();
    const state = gateResult.decisionEnvelope.finalState;
    const execLabel = executionResult.executed ? "EXECUTED" : "NOT EXECUTED";
    console.log(`Scenario: ${label}`);
    console.log(`Gate decision: ${state}`);
    console.log(`External execution: ${execLabel}`);
    console.log();
  }
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  runDemo();
}
