import { createHash } from "node:crypto";
import type {
  AuditEventPayload,
  AuditLogEntry
} from "../../domain/types/audit.js";

function nowIso(): string {
  return new Date().toISOString();
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  const objectValue = value as Record<string, unknown>;
  const keys = Object.keys(objectValue).sort();
  const pairs = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(objectValue[key])}`);
  return `{${pairs.join(",")}}`;
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export class AppendOnlyLogService {
  private readonly entries: AuditLogEntry[] = [];

  append(event: AuditEventPayload): AuditLogEntry {
    const previous = this.entries.at(-1) ?? null;
    const timestamp = nowIso();
    const payloadHash = sha256(stableStringify(event.payload));
    const previousHash = previous?.entryHash ?? null;
    const eventId = `evt_${this.entries.length + 1}`;

    const entryHash = sha256(
      stableStringify({
        eventId,
        requestId: event.requestId,
        eventType: event.eventType,
        timestamp,
        payloadHash,
        previousHash
      })
    );

    const entry: AuditLogEntry = {
      eventId,
      requestId: event.requestId,
      eventType: event.eventType,
      timestamp,
      payloadHash,
      previousHash,
      entryHash
    };

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
    let previousHash: string | null = null;

    for (const entry of this.entries) {
      const reconstructed = sha256(
        stableStringify({
          eventId: entry.eventId,
          requestId: entry.requestId,
          eventType: entry.eventType,
          timestamp: entry.timestamp,
          payloadHash: entry.payloadHash,
          previousHash
        })
      );

      if (entry.previousHash !== previousHash) {
        return false;
      }

      if (entry.entryHash !== reconstructed) {
        return false;
      }

      previousHash = entry.entryHash;
    }

    return true;
  }
}
