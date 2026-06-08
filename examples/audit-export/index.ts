/**
 * CerbaSeal Audit Export
 *
 * Pattern: Read the JSONL audit log produced by FileBackedAppendOnlyLogService,
 * verify hash chain integrity, and export a formatted evidence report.
 *
 * Use when:
 *   - A compliance reviewer needs a summary of decisions and chain integrity
 *   - You need to feed CerbaSeal audit data into a SIEM or log aggregator
 *   - You want to verify that the audit log has not been tampered with
 *
 * HOW THE AUDIT LOG IS PRODUCED:
 *   FileBackedAppendOnlyLogService appends one AuditLogEntry per event.
 *   EvidenceBundleService triggers 3–4 entries per gate evaluation:
 *     REQUEST_EVALUATED → decision submitted to gate
 *     RELEASE_AUTHORIZED → ALLOW outcome (present only on ALLOW)
 *     ACTION_BLOCKED → HOLD or REJECT outcome (present only on HOLD/REJECT)
 *     EVIDENCE_BUNDLE_CREATED → bundle sealed
 *
 * WHAT IS IN EACH ENTRY:
 *   eventId, requestId, eventType, timestamp, payloadHash, previousHash, entryHash
 *   The payloadHash is a one-way hash of the event payload — the payload itself
 *   is not stored inline. Chain integrity is verifiable from the entry fields alone.
 *
 * OUTCOME INFERENCE FROM eventType:
 *   RELEASE_AUTHORIZED → ALLOW decision
 *   ACTION_BLOCKED → HOLD or REJECT decision
 *   (workflowClass and actorId are not stored in AuditLogEntry; see README for
 *    how to produce richer reports using the optional evidence bundle path)
 *
 * Usage:
 *   pnpm tsx examples/audit-export/index.ts audit.jsonl [evidence-log.jsonl]
 *
 * To validate: pnpm tsx examples/audit-export/validate-audit-export.ts
 */

import { readFileSync, existsSync, appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { AuditLogEntry, AuditEventType, EvidenceBundle } from "../../src/domain/types/audit.js";
import { verifyChain as coreVerifyChain } from "../../src/services/audit/audit-hash-utils.js";

export { type AuditLogEntry, type EvidenceBundle };

/**
 * Read and parse a JSONL file produced by FileBackedAppendOnlyLogService.
 * Each line is a JSON-serialized AuditLogEntry.
 */
export function parseAuditLog(filePath: string): AuditLogEntry[] {
  if (!existsSync(filePath)) {
    throw new Error(`Audit log file not found: ${filePath}`);
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

/**
 * Verify the hash chain of a list of AuditLogEntry objects.
 * Uses the same algorithm as FileBackedAppendOnlyLogService.verifyChain().
 */
export function verifyAuditChain(entries: AuditLogEntry[]): boolean {
  return coreVerifyChain(entries);
}

export interface AuditSummary {
  totalEntries: number;
  chainValid: boolean;
  uniqueRequests: number;
  byEventType: Partial<Record<AuditEventType, number>>;
  inferredOutcomes: {
    allow: number;
    blocked: number;
    unknown: number;
  };
  byWorkflowClass: Record<string, number> | null;
  byActorAuthorityClass: Record<string, number> | null;
  byActorId: Record<string, number> | null;
  evidenceBundlesAvailable: boolean;
}

/**
 * Append one EvidenceBundle to an optional enrichment JSONL file.
 * Use this alongside FileBackedAppendOnlyLogService to enable richer
 * per-workflow and per-actor reporting. See README for details.
 */
export function writeEvidenceBundle(filePath: string, bundle: EvidenceBundle): void {
  appendFileSync(filePath, JSON.stringify(bundle) + "\n", "utf-8");
}

/**
 * Read an evidence bundle enrichment JSONL file.
 * Each line is a JSON-serialized EvidenceBundle.
 */
export function parseEvidenceBundleLog(filePath: string): EvidenceBundle[] {
  if (!existsSync(filePath)) {
    throw new Error(`Evidence bundle log not found: ${filePath}`);
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

/**
 * Build a summary report from AuditLogEntry records.
 * Optionally enriched with EvidenceBundle records for workflow/actor grouping.
 *
 * Without bundles: reports event type counts, inferred outcomes (from eventType),
 * unique request count, and chain integrity.
 *
 * With bundles: additionally reports counts by workflowClass, actorAuthorityClass,
 * and actorId (fields not available in raw AuditLogEntry).
 */
export function buildAuditSummary(
  entries: AuditLogEntry[],
  bundles: EvidenceBundle[] | null
): AuditSummary {
  const byEventType: Partial<Record<AuditEventType, number>> = {};
  const uniqueRequestIds = new Set<string>();

  for (const entry of entries) {
    byEventType[entry.eventType] = (byEventType[entry.eventType] ?? 0) + 1;
    uniqueRequestIds.add(entry.requestId);
  }

  const inferredOutcomes = {
    allow: byEventType["RELEASE_AUTHORIZED"] ?? 0,
    blocked: byEventType["ACTION_BLOCKED"] ?? 0,
    unknown: (byEventType["REQUEST_EVALUATED"] ?? 0)
      - (byEventType["RELEASE_AUTHORIZED"] ?? 0)
      - (byEventType["ACTION_BLOCKED"] ?? 0)
  };

  let byWorkflowClass: Record<string, number> | null = null;
  let byActorAuthorityClass: Record<string, number> | null = null;
  let byActorId: Record<string, number> | null = null;

  if (bundles !== null && bundles.length > 0) {
    byWorkflowClass = {};
    byActorAuthorityClass = {};
    byActorId = {};

    for (const bundle of bundles) {
      const wf = bundle.decisionEnvelope.workflowClass;
      const cls = bundle.request.actorAuthorityClass;
      const aid = bundle.request.actorId;

      byWorkflowClass[wf] = (byWorkflowClass[wf] ?? 0) + 1;
      byActorAuthorityClass[cls] = (byActorAuthorityClass[cls] ?? 0) + 1;
      byActorId[aid] = (byActorId[aid] ?? 0) + 1;
    }
  }

  return {
    totalEntries: entries.length,
    chainValid: verifyAuditChain(entries),
    uniqueRequests: uniqueRequestIds.size,
    byEventType,
    inferredOutcomes,
    byWorkflowClass,
    byActorAuthorityClass,
    byActorId,
    evidenceBundlesAvailable: bundles !== null
  };
}

export function formatTextReport(
  summary: AuditSummary,
  auditPath: string,
  bundlePath: string | null
): string {
  const lines: string[] = [];
  lines.push("═══════════════════════════════════════════════════════════");
  lines.push("  CerbaSeal Audit Log Evidence Summary");
  lines.push("═══════════════════════════════════════════════════════════");
  lines.push(`  Audit log        : ${auditPath}`);
  if (bundlePath) lines.push(`  Evidence bundles : ${bundlePath}`);
  lines.push(`  Total entries    : ${summary.totalEntries}`);
  lines.push(`  Unique requests  : ${summary.uniqueRequests}`);
  lines.push(`  Chain valid      : ${summary.chainValid ? "YES ✓" : "NO — INTEGRITY FAILURE"}`);
  lines.push("");

  lines.push("  Inferred Decision Outcomes (from event types):");
  lines.push(`    ALLOW   (RELEASE_AUTHORIZED)  : ${summary.inferredOutcomes.allow}`);
  lines.push(`    BLOCKED (ACTION_BLOCKED)       : ${summary.inferredOutcomes.blocked}`);
  if (summary.inferredOutcomes.unknown > 0) {
    lines.push(`    UNKNOWN                        : ${summary.inferredOutcomes.unknown}`);
  }
  lines.push("");

  lines.push("  By Event Type:");
  for (const [type, count] of Object.entries(summary.byEventType)) {
    lines.push(`    ${type.padEnd(36)} ${count}`);
  }
  lines.push("");

  if (summary.byWorkflowClass !== null) {
    lines.push("  By Workflow Class:");
    for (const [wf, count] of Object.entries(summary.byWorkflowClass)) {
      lines.push(`    ${wf.padEnd(36)} ${count}`);
    }
    lines.push("");
  }

  if (summary.byActorAuthorityClass !== null) {
    lines.push("  By Actor Authority Class:");
    for (const [cls, count] of Object.entries(summary.byActorAuthorityClass)) {
      lines.push(`    ${cls.padEnd(36)} ${count}`);
    }
    lines.push("");
  }

  if (summary.byActorId !== null) {
    lines.push("  By Actor ID:");
    for (const [actor, count] of Object.entries(summary.byActorId)) {
      lines.push(`    ${actor.padEnd(36)} ${count}`);
    }
    lines.push("");
  }

  if (!summary.evidenceBundlesAvailable) {
    lines.push("  Note: workflowClass, actorId, and actorAuthorityClass dimensions");
    lines.push("  require the evidence bundle log. See README for how to produce it.");
    lines.push("");
  }

  lines.push("═══════════════════════════════════════════════════════════");
  return lines.join("\n");
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  const auditPath = process.argv[2]?.trim() || "";
  const bundlePath = process.argv[3]?.trim() || null;

  if (!auditPath) {
    console.error("\nUsage: pnpm tsx examples/audit-export/index.ts <audit.jsonl> [evidence-log.jsonl]\n");
    process.exit(1);
  }

  let entries: AuditLogEntry[];
  try {
    console.log(`\nReading audit log: ${auditPath}`);
    entries = parseAuditLog(auditPath);
    console.log(`Parsed ${entries.length} entries\n`);
  } catch (err) {
    console.error(`\nFailed: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }

  let bundles: EvidenceBundle[] | null = null;
  if (bundlePath) {
    try {
      console.log(`Reading evidence bundles: ${bundlePath}`);
      bundles = parseEvidenceBundleLog(bundlePath);
      console.log(`Parsed ${bundles.length} evidence bundles\n`);
    } catch (err) {
      console.error(`\nFailed to read evidence bundles: ${err instanceof Error ? err.message : err}`);
      process.exit(1);
    }
  }

  const summary = buildAuditSummary(entries, bundles);

  console.log(formatTextReport(summary, auditPath, bundlePath));
  console.log("\nJSON Summary:");
  console.log(JSON.stringify(summary, null, 2));

  if (!summary.chainValid) {
    console.error("\nERROR: Audit chain integrity check failed. Log may have been tampered with.");
    process.exit(1);
  }
}
