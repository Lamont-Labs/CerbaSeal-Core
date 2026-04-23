# CerbaSeal — Enforcement Loop Demonstration

## 1. Overview

CerbaSeal is a decision gate that sits between an AI-assisted system and any consequential action it might take. Before anything happens — a fraud hold, an escalation, an account action — CerbaSeal evaluates whether the proposed action is permitted to proceed. It checks a fixed set of rules, produces a structured decision, and records everything permanently. The result is always one of three outcomes: the action is allowed, the action is held for human review, or the action is rejected outright.

---

## 2. The Scenario

An EU-based fintech uses CerbaSeal to govern fraud triage decisions. An account has triggered two risk signals: a sanctions list match and a dormant account reactivation. The system must decide whether to place an account hold.

Three attempts are made on this scenario, each with different actors and conditions.

**Case A — AI system, no approval**
An AI engine detects the risk signals and attempts to issue the account hold itself. It marks its own proposal as non-authoritative, hoping to pass through the gate. It does not provide a human approval.

**Case B — Human analyst, approval required but missing**
A human analyst reviews the same case and agrees an account hold is warranted. The request is submitted correctly in every way, but no formal approval from a compliance officer has been obtained yet.

**Case C — Human analyst, valid approval provided**
The same analyst resubmits after a compliance officer reviews and formally approves the action. The approval is explicitly linked to this specific request.

---

## Real-World Workflow Context

This example demonstrates how CerbaSeal operates within a representative high-risk workflow.  
The same enforcement model applies to any system where actions must be authorized before execution.

- The AI Detection System identifies high-risk activity and generates proposals, but holds no execution authority
- The Fraud Analyst reviews flagged cases and proposes actions, but cannot self-approve sensitive operations
- The Compliance Officer issues approvals bound to specific requests and holds the sole execution authority for sensitive actions
- CerbaSeal sits between all decision-making systems and the execution layer — no action reaches execution without passing through the enforcement gate
- The three traces in this document (REJECT, HOLD, ALLOW) map directly to Steps 2, 4, and 6 of the reference workflow

Full workflow definition: [client-workflow-canonical.md](./client-workflow-canonical.md)  
Simplified walkthrough: [fraud-workflow.md](./fraud-workflow.md)

---

## 3. The Enforcement Loop

Every request goes through the same four steps:

1. **Request enters.** The requesting system submits a structured description of the proposed action — who is asking, what they want to do, under what policy, and whether a human has approved it.

2. **System evaluates conditions.** CerbaSeal checks a fixed sequence of rules: Is the policy reference present? Is the system's decision model documented? Is logging active? Is the actor an AI trying to authorize itself? Is the action prohibited? Are controls current? Is trust valid? Is the required approval present and correctly scoped?

3. **A decision is produced.** The first rule that fails determines the outcome. If all rules pass, the action is allowed and a release authorization is issued. If a required approval is missing, the action is held. Any other failure produces an outright rejection.

4. **Evidence is recorded.** Regardless of outcome, a permanent record is created containing the original request, the decision, the reason, and a hash-linked sequence of audit events. Nothing is discarded. Blocked actions leave as much evidence as allowed ones.

---

## 4. Outcome Table

| Scenario | Actor | Approval Present | Outcome | Why |
|---|---|---|---|---|
| Case A | AI engine | No | **REJECT** | AI systems cannot authorize consequential actions, regardless of how the request is framed or what flags are set |
| Case B | Human analyst | No | **HOLD** | Fraud triage always requires human approval; the request is otherwise valid but cannot proceed without it |
| Case C | Human analyst | Yes — scoped to this request, signed, reviewed by compliance officer | **ALLOW** | All conditions satisfied; release authorization issued |

---

## 5. System Artifacts

Every evaluation produces three permanent artifacts.

**Decision Envelope** — the verdict. A structured record of what was decided, when, why, and which rules were checked. Think of it as the official receipt of the decision. It cannot be altered after it is issued.

**Evidence Bundle** — the complete package. It contains the original request, the decision envelope, the release authorization (if issued), and the full audit event chain. This is what you would hand to a regulator or an internal auditor.

**Event Chain** — the flight recorder. A sequence of timestamped, hash-linked audit events that record exactly what happened and in what order. Each entry references the hash of the entry before it. Tampering with any entry breaks the chain and is detectable.

---

## 6. What This Proves

**AI cannot authorize itself.** An AI actor submitting an AI-sourced proposal is blocked unconditionally. Setting flags to suppress the approval requirement has no effect on this rule. The block fires before the approval check is reached.

**Required approvals cannot be bypassed.** Fraud triage is hardcoded to require human approval. A caller cannot turn this off by declaring approval is not required. The rule is in the gate, not in the request.

**Valid actions produce verifiable authorization.** When an action is allowed, a named release authorization is issued, linked to the specific request and the specific compliance officer who approved it. The authorization exists as a concrete artifact — not an implicit state.

**Every decision is permanently recorded.** Rejected requests, held requests, and allowed requests all produce the same class of evidence. There is no path through the system that leaves no record.

---

## 7. Appendix — Full Trace Data

The following JSON is the unaltered output from three live execution runs through the CerbaSeal enforcement engine.

---

### Case A — REJECT (AI self-authorization attempt)

**REQUEST**
```json
{
  "requestId": "trace_reject_001",
  "workflowClass": "fraud_triage",
  "jurisdiction": "EU",
  "actorId": "ai_engine_cerba_v3",
  "actorAuthorityClass": "ai",
  "proposedActionClass": "escalate",
  "proposal": {
    "proposalSourceKind": "ai",
    "authorityBearing": false,
    "requestedActionClass": "escalate",
    "confidence": 0.97,
    "reasonCodes": [
      "high_velocity_anomaly",
      "cross_border_mismatch",
      "repeated_fail_pattern"
    ],
    "proposalCreatedAt": "2026-04-22T09:00:00.000Z"
  },
  "sensitive": true,
  "prohibitedUse": false,
  "policyPackRef": {
    "id": "policy_fraud_eu_v3",
    "version": "3.1.2"
  },
  "provenanceRef": {
    "modelVersion": "cerba_model_4.1.0",
    "ruleSetVersion": "eu_rules_9.2.1",
    "sourceHash": "sha256:a3f9c12e44d8b701f2c98e4a5d67b3e2f01c9d8a7b4e56f3c2a1d9e8f7b6c5a4"
  },
  "approvalRequired": false,
  "approvalArtifact": null,
  "loggingReady": true,
  "controlStatus": {
    "criticalControlsValid": true,
    "stale": false,
    "verificationRunId": "vr_reject_001"
  },
  "trustState": {
    "trusted": true,
    "trustStateId": "trust_reject_001"
  },
  "createdAt": "2026-04-22T09:00:00.000Z"
}
```

**GATE RESULT**
```json
{
  "decisionEnvelope": {
    "envelopeId": "env_trace_reject_001",
    "requestId": "trace_reject_001",
    "workflowClass": "fraud_triage",
    "finalState": "REJECT",
    "permittedActionClass": null,
    "humanApprovalRequired": false,
    "humanApprovalPresent": false,
    "proposalSourceKind": "ai",
    "immutable": true,
    "evidenceBundleId": "evidence_trace_reject_001",
    "trace": {
      "checkedInvariants": [
        "INV-11",
        "INV-11",
        "INV-11",
        "INV-12",
        "INV-01",
        "INV-02",
        "INV-04",
        "INV-05",
        "INV-07"
      ],
      "reasonCodes": [
        "AI_CANNOT_AUTHORIZE",
        "DECISION_REJECTED"
      ],
      "evaluatedAt": "2026-04-23T16:24:50.710Z"
    },
    "issuedAt": "2026-04-23T16:24:50.711Z"
  },
  "releaseAuthorization": null,
  "blockedActionRecord": {
    "requestId": "trace_reject_001",
    "finalState": "REJECT",
    "reasonCodes": [
      "AI_CANNOT_AUTHORIZE",
      "DECISION_REJECTED"
    ],
    "checkedInvariants": [
      "INV-11",
      "INV-11",
      "INV-11",
      "INV-12",
      "INV-01",
      "INV-02",
      "INV-04",
      "INV-05",
      "INV-07"
    ],
    "recordedAt": "2026-04-23T16:24:50.711Z"
  }
}
```

**EVIDENCE BUNDLE**
```json
{
  "evidenceBundleId": "evidence_trace_reject_001",
  "request": {
    "requestId": "trace_reject_001",
    "workflowClass": "fraud_triage",
    "jurisdiction": "EU",
    "actorId": "ai_engine_cerba_v3",
    "actorAuthorityClass": "ai",
    "proposedActionClass": "escalate",
    "proposal": {
      "proposalSourceKind": "ai",
      "authorityBearing": false,
      "requestedActionClass": "escalate",
      "confidence": 0.97,
      "reasonCodes": [
        "high_velocity_anomaly",
        "cross_border_mismatch",
        "repeated_fail_pattern"
      ],
      "proposalCreatedAt": "2026-04-22T09:00:00.000Z"
    },
    "sensitive": true,
    "prohibitedUse": false,
    "policyPackRef": {
      "id": "policy_fraud_eu_v3",
      "version": "3.1.2"
    },
    "provenanceRef": {
      "modelVersion": "cerba_model_4.1.0",
      "ruleSetVersion": "eu_rules_9.2.1",
      "sourceHash": "sha256:a3f9c12e44d8b701f2c98e4a5d67b3e2f01c9d8a7b4e56f3c2a1d9e8f7b6c5a4"
    },
    "approvalRequired": false,
    "approvalArtifact": null,
    "loggingReady": true,
    "controlStatus": {
      "criticalControlsValid": true,
      "stale": false,
      "verificationRunId": "vr_reject_001"
    },
    "trustState": {
      "trusted": true,
      "trustStateId": "trust_reject_001"
    },
    "createdAt": "2026-04-22T09:00:00.000Z"
  },
  "decisionEnvelope": {
    "envelopeId": "env_trace_reject_001",
    "requestId": "trace_reject_001",
    "workflowClass": "fraud_triage",
    "finalState": "REJECT",
    "permittedActionClass": null,
    "humanApprovalRequired": false,
    "humanApprovalPresent": false,
    "proposalSourceKind": "ai",
    "immutable": true,
    "evidenceBundleId": "evidence_trace_reject_001",
    "trace": {
      "checkedInvariants": [
        "INV-11",
        "INV-11",
        "INV-11",
        "INV-12",
        "INV-01",
        "INV-02",
        "INV-04",
        "INV-05",
        "INV-07"
      ],
      "reasonCodes": [
        "AI_CANNOT_AUTHORIZE",
        "DECISION_REJECTED"
      ],
      "evaluatedAt": "2026-04-23T16:24:50.710Z"
    },
    "issuedAt": "2026-04-23T16:24:50.711Z"
  },
  "releaseAuthorization": null,
  "blockedActionRecord": {
    "requestId": "trace_reject_001",
    "finalState": "REJECT",
    "reasonCodes": [
      "AI_CANNOT_AUTHORIZE",
      "DECISION_REJECTED"
    ],
    "checkedInvariants": [
      "INV-11",
      "INV-11",
      "INV-11",
      "INV-12",
      "INV-01",
      "INV-02",
      "INV-04",
      "INV-05",
      "INV-07"
    ],
    "recordedAt": "2026-04-23T16:24:50.711Z"
  },
  "eventChain": [
    {
      "eventId": "evt_1",
      "requestId": "trace_reject_001",
      "eventType": "REQUEST_EVALUATED",
      "timestamp": "2026-04-23T16:24:50.711Z",
      "payloadHash": "7cbfb9513c2ebcb3fc4428ebf2dfdb7d8378b48a0e6bd145121b917c8915a54c",
      "previousHash": null,
      "entryHash": "1741806bee1280f0662544e241d0ce0cb91d4685d4184549a70bdfe6e1cc68d5"
    },
    {
      "eventId": "evt_2",
      "requestId": "trace_reject_001",
      "eventType": "ACTION_BLOCKED",
      "timestamp": "2026-04-23T16:24:50.711Z",
      "payloadHash": "34bc32524aa3294e98ff86842e34033f11c1fa8d7d59cea64c5c234b6d275aa5",
      "previousHash": "1741806bee1280f0662544e241d0ce0cb91d4685d4184549a70bdfe6e1cc68d5",
      "entryHash": "de0da0720c047508f55c8695aa887b55bec857d9f49255d402afa8ee3ef1dd1d"
    },
    {
      "eventId": "evt_3",
      "requestId": "trace_reject_001",
      "eventType": "EVIDENCE_BUNDLE_CREATED",
      "timestamp": "2026-04-23T16:24:50.711Z",
      "payloadHash": "3f99c6b239c4c3331cef23285a606bf93d697518e61d8d672b51423c740bceb1",
      "previousHash": "de0da0720c047508f55c8695aa887b55bec857d9f49255d402afa8ee3ef1dd1d",
      "entryHash": "1150e315905bc81cade73f8add778a52ba0398f4b3497c898cf547e214e1f1bb"
    }
  ],
  "createdAt": "2026-04-23T16:24:50.711Z"
}
```

---

### Case B — HOLD (missing required approval)

**REQUEST**
```json
{
  "requestId": "trace_hold_001",
  "workflowClass": "fraud_triage",
  "jurisdiction": "EU",
  "actorId": "analyst_morgan_k",
  "actorAuthorityClass": "analyst",
  "proposedActionClass": "account_hold",
  "proposal": {
    "proposalSourceKind": "deterministic_rule",
    "authorityBearing": false,
    "requestedActionClass": "account_hold",
    "confidence": 0.89,
    "reasonCodes": [
      "sanctions_list_match",
      "dormant_account_reactivation"
    ],
    "proposalCreatedAt": "2026-04-22T10:00:00.000Z"
  },
  "sensitive": true,
  "prohibitedUse": false,
  "policyPackRef": {
    "id": "policy_fraud_eu_v3",
    "version": "3.1.2"
  },
  "provenanceRef": {
    "modelVersion": "cerba_model_4.1.0",
    "ruleSetVersion": "eu_rules_9.2.1",
    "sourceHash": "sha256:b4e8d21f55c9a832e3b17f4d6c98a5e2f03d1c7b8a5f46e2d3c0b9f8a7d6e5c3"
  },
  "approvalRequired": true,
  "approvalArtifact": null,
  "loggingReady": true,
  "controlStatus": {
    "criticalControlsValid": true,
    "stale": false,
    "verificationRunId": "vr_hold_001"
  },
  "trustState": {
    "trusted": true,
    "trustStateId": "trust_hold_001"
  },
  "createdAt": "2026-04-22T10:00:00.000Z"
}
```

**GATE RESULT**
```json
{
  "decisionEnvelope": {
    "envelopeId": "env_trace_hold_001",
    "requestId": "trace_hold_001",
    "workflowClass": "fraud_triage",
    "finalState": "HOLD",
    "permittedActionClass": null,
    "humanApprovalRequired": true,
    "humanApprovalPresent": false,
    "proposalSourceKind": "deterministic_rule",
    "immutable": true,
    "evidenceBundleId": "evidence_trace_hold_001",
    "trace": {
      "checkedInvariants": [
        "INV-11",
        "INV-11",
        "INV-11",
        "INV-12",
        "INV-01",
        "INV-02",
        "INV-04",
        "INV-05",
        "INV-10",
        "INV-08",
        "INV-09",
        "INV-03",
        "INV-07"
      ],
      "reasonCodes": [
        "REQUIRED_APPROVAL_MISSING",
        "DECISION_HELD"
      ],
      "evaluatedAt": "2026-04-23T16:24:50.713Z"
    },
    "issuedAt": "2026-04-23T16:24:50.713Z"
  },
  "releaseAuthorization": null,
  "blockedActionRecord": {
    "requestId": "trace_hold_001",
    "finalState": "HOLD",
    "reasonCodes": [
      "REQUIRED_APPROVAL_MISSING",
      "DECISION_HELD"
    ],
    "checkedInvariants": [
      "INV-11",
      "INV-11",
      "INV-11",
      "INV-12",
      "INV-01",
      "INV-02",
      "INV-04",
      "INV-05",
      "INV-10",
      "INV-08",
      "INV-09",
      "INV-03",
      "INV-07"
    ],
    "recordedAt": "2026-04-23T16:24:50.713Z"
  }
}
```

**EVIDENCE BUNDLE**
```json
{
  "evidenceBundleId": "evidence_trace_hold_001",
  "request": {
    "requestId": "trace_hold_001",
    "workflowClass": "fraud_triage",
    "jurisdiction": "EU",
    "actorId": "analyst_morgan_k",
    "actorAuthorityClass": "analyst",
    "proposedActionClass": "account_hold",
    "proposal": {
      "proposalSourceKind": "deterministic_rule",
      "authorityBearing": false,
      "requestedActionClass": "account_hold",
      "confidence": 0.89,
      "reasonCodes": [
        "sanctions_list_match",
        "dormant_account_reactivation"
      ],
      "proposalCreatedAt": "2026-04-22T10:00:00.000Z"
    },
    "sensitive": true,
    "prohibitedUse": false,
    "policyPackRef": {
      "id": "policy_fraud_eu_v3",
      "version": "3.1.2"
    },
    "provenanceRef": {
      "modelVersion": "cerba_model_4.1.0",
      "ruleSetVersion": "eu_rules_9.2.1",
      "sourceHash": "sha256:b4e8d21f55c9a832e3b17f4d6c98a5e2f03d1c7b8a5f46e2d3c0b9f8a7d6e5c3"
    },
    "approvalRequired": true,
    "approvalArtifact": null,
    "loggingReady": true,
    "controlStatus": {
      "criticalControlsValid": true,
      "stale": false,
      "verificationRunId": "vr_hold_001"
    },
    "trustState": {
      "trusted": true,
      "trustStateId": "trust_hold_001"
    },
    "createdAt": "2026-04-22T10:00:00.000Z"
  },
  "decisionEnvelope": {
    "envelopeId": "env_trace_hold_001",
    "requestId": "trace_hold_001",
    "workflowClass": "fraud_triage",
    "finalState": "HOLD",
    "permittedActionClass": null,
    "humanApprovalRequired": true,
    "humanApprovalPresent": false,
    "proposalSourceKind": "deterministic_rule",
    "immutable": true,
    "evidenceBundleId": "evidence_trace_hold_001",
    "trace": {
      "checkedInvariants": [
        "INV-11",
        "INV-11",
        "INV-11",
        "INV-12",
        "INV-01",
        "INV-02",
        "INV-04",
        "INV-05",
        "INV-10",
        "INV-08",
        "INV-09",
        "INV-03",
        "INV-07"
      ],
      "reasonCodes": [
        "REQUIRED_APPROVAL_MISSING",
        "DECISION_HELD"
      ],
      "evaluatedAt": "2026-04-23T16:24:50.713Z"
    },
    "issuedAt": "2026-04-23T16:24:50.713Z"
  },
  "releaseAuthorization": null,
  "blockedActionRecord": {
    "requestId": "trace_hold_001",
    "finalState": "HOLD",
    "reasonCodes": [
      "REQUIRED_APPROVAL_MISSING",
      "DECISION_HELD"
    ],
    "checkedInvariants": [
      "INV-11",
      "INV-11",
      "INV-11",
      "INV-12",
      "INV-01",
      "INV-02",
      "INV-04",
      "INV-05",
      "INV-10",
      "INV-08",
      "INV-09",
      "INV-03",
      "INV-07"
    ],
    "recordedAt": "2026-04-23T16:24:50.713Z"
  },
  "eventChain": [
    {
      "eventId": "evt_1",
      "requestId": "trace_hold_001",
      "eventType": "REQUEST_EVALUATED",
      "timestamp": "2026-04-23T16:24:50.713Z",
      "payloadHash": "203a5bd194014bc18d357e00c5f19553eaaea7737ddd1e8616511d82cdbcc69d",
      "previousHash": null,
      "entryHash": "b38549ce5eb28f48852cd77520c9a5f3b3e473813e62abdef4cbd7cf765b97cc"
    },
    {
      "eventId": "evt_2",
      "requestId": "trace_hold_001",
      "eventType": "ACTION_BLOCKED",
      "timestamp": "2026-04-23T16:24:50.713Z",
      "payloadHash": "b2ece938d64e62aa38273f93ae4fe7cf7ac78d4e2030ccae782286529f374ac6",
      "previousHash": "b38549ce5eb28f48852cd77520c9a5f3b3e473813e62abdef4cbd7cf765b97cc",
      "entryHash": "77c8842af1e900c8cf6726d7f41ea960b316f8abfd00826f2de04f268924d9b4"
    },
    {
      "eventId": "evt_3",
      "requestId": "trace_hold_001",
      "eventType": "EVIDENCE_BUNDLE_CREATED",
      "timestamp": "2026-04-23T16:24:50.714Z",
      "payloadHash": "e0be187fd7bc7861fbd193214581649cfcbdaf2bec1e32eaa24e690007033ad6",
      "previousHash": "77c8842af1e900c8cf6726d7f41ea960b316f8abfd00826f2de04f268924d9b4",
      "entryHash": "74cbe9e0bfe2a396aafcf52953575191e4af585c26dd61fd49995952c4b6a303"
    }
  ],
  "createdAt": "2026-04-23T16:24:50.714Z"
}
```

---

### Case C — ALLOW (valid human-approved execution)

**REQUEST**
```json
{
  "requestId": "trace_allow_001",
  "workflowClass": "fraud_triage",
  "jurisdiction": "EU",
  "actorId": "analyst_morgan_k",
  "actorAuthorityClass": "analyst",
  "proposedActionClass": "account_hold",
  "proposal": {
    "proposalSourceKind": "deterministic_rule",
    "authorityBearing": false,
    "requestedActionClass": "account_hold",
    "confidence": 0.89,
    "reasonCodes": [
      "sanctions_list_match",
      "dormant_account_reactivation"
    ],
    "proposalCreatedAt": "2026-04-22T10:00:00.000Z"
  },
  "sensitive": true,
  "prohibitedUse": false,
  "policyPackRef": {
    "id": "policy_fraud_eu_v3",
    "version": "3.1.2"
  },
  "provenanceRef": {
    "modelVersion": "cerba_model_4.1.0",
    "ruleSetVersion": "eu_rules_9.2.1",
    "sourceHash": "sha256:b4e8d21f55c9a832e3b17f4d6c98a5e2f03d1c7b8a5f46e2d3c0b9f8a7d6e5c3"
  },
  "approvalRequired": true,
  "approvalArtifact": {
    "approvalId": "approval_trace_allow_001",
    "approverId": "compliance_officer_reed_v",
    "forRequestId": "trace_allow_001",
    "approverAuthorityClass": "compliance_officer",
    "privilegedAuthSatisfied": true,
    "immutableSignature": "sig_cerbaseal_co_reed_v_2026_04_22_trace_allow_001",
    "approvedAt": "2026-04-22T10:05:00.000Z"
  },
  "loggingReady": true,
  "controlStatus": {
    "criticalControlsValid": true,
    "stale": false,
    "verificationRunId": "vr_allow_001"
  },
  "trustState": {
    "trusted": true,
    "trustStateId": "trust_allow_001"
  },
  "createdAt": "2026-04-22T10:00:00.000Z"
}
```

**GATE RESULT**
```json
{
  "decisionEnvelope": {
    "envelopeId": "env_trace_allow_001",
    "requestId": "trace_allow_001",
    "workflowClass": "fraud_triage",
    "finalState": "ALLOW",
    "permittedActionClass": "account_hold",
    "humanApprovalRequired": true,
    "humanApprovalPresent": true,
    "proposalSourceKind": "deterministic_rule",
    "immutable": true,
    "evidenceBundleId": "evidence_trace_allow_001",
    "trace": {
      "checkedInvariants": [
        "INV-11",
        "INV-11",
        "INV-11",
        "INV-12",
        "INV-01",
        "INV-02",
        "INV-04",
        "INV-05",
        "INV-10",
        "INV-08",
        "INV-09",
        "INV-03",
        "INV-07"
      ],
      "reasonCodes": [
        "DECISION_ALLOWED"
      ],
      "evaluatedAt": "2026-04-23T16:24:50.715Z"
    },
    "issuedAt": "2026-04-23T16:24:50.715Z"
  },
  "releaseAuthorization": {
    "releaseAuthorizationId": "release_trace_allow_001",
    "requestId": "trace_allow_001",
    "envelopeId": "env_trace_allow_001",
    "actionClass": "account_hold",
    "releasedAt": "2026-04-23T16:24:50.715Z"
  },
  "blockedActionRecord": null
}
```

**EVIDENCE BUNDLE**
```json
{
  "evidenceBundleId": "evidence_trace_allow_001",
  "request": {
    "requestId": "trace_allow_001",
    "workflowClass": "fraud_triage",
    "jurisdiction": "EU",
    "actorId": "analyst_morgan_k",
    "actorAuthorityClass": "analyst",
    "proposedActionClass": "account_hold",
    "proposal": {
      "proposalSourceKind": "deterministic_rule",
      "authorityBearing": false,
      "requestedActionClass": "account_hold",
      "confidence": 0.89,
      "reasonCodes": [
        "sanctions_list_match",
        "dormant_account_reactivation"
      ],
      "proposalCreatedAt": "2026-04-22T10:00:00.000Z"
    },
    "sensitive": true,
    "prohibitedUse": false,
    "policyPackRef": {
      "id": "policy_fraud_eu_v3",
      "version": "3.1.2"
    },
    "provenanceRef": {
      "modelVersion": "cerba_model_4.1.0",
      "ruleSetVersion": "eu_rules_9.2.1",
      "sourceHash": "sha256:b4e8d21f55c9a832e3b17f4d6c98a5e2f03d1c7b8a5f46e2d3c0b9f8a7d6e5c3"
    },
    "approvalRequired": true,
    "approvalArtifact": {
      "approvalId": "approval_trace_allow_001",
      "approverId": "compliance_officer_reed_v",
      "forRequestId": "trace_allow_001",
      "approverAuthorityClass": "compliance_officer",
      "privilegedAuthSatisfied": true,
      "immutableSignature": "sig_cerbaseal_co_reed_v_2026_04_22_trace_allow_001",
      "approvedAt": "2026-04-22T10:05:00.000Z"
    },
    "loggingReady": true,
    "controlStatus": {
      "criticalControlsValid": true,
      "stale": false,
      "verificationRunId": "vr_allow_001"
    },
    "trustState": {
      "trusted": true,
      "trustStateId": "trust_allow_001"
    },
    "createdAt": "2026-04-22T10:00:00.000Z"
  },
  "decisionEnvelope": {
    "envelopeId": "env_trace_allow_001",
    "requestId": "trace_allow_001",
    "workflowClass": "fraud_triage",
    "finalState": "ALLOW",
    "permittedActionClass": "account_hold",
    "humanApprovalRequired": true,
    "humanApprovalPresent": true,
    "proposalSourceKind": "deterministic_rule",
    "immutable": true,
    "evidenceBundleId": "evidence_trace_allow_001",
    "trace": {
      "checkedInvariants": [
        "INV-11",
        "INV-11",
        "INV-11",
        "INV-12",
        "INV-01",
        "INV-02",
        "INV-04",
        "INV-05",
        "INV-10",
        "INV-08",
        "INV-09",
        "INV-03",
        "INV-07"
      ],
      "reasonCodes": [
        "DECISION_ALLOWED"
      ],
      "evaluatedAt": "2026-04-23T16:24:50.715Z"
    },
    "issuedAt": "2026-04-23T16:24:50.715Z"
  },
  "releaseAuthorization": {
    "releaseAuthorizationId": "release_trace_allow_001",
    "requestId": "trace_allow_001",
    "envelopeId": "env_trace_allow_001",
    "actionClass": "account_hold",
    "releasedAt": "2026-04-23T16:24:50.715Z"
  },
  "blockedActionRecord": null,
  "eventChain": [
    {
      "eventId": "evt_1",
      "requestId": "trace_allow_001",
      "eventType": "REQUEST_EVALUATED",
      "timestamp": "2026-04-23T16:24:50.715Z",
      "payloadHash": "992f3f36114ef2508fa6b3ce6fffc161ec556680bed00e9280911cd0831a7fbc",
      "previousHash": null,
      "entryHash": "a12f9241a2800446179510e21d791181c8a1d598de02decac74f03429c7bfa6c"
    },
    {
      "eventId": "evt_2",
      "requestId": "trace_allow_001",
      "eventType": "RELEASE_AUTHORIZED",
      "timestamp": "2026-04-23T16:24:50.715Z",
      "payloadHash": "6f051e4871415ef79ba22646851a3fb5189ded7242066d0925a3f52c2285f14f",
      "previousHash": "a12f9241a2800446179510e21d791181c8a1d598de02decac74f03429c7bfa6c",
      "entryHash": "532144dd9219bbbf26e93c48fdff83ecd9aac826f46ce3d8d7331769c5bd2b6f"
    },
    {
      "eventId": "evt_3",
      "requestId": "trace_allow_001",
      "eventType": "EVIDENCE_BUNDLE_CREATED",
      "timestamp": "2026-04-23T16:24:50.715Z",
      "payloadHash": "95ff0e33eaf7bdb14e91f7bee95ff9e76b3109f79460d78154f84b35956fdd3f",
      "previousHash": "532144dd9219bbbf26e93c48fdff83ecd9aac826f46ce3d8d7331769c5bd2b6f",
      "entryHash": "722a71e4b3725ea02bb68e3d3b69313ec70433f2c135e6c67abb053e4b8f5783"
    }
  ],
  "createdAt": "2026-04-23T16:24:50.715Z"
}
```
