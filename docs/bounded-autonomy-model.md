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

**Scope policy:**
- Permitted actions: `escalate`, `hold`
- Authority role: proposal only — `authorityBearing: false`
- Workflows requiring approval: `fraud_triage` (hardcoded — cannot be overridden)
- Required approver class: `reviewer` or higher
- Privileged auth required: `true`
- Prohibited use: unconditional block
- Control currency: required (sensitive workflow)
- Trust state: required
- Policy pack: required (`policy_fraud_v1`)
- Provenance: required (model version + rule set + source hash)
- Logging: required

**What the AI can do:**
- Propose `escalate` with confidence score and reason codes
- Propose `hold` with confidence score and reason codes

**What the AI cannot do:**
- Approve its own proposal (INV-05)
- Propose `allow` or `reject` for this workflow (INV-12)
- Bypass the gate and construct a release authorization directly (INV-06)
- Omit provenance and expect the gate to fill it in (INV-02)
- Mark `prohibitedUse: true` and expect any other outcome (INV-10)

**What must happen before release:**
- A human reviewer with `reviewer` or higher authority class must supply an approval artifact
- The approval must be bound to the exact requestId being evaluated (`forRequestId === requestId`)
- The approval must carry a non-empty `immutableSignature`
- `privilegedAuthSatisfied: true` must be affirmed
- `criticalControlsValid: true` and `stale: false` must be present
- `trustState.trusted: true` must be present

**Outcome:**
- ALLOW: release authorization issued, evidence bundle produced, audit chain extended
- HOLD: approval artifact missing or invalid — action suspended, accountability record created
- REJECT: any hard invariant failed — action permanently blocked, accountability record created

---

## What Bounded Autonomy Is Not

**Not discretionary.** The enforcement gate does not make judgment calls. It applies the policy unconditionally. A structurally valid, fully authorized request is allowed — even if the underlying decision is poor. Contextual judgment belongs to human reviewers.

**Not advisory.** The gate does not warn and proceed. Invariant violations always produce HOLD or REJECT. There is no "soft enforcement" mode.

**Not configurable at runtime.** The non-configurable invariants (INV-01, INV-02, INV-04, INV-05, INV-06, INV-07, INV-09, INV-10) cannot be disabled, overridden, or bypassed by caller flags, policy settings, or operator action. They are structural properties of the enforcement layer.

**Not a substitute for policy content.** CerbaSeal enforces that a policy pack reference exists. It does not evaluate policy content, semantic alignment, or whether the policy is appropriate for the jurisdiction. Policy governance is a separate layer.

---

## How CerbaSeal Enforces This

When `ExecutionGateService.evaluate()` receives a `GovernedRequest`, the gate applies its invariant check sequence in order. The sequence is the runtime expression of the Execution Scope Policy:

| Gate phase | Invariant(s) applied | Scope policy rule enforced |
|-----------|---------------------|---------------------------|
| 1. Policy authorization | INV-01 | Policy pack must be present — ungoverned execution rejected |
| 2. Decision provenance | INV-02 | Decision origin must be traceable — anonymous proposals rejected |
| 3. Human authorization | INV-03 | Required human approval must be present, bound, and signed |
| 4. Audit readiness | INV-04 | Logging must be ready before execution proceeds |
| 5. AI authority boundary | INV-05 | AI actor cannot authorize its own proposal |
| 6. Gate integrity | INV-06 | Result must originate from this gate — forged artifacts rejected |
| 7. Decision record integrity | INV-07 | Decision envelope must be treated as immutable |
| 8. Control currency | INV-08 | Controls must be current for sensitive workflows |
| 9. Trust state | INV-09 | Trust state must be valid — absent trust blocks release |
| 10. Prohibited use | INV-10 | Prohibited classification triggers unconditional rejection |
| 11. Request integrity | INV-11 | Action class must be recognized — unknown classes rejected |
| 12. Proposal binding | INV-12 | Proposal action must match declared request action |

Every step must pass. A failure at any step produces HOLD or REJECT. The gate does not proceed past a failure and does not attempt to recover or compensate.

The full invariant check sequence is the Execution Scope Policy in executable form.

---

## Summary

CerbaSeal implements bounded autonomy by enforcing that:

1. AI systems remain within the **proposal role** — they may initiate but not authorize
2. Human authorization is **structurally required** for designated workflows — not optional, not bypassable
3. Actions outside the **permitted action set** are rejected before evaluation reaches policy
4. The **prohibited use envelope** applies unconditionally — no exception path exists
5. Every outcome — ALLOW, HOLD, or REJECT — produces a **verifiable, replayable evidence record**

The boundary is not a promise. It is code, enforced at execution time, covered by adversarial tests, and exportable as a verifiable proof snapshot.
