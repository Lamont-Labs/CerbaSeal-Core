/**
 * CerbaSeal — Minimal Integration Entry Point
 *
 * Minimal code to wire CerbaSeal's enforcement gate into your application.
 * Replace placeholder values with real values from your workflow.
 * See deployment-starter/README.md for the full 5-step setup guide.
 */

import { ExecutionGateService } from "cerbaseal-review/src/services/execution/execution-gate-service.js";
import { loadCerbaSealConfig } from "cerbaseal-review/src/config/cerbaseal-config.js";
import { loadCerbaSealPolicy } from "cerbaseal-review/src/config/cerbaseal-policy.js";
import type { GovernedRequest } from "cerbaseal-review/src/domain/types/core.js";

const config = loadCerbaSealConfig();
const policy = loadCerbaSealPolicy();
const gate = new ExecutionGateService(config, policy);

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
      reasonCodes: ["initial_signal"],
      proposalCreatedAt: new Date().toISOString(),
    },
    sensitive: true,
    prohibitedUse: false,
    policyPackRef: { id: "policy_your_workflow_v1", version: "1.0.0" },
    provenanceRef: { modelVersion: "v1", ruleSetVersion: "rules-v1", sourceHash: "sha256-placeholder" },
    approvalRequired: false,
    approvalArtifact: null,
    loggingReady: true,
    controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: "vr_init" },
    trustState: { trusted: true, trustStateId: "ts_init" },
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

const result = gate.evaluate(buildRequest());

console.log("Gate decision   :", result.decisionEnvelope.finalState);
console.log("Evidence bundle :", result.decisionEnvelope.evidenceBundleId);
console.log("Approval needed :", result.decisionEnvelope.humanApprovalRequired);
if (result.decisionEnvelope.finalState === "ALLOW" && result.releaseAuthorization) {
  console.log("Release auth    :", result.releaseAuthorization.releaseAuthorizationId);
}
