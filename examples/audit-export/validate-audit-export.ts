/**
 * Validation script for the CerbaSeal Audit Export starter kit.
 * Generates evidence bundles using live gate evaluations, persists them to
 * a temp JSONL file using writeEvidenceBundle(), then parses and verifies
 * all required reporting dimensions (outcome, actor authority, actor ID,
 * workflow class).
 *
 * Run: pnpm tsx examples/audit-export/validate-audit-export.ts
 * Expected output: all checks PASS, exit code 0
 */

import { fileURLToPath } from "node:url";
import { unlinkSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  writeEvidenceBundle, parseEvidenceBundleLog,
  buildAuditSummary, formatTextReport
} from "./index.js";
import { ExecutionGateService } from "../../src/services/execution/execution-gate-service.js";
import { AppendOnlyLogService } from "../../src/services/audit/append-only-log-service.js";
import { EvidenceBundleService } from "../../src/services/evidence/evidence-bundle-service.js";
import { loadCerbaSealConfig } from "../../src/config/cerbaseal-config.js";
import type { GovernedRequest, ApprovalArtifact } from "../../src/domain/types/core.js";

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

const LOG_PATH = join(tmpdir(), `cerbaseal-evidence-${Date.now()}.jsonl`);

function cleanup(): void {
  if (existsSync(LOG_PATH)) { try { unlinkSync(LOG_PATH); } catch { /* ignore */ } }
}
process.on("exit", cleanup);
process.on("SIGINT", () => { cleanup(); process.exit(1); });

const config = loadCerbaSealConfig();
const gate = new ExecutionGateService(config);
const logService = new AppendOnlyLogService();
const evidenceService = new EvidenceBundleService(logService);

const nowIso = () => new Date().toISOString();

function buildRequest(
  requestId: string,
  workflowClass: string,
  actorId: string,
  actorAuthorityClass: "system" | "analyst",
  withApproval = false
): GovernedRequest {
  const createdAt = nowIso();
  const approval: ApprovalArtifact | null = withApproval ? {
    approvalId: `approval_${requestId}`,
    approverId: "reviewer-val-001",
    forRequestId: requestId,
    approverAuthorityClass: "reviewer",
    privilegedAuthSatisfied: true,
    immutableSignature: `sig_${requestId}`,
    approvedAt: new Date(Date.now() + 1000).toISOString()
  } : null;

  return {
    requestId, workflowClass, jurisdiction: "EU",
    actorId, actorAuthorityClass,
    proposedActionClass: "escalate",
    proposal: { proposalSourceKind: "ai", authorityBearing: false,
      requestedActionClass: "escalate", confidence: 0.82,
      reasonCodes: ["threshold_exceeded"], proposalCreatedAt: createdAt },
    sensitive: true, prohibitedUse: false,
    policyPackRef: { id: "policy_val_v1", version: "1.0.0" },
    provenanceRef: { modelVersion: "val-v1", ruleSetVersion: "rules-1.0", sourceHash: "sha256:val" },
    approvalRequired: withApproval, approvalArtifact: approval, loggingReady: true,
    controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: `vr-${requestId}` },
    trustState: { trusted: true, trustStateId: `ts-${requestId}` }, createdAt
  };
}

console.log("\nCerbaSeal Audit Export — Validation\n");
console.log(`  Evidence log: ${LOG_PATH}\n`);

// Generate 5 gate evaluations across different actors and workflows
const scenarios = [
  // 3 ALLOW decisions: system actor, transaction_escalation (no approval needed)
  buildRequest("ae-001", "transaction_escalation", "governance-system", "system", false),
  buildRequest("ae-002", "transaction_escalation", "governance-system", "system", false),
  buildRequest("ae-003", "transaction_escalation", "risk-orchestrator", "system", false),
  // 1 ALLOW via analyst + approval
  buildRequest("ae-004", "transaction_escalation", "analyst-jane-001", "analyst", true),
  // 1 HOLD: fraud_triage always requires approval, none provided → HOLD
  buildRequest("ae-005", "fraud_triage", "governance-system", "system", false),
];

for (const req of scenarios) {
  const result = gate.evaluate(req);
  const bundle = evidenceService.createBundle({ request: req, gateResult: result });
  writeEvidenceBundle(LOG_PATH, bundle);
}

// Parse the log
let bundles;
try {
  bundles = parseEvidenceBundleLog(LOG_PATH);
} catch (err) {
  console.error(`Fatal: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
}

check("Evidence log parsed: 5 bundles", bundles.length === 5);
check("Each bundle has an evidenceBundleId", bundles.every(b => typeof b.evidenceBundleId === "string"));
check("Each bundle has a decisionEnvelope.finalState", bundles.every(b => ["ALLOW", "HOLD", "REJECT"].includes(b.decisionEnvelope.finalState)));
check("Each bundle has request.workflowClass", bundles.every(b => typeof b.decisionEnvelope.workflowClass === "string"));
check("Each bundle has request.actorId", bundles.every(b => typeof b.request.actorId === "string"));
check("Each bundle has request.actorAuthorityClass", bundles.every(b => typeof b.request.actorAuthorityClass === "string"));

// Build summary
const summary = buildAuditSummary(bundles);

// Outcome grouping
// ae-001/002/003/004 → ALLOW, ae-005 → HOLD
check("byFinalState: 4 ALLOW decisions", summary.byFinalState["ALLOW"] === 4);
check("byFinalState: 1 HOLD decision", summary.byFinalState["HOLD"] === 1);
check("allowCount convenience field correct", summary.allowCount === 4);
check("holdCount convenience field correct", summary.holdCount === 1);
check("rejectCount is 0 for these scenarios", summary.rejectCount === 0);

// Workflow class grouping
check("byWorkflowClass: transaction_escalation has 4", summary.byWorkflowClass["transaction_escalation"] === 4);
check("byWorkflowClass: fraud_triage has 1", summary.byWorkflowClass["fraud_triage"] === 1);

// Actor authority class grouping
check("byActorAuthorityClass: system has 4 decisions", summary.byActorAuthorityClass["system"] === 4);
check("byActorAuthorityClass: analyst has 1 decision", summary.byActorAuthorityClass["analyst"] === 1);

// Actor ID grouping
check("byActorId: governance-system present", "governance-system" in summary.byActorId);
check("byActorId: risk-orchestrator present", "risk-orchestrator" in summary.byActorId);
check("byActorId: analyst-jane-001 present", "analyst-jane-001" in summary.byActorId);
check("byActorId: governance-system has 3 decisions", summary.byActorId["governance-system"] === 3);

// Total
check("totalDecisions is 5", summary.totalDecisions === 5);

// Text report content
const report = formatTextReport(summary, LOG_PATH);
check("Report has By Decision Outcome section", report.includes("By Decision Outcome"));
check("Report has By Workflow Class section", report.includes("By Workflow Class"));
check("Report has By Actor Authority Class section", report.includes("By Actor Authority Class"));
check("Report has By Actor ID section", report.includes("By Actor ID"));
check("Report shows ALLOW", report.includes("ALLOW"));
check("Report shows HOLD", report.includes("HOLD"));
check("Report shows transaction_escalation", report.includes("transaction_escalation"));
check("Report shows fraud_triage", report.includes("fraud_triage"));
check("Report shows system authority class", report.includes("system"));
check("Report shows analyst authority class", report.includes("analyst"));
check("Report shows governance-system actor", report.includes("governance-system"));

// Error handling
let missingErr = "";
try { parseEvidenceBundleLog("/tmp/__cerbaseal_nonexistent_xyz.jsonl"); } catch (err) {
  missingErr = err instanceof Error ? err.message : "error";
}
check("parseEvidenceBundleLog throws on missing file", missingErr.includes("not found"));

console.log(`\nValidation complete: ${passed} passed, ${failed} failed\n`);
cleanup();
process.exit(failed > 0 ? 1 : 0);
