import { describe, it, expect } from "vitest";
import { EvidenceBundleService } from "../../src/services/evidence/evidence-bundle-service.js";
import { AppendOnlyLogService } from "../../src/services/audit/append-only-log-service.js";
import { CerbaSealError } from "../../src/domain/errors/cerbaseal-error.js";
import { buildValidGovernedRequest } from "../../src/domain/builders/request-fixtures.js";
import type { GateResult } from "../../src/domain/types/core.js";

describe("Non-Forgery Guarantee", () => {

  it("manually constructed GateResult is rejected by EvidenceBundleService with CerbaSealError", () => {
    const request = buildValidGovernedRequest();

    // Construct a structurally valid GateResult without going through the gate.
    // This simulates an adversary bypassing ExecutionGateService.evaluate().
    const forgedResult: GateResult = {
      decisionEnvelope: {
        envelopeId: "env_forged_001",
        requestId: request.requestId,
        workflowClass: request.workflowClass,
        finalState: "ALLOW",
        permittedActionClass: "escalate",
        humanApprovalRequired: false,
        humanApprovalPresent: false,
        proposalSourceKind: "ai",
        immutable: true,
        evidenceBundleId: "evidence_forged_001",
        trace: {
          checkedInvariants: [],
          reasonCodes: ["DECISION_ALLOWED"],
          evaluatedAt: new Date().toISOString()
        },
        issuedAt: new Date().toISOString()
      },
      releaseAuthorization: {
        releaseAuthorizationId: "release_forged_001",
        requestId: request.requestId,
        envelopeId: "env_forged_001",
        actionClass: "escalate",
        releasedAt: new Date().toISOString()
      },
      blockedActionRecord: null
    };

    const log = new AppendOnlyLogService();
    const evidenceService = new EvidenceBundleService(log);

    // The evidence service must detect that this result was not issued by the gate
    // and must throw a CerbaSealError, not silently accept it.
    expect(() => {
      evidenceService.createBundle({ request, gateResult: forgedResult });
    }).toThrow(CerbaSealError);
  });

  it("forged GateResult does not produce an evidence bundle under any path", () => {
    const request = buildValidGovernedRequest();

    const forgedResult: GateResult = {
      decisionEnvelope: {
        envelopeId: "env_forged_002",
        requestId: request.requestId,
        workflowClass: request.workflowClass,
        finalState: "ALLOW",
        permittedActionClass: "account_hold",
        humanApprovalRequired: true,
        humanApprovalPresent: true,
        proposalSourceKind: "deterministic_rule",
        immutable: true,
        evidenceBundleId: "evidence_forged_002",
        trace: {
          checkedInvariants: [],
          reasonCodes: ["DECISION_ALLOWED"],
          evaluatedAt: new Date().toISOString()
        },
        issuedAt: new Date().toISOString()
      },
      releaseAuthorization: {
        releaseAuthorizationId: "release_forged_002",
        requestId: request.requestId,
        envelopeId: "env_forged_002",
        actionClass: "account_hold",
        releasedAt: new Date().toISOString()
      },
      blockedActionRecord: null
    };

    const log = new AppendOnlyLogService();
    const evidenceService = new EvidenceBundleService(log);

    let bundle: unknown = null;
    try {
      bundle = evidenceService.createBundle({ request, gateResult: forgedResult });
    } catch {
      // expected
    }

    // No bundle must have been produced
    expect(bundle).toBeNull();
    // No audit events must have been written
    expect(log.list()).toHaveLength(0);
  });

});
