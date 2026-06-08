/**
 * Validation script for the CerbaSeal Audit Export starter kit.
 * Generates both a decisions.jsonl and an audit chain JSONL using live
 * gate evaluations, then runs the export functions and verifies all
 * required reporting dimensions (outcome, actor, workflow class).
 *
 * Run: pnpm tsx examples/audit-export/validate-audit-export.ts
 * Expected output: all checks PASS, exit code 0
 */

import { fileURLToPath } from "node:url";
import { unlinkSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  parseDecisionLog, parseAuditChainLog, buildAuditSummary,
  formatTextReport, writeDecisionRecord, verifyAuditChain
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
const DECISIONS_PATH = join(tmpdir(), `cerbaseal-decisions-${stamp}.jsonl`);
const CHAIN_PATH = join(tmpdir(), `cerbaseal-chain-${stamp}.jsonl`);

function cleanup(): void {
  for (const p of [DECISIONS_PATH, CHAIN_PATH]) {
    if (existsSync(p)) { try { unlinkSync(p); } catch { /* ignore */ } }
  }
}
process.on("exit", cleanup);
process.on("SIGINT", () => { cleanup(); process.exit(1); });

const config = loadCerbaSealConfig();
const gate = new ExecutionGateService(config);
const logService = new FileBackedAppendOnlyLogService(CHAIN_PATH);
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
console.log(`  Decisions file: ${DECISIONS_PATH}`);
console.log(`  Chain log file: ${CHAIN_PATH}\n`);

// Generate 3 ALLOW decisions: different actors + workflow classes
const requests = [
  buildRequest("ae-001", "transaction_escalation", "governance-system", "system", false),
  buildRequest("ae-002", "transaction_escalation", "governance-system", "system", false),
  buildRequest("ae-003", "transaction_escalation", "risk-orchestrator", "system", false),
  // approval workflow: analyst submits, reviewer approves
  buildRequest("ae-004", "transaction_escalation", "analyst-jane-001", "analyst", true),
  // fraud_triage always requires approval → HOLD
  buildRequest("ae-005", "fraud_triage", "governance-system", "system", false),
];

for (const req of requests) {
  const result = gate.evaluate(req);
  evidenceService.createBundle({ request: req, gateResult: result });
  writeDecisionRecord(DECISIONS_PATH, req, result);
}

// Parse decisions log
let decisions;
try {
  decisions = parseDecisionLog(DECISIONS_PATH);
} catch (err) {
  console.error(`Fatal: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
}

check("Decisions log parsed: 5 records", decisions.length === 5);

// Parse chain log
let chainEntries;
try {
  chainEntries = parseAuditChainLog(CHAIN_PATH);
} catch (err) {
  console.error(`Fatal: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
}

check("Chain log parsed: entries present", chainEntries.length > 0);
check("Chain log integrity valid", verifyAuditChain(chainEntries));

// Build summary
const summary = buildAuditSummary(decisions, chainEntries);

// Outcome grouping: ae-001/002/003 → ALLOW, ae-004 → ALLOW (approval), ae-005 → HOLD
check("byFinalState has ALLOW decisions", (summary.byFinalState["ALLOW"] ?? 0) >= 4);
check("byFinalState has HOLD decisions", (summary.byFinalState["HOLD"] ?? 0) >= 1);
check("byFinalState does not include REJECT for these requests", !("REJECT" in summary.byFinalState));

// Workflow class grouping
check("byWorkflowClass has transaction_escalation entries", "transaction_escalation" in summary.byWorkflowClass);
check("byWorkflowClass has fraud_triage entries", "fraud_triage" in summary.byWorkflowClass);
check("transaction_escalation has 4 decisions", summary.byWorkflowClass["transaction_escalation"] === 4);
check("fraud_triage has 1 decision", summary.byWorkflowClass["fraud_triage"] === 1);

// Actor authority class grouping
check("byActorAuthorityClass has system entries", "system" in summary.byActorAuthorityClass);
check("byActorAuthorityClass has analyst entries", "analyst" in summary.byActorAuthorityClass);
check("system actor: 4 decisions", summary.byActorAuthorityClass["system"] === 4);
check("analyst actor: 1 decision", summary.byActorAuthorityClass["analyst"] === 1);

// Actor ID grouping
check("byActorId has governance-system entries", "governance-system" in summary.byActorId);
check("byActorId has risk-orchestrator entries", "risk-orchestrator" in summary.byActorId);
check("byActorId has analyst-jane-001 entries", "analyst-jane-001" in summary.byActorId);

// Chain verification in summary
check("summary.chainVerified is true", summary.chainVerified === true);
check("summary.rawEntries matches parsed count", summary.rawEntries === chainEntries.length);
check("summary.totalDecisions is 5", summary.totalDecisions === 5);

// Text report
const report = formatTextReport(summary, DECISIONS_PATH, CHAIN_PATH);
check("Report contains chain validity YES", report.includes("YES"));
check("Report contains By Decision Outcome section", report.includes("By Decision Outcome"));
check("Report contains By Workflow Class section", report.includes("By Workflow Class"));
check("Report contains By Actor Authority Class section", report.includes("By Actor Authority Class"));
check("Report contains By Actor ID section", report.includes("By Actor ID"));
check("Report contains ALLOW", report.includes("ALLOW"));
check("Report contains HOLD", report.includes("HOLD"));
check("Report contains transaction_escalation", report.includes("transaction_escalation"));
check("Report contains fraud_triage", report.includes("fraud_triage"));
check("Report contains system authority class", report.includes("system"));
check("Report contains analyst authority class", report.includes("analyst"));

// Error handling
let missingErr = "";
try { parseDecisionLog("/tmp/__cerbaseal_nonexistent_xyz.jsonl"); } catch (err) {
  missingErr = err instanceof Error ? err.message : "error";
}
check("parseDecisionLog throws on missing file", missingErr.includes("not found"));

console.log(`\nValidation complete: ${passed} passed, ${failed} failed\n`);
cleanup();
process.exit(failed > 0 ? 1 : 0);
