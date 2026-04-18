import type { InvariantCode } from "../constants/invariants.js";
import type { ReasonCode } from "../constants/reason-codes.js";

export type AuthorityClass =
  | "system"
  | "ai"
  | "analyst"
  | "reviewer"
  | "manager"
  | "compliance_officer";

export type HumanAuthorityClass =
  | "analyst"
  | "reviewer"
  | "manager"
  | "compliance_officer";

export type WorkflowClass =
  | "fraud_triage"
  | "transaction_escalation"
  | "account_hold_recommendation";

export type ActionClass =
  | "allow"
  | "hold"
  | "reject"
  | "escalate"
  | "account_hold";

export type UnknownableActionClass = ActionClass | (string & {});

export type ProposalSourceKind = "ai" | "deterministic_rule";

export type DecisionState = "ALLOW" | "HOLD" | "REJECT";

export interface PolicyPackRef {
  id: string;
  version: string;
}

export interface ProvenanceRef {
  modelVersion: string;
  ruleSetVersion: string;
  sourceHash: string;
}

export interface ApprovalArtifact {
  approvalId: string;
  approverId: string;
  approverAuthorityClass: HumanAuthorityClass;
  privilegedAuthSatisfied: boolean;
  immutableSignature: string;
  approvedAt: string;
}

export interface DecisionProposal {
  proposalSourceKind: ProposalSourceKind;
  authorityBearing: boolean;
  requestedActionClass: UnknownableActionClass;
  confidence: number | null;
  reasonCodes: string[];
  proposalCreatedAt: string;
}

export interface ControlStatus {
  criticalControlsValid: boolean;
  stale: boolean;
  verificationRunId: string;
}

export interface TrustState {
  trusted: boolean;
  trustStateId: string;
}

export interface GovernedRequest {
  requestId: string;
  workflowClass: WorkflowClass;
  jurisdiction: string;
  actorId: string;
  actorAuthorityClass: AuthorityClass;
  proposedActionClass: UnknownableActionClass;
  proposal: DecisionProposal;
  sensitive: boolean;
  prohibitedUse: boolean;
  policyPackRef: PolicyPackRef | null;
  provenanceRef: ProvenanceRef | null;
  approvalRequired: boolean;
  approvalArtifact: ApprovalArtifact | null;
  loggingReady: boolean;
  controlStatus: ControlStatus;
  trustState: TrustState;
  createdAt: string;
}

export interface DecisionTrace {
  checkedInvariants: InvariantCode[];
  reasonCodes: ReasonCode[];
  evaluatedAt: string;
}

export interface DecisionEnvelope {
  envelopeId: string;
  requestId: string;
  workflowClass: WorkflowClass;
  finalState: DecisionState;
  permittedActionClass: ActionClass | null;
  humanApprovalRequired: boolean;
  humanApprovalPresent: boolean;
  proposalSourceKind: ProposalSourceKind;
  immutable: true;
  evidenceBundleId: string;
  trace: DecisionTrace;
  issuedAt: string;
}

export interface ReleaseAuthorization {
  releaseAuthorizationId: string;
  requestId: string;
  envelopeId: string;
  actionClass: ActionClass;
  releasedAt: string;
}

export interface BlockedActionRecord {
  requestId: string;
  finalState: Extract<DecisionState, "HOLD" | "REJECT">;
  reasonCodes: ReasonCode[];
  checkedInvariants: InvariantCode[];
  recordedAt: string;
}

export interface GateResult {
  decisionEnvelope: DecisionEnvelope;
  releaseAuthorization: ReleaseAuthorization | null;
  blockedActionRecord: BlockedActionRecord | null;
}
