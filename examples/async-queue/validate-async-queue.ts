/**
 * Validation script for the CerbaSeal Async Queue starter kit.
 * Runs the full job lifecycle: enqueue → HOLD → approve → ALLOW.
 * Also verifies REJECT on an invalid approval and audit chain integrity.
 *
 * Run: pnpm tsx examples/async-queue/validate-async-queue.ts
 * Expected output: all checks PASS, exit code 0
 */

import { fileURLToPath } from "node:url";
import { JobQueue } from "./index.js";
import { ExecutionGateService } from "../../src/services/execution/execution-gate-service.js";
import { AppendOnlyLogService } from "../../src/services/audit/append-only-log-service.js";
import { EvidenceBundleService } from "../../src/services/evidence/evidence-bundle-service.js";
import { loadCerbaSealConfig } from "../../src/config/cerbaseal-config.js";
import type { GovernedRequest } from "../../src/domain/types/core.js";

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (!isMain) process.exit(0);

let passed = 0;
let failed = 0;

function check(label: string, ok: boolean, detail?: string): void {
  if (ok) {
    console.log(`  [PASS] ${label}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${label}${detail ? `: ${detail}` : ""}`);
    failed++;
  }
}

const config = loadCerbaSealConfig();
const gate = new ExecutionGateService(config);
const logService = new AppendOnlyLogService();
const evidenceService = new EvidenceBundleService(logService);
const queue = new JobQueue(gate, logService, evidenceService);

const nowIso = () => new Date().toISOString();

function buildProposal(requestId: string, workflowClass = "transaction_escalation", requireApproval = true): GovernedRequest {
  return {
    requestId, workflowClass, jurisdiction: "EU",
    actorId: "governance-system", actorAuthorityClass: "system", proposedActionClass: "escalate",
    proposal: { proposalSourceKind: "ai", authorityBearing: false, requestedActionClass: "escalate",
      confidence: 0.85, reasonCodes: ["velocity_anomaly"], proposalCreatedAt: nowIso() },
    sensitive: true, prohibitedUse: false,
    policyPackRef: { id: "policy_txn_v1", version: "1.0.0" },
    provenanceRef: { modelVersion: "risk-v3", ruleSetVersion: "rules-2.1", sourceHash: "sha256:abc" },
    approvalRequired: requireApproval, approvalArtifact: null, loggingReady: true,
    controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: `vr-${requestId}` },
    trustState: { trusted: true, trustStateId: `ts-${requestId}` }, createdAt: nowIso()
  };
}

console.log("\nCerbaSeal Async Queue — Validation\n");

// Test 1: Enqueue a job requiring approval → should be HELD
const job1 = queue.enqueue(buildProposal("q-val-001", "transaction_escalation", true));
check("Enqueue with approvalRequired:true → status HELD", job1.status === "HELD");
check("HELD job is stored in queue", queue.getJob("q-val-001") !== undefined);
check("HELD job appears in listByStatus(HELD)", queue.listByStatus("HELD").some(j => j.jobId === "q-val-001"));

// Test 2: Approve the held job → should be ALLOWED
const released = queue.approve("q-val-001", { reviewerId: "reviewer-alice-001", approverAuthorityClass: "reviewer" });
check("Approve HELD job → status ALLOWED", released.status === "ALLOWED");
check("Released job has releasedAt timestamp", typeof released.releasedAt === "string");
check("Released job has approvalArtifact with reviewer", released.request.approvalArtifact?.approverId === "reviewer-alice-001");
check("Released job has evidence bundle", released.evidenceBundle !== undefined);
check("HELD list is now empty", queue.listByStatus("HELD").length === 0);
check("ALLOWED list has 1 job", queue.listByStatus("ALLOWED").length === 1);

// Test 3: Enqueue fraud_triage — always requires approval regardless of flag
const job3 = queue.enqueue(buildProposal("q-val-003", "fraud_triage", false));
check("fraud_triage always HELD (approval enforced unconditionally)", job3.status === "HELD");

// Approve job3 with a compliance officer
const released3 = queue.approve("q-val-003", { reviewerId: "compliance-officer-001", approverAuthorityClass: "compliance_officer" });
check("fraud_triage: approved by compliance_officer → ALLOWED", released3.status === "ALLOWED");

// Test 4: Cannot approve a job that is already ALLOWED
let doubleApproveErr = "";
try {
  queue.approve("q-val-001", { reviewerId: "reviewer-bob-001", approverAuthorityClass: "reviewer" });
} catch (err) {
  doubleApproveErr = err instanceof Error ? err.message : "error";
}
check("Cannot approve an already ALLOWED job", doubleApproveErr.includes("not in HELD status"));

// Test 5: Cannot approve a job that doesn't exist
let notFoundErr = "";
try {
  queue.approve("q-nonexistent", { reviewerId: "reviewer-bob-001", approverAuthorityClass: "reviewer" });
} catch (err) {
  notFoundErr = err instanceof Error ? err.message : "error";
}
check("Cannot approve non-existent job", notFoundErr.includes("not found"));

// Test 6: Enqueue a job that passes immediately (no approval needed, non-fraud workflow)
const job6 = queue.enqueue(buildProposal("q-val-006", "transaction_escalation", false));
check("Enqueue with no approval required → status ALLOWED immediately", job6.status === "ALLOWED");
check("Immediately-released job has releasedAt", typeof job6.releasedAt === "string");

// Test 7: Audit chain integrity
check("Audit chain valid after all operations", queue.auditChainValid);

console.log(`\nValidation complete: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
