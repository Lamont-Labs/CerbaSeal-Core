/**
 * CerbaSeal Audit Core
 *
 * Append-only audit log with SHA-256 hash chaining.
 * All governance events are recorded here. Entries cannot be modified
 * or deleted via the public API. Chain integrity is verifiable at any time.
 *
 * This implementation is in-memory. For persistence across restarts, use
 * FileBackedAppendOnlyLogService from ./file-backed-append-only-log-service.ts.
 */

import type {
  AuditEventPayload,
  AuditLogEntry
} from "../../domain/types/audit.js";
import {
  buildEntry,
  deepClone,
  verifyChain as verifyChainUtil
} from "./audit-hash-utils.js";

function nowIso(): string {
  return new Date().toISOString();
}

export interface IAuditLogService {
  append(event: AuditEventPayload): AuditLogEntry;
  list(): AuditLogEntry[];
  listByRequestId(requestId: string): AuditLogEntry[];
  verifyChain(): boolean;
}

export class AppendOnlyLogService implements IAuditLogService {
  private readonly entries: AuditLogEntry[] = [];

  append(event: AuditEventPayload): AuditLogEntry {
    const entry = buildEntry({
      entries: this.entries,
      event,
      timestamp: nowIso()
    });
    this.entries.push(entry);
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
