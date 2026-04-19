import type {
  BlockedActionRecord,
  DecisionEnvelope,
  GateResult,
  GovernedRequest,
  ReleaseAuthorization
} from "./core.js";
import type {
  EvidenceBundle,
  ExportManifest,
  ReplayResult
} from "./audit.js";

export type DiagnosticSeverity = "INFO" | "WARNING" | "CRITICAL";
export type DiagnosticInvariantStatus = "PASS" | "FAIL" | "NOT_APPLICABLE";

export interface DiagnosticInvariantCheck {
  invariantId: string;
  name: string;
  status: DiagnosticInvariantStatus;
  explanation: string;
}

export interface DiagnosticSummary {
  diagnosticReportId: string;
  generatedAt: string;
  requestId: string;
  workflowClass: string;
  finalState: "ALLOW" | "HOLD" | "REJECT";
  permittedActionClass: string | null;
  releaseAuthorizationIssued: boolean;
  replayMatchedOriginalOutcome: boolean;
  severity: DiagnosticSeverity;
  primaryReason: string;
}

export interface DiagnosticDecisionPath {
  inputValidation: "PASS" | "FAIL";
  policyAndProvenanceValidation: "PASS" | "FAIL";
  proposalBoundary: "PASS" | "FAIL";
  approvalEnforcement: "PASS" | "FAIL" | "NOT_APPLICABLE";
  controlAndTrustValidation: "PASS" | "FAIL";
  finalDecisionIssued: true;
  releaseAuthorizationIssued: boolean;
  evidenceBundleCreated: boolean;
}

export interface DiagnosticAuditSummary {
  decisionEnvelopeId: string;
  evidenceBundleId: string;
  exportManifestId: string | null;
  auditEventCount: number;
  firstEventHash: string | null;
  lastEventHash: string | null;
  chainVerified: boolean;
}

export interface DiagnosticRecommendedAction {
  action: string;
  rationale: string;
}

export interface DiagnosticRawArtifacts {
  request: GovernedRequest;
  gateResult: GateResult;
  decisionEnvelope: DecisionEnvelope;
  blockedActionRecord: BlockedActionRecord | null;
  releaseAuthorization: ReleaseAuthorization | null;
  evidenceBundle: EvidenceBundle;
  exportManifest: ExportManifest | null;
  replayResult: ReplayResult;
}

export interface DiagnosticReport {
  summary: DiagnosticSummary;
  operatorExplanation: string;
  invariantChecks: DiagnosticInvariantCheck[];
  decisionPath: DiagnosticDecisionPath;
  auditSummary: DiagnosticAuditSummary;
  recommendedNextAction: DiagnosticRecommendedAction;
  rawArtifacts: DiagnosticRawArtifacts;
}
