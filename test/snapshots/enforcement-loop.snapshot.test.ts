import { describe, it, expect } from "vitest";
import { ExecutionGateService } from "../../src/services/execution/execution-gate-service.js";
import { EvidenceBundleService } from "../../src/services/evidence/evidence-bundle-service.js";
import { AppendOnlyLogService } from "../../src/services/audit/append-only-log-service.js";
import type { GovernedRequest } from "../../src/domain/types/core.js";

function makeGate() {
  const gate = new ExecutionGateService();
  const log = new AppendOnlyLogService();
  const evidence = new EvidenceBundleService(log);
  return { gate, log, evidence };
}

const rejectRequest: GovernedRequest = {
  requestId: "trace_reject_001",
  workflowClass: "fraud_triage",
  jurisdiction: "EU",
  actorId: "ai_engine_cerba_v3",
  actorAuthorityClass: "ai",
  proposedActionClass: "escalate",
  proposal: {
    proposalSourceKind: "ai",
    authorityBearing: false,
    requestedActionClass: "escalate",
    confidence: 0.97,
    reasonCodes: ["high_velocity_anomaly", "cross_border_mismatch", "repeated_fail_pattern"],
    proposalCreatedAt: "2026-04-22T09:00:00.000Z"
  },
  sensitive: true,
  prohibitedUse: false,
  policyPackRef: { id: "policy_fraud_eu_v3", version: "3.1.2" },
  provenanceRef: {
    modelVersion: "cerba_model_4.1.0",
    ruleSetVersion: "eu_rules_9.2.1",
    sourceHash: "sha256:a3f9c12e44d8b701f2c98e4a5d67b3e2f01c9d8a7b4e56f3c2a1d9e8f7b6c5a4"
  },
  approvalRequired: false,
  approvalArtifact: null,
  loggingReady: true,
  controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: "vr_reject_001" },
  trustState: { trusted: true, trustStateId: "trust_reject_001" },
  createdAt: "2026-04-22T09:00:00.000Z"
};

const holdRequest: GovernedRequest = {
  requestId: "trace_hold_001",
  workflowClass: "fraud_triage",
  jurisdiction: "EU",
  actorId: "analyst_morgan_k",
  actorAuthorityClass: "analyst",
  proposedActionClass: "account_hold",
  proposal: {
    proposalSourceKind: "deterministic_rule",
    authorityBearing: false,
    requestedActionClass: "account_hold",
    confidence: 0.89,
    reasonCodes: ["sanctions_list_match", "dormant_account_reactivation"],
    proposalCreatedAt: "2026-04-22T10:00:00.000Z"
  },
  sensitive: true,
  prohibitedUse: false,
  policyPackRef: { id: "policy_fraud_eu_v3", version: "3.1.2" },
  provenanceRef: {
    modelVersion: "cerba_model_4.1.0",
    ruleSetVersion: "eu_rules_9.2.1",
    sourceHash: "sha256:b4e8d21f55c9a832e3b17f4d6c98a5e2f03d1c7b8a5f46e2d3c0b9f8a7d6e5c3"
  },
  approvalRequired: true,
  approvalArtifact: null,
  loggingReady: true,
  controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: "vr_hold_001" },
  trustState: { trusted: true, trustStateId: "trust_hold_001" },
  createdAt: "2026-04-22T10:00:00.000Z"
};

const allowRequest: GovernedRequest = {
  requestId: "trace_allow_001",
  workflowClass: "fraud_triage",
  jurisdiction: "EU",
  actorId: "analyst_morgan_k",
  actorAuthorityClass: "analyst",
  proposedActionClass: "account_hold",
  proposal: {
    proposalSourceKind: "deterministic_rule",
    authorityBearing: false,
    requestedActionClass: "account_hold",
    confidence: 0.89,
    reasonCodes: ["sanctions_list_match", "dormant_account_reactivation"],
    proposalCreatedAt: "2026-04-22T10:00:00.000Z"
  },
  sensitive: true,
  prohibitedUse: false,
  policyPackRef: { id: "policy_fraud_eu_v3", version: "3.1.2" },
  provenanceRef: {
    modelVersion: "cerba_model_4.1.0",
    ruleSetVersion: "eu_rules_9.2.1",
    sourceHash: "sha256:b4e8d21f55c9a832e3b17f4d6c98a5e2f03d1c7b8a5f46e2d3c0b9f8a7d6e5c3"
  },
  approvalRequired: true,
  approvalArtifact: {
    approvalId: "approval_trace_allow_001",
    approverId: "compliance_officer_reed_v",
    forRequestId: "trace_allow_001",
    approverAuthorityClass: "compliance_officer",
    privilegedAuthSatisfied: true,
    immutableSignature: "sig_cerbaseal_co_reed_v_2026_04_22_trace_allow_001",
    approvedAt: "2026-04-22T10:05:00.000Z"
  },
  loggingReady: true,
  controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: "vr_allow_001" },
  trustState: { trusted: true, trustStateId: "trust_allow_001" },
  createdAt: "2026-04-22T10:00:00.000Z"
};

describe("Enforcement Loop Snapshots", () => {

  describe("trace_reject_001 — AI self-authorization → REJECT", () => {
    const { gate, evidence } = makeGate();
    const result = gate.evaluate(rejectRequest);
    const bundle = evidence.createBundle({ request: rejectRequest, gateResult: result });

    it("finalState is REJECT", () => {
      expect(result.decisionEnvelope.finalState).toBe("REJECT");
    });

    it("reasonCodes include AI_CANNOT_AUTHORIZE", () => {
      expect(result.decisionEnvelope.trace.reasonCodes).toContain("AI_CANNOT_AUTHORIZE");
    });

    it("releaseAuthorization is null", () => {
      expect(result.releaseAuthorization).toBeNull();
    });

    it("blockedActionRecord is present", () => {
      expect(result.blockedActionRecord).not.toBeNull();
      expect(result.blockedActionRecord?.finalState).toBe("REJECT");
    });

    it("eventChain has exactly 3 entries", () => {
      expect(bundle.eventChain).toHaveLength(3);
    });

    it("eventChain[0].eventType is REQUEST_EVALUATED", () => {
      expect(bundle.eventChain[0]!.eventType).toBe("REQUEST_EVALUATED");
    });

    it("eventChain[1].eventType is ACTION_BLOCKED", () => {
      expect(bundle.eventChain[1]!.eventType).toBe("ACTION_BLOCKED");
    });

    it("eventChain[2].eventType is EVIDENCE_BUNDLE_CREATED", () => {
      expect(bundle.eventChain[2]!.eventType).toBe("EVIDENCE_BUNDLE_CREATED");
    });

    it("eventChain is hash-linked (each previousHash matches prior entryHash)", () => {
      const [e0, e1, e2] = bundle.eventChain;
      expect(e0!.previousHash).toBeNull();
      expect(e1!.previousHash).toBe(e0!.entryHash);
      expect(e2!.previousHash).toBe(e1!.entryHash);
    });

    it("evidenceBundleId matches envelope", () => {
      expect(bundle.evidenceBundleId).toBe(result.decisionEnvelope.evidenceBundleId);
    });

    it("bundle requestId matches original", () => {
      expect(bundle.request.requestId).toBe("trace_reject_001");
    });
  });

  describe("trace_hold_001 — missing required approval → HOLD", () => {
    const { gate, evidence } = makeGate();
    const result = gate.evaluate(holdRequest);
    const bundle = evidence.createBundle({ request: holdRequest, gateResult: result });

    it("finalState is HOLD", () => {
      expect(result.decisionEnvelope.finalState).toBe("HOLD");
    });

    it("reasonCodes include REQUIRED_APPROVAL_MISSING", () => {
      expect(result.decisionEnvelope.trace.reasonCodes).toContain("REQUIRED_APPROVAL_MISSING");
    });

    it("releaseAuthorization is null", () => {
      expect(result.releaseAuthorization).toBeNull();
    });

    it("blockedActionRecord is present", () => {
      expect(result.blockedActionRecord).not.toBeNull();
      expect(result.blockedActionRecord?.finalState).toBe("HOLD");
    });

    it("humanApprovalRequired is true", () => {
      expect(result.decisionEnvelope.humanApprovalRequired).toBe(true);
    });

    it("humanApprovalPresent is false", () => {
      expect(result.decisionEnvelope.humanApprovalPresent).toBe(false);
    });

    it("eventChain has exactly 3 entries", () => {
      expect(bundle.eventChain).toHaveLength(3);
    });

    it("eventChain[0].eventType is REQUEST_EVALUATED", () => {
      expect(bundle.eventChain[0]!.eventType).toBe("REQUEST_EVALUATED");
    });

    it("eventChain[1].eventType is ACTION_BLOCKED", () => {
      expect(bundle.eventChain[1]!.eventType).toBe("ACTION_BLOCKED");
    });

    it("eventChain[2].eventType is EVIDENCE_BUNDLE_CREATED", () => {
      expect(bundle.eventChain[2]!.eventType).toBe("EVIDENCE_BUNDLE_CREATED");
    });

    it("eventChain is hash-linked", () => {
      const [e0, e1, e2] = bundle.eventChain;
      expect(e0!.previousHash).toBeNull();
      expect(e1!.previousHash).toBe(e0!.entryHash);
      expect(e2!.previousHash).toBe(e1!.entryHash);
    });

    it("evidenceBundleId matches envelope", () => {
      expect(bundle.evidenceBundleId).toBe(result.decisionEnvelope.evidenceBundleId);
    });

    it("bundle requestId matches original", () => {
      expect(bundle.request.requestId).toBe("trace_hold_001");
    });
  });

  describe("trace_allow_001 — valid human-approved execution → ALLOW", () => {
    const { gate, evidence } = makeGate();
    const result = gate.evaluate(allowRequest);
    const bundle = evidence.createBundle({ request: allowRequest, gateResult: result });

    it("finalState is ALLOW", () => {
      expect(result.decisionEnvelope.finalState).toBe("ALLOW");
    });

    it("reasonCodes include DECISION_ALLOWED", () => {
      expect(result.decisionEnvelope.trace.reasonCodes).toContain("DECISION_ALLOWED");
    });

    it("releaseAuthorization is present", () => {
      expect(result.releaseAuthorization).not.toBeNull();
    });

    it("releaseAuthorization.actionClass matches proposedActionClass", () => {
      expect(result.releaseAuthorization?.actionClass).toBe("account_hold");
    });

    it("releaseAuthorization.requestId matches original", () => {
      expect(result.releaseAuthorization?.requestId).toBe("trace_allow_001");
    });

    it("blockedActionRecord is null", () => {
      expect(result.blockedActionRecord).toBeNull();
    });

    it("humanApprovalRequired is true", () => {
      expect(result.decisionEnvelope.humanApprovalRequired).toBe(true);
    });

    it("humanApprovalPresent is true", () => {
      expect(result.decisionEnvelope.humanApprovalPresent).toBe(true);
    });

    it("permittedActionClass is account_hold", () => {
      expect(result.decisionEnvelope.permittedActionClass).toBe("account_hold");
    });

    it("eventChain has exactly 3 entries", () => {
      expect(bundle.eventChain).toHaveLength(3);
    });

    it("eventChain[0].eventType is REQUEST_EVALUATED", () => {
      expect(bundle.eventChain[0]!.eventType).toBe("REQUEST_EVALUATED");
    });

    it("eventChain[1].eventType is RELEASE_AUTHORIZED", () => {
      expect(bundle.eventChain[1]!.eventType).toBe("RELEASE_AUTHORIZED");
    });

    it("eventChain[2].eventType is EVIDENCE_BUNDLE_CREATED", () => {
      expect(bundle.eventChain[2]!.eventType).toBe("EVIDENCE_BUNDLE_CREATED");
    });

    it("eventChain is hash-linked", () => {
      const [e0, e1, e2] = bundle.eventChain;
      expect(e0!.previousHash).toBeNull();
      expect(e1!.previousHash).toBe(e0!.entryHash);
      expect(e2!.previousHash).toBe(e1!.entryHash);
    });

    it("evidenceBundleId matches envelope", () => {
      expect(bundle.evidenceBundleId).toBe(result.decisionEnvelope.evidenceBundleId);
    });

    it("bundle requestId matches original", () => {
      expect(bundle.request.requestId).toBe("trace_allow_001");
    });

    it("bundle contains the original approvalArtifact", () => {
      expect(bundle.request.approvalArtifact?.forRequestId).toBe("trace_allow_001");
      expect(bundle.request.approvalArtifact?.approverAuthorityClass).toBe("compliance_officer");
    });
  });

});
