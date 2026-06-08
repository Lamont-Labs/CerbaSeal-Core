/**
 * Validation script for the CerbaSeal Express Middleware starter kit.
 * Tests the cerbaSealGate() middleware with mock req/res/next objects
 * across REJECT, HOLD, and ALLOW scenarios.
 *
 * Run: pnpm tsx examples/express-middleware/validate-express-middleware.ts
 * Expected output: all checks PASS, exit code 0
 */

import { fileURLToPath } from "node:url";
import { cerbaSealGate, type CerbaSealRequest, type CerbaSealResponse, type NextFn } from "./index.js";
import { ExecutionGateService } from "../../src/services/execution/execution-gate-service.js";
import { AppendOnlyLogService } from "../../src/services/audit/append-only-log-service.js";
import { EvidenceBundleService } from "../../src/services/evidence/evidence-bundle-service.js";
import { loadCerbaSealConfig } from "../../src/config/cerbaseal-config.js";
import type { GovernedRequest } from "../../src/domain/types/core.js";

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (!isMain) process.exit(0);

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

const config = loadCerbaSealConfig();
const gate = new ExecutionGateService(config);
const logService = new AppendOnlyLogService();
const evidenceService = new EvidenceBundleService(logService);
const opts = { gate, logService, evidenceService };
const middleware = cerbaSealGate(opts);

const nowIso = () => new Date().toISOString();

interface MockResult {
  nextCalled: boolean;
  statusCode: number;
  responseBody: unknown;
  locals: Record<string, unknown>;
}

function runMiddleware(body: GovernedRequest): MockResult {
  const result: MockResult = { nextCalled: false, statusCode: 200, responseBody: null, locals: {} };

  const req: CerbaSealRequest = { body };
  const res: CerbaSealResponse = {
    statusCode: 200,
    locals: result.locals,
    status(code) { result.statusCode = code; return res; },
    json(b) { result.responseBody = b; }
  };
  const next: NextFn = () => { result.nextCalled = true; };

  middleware(req, res, next);
  return result;
}

console.log("\nCerbaSeal Express Middleware — Validation\n");

// Scenario 1: AI actor self-authorization → REJECT (gate throws CerbaSealError)
const rejectRequest: GovernedRequest = {
  requestId: "mw-val-reject-001", workflowClass: "fraud_triage", jurisdiction: "EU",
  actorId: "fraud-model-v1", actorAuthorityClass: "ai", proposedActionClass: "escalate",
  proposal: { proposalSourceKind: "ai", authorityBearing: false, requestedActionClass: "escalate",
    confidence: 0.92, reasonCodes: ["velocity_spike"], proposalCreatedAt: nowIso() },
  sensitive: true, prohibitedUse: false,
  policyPackRef: { id: "policy_fraud_v1", version: "1.0.0" },
  provenanceRef: { modelVersion: "fraud-v1", ruleSetVersion: "rules-1.0", sourceHash: "sha256:rej" },
  approvalRequired: false, approvalArtifact: null, loggingReady: true,
  controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: "vr-r01" },
  trustState: { trusted: true, trustStateId: "ts-r01" }, createdAt: nowIso()
};

const rejectResult = runMiddleware(rejectRequest);
check("AI self-auth: next() NOT called", !rejectResult.nextCalled);
check("AI self-auth: status 403 (gate returns REJECT)", rejectResult.statusCode === 403);
const rejectBody = rejectResult.responseBody as Record<string, unknown>;
check("AI self-auth: response has rejected:true", rejectBody?.["rejected"] === true);

// Scenario 2: System actor, fraud_triage (always requires approval) → HOLD
const holdRequest: GovernedRequest = {
  requestId: "mw-val-hold-001", workflowClass: "fraud_triage", jurisdiction: "EU",
  actorId: "governance-system", actorAuthorityClass: "system", proposedActionClass: "escalate",
  proposal: { proposalSourceKind: "ai", authorityBearing: false, requestedActionClass: "escalate",
    confidence: 0.85, reasonCodes: ["unusual_pattern"], proposalCreatedAt: nowIso() },
  sensitive: true, prohibitedUse: false,
  policyPackRef: { id: "policy_fraud_v1", version: "1.0.0" },
  provenanceRef: { modelVersion: "fraud-v1", ruleSetVersion: "rules-1.0", sourceHash: "sha256:hld" },
  approvalRequired: false, approvalArtifact: null, loggingReady: true,
  controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: "vr-h01" },
  trustState: { trusted: true, trustStateId: "ts-h01" }, createdAt: nowIso()
};

const holdResult = runMiddleware(holdRequest);
check("HOLD: next() NOT called", !holdResult.nextCalled);
check("HOLD: status 202", holdResult.statusCode === 202);
const holdBody = holdResult.responseBody as Record<string, unknown>;
check("HOLD: response has held:true", holdBody?.["held"] === true);
check("HOLD: response has envelopeId", typeof holdBody?.["envelopeId"] === "string");
check("HOLD: response has evidenceBundleId", typeof holdBody?.["evidenceBundleId"] === "string");

// Scenario 3: System actor, no approval required, non-fraud workflow → ALLOW
const allowRequest: GovernedRequest = {
  requestId: "mw-val-allow-001", workflowClass: "transaction_escalation", jurisdiction: "EU",
  actorId: "governance-system", actorAuthorityClass: "system", proposedActionClass: "escalate",
  proposal: { proposalSourceKind: "ai", authorityBearing: false, requestedActionClass: "escalate",
    confidence: 0.78, reasonCodes: ["threshold_exceeded"], proposalCreatedAt: nowIso() },
  sensitive: true, prohibitedUse: false,
  policyPackRef: { id: "policy_txn_v1", version: "1.0.0" },
  provenanceRef: { modelVersion: "txn-v1", ruleSetVersion: "rules-2.0", sourceHash: "sha256:alw" },
  approvalRequired: false, approvalArtifact: null, loggingReady: true,
  controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: "vr-a01" },
  trustState: { trusted: true, trustStateId: "ts-a01" }, createdAt: nowIso()
};

const allowResult = runMiddleware(allowRequest);
check("ALLOW: next() called", allowResult.nextCalled);
check("ALLOW: gateResult attached to res.locals", allowResult.locals["gateResult"] !== undefined);
check("ALLOW: evidenceBundle attached to res.locals", allowResult.locals["evidenceBundle"] !== undefined);

// Scenario 4: Custom onHold handler is invoked
let onHoldCalled = false;
const middlewareWithOnHold = cerbaSealGate({
  ...opts,
  onHold: (_req, _res, _bundle) => { onHoldCalled = true; }
});
const holdReq2: CerbaSealRequest = { body: { ...holdRequest, requestId: "mw-val-hold-002" } };
const holdRes2: CerbaSealResponse = {
  statusCode: 200, locals: {},
  status(c) { this.statusCode = c; return this; },
  json(_b) { /* noop */ }
};
middlewareWithOnHold(holdReq2, holdRes2, () => { /* noop */ });
check("Custom onHold handler invoked for HOLD decision", onHoldCalled);

// Audit chain still valid after all evaluations
check("Audit chain valid after all scenarios", logService.verifyChain());

console.log(`\nValidation complete: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
