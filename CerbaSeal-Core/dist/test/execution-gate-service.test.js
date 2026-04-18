import { describe, expect, it } from "vitest";
import { ExecutionGateService } from "../src/services/execution/execution-gate-service.js";
import { buildValidGovernedRequest } from "../src/domain/builders/request-fixtures.js";
import { REASON_CODES } from "../src/domain/constants/reason-codes.js";
describe("ExecutionGateService", () => {
    const service = new ExecutionGateService();
    it("allows a fully valid governed request", () => {
        const request = buildValidGovernedRequest();
        const result = service.evaluate(request);
        expect(result.decisionEnvelope.finalState).toBe("ALLOW");
        expect(result.decisionEnvelope.permittedActionClass).toBe("escalate");
        expect(result.releaseAuthorization).not.toBeNull();
        expect(result.blockedActionRecord).toBeNull();
        expect(result.decisionEnvelope.immutable).toBe(true);
        expect(result.decisionEnvelope.trace.reasonCodes).toEqual([
            REASON_CODES.DECISION_ALLOWED
        ]);
    });
    it("rejects when policy pack is missing", () => {
        const request = buildValidGovernedRequest();
        request.policyPackRef = null;
        const result = service.evaluate(request);
        expect(result.decisionEnvelope.finalState).toBe("REJECT");
        expect(result.releaseAuthorization).toBeNull();
        expect(result.blockedActionRecord).not.toBeNull();
        expect(result.decisionEnvelope.trace.reasonCodes).toContain(REASON_CODES.NO_POLICY_PACK);
    });
    it("rejects when provenance is missing", () => {
        const request = buildValidGovernedRequest();
        request.provenanceRef = null;
        const result = service.evaluate(request);
        expect(result.decisionEnvelope.finalState).toBe("REJECT");
        expect(result.releaseAuthorization).toBeNull();
        expect(result.blockedActionRecord).not.toBeNull();
        expect(result.decisionEnvelope.trace.reasonCodes).toContain(REASON_CODES.NO_PROVENANCE);
    });
    it("holds when approval is required but missing", () => {
        const request = buildValidGovernedRequest();
        request.approvalArtifact = null;
        const result = service.evaluate(request);
        expect(result.decisionEnvelope.finalState).toBe("HOLD");
        expect(result.releaseAuthorization).toBeNull();
        expect(result.blockedActionRecord?.finalState).toBe("HOLD");
        expect(result.decisionEnvelope.trace.reasonCodes).toContain(REASON_CODES.REQUIRED_APPROVAL_MISSING);
    });
    it("rejects when privileged authentication is not satisfied", () => {
        const request = buildValidGovernedRequest();
        if (!request.approvalArtifact) {
            throw new Error("Fixture error");
        }
        request.approvalArtifact.privilegedAuthSatisfied = false;
        const result = service.evaluate(request);
        expect(result.decisionEnvelope.finalState).toBe("REJECT");
        expect(result.releaseAuthorization).toBeNull();
        expect(result.decisionEnvelope.trace.reasonCodes).toContain(REASON_CODES.PRIVILEGED_AUTH_NOT_SATISFIED);
    });
    it("rejects when immutable approval signature is missing", () => {
        const request = buildValidGovernedRequest();
        if (!request.approvalArtifact) {
            throw new Error("Fixture error");
        }
        request.approvalArtifact.immutableSignature = "";
        const result = service.evaluate(request);
        expect(result.decisionEnvelope.finalState).toBe("REJECT");
        expect(result.releaseAuthorization).toBeNull();
        expect(result.decisionEnvelope.trace.reasonCodes).toContain(REASON_CODES.APPROVAL_SIGNATURE_MISSING);
    });
    it("rejects when logging is not ready", () => {
        const request = buildValidGovernedRequest();
        request.loggingReady = false;
        const result = service.evaluate(request);
        expect(result.decisionEnvelope.finalState).toBe("REJECT");
        expect(result.releaseAuthorization).toBeNull();
        expect(result.decisionEnvelope.trace.reasonCodes).toContain(REASON_CODES.LOGGING_NOT_READY);
    });
    it("rejects prohibited use", () => {
        const request = buildValidGovernedRequest();
        request.prohibitedUse = true;
        const result = service.evaluate(request);
        expect(result.decisionEnvelope.finalState).toBe("REJECT");
        expect(result.releaseAuthorization).toBeNull();
        expect(result.decisionEnvelope.trace.reasonCodes).toContain(REASON_CODES.PROHIBITED_USE);
    });
    it("rejects when controls are stale on a sensitive flow", () => {
        const request = buildValidGovernedRequest();
        request.controlStatus.stale = true;
        const result = service.evaluate(request);
        expect(result.decisionEnvelope.finalState).toBe("REJECT");
        expect(result.releaseAuthorization).toBeNull();
        expect(result.decisionEnvelope.trace.reasonCodes).toContain(REASON_CODES.CONTROL_STALE_OR_INVALID);
    });
    it("rejects when controls are invalid on a sensitive flow", () => {
        const request = buildValidGovernedRequest();
        request.controlStatus.criticalControlsValid = false;
        const result = service.evaluate(request);
        expect(result.decisionEnvelope.finalState).toBe("REJECT");
        expect(result.releaseAuthorization).toBeNull();
        expect(result.decisionEnvelope.trace.reasonCodes).toContain(REASON_CODES.CONTROL_STALE_OR_INVALID);
    });
    it("rejects when trust state is invalid", () => {
        const request = buildValidGovernedRequest();
        request.trustState.trusted = false;
        const result = service.evaluate(request);
        expect(result.decisionEnvelope.finalState).toBe("REJECT");
        expect(result.releaseAuthorization).toBeNull();
        expect(result.decisionEnvelope.trace.reasonCodes).toContain(REASON_CODES.TRUST_STATE_INVALID);
    });
    it("rejects when the proposal crosses the authority boundary", () => {
        const request = buildValidGovernedRequest();
        request.proposal.authorityBearing = true;
        const result = service.evaluate(request);
        expect(result.decisionEnvelope.finalState).toBe("REJECT");
        expect(result.releaseAuthorization).toBeNull();
        expect(result.decisionEnvelope.trace.reasonCodes).toContain(REASON_CODES.AI_CANNOT_AUTHORIZE);
    });
    it("rejects when action class is malformed", () => {
        const request = buildValidGovernedRequest();
        request.proposedActionClass = "wire_money_now";
        request.proposal.requestedActionClass = "wire_money_now";
        const result = service.evaluate(request);
        expect(result.decisionEnvelope.finalState).toBe("REJECT");
        expect(result.releaseAuthorization).toBeNull();
        expect(result.decisionEnvelope.trace.reasonCodes).toContain(REASON_CODES.UNKNOWN_ACTION_CLASS);
    });
    it("rejects when proposal action does not match declared action", () => {
        const request = buildValidGovernedRequest();
        request.proposedActionClass = "escalate";
        request.proposal.requestedActionClass = "allow";
        const result = service.evaluate(request);
        expect(result.decisionEnvelope.finalState).toBe("REJECT");
        expect(result.releaseAuthorization).toBeNull();
        expect(result.decisionEnvelope.trace.reasonCodes).toContain(REASON_CODES.INVALID_PROPOSAL);
    });
    it("rejects malformed requests", () => {
        const request = buildValidGovernedRequest();
        request.jurisdiction = "";
        request.proposal.reasonCodes = [];
        const result = service.evaluate(request);
        expect(result.decisionEnvelope.finalState).toBe("REJECT");
        expect(result.releaseAuthorization).toBeNull();
        expect(result.decisionEnvelope.trace.reasonCodes).toContain(REASON_CODES.MALFORMED_REQUEST);
    });
    it("never issues release authorization for HOLD results", () => {
        const request = buildValidGovernedRequest();
        request.approvalArtifact = null;
        const result = service.evaluate(request);
        expect(result.decisionEnvelope.finalState).toBe("HOLD");
        expect(result.releaseAuthorization).toBeNull();
        expect(result.blockedActionRecord).not.toBeNull();
    });
    it("never issues release authorization for REJECT results", () => {
        const request = buildValidGovernedRequest();
        request.policyPackRef = null;
        const result = service.evaluate(request);
        expect(result.decisionEnvelope.finalState).toBe("REJECT");
        expect(result.releaseAuthorization).toBeNull();
        expect(result.blockedActionRecord).not.toBeNull();
    });
    it("always emits an immutable decision envelope on both allow and blocked outcomes", () => {
        const allowed = service.evaluate(buildValidGovernedRequest());
        const rejectedRequest = buildValidGovernedRequest();
        rejectedRequest.provenanceRef = null;
        const rejected = service.evaluate(rejectedRequest);
        expect(allowed.decisionEnvelope.immutable).toBe(true);
        expect(rejected.decisionEnvelope.immutable).toBe(true);
    });
    it("always emits a blocked action record for blocked outcomes", () => {
        const holdRequest = buildValidGovernedRequest();
        holdRequest.approvalArtifact = null;
        const holdResult = service.evaluate(holdRequest);
        const rejectRequest = buildValidGovernedRequest();
        rejectRequest.loggingReady = false;
        const rejectResult = service.evaluate(rejectRequest);
        expect(holdResult.blockedActionRecord).not.toBeNull();
        expect(rejectResult.blockedActionRecord).not.toBeNull();
    });
});
