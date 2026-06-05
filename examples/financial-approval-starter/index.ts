/**
 * CerbaSeal Financial Approval Starter Kit
 *
 * Pattern: A manager approves an analyst's AI-assisted recommendation
 * before a consequential financial action is taken.
 *
 * Use when:
 *   - An AI system recommends a financial action (hold, reject, escalate)
 *   - A human analyst reviews the recommendation
 *   - A manager must approve before the action is executed
 *
 * Workflow:
 *   1. AI scores a transaction and recommends an action (proposalSourceKind: "ai")
 *   2. Analyst reviews and agrees (actorAuthorityClass: "analyst")
 *   3. Analyst submits to manager for approval
 *   4. Manager approves (approverAuthorityClass: "manager")
 *   5. Approved request submitted to CerbaSeal gate → ALLOW
 *
 * To run: pnpm tsx examples/financial-approval-starter/index.ts
 */

import { fileURLToPath } from "node:url";
import { ExecutionGateService } from "../../src/services/execution/execution-gate-service.js";
import { AppendOnlyLogService } from "../../src/services/audit/append-only-log-service.js";
import { EvidenceBundleService } from "../../src/services/evidence/evidence-bundle-service.js";
import type { GovernedRequest, ApprovalArtifact } from "../../src/domain/types/core.js";

const gate = new ExecutionGateService();
const logService = new AppendOnlyLogService();
const evidenceService = new EvidenceBundleService(logService);

function nowIso(): string {
  return new Date().toISOString();
}

function buildTransactionRequest(args: {
  requestId: string;
  analystId: string;
  transactionAmount: number;
  riskScore: number;
  proposedAction: "hold" | "reject" | "escalate";
}): GovernedRequest {
  const { requestId, analystId, transactionAmount, riskScore, proposedAction } = args;

  return {
    requestId,
    workflowClass: "transaction_escalation",
    jurisdiction: "EU",
    actorId: analystId,
    actorAuthorityClass: "analyst",
    proposedActionClass: proposedAction,
    proposal: {
      proposalSourceKind: "ai",
      authorityBearing: false,
      requestedActionClass: proposedAction,
      confidence: riskScore / 100,
      reasonCodes: [
        riskScore > 80 ? "high_risk_score" : "elevated_risk_score",
        transactionAmount > 10000 ? "high_value_transaction" : "standard_value_transaction"
      ],
      proposalCreatedAt: nowIso()
    },
    sensitive: true,
    prohibitedUse: false,
    policyPackRef: { id: "policy_financial_v1", version: "1.0.0" },
    provenanceRef: {
      modelVersion: "risk-model-v3.0",
      ruleSetVersion: "financial-rules-2.1.0",
      sourceHash: "sha256:financial_rules_hash"
    },
    approvalRequired: true,
    approvalArtifact: null,
    loggingReady: true,
    controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: `vr_${requestId}` },
    trustState: { trusted: true, trustStateId: `ts_${requestId}` },
    createdAt: nowIso()
  };
}

function buildManagerApproval(args: {
  requestId: string;
  managerId: string;
  requestCreatedAt: string;
}): ApprovalArtifact {
  const { requestId, managerId, requestCreatedAt } = args;
  const approvalDate = new Date(new Date(requestCreatedAt).getTime() + 300_000); // 5 min after request

  return {
    approvalId: `approval_${requestId}`,
    approverId: managerId,
    forRequestId: requestId,
    approverAuthorityClass: "manager",
    privilegedAuthSatisfied: true,
    immutableSignature: `sig_${managerId}_${requestId}_${approvalDate.getTime()}`,
    approvedAt: approvalDate.toISOString()
  };
}

function runFinancialApprovalDemo(): void {
  console.log("\nCERBASEAL FINANCIAL APPROVAL STARTER\n");
  console.log("Scenario: AI flags a high-risk transaction → analyst reviews → manager approves\n");

  const requestId = "txn-escalation-001";
  const createdAt = "2026-04-18T10:00:00.000Z";

  const baseRequest = buildTransactionRequest({
    requestId,
    analystId: "analyst-jane-001",
    transactionAmount: 25000,
    riskScore: 87,
    proposedAction: "escalate"
  });

  const requestWithTimestamp = { ...baseRequest, createdAt };

  console.log("Step 1 — Submit without approval (expected: HOLD)");
  const holdResult = gate.evaluate(requestWithTimestamp as any);
  console.log(`  → Gate decision: ${holdResult.decisionEnvelope.finalState}`);
  console.log(`  → Reason: ${holdResult.blockedActionRecord?.reasonCodes.join(", ")}`);
  console.log();

  console.log("Step 2 — Manager reviews and approves");
  const approval = buildManagerApproval({
    requestId,
    managerId: "manager-carlos-001",
    requestCreatedAt: createdAt
  });

  const approvedRequest: GovernedRequest = {
    ...requestWithTimestamp,
    approvalArtifact: approval
  };

  console.log("Step 3 — Resubmit with approval (expected: ALLOW)");
  const allowResult = gate.evaluate(approvedRequest as any);
  console.log(`  → Gate decision: ${allowResult.decisionEnvelope.finalState}`);
  if (allowResult.releaseAuthorization) {
    console.log(`  → Release authorization: ${allowResult.releaseAuthorization.releaseAuthorizationId}`);
    console.log(`  → Action class: ${allowResult.releaseAuthorization.actionClass}`);
  }
  console.log();

  console.log("Step 4 — Generate evidence bundle");
  const bundle = evidenceService.createBundle({
    request: approvedRequest as any,
    gateResult: allowResult
  });
  console.log(`  → Evidence bundle: ${bundle.evidenceBundleId}`);
  console.log(`  → Event chain length: ${bundle.eventChain.length}`);
  console.log(`  → Audit chain valid: ${logService.verifyChain()}`);
  console.log();

  console.log("Step 5 — Verify: AI alone cannot authorize (expected: REJECT)");
  const aiRequest: GovernedRequest = {
    ...requestWithTimestamp,
    requestId: "txn-ai-bypass-001",
    actorAuthorityClass: "ai",
    actorId: "fraud-model-001",
    proposal: { ...requestWithTimestamp.proposal, proposalSourceKind: "ai" },
    approvalRequired: false,
    approvalArtifact: null
  };
  const rejectResult = gate.evaluate(aiRequest as any);
  console.log(`  → Gate decision: ${rejectResult.decisionEnvelope.finalState}`);
  console.log(`  → Reason: ${rejectResult.blockedActionRecord?.reasonCodes.join(", ")}`);
  console.log();

  console.log("All scenarios complete.");
  console.log(`Total audit entries: ${logService.list().length}`);
  console.log(`Chain valid: ${logService.verifyChain()}`);
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  runFinancialApprovalDemo();
}

export { buildTransactionRequest, buildManagerApproval };
