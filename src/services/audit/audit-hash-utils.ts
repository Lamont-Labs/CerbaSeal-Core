/**
 * CerbaSeal Audit Hash Utilities
 *
 * Shared deterministic hashing primitives used by all audit log implementations.
 * Both the in-memory and file-backed log services must use exactly these functions
 * so that hash chains produced by one can be verified by the other.
 */

import { createHash } from "node:crypto";
import type { AuditEventPayload, AuditLogEntry } from "../../domain/types/audit.js";

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  const objectValue = value as Record<string, unknown>;
  const keys = Object.keys(objectValue).sort();
  const pairs = keys.map(
    (key) => `${JSON.stringify(key)}:${stableStringify(objectValue[key])}`
  );
  return `{${pairs.join(",")}}`;
}

export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function computeEntryHash(args: {
  eventId: string;
  requestId: string;
  eventType: AuditEventPayload["eventType"];
  timestamp: string;
  payloadHash: string;
  previousHash: string | null;
}): string {
  return sha256(
    stableStringify({
      eventId: args.eventId,
      requestId: args.requestId,
      eventType: args.eventType,
      timestamp: args.timestamp,
      payloadHash: args.payloadHash,
      previousHash: args.previousHash
    })
  );
}

export function buildEntry(args: {
  entries: AuditLogEntry[];
  event: AuditEventPayload;
  timestamp: string;
}): AuditLogEntry {
  const previous = args.entries.at(-1) ?? null;
  const payloadHash = sha256(stableStringify(args.event.payload));
  const previousHash = previous?.entryHash ?? null;
  const eventId = `evt_${args.entries.length + 1}`;

  const entryHash = computeEntryHash({
    eventId,
    requestId: args.event.requestId,
    eventType: args.event.eventType,
    timestamp: args.timestamp,
    payloadHash,
    previousHash
  });

  return {
    eventId,
    requestId: args.event.requestId,
    eventType: args.event.eventType,
    timestamp: args.timestamp,
    payloadHash,
    previousHash,
    entryHash
  };
}

export function verifyChain(entries: AuditLogEntry[]): boolean {
  let previousHash: string | null = null;

  for (const entry of entries) {
    const reconstructed = computeEntryHash({
      eventId: entry.eventId,
      requestId: entry.requestId,
      eventType: entry.eventType,
      timestamp: entry.timestamp,
      payloadHash: entry.payloadHash,
      previousHash
    });

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
