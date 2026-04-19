/**
 * CerbaSeal Enforcement Core
 *
 * This service is the single execution gate for all governed actions.
 * All consequential requests must be evaluated here before any release
 * authorization is issued. No valid execution path exists outside this layer.
 */

import { INVARIANTS, type InvariantCode } from "../../domain/constants/invariants.js";
import { REASON_CODES, type ReasonCode } from "../../domain/constants/reason-codes.js";
import type {
  ActionClass,
  BlockedActionRecord,
  DecisionEnvelope,
  GateResult,
  GovernedRequest,
  ReleaseAuthorization,
  UnknownableActionClass,
  WorkflowClass
} from "../../domain/types/core.js";
import { CerbaSealError } from "../../domain/errors/cerbaseal-error.js";

const ALLOWED_ACTION_CLASSES = new Set<ActionClass>([
  "allow",
  "hold",
  "reject",
  "escalate",
  "account_hold"
]);

// Fix 2: Workflows that require human approval unconditionally.
// The caller-supplied approvalRequired flag is treated as advisory for these classes.
// Adding a workflowClass here means no caller can opt out of approval enforcement.
const WORKFLOWS_REQUIRING_APPROVAL = new Set<WorkflowClass>(["fraud_triage"]);

// Fix 3: Module-private registry of gate-issued GateResult objects.
// Only results returned by ExecutionGateService.evaluate() are registered.
// EvidenceBundleService rejects any GateResult not present in this set.
const _gateIssuedResults = new WeakSet<object>();

export function assertIsGateIssued(result: GateResult): void {
  if (!_gateIssuedResults.has(result)) {
    throw new CerbaSealError({
      message: "GateResult was not produced by ExecutionGateService.evaluate()",
      invariant: INVARIANTS.NO_BYPASS_OF_EXECUTION_GATE,
      reasonCode: REASON_CODES.MALFORMED_REQUEST,
      finalState: "REJECT"
    });
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

function deterministicEnvelopeId(requestId: string): string {
  return `env_${requestId}`;
}

function deterministicEvidenceBundleId(requestId: string): string {
  return `evidence_${requestId}`;
}

function deterministicReleaseAuthorizationId(requestId: string): string {
  return `release_${requestId}`;
}

function assertKnownActionClass(
  actionClass: UnknownableActionClass,
  invariantChecks: InvariantCode[]
): asserts actionClass is ActionClass {
  invariantChecks.push(INVARIANTS.REQUEST_SCHEMA_AND_ACTION_CLASS_VALID);

  if (!ALLOWED_ACTION_CLASSES.has(actionClass as ActionClass)) {
    throw new CerbaSealError({
      message: "Unknown action class encountered in governed request",
      invariant: INVARIANTS.REQUEST_SCHEMA_AND_ACTION_CLASS_VALID,
      reasonCode: REASON_CODES.UNKNOWN_ACTION_CLASS,
      finalState: "REJECT"
    });
  }
}

function assertRequestShape(
  request: GovernedRequest,
  invariantChecks: InvariantCode[]
): void {
  invariantChecks.push(INVARIANTS.REQUEST_SCHEMA_AND_ACTION_CLASS_VALID);

  // Fix 7: requestId validated as non-empty alongside the existing shape checks.
  if (
    request.requestId.trim().length === 0 ||
    request.jurisdiction.trim().length === 0 ||
    request.createdAt.trim().length === 0 ||
    request.proposal.reasonCodes.length === 0
  ) {
    throw new CerbaSealError({
      message: "Governed request is malformed",
      invariant: INVARIANTS.REQUEST_SCHEMA_AND_ACTION_CLASS_VALID,
      reasonCode: REASON_CODES.MALFORMED_REQUEST,
      finalState: "REJECT"
    });
  }
}

function assertPolicyPack(
  request: GovernedRequest,
  invariantChecks: InvariantCode[]
): void {
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

function assertProvenance(
  request: GovernedRequest,
  invariantChecks: InvariantCode[]
): void {
  invariantChecks.push(INVARIANTS.NO_PROVENANCE_NO_ACTION);

  if (request.provenanceRef === null) {
    throw new CerbaSealError({
      message: "No provenance present for governed execution",
      invariant: INVARIANTS.NO_PROVENANCE_NO_ACTION,
      reasonCode: REASON_CODES.NO_PROVENANCE,
      finalState: "REJECT"
    });
  }

  if (
    request.provenanceRef.modelVersion.trim().length === 0 ||
    request.provenanceRef.ruleSetVersion.trim().length === 0 ||
    request.provenanceRef.sourceHash.trim().length === 0
  ) {
    throw new CerbaSealError({
      message: "Provenance reference is incomplete",
      invariant: INVARIANTS.NO_PROVENANCE_NO_ACTION,
      reasonCode: REASON_CODES.NO_PROVENANCE,
      finalState: "REJECT"
    });
  }
}

function assertLoggingReady(
  request: GovernedRequest,
  invariantChecks: InvariantCode[]
): void {
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

function assertProposalBoundary(
  request: GovernedRequest,
  invariantChecks: InvariantCode[]
): void {
  invariantChecks.push(INVARIANTS.AI_NON_AUTHORITATIVE);

  if (request.proposal.authorityBearing) {
    throw new CerbaSealError({
      message: "Proposal crossed the authority boundary",
      invariant: INVARIANTS.AI_NON_AUTHORITATIVE,
      reasonCode: REASON_CODES.AI_CANNOT_AUTHORIZE,
      finalState: "REJECT"
    });
  }

  // Fix 4: An AI actor making an AI-sourced proposal can never produce ALLOW.
  // The previous condition included `request.approvalRequired`, which allowed
  // an AI actor to bypass this block by setting approvalRequired: false.
  // The approval flag is irrelevant to whether AI has execution authority.
  if (
    request.proposal.proposalSourceKind === "ai" &&
    request.actorAuthorityClass === "ai"
  ) {
    throw new CerbaSealError({
      message: "AI-originated authority path is not permitted",
      invariant: INVARIANTS.AI_NON_AUTHORITATIVE,
      reasonCode: REASON_CODES.AI_CANNOT_AUTHORIZE,
      finalState: "REJECT"
    });
  }
}

function assertProhibitedUse(
  request: GovernedRequest,
  invariantChecks: InvariantCode[]
): void {
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

function assertControlStatus(
  request: GovernedRequest,
  invariantChecks: InvariantCode[]
): void {
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

function assertTrustState(
  request: GovernedRequest,
  invariantChecks: InvariantCode[]
): void {
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

function assertApprovalState(
  request: GovernedRequest,
  invariantChecks: InvariantCode[]
): void {
  invariantChecks.push(INVARIANTS.NO_REQUIRED_APPROVAL_NO_RELEASE);

  // Fix 2: Compute effective approval requirement. Certain workflow classes
  // always require human approval regardless of the caller-supplied flag.
  // The caller cannot opt out of approval enforcement for these workflows.
  const effectiveApprovalRequired =
    request.approvalRequired || WORKFLOWS_REQUIRING_APPROVAL.has(request.workflowClass);

  if (!effectiveApprovalRequired) {
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

  // Fix 1: Verify the approval artifact was issued for this specific request.
  // Prevents reuse of a valid approval artifact across different requests.
  if (request.approvalArtifact.forRequestId !== request.requestId) {
    throw new CerbaSealError({
      message: "Approval artifact was not issued for this request",
      invariant: INVARIANTS.NO_REQUIRED_APPROVAL_NO_RELEASE,
      reasonCode: REASON_CODES.INVALID_APPROVAL_AUTHORITY,
      finalState: "REJECT"
    });
  }

  if (
    request.approvalArtifact.approverAuthorityClass !== "analyst" &&
    request.approvalArtifact.approverAuthorityClass !== "reviewer" &&
    request.approvalArtifact.approverAuthorityClass !== "manager" &&
    request.approvalArtifact.approverAuthorityClass !== "compliance_officer"
  ) {
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

function buildDecisionEnvelope(args: {
  request: GovernedRequest;
  finalState: "ALLOW" | "HOLD" | "REJECT";
  reasonCodes: ReasonCode[];
  checkedInvariants: InvariantCode[];
  permittedActionClass: ActionClass | null;
}): DecisionEnvelope {
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

function buildBlockedActionRecord(args: {
  request: GovernedRequest;
  finalState: "HOLD" | "REJECT";
  reasonCodes: ReasonCode[];
  checkedInvariants: InvariantCode[];
}): BlockedActionRecord {
  return {
    requestId: args.request.requestId,
    finalState: args.finalState,
    reasonCodes: args.reasonCodes,
    checkedInvariants: args.checkedInvariants,
    recordedAt: nowIso()
  };
}

function buildReleaseAuthorization(
  request: GovernedRequest,
  envelope: DecisionEnvelope,
  actionClass: ActionClass
): ReleaseAuthorization {
  return {
    releaseAuthorizationId: deterministicReleaseAuthorizationId(request.requestId),
    requestId: request.requestId,
    envelopeId: envelope.envelopeId,
    actionClass,
    releasedAt: nowIso()
  };
}

export class ExecutionGateService {
  evaluate(request: GovernedRequest): GateResult {
    const checkedInvariants: InvariantCode[] = [];

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

      const releaseAuthorization = buildReleaseAuthorization(
        request,
        decisionEnvelope,
        request.proposedActionClass
      );

      const result: GateResult = {
        decisionEnvelope,
        releaseAuthorization,
        blockedActionRecord: null
      };
      _gateIssuedResults.add(result);
      return result;

    } catch (error) {
      // Fix 6: All exceptions produce a controlled decision artifact.
      // Unexpected non-CerbaSealError errors are converted to a REJECT result.
      // If the fallback itself fails (request is too broken to read), the
      // original error is re-thrown as a last resort — still fail-closed at
      // the caller boundary.
      if (!(error instanceof CerbaSealError)) {
        try {
          checkedInvariants.push(INVARIANTS.REQUEST_SCHEMA_AND_ACTION_CLASS_VALID);
          const fallbackReasonCodes: ReasonCode[] = [
            REASON_CODES.MALFORMED_REQUEST,
            REASON_CODES.DECISION_REJECTED
          ];
          const decisionEnvelope = buildDecisionEnvelope({
            request,
            finalState: "REJECT",
            reasonCodes: fallbackReasonCodes,
            checkedInvariants,
            permittedActionClass: null
          });
          const blockedActionRecord = buildBlockedActionRecord({
            request,
            finalState: "REJECT",
            reasonCodes: fallbackReasonCodes,
            checkedInvariants
          });
          const result: GateResult = {
            decisionEnvelope,
            releaseAuthorization: null,
            blockedActionRecord
          };
          _gateIssuedResults.add(result);
          return result;
        } catch {
          throw error;
        }
      }

      checkedInvariants.push(INVARIANTS.IMMUTABLE_DECISION_ENVELOPE);

      const reasonCodes: ReasonCode[] = [
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

      const result: GateResult = {
        decisionEnvelope,
        releaseAuthorization: null,
        blockedActionRecord
      };
      _gateIssuedResults.add(result);
      return result;
    }
  }
}
