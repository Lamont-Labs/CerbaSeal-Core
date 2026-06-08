/**
 * CerbaSeal — Deployment Verification Script
 *
 * Runs 3 scenarios (REJECT, HOLD, ALLOW) against the enforcement gate
 * and confirms each produces the expected decision.
 *
 * Run from the CerbaSeal-Core root:
 *   tsx deployment-starter/verify.ts
 *
 * All 3 scenarios must show [PASS] before going to production.
 */

import { ExecutionGateService } from "cerbaseal-review/src/services/execution/execution-gate-service.js";
import { loadCerbaSealConfig } from "cerbaseal-review/src/config/cerbaseal-config.js";
import { loadCerbaSealPolicy } from "cerbaseal-review/src/config/cerbaseal-policy.js";
import type { GovernedRequest, ApprovalArtifact } from "cerbaseal-review/src/domain/types/core.js";

const config = loadCerbaSealConfig();
const policy = loadCerbaSealPolicy();
const gate = new ExecutionGateService(config, policy);

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean, detail?: string): void {
  if (condition) {
    console.log("  [PASS]", label);
    passed++;
  } else {
    console.error("  [FAIL]", label, detail ? `— ${detail}` : "");
    failed++;
  }
}

const BASE: GovernedRequest = {
  requestId: "verify-base",
  workflowClass: "fraud_triage",
  jurisdiction: "EU",
  actorId: "verify-actor",
  actorAuthorityClass: "analyst",
  proposedActionClass: "escalate",
  proposal: {
    proposalSourceKind: "ai",
    authorityBearing: false,
    requestedActionClass: "escalate",
    confidence: 0.88,
    reasonCodes: ["verify_signal"],
    proposalCreatedAt: new Date().toISOString(),
  },
  sensitive: false,
  prohibitedUse: false,
  policyPackRef: { id: "policy_fraud_triage_v1", version: "1.0.0" },
  provenanceRef: {
    modelVersion: "verify-model-v1",
    ruleSetVersion: "verify-rules-v1",
    sourceHash: "sha256-verify-placeholder",
  },
  approvalRequired: false,
  approvalArtifact: null,
  loggingReady: true,
  controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: "vr_verify" },
  trustState: { trusted: true, trustStateId: "ts_verify" },
  createdAt: new Date().toISOString(),
};

console.log("\nCerbaSeal Deployment Verification");
console.log("=".repeat(52));
console.log("Runs 3 scenarios. All must [PASS] before production.\n");

// ── Scenario 1: REJECT ────────────────────────────────────────────────────────
console.log("Scenario 1: REJECT — AI actor cannot self-authorize");
{
  const req: GovernedRequest = {
    ...BASE,
    requestId: "verify-reject-001",
    actorAuthorityClass: "ai",
    actorId: "ai-model-001",
    approvalRequired: false,
    approvalArtifact: null,
  };
  const r = gate.evaluate(req);
  assert("finalState is REJECT", r.decisionEnvelope.finalState === "REJECT",
    `got ${r.decisionEnvelope.finalState}`);
  assert("releaseAuthorization is null", r.releaseAuthorization === null);
  assert("blockedActionRecord is present", r.blockedActionRecord !== null);
}
console.log();

// ── Scenario 2: HOLD ──────────────────────────────────────────────────────────
console.log("Scenario 2: HOLD — approval required but not supplied");
{
  const req: GovernedRequest = {
    ...BASE,
    requestId: "verify-hold-001",
    approvalRequired: true,
    approvalArtifact: null,
  };
  const r = gate.evaluate(req);
  assert("finalState is HOLD", r.decisionEnvelope.finalState === "HOLD",
    `got ${r.decisionEnvelope.finalState}`);
  assert("humanApprovalRequired is true", r.decisionEnvelope.humanApprovalRequired === true);
  assert("releaseAuthorization is null", r.releaseAuthorization === null);
}
console.log();

// ── Scenario 3: ALLOW ─────────────────────────────────────────────────────────
console.log("Scenario 3: ALLOW — valid request with analyst approval");
{
  const requestId = "verify-allow-001";
  const approval: ApprovalArtifact = {
    approvalId: "verify-approval-001",
    approverId: "approver-verify-001",
    forRequestId: requestId,
    approverAuthorityClass: "analyst",
    privilegedAuthSatisfied: true,
    immutableSignature: "sig_verify_allow_001",
    approvedAt: new Date().toISOString(),
  };
  const req: GovernedRequest = {
    ...BASE,
    requestId,
    approvalRequired: true,
    approvalArtifact: approval,
  };
  const r = gate.evaluate(req);
  assert("finalState is ALLOW", r.decisionEnvelope.finalState === "ALLOW",
    `got ${r.decisionEnvelope.finalState}`);
  assert("releaseAuthorization is present", r.releaseAuthorization !== null);
  assert("humanApprovalPresent is true", r.decisionEnvelope.humanApprovalPresent === true);
}
console.log();

// ── Summary ───────────────────────────────────────────────────────────────────
console.log("=".repeat(52));
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error("\n✗ Verification FAILED. Do not proceed to production.");
  console.error("  Check the [FAIL] lines above and review your configuration.\n");
  process.exit(1);
} else {
  console.log("\n✓ All 3 scenarios passed. Deployment verified.\n");
}
