/**
 * review-portal.ts
 *
 * Route handler data for the Review & Pilot Readiness Portal.
 * Pure functions — no side effects, no external deps.
 * Server.ts imports these and serves the results.
 */

export const REVIEW_SUMMARY = {
  system: "CerbaSeal",
  version: "0.1.0",
  status: "review_ready_core_not_client_deployed",
  definition:
    "CerbaSeal is a deterministic execution enforcement spine for AI-assisted workflows. It sits between a decision system and an execution system, returning ALLOW, HOLD, or REJECT with a hash-linked evidence trail.",
  implemented: [
    "deterministic execution gate",
    "ALLOW / HOLD / REJECT outcomes",
    "12 named invariant checks",
    "17 reason codes",
    "evidence bundle service",
    "append-only hash-linked audit log",
    "replay service",
    "export manifest",
    "diagnostic report service",
    "browser demo with live enforcement",
    "262 passing tests (0 failing)",
    "support readiness layer (health check, integrity verification, operator action reports)"
  ],
  notYetImplemented: [
    "client-specific workflow binding",
    "client infrastructure deployment",
    "third-party security review",
    "production monitoring",
    "multi-client support model",
    "formal SLA",
    "external audit certification",
    "persistent audit storage",
    "cryptographic signing of decision artifacts",
    "identity provider integration",
    "real client data integration"
  ],
  demoScenarios: [
    {
      id: "reject",
      title: "AI tries to act without authority",
      expectedOutcome: "REJECT",
      primaryInvariant: "INV-05 AI_NON_AUTHORITATIVE",
      primaryReasonCode: "AI_CANNOT_AUTHORIZE",
      plainMeaning:
        "An AI actor with an AI-sourced proposal cannot authorize execution. CerbaSeal blocks unconditionally."
    },
    {
      id: "hold",
      title: "Human submits action without required approval",
      expectedOutcome: "HOLD",
      primaryInvariant: "INV-03 NO_REQUIRED_APPROVAL_NO_RELEASE",
      primaryReasonCode: "REQUIRED_APPROVAL_MISSING",
      plainMeaning:
        "The request is structurally valid but required approval is absent. Execution is paused, not rejected."
    },
    {
      id: "allow",
      title: "Approved action with valid provenance and approval",
      expectedOutcome: "ALLOW",
      primaryInvariant: "all 12 invariants pass",
      primaryReasonCode: "DECISION_ALLOWED",
      plainMeaning:
        "All required conditions are satisfied. A release authorization is issued and the action may execute."
    }
  ],
  testStatus: {
    reportedPassing: 262,
    reportedFailing: 0,
    testFiles: 14
  },
  coreVerdicts: ["ALLOW", "HOLD", "REJECT"],
  coreClaims: [
    {
      claim: "AI cannot produce authority-bearing actions",
      support: "implemented_in_invariant_INV_05",
      backedBy: ["code", "tests", "demo"]
    },
    {
      claim: "Required human approval cannot be bypassed",
      support: "implemented_in_invariant_INV_03",
      backedBy: ["code", "tests", "demo"]
    },
    {
      claim: "Approval artifacts must be bound to the request they approve",
      support: "implemented_in_execution_gate_fix_1",
      backedBy: ["code", "tests"]
    },
    {
      claim: "Forged gate results cannot enter the evidence layer",
      support: "implemented_in_invariant_INV_06_weakset",
      backedBy: ["code", "tests"]
    },
    {
      claim: "Unexpected runtime errors fail closed",
      support: "implemented_in_execution_gate_fix_6",
      backedBy: ["code", "tests"]
    },
    {
      claim: "All outcomes are recorded with hash-linked evidence",
      support: "implemented_in_append_only_log_service",
      backedBy: ["code", "tests", "demo"]
    },
    {
      claim: "Replay of stored evidence produces identical outcomes",
      support: "implemented_in_replay_service",
      backedBy: ["code", "tests", "demo"]
    }
  ],
  limitationNotice:
    "This is a review-ready core demo, not a production client deployment."
};

export const PILOT_READINESS = {
  pilotReadinessStatus: "core_ready_client_specifics_required",
  readyNow: [
    "deterministic enforcement gate",
    "ALLOW / HOLD / REJECT decision loop",
    "evidence bundle generation",
    "hash-linked audit log",
    "replay validation",
    "export manifest",
    "diagnostic reports",
    "operator action guidance",
    "system health verification",
    "integrity verification",
    "browser demo",
    "passing test suite"
  ],
  requiresClientDefinition: [
    "client workflow name and scope",
    "decision point in client system",
    "upstream proposal source (what generates the proposal)",
    "downstream action system (what executes on ALLOW)",
    "action taxonomy (permitted action classes)",
    "policy pack reference",
    "provenance source (model version, rule set, source hash)",
    "approval model (who approves, what authority class)",
    "human authority classes",
    "logging and evidence destination",
    "deployment environment",
    "support boundary and escalation path",
    "pilot success criteria",
    "sensitive data flag scope",
    "prohibited-use conditions"
  ],
  requiresAgreement: [
    "commercial terms",
    "ownership of evidence records",
    "liability boundary",
    "support period and scope",
    "payment and billing",
    "data processing agreement if applicable",
    "version freeze and update process"
  ],
  requiresReview: [
    "third-party security review of enforcement logic",
    "client deployment environment security review",
    "data residency and movement review",
    "legal review of evidence retention requirements"
  ],
  recommendedFirstPilotShape: {
    clients: 1,
    workflows: 1,
    decisionPaths: 1,
    approvalModels: 1,
    verifiableOutcomes: 1,
    description:
      "One client, one workflow, one decision path, one approval model, one verifiable outcome."
  },
  pilotSuccessCriteria: [
    "CerbaSeal processes defined workflow inputs deterministically",
    "All scenario outputs are stable across repeated runs",
    "AI cannot produce authority-bearing action in any test case",
    "Required approval paths HOLD until approval is present",
    "Approved action produces release authorization",
    "Evidence bundle is created for every evaluation",
    "Replay matches original outcome",
    "Audit chain verifies",
    "Client can understand diagnostic output without founder involvement"
  ],
  limitationNotice:
    "This is a review-ready core demo, not a production client deployment."
};

export const SECURITY_SUMMARY = {
  securityReviewStatus: "not_yet_third_party_reviewed",
  implementedControls: [
    {
      control: "AI non-authority invariant",
      invariant: "INV-05",
      description:
        "AI actor with AI-sourced proposal cannot produce authority-bearing action under any condition"
    },
    {
      control: "Approval artifact binding",
      invariant: "INV-03 / Fix 1",
      description:
        "approvalArtifact.forRequestId must exactly equal request.requestId — prevents cross-request reuse"
    },
    {
      control: "Workflow-level approval enforcement",
      invariant: "INV-03 / Fix 2",
      description:
        "fraud_triage workflow always requires approval at gate level — callers cannot opt out"
    },
    {
      control: "Gate issuance registry",
      invariant: "INV-06 / Fix 3",
      description:
        "Module-private WeakSet; EvidenceBundleService rejects any GateResult not from evaluate()"
    },
    {
      control: "Fail-closed catch-all",
      invariant: "Fix 6",
      description:
        "All unexpected errors produce controlled REJECT — no silent success on exception"
    },
    {
      control: "Known action class validation",
      invariant: "INV-11",
      description: "proposedActionClass and requestedActionClass must be members of allowed set"
    },
    {
      control: "Proposal/request action match",
      invariant: "INV-12",
      description: "proposedActionClass must equal proposal.requestedActionClass"
    },
    {
      control: "Policy pack required",
      invariant: "INV-01",
      description: "Execution cannot proceed without a policyPackRef"
    },
    {
      control: "Provenance required",
      invariant: "INV-02",
      description:
        "provenanceRef required with non-empty modelVersion, ruleSetVersion, sourceHash"
    },
    {
      control: "Logging readiness required",
      invariant: "INV-04",
      description: "loggingReady must be true before any execution"
    },
    {
      control: "Trust state required",
      invariant: "INV-09",
      description: "trustState.trusted must be true"
    },
    {
      control: "Stale controls block sensitive release",
      invariant: "INV-08",
      description:
        "sensitive=true: criticalControlsValid must be true AND stale must be false"
    },
    {
      control: "Prohibited use immediate reject",
      invariant: "INV-10",
      description: "prohibitedUse:true produces immediate REJECT before any other check"
    },
    {
      control: "Immutable decision envelope",
      invariant: "INV-07",
      description: "immutable field is literal type true on every envelope; pushed on all paths"
    },
    {
      control: "Evidence bundle deep cloning",
      invariant: "EvidenceBundleService",
      description: "All bundle contents are deep-cloned — no shared mutable references"
    },
    {
      control: "Append-only audit log with hash chaining",
      invariant: "AppendOnlyLogService",
      description: "SHA-256 entryHash over each entry including previousHash linkage"
    },
    {
      control: "Export hash verification by index",
      invariant: "Fix 5",
      description: "Every hash in sourceEventHashes compared by index, not just count"
    },
    {
      control: "requestId non-empty validation",
      invariant: "INV-11 / Fix 7",
      description: "requestId validated as non-empty in assertRequestShape"
    }
  ],
  knownLimitations: [
    "Audit log is in-memory — not persisted across process restarts",
    "No cryptographic signing — evidence is hash-linked, not key-signed or attested",
    "No identity provider — actor identity is caller-supplied with no independent attestation",
    "No persistent storage — all state exists per process instance",
    "No production deployment hardening",
    "No third-party security review completed yet",
    "No client environment integration",
    "No external compliance certification",
    "loggingReady is caller-declared — gate does not verify actual log system health",
    "immutableSignature content is not cryptographically verified — any non-empty string passes",
    "SHA-256 hash chain proves consistency, not origin — fabricated chain with recomputed hashes passes verifyChain()"
  ],
  recommendedReviewerQuestions: [
    "Can any caller obtain ReleaseAuthorization without ExecutionGateService.evaluate()?",
    "Can evidence be accepted without a gate-issued GateResult?",
    "Can replay mismatch be hidden from the diagnostic layer?",
    "Can audit chain tampering be detected?",
    "Are all unexpected errors fail-closed?",
    "Are claims in docs consistent with code?",
    "Are deployment assumptions clearly separated from implemented behavior?",
    "What changes are required before client deployment?",
    "Is the WeakSet bypass prevention robust in all import configurations?",
    "What is the trust model for caller-supplied fields (loggingReady, trustState, prohibitedUse)?"
  ],
  threatsCovered: [
    {
      threat: "AI attempts to authorize its own action",
      control: "INV-05",
      tested: true
    },
    {
      threat: "Caller bypasses gate by constructing GateResult directly",
      control: "INV-06 WeakSet",
      tested: true
    },
    {
      threat: "Caller reuses approval artifact from another request",
      control: "INV-03 forRequestId binding",
      tested: true
    },
    {
      threat: "Caller omits approvalRequired flag for gated workflow",
      control: "Workflow-class enforcement Fix 2",
      tested: true
    },
    {
      threat: "Caller supplies forged GateResult to evidence layer",
      control: "assertIsGateIssued WeakSet",
      tested: true
    },
    {
      threat: "Caller mutates evidence after bundle creation",
      control: "deep clone on bundle creation",
      tested: true
    },
    {
      threat: "Caller omits provenance",
      control: "INV-02",
      tested: true
    },
    {
      threat: "Caller provides stale controls on sensitive request",
      control: "INV-08",
      tested: true
    },
    {
      threat: "Caller provides malformed or unknown action class",
      control: "INV-11",
      tested: true
    },
    {
      threat: "Caller mismatches proposed and requested action class",
      control: "INV-12",
      tested: true
    },
    {
      threat: "Caller attempts prohibited use",
      control: "INV-10",
      tested: true
    },
    {
      threat: "Unexpected exception produces silent ALLOW",
      control: "Fail-closed catch-all Fix 6",
      tested: true
    }
  ],
  limitationNotice:
    "This is a review-ready core demo, not a production client deployment."
};
