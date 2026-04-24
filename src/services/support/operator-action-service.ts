import { REASON_CODES } from "../../domain/constants/reason-codes.js";
import type { DecisionState, GateResult } from "../../domain/types/core.js";

export interface OperatorActionReport {
  finalState: DecisionState;
  primaryReasonCode: string | null;
  recommendedAction: string;
  rationale: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  operatorChecklist: string[];
}

function getPrimaryReasonCode(gateResult: GateResult): string | null {
  const codes = gateResult.decisionEnvelope.trace.reasonCodes;
  const causeCodes = codes.filter(
    (c) =>
      c !== REASON_CODES.DECISION_ALLOWED &&
      c !== REASON_CODES.DECISION_HELD &&
      c !== REASON_CODES.DECISION_REJECTED
  );
  return causeCodes[0] ?? null;
}

export function createOperatorActionReport(gateResult: GateResult): OperatorActionReport {
  const finalState = gateResult.decisionEnvelope.finalState;
  const reasonCodes = gateResult.decisionEnvelope.trace.reasonCodes;
  const primaryReasonCode = getPrimaryReasonCode(gateResult);

  if (finalState === "ALLOW") {
    return {
      finalState,
      primaryReasonCode,
      recommendedAction: "No operator action required before execution.",
      rationale: "All required enforcement checks passed and a release authorization was issued.",
      severity: "INFO",
      operatorChecklist: [
        "Confirm releaseAuthorization is present.",
        "Retain the evidence bundle for audit review.",
        "Proceed only with the permitted action class."
      ]
    };
  }

  if (reasonCodes.includes(REASON_CODES.AI_CANNOT_AUTHORIZE)) {
    return {
      finalState,
      primaryReasonCode,
      recommendedAction: "Do not execute. Route the request to a human-authorized workflow.",
      rationale: "An AI actor with an AI-sourced proposal cannot authorize execution.",
      severity: "CRITICAL",
      operatorChecklist: [
        "Confirm no release authorization was issued.",
        "Assign a human reviewer if the action should be reconsidered.",
        "Create a new request with proper human authority if appropriate."
      ]
    };
  }

  if (reasonCodes.includes(REASON_CODES.REQUIRED_APPROVAL_MISSING)) {
    return {
      finalState,
      primaryReasonCode,
      recommendedAction: "Pause execution until a valid approval artifact is supplied.",
      rationale: "The request may be structurally valid, but required approval is missing.",
      severity: "WARNING",
      operatorChecklist: [
        "Obtain approval from an authorized human approver.",
        "Ensure approvalArtifact.forRequestId matches the requestId.",
        "Resubmit the request after approval is attached."
      ]
    };
  }

  if (
    reasonCodes.includes(REASON_CODES.INVALID_APPROVAL_AUTHORITY) ||
    reasonCodes.includes(REASON_CODES.PRIVILEGED_AUTH_NOT_SATISFIED) ||
    reasonCodes.includes(REASON_CODES.APPROVAL_SIGNATURE_MISSING)
  ) {
    return {
      finalState,
      primaryReasonCode,
      recommendedAction: "Reject the approval artifact and obtain a valid request-bound approval.",
      rationale:
        "The approval artifact is missing, mismatched, or does not satisfy required authority.",
      severity: "CRITICAL",
      operatorChecklist: [
        "Check approvalArtifact.forRequestId.",
        "Check approverAuthorityClass.",
        "Check privilegedAuthSatisfied.",
        "Check immutableSignature is present."
      ]
    };
  }

  if (reasonCodes.includes(REASON_CODES.NO_POLICY_PACK)) {
    return {
      finalState,
      primaryReasonCode,
      recommendedAction: "Attach a valid policyPackRef before resubmitting.",
      rationale: "Execution cannot proceed without a policy reference.",
      severity: "WARNING",
      operatorChecklist: [
        "Confirm policyPackRef.id is present.",
        "Confirm policyPackRef.version is present.",
        "Resubmit after policy reference is attached."
      ]
    };
  }

  if (reasonCodes.includes(REASON_CODES.NO_PROVENANCE)) {
    return {
      finalState,
      primaryReasonCode,
      recommendedAction: "Attach complete provenance before resubmitting.",
      rationale: "Execution cannot proceed without provenance information.",
      severity: "WARNING",
      operatorChecklist: [
        "Confirm modelVersion is present.",
        "Confirm ruleSetVersion is present.",
        "Confirm sourceHash is present."
      ]
    };
  }

  if (reasonCodes.includes(REASON_CODES.LOGGING_NOT_READY)) {
    return {
      finalState,
      primaryReasonCode,
      recommendedAction: "Do not execute until logging is available.",
      rationale: "CerbaSeal requires logging readiness before execution.",
      severity: "CRITICAL",
      operatorChecklist: [
        "Confirm loggingReady is true.",
        "Confirm evidence can be recorded.",
        "Resubmit only after logging is available."
      ]
    };
  }

  if (reasonCodes.includes(REASON_CODES.TRUST_STATE_INVALID)) {
    return {
      finalState,
      primaryReasonCode,
      recommendedAction: "Reject execution until trust state is restored.",
      rationale: "The request does not have a trusted execution state.",
      severity: "CRITICAL",
      operatorChecklist: [
        "Inspect trustState.trusted.",
        "Confirm trustStateId.",
        "Resolve trust issue before resubmission."
      ]
    };
  }

  if (reasonCodes.includes(REASON_CODES.CONTROL_STALE_OR_INVALID)) {
    return {
      finalState,
      primaryReasonCode,
      recommendedAction: "Refresh controls before resubmitting.",
      rationale: "Sensitive actions require valid, non-stale controls.",
      severity: "CRITICAL",
      operatorChecklist: [
        "Run control verification.",
        "Confirm criticalControlsValid is true.",
        "Confirm stale is false.",
        "Attach updated verificationRunId."
      ]
    };
  }

  if (reasonCodes.includes(REASON_CODES.PROHIBITED_USE)) {
    return {
      finalState,
      primaryReasonCode,
      recommendedAction: "Do not execute. Escalate as prohibited use.",
      rationale: "The request is marked as prohibited and must be blocked.",
      severity: "CRITICAL",
      operatorChecklist: [
        "Confirm no release authorization exists.",
        "Record blocked action evidence.",
        "Escalate according to internal policy."
      ]
    };
  }

  if (
    reasonCodes.includes(REASON_CODES.MALFORMED_REQUEST) ||
    reasonCodes.includes(REASON_CODES.INVALID_PROPOSAL) ||
    reasonCodes.includes(REASON_CODES.UNKNOWN_ACTION_CLASS)
  ) {
    return {
      finalState,
      primaryReasonCode,
      recommendedAction: "Correct request structure before resubmitting.",
      rationale: "The request or proposal shape failed validation.",
      severity: "WARNING",
      operatorChecklist: [
        "Check requestId is non-empty.",
        "Check action class is allowed.",
        "Check proposal.reasonCodes is non-empty.",
        "Check proposedActionClass matches proposal.requestedActionClass."
      ]
    };
  }

  if (finalState === "HOLD") {
    return {
      finalState,
      primaryReasonCode,
      recommendedAction: "Pause execution and resolve the missing condition.",
      rationale: "The request did not satisfy all release requirements.",
      severity: "WARNING",
      operatorChecklist: [
        "Review reason codes in the evidence bundle.",
        "Resolve the blocking condition.",
        "Resubmit after the condition is met."
      ]
    };
  }

  return {
    finalState,
    primaryReasonCode,
    recommendedAction: "Do not execute. Review reason codes and evidence bundle.",
    rationale: "At least one enforcement invariant failed.",
    severity: "WARNING",
    operatorChecklist: [
      "Review reason codes in the evidence bundle.",
      "Review checked invariants in the decision trace.",
      "Escalate if the cause is unclear."
    ]
  };
}
