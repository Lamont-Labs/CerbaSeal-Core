/**
 * FileBackedAppendOnlyLogService — Persistence Tests
 *
 * Verifies that the file-backed audit log:
 *   1. Produces the same chain hash behaviour as the in-memory log
 *   2. Persists entries across simulated restarts (new instance, same file)
 *   3. Rejects a tampered JSONL file (chain verification fails)
 *   4. Returns immutable snapshots (caller mutation does not affect stored state)
 *   5. An empty / non-existent file starts a fresh chain
 */

import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { FileBackedAppendOnlyLogService } from "../src/services/audit/file-backed-append-only-log-service.js";
import { AppendOnlyLogService } from "../src/services/audit/append-only-log-service.js";
import { buildValidGovernedRequest } from "../src/domain/builders/request-fixtures.js";
import { ExecutionGateService } from "../src/services/execution/execution-gate-service.js";
import { EvidenceBundleService } from "../src/services/evidence/evidence-bundle-service.js";
import type { AuditEventPayload } from "../src/domain/types/audit.js";

const tempDirs: string[] = [];

function makeTempFile(): string {
  const dir = mkdtempSync(join(tmpdir(), "cerbaseal-test-"));
  tempDirs.push(dir);
  return join(dir, "audit.jsonl");
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    try { rmSync(dir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
});

function sampleEvent(requestId: string): AuditEventPayload {
  return {
    requestId,
    eventType: "REQUEST_EVALUATED",
    payload: { requestId, test: true }
  };
}

describe("FileBackedAppendOnlyLogService — basic chain behaviour", () => {

  it("starts with an empty chain when file does not exist", () => {
    const filePath = makeTempFile();
    const log = new FileBackedAppendOnlyLogService(filePath);
    expect(log.list()).toHaveLength(0);
    expect(log.verifyChain()).toBe(true);
  });

  it("appends entries and writes a valid JSONL file", () => {
    const filePath = makeTempFile();
    const log = new FileBackedAppendOnlyLogService(filePath);

    log.append(sampleEvent("req_a"));
    log.append(sampleEvent("req_b"));

    const lines = readFileSync(filePath, "utf-8").split("\n").filter(Boolean);
    expect(lines).toHaveLength(2);
    const first = JSON.parse(lines[0]!) as { eventId: string };
    expect(first.eventId).toBe("evt_1");
    expect(log.verifyChain()).toBe(true);
  });

  it("produces a valid hash chain with multiple entries", () => {
    const filePath = makeTempFile();
    const log = new FileBackedAppendOnlyLogService(filePath);

    for (let i = 0; i < 5; i++) {
      log.append(sampleEvent(`req_${i}`));
    }

    const entries = log.list();
    expect(entries).toHaveLength(5);
    expect(entries[0]!.previousHash).toBeNull();
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i]!.previousHash).toBe(entries[i - 1]!.entryHash);
    }
    expect(log.verifyChain()).toBe(true);
  });

});

describe("FileBackedAppendOnlyLogService — persistence across restarts", () => {

  it("reloads entries from disk when constructed with an existing file", () => {
    const filePath = makeTempFile();

    const log1 = new FileBackedAppendOnlyLogService(filePath);
    log1.append(sampleEvent("req_persist_1"));
    log1.append(sampleEvent("req_persist_2"));
    const hash1 = log1.list().at(-1)!.entryHash;

    const log2 = new FileBackedAppendOnlyLogService(filePath);
    expect(log2.list()).toHaveLength(2);
    expect(log2.list().at(-1)!.entryHash).toBe(hash1);
    expect(log2.verifyChain()).toBe(true);
  });

  it("continues the chain after restart with new appends", () => {
    const filePath = makeTempFile();

    const log1 = new FileBackedAppendOnlyLogService(filePath);
    log1.append(sampleEvent("req_before_restart"));

    const log2 = new FileBackedAppendOnlyLogService(filePath);
    log2.append(sampleEvent("req_after_restart"));

    const entries = log2.list();
    expect(entries).toHaveLength(2);
    expect(entries[1]!.previousHash).toBe(entries[0]!.entryHash);
    expect(log2.verifyChain()).toBe(true);
  });

  it("uses the same payload-hashing algorithm as the in-memory log", () => {
    // Both implementations use audit-hash-utils.ts for SHA-256 payload hashing.
    // payloadHash is deterministic (depends only on event.payload, not timestamp).
    // entryHash and previousHash differ between instances because nowIso() is
    // called at append() time and each call gets a unique timestamp — this is
    // expected and correct. Chain integrity is verified per-instance by
    // verifyChain(), not by cross-instance hash comparison.
    const filePath = makeTempFile();
    const fileBacked = new FileBackedAppendOnlyLogService(filePath);
    const inMemory = new AppendOnlyLogService();

    const events: AuditEventPayload[] = [
      sampleEvent("req_x"),
      { requestId: "req_x", eventType: "RELEASE_AUTHORIZED", payload: { action: "allow" } },
      { requestId: "req_x", eventType: "EVIDENCE_BUNDLE_CREATED", payload: { bundleId: "b1" } }
    ];

    for (const event of events) {
      fileBacked.append(event);
      inMemory.append(event);
    }

    const fbEntries = fileBacked.list();
    const imEntries = inMemory.list();

    expect(fbEntries).toHaveLength(imEntries.length);

    // payloadHash is deterministic across instances
    for (let i = 0; i < fbEntries.length; i++) {
      expect(fbEntries[i]!.payloadHash).toBe(imEntries[i]!.payloadHash);
      expect(fbEntries[i]!.eventType).toBe(imEntries[i]!.eventType);
      expect(fbEntries[i]!.requestId).toBe(imEntries[i]!.requestId);
    }

    // Both chains are individually valid
    expect(fileBacked.verifyChain()).toBe(true);
    expect(inMemory.verifyChain()).toBe(true);

    // First entry in each has null previousHash (no cross-chain comparison)
    expect(fbEntries[0]!.previousHash).toBeNull();
    expect(imEntries[0]!.previousHash).toBeNull();
  });

});

describe("FileBackedAppendOnlyLogService — tamper detection", () => {

  it("detects tampering: modified entryHash in JSONL file", () => {
    const filePath = makeTempFile();
    const log1 = new FileBackedAppendOnlyLogService(filePath);
    log1.append(sampleEvent("req_tamper_1"));
    log1.append(sampleEvent("req_tamper_2"));

    const lines = readFileSync(filePath, "utf-8").split("\n").filter(Boolean);
    const tampered = JSON.parse(lines[0]!) as Record<string, unknown>;
    tampered["entryHash"] = "0000000000000000000000000000000000000000000000000000000000000000";
    const newContent = [JSON.stringify(tampered), lines[1]!].join("\n") + "\n";
    writeFileSync(filePath, newContent, "utf-8");

    const log2 = new FileBackedAppendOnlyLogService(filePath);
    expect(log2.verifyChain()).toBe(false);
  });

  it("detects tampering: modified payloadHash in JSONL file", () => {
    const filePath = makeTempFile();
    const log1 = new FileBackedAppendOnlyLogService(filePath);
    log1.append(sampleEvent("req_tamper_3"));

    const lines = readFileSync(filePath, "utf-8").split("\n").filter(Boolean);
    const tampered = JSON.parse(lines[0]!) as Record<string, unknown>;
    tampered["payloadHash"] = "aaaa";
    writeFileSync(filePath, JSON.stringify(tampered) + "\n", "utf-8");

    const log2 = new FileBackedAppendOnlyLogService(filePath);
    expect(log2.verifyChain()).toBe(false);
  });

  it("detects insertion of a forged entry between two real entries", () => {
    const filePath = makeTempFile();
    const log1 = new FileBackedAppendOnlyLogService(filePath);
    const e1 = log1.append(sampleEvent("req_t1"));
    log1.append(sampleEvent("req_t2"));

    const lines = readFileSync(filePath, "utf-8").split("\n").filter(Boolean);
    const forged = {
      eventId: "evt_injected",
      requestId: "req_forged",
      eventType: "RELEASE_AUTHORIZED",
      timestamp: new Date().toISOString(),
      payloadHash: "fake_hash",
      previousHash: e1.entryHash,
      entryHash: "fake_entry_hash"
    };
    const newContent = [lines[0]!, JSON.stringify(forged), lines[1]!].join("\n") + "\n";
    writeFileSync(filePath, newContent, "utf-8");

    const log2 = new FileBackedAppendOnlyLogService(filePath);
    expect(log2.verifyChain()).toBe(false);
  });

});

describe("FileBackedAppendOnlyLogService — immutability of snapshots", () => {

  it("caller mutation of list() snapshot does not affect stored entries", () => {
    const filePath = makeTempFile();
    const log = new FileBackedAppendOnlyLogService(filePath);
    log.append(sampleEvent("req_immutable"));

    const snapshot = log.list();
    const originalHash = snapshot[0]!.entryHash;
    snapshot[0]!.entryHash = "tampered_in_caller";

    expect(log.list()[0]!.entryHash).toBe(originalHash);
    expect(log.verifyChain()).toBe(true);
  });

});

describe("FileBackedAppendOnlyLogService — full flow integration", () => {

  it("works with ExecutionGateService + EvidenceBundleService and survives a restart", () => {
    const filePath = makeTempFile();
    const request = buildValidGovernedRequest();
    const gate = new ExecutionGateService();

    const log1 = new FileBackedAppendOnlyLogService(filePath);
    const evidence1 = new EvidenceBundleService(log1);
    const gateResult = gate.evaluate(request);
    const bundle = evidence1.createBundle({ request, gateResult });

    expect(bundle.decisionEnvelope.finalState).toBe("ALLOW");
    expect(log1.verifyChain()).toBe(true);

    const entriesBeforeRestart = log1.list().length;
    expect(entriesBeforeRestart).toBeGreaterThanOrEqual(3);

    const log2 = new FileBackedAppendOnlyLogService(filePath);
    expect(log2.list()).toHaveLength(entriesBeforeRestart);
    expect(log2.verifyChain()).toBe(true);
  });

  it("listByRequestId filters correctly after reload", () => {
    const filePath = makeTempFile();

    const log1 = new FileBackedAppendOnlyLogService(filePath);
    log1.append(sampleEvent("req_alpha"));
    log1.append(sampleEvent("req_beta"));
    log1.append(sampleEvent("req_alpha"));

    const log2 = new FileBackedAppendOnlyLogService(filePath);
    const alpha = log2.listByRequestId("req_alpha");
    const beta = log2.listByRequestId("req_beta");

    expect(alpha).toHaveLength(2);
    expect(beta).toHaveLength(1);
  });

});
