/**
 * Validation script for the CerbaSeal Audit Export starter kit.
 * Uses FileBackedAppendOnlyLogService + EvidenceBundleService to generate
 * a real audit JSONL file, then verifies:
 *   - Chain integrity from the raw AuditLogEntry JSONL
 *   - Outcome inference from event types (RELEASE_AUTHORIZED / ACTION_BLOCKED)
 *   - Optional: workflow/actor grouping from evidence bundle JSONL
 *
 * Run: pnpm tsx examples/audit-export/validate-audit-export.ts
 * Expected output: all checks PASS, exit code 0
 */

import { fileURLToPath } from "node:url";
import { unlinkSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  parseAuditLog, parseEvidenceBundleLog,
  buildAuditSummary, formatTextReport,
  writeEvidenceBundle, verifyAuditChain
} from "./index.js";
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

const stamp = Date.now();
const AUDIT_PATH = join(tmpdir(), `cerbaseal-audit-${stamp}.jsonl`);
const BUNDLE_PATH = join(tmpdir(), `cerbaseal-bundles-${stamp}.jsonl`);

function cleanup(): void {
  for (const p of [AUDIT_PATH, BUNDLE_PATH]) {
    if (existsSync(p)) { try { unlinkSync(p); } catch { /* ignore */ } }
  }
}
process.on("exit", cleanup);
process.on("SIGINT", () => { cleanup(); process.exit(1); });

const config = loadCerbaSealConfig();
const gate = new ExecutionGateService(config);
const logService = new FileBackedAppendOnlyLogService(AUDIT_PATH);
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
console.log(`  Audit JSONL    : ${AUDIT_PATH}`);
console.log(`  Bundle JSONL   : ${BUNDLE_PATH}\n`);

// Generate 5 gate evaluations — different actors and workflows
// 3 ALLOW: system, transaction_escalation
// 1 ALLOW: analyst, transaction_escalation (with approval)
// 1 HOLD:  system, fraud_triage (always requires approval → HOLD without it)
const scenarios = [
  buildRequest("ae-001", "transaction_escalation", "governance-system", "system", false),
  buildRequest("ae-002", "transaction_escalation", "governance-system", "system", false),
  buildRequest("ae-003", "transaction_escalation", "risk-orchestrator", "system", false),
  buildRequest("ae-004", "transaction_escalation", "analyst-jane-001", "analyst", true),
  buildRequest("ae-005", "fraud_triage",           "governance-system", "system", false),
];

for (const req of scenarios) {
  const result = gate.evaluate(req);
  const bundle = evidenceService.createBundle({ request: req, gateResult: result });
  // Also persist the bundle for the enriched reporting path
  writeEvidenceBundle(BUNDLE_PATH, bundle);
}

// ── Part 1: Raw AuditLogEntry JSONL (FileBackedAppendOnlyLogService output) ──

let entries;
try {
  entries = parseAuditLog(AUDIT_PATH);
} catch (err) {
  console.error(`Fatal: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
}

// Each scenario generates 3–4 entries:
// ALLOW: REQUEST_EVALUATED + RELEASE_AUTHORIZED + EVIDENCE_BUNDLE_CREATED = 3
// HOLD:  REQUEST_EVALUATED + ACTION_BLOCKED     + EVIDENCE_BUNDLE_CREATED = 3
// (Total: 5 × 3 = 15)
check("Audit JSONL parsed: at least 15 entries (3 per request)", entries.length >= 15);
check("Each entry has eventId", entries.every(e => typeof e.eventId === "string"));
check("Each entry has requestId", entries.every(e => typeof e.requestId === "string"));
check("Each entry has eventType", entries.every(e => typeof e.eventType === "string"));
check("Each entry has timestamp", entries.every(e => typeof e.timestamp === "string"));
check("Each entry has payloadHash", entries.every(e => typeof e.payloadHash === "string"));
check("Each entry has entryHash", entries.every(e => typeof e.entryHash === "string"));

// Chain integrity (using core verifyChain algorithm — same as FileBackedAppendOnlyLogService)
check("verifyAuditChain passes on fresh log", verifyAuditChain(entries));

// Build summary from raw entries only (no bundles)
const rawSummary = buildAuditSummary(entries, null);

check("rawSummary.chainValid is true", rawSummary.chainValid);
check("rawSummary.totalEntries matches parsed count", rawSummary.totalEntries === entries.length);
check("rawSummary.uniqueRequests is 5", rawSummary.uniqueRequests === 5);

// Outcome inference from eventType:
// 4 ALLOW decisions → 4 × RELEASE_AUTHORIZED
// 1 HOLD decision  → 1 × ACTION_BLOCKED
check("Inferred ALLOW count (RELEASE_AUTHORIZED) is 4", rawSummary.inferredOutcomes.allow === 4);
check("Inferred BLOCKED count (ACTION_BLOCKED) is 1", rawSummary.inferredOutcomes.blocked === 1);

// Event type presence
check("byEventType has REQUEST_EVALUATED", (rawSummary.byEventType["REQUEST_EVALUATED"] ?? 0) >= 5);
check("byEventType has RELEASE_AUTHORIZED (ALLOW signal)", (rawSummary.byEventType["RELEASE_AUTHORIZED"] ?? 0) === 4);
check("byEventType has ACTION_BLOCKED (HOLD/REJECT signal)", (rawSummary.byEventType["ACTION_BLOCKED"] ?? 0) === 1);
check("byEventType has EVIDENCE_BUNDLE_CREATED", (rawSummary.byEventType["EVIDENCE_BUNDLE_CREATED"] ?? 0) >= 5);

// Without bundles, workflow/actor grouping is not available
check("rawSummary.byWorkflowClass is null (not in AuditLogEntry)", rawSummary.byWorkflowClass === null);
check("rawSummary.byActorAuthorityClass is null (not in AuditLogEntry)", rawSummary.byActorAuthorityClass === null);
check("rawSummary.byActorId is null (not in AuditLogEntry)", rawSummary.byActorId === null);

// ── Part 2: Enriched summary (raw JSONL + EvidenceBundle enrichment) ──

let bundles;
try {
  bundles = parseEvidenceBundleLog(BUNDLE_PATH);
} catch (err) {
  console.error(`Fatal: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
}

check("Evidence bundle JSONL parsed: 5 bundles", bundles.length === 5);

const enrichedSummary = buildAuditSummary(entries, bundles);

check("enrichedSummary.chainValid is true", enrichedSummary.chainValid);
check("enrichedSummary.evidenceBundlesAvailable is true", enrichedSummary.evidenceBundlesAvailable);

// Workflow class grouping (from bundles)
check("byWorkflowClass: transaction_escalation has 4", enrichedSummary.byWorkflowClass?.["transaction_escalation"] === 4);
check("byWorkflowClass: fraud_triage has 1", enrichedSummary.byWorkflowClass?.["fraud_triage"] === 1);

// Actor authority class grouping
check("byActorAuthorityClass: system has 4", enrichedSummary.byActorAuthorityClass?.["system"] === 4);
check("byActorAuthorityClass: analyst has 1", enrichedSummary.byActorAuthorityClass?.["analyst"] === 1);

// Actor ID grouping
check("byActorId: governance-system present", "governance-system" in (enrichedSummary.byActorId ?? {}));
check("byActorId: analyst-jane-001 present", "analyst-jane-001" in (enrichedSummary.byActorId ?? {}));
check("byActorId: risk-orchestrator present", "risk-orchestrator" in (enrichedSummary.byActorId ?? {}));

// Text reports
const rawReport = formatTextReport(rawSummary, AUDIT_PATH, null);
check("Raw report has Inferred Decision Outcomes", rawReport.includes("Inferred Decision Outcomes"));
check("Raw report has Chain valid YES", rawReport.includes("YES"));
check("Raw report has note about enrichment", rawReport.includes("workflowClass"));

const enrichedReport = formatTextReport(enrichedSummary, AUDIT_PATH, BUNDLE_PATH);
check("Enriched report has By Workflow Class", enrichedReport.includes("By Workflow Class"));
check("Enriched report has By Actor Authority Class", enrichedReport.includes("By Actor Authority Class"));
check("Enriched report shows transaction_escalation", enrichedReport.includes("transaction_escalation"));
check("Enriched report shows fraud_triage", enrichedReport.includes("fraud_triage"));

// Error handling
let missingErr = "";
try { parseAuditLog("/tmp/__cerbaseal_nonexistent_xyz.jsonl"); } catch (err) {
  missingErr = err instanceof Error ? err.message : "error";
}
check("parseAuditLog throws on missing file", missingErr.includes("not found"));

console.log(`\nValidation complete: ${passed} passed, ${failed} failed\n`);
cleanup();
process.exit(failed > 0 ? 1 : 0);
