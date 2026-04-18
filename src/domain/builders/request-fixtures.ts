import type { GovernedRequest } from "../types/core.js";

export function buildValidGovernedRequest(): GovernedRequest {
  return {
    requestId: "req_001",
    workflowClass: "fraud_triage",
    jurisdiction: "EU",
    actorId: "actor_001",
    actorAuthorityClass: "system",
    proposedActionClass: "escalate",
    proposal: {
      proposalSourceKind: "ai",
      authorityBearing: false,
      requestedActionClass: "escalate",
      confidence: 0.91,
      reasonCodes: ["risk_signal", "velocity_spike"],
      proposalCreatedAt: "2026-04-18T00:00:00.000Z"
    },
    sensitive: true,
    prohibitedUse: false,
    policyPackRef: {
      id: "policy_fraud_v1",
      version: "1.0.0"
    },
    provenanceRef: {
      modelVersion: "model_1.2.3",
      ruleSetVersion: "rules_4.5.6",
      sourceHash: "sha256:source_abc123"
    },
    approvalRequired: true,
    approvalArtifact: {
      approvalId: "approval_001",
      approverId: "reviewer_001",
      approverAuthorityClass: "reviewer",
      privilegedAuthSatisfied: true,
      immutableSignature: "sig_immutable_001",
      approvedAt: "2026-04-18T00:01:00.000Z"
    },
    loggingReady: true,
    controlStatus: {
      criticalControlsValid: true,
      stale: false,
      verificationRunId: "vr_001"
    },
    trustState: {
      trusted: true,
      trustStateId: "trust_001"
    },
    createdAt: "2026-04-18T00:00:00.000Z"
  };
}
