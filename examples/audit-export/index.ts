/**
 * CerbaSeal Audit Export
 *
 * Pattern: Read a persisted CerbaSeal evidence bundle log and export a
 * formatted evidence report grouped by workflow class, actor authority,
 * actor ID, and decision outcome.
 *
 * Use when:
 *   - A compliance reviewer needs an evidence summary showing decisions by
 *     workflow, actor, and outcome
 *   - You need to feed CerbaSeal decision data into a SIEM, log aggregator,
 *     or compliance dashboard
 *   - You want structured JSON output for downstream reporting tooling
 *
 * HOW TO PRODUCE THE INPUT FILE:
 *
 * After each gate evaluation, call writeEvidenceBundle() to persist the
 * EvidenceBundle to a JSONL file. Each line is one JSON-serialized bundle:
 *
 *   const result = gate.evaluate(request);
 *   const bundle = evidenceService.createBundle({ request, gateResult: result });
 *   writeEvidenceBundle("./evidence-log.jsonl", bundle);
 *
 * The EvidenceBundle is CerbaSeal's canonical decision artifact — it contains
 * the full GovernedRequest (workflowClass, actorId, actorAuthorityClass),
 * the DecisionEnvelope (finalState, envelopeId), and the hash-verified event
 * chain. This is the single file the audit export consumes.
 *
 * Usage:
 *   pnpm tsx examples/audit-export/index.ts [evidence-log.jsonl]
 *
 * To validate: pnpm tsx examples/audit-export/validate-audit-export.ts
 */

import { readFileSync, existsSync, appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { EvidenceBundle } from "../../src/domain/types/audit.js";

export { type EvidenceBundle };

/**
 * Append one EvidenceBundle to a JSONL evidence log file.
 * Call this after every evidenceService.createBundle() call in your deployment.
 */
export function writeEvidenceBundle(filePath: string, bundle: EvidenceBundle): void {
  appendFileSync(filePath, JSON.stringify(bundle) + "\n", "utf-8");
}

/**
 * Read and parse a JSONL evidence log file.
 * Each line must be a JSON-serialized EvidenceBundle.
 */
export function parseEvidenceBundleLog(filePath: string): EvidenceBundle[] {
  if (!existsSync(filePath)) {
    throw new Error(`Evidence bundle log file not found: ${filePath}`);
  }
  const raw = readFileSync(filePath, "utf-8");
  const lines = raw.split("\n").filter(line => line.trim().length > 0);
  return lines.map((line, i) => {
    try {
      return JSON.parse(line) as EvidenceBundle;
    } catch {
      throw new Error(`Invalid JSON on line ${i + 1} of ${filePath}`);
    }
  });
}

export interface AuditSummary {
  totalDecisions: number;
  byFinalState: Record<string, number>;
  byWorkflowClass: Record<string, number>;
  byActorAuthorityClass: Record<string, number>;
  byActorId: Record<string, number>;
  allowCount: number;
  holdCount: number;
  rejectCount: number;
}

/**
 * Build a grouped summary from a list of EvidenceBundles.
 * Groups by: decision outcome (finalState), workflow class, actor authority
 * class, and actor ID.
 */
export function buildAuditSummary(bundles: EvidenceBundle[]): AuditSummary {
  const byFinalState: Record<string, number> = {};
  const byWorkflowClass: Record<string, number> = {};
  const byActorAuthorityClass: Record<string, number> = {};
  const byActorId: Record<string, number> = {};

  for (const bundle of bundles) {
    const finalState = bundle.decisionEnvelope.finalState;
    const workflowClass = bundle.decisionEnvelope.workflowClass;
    const actorAuthorityClass = bundle.request.actorAuthorityClass;
    const actorId = bundle.request.actorId;

    byFinalState[finalState] = (byFinalState[finalState] ?? 0) + 1;
    byWorkflowClass[workflowClass] = (byWorkflowClass[workflowClass] ?? 0) + 1;
    byActorAuthorityClass[actorAuthorityClass] = (byActorAuthorityClass[actorAuthorityClass] ?? 0) + 1;
    byActorId[actorId] = (byActorId[actorId] ?? 0) + 1;
  }

  return {
    totalDecisions: bundles.length,
    byFinalState,
    byWorkflowClass,
    byActorAuthorityClass,
    byActorId,
    allowCount: byFinalState["ALLOW"] ?? 0,
    holdCount: byFinalState["HOLD"] ?? 0,
    rejectCount: byFinalState["REJECT"] ?? 0
  };
}

export function formatTextReport(summary: AuditSummary, filePath: string): string {
  const lines: string[] = [];
  lines.push("═══════════════════════════════════════════════════════════");
  lines.push("  CerbaSeal Audit Evidence Summary");
  lines.push("═══════════════════════════════════════════════════════════");
  lines.push(`  Source file      : ${filePath}`);
  lines.push(`  Total decisions  : ${summary.totalDecisions}`);
  lines.push(`  ALLOW            : ${summary.allowCount}`);
  lines.push(`  HOLD             : ${summary.holdCount}`);
  lines.push(`  REJECT           : ${summary.rejectCount}`);
  lines.push("");

  lines.push("  By Decision Outcome:");
  for (const [state, count] of Object.entries(summary.byFinalState)) {
    const bar = "█".repeat(Math.min(count, 20));
    lines.push(`    ${state.padEnd(8)} ${String(count).padStart(4)}  ${bar}`);
  }
  lines.push("");

  lines.push("  By Workflow Class:");
  for (const [wf, count] of Object.entries(summary.byWorkflowClass)) {
    lines.push(`    ${wf.padEnd(36)} ${count}`);
  }
  lines.push("");

  lines.push("  By Actor Authority Class:");
  for (const [cls, count] of Object.entries(summary.byActorAuthorityClass)) {
    lines.push(`    ${cls.padEnd(36)} ${count}`);
  }
  lines.push("");

  lines.push("  By Actor ID:");
  for (const [actor, count] of Object.entries(summary.byActorId)) {
    lines.push(`    ${actor.padEnd(36)} ${count}`);
  }
  lines.push("═══════════════════════════════════════════════════════════");
  return lines.join("\n");
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  const filePath = process.argv[2]?.trim() || "./evidence-log.jsonl";

  let bundles: EvidenceBundle[];
  try {
    console.log(`\nReading evidence bundle log: ${filePath}\n`);
    bundles = parseEvidenceBundleLog(filePath);
    console.log(`Parsed ${bundles.length} evidence bundle${bundles.length === 1 ? "" : "s"}\n`);
  } catch (err) {
    console.error(`\nFailed: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }

  const summary = buildAuditSummary(bundles);

  console.log(formatTextReport(summary, filePath));
  console.log("\nJSON Summary:");
  console.log(JSON.stringify(summary, null, 2));
}
