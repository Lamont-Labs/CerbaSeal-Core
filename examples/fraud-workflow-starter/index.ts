/**
 * CerbaSeal Fraud Workflow Starter Kit
 *
 * Pattern: AI-scored fraud triage with a file-backed persistent audit log.
 * Use when: You need fraud detection with a durable, verifiable audit trail.
 *
 * Workflow:
 *   1. Fraud model scores a transaction (risk score 0–100)
 *   2. Low risk (< 50): marked as no-approval-required (note: fraud_triage still enforces approval)
 *   3. Medium risk (50–79): hold for analyst review (approval required)
 *   4. High risk (≥ 80): hold for compliance officer review (approval required)
 *   5. All decisions recorded to persistent JSONL audit log
 *
 * Note: fraud_triage workflow class enforces approval unconditionally regardless of
 * the approvalRequired field. To allow auto-authorization for low-risk transactions,
 * switch to workflowClass: "transaction_escalation" for those cases.
 *
 * To run: pnpm tsx examples/fraud-workflow-starter/index.ts
 * Audit log: ./audit/fraud-triage.jsonl (created automatically)
 */

import { fileURLToPath } from "node:url";
import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ExecutionGateService } from "../../src/services/execution/execution-gate-service.js";
import { FileBackedAppendOnlyLogService } from "../../src/services/audit/file-backed-append-only-log-service.js";
import { EvidenceBundleService } from "../../src/services/evidence/evidence-bundle-service.js";
import { loadCerbaSealConfig } from "../../src/config/cerbaseal-config.js";
import type { GovernedRequest, ApprovalArtifact, HumanAuthorityClass } from "../../src/domain/types/core.js";
import type { EvidenceBundle } from "../../src/domain/types/audit.js";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..", "..");
const AUDIT_LOG_PATH = process.env["CERBASEAL_AUDIT_LOG_PATH"]
  ?? join(ROOT, "audit", "fraud-triage.jsonl");

if (!existsSync(join(AUDIT_LOG_PATH, ".."))) {
  mkdirSync(join(AUDIT_LOG_PATH, ".."), { recursive: true });
}

const config = loadCerbaSealConfig();
const gate = new ExecutionGateService(config);
const logService = new FileBackedAppendOnlyLogService(AUDIT_LOG_PATH);
const evidenceService = new EvidenceBundleService(logService);

interface FraudTransaction {
  transactionId: string;
  amount: number;
  merchantId: string;
  cardholderCountry: string;
  riskScore: number;
  riskSignals: string[];
}

function classifyRisk(riskScore: number): {
  action: "allow" | "hold" | "escalate";
  approvalRequired: boolean;
  approverClass: HumanAuthorityClass | null;
} {
  if (riskScore < 50) {
    return { action: "allow", approvalRequired: false, approverClass: null };
  } else if (riskScore < 80) {
    return { action: "hold", approvalRequired: true, approverClass: "analyst" };
  } else {
    return { action: "escalate", approvalRequired: true, approverClass: "compliance_officer" };
  }
}

function buildFraudRequest(txn: FraudTransaction, requestId: string): GovernedRequest {
  const risk = classifyRisk(txn.riskScore);
  const createdAt = new Date().toISOString();

  return {
    requestId,
    workflowClass: "fraud_triage",
    jurisdiction: txn.cardholderCountry === "EU" ? "EU" : "GLOBAL",
    actorId: "fraud-detection-model-v3",
    actorAuthorityClass: "system",
    proposedActionClass: risk.action,
    proposal: {
      proposalSourceKind: "ai",
      authorityBearing: false,
      requestedActionClass: risk.action,
      confidence: txn.riskScore / 100,
      reasonCodes: txn.riskSignals,
      proposalCreatedAt: createdAt
    },
    sensitive: txn.amount > 5000,
    prohibitedUse: false,
    policyPackRef: { id: "policy_fraud_v2", version: "2.0.0" },
    provenanceRef: {
      modelVersion: "fraud-model-v3.1",
      ruleSetVersion: "fraud-rules-5.0.0",
      sourceHash: "sha256:fraud_rules_5.0.0_hash"
    },
    approvalRequired: risk.approvalRequired,
    approvalArtifact: null,
    loggingReady: true,
    controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: `vr_${requestId}` },
    trustState: { trusted: true, trustStateId: `ts_${requestId}` },
    createdAt
  };
}

function buildAnalystApproval(requestId: string, approverClass: HumanAuthorityClass, requestCreatedAt: string): ApprovalArtifact {
  const approvedAt = new Date(new Date(requestCreatedAt).getTime() + 600_000).toISOString(); // 10 min later
  return {
    approvalId: `approval_${requestId}`,
    approverId: approverClass === "compliance_officer" ? "compliance-officer-001" : "analyst-001",
    forRequestId: requestId,
    approverAuthorityClass: approverClass,
    privilegedAuthSatisfied: true,
    immutableSignature: `sig_${approverClass}_${requestId}`,
    approvedAt
  };
}

export function processFraudTransaction(
  txn: FraudTransaction,
  withApproval = false
): { bundle: EvidenceBundle; finalState: string } {
  const requestId = `fraud_${txn.transactionId}_${Date.now()}`;
  const request = buildFraudRequest(txn, requestId);
  const risk = classifyRisk(txn.riskScore);

  let finalRequest = request;
  if (withApproval && risk.approvalRequired && risk.approverClass) {
    const approval = buildAnalystApproval(requestId, risk.approverClass, request.createdAt);
    finalRequest = { ...request, approvalArtifact: approval };
  }

  const gateResult = gate.evaluate(finalRequest as any);
  const bundle = evidenceService.createBundle({ request: finalRequest as any, gateResult });

  return {
    bundle,
    finalState: gateResult.decisionEnvelope.finalState
  };
}

function runFraudDemo(): void {
  console.log("\nCERBASEAL FRAUD WORKFLOW STARTER");
  console.log(`Audit log: ${AUDIT_LOG_PATH}\n`);

  const transactions: FraudTransaction[] = [
    {
      transactionId: "txn-low-001",
      amount: 45,
      merchantId: "supermarket-001",
      cardholderCountry: "EU",
      riskScore: 12,
      riskSignals: ["normal_velocity", "known_merchant"]
    },
    {
      transactionId: "txn-med-001",
      amount: 2800,
      merchantId: "online-shop-001",
      cardholderCountry: "EU",
      riskScore: 63,
      riskSignals: ["velocity_spike", "new_merchant"]
    },
    {
      transactionId: "txn-high-001",
      amount: 18500,
      merchantId: "unknown-merchant-001",
      cardholderCountry: "GLOBAL",
      riskScore: 91,
      riskSignals: ["velocity_spike", "high_value", "unknown_merchant", "cross_border"]
    }
  ];

  for (const txn of transactions) {
    const risk = classifyRisk(txn.riskScore);
    console.log(`Transaction: ${txn.transactionId}`);
    console.log(`  Amount: €${txn.amount} | Risk score: ${txn.riskScore} | Action: ${risk.action}`);

    const { finalState } = processFraudTransaction(txn, false);
    console.log(`  Gate decision (no approval): ${finalState}`);

    if (risk.approvalRequired) {
      const { finalState: approvedState } = processFraudTransaction(txn, true);
      console.log(`  Gate decision (with ${risk.approverClass} approval): ${approvedState}`);
    }
    console.log();
  }

  console.log(`Total audit entries: ${logService.list().length}`);
  console.log(`Chain valid: ${logService.verifyChain()}`);
  console.log(`Audit log: ${AUDIT_LOG_PATH}\n`);
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  runFraudDemo();
}
