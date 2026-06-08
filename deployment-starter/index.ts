/**
 * CerbaSeal — Minimal Integration Entry Point
 *
 * The minimal code needed to wire CerbaSeal's enforcement gate
 * into your application. Under 60 lines, no boilerplate.
 *
 * Replace the example request with your actual workflow construction.
 * See deployment-starter/README.md for the full 5-step setup guide.
 */

import { ExecutionGateService } from "../src/services/execution/execution-gate-service.js";
import { loadCerbaSealConfig } from "../src/config/cerbaseal-config.js";
import { loadCerbaSealPolicy } from "../src/config/cerbaseal-policy.js";
import type { GovernedRequest } from "../src/domain/types/core.js";

const config = loadCerbaSealConfig();
const policy = loadCerbaSealPolicy();
const gate = new ExecutionGateService(config, policy);

// Build a request from your workflow data.
// Replace all placeholder values with real values from your system.
function buildRequest(overrides: Partial<GovernedRequest> = {}): GovernedRequest {
  return {
    requestId: `req_${Date.now()}`,
    workflowClass: "your_workflow_class" as GovernedRequest["workflowClass"],
    jurisdiction: "EU",
    actorId: "your-actor-id",
    actorAuthorityClass: "analyst" as GovernedRequest["actorAuthorityClass"],
    proposedActionClass: "escalate",
    proposal: {
      proposalSourceKind: "ai",
      authorityBearing: false,
      requestedActionClass: "escalate",
      confidence: 0.9,
      reasonCodes: [],
      proposalCreatedAt: new Date().toISOString(),
    },
    sensitive: true,
    prohibitedUse: false,
    policyPackRef: null,
    provenanceRef: null,
    approvalRequired: false,
    approvalArtifact: null,
    loggingReady: true,
    controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: "vr_init" },
    trustState: { trusted: true, trustStateId: "ts_init" },
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

const request = buildRequest();
const result = gate.evaluate(request);

console.log("Gate decision   :", result.decisionEnvelope.finalState);
console.log("Evidence bundle :", result.decisionEnvelope.evidenceBundleId);
console.log("Approval needed :", result.decisionEnvelope.humanApprovalRequired);

if (result.decisionEnvelope.finalState === "ALLOW" && result.releaseAuthorization) {
  console.log("Release auth    :", result.releaseAuthorization.releaseAuthorizationId);
}
