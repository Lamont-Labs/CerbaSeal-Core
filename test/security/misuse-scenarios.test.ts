/**
 * Misuse Scenario Test Pass
 *
 * Simulates incorrect or malformed real-world usage patterns and verifies
 * the system fails safely and predictably. No test in this file may produce
 * an unexpected ALLOW state.
 *
 * Each test documents:
 *   - what the caller is doing wrong
 *   - what the system does about it
 *   - whether this is a known gap (documented limitation) or a hard guarantee
 */

import { describe, it, expect } from "vitest";
import { ExecutionGateService } from "../../src/services/execution/execution-gate-service.js";
import { EvidenceBundleService } from "../../src/services/evidence/evidence-bundle-service.js";
import { AppendOnlyLogService } from "../../src/services/audit/append-only-log-service.js";
import { CerbaSealError } from "../../src/domain/errors/cerbaseal-error.js";
import { buildValidGovernedRequest } from "../../src/domain/builders/request-fixtures.js";
import type { GovernedRequest } from "../../src/domain/types/core.js";

function makeGate() {
  return new ExecutionGateService();
}

// ─────────────────────────────────────────────────────────────────────────────
// CASE 1 — Unknown actorAuthorityClass
//
// Caller supplies an authority class not defined in the type system.
// Known gap: the gate only checks actorAuthorityClass === "ai".
// Unknown non-AI values are not explicitly rejected.
// Safety property tested: unknown classes do NOT produce a silent ALLOW
// without satisfying all other invariants (approval, trust, etc.).
// ─────────────────────────────────────────────────────────────────────────────
describe("Case 1 — Unknown actorAuthorityClass", () => {

  it("'external_bot' on fraud_triage without approval produces HOLD, not ALLOW", () => {
    const gate = makeGate();
    const request: GovernedRequest = {
      ...buildValidGovernedRequest(),
      requestId: "misuse_001_no_approval",
      actorAuthorityClass: "external_bot" as unknown as "analyst",
      approvalRequired: false,    // caller tries to opt out
      approvalArtifact: null      // and provides no artifact
    };

    const result = gate.evaluate(request);

    // fraud_triage hardcodes approval — HOLD, not ALLOW
    expect(result.decisionEnvelope.finalState).not.toBe("ALLOW");
    expect(result.decisionEnvelope.finalState).toBe("HOLD");
    expect(result.decisionEnvelope.trace.reasonCodes).toContain("REQUIRED_APPROVAL_MISSING");
    expect(result.releaseAuthorization).toBeNull();
  });

  it("'admin_override' on fraud_triage without approval produces HOLD, not ALLOW", () => {
    const gate = makeGate();
    const request: GovernedRequest = {
      ...buildValidGovernedRequest(),
      requestId: "misuse_001b_no_approval",
      actorAuthorityClass: "admin_override" as unknown as "analyst",
      approvalRequired: false,
      approvalArtifact: null
    };

    const result = gate.evaluate(request);

    expect(result.decisionEnvelope.finalState).not.toBe("ALLOW");
    expect(result.decisionEnvelope.finalState).toBe("HOLD");
    expect(result.releaseAuthorization).toBeNull();
  });

  it("KNOWN GAP — 'external_bot' with a structurally valid approval passes all checks and produces ALLOW", () => {
    // This test documents a known limitation: the gate does not validate that
    // actorAuthorityClass is within the defined AuthorityClass union at runtime.
    // Only the approvalArtifact.approverAuthorityClass is enforced. An actor
    // declaring an unknown authority class that is not "ai" bypasses the AI
    // block and, if it supplies a structurally valid approval, reaches ALLOW.
    // This is documented in docs/status/current-state.md under Known Gaps.
    const gate = makeGate();
    const request: GovernedRequest = {
      ...buildValidGovernedRequest(),
      requestId: "misuse_001c_known_gap",
      actorAuthorityClass: "external_bot" as unknown as "analyst",
      proposal: {
        ...buildValidGovernedRequest().proposal,
        proposalSourceKind: "deterministic_rule",
        requestedActionClass: "escalate"
      },
      proposedActionClass: "escalate",
      approvalRequired: true,
      approvalArtifact: {
        approvalId: "approval_gap_001",
        approverId: "compliance_officer_001",
        forRequestId: "misuse_001c_known_gap",
        approverAuthorityClass: "compliance_officer",
        privilegedAuthSatisfied: true,
        immutableSignature: "sig_gap_001",
        approvedAt: "2026-04-23T00:00:00.000Z"
      }
    };

    const result = gate.evaluate(request);

    // Document the actual (gap) behavior — do not assert it should be REJECT.
    // The important thing is the system is honest about its limitation.
    expect(result.decisionEnvelope.finalState).toBe("ALLOW");
    // Verification: this is why actorAuthorityClass runtime validation is listed
    // as a known gap and must be addressed before production hardening.
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// CASE 2 — ApprovalArtifact present but incorrectly bound
// ─────────────────────────────────────────────────────────────────────────────
describe("Case 2 — ApprovalArtifact with bad requestId binding", () => {

  it("approval with empty forRequestId produces REJECT", () => {
    const gate = makeGate();
    const base = buildValidGovernedRequest();
    const request: GovernedRequest = {
      ...base,
      requestId: "misuse_002a",
      approvalArtifact: {
        ...base.approvalArtifact!,
        forRequestId: ""   // empty — cannot match any real requestId
      }
    };

    const result = gate.evaluate(request);

    expect(result.decisionEnvelope.finalState).toBe("REJECT");
    expect(result.decisionEnvelope.trace.reasonCodes).toContain("INVALID_APPROVAL_AUTHORITY");
    expect(result.releaseAuthorization).toBeNull();
    expect(result.blockedActionRecord).not.toBeNull();
  });

  it("approval with mismatched forRequestId produces REJECT", () => {
    const gate = makeGate();
    const base = buildValidGovernedRequest();
    const request: GovernedRequest = {
      ...base,
      requestId: "misuse_002b",
      approvalArtifact: {
        ...base.approvalArtifact!,
        forRequestId: "completely_different_request_999"  // wrong request
      }
    };

    const result = gate.evaluate(request);

    expect(result.decisionEnvelope.finalState).toBe("REJECT");
    expect(result.decisionEnvelope.trace.reasonCodes).toContain("INVALID_APPROVAL_AUTHORITY");
    expect(result.releaseAuthorization).toBeNull();
  });

  it("approval bound to a prior requestId cannot be reused for a new request", () => {
    const gate = makeGate();
    const base = buildValidGovernedRequest();

    // Simulate approval issued for req_original being replayed on req_new
    const request: GovernedRequest = {
      ...base,
      requestId: "req_new_misuse_002c",
      approvalArtifact: {
        ...base.approvalArtifact!,
        forRequestId: "req_original"   // approval was for a different request
      }
    };

    const result = gate.evaluate(request);

    expect(result.decisionEnvelope.finalState).toBe("REJECT");
    expect(result.decisionEnvelope.trace.reasonCodes).toContain("INVALID_APPROVAL_AUTHORITY");
    expect(result.releaseAuthorization).toBeNull();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// CASE 3 — approvalRequired: false on fraud_triage
//
// Caller tries to opt out of approval enforcement by setting
// approvalRequired: false. The gate hardcodes approval for fraud_triage
// regardless of this flag.
// ─────────────────────────────────────────────────────────────────────────────
describe("Case 3 — approvalRequired: false on fraud_triage", () => {

  it("approvalRequired: false on fraud_triage without artifact produces HOLD", () => {
    const gate = makeGate();
    const request: GovernedRequest = {
      ...buildValidGovernedRequest(),
      requestId: "misuse_003a",
      workflowClass: "fraud_triage",
      actorAuthorityClass: "analyst",
      proposal: {
        ...buildValidGovernedRequest().proposal,
        proposalSourceKind: "deterministic_rule",
        requestedActionClass: "account_hold"
      },
      proposedActionClass: "account_hold",
      approvalRequired: false,   // caller opts out
      approvalArtifact: null     // no artifact
    };

    const result = gate.evaluate(request);

    // Hardcoded enforcement still fires
    expect(result.decisionEnvelope.finalState).toBe("HOLD");
    expect(result.decisionEnvelope.trace.reasonCodes).toContain("REQUIRED_APPROVAL_MISSING");
    expect(result.releaseAuthorization).toBeNull();
  });

  it("humanApprovalRequired on the envelope reflects the caller flag, not effective enforcement", () => {
    // Known behaviour: DecisionEnvelope.humanApprovalRequired is set from the
    // caller-supplied request.approvalRequired, not from the effective
    // (hardcoded) value. The enforcement still runs. This is a documentation
    // note — the envelope field is advisory; the actual decision is what matters.
    const gate = makeGate();
    const request: GovernedRequest = {
      ...buildValidGovernedRequest(),
      requestId: "misuse_003b",
      workflowClass: "fraud_triage",
      actorAuthorityClass: "analyst",
      proposal: {
        ...buildValidGovernedRequest().proposal,
        proposalSourceKind: "deterministic_rule",
        requestedActionClass: "account_hold"
      },
      proposedActionClass: "account_hold",
      approvalRequired: false,
      approvalArtifact: null
    };

    const result = gate.evaluate(request);

    // Outcome is still HOLD — hardcoded enforcement fired
    expect(result.decisionEnvelope.finalState).toBe("HOLD");
    // The envelope records what the caller sent
    expect(result.decisionEnvelope.humanApprovalRequired).toBe(false);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// CASE 4 — trustState.trusted = false
// ─────────────────────────────────────────────────────────────────────────────
describe("Case 4 — trustState.trusted = false", () => {

  it("untrusted trust state produces REJECT", () => {
    const gate = makeGate();
    const request: GovernedRequest = {
      ...buildValidGovernedRequest(),
      requestId: "misuse_004a",
      trustState: { trusted: false, trustStateId: "trust_invalid_001" }
    };

    const result = gate.evaluate(request);

    expect(result.decisionEnvelope.finalState).toBe("REJECT");
    expect(result.decisionEnvelope.trace.reasonCodes).toContain("TRUST_STATE_INVALID");
    expect(result.releaseAuthorization).toBeNull();
    expect(result.blockedActionRecord).not.toBeNull();
    expect(result.blockedActionRecord!.finalState).toBe("REJECT");
  });

  it("untrusted trust state with a valid approval artifact still produces REJECT", () => {
    // Trust check runs before the approval check — a valid approval cannot
    // rescue a request with an invalid trust state.
    const gate = makeGate();
    const base = buildValidGovernedRequest();
    const request: GovernedRequest = {
      ...base,
      requestId: "misuse_004b",
      trustState: { trusted: false, trustStateId: "trust_invalid_002" }
      // approvalArtifact is still present and correct from base fixture
    };

    const result = gate.evaluate(request);

    expect(result.decisionEnvelope.finalState).toBe("REJECT");
    expect(result.decisionEnvelope.trace.reasonCodes).toContain("TRUST_STATE_INVALID");
    expect(result.releaseAuthorization).toBeNull();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// CASE 5 — loggingReady = false
// ─────────────────────────────────────────────────────────────────────────────
describe("Case 5 — loggingReady = false", () => {

  it("logging not ready produces REJECT", () => {
    const gate = makeGate();
    const request: GovernedRequest = {
      ...buildValidGovernedRequest(),
      requestId: "misuse_005a",
      loggingReady: false
    };

    const result = gate.evaluate(request);

    expect(result.decisionEnvelope.finalState).toBe("REJECT");
    expect(result.decisionEnvelope.trace.reasonCodes).toContain("LOGGING_NOT_READY");
    expect(result.releaseAuthorization).toBeNull();
    expect(result.blockedActionRecord).not.toBeNull();
  });

  it("logging not ready with otherwise complete and valid request still produces REJECT", () => {
    // Logging precondition runs before trust, approval, and all other checks.
    // A fully valid request is still blocked if logging is unavailable.
    const gate = makeGate();
    const request: GovernedRequest = {
      ...buildValidGovernedRequest(),
      requestId: "misuse_005b",
      loggingReady: false
    };

    const result = gate.evaluate(request);

    expect(result.decisionEnvelope.finalState).toBe("REJECT");
    expect(result.decisionEnvelope.trace.reasonCodes).toContain("LOGGING_NOT_READY");
    expect(result.releaseAuthorization).toBeNull();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// CASE 6 — Malformed proposal
// ─────────────────────────────────────────────────────────────────────────────
describe("Case 6 — Malformed proposal", () => {

  it("unknown requestedActionClass on proposal produces REJECT", () => {
    const gate = makeGate();
    const base = buildValidGovernedRequest();
    const request: GovernedRequest = {
      ...base,
      requestId: "misuse_006a",
      proposedActionClass: "unknown_action" as unknown as "escalate",
      proposal: {
        ...base.proposal,
        requestedActionClass: "unknown_action"
      }
    };

    const result = gate.evaluate(request);

    expect(result.decisionEnvelope.finalState).toBe("REJECT");
    expect(result.decisionEnvelope.trace.reasonCodes).toContain("UNKNOWN_ACTION_CLASS");
    expect(result.releaseAuthorization).toBeNull();
  });

  it("empty requestedActionClass on proposal produces REJECT", () => {
    const gate = makeGate();
    const base = buildValidGovernedRequest();
    const request: GovernedRequest = {
      ...base,
      requestId: "misuse_006b",
      proposedActionClass: "" as unknown as "escalate",
      proposal: {
        ...base.proposal,
        requestedActionClass: ""
      }
    };

    const result = gate.evaluate(request);

    expect(result.decisionEnvelope.finalState).toBe("REJECT");
    expect(result.releaseAuthorization).toBeNull();
  });

  it("proposal with no reasonCodes produces REJECT as MALFORMED_REQUEST", () => {
    const gate = makeGate();
    const base = buildValidGovernedRequest();
    const request: GovernedRequest = {
      ...base,
      requestId: "misuse_006c",
      proposal: {
        ...base.proposal,
        reasonCodes: []   // assertRequestShape checks this
      }
    };

    const result = gate.evaluate(request);

    expect(result.decisionEnvelope.finalState).toBe("REJECT");
    expect(result.decisionEnvelope.trace.reasonCodes).toContain("MALFORMED_REQUEST");
    expect(result.releaseAuthorization).toBeNull();
  });

  it("proposedActionClass and proposal.requestedActionClass mismatch produces REJECT", () => {
    const gate = makeGate();
    const base = buildValidGovernedRequest();
    const request: GovernedRequest = {
      ...base,
      requestId: "misuse_006d",
      proposedActionClass: "escalate",
      proposal: {
        ...base.proposal,
        requestedActionClass: "account_hold"   // deliberate mismatch
      }
    };

    const result = gate.evaluate(request);

    expect(result.decisionEnvelope.finalState).toBe("REJECT");
    expect(result.decisionEnvelope.trace.reasonCodes).toContain("INVALID_PROPOSAL");
    expect(result.releaseAuthorization).toBeNull();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// CASE 7 — Partial EvidenceBundle creation attempt
// ─────────────────────────────────────────────────────────────────────────────
describe("Case 7 — Partial EvidenceBundle creation attempt", () => {

  it("forged GateResult passed to EvidenceBundleService throws CerbaSealError", () => {
    const log = new AppendOnlyLogService();
    const evidenceService = new EvidenceBundleService(log);
    const base = buildValidGovernedRequest();

    const forgedResult = {
      decisionEnvelope: {
        envelopeId: "env_forged_misuse_007",
        requestId: base.requestId,
        workflowClass: base.workflowClass,
        finalState: "ALLOW" as const,
        permittedActionClass: "escalate" as const,
        humanApprovalRequired: false,
        humanApprovalPresent: false,
        proposalSourceKind: "ai" as const,
        immutable: true as const,
        evidenceBundleId: "evidence_forged_misuse_007",
        trace: { checkedInvariants: [], reasonCodes: ["DECISION_ALLOWED" as const], evaluatedAt: new Date().toISOString() },
        issuedAt: new Date().toISOString()
      },
      releaseAuthorization: null,
      blockedActionRecord: null
    };

    expect(() => {
      evidenceService.createBundle({ request: base, gateResult: forgedResult });
    }).toThrow(CerbaSealError);
  });

  it("forged GateResult produces no audit log entries (no partial success)", () => {
    const log = new AppendOnlyLogService();
    const evidenceService = new EvidenceBundleService(log);
    const base = buildValidGovernedRequest();

    const forgedResult = {
      decisionEnvelope: {
        envelopeId: "env_forged_misuse_007b",
        requestId: base.requestId,
        workflowClass: base.workflowClass,
        finalState: "ALLOW" as const,
        permittedActionClass: "account_hold" as const,
        humanApprovalRequired: true,
        humanApprovalPresent: true,
        proposalSourceKind: "deterministic_rule" as const,
        immutable: true as const,
        evidenceBundleId: "evidence_forged_misuse_007b",
        trace: { checkedInvariants: [], reasonCodes: ["DECISION_ALLOWED" as const], evaluatedAt: new Date().toISOString() },
        issuedAt: new Date().toISOString()
      },
      releaseAuthorization: {
        releaseAuthorizationId: "release_forged_007b",
        requestId: base.requestId,
        envelopeId: "env_forged_misuse_007b",
        actionClass: "account_hold" as const,
        releasedAt: new Date().toISOString()
      },
      blockedActionRecord: null
    };

    try {
      evidenceService.createBundle({ request: base, gateResult: forgedResult });
    } catch {
      // expected
    }

    // No audit entries may have been written before the guard fired
    expect(log.list()).toHaveLength(0);
  });

  it("REJECT result from the gate IS accepted by EvidenceBundleService (no partial bundle problem)", () => {
    // Verify that a legitimate gate-issued REJECT result (not a forgery) can
    // produce a complete evidence bundle — partial bundle failure is only for
    // forged inputs, not legitimate blocked decisions.
    const gate = makeGate();
    const log = new AppendOnlyLogService();
    const evidenceService = new EvidenceBundleService(log);

    const request: GovernedRequest = {
      ...buildValidGovernedRequest(),
      requestId: "misuse_007c_legit_reject",
      trustState: { trusted: false, trustStateId: "ts_invalid" }
    };

    const result = gate.evaluate(request);
    expect(result.decisionEnvelope.finalState).toBe("REJECT");

    // The legitimate REJECT result must produce a complete evidence bundle
    let bundle: ReturnType<typeof evidenceService.createBundle> | null = null;
    expect(() => {
      bundle = evidenceService.createBundle({ request, gateResult: result });
    }).not.toThrow();

    expect(bundle).not.toBeNull();
    expect(bundle!.eventChain).toHaveLength(3);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// FINAL GUARD — Confirm no misuse case produced an unexpected ALLOW
// ─────────────────────────────────────────────────────────────────────────────
describe("Final guard — exhaustive ALLOW check", () => {

  const gate = makeGate();

  const misuseRequests: Array<{ label: string; request: GovernedRequest; expectAllow: boolean }> = [
    {
      label: "unknown actorAuthorityClass, no approval",
      expectAllow: false,
      request: {
        ...buildValidGovernedRequest(),
        requestId: "guard_001",
        actorAuthorityClass: "external_bot" as unknown as "analyst",
        approvalRequired: false,
        approvalArtifact: null
      }
    },
    {
      label: "approval with mismatched forRequestId",
      expectAllow: false,
      request: {
        ...buildValidGovernedRequest(),
        requestId: "guard_002",
        approvalArtifact: {
          ...buildValidGovernedRequest().approvalArtifact!,
          forRequestId: "wrong_request_id"
        }
      }
    },
    {
      label: "approvalRequired: false on fraud_triage, no artifact",
      expectAllow: false,
      request: {
        ...buildValidGovernedRequest(),
        requestId: "guard_003",
        workflowClass: "fraud_triage",
        actorAuthorityClass: "analyst",
        proposal: { ...buildValidGovernedRequest().proposal, proposalSourceKind: "deterministic_rule", requestedActionClass: "account_hold" },
        proposedActionClass: "account_hold",
        approvalRequired: false,
        approvalArtifact: null
      }
    },
    {
      label: "trustState.trusted = false",
      expectAllow: false,
      request: {
        ...buildValidGovernedRequest(),
        requestId: "guard_004",
        trustState: { trusted: false, trustStateId: "ts_bad" }
      }
    },
    {
      label: "loggingReady = false",
      expectAllow: false,
      request: {
        ...buildValidGovernedRequest(),
        requestId: "guard_005",
        loggingReady: false
      }
    },
    {
      label: "unknown requestedActionClass",
      expectAllow: false,
      request: {
        ...buildValidGovernedRequest(),
        requestId: "guard_006a",
        proposedActionClass: "do_the_thing" as unknown as "escalate",
        proposal: { ...buildValidGovernedRequest().proposal, requestedActionClass: "do_the_thing" }
      }
    },
    {
      label: "empty proposal reasonCodes",
      expectAllow: false,
      request: {
        ...buildValidGovernedRequest(),
        requestId: "guard_006b",
        proposal: { ...buildValidGovernedRequest().proposal, reasonCodes: [] }
      }
    },
    {
      label: "action class mismatch between request and proposal",
      expectAllow: false,
      request: {
        ...buildValidGovernedRequest(),
        requestId: "guard_006c",
        proposedActionClass: "escalate",
        proposal: { ...buildValidGovernedRequest().proposal, requestedActionClass: "account_hold" }
      }
    }
  ];

  for (const { label, request, expectAllow } of misuseRequests) {
    it(`"${label}" — finalState is not ALLOW`, () => {
      const result = gate.evaluate(request);
      if (expectAllow) {
        expect(result.decisionEnvelope.finalState).toBe("ALLOW");
      } else {
        expect(result.decisionEnvelope.finalState).not.toBe("ALLOW");
      }
      expect(result.releaseAuthorization).toBeNull();
    });
  }

});
