/**
 * Contextual Correctness Boundary Test Suite
 *
 * Validates that CerbaSeal enforces structural validity and authorization
 * requirements ONLY. It does not evaluate the correctness, quality, intent,
 * or semantic appropriateness of a proposed action.
 *
 * All cases in this file are structurally and authoritatively valid.
 * All MUST produce ALLOW. Any REJECT or HOLD here is a scope violation.
 *
 * These tests serve as a precision statement about what CerbaSeal does
 * and does not do. They are companion documentation to the Known Gaps
 * and Enforcement Boundary sections in docs/status/current-state.md.
 */

import { describe, it, expect } from "vitest";
import { ExecutionGateService } from "../../src/services/execution/execution-gate-service.js";
import { EvidenceBundleService } from "../../src/services/evidence/evidence-bundle-service.js";
import { AppendOnlyLogService } from "../../src/services/audit/append-only-log-service.js";
import type { GovernedRequest } from "../../src/domain/types/core.js";

function makeServices() {
  const gate = new ExecutionGateService();
  const log = new AppendOnlyLogService();
  const evidence = new EvidenceBundleService(log);
  return { gate, evidence };
}

function baseApproval(requestId: string, overrides: Partial<{
  approvalId: string;
  approverId: string;
  approverAuthorityClass: "analyst" | "reviewer" | "manager" | "compliance_officer";
  approvedAt: string;
}> = {}) {
  return {
    approvalId: overrides.approvalId ?? `approval_${requestId}`,
    approverId: overrides.approverId ?? "compliance_officer_001",
    forRequestId: requestId,
    approverAuthorityClass: overrides.approverAuthorityClass ?? ("compliance_officer" as const),
    privilegedAuthSatisfied: true,
    immutableSignature: `sig_${requestId}`,
    approvedAt: overrides.approvedAt ?? "2026-04-23T10:00:00.000Z"
  };
}

function baseRequest(requestId: string, overrides: Partial<GovernedRequest> = {}): GovernedRequest {
  return {
    requestId,
    workflowClass: "fraud_triage",
    jurisdiction: "EU",
    actorId: "analyst_001",
    actorAuthorityClass: "analyst",
    proposedActionClass: "account_hold",
    proposal: {
      proposalSourceKind: "deterministic_rule",
      authorityBearing: false,
      requestedActionClass: "account_hold",
      confidence: 0.85,
      reasonCodes: ["risk_signal"],
      proposalCreatedAt: "2026-04-23T09:00:00.000Z"
    },
    sensitive: true,
    prohibitedUse: false,
    policyPackRef: { id: "policy_v1", version: "1.0.0" },
    provenanceRef: {
      modelVersion: "model_1.0.0",
      ruleSetVersion: "rules_1.0.0",
      sourceHash: "sha256:abc123def456"
    },
    approvalRequired: true,
    approvalArtifact: baseApproval(requestId),
    loggingReady: true,
    controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: `vr_${requestId}` },
    trustState: { trusted: true, trustStateId: `ts_${requestId}` },
    createdAt: "2026-04-23T09:00:00.000Z",
    ...overrides
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CASE 1 — Minimal justification approval
//
// The proposal carries a single generic reason code with no meaningful
// explanation. CerbaSeal does not evaluate reasoning quality — it only
// checks that reasonCodes is non-empty (structural requirement).
// ─────────────────────────────────────────────────────────────────────────────
describe("Case 1 — Minimal justification approval", () => {
  const { gate, evidence } = makeServices();

  const request = baseRequest("ctx_boundary_001", {
    proposal: {
      proposalSourceKind: "deterministic_rule",
      authorityBearing: false,
      requestedActionClass: "account_hold",
      confidence: null,           // no confidence score
      reasonCodes: ["generic_flag"],  // minimal, non-explanatory
      proposalCreatedAt: "2026-04-23T09:00:00.000Z"
    }
  });

  const result = gate.evaluate(request);
  const bundle = evidence.createBundle({ request, gateResult: result });

  it("produces ALLOW despite minimal justification", () => {
    expect(result.decisionEnvelope.finalState).toBe("ALLOW");
  });

  it("issues a ReleaseAuthorization", () => {
    expect(result.releaseAuthorization).not.toBeNull();
    expect(result.releaseAuthorization!.requestId).toBe("ctx_boundary_001");
  });

  it("produces a valid 3-event evidence bundle", () => {
    expect(bundle.eventChain).toHaveLength(3);
    expect(bundle.eventChain[0]!.eventType).toBe("REQUEST_EVALUATED");
    expect(bundle.eventChain[1]!.eventType).toBe("RELEASE_AUTHORIZED");
    expect(bundle.eventChain[2]!.eventType).toBe("EVIDENCE_BUNDLE_CREATED");
  });

  it("system does not evaluate quality or depth of justification", () => {
    // The only structural check on reasonCodes is that the array is non-empty.
    // A single generic code satisfies the requirement.
    expect(result.decisionEnvelope.finalState).not.toBe("REJECT");
    expect(result.decisionEnvelope.finalState).not.toBe("HOLD");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CASE 2 — Suspicious but structurally valid approval
//
// The reasonCodes do not logically justify the requested action. A human
// reviewer might question the decision. CerbaSeal does not — it only checks
// that the authorization structure is complete and correctly formed.
// ─────────────────────────────────────────────────────────────────────────────
describe("Case 2 — Suspicious but structurally valid approval", () => {
  const { gate, evidence } = makeServices();

  const request = baseRequest("ctx_boundary_002", {
    proposedActionClass: "account_hold",
    proposal: {
      proposalSourceKind: "deterministic_rule",
      authorityBearing: false,
      requestedActionClass: "account_hold",
      confidence: 0.51,
      // Reason codes that do not clearly justify an account_hold action
      reasonCodes: ["routine_check", "low_priority_review"],
      proposalCreatedAt: "2026-04-23T09:00:00.000Z"
    }
  });

  const result = gate.evaluate(request);
  const bundle = evidence.createBundle({ request, gateResult: result });

  it("produces ALLOW despite semantically weak reasoning", () => {
    expect(result.decisionEnvelope.finalState).toBe("ALLOW");
  });

  it("issues a ReleaseAuthorization for the high-impact action", () => {
    expect(result.releaseAuthorization).not.toBeNull();
    expect(result.releaseAuthorization!.actionClass).toBe("account_hold");
  });

  it("produces a valid 3-event evidence bundle", () => {
    expect(bundle.eventChain).toHaveLength(3);
    expect(bundle.eventChain[1]!.eventType).toBe("RELEASE_AUTHORIZED");
  });

  it("system does not evaluate semantic correctness of the decision", () => {
    // Contextual correctness is the domain of upstream decision systems
    // and human reviewers. CerbaSeal validates the authorization structure.
    expect(result.decisionEnvelope.finalState).not.toBe("REJECT");
    expect(result.decisionEnvelope.finalState).not.toBe("HOLD");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CASE 3 — Over-permissive approval authority
//
// The approverAuthorityClass is "analyst" — a valid class but one that could
// be considered insufficiently senior for a high-impact action. CerbaSeal
// checks that the authority class is within the allowed set. It does not
// evaluate whether the authority is appropriate for the specific action.
// ─────────────────────────────────────────────────────────────────────────────
describe("Case 3 — Over-permissive approval authority", () => {
  const { gate, evidence } = makeServices();

  const request = baseRequest("ctx_boundary_003", {
    approvalArtifact: {
      ...baseApproval("ctx_boundary_003"),
      approverId: "analyst_jones_t",
      approverAuthorityClass: "analyst",   // valid class, but lowest authority tier
    }
  });

  const result = gate.evaluate(request);
  const bundle = evidence.createBundle({ request, gateResult: result });

  it("produces ALLOW for a valid but lowest-tier authority class", () => {
    expect(result.decisionEnvelope.finalState).toBe("ALLOW");
  });

  it("issues a ReleaseAuthorization", () => {
    expect(result.releaseAuthorization).not.toBeNull();
  });

  it("produces a valid 3-event evidence bundle", () => {
    expect(bundle.eventChain).toHaveLength(3);
    expect(bundle.eventChain[1]!.eventType).toBe("RELEASE_AUTHORIZED");
  });

  it("system validates authority class membership, not appropriateness of seniority", () => {
    // All four human authority classes (analyst, reviewer, manager,
    // compliance_officer) are treated as equally valid by the gate.
    // Seniority requirements are a domain-specific concern, not a
    // CerbaSeal structural invariant.
    expect(result.decisionEnvelope.finalState).not.toBe("REJECT");
    expect(result.decisionEnvelope.finalState).not.toBe("HOLD");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CASE 4 — Repeated approvals across unrelated actions (same approverId)
//
// The same approver issues approvals for multiple unrelated requests. Each
// approval is correctly bound to its requestId. CerbaSeal evaluates each
// request independently. It does not track behavioral patterns, approval
// frequency, or cross-request anomalies.
// ─────────────────────────────────────────────────────────────────────────────
describe("Case 4 — Repeated approvals across unrelated actions", () => {
  const SHARED_APPROVER = "compliance_officer_chen_r";

  const requestIds = [
    "ctx_boundary_004a",
    "ctx_boundary_004b",
    "ctx_boundary_004c"
  ];

  const requests = requestIds.map(id =>
    baseRequest(id, {
      approvalArtifact: {
        ...baseApproval(id),
        approverId: SHARED_APPROVER,
        approvalId: `approval_${id}`
      }
    })
  );

  it("each request with shared approverId independently produces ALLOW", () => {
    const { gate } = makeServices();
    for (const request of requests) {
      const result = gate.evaluate(request);
      expect(result.decisionEnvelope.finalState).toBe("ALLOW");
      expect(result.releaseAuthorization).not.toBeNull();
      expect(result.releaseAuthorization!.requestId).toBe(request.requestId);
    }
  });

  it("each produces a valid 3-event evidence bundle", () => {
    for (const request of requests) {
      const { gate, evidence } = makeServices();
      const result = gate.evaluate(request);
      const bundle = evidence.createBundle({ request, gateResult: result });
      expect(bundle.eventChain).toHaveLength(3);
      expect(bundle.eventChain[1]!.eventType).toBe("RELEASE_AUTHORIZED");
    }
  });

  it("system does not track approver behavior or cross-request approval patterns", () => {
    // Each evaluation is stateless relative to prior evaluations.
    // Behavioral anomaly detection is out of scope for the enforcement gate.
    const { gate } = makeServices();
    const results = requests.map(r => gate.evaluate(r));
    expect(results.every(r => r.decisionEnvelope.finalState === "ALLOW")).toBe(true);
    expect(results.every(r => r.releaseAuthorization !== null)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CASE 5 — Valid approval with significantly earlier approvedAt timestamp
//
// The approvalArtifact.approvedAt predates the request.createdAt by a large
// margin. This could indicate a stale or pre-signed approval. CerbaSeal
// records both timestamps but does not compare them. Timestamp semantics are
// a documented known gap.
// ─────────────────────────────────────────────────────────────────────────────
describe("Case 5 — Valid approval with earlier approvedAt timestamp", () => {
  const { gate, evidence } = makeServices();

  const request = baseRequest("ctx_boundary_005", {
    createdAt: "2026-04-23T09:00:00.000Z",
    approvalArtifact: {
      ...baseApproval("ctx_boundary_005"),
      // Approval issued 30 days before the request was created
      approvedAt: "2026-03-24T09:00:00.000Z"
    }
  });

  const result = gate.evaluate(request);
  const bundle = evidence.createBundle({ request, gateResult: result });

  it("produces ALLOW despite approval predating the request by 30 days", () => {
    expect(result.decisionEnvelope.finalState).toBe("ALLOW");
  });

  it("issues a ReleaseAuthorization", () => {
    expect(result.releaseAuthorization).not.toBeNull();
  });

  it("produces a valid 3-event evidence bundle", () => {
    expect(bundle.eventChain).toHaveLength(3);
    expect(bundle.eventChain[1]!.eventType).toBe("RELEASE_AUTHORIZED");
  });

  it("system does not compare approvedAt against createdAt (documented known gap)", () => {
    // approvedAt is recorded in the approval artifact but is not read by the gate.
    // Expiry enforcement is a known gap documented in docs/status/current-state.md.
    expect(result.decisionEnvelope.finalState).not.toBe("REJECT");
    expect(result.decisionEnvelope.finalState).not.toBe("HOLD");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CASE 6 — Valid structure, potentially harmful action
//
// All invariants are satisfied. The proposed action (escalate) could cause
// real-world harm if the decision is wrong. CerbaSeal does not evaluate
// intent, outcome likelihood, or harm potential. It enforces authorization.
// Responsibility for the correctness of the decision lies with upstream
// systems and the approving human authority.
// ─────────────────────────────────────────────────────────────────────────────
describe("Case 6 — Valid structure, potentially harmful action", () => {
  const { gate, evidence } = makeServices();

  const request = baseRequest("ctx_boundary_006", {
    proposedActionClass: "escalate",
    proposal: {
      proposalSourceKind: "deterministic_rule",
      authorityBearing: false,
      requestedActionClass: "escalate",
      confidence: 0.61,   // moderately confident — not certainty
      reasonCodes: ["anomaly_detected"],
      proposalCreatedAt: "2026-04-23T09:00:00.000Z"
    },
    approvalArtifact: {
      ...baseApproval("ctx_boundary_006"),
      forRequestId: "ctx_boundary_006"
    }
  });

  const result = gate.evaluate(request);
  const bundle = evidence.createBundle({ request, gateResult: result });

  it("produces ALLOW for a potentially harmful but fully authorized action", () => {
    expect(result.decisionEnvelope.finalState).toBe("ALLOW");
  });

  it("issues a ReleaseAuthorization for the escalate action", () => {
    expect(result.releaseAuthorization).not.toBeNull();
    expect(result.releaseAuthorization!.actionClass).toBe("escalate");
  });

  it("produces a valid 3-event evidence bundle", () => {
    expect(bundle.eventChain).toHaveLength(3);
    expect(bundle.eventChain[1]!.eventType).toBe("RELEASE_AUTHORIZED");
  });

  it("system enforces authorization, not intent or harm potential", () => {
    // Harm assessment and outcome suitability are out of scope.
    // CerbaSeal's responsibility ends at producing a governed, auditable decision.
    // The evidence bundle provides full traceability if the action is later reviewed.
    expect(result.decisionEnvelope.finalState).not.toBe("REJECT");
    expect(result.decisionEnvelope.finalState).not.toBe("HOLD");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL ASSERTIONS
// Exhaustive check: every contextual boundary case produced ALLOW
// ─────────────────────────────────────────────────────────────────────────────
describe("Global assertions — all contextual boundary cases produce ALLOW", () => {

  const cases: Array<{ label: string; request: GovernedRequest }> = [
    {
      label: "minimal justification (generic_flag only)",
      request: baseRequest("global_ctx_001", {
        proposal: {
          proposalSourceKind: "deterministic_rule",
          authorityBearing: false,
          requestedActionClass: "account_hold",
          confidence: null,
          reasonCodes: ["generic_flag"],
          proposalCreatedAt: "2026-04-23T09:00:00.000Z"
        }
      })
    },
    {
      label: "semantically weak reasoning for high-impact action",
      request: baseRequest("global_ctx_002", {
        proposal: {
          proposalSourceKind: "deterministic_rule",
          authorityBearing: false,
          requestedActionClass: "account_hold",
          confidence: 0.51,
          reasonCodes: ["routine_check", "low_priority_review"],
          proposalCreatedAt: "2026-04-23T09:00:00.000Z"
        }
      })
    },
    {
      label: "analyst-tier approver on sensitive action",
      request: baseRequest("global_ctx_003", {
        approvalArtifact: {
          ...baseApproval("global_ctx_003"),
          approverAuthorityClass: "analyst"
        }
      })
    },
    {
      label: "repeated approverId across requests",
      request: baseRequest("global_ctx_004", {
        approvalArtifact: {
          ...baseApproval("global_ctx_004"),
          approverId: "compliance_officer_chen_r"
        }
      })
    },
    {
      label: "approval predating request by 30 days",
      request: baseRequest("global_ctx_005", {
        approvalArtifact: {
          ...baseApproval("global_ctx_005"),
          approvedAt: "2026-03-24T09:00:00.000Z"
        }
      })
    },
    {
      label: "escalate action with moderate confidence and valid approval",
      request: baseRequest("global_ctx_006", {
        proposedActionClass: "escalate",
        proposal: {
          proposalSourceKind: "deterministic_rule",
          authorityBearing: false,
          requestedActionClass: "escalate",
          confidence: 0.61,
          reasonCodes: ["anomaly_detected"],
          proposalCreatedAt: "2026-04-23T09:00:00.000Z"
        },
        approvalArtifact: { ...baseApproval("global_ctx_006") }
      })
    }
  ];

  it("all 6 contextual boundary cases produce ALLOW with no REJECT or HOLD", () => {
    const { gate } = makeServices();
    for (const { label, request } of cases) {
      const result = gate.evaluate(request);
      expect(result.decisionEnvelope.finalState, `Expected ALLOW for: ${label}`).toBe("ALLOW");
      expect(result.releaseAuthorization, `Expected ReleaseAuthorization for: ${label}`).not.toBeNull();
      expect(result.blockedActionRecord, `Expected no BlockedActionRecord for: ${label}`).toBeNull();
    }
  });

  it("all 6 cases produce valid 3-event evidence bundles with RELEASE_AUTHORIZED at position 1", () => {
    for (const { label, request } of cases) {
      const { gate, evidence } = makeServices();
      const result = gate.evaluate(request);
      const bundle = evidence.createBundle({ request, gateResult: result });
      expect(bundle.eventChain, `Expected 3 events for: ${label}`).toHaveLength(3);
      expect(bundle.eventChain[0]!.eventType, label).toBe("REQUEST_EVALUATED");
      expect(bundle.eventChain[1]!.eventType, label).toBe("RELEASE_AUTHORIZED");
      expect(bundle.eventChain[2]!.eventType, label).toBe("EVIDENCE_BUNDLE_CREATED");
    }
  });

});
