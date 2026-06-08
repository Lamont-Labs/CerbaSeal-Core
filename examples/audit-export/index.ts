/**
 * CerbaSeal Audit Export
 *
 * Pattern: Read a JSONL decision log produced by CerbaSeal gate evaluations
 * and export a formatted evidence report grouped by workflow, actor, and outcome.
 *
 * Use when:
 *   - A compliance reviewer needs an evidence summary grouped by workflow class,
 *     actor authority, and decision outcome
 *   - You need to feed CerbaSeal decision data into a SIEM, log aggregator, or
 *     compliance reporting tool
 *   - You want to verify audit chain integrity on a raw AuditLogEntry JSONL file
 *
 * TWO LOG FILES:
 *
 * CerbaSeal produces two JSONL files per deployment:
 *
 *   1. audit.jsonl — raw AuditLogEntry chain (from FileBackedAppendOnlyLogService).
 *      Contains: eventId, requestId, eventType, payloadHash, hash chain fields.
 *      Use for: tamper detection (verifyChain), compliance immutability proof.
 *
 *   2. decisions.jsonl — enriched AuditDecisionRecord entries written after each
 *      gate evaluation. Contains: workflowClass, actorId, actorAuthorityClass,
 *      finalState, reasonCodes. Use for: grouping, reporting, dashboards.
 *
 * This script reads and reports on BOTH files. Pass either one or both as args.
 *
 * Usage:
 *   pnpm tsx examples/audit-export/index.ts [decisions.jsonl] [audit.jsonl]
 *   pnpm tsx examples/audit-export/index.ts decisions.jsonl          # report only
 *   pnpm tsx examples/audit-export/index.ts "" audit.jsonl           # chain check only
 *
 * To validate: pnpm tsx examples/audit-export/validate-audit-export.ts
 */

import { readFileSync, existsSync, appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { AuditLogEntry } from "../../src/domain/types/audit.js";
import type { GateResult, GovernedRequest } from "../../src/domain/types/core.js";

/**
 * Enriched decision record written after each gate evaluation.
 * This is the reporting layer — separate from the immutable hash-chain audit log.
 * Write one record per gate.evaluate() call using writeDecisionRecord().
 */
export interface AuditDecisionRecord {
  requestId: string;
  workflowClass: string;
  actorId: string;
  actorAuthorityClass: string;
  proposedActionClass: string;
  finalState: "ALLOW" | "HOLD" | "REJECT";
  reasonCodes: string[];
  humanApprovalRequired: boolean;
  approverId: string | null;
  evidenceBundleId: string;
  envelopeId: string;
  decidedAt: string;
}

/**
 * Write an AuditDecisionRecord to a JSONL decisions file after each gate evaluation.
 * Call this alongside evidenceService.createBundle() in your deployment.
 *
 * Example:
 *   const result = gate.evaluate(request);
 *   const bundle = evidenceService.createBundle({ request, gateResult: result });
 *   writeDecisionRecord("./decisions.jsonl", request, result);
 */
export function writeDecisionRecord(
  filePath: string,
  request: GovernedRequest,
  gateResult: GateResult
): void {
  const record: AuditDecisionRecord = {
    requestId: request.requestId,
    workflowClass: request.workflowClass,
    actorId: request.actorId,
    actorAuthorityClass: request.actorAuthorityClass,
    proposedActionClass: request.proposedActionClass,
    finalState: gateResult.decisionEnvelope.finalState,
    reasonCodes: gateResult.blockedActionRecord?.reasonCodes ?? gateResult.decisionEnvelope.trace.reasonCodes,
    humanApprovalRequired: gateResult.decisionEnvelope.humanApprovalRequired,
    approverId: request.approvalArtifact?.approverId ?? null,
    evidenceBundleId: gateResult.decisionEnvelope.evidenceBundleId,
    envelopeId: gateResult.decisionEnvelope.envelopeId,
    decidedAt: gateResult.decisionEnvelope.issuedAt
  };
  appendFileSync(filePath, JSON.stringify(record) + "\n", "utf-8");
}

export interface AuditSummary {
  totalDecisions: number;
  byFinalState: Record<string, number>;
  byWorkflowClass: Record<string, number>;
  byActorAuthorityClass: Record<string, number>;
  byActorId: Record<string, number>;
  chainVerified: boolean | null;
  rawEntries: number | null;
}

export function parseDecisionLog(filePath: string): AuditDecisionRecord[] {
  if (!existsSync(filePath)) {
    throw new Error(`Decision log file not found: ${filePath}`);
  }
  const raw = readFileSync(filePath, "utf-8");
  const lines = raw.split("\n").filter(line => line.trim().length > 0);
  return lines.map((line, i) => {
    try {
      return JSON.parse(line) as AuditDecisionRecord;
    } catch {
      throw new Error(`Invalid JSON on line ${i + 1} of ${filePath}`);
    }
  });
}

export function parseAuditChainLog(filePath: string): AuditLogEntry[] {
  if (!existsSync(filePath)) {
    throw new Error(`Audit chain log file not found: ${filePath}`);
  }
  const raw = readFileSync(filePath, "utf-8");
  const lines = raw.split("\n").filter(line => line.trim().length > 0);
  return lines.map((line, i) => {
    try {
      return JSON.parse(line) as AuditLogEntry;
    } catch {
      throw new Error(`Invalid JSON on line ${i + 1} of ${filePath}`);
    }
  });
}

export function verifyAuditChain(entries: AuditLogEntry[]): boolean {
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]!;
    if (i === 0) {
      if (entry.previousHash !== null) return false;
    } else {
      const prev = entries[i - 1]!;
      if (entry.previousHash !== prev.entryHash) return false;
    }
  }
  return true;
}

export function buildAuditSummary(
  decisions: AuditDecisionRecord[],
  chainEntries: AuditLogEntry[] | null
): AuditSummary {
  const byFinalState: Record<string, number> = {};
  const byWorkflowClass: Record<string, number> = {};
  const byActorAuthorityClass: Record<string, number> = {};
  const byActorId: Record<string, number> = {};

  for (const d of decisions) {
    byFinalState[d.finalState] = (byFinalState[d.finalState] ?? 0) + 1;
    byWorkflowClass[d.workflowClass] = (byWorkflowClass[d.workflowClass] ?? 0) + 1;
    byActorAuthorityClass[d.actorAuthorityClass] = (byActorAuthorityClass[d.actorAuthorityClass] ?? 0) + 1;
    byActorId[d.actorId] = (byActorId[d.actorId] ?? 0) + 1;
  }

  const chainVerified = chainEntries !== null ? verifyAuditChain(chainEntries) : null;

  return {
    totalDecisions: decisions.length,
    byFinalState,
    byWorkflowClass,
    byActorAuthorityClass,
    byActorId,
    chainVerified,
    rawEntries: chainEntries?.length ?? null
  };
}

export function formatTextReport(
  summary: AuditSummary,
  decisionsPath: string,
  chainPath: string | null
): string {
  const lines: string[] = [];
  lines.push("═══════════════════════════════════════════════════════════");
  lines.push("  CerbaSeal Audit Evidence Summary");
  lines.push("═══════════════════════════════════════════════════════════");
  lines.push(`  Decisions file   : ${decisionsPath}`);
  if (chainPath) {
    lines.push(`  Chain log file   : ${chainPath}`);
    lines.push(`  Chain valid      : ${summary.chainVerified === true ? "YES ✓" : summary.chainVerified === false ? "NO — INTEGRITY FAILURE" : "not checked"}`);
    lines.push(`  Raw log entries  : ${summary.rawEntries ?? "—"}`);
  }
  lines.push(`  Total decisions  : ${summary.totalDecisions}`);
  lines.push("");

  lines.push("  By Decision Outcome:");
  for (const [state, count] of Object.entries(summary.byFinalState)) {
    const bar = "█".repeat(Math.min(count, 20));
    lines.push(`    ${state.padEnd(8)} ${String(count).padStart(4)}  ${bar}`);
  }
  lines.push("");

  lines.push("  By Workflow Class:");
  for (const [wf, count] of Object.entries(summary.byWorkflowClass)) {
    lines.push(`    ${wf.padEnd(32)} ${count}`);
  }
  lines.push("");

  lines.push("  By Actor Authority Class:");
  for (const [cls, count] of Object.entries(summary.byActorAuthorityClass)) {
    lines.push(`    ${cls.padEnd(32)} ${count}`);
  }
  lines.push("");

  lines.push("  By Actor ID:");
  for (const [actor, count] of Object.entries(summary.byActorId)) {
    lines.push(`    ${actor.padEnd(32)} ${count}`);
  }
  lines.push("═══════════════════════════════════════════════════════════");
  return lines.join("\n");
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  const decisionsPath = process.argv[2]?.trim() || "./decisions.jsonl";
  const chainPath = process.argv[3]?.trim() || null;

  let decisions: AuditDecisionRecord[] = [];
  let chainEntries: AuditLogEntry[] | null = null;

  if (decisionsPath) {
    try {
      decisions = parseDecisionLog(decisionsPath);
      console.log(`\nRead ${decisions.length} decision records from ${decisionsPath}`);
    } catch (err) {
      console.error(`\nFailed to read decisions file: ${err instanceof Error ? err.message : err}`);
      process.exit(1);
    }
  }

  if (chainPath) {
    try {
      chainEntries = parseAuditChainLog(chainPath);
      console.log(`Read ${chainEntries.length} audit chain entries from ${chainPath}`);
    } catch (err) {
      console.error(`\nFailed to read chain log file: ${err instanceof Error ? err.message : err}`);
      process.exit(1);
    }
  }

  const summary = buildAuditSummary(decisions, chainEntries);

  console.log("\n" + formatTextReport(summary, decisionsPath, chainPath));
  console.log("\nJSON Summary:");
  console.log(JSON.stringify(summary, null, 2));

  if (summary.chainVerified === false) {
    console.error("\nERROR: Audit chain integrity check failed. Log may have been tampered with.");
    process.exit(1);
  }
}
