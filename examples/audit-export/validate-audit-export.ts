/**
 * Validation script for the CerbaSeal Audit Export starter kit.
 * Generates a sample audit log using FileBackedAppendOnlyLogService,
 * then runs the export functions and verifies the output.
 *
 * Run: pnpm tsx examples/audit-export/validate-audit-export.ts
 * Expected output: all checks PASS, exit code 0
 */

import { fileURLToPath } from "node:url";
import { unlinkSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseJsonlLog, buildAuditSummary, formatTextReport } from "./index.js";
import { ExecutionGateService } from "../../src/services/execution/execution-gate-service.js";
import { FileBackedAppendOnlyLogService } from "../../src/services/audit/file-backed-append-only-log-service.js";
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

const TEST_LOG_PATH = join(tmpdir(), `cerbaseal-audit-export-validate-${Date.now()}.jsonl`);

function cleanup(): void {
  if (existsSync(TEST_LOG_PATH)) {
    try { unlinkSync(TEST_LOG_PATH); } catch { /* ignore */ }
  }
}

process.on("exit", cleanup);
process.on("SIGINT", () => { cleanup(); process.exit(1); });

const config = loadCerbaSealConfig();
const gate = new ExecutionGateService(config);
const logService = new FileBackedAppendOnlyLogService(TEST_LOG_PATH);
const evidenceService = new EvidenceBundleService(logService);

const nowIso = () => new Date().toISOString();

function buildRequest(requestId: string, workflowClass = "transaction_escalation", withApproval = false): GovernedRequest {
  const createdAt = nowIso();
  const approval: ApprovalArtifact | null = withApproval ? {
    approvalId: `approval_${requestId}`,
    approverId: "reviewer-val-001",
    forRequestId: requestId,
    approverAuthorityClass: "reviewer",
    privilegedAuthSatisfied: true,
    immutableSignature: `sig_reviewer_${requestId}`,
    approvedAt: new Date(Date.now() + 1000).toISOString()
  } : null;

  return {
    requestId, workflowClass, jurisdiction: "EU",
    actorId: "governance-system", actorAuthorityClass: "system", proposedActionClass: "escalate",
    proposal: { proposalSourceKind: "ai", authorityBearing: false, requestedActionClass: "escalate",
      confidence: 0.82, reasonCodes: ["threshold_exceeded"], proposalCreatedAt: createdAt },
    sensitive: true, prohibitedUse: false,
    policyPackRef: { id: "policy_val_v1", version: "1.0.0" },
    provenanceRef: { modelVersion: "val-v1", ruleSetVersion: "rules-1.0", sourceHash: "sha256:val" },
    approvalRequired: withApproval, approvalArtifact: approval, loggingReady: true,
    controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: `vr-${requestId}` },
    trustState: { trusted: true, trustStateId: `ts-${requestId}` }, createdAt
  };
}

console.log("\nCerbaSeal Audit Export — Validation\n");
console.log(`  Temp log file: ${TEST_LOG_PATH}\n`);

// Generate 3 ALLOW decisions (system actor, no approval, non-fraud workflow)
const r1 = buildRequest("ae-val-001", "transaction_escalation", false);
const r2 = buildRequest("ae-val-002", "transaction_escalation", false);
const r3 = buildRequest("ae-val-003", "transaction_escalation", false);

// Generate 1 ALLOW via approval
const r4 = buildRequest("ae-val-004", "transaction_escalation", true);

// For fraud_triage (always requires approval), generate a HOLD
const r5 = buildRequest("ae-val-005", "fraud_triage", false);

for (const req of [r1, r2, r3, r4]) {
  const result = gate.evaluate(req);
  evidenceService.createBundle({ request: req, gateResult: result });
}
const holdResult = gate.evaluate(r5);
evidenceService.createBundle({ request: r5, gateResult: holdResult });

// Now parse and analyze the log
let entries;
try {
  entries = parseJsonlLog(TEST_LOG_PATH);
} catch (err) {
  console.error(`Fatal: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
}

check("Log file parsed successfully", entries.length > 0, `got ${entries.length} entries`);
check("Log has at least 5 entries (one per request evaluated)", entries.length >= 5);

const summary = buildAuditSummary(entries);

check("Summary totalEntries matches parsed count", summary.totalEntries === entries.length);
check("Chain valid", summary.chainValid);
check("Unique requests tracked", summary.uniqueRequests >= 5);
check("REQUEST_EVALUATED events recorded", summary.decisionsCaptured >= 5);
check("RELEASE_AUTHORIZED events recorded for ALLOW decisions", summary.releasesAuthorized >= 4);
check("ACTION_BLOCKED events recorded for HOLD decision", summary.actionsBlocked >= 1);

const report = formatTextReport(summary, TEST_LOG_PATH);
check("Text report contains chain valid indicator", report.includes("YES"));
check("Text report contains event type breakdown", report.includes("REQUEST_EVALUATED"));
check("Text report contains release authorized count", report.includes("RELEASE_AUTHORIZED"));

// Verify chain explicitly
check("All REQUEST_EVALUATED requestIds appear in byRequestId map",
  ["ae-val-001", "ae-val-002", "ae-val-003"].every(id => id in summary.byRequestId));

// Verify error on missing file
let missingFileErr = "";
try {
  parseJsonlLog("/tmp/__cerbaseal_nonexistent_file_xyz.jsonl");
} catch (err) {
  missingFileErr = err instanceof Error ? err.message : "error";
}
check("parseJsonlLog throws on missing file", missingFileErr.includes("not found"));

console.log(`\nValidation complete: ${passed} passed, ${failed} failed\n`);
cleanup();
process.exit(failed > 0 ? 1 : 0);
