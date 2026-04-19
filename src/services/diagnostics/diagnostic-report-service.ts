import type { DiagnosticReport, DiagnosticInvariantCheck, DiagnosticSeverity } from "../../domain/types/diagnostics.js";
import type { GateResult, GovernedRequest } from "../../domain/types/core.js";
import type { EvidenceBundle, ExportManifest, ReplayResult } from "../../domain/types/audit.js";
import { REASON_CODES } from "../../domain/constants/reason-codes.js";

function nowIso(): string {
  return new Date().toISOString();
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function buildDiagnosticReportId(requestId: string): string {
  return `diag_${requestId}`;
}

function detectPrimaryReason(gateResult: GateResult): string {
  const reasonCodes = gateResult.decisionEnvelope.trace.reasonCodes;
  return reasonCodes[0] ?? "UNKNOWN_REASON";
}

function deriveSeverity(
  gateResult: GateResult,
  replayResult: ReplayResult,
  evidenceBundle: EvidenceBundle
): DiagnosticSeverity {
  if (!replayResult.matchedOriginalOutcome) {
    return "CRITICAL";
  }

  if (!evidenceBundle.eventChain.length) {
    return "CRITICAL";
  }

  if (gateResult.decisionEnvelope.finalState === "ALLOW") {
    return "INFO";
  }

  const primaryReason = detectPrimaryReason(gateResult);

  if (
    primaryReason === REASON_CODES.PROHIBITED_USE ||
    primaryReason === REASON_CODES.TRUST_STATE_INVALID ||
    primaryReason === REASON_CODES.CONTROL_STALE_OR_INVALID
  ) {
    return "CRITICAL";
  }

  return "WARNING";
}

function buildOperatorExplanation(gateResult: GateResult): string {
  const primaryReason = detectPrimaryReason(gateResult);
  const finalState = gateResult.decisionEnvelope.finalState;

  if (finalState === "ALLOW") {
    return "This request was allowed because all enforced checks passed and release authorization was issued.";
  }

  if (primaryReason === REASON_CODES.REQUIRED_APPROVAL_MISSING) {
    return "This request was held because approval was required but no valid approval artifact was present.";
  }

  if (primaryReason === REASON_CODES.NO_PROVENANCE) {
    return "This request was rejected because provenance information was missing or incomplete.";
  }

  if (primaryReason === REASON_CODES.NO_POLICY_PACK) {
    return "This request was rejected because no policy pack reference was present.";
  }

  if (primaryReason === REASON_CODES.PROHIBITED_USE) {
    return "This request was rejected because it matched a prohibited use condition.";
  }

  if (primaryReason === REASON_CODES.LOGGING_NOT_READY) {
    return "This request was rejected because logging was not ready, so execution could not proceed safely.";
  }

  if (primaryReason === REASON_CODES.TRUST_STATE_INVALID) {
    return "This request was rejected because trust state validation failed.";
  }

  if (primaryReason === REASON_CODES.CONTROL_STALE_OR_INVALID) {
    return "This request was rejected because critical control status was stale or invalid.";
  }

  if (primaryReason === REASON_CODES.INVALID_PROPOSAL) {
    return "This request was rejected because the proposal action did not match the governed request action.";
  }

  if (primaryReason === REASON_CODES.AI_CANNOT_AUTHORIZE) {
    return "This request was rejected because AI crossed into an authority-bearing role.";
  }

  return "This request did not pass the governed execution path and was not eligible for release.";
}

function buildInvariantChecks(
  request: GovernedRequest,
  gateResult: GateResult
): DiagnosticInvariantCheck[] {
  const checked = new Set(gateResult.decisionEnvelope.trace.checkedInvariants);
  const reasonCodes = new Set(gateResult.decisionEnvelope.trace.reasonCodes);

  return [
    {
      invariantId: "INV-01",
      name: "no_policy_pack_no_execution",
      status: !checked.has("INV-01")
        ? "NOT_APPLICABLE"
        : request.policyPackRef === null
          ? "FAIL"
          : "PASS",
      explanation: request.policyPackRef === null
        ? "policyPackRef is null"
        : "policyPackRef present"
    },
    {
      invariantId: "INV-02",
      name: "no_provenance_no_action",
      status: !checked.has("INV-02")
        ? "NOT_APPLICABLE"
        : request.provenanceRef === null ||
          request.provenanceRef.modelVersion.trim().length === 0 ||
          request.provenanceRef.ruleSetVersion.trim().length === 0 ||
          request.provenanceRef.sourceHash.trim().length === 0
          ? "FAIL"
          : "PASS",
      explanation:
        request.provenanceRef === null
          ? "provenanceRef is null"
          : "provenanceRef present and non-empty"
    },
    {
      invariantId: "INV-03",
      name: "no_required_approval_no_release",
      status: !checked.has("INV-03")
        ? "NOT_APPLICABLE"
        : request.approvalRequired && request.approvalArtifact === null
          ? "FAIL"
          : "PASS",
      explanation:
        request.approvalRequired && request.approvalArtifact === null
          ? "approvalRequired is true but approvalArtifact is null"
          : "approval condition satisfied or not required"
    },
    {
      invariantId: "INV-04",
      name: "no_logging_no_execution",
      status: !checked.has("INV-04")
        ? "NOT_APPLICABLE"
        : request.loggingReady
          ? "PASS"
          : "FAIL",
      explanation: request.loggingReady ? "loggingReady is true" : "loggingReady is false"
    },
    {
      invariantId: "INV-05",
      name: "ai_non_authoritative",
      status: !checked.has("INV-05")
        ? "NOT_APPLICABLE"
        : reasonCodes.has(REASON_CODES.AI_CANNOT_AUTHORIZE)
          ? "FAIL"
          : "PASS",
      explanation: reasonCodes.has(REASON_CODES.AI_CANNOT_AUTHORIZE)
        ? "AI crossed into authority-bearing behavior"
        : "AI remained proposal-only"
    },
    {
      invariantId: "INV-08",
      name: "stale_controls_block_sensitive_release",
      status: !checked.has("INV-08")
        ? "NOT_APPLICABLE"
        : request.sensitive && (!request.controlStatus.criticalControlsValid || request.controlStatus.stale)
          ? "FAIL"
          : "PASS",
      explanation:
        request.sensitive && (!request.controlStatus.criticalControlsValid || request.controlStatus.stale)
          ? "critical controls invalid or stale for sensitive workflow"
          : "control state acceptable for current workflow"
    },
    {
      invariantId: "INV-09",
      name: "trust_state_required",
      status: !checked.has("INV-09")
        ? "NOT_APPLICABLE"
        : request.trustState.trusted
          ? "PASS"
          : "FAIL",
      explanation: request.trustState.trusted ? "trustState.trusted is true" : "trustState.trusted is false"
    },
    {
      invariantId: "INV-10",
      name: "prohibited_use_must_block",
      status: !checked.has("INV-10")
        ? "NOT_APPLICABLE"
        : request.prohibitedUse
          ? "FAIL"
          : "PASS",
      explanation: request.prohibitedUse ? "prohibitedUse is true" : "prohibitedUse is false"
    },
    {
      invariantId: "INV-11",
      name: "request_schema_and_action_class_valid",
      status: !checked.has("INV-11")
        ? "NOT_APPLICABLE"
        : reasonCodes.has(REASON_CODES.MALFORMED_REQUEST) || reasonCodes.has(REASON_CODES.UNKNOWN_ACTION_CLASS)
          ? "FAIL"
          : "PASS",
      explanation:
        reasonCodes.has(REASON_CODES.MALFORMED_REQUEST)
          ? "request shape invalid"
          : reasonCodes.has(REASON_CODES.UNKNOWN_ACTION_CLASS)
            ? "unknown action class detected"
            : "request shape and action classes valid"
    },
    {
      invariantId: "INV-12",
      name: "proposal_and_request_action_must_match",
      status: !checked.has("INV-12")
        ? "NOT_APPLICABLE"
        : reasonCodes.has(REASON_CODES.INVALID_PROPOSAL)
          ? "FAIL"
          : "PASS",
      explanation: reasonCodes.has(REASON_CODES.INVALID_PROPOSAL)
        ? "proposal.requestedActionClass did not match proposedActionClass"
        : "proposal action matched request action"
    }
  ];
}

function buildDecisionPath(
  request: GovernedRequest,
  gateResult: GateResult,
  evidenceBundle: EvidenceBundle
) {
  const reasons = new Set(gateResult.decisionEnvelope.trace.reasonCodes);

  const inputFailed =
    reasons.has(REASON_CODES.MALFORMED_REQUEST) ||
    reasons.has(REASON_CODES.UNKNOWN_ACTION_CLASS);

  const policyOrProvenanceFailed =
    reasons.has(REASON_CODES.NO_POLICY_PACK) ||
    reasons.has(REASON_CODES.NO_PROVENANCE);

  const proposalBoundaryFailed =
    reasons.has(REASON_CODES.AI_CANNOT_AUTHORIZE) ||
    reasons.has(REASON_CODES.INVALID_PROPOSAL);

  const approvalFailed =
    reasons.has(REASON_CODES.REQUIRED_APPROVAL_MISSING) ||
    reasons.has(REASON_CODES.INVALID_APPROVAL_AUTHORITY) ||
    reasons.has(REASON_CODES.PRIVILEGED_AUTH_NOT_SATISFIED) ||
    reasons.has(REASON_CODES.APPROVAL_SIGNATURE_MISSING);

  const controlTrustFailed =
    reasons.has(REASON_CODES.CONTROL_STALE_OR_INVALID) ||
    reasons.has(REASON_CODES.TRUST_STATE_INVALID) ||
    reasons.has(REASON_CODES.PROHIBITED_USE) ||
    reasons.has(REASON_CODES.LOGGING_NOT_READY);

  return {
    inputValidation: inputFailed ? "FAIL" : "PASS",
    policyAndProvenanceValidation: policyOrProvenanceFailed ? "FAIL" : "PASS",
    proposalBoundary: proposalBoundaryFailed ? "FAIL" : "PASS",
    approvalEnforcement: request.approvalRequired
      ? approvalFailed ? "FAIL" : "PASS"
      : "NOT_APPLICABLE",
    controlAndTrustValidation: controlTrustFailed ? "FAIL" : "PASS",
    finalDecisionIssued: true,
    releaseAuthorizationIssued: gateResult.releaseAuthorization !== null,
    evidenceBundleCreated: evidenceBundle.eventChain.length > 0
  } as const;
}

function buildRecommendedAction(gateResult: GateResult) {
  const primaryReason = detectPrimaryReason(gateResult);

  if (gateResult.decisionEnvelope.finalState === "ALLOW") {
    return {
      action: "No support action required.",
      rationale: "The request passed all enforced checks and replay matched the original outcome."
    };
  }

  if (primaryReason === REASON_CODES.REQUIRED_APPROVAL_MISSING) {
    return {
      action: "Provide a valid approvalArtifact and resubmit.",
      rationale: "Release was held because approvalRequired = true and no approval artifact was present."
    };
  }

  if (primaryReason === REASON_CODES.NO_PROVENANCE) {
    return {
      action: "Provide complete provenanceRef values and resubmit.",
      rationale: "Release was rejected because provenance was missing or incomplete."
    };
  }

  if (primaryReason === REASON_CODES.NO_POLICY_PACK) {
    return {
      action: "Attach a valid policyPackRef and resubmit.",
      rationale: "Release was rejected because no policy context was available."
    };
  }

  if (primaryReason === REASON_CODES.PROHIBITED_USE) {
    return {
      action: "Do not resubmit until prohibited-use classification is reviewed.",
      rationale: "The system identified the request as prohibited."
    };
  }

  if (primaryReason === REASON_CODES.TRUST_STATE_INVALID) {
    return {
      action: "Investigate trust-state source and revalidate before retrying.",
      rationale: "Release is blocked until trust state is valid."
    };
  }

  if (primaryReason === REASON_CODES.CONTROL_STALE_OR_INVALID) {
    return {
      action: "Revalidate critical controls before retrying this sensitive workflow.",
      rationale: "Sensitive release is blocked when control state is stale or invalid."
    };
  }

  return {
    action: "Escalate this report to CerbaSeal support for review.",
    rationale: "The outcome requires technical interpretation beyond operator remediation."
  };
}

export class DiagnosticReportService {
  createReport(args: {
    request: GovernedRequest;
    gateResult: GateResult;
    evidenceBundle: EvidenceBundle;
    replayResult: ReplayResult;
    exportManifest?: ExportManifest | null;
    chainVerified: boolean;
  }): DiagnosticReport {
    const {
      request,
      gateResult,
      evidenceBundle,
      replayResult,
      exportManifest = null,
      chainVerified
    } = args;

    const primaryReason = detectPrimaryReason(gateResult);
    const severity = deriveSeverity(gateResult, replayResult, evidenceBundle);

    return deepClone({
      summary: {
        diagnosticReportId: buildDiagnosticReportId(request.requestId),
        generatedAt: nowIso(),
        requestId: request.requestId,
        workflowClass: request.workflowClass,
        finalState: gateResult.decisionEnvelope.finalState,
        permittedActionClass: gateResult.decisionEnvelope.permittedActionClass,
        releaseAuthorizationIssued: gateResult.releaseAuthorization !== null,
        replayMatchedOriginalOutcome: replayResult.matchedOriginalOutcome,
        severity,
        primaryReason
      },
      operatorExplanation: buildOperatorExplanation(gateResult),
      invariantChecks: buildInvariantChecks(request, gateResult),
      decisionPath: buildDecisionPath(request, gateResult, evidenceBundle),
      auditSummary: {
        decisionEnvelopeId: gateResult.decisionEnvelope.envelopeId,
        evidenceBundleId: evidenceBundle.evidenceBundleId,
        exportManifestId: exportManifest?.manifestId ?? null,
        auditEventCount: evidenceBundle.eventChain.length,
        firstEventHash: evidenceBundle.eventChain[0]?.entryHash ?? null,
        lastEventHash: evidenceBundle.eventChain[evidenceBundle.eventChain.length - 1]?.entryHash ?? null,
        chainVerified
      },
      recommendedNextAction: buildRecommendedAction(gateResult),
      rawArtifacts: {
        request,
        gateResult,
        decisionEnvelope: gateResult.decisionEnvelope,
        blockedActionRecord: gateResult.blockedActionRecord,
        releaseAuthorization: gateResult.releaseAuthorization,
        evidenceBundle,
        exportManifest,
        replayResult
      }
    });
  }
      }
