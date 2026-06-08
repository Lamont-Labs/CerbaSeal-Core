/**
 * CerbaSeal Audit Export
 *
 * Pattern: Read a JSONL audit log produced by FileBackedAppendOnlyLogService
 * and export a formatted evidence summary for compliance reviewers.
 *
 * Use when:
 *   - You need to feed CerbaSeal audit entries into a SIEM, log aggregator,
 *     or compliance reporting tool
 *   - A compliance reviewer needs a human-readable evidence summary
 *   - You want to verify the audit chain integrity on a log file
 *
 * Each line of the JSONL file is a single JSON-serialized AuditLogEntry
 * produced by FileBackedAppendOnlyLogService. This script reads the file,
 * verifies the hash chain, and outputs counts grouped by event type.
 *
 * Usage:
 *   pnpm tsx examples/audit-export/index.ts [path/to/audit.jsonl]
 *
 * To validate: pnpm tsx examples/audit-export/validate-audit-export.ts
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { AuditLogEntry, AuditEventType } from "../../src/domain/types/audit.js";

export interface AuditSummary {
  totalEntries: number;
  chainValid: boolean;
  byEventType: Record<AuditEventType, number>;
  byRequestId: Record<string, AuditEventType[]>;
  uniqueRequests: number;
  decisionsCaptured: number;
  releasesAuthorized: number;
  actionsBlocked: number;
}

export function parseJsonlLog(filePath: string): AuditLogEntry[] {
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

export function buildAuditSummary(entries: AuditLogEntry[]): AuditSummary {
  const byEventType: Record<string, number> = {};
  const byRequestId: Record<string, AuditEventType[]> = {};

  for (const entry of entries) {
    byEventType[entry.eventType] = (byEventType[entry.eventType] ?? 0) + 1;

    if (!byRequestId[entry.requestId]) {
      byRequestId[entry.requestId] = [];
    }
    byRequestId[entry.requestId]!.push(entry.eventType);
  }

  return {
    totalEntries: entries.length,
    chainValid: verifyAuditChain(entries),
    byEventType: byEventType as Record<AuditEventType, number>,
    byRequestId,
    uniqueRequests: Object.keys(byRequestId).length,
    decisionsCaptured: byEventType["REQUEST_EVALUATED"] ?? 0,
    releasesAuthorized: byEventType["RELEASE_AUTHORIZED"] ?? 0,
    actionsBlocked: byEventType["ACTION_BLOCKED"] ?? 0
  };
}

export function formatTextReport(summary: AuditSummary, filePath: string): string {
  const lines: string[] = [];
  lines.push("═══════════════════════════════════════════════════");
  lines.push("  CerbaSeal Audit Log Evidence Summary");
  lines.push("═══════════════════════════════════════════════════");
  lines.push(`  Source          : ${filePath}`);
  lines.push(`  Total entries   : ${summary.totalEntries}`);
  lines.push(`  Unique requests : ${summary.uniqueRequests}`);
  lines.push(`  Chain valid     : ${summary.chainValid ? "YES ✓" : "NO — CHAIN INTEGRITY FAILURE"}`);
  lines.push("");
  lines.push("  Decisions by Event Type:");
  for (const [eventType, count] of Object.entries(summary.byEventType)) {
    lines.push(`    ${eventType.padEnd(30)} ${count}`);
  }
  lines.push("");
  lines.push("  Decision Outcomes:");
  lines.push(`    Evaluated   (REQUEST_EVALUATED)      : ${summary.decisionsCaptured}`);
  lines.push(`    Released    (RELEASE_AUTHORIZED)     : ${summary.releasesAuthorized}`);
  lines.push(`    Blocked     (ACTION_BLOCKED)         : ${summary.actionsBlocked}`);
  lines.push("");
  lines.push(`  Per-Request Breakdown (${summary.uniqueRequests} requests):`);
  for (const [requestId, events] of Object.entries(summary.byRequestId)) {
    lines.push(`    ${requestId}: [${events.join(", ")}]`);
  }
  lines.push("═══════════════════════════════════════════════════");
  return lines.join("\n");
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  const filePath = process.argv[2] ?? "./cerbaseal-audit.jsonl";

  try {
    console.log(`\nReading audit log: ${filePath}\n`);
    const entries = parseJsonlLog(filePath);
    const summary = buildAuditSummary(entries);

    console.log(formatTextReport(summary, filePath));
    console.log("\nJSON Summary:");
    console.log(JSON.stringify(summary, null, 2));

    if (!summary.chainValid) {
      console.error("\nERROR: Audit chain integrity check failed. Log may have been tampered with.");
      process.exit(1);
    }
  } catch (err) {
    console.error(`\nFailed: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}
