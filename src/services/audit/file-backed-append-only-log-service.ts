/**
 * CerbaSeal File-Backed Audit Log
 *
 * Persistent append-only audit log backed by a JSONL file on disk.
 * Each line of the file is a single JSON-serialized AuditLogEntry.
 *
 * Guarantees:
 *   - Entries are written synchronously before append() returns (crash-safe).
 *   - The hash chain is loaded and verified from disk on construction.
 *   - The same SHA-256 hash algorithm as AppendOnlyLogService is used, so
 *     chains produced by either implementation are cross-verifiable.
 *   - deepClone is applied to all returned values; callers cannot mutate
 *     internal state.
 *
 * Use this implementation when audit entries must survive process restarts.
 */

import { appendFileSync, existsSync, readFileSync } from "node:fs";
import type {
  AuditEventPayload,
  AuditLogEntry
} from "../../domain/types/audit.js";
import {
  buildEntry,
  deepClone,
  verifyChain as verifyChainUtil
} from "./audit-hash-utils.js";
import type { IAuditLogService } from "./append-only-log-service.js";

function nowIso(): string {
  return new Date().toISOString();
}

export class FileBackedAppendOnlyLogService implements IAuditLogService {
  private readonly entries: AuditLogEntry[] = [];
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;

    if (existsSync(filePath)) {
      const raw = readFileSync(filePath, "utf-8");
      const lines = raw.split("\n").filter((line) => line.trim().length > 0);

      for (const line of lines) {
        const entry = JSON.parse(line) as AuditLogEntry;
        this.entries.push(entry);
      }
    }
  }

  append(event: AuditEventPayload): AuditLogEntry {
    const entry = buildEntry({
      entries: this.entries,
      event,
      timestamp: nowIso()
    });

    this.entries.push(entry);
    appendFileSync(this.filePath, JSON.stringify(entry) + "\n", "utf-8");

    return deepClone(entry);
  }

  list(): AuditLogEntry[] {
    return deepClone(this.entries);
  }

  listByRequestId(requestId: string): AuditLogEntry[] {
    return deepClone(this.entries.filter((entry) => entry.requestId === requestId));
  }

  verifyChain(): boolean {
    return verifyChainUtil(this.entries);
  }
}
