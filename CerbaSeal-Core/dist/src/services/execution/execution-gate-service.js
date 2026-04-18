import { INVARIANTS } from "../../domain/constants/invariants.js";
import { REASON_CODES } from "../../domain/constants/reason-codes.js";
import { CerbaSealError } from "../../domain/errors/cerbaseal-error.js";
const ALLOWED_ACTION_CLASSES = new Set([
    "allow",
    "hold",
    "reject",
    "escalate",
    "account_hold"
]);
function nowIso() {
    return new Date().toISOString();
}
function deterministicEnvelopeId(requestId) {
    return `env_${requestId}`;
}
function deterministicEvidenceBundleId(requestId) {
    return `evidence_${requestId}`;
}
function deterministicReleaseAuthorizationId(requestId) {
    return `release_${requestId}`;
}
function assertKnownActionClass(actionClass, invariantChecks) {
    invariantChecks.push(INVARIANTS.REQUEST_SCHEMA_AND_ACTION_CLASS_VALID);
    if (!ALLOWED_ACTION_CLASSES.has(actionClass)) {
        throw new CerbaSealError({
            message: "Unknown action class encountered in governed request",
            invariant: INVARIANTS.REQUEST_SCHEMA_AND_ACTION_CLASS_VALID,
            reasonCode: REASON_CODES.UNKNOWN_ACTION_CLASS,
            finalState: "REJECT"
        });
    }
}
function assertRequestShape(request, invariantChecks) {
    invariantChecks.push(INVARIANTS.REQUEST_SCHEMA_AND_ACTION_CLASS_VALID);
    if (request.jurisdiction.trim().length === 0 ||
        request.createdAt.trim().length === 0 ||
        request.proposal.reasonCodes.length === 0) {
        throw new CerbaSealError({
            message: "Governed request is malformed",
            invariant: INVARIANTS.REQUEST_SCHEMA_AND_ACTION_CLASS_VALID,
            reasonCode: REASON_CODES.MALFORMED_REQUEST,
            finalState: "REJECT"
        });
    }
}
function assertPolicyPack(request, invariantChecks) {
    invariantChecks.push(INVARIANTS.NO_POLICY_PACK_NO_EXECUTION);
    if (request.policyPackRef === null) {
        throw new CerbaSealError({
            message: "No policy pack present for governed execution",
            invariant: INVARIANTS.NO_POLICY_PACK_NO_EXECUTION,
            reasonCode: REASON_CODES.NO_POLICY_PACK,
            finalState: "REJECT"
        });
    }
}
function assertProvenance(request, invariantChecks) {
    invariantChecks.push(INVARIANTS.NO_PROVENANCE_NO_ACTION);
    if (request.provenanceRef === null) {
        throw new CerbaSealError({
            message: "No provenance present for governed execution",
            invariant: INVARIANTS.NO_PROVENANCE_NO_ACTION,
            reasonCode: REASON_CODES.NO_PROVENANCE,
            finalState: "REJECT"
        });
    }
    if (request.provenanceRef.modelVersion.trim().length === 0 ||
        request.provenanceRef.ruleSetVersion.trim().length === 0 ||
        request.provenanceRef.sourceHash.trim().length === 0) {
        throw new CerbaSealError({
            message: "Provenance reference is incomplete",
            invariant: INVARIANTS.NO_PROVENANCE_NO_ACTION,
            reasonCode: REASON_CODES.NO_PROVENANCE,
            finalState: "REJECT"
        });
    }
}
function assertLoggingReady(request, invariantChecks) {
    invariantChecks.push(INVARIANTS.NO_LOGGING_NO_EXECUTION);
    if (!request.loggingReady) {
        throw new CerbaSealError({
            message: "Logging precondition failed",
            invariant: INVARIANTS.NO_LOGGING_NO_EXECUTION,
            reasonCode: REASON_CODES.LOGGING_NOT_READY,
            finalState: "REJECT"
        });
    }
}
function assertProposalBoundary(request, invariantChecks) {
    invariantChecks.push(INVARIANTS.AI_NON_AUTHORITATIVE);
    if (request.proposal.authorityBearing) {
        throw new CerbaSealError({
            message: "Proposal crossed the authority boundary",
            invariant: INVARIANTS.AI_NON_AUTHORITATIVE,
            reasonCode: REASON_CODES.AI_CANNOT_AUTHORIZE,
            finalState: "REJECT"
        });
    }
    if (request.proposal.proposalSourceKind === "ai" &&
        request.actorAuthorityClass === "ai" &&
        request.approvalRequired) {
        throw new CerbaSealError({
            message: "AI-originated authority path is not permitted",
            invariant: INVARIANTS.AI_NON_AUTHORITATIVE,
            reasonCode: REASON_CODES.AI_CANNOT_AUTHORIZE,
            finalState: "REJECT"
        });
    }
}
function assertProhibitedUse(request, invariantChecks) {
    invariantChecks.push(INVARIANTS.PROHIBITED_USE_MUST_BLOCK);
    if (request.prohibitedUse) {
        throw new CerbaSealError({
            message: "Prohibited use detected",
            invariant: INVARIANTS.PROHIBITED_USE_MUST_BLOCK,
            reasonCode: REASON_CODES.PROHIBITED_USE,
            finalState: "REJECT"
        });
    }
}
function assertControlStatus(request, invariantChecks) {
    invariantChecks.push(INVARIANTS.STALE_CONTROLS_BLOCK_SENSITIVE_RELEASE);
    if (request.sensitive && (!request.controlStatus.criticalControlsValid || request.controlStatus.stale)) {
        throw new CerbaSealError({
            message: "Critical control status is stale or invalid for sensitive flow",
            invariant: INVARIANTS.STALE_CONTROLS_BLOCK_SENSITIVE_RELEASE,
            reasonCode: REASON_CODES.CONTROL_STALE_OR_INVALID,
            finalState: "REJECT"
        });
    }
}
function assertTrustState(request, invariantChecks) {
    invariantChecks.push(INVARIANTS.TRUST_STATE_REQUIRED);
    if (!request.trustState.trusted) {
        throw new CerbaSealError({
            message: "Trust state invalid",
            invariant: INVARIANTS.TRUST_STATE_REQUIRED,
            reasonCode: REASON_CODES.TRUST_STATE_INVALID,
            finalState: "REJECT"
        });
    }
}
function assertApprovalState(request, invariantChecks) {
    invariantChecks.push(INVARIANTS.NO_REQUIRED_APPROVAL_NO_RELEASE);
    if (!request.approvalRequired) {
        return;
    }
    if (request.approvalArtifact === null) {
        throw new CerbaSealError({
            message: "Approval required but missing",
            invariant: INVARIANTS.NO_REQUIRED_APPROVAL_NO_RELEASE,
            reasonCode: REASON_CODES.REQUIRED_APPROVAL_MISSING,
            finalState: "HOLD"
        });
    }
    if (request.approvalArtifact.approverAuthorityClass !== "analyst" &&
        request.approvalArtifact.approverAuthorityClass !== "reviewer" &&
        request.approvalArtifact.approverAuthorityClass !== "manager" &&
        request.approvalArtifact.approverAuthorityClass !== "compliance_officer") {
        throw new CerbaSealError({
            message: "Invalid approval authority class",
            invariant: INVARIANTS.NO_REQUIRED_APPROVAL_NO_RELEASE,
            reasonCode: REASON_CODES.INVALID_APPROVAL_AUTHORITY,
            finalState: "REJECT"
        });
    }
    if (!request.approvalArtifact.privilegedAuthSatisfied) {
        throw new CerbaSealError({
            message: "Privileged authentication requirement not satisfied",
            invariant: INVARIANTS.NO_REQUIRED_APPROVAL_NO_RELEASE,
            reasonCode: REASON_CODES.PRIVILEGED_AUTH_NOT_SATISFIED,
            finalState: "REJECT"
        });
    }
    if (request.approvalArtifact.immutableSignature.trim().length === 0) {
        throw new CerbaSealError({
            message: "Approval signature missing",
            invariant: INVARIANTS.NO_REQUIRED_APPROVAL_NO_RELEASE,
            reasonCode: REASON_CODES.APPROVAL_SIGNATURE_MISSING,
            finalState: "REJECT"
        });
    }
}
function buildDecisionEnvelope(args) {
    const { request, finalState, reasonCodes, checkedInvariants, permittedActionClass } = args;
    return {
        envelopeId: deterministicEnvelopeId(request.requestId),
        requestId: request.requestId,
        workflowClass: request.workflowClass,
        finalState,
        permittedActionClass,
        humanApprovalRequired: request.approvalRequired,
        humanApprovalPresent: request.approvalArtifact !== null,
        proposalSourceKind: request.proposal.proposalSourceKind,
        immutable: true,
        evidenceBundleId: deterministicEvidenceBundleId(request.requestId),
        trace: {
            checkedInvariants,
            reasonCodes,
            evaluatedAt: nowIso()
        },
        issuedAt: nowIso()
    };
}
function buildBlockedActionRecord(args) {
    return {
        requestId: args.request.requestId,
        finalState: args.finalState,
        reasonCodes: args.reasonCodes,
        checkedInvariants: args.checkedInvariants,
        recordedAt: nowIso()
    };
}
function buildReleaseAuthorization(request, envelope, actionClass) {
    return {
        releaseAuthorizationId: deterministicReleaseAuthorizationId(request.requestId),
        requestId: request.requestId,
        envelopeId: envelope.envelopeId,
        actionClass,
        releasedAt: nowIso()
    };
}
export class ExecutionGateService {
    evaluate(request) {
        const checkedInvariants = [];
        try {
            assertRequestShape(request, checkedInvariants);
            assertKnownActionClass(request.proposedActionClass, checkedInvariants);
            assertKnownActionClass(request.proposal.requestedActionClass, checkedInvariants);
            checkedInvariants.push(INVARIANTS.PROPOSAL_AND_REQUEST_ACTION_MUST_MATCH);
            if (request.proposedActionClass !== request.proposal.requestedActionClass) {
                throw new CerbaSealError({
                    message: "Proposal action and request action do not match",
                    invariant: INVARIANTS.PROPOSAL_AND_REQUEST_ACTION_MUST_MATCH,
                    reasonCode: REASON_CODES.INVALID_PROPOSAL,
                    finalState: "REJECT"
                });
            }
            assertPolicyPack(request, checkedInvariants);
            assertProvenance(request, checkedInvariants);
            assertLoggingReady(request, checkedInvariants);
            assertProposalBoundary(request, checkedInvariants);
            assertProhibitedUse(request, checkedInvariants);
            assertControlStatus(request, checkedInvariants);
            assertTrustState(request, checkedInvariants);
            assertApprovalState(request, checkedInvariants);
            checkedInvariants.push(INVARIANTS.IMMUTABLE_DECISION_ENVELOPE);
            const decisionEnvelope = buildDecisionEnvelope({
                request,
                finalState: "ALLOW",
                reasonCodes: [REASON_CODES.DECISION_ALLOWED],
                checkedInvariants,
                permittedActionClass: request.proposedActionClass
            });
            const releaseAuthorization = buildReleaseAuthorization(request, decisionEnvelope, request.proposedActionClass);
            return {
                decisionEnvelope,
                releaseAuthorization,
                blockedActionRecord: null
            };
        }
        catch (error) {
            if (!(error instanceof CerbaSealError)) {
                throw error;
            }
            checkedInvariants.push(INVARIANTS.IMMUTABLE_DECISION_ENVELOPE);
            const reasonCodes = [
                error.reasonCode,
                error.finalState === "HOLD"
                    ? REASON_CODES.DECISION_HELD
                    : REASON_CODES.DECISION_REJECTED
            ];
            const decisionEnvelope = buildDecisionEnvelope({
                request,
                finalState: error.finalState,
                reasonCodes,
                checkedInvariants,
                permittedActionClass: null
            });
            const blockedActionRecord = buildBlockedActionRecord({
                request,
                finalState: error.finalState,
                reasonCodes,
                checkedInvariants
            });
            return {
                decisionEnvelope,
                releaseAuthorization: null,
                blockedActionRecord
            };
        }
    }
}
