/**
 * Validation script for the CerbaSeal Webhook Adapter starter kit.
 * Starts the webhook server and a local callback capture server, sends
 * a sample event, and confirms the callback payload is received.
 *
 * Run: pnpm tsx examples/webhook-adapter/validate-webhook-adapter.ts
 * Expected output: all checks PASS, exit code 0
 */

import { createServer } from "node:http";
import { fileURLToPath } from "node:url";

const WEBHOOK_PORT = 4100;
const CALLBACK_PORT = 4101;

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (!isMain) process.exit(0);

process.env["CERBASEAL_WEBHOOK_PORT"] = String(WEBHOOK_PORT);
process.env["CERBASEAL_CALLBACK_URL"] = `http://localhost:${CALLBACK_PORT}/callback`;

const { server } = await import("./index.js");

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

const nowIso = () => new Date().toISOString();

let capturedCallback: unknown = null;

const callbackServer = createServer((req, res) => {
  let data = "";
  req.on("data", (chunk: Buffer) => { data += chunk.toString(); });
  req.on("end", () => {
    try { capturedCallback = JSON.parse(data); } catch { /* ignore */ }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ received: true }));
  });
});

function waitFor(condition: () => boolean, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const interval = setInterval(() => {
      if (condition()) { clearInterval(interval); resolve(); }
      else if (Date.now() > deadline) { clearInterval(interval); reject(new Error("Timeout")); }
    }, 20);
  });
}

await new Promise<void>((resolve) => callbackServer.listen(CALLBACK_PORT, resolve));
await new Promise<void>((resolve) => server.listen(WEBHOOK_PORT, resolve));

const base = `http://localhost:${WEBHOOK_PORT}`;

console.log("\nCerbaSeal Webhook Adapter — Validation\n");

// Health check
const healthRes = await fetch(`${base}/health`);
const health = await healthRes.json() as Record<string, unknown>;
check("GET /health returns status ok", health["status"] === "ok");

// POST /event — REJECT scenario (AI actor)
const rejectEvent = {
  requestId: "wh-reject-001", workflowClass: "fraud_triage", jurisdiction: "EU",
  actorId: "fraud-model-v1", actorAuthorityClass: "ai", proposedActionClass: "escalate",
  proposal: { proposalSourceKind: "ai", authorityBearing: false, requestedActionClass: "escalate",
    confidence: 0.93, reasonCodes: ["velocity_spike"], proposalCreatedAt: nowIso() },
  sensitive: true, prohibitedUse: false,
  policyPackRef: { id: "policy_fraud_v1", version: "1.0.0" },
  provenanceRef: { modelVersion: "fraud-v1", ruleSetVersion: "rules-1.0", sourceHash: "sha256:aaa" },
  approvalRequired: false, approvalArtifact: null, loggingReady: true,
  controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: "vr-001" },
  trustState: { trusted: true, trustStateId: "ts-001" }, createdAt: nowIso()
};

capturedCallback = null;
const rejectRes = await fetch(`${base}/event`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(rejectEvent)
});
const rejectBody = await rejectRes.json() as Record<string, unknown>;
check("POST /event responds 202 for AI self-auth (gate returns REJECT)", rejectRes.status === 202);
check("AI self-auth response has finalState REJECT", rejectBody["finalState"] === "REJECT");

// POST /event — HOLD scenario (system actor, fraud_triage, no approval)
const holdEvent = {
  requestId: "wh-hold-001", workflowClass: "fraud_triage", jurisdiction: "EU",
  actorId: "governance-system", actorAuthorityClass: "system", proposedActionClass: "escalate",
  proposal: { proposalSourceKind: "ai", authorityBearing: false, requestedActionClass: "escalate",
    confidence: 0.88, reasonCodes: ["unusual_pattern"], proposalCreatedAt: nowIso() },
  sensitive: true, prohibitedUse: false,
  policyPackRef: { id: "policy_fraud_v1", version: "1.0.0" },
  provenanceRef: { modelVersion: "fraud-v1", ruleSetVersion: "rules-1.0", sourceHash: "sha256:bbb" },
  approvalRequired: false, approvalArtifact: null, loggingReady: true,
  controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: "vr-002" },
  trustState: { trusted: true, trustStateId: "ts-002" }, createdAt: nowIso()
};

capturedCallback = null;
const holdRes = await fetch(`${base}/event`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(holdEvent)
});
const holdBody = await holdRes.json() as Record<string, unknown>;
check("POST /event responds 202 for HOLD decision", holdRes.status === 202);
check("HOLD response contains finalState HOLD", holdBody["finalState"] === "HOLD");

try {
  await waitFor(() => capturedCallback !== null, 2000);
  const cb = capturedCallback as Record<string, unknown>;
  check("Callback received within 2s", true);
  check("Callback payload has finalState HOLD", cb["finalState"] === "HOLD");
  check("Callback payload has requestId", cb["requestId"] === "wh-hold-001");
  check("Callback payload has evidenceBundleId", typeof cb["evidenceBundleId"] === "string");
} catch {
  check("Callback received within 2s", false, "timeout");
  check("Callback payload has finalState HOLD", false, "no callback");
  check("Callback payload has requestId", false, "no callback");
  check("Callback payload has evidenceBundleId", false, "no callback");
}

// POST /event — ALLOW scenario (system actor, non-approval workflow)
const allowEvent = {
  requestId: "wh-allow-001", workflowClass: "transaction_escalation", jurisdiction: "EU",
  actorId: "governance-system", actorAuthorityClass: "system", proposedActionClass: "escalate",
  proposal: { proposalSourceKind: "ai", authorityBearing: false, requestedActionClass: "escalate",
    confidence: 0.72, reasonCodes: ["threshold_exceeded"], proposalCreatedAt: nowIso() },
  sensitive: true, prohibitedUse: false,
  policyPackRef: { id: "policy_txn_v1", version: "1.0.0" },
  provenanceRef: { modelVersion: "txn-v1", ruleSetVersion: "rules-2.0", sourceHash: "sha256:ccc" },
  approvalRequired: false, approvalArtifact: null, loggingReady: true,
  controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: "vr-003" },
  trustState: { trusted: true, trustStateId: "ts-003" }, createdAt: nowIso()
};

capturedCallback = null;
const allowRes = await fetch(`${base}/event`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(allowEvent)
});
const allowBody = await allowRes.json() as Record<string, unknown>;
check("POST /event responds 202 for ALLOW decision", allowRes.status === 202);
check("ALLOW response contains finalState ALLOW", allowBody["finalState"] === "ALLOW");

try {
  await waitFor(() => capturedCallback !== null, 2000);
  const cb = capturedCallback as Record<string, unknown>;
  check("ALLOW callback received", true);
  check("ALLOW callback has releaseAuthorization", cb["releaseAuthorization"] !== null);
} catch {
  check("ALLOW callback received", false, "timeout");
  check("ALLOW callback has releaseAuthorization", false, "no callback");
}

// Unknown route
const notFoundRes = await fetch(`${base}/unknown`);
check("Unknown route responds 404", notFoundRes.status === 404);

console.log(`\nValidation complete: ${passed} passed, ${failed} failed\n`);
callbackServer.close();
server.close();
process.exit(failed > 0 ? 1 : 0);
