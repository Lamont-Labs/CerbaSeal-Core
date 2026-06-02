# Bounded Autonomy Model: Execution Scope Policy

## Overview

CerbaSeal enforces a bounded autonomy model. Every AI-assisted system governed by CerbaSeal operates within an **Execution Scope Policy** — a defined set of permitted actions, required authorizations, prohibited uses, and escalation paths that the enforcement gate applies to every request before permitting execution.

The bounded autonomy model answers one question: **under what conditions may an AI system's proposal result in a real-world action?**

The answer is always specified in advance, enforced at execution time, and evidenced for every outcome.

---

## The Four Boundaries

Execution Scope Policy defines four structural boundaries for any governed AI agent class:

### 1. Permitted Action Set

The set of action classes this agent class is permitted to propose. Any proposal outside this set triggers INV-11 (unknown action class) or INV-12 (proposal mismatch) and is rejected unconditionally.

Recognized action classes: `allow`, `hold`, `reject`, `escalate`, `account_hold`

An agent may be scoped to a subset. A fraud triage agent scoped to `escalate` and `hold` cannot propose `allow` for any reason.

### 2. Authority Boundary

AI systems are bounded to the **proposal role** only. They may not:
- Declare their own proposals as authoritative (`authorityBearing: false` is required)
- Act as approvers for their own proposals
- Satisfy their own approval requirements

This is enforced by INV-05 (ai_non_authoritative). It is not a policy setting. It is a hard invariant that cannot be relaxed by caller configuration.

### 3. Required Authorization Conditions

For governed workflows, human authorization must be present before any release is issued. The policy specifies:

- Which workflows require human authorization (`WORKFLOWS_REQUIRING_APPROVAL`)
- What authority class the approver must hold
- Whether privileged authorization is required
- What signature form is required

INV-03 enforces all four conditions. An approval that satisfies three of four is not a valid approval.

### 4. Prohibited Use Envelope

Requests marked `prohibitedUse: true` are rejected unconditionally before any other evaluation. INV-10 has no exception path and no escalation path. This is the outer boundary of bounded autonomy: some actions are outside the scope of any governance process, regardless of authority presented.

---

## Enforcement Scope Policy Structure

A CerbaSeal Execution Scope Policy for an agent class specifies:

```
AgentClass:
  permitted_action_classes:   [list of ActionClass values]
  authority_role:             proposal_only             (always — not configurable)
  workflows_requiring_approval: [list of WorkflowClass values]
  required_approver_class:    [HumanAuthorityClass]
  privileged_auth_required:   true | false
  prohibited_use_blocking:    unconditional             (always — not configurable)
  control_currency_required:  true (for sensitive workflows)
  trust_state_required:       true (always — not configurable)
  policy_pack_required:       true (always — not configurable)
  provenance_required:        true (always — not configurable)
  logging_required:           true (always — not configurable)
```

The non-configurable items are enforced by hard invariants. They cannot be turned off by policy settings, caller flags, or operator configuration.

---

## Invariant-to-Boundary Mapping

| Boundary | Governing Invariants |
|----------|---------------------|
| Permitted action set | INV-11 (schema/action validity), INV-12 (proposal binding) |
| Authority boundary | INV-05 (AI non-authoritative), INV-06 (gate bypass prevention) |
| Required authorization | INV-03 (approval required), INV-08 (control currency), INV-09 (trust state) |
| Prohibited use envelope | INV-10 (prohibited use blocking) |
| Universal prerequisites | INV-01 (policy pack), INV-02 (provenance), INV-04 (logging) |
| Decision integrity | INV-07 (immutable envelope), INV-06 (gate integrity) |

---

## Reference Scenario: Fraud Triage Agent

To make the model concrete, the following describes how the bounded autonomy model applies to the reference fraud triage workflow included in CerbaSeal's demonstration environment.

**Agent class:** AI fraud scoring model  
**Workflow class:** `fraud_triage`  
**Jurisdiction:** EU

### Permitted Actions

The fraud triage agent is scoped to two action classes: `escalate` and `hold`.

Any proposal naming a different action class (`allow`, `reject`, `account_hold`) is rejected by INV-11 or INV-12 before any other evaluation occurs. The agent cannot propose outside this set regardless of what the caller supplies.

### Blocked Actions

The following are unconditionally blocked regardless of proposal content, caller flags, or operator configuration:

- **AI self-authorization** — the agent cannot act as its own approver; `authorityBearing: false` is required. Violation triggers INV-05 → REJECT.
- **Ungoverned execution** — absent policy pack reference is rejected by INV-01. The agent cannot declare itself ungoverned.
- **Untraceable proposals** — absent or incomplete provenance (model version, rule set version, source hash) is rejected by INV-02.
- **Prohibited use requests** — any request with `prohibitedUse: true` is rejected by INV-10. No exception path exists. (INV-10 is step 9 in the gate sequence — see "How CerbaSeal Enforces This" for the full order.)
- **Execution without audit** — `loggingReady: false` is rejected by INV-04.
- **Stale controls for this sensitive workflow** — `criticalControlsValid: false` or `stale: true` is rejected by INV-08.
- **Invalid trust state** — `trustState.trusted: false` is rejected by INV-09.
- **Approval bound to wrong request** — `forRequestId !== requestId` is rejected by INV-03 → REJECT (not recoverable for this submission).
- **Invalid approver authority class** — approver does not hold a recognized authority class (`analyst`, `reviewer`, `manager`, `compliance_officer`) is rejected by INV-03 → REJECT.
- **Privileged authorization not satisfied** — `privilegedAuthSatisfied: false` is rejected by INV-03 → REJECT.
- **Approval signature absent** — empty `immutableSignature` is rejected by INV-03 → REJECT.

### Escalation Triggers

Exactly one condition causes the gate to produce HOLD — suspending execution pending approval — rather than an outright REJECT:

- **Approval artifact absent** — `approvalArtifact: null` when `approvalRequired: true` or workflowClass is `fraud_triage`. The gate issues HOLD; the requesting system must obtain a valid approval artifact and resubmit the governed request.

All other approval failures (wrong requestId binding, invalid authority class, missing privileged auth, absent signature) produce REJECT, not HOLD. These indicate a defective approval artifact, not a missing one, and require correction and resubmission.

HOLD is not a bypass. The gate does not release on HOLD. The original request must be resubmitted with a valid approval artifact.

### Authority Boundaries

| Role | Permitted action | Prohibited action |
|------|-----------------|-------------------|
| AI fraud scoring model | Propose `escalate` or `hold` | Authorize, approve, sign, or self-release |
| Human approver (authority class `analyst`, `reviewer`, `manager`, or `compliance_officer`) | Supply a valid approval artifact bound to this requestId | None — human authority is the release condition |
| Caller / application code | Construct and submit a GovernedRequest | Construct a GateResult directly (blocked by INV-06 at evidence layer) |

The AI authority boundary is not a policy setting. It is enforced by INV-05 as a hard invariant that cannot be configured away, overridden by a policy pack, or bypassed by setting caller flags.

**Outcome summary:**
- ALLOW: all 13 gate checks pass — release authorization issued, evidence bundle produced, audit chain extended
- HOLD: approval condition not met — action suspended, accountability record created
- REJECT: any hard invariant failed — action permanently blocked, accountability record created

---

## What Bounded Autonomy Is Not

**Not discretionary.** The enforcement gate does not make judgment calls. It applies the policy unconditionally. A structurally valid, fully authorized request is allowed — even if the underlying decision is poor. Contextual judgment belongs to human reviewers.

**Not advisory.** The gate does not warn and proceed. Invariant violations always produce HOLD or REJECT. There is no "soft enforcement" mode.

**Not configurable at runtime.** The non-configurable invariants (INV-01, INV-02, INV-04, INV-05, INV-06, INV-07, INV-09, INV-10) cannot be disabled, overridden, or bypassed by caller flags, policy settings, or operator action. They are structural properties of the enforcement layer.

**Not a substitute for policy content.** CerbaSeal enforces that a policy pack reference exists. It does not evaluate policy content, semantic alignment, or whether the policy is appropriate for the jurisdiction. Policy governance is a separate layer.

---

## How CerbaSeal Enforces This

When `ExecutionGateService.evaluate()` receives a `GovernedRequest`, the gate applies its invariant checks in the following runtime order. The sequence is the executable expression of the Execution Scope Policy.

**Checks inside `evaluate()`** — applied in sequence; first failure exits with HOLD or REJECT:

| Step | Invariant | Scope policy rule enforced |
|------|-----------|---------------------------|
| 1 | INV-11 | Request schema must be valid — malformed requests rejected before any other check |
| 2 | INV-11 | Proposed action class must be recognized — out-of-scope actions rejected |
| 3 | INV-11 | Proposal action class must be recognized — proposal cannot name an unknown action |
| 4 | INV-12 | Proposed and proposal action classes must match exactly — drift is rejected |
| 5 | INV-01 | Policy pack reference must be present — ungoverned execution rejected |
| 6 | INV-02 | Decision provenance must be complete — untraceable proposals rejected |
| 7 | INV-04 | Logging must be ready — execution without audit path is rejected |
| 8 | INV-05 | AI actor may not be authority-bearing — AI cannot authorize its own proposal |
| 9 | INV-10 | Prohibited use must block — prohibited requests rejected unconditionally |
| 10 | INV-08 | Controls must be current for sensitive workflows — stale controls block release |
| 11 | INV-09 | Trust state must be valid — absent or invalid trust state blocks release |
| 12 | INV-03 | Required human approval must be present, bound to this request, and validly signed |
| 13 | INV-07 | Decision envelope is marked immutable at creation — treated as a governed artifact |

**Gate integrity check — enforced outside `evaluate()`:**

INV-06 is enforced downstream, not inside `evaluate()`. The `EvidenceBundleService` calls `assertIsGateIssued()`, which checks a module-private `WeakSet` registry that `evaluate()` populates with every `GateResult` it produces. Any `GateResult` not in the registry — including manually constructed objects — is rejected before an evidence bundle can be created. This means INV-06 cannot be satisfied by bypassing the gate; the bypass is detected at the evidence layer.

Every check in `evaluate()` must pass. A failure at any step produces HOLD or REJECT immediately. The gate does not skip checks or attempt recovery.

The full check sequence is the Execution Scope Policy in executable form.

---

## Summary

CerbaSeal implements bounded autonomy by enforcing that:

1. AI systems remain within the **proposal role** — they may initiate but not authorize
2. Human authorization is **structurally required** for designated workflows — not optional, not bypassable
3. Actions outside the **permitted action set** are rejected before evaluation reaches policy
4. The **prohibited use envelope** applies unconditionally — no exception path exists
5. Every outcome — ALLOW, HOLD, or REJECT — produces a **verifiable, replayable evidence record**

The boundary is not a promise. It is code, enforced at execution time, covered by adversarial tests, and exportable as a verifiable proof snapshot.
