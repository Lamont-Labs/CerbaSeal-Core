/**
 * CerbaSeal Agent Integration Starter Kit
 *
 * Pattern: An AI agent proposes consequential actions, a human approves before execution.
 * Use when: You have an AI agent that can take real-world actions and you need to ensure
 * every action is human-approved before it executes.
 *
 * This kit demonstrates:
 *   1. An AI agent proposing an action (actorAuthorityClass: "ai")
 *   2. The gate blocking the AI from self-authorizing (REJECT)
 *   3. The correct pattern: system actor + AI proposal + human approval → ALLOW
 *   4. How to structure the agent-gate integration boundary
 *
 * To run: pnpm tsx examples/agent-integration-starter/index.ts
 */

import { fileURLToPath } from "node:url";
import { ExecutionGateService } from "../../src/services/execution/execution-gate-service.js";
import { AppendOnlyLogService } from "../../src/services/audit/append-only-log-service.js";
import { EvidenceBundleService } from "../../src/services/evidence/evidence-bundle-service.js";
import type { GovernedRequest, ApprovalArtifact } from "../../src/domain/types/core.js";

const gate = new ExecutionGateService();
const logService = new AppendOnlyLogService();
const evidenceService = new EvidenceBundleService(logService);

interface AgentProposal {
  agentId: string;
  modelVersion: string;
  proposedAction: "allow" | "hold" | "reject" | "escalate" | "account_hold";
  confidence: number;
  reasoning: string[];
  targetId: string;
}

function buildAgentRequest(proposal: AgentProposal, requestId: string): GovernedRequest {
  const createdAt = new Date().toISOString();

  return {
    requestId,
    workflowClass: "transaction_escalation",
    jurisdiction: "EU",
    actorId: "governance-system",
    actorAuthorityClass: "system",
    proposedActionClass: proposal.proposedAction,
    proposal: {
      proposalSourceKind: "ai",
      authorityBearing: false,
      requestedActionClass: proposal.proposedAction,
      confidence: proposal.confidence,
      reasonCodes: proposal.reasoning,
      proposalCreatedAt: createdAt
    },
    sensitive: true,
    prohibitedUse: false,
    policyPackRef: { id: "policy_agent_v1", version: "1.0.0" },
    provenanceRef: {
      modelVersion: proposal.modelVersion,
      ruleSetVersion: "agent-rules-1.0.0",
      sourceHash: `sha256:${proposal.agentId}_rules_hash`
    },
    approvalRequired: true,
    approvalArtifact: null,
    loggingReady: true,
    controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: `vr_${requestId}` },
    trustState: { trusted: true, trustStateId: `ts_${requestId}` },
    createdAt
  };
}

function buildHumanApproval(requestId: string, reviewerId: string, requestCreatedAt: string): ApprovalArtifact {
  const approvedAt = new Date(new Date(requestCreatedAt).getTime() + 120_000).toISOString(); // 2 min later
  return {
    approvalId: `approval_human_${requestId}`,
    approverId: reviewerId,
    forRequestId: requestId,
    approverAuthorityClass: "reviewer",
    privilegedAuthSatisfied: true,
    immutableSignature: `sig_reviewer_${reviewerId}_${requestId}`,
    approvedAt
  };
}

function runAgentIntegrationDemo(): void {
  console.log("\nCERBASEAL AGENT INTEGRATION STARTER\n");

  const agentProposal: AgentProposal = {
    agentId: "fraud-detection-agent-v2",
    modelVersion: "gpt-4-fraud-finetuned-v2",
    proposedAction: "escalate",
    confidence: 0.89,
    reasoning: ["unusual_spending_pattern", "high_risk_merchant", "velocity_anomaly"],
    targetId: "account-12345"
  };

  console.log("Scenario 1 — Incorrect pattern: Agent attempts self-authorization (expected: REJECT)");
  const aiSelfAuthRequest: GovernedRequest = {
    requestId: "agent-self-auth-001",
    workflowClass: "transaction_escalation",
    jurisdiction: "EU",
    actorId: agentProposal.agentId,
    actorAuthorityClass: "ai",
    proposedActionClass: agentProposal.proposedAction,
    proposal: {
      proposalSourceKind: "ai",
      authorityBearing: false,
      requestedActionClass: agentProposal.proposedAction,
      confidence: agentProposal.confidence,
      reasonCodes: agentProposal.reasoning,
      proposalCreatedAt: new Date().toISOString()
    },
    sensitive: true,
    prohibitedUse: false,
    policyPackRef: { id: "policy_agent_v1", version: "1.0.0" },
    provenanceRef: {
      modelVersion: agentProposal.modelVersion,
      ruleSetVersion: "agent-rules-1.0.0",
      sourceHash: "sha256:agent_rules_hash"
    },
    approvalRequired: false,
    approvalArtifact: null,
    loggingReady: true,
    controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: "vr_001" },
    trustState: { trusted: true, trustStateId: "ts_001" },
    createdAt: new Date().toISOString()
  };

  const rejectResult = gate.evaluate(aiSelfAuthRequest);
  console.log(`  → Gate decision: ${rejectResult.decisionEnvelope.finalState}`);
  console.log(`  → Reason: ${rejectResult.blockedActionRecord?.reasonCodes.join(", ")}`);
  console.log(`  → The AI cannot authorize its own proposals. This is enforced unconditionally.\n`);

  console.log("Scenario 2 — Correct pattern: System actor carries AI proposal (expected: HOLD → waiting for human)");
  const requestId = "agent-correct-001";
  const correctRequest = buildAgentRequest(agentProposal, requestId);
  const holdResult = gate.evaluate(correctRequest as any);
  console.log(`  → Gate decision: ${holdResult.decisionEnvelope.finalState}`);
  console.log(`  → System is now waiting for human reviewer to approve.\n`);

  console.log("Scenario 3 — Human reviewer approves (expected: ALLOW)");
  const approval = buildHumanApproval(requestId, "reviewer-sarah-001", correctRequest.createdAt);
  const approvedRequest: GovernedRequest = {
    ...correctRequest,
    approvalArtifact: approval
  };

  const allowResult = gate.evaluate(approvedRequest as any);
  console.log(`  → Gate decision: ${allowResult.decisionEnvelope.finalState}`);
  if (allowResult.releaseAuthorization) {
    console.log(`  → Action authorized: ${allowResult.releaseAuthorization.actionClass}`);
    console.log(`  → Release ID: ${allowResult.releaseAuthorization.releaseAuthorizationId}`);
  }
  console.log();

  const bundle = evidenceService.createBundle({ request: approvedRequest as any, gateResult: allowResult });
  console.log("Evidence bundle created:");
  console.log(`  → Bundle ID: ${bundle.evidenceBundleId}`);
  console.log(`  → Events in chain: ${bundle.eventChain.length}`);
  console.log(`  → Agent model: ${bundle.request.provenanceRef?.modelVersion}`);
  console.log(`  → Reviewer: ${bundle.request.approvalArtifact?.approverId}`);
  console.log(`  → Chain valid: ${logService.verifyChain()}`);
  console.log();

  console.log("Integration boundary summary:");
  console.log("  ✓ AI cannot authorize its own proposals");
  console.log("  ✓ System actor carries AI proposal safely");
  console.log("  ✓ Human approval required and verified");
  console.log("  ✓ Complete evidence chain with approver identity");
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  runAgentIntegrationDemo();
}

export { buildAgentRequest, buildHumanApproval };
