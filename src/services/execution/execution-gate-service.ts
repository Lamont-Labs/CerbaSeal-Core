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
  AuthorityClass,
  BlockedActionRecord,
  DecisionEnvelope,
  GateResult,
  GovernedRequest,
  ReleaseAuthorization,
  UnknownableActionClass,
  WorkflowClass
} from "../../domain/types/core.js";
import { CerbaSealError } from "../../domain/errors/cerbaseal-error.js";
import {
  buildAllowedAuthorityClasses,
  type GateConfig
} from "../../config/cerbaseal-config.js";
import type { CerbaSealPolicy, PolicyActionBehavior } from "../../config/cerbaseal-policy.js";

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

// Phase 5: Validate actorAuthorityClass at runtime.
// TypeScript enforces the AuthorityClass union at compile time, but callers
// integrating via untyped boundaries (JavaScript, JSON deserialization) can
// supply arbitrary strings. This check closes that gap at the enforcement layer.
//
// Authority Classes — extensible via constructor config (cerbaseal.config.json).
// Core classes: system, ai, analyst, reviewer, manager, compliance_officer.
// Extended classes: pass additionalAuthorityClasses to ExecutionGateService()
// or add them to cerbaseal.config.json — no TypeScript changes required.
function assertActorAuthorityClass(
  request: GovernedRequest,
  invariantChecks: InvariantCode[],
  allowedClasses: ReadonlySet<string>
): void {
  invariantChecks.push(INVARIANTS.REQUEST_SCHEMA_AND_ACTION_CLASS_VALID);

  if (!allowedClasses.has(request.actorAuthorityClass)) {
    throw new CerbaSealError({
      message: `Unknown actor authority class: "${request.actorAuthorityClass}"`,
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

  // Phase 6: Approval timestamp must not predate the request creation time.
  // An approval recorded before the request was created is impossible and
  // indicates a forged or replayed artifact.
  const requestDate = new Date(request.createdAt);
  const approvedDate = new Date(request.approvalArtifact.approvedAt);

  if (isNaN(requestDate.getTime()) || isNaN(approvedDate.getTime())) {
    throw new CerbaSealError({
      message: "Approval or request timestamp is not a valid ISO date",
      invariant: INVARIANTS.NO_REQUIRED_APPROVAL_NO_RELEASE,
      reasonCode: REASON_CODES.MALFORMED_REQUEST,
      finalState: "REJECT"
    });
  }

  if (approvedDate < requestDate) {
    throw new CerbaSealError({
      message: "Approval timestamp predates the request creation time",
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
  private readonly allowedAuthorityClasses: ReadonlySet<string>;
  private readonly policy: CerbaSealPolicy | undefined;

  /**
   * @param config  — optional configuration. Pass to extend authority classes beyond
   *                  the core set (system, ai, analyst, reviewer, manager, compliance_officer).
   * @param policy  — optional policy pack. Controls actor mappings, approval chains, and
   *                  per-workflow action behaviour. Load with loadCerbaSealPolicy() or
   *                  supply inline. When undefined the gate operates on core invariants only.
   *
   * Inline usage:
   *   new ExecutionGateService({ additionalAuthorityClasses: ["risk_officer"] }, policy)
   *
   * From config + policy files:
   *   import { loadCerbaSealConfig } from "../../config/cerbaseal-config.js";
   *   import { loadCerbaSealPolicy } from "../../config/cerbaseal-policy.js";
   *   new ExecutionGateService(loadCerbaSealConfig(), loadCerbaSealPolicy())
   *
   * Default (no args): core authority classes only. All existing tests pass unchanged.
   */
  constructor(config?: GateConfig, policy?: CerbaSealPolicy) {
    this.policy = policy;
    // Extend the allowed authority class set to include any actor mapping keys
    // so that client role name strings pass the initial authority class check before
    // they are resolved to their canonical counterparts.
    const base = buildAllowedAuthorityClasses(config);
    if (policy?.actorMappings && Object.keys(policy.actorMappings).length > 0) {
      this.allowedAuthorityClasses = new Set([...base, ...Object.keys(policy.actorMappings)]);
    } else {
      this.allowedAuthorityClasses = base;
    }
  }

  /**
   * Resolve a client role name to its canonical CerbaSeal authority class via the
   * actor mappings in the loaded policy. Returns the input unchanged if no mapping
   * exists for it (i.e. it is already a canonical class or an unknown value).
   */
  private resolveActorClass(actorClass: string): string {
    if (!this.policy?.actorMappings) return actorClass;
    return this.policy.actorMappings[actorClass] ?? actorClass;
  }

  /**
   * Returns true if the loaded policy requires human approval for the given workflow.
   * This is ADDITIVE: the result is true if ANY of the following hold —
   *   1. A workflowRules entry exists with requiresApproval: true, OR
   *   2. The workflow appears in approvalChains.
   *
   * requiresApproval: false in workflowRules documents an explicit intent but does NOT
   * suppress an approval requirement that originates from approvalChains. The most
   * restrictive policy source always wins.
   *
   * Both mechanisms supplement the hardcoded WORKFLOWS_REQUIRING_APPROVAL set (fraud_triage)
   * without requiring TypeScript changes.
   */
  private isPolicyApprovalRequired(workflowClass: string): boolean {
    let workflowRuleRequires = false;
    if (this.policy?.workflowRules) {
      const rule = this.policy.workflowRules.find((r) => r.workflowClass === workflowClass);
      if (rule?.requiresApproval === true) workflowRuleRequires = true;
    }
    const chainRequires = this.policy?.approvalChains
      ? workflowClass in this.policy.approvalChains
      : false;
    return workflowRuleRequires || chainRequires;
  }

  /**
   * Returns the policy-defined behaviour for a specific workflow + action combination,
   * or undefined if no policy entry exists for that pair.
   */
  private getActionPolicyBehaviour(
    workflowClass: string,
    actionClass: string
  ): PolicyActionBehavior | undefined {
    return this.policy?.actionPolicies?.[workflowClass]?.[actionClass];
  }

  /**
   * Returns the approval chain for the given workflow class from the loaded policy,
   * or an empty array if no chain is defined.
   */
  getApprovalChains(workflowClass: string): string[] {
    return this.policy?.approvalChains?.[workflowClass] ?? [];
  }

  evaluate(request: GovernedRequest): GateResult {
    const checkedInvariants: InvariantCode[] = [];

    // Hoisted outside try so the catch block always reflects the most recent
    // policy-resolved state (accurate humanApprovalRequired in error envelopes).
    let effectiveRequest: GovernedRequest = request;

    try {
      assertRequestShape(request, checkedInvariants);

      // ── Policy stage 1: actor mapping ─────────────────────────────────────
      // Translate client role names (e.g. "Head of Risk") to canonical
      // authority classes (e.g. "manager") before any invariant checks run.
      // The resolved request is used for all downstream assertions so that
      // the AI non-authoritativeness invariant and approval checks operate on
      // the canonical class, not the client-specific label.
      const resolvedClass = this.resolveActorClass(request.actorAuthorityClass);
      const resolvedRequest: GovernedRequest = resolvedClass !== request.actorAuthorityClass
        ? { ...request, actorAuthorityClass: resolvedClass as AuthorityClass }
        : request;

      assertActorAuthorityClass(resolvedRequest, checkedInvariants, this.allowedAuthorityClasses);
      assertKnownActionClass(resolvedRequest.proposedActionClass, checkedInvariants);
      assertKnownActionClass(resolvedRequest.proposal.requestedActionClass, checkedInvariants);

      checkedInvariants.push(INVARIANTS.PROPOSAL_AND_REQUEST_ACTION_MUST_MATCH);
      if (resolvedRequest.proposedActionClass !== resolvedRequest.proposal.requestedActionClass) {
        throw new CerbaSealError({
          message: "Proposal action and request action do not match",
          invariant: INVARIANTS.PROPOSAL_AND_REQUEST_ACTION_MUST_MATCH,
          reasonCode: REASON_CODES.INVALID_PROPOSAL,
          finalState: "REJECT"
        });
      }

      // ── Policy stage 2: action policies ──────────────────────────────────
      // "blocked" actions are rejected immediately — this runs before all
      // other invariant checks because a blocked action is always invalid
      // regardless of provenance, logging state, or approval.
      const actionBehaviour = this.getActionPolicyBehaviour(
        resolvedRequest.workflowClass,
        resolvedRequest.proposedActionClass
      );
      if (actionBehaviour === "blocked") {
        checkedInvariants.push(INVARIANTS.REQUEST_SCHEMA_AND_ACTION_CLASS_VALID);
        throw new CerbaSealError({
          message: `Action "${resolvedRequest.proposedActionClass}" is blocked by policy for workflow "${resolvedRequest.workflowClass}"`,
          invariant: INVARIANTS.REQUEST_SCHEMA_AND_ACTION_CLASS_VALID,
          reasonCode: REASON_CODES.MALFORMED_REQUEST,
          finalState: "REJECT"
        });
      }

      // ── Policy stage 3: approval chains + action-level approval ──────────
      // Derive the effective approval requirement. Policy approval chains and
      // "requires_approval" action policies add to the requirement; they cannot
      // remove an existing requirement set by the caller or the core invariant.
      const policyApprovalRequired =
        this.isPolicyApprovalRequired(resolvedRequest.workflowClass) ||
        actionBehaviour === "requires_approval";
      effectiveRequest =
        policyApprovalRequired && !resolvedRequest.approvalRequired
          ? { ...resolvedRequest, approvalRequired: true }
          : resolvedRequest;

      assertPolicyPack(effectiveRequest, checkedInvariants);
      assertProvenance(effectiveRequest, checkedInvariants);
      assertLoggingReady(effectiveRequest, checkedInvariants);
      assertProposalBoundary(effectiveRequest, checkedInvariants);
      assertProhibitedUse(effectiveRequest, checkedInvariants);
      assertControlStatus(effectiveRequest, checkedInvariants);
      assertTrustState(effectiveRequest, checkedInvariants);
      assertApprovalState(effectiveRequest, checkedInvariants);

      // ── Policy stage 4: approval chain authority enforcement ──────────────
      // When a policy declares a specific approval chain for this workflow, the
      // approver's authority class must be one of the classes listed in that chain.
      // This is additive to the core authority class check in assertApprovalState —
      // it narrows the valid set to only those the policy explicitly authorises.
      // Only runs when an approval artifact is present (assertApprovalState already
      // handled the absent-artifact HOLD case above).
      const approvalChain = this.getApprovalChains(effectiveRequest.workflowClass);
      if (approvalChain.length > 0 && effectiveRequest.approvalArtifact !== null) {
        checkedInvariants.push(INVARIANTS.NO_REQUIRED_APPROVAL_NO_RELEASE);
        if (!approvalChain.includes(effectiveRequest.approvalArtifact.approverAuthorityClass)) {
          throw new CerbaSealError({
            message: `Approver class "${effectiveRequest.approvalArtifact.approverAuthorityClass}" is not in the configured approval chain for workflow "${effectiveRequest.workflowClass}" — chain requires: ${approvalChain.join(", ")}`,
            invariant: INVARIANTS.NO_REQUIRED_APPROVAL_NO_RELEASE,
            reasonCode: REASON_CODES.INVALID_APPROVAL_AUTHORITY,
            finalState: "REJECT"
          });
        }
      }

      checkedInvariants.push(INVARIANTS.IMMUTABLE_DECISION_ENVELOPE);

      // assertKnownActionClass above has validated that proposedActionClass is a
      // known ActionClass — cast is safe and required because GovernedRequest
      // types the field as UnknownableActionClass for boundary flexibility.
      const validatedActionClass = effectiveRequest.proposedActionClass as ActionClass;

      const decisionEnvelope = buildDecisionEnvelope({
        request: effectiveRequest,
        finalState: "ALLOW",
        reasonCodes: [REASON_CODES.DECISION_ALLOWED],
        checkedInvariants,
        permittedActionClass: validatedActionClass
      });

      const releaseAuthorization = buildReleaseAuthorization(
        effectiveRequest,
        decisionEnvelope,
        validatedActionClass
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
            request: effectiveRequest,
            finalState: "REJECT",
            reasonCodes: fallbackReasonCodes,
            checkedInvariants,
            permittedActionClass: null
          });
          const blockedActionRecord = buildBlockedActionRecord({
            request: effectiveRequest,
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
        request: effectiveRequest,
        finalState: error.finalState,
        reasonCodes,
        checkedInvariants,
        permittedActionClass: null
      });

      const blockedActionRecord = buildBlockedActionRecord({
        request: effectiveRequest,
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
