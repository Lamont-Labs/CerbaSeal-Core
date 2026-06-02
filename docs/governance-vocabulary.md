# CerbaSeal Governance Vocabulary

This document translates CerbaSeal's technical invariant language into enterprise governance semantics. The table below maps each invariant to its governance category, control obligation, and the consequence of failure. Use this as a reference when mapping CerbaSeal to regulatory frameworks, audit programs, or governance committee requirements.

---

## Invariant → Governance Mapping

| Invariant | Technical Name | Governance Category | Control Obligation | Failure Consequence |
|-----------|---------------|--------------------|--------------------|---------------------|
| INV-01 | no_policy_pack_no_execution | **Policy Gating** | Every consequential action must operate under an identified, versioned policy authority. Ungoverned execution is not permitted. | Action blocked. Accountability record created. No release issued. |
| INV-02 | no_provenance_no_action | **Provenance Assurance** | Every action must carry a complete, traceable reference to the decision source that produced it — including model version, rule set, and source hash. Actions without traceable origin are rejected. | Action blocked. Accountability record created. No release issued. |
| INV-03 | no_required_approval_no_release | **Human Authority Gate** | Where human authorization is required, it must be present, bound to the specific request, issued by an authorized authority class, and cryptographically affirmed. Missing, invalid, or misbound approvals block release. | Action held or rejected. Accountability record created. No release issued. |
| INV-04 | no_logging_no_execution | **Audit Readiness Obligation** | Consequential actions may not proceed unless the audit logging precondition is satisfied. Execution without audit capability is not permitted. | Action blocked. Accountability record created. No release issued. |
| INV-05 | ai_non_authoritative | **AI Authority Boundary** | AI systems are permitted to propose actions. They are prohibited from authorizing or approving their own proposals. Authority-bearing transitions require human authorization. | Action blocked. Accountability record created. No release issued. |
| INV-06 | no_bypass_of_execution_gate | **Gate Integrity** | All consequential actions must route through the governed enforcement gate. The gate cannot be bypassed by application code. Fabricated governance artifacts are rejected. | Forgery rejected. No bundle created. |
| INV-07 | immutable_decision_envelope | **Decision Record Integrity** | Governance decisions, once issued, must be treated as immutable governed artifacts. Post-decision mutation invalidates the governance record. | Artifact trust invalidated. |
| INV-08 | stale_controls_block_sensitive_release | **Control Currency Requirement** | For sensitive workflows, critical controls must be current and valid at the time of release. Stale or invalidated controls block execution. | Action blocked. Accountability record created. No release issued. |
| INV-09 | trust_state_required | **Trust Validation Gate** | Execution may not proceed without a valid, current trust state declaration. Trust state is a prerequisite for release, not an advisory signal. | Action blocked. Accountability record created. No release issued. |
| INV-10 | prohibited_use_must_block | **Prohibited Use Enforcement** | Requests classified as prohibited use must be rejected immediately. No exception path. No escalation path. | Immediate rejection. Accountability record created. No release issued. |
| INV-11 | request_schema_and_action_class_valid | **Input Integrity** | Malformed requests and unrecognized action classes fail closed. The system does not guess intent or apply defaults for unknown inputs. | Action blocked. Accountability record created. No release issued. |
| INV-12 | proposal_and_request_action_must_match | **Proposal Binding** | The action class declared in the governing request must exactly match the action class in the underlying proposal. Mismatches indicate tampered or misrouted requests and are rejected. | Action blocked. Accountability record created. No release issued. |

---

## Reason Code → Governance Meaning

| Reason Code | Governance Meaning |
|-------------|-------------------|
| `DECISION_ALLOWED` | All governance conditions satisfied. Release authorized. Evidence bundle produced. |
| `DECISION_HELD` | Required human authorization absent. Action suspended pending approval. |
| `DECISION_REJECTED` | Governance condition failed. Action blocked. No release issued. |
| `NO_POLICY_PACK` | No policy authority on record for this action. Ungoverned execution rejected. |
| `NO_PROVENANCE` | Decision origin is untraceable. Action rejected on provenance grounds. |
| `REQUIRED_APPROVAL_MISSING` | Human authorization required but not presented. |
| `INVALID_APPROVAL_AUTHORITY` | Approver does not hold the authority class required for this action. |
| `PRIVILEGED_AUTH_NOT_SATISFIED` | Privileged authorization flag not affirmed by the approval artifact. |
| `APPROVAL_SIGNATURE_MISSING` | Approval artifact is unsigned. Unsigned approvals are not binding. |
| `LOGGING_NOT_READY` | Audit logging precondition not met. Execution without audit is not permitted. |
| `AI_CANNOT_AUTHORIZE` | AI system attempted to authorize its own proposal. Authority boundary violated. |
| `PROHIBITED_USE` | Request classified as prohibited. Unconditional rejection. |
| `CONTROL_STALE_OR_INVALID` | Governing controls are not current. Release blocked for this sensitive workflow. |
| `TRUST_STATE_INVALID` | Trust state not valid. Release precondition not met. |
| `UNKNOWN_ACTION_CLASS` | Requested action is not a recognized governance category. Rejected. |
| `MALFORMED_REQUEST` | Request does not meet the minimum structural requirements for governance evaluation. Rejected. |
| `INVALID_PROPOSAL` | Action class in proposal does not match action class declared in governing request. Rejected. |

---

## Enforcement Properties → Governance Semantics

| Technical Property | Governance Meaning |
|-------------------|--------------------|
| **Deterministic enforcement** | Every request evaluated under identical conditions produces identical outcomes. No discretion. No variability. |
| **Replayability** | Every governance decision can be re-evaluated from its original request and will produce the same outcome. Decisions are auditable forward and backward. |
| **Evidence bundle** | A tamper-evident, immutable record of the request, the decision, the release or block, and the complete audit event chain. Produced for every outcome — ALLOW, HOLD, and REJECT. |
| **Append-only audit log** | Every governance event is recorded in a hash-linked chain. Deletion or reordering breaks the chain. The chain proves internal consistency of the event sequence. |
| **Hash-linked chain** | SHA-256 linkage across every audit event. Each entry includes the hash of the previous entry. A tampered or fabricated chain can be detected. |
| **stableChecksum** | A SHA-256 hash of all enforcement-state fields (test results, audit checks, invariant coverage, validator assertions) excluding timestamps. Stable across runs on an unchanged repo. Changes when enforcement state changes. Use to confirm no governance-relevant drift between two points in time. |
| **Fail-closed model** | Unexpected exceptions in the enforcement layer produce a governed REJECT outcome. The gate does not fail open. Unhandled errors are not possible in normal operation. |
| **Immutable decision envelope** | The governance decision artifact, once issued, carries an immutability declaration. Post-decision changes to the record are detectable as a trust violation. |
| **WeakSet gate integrity** | The enforcement gate registers every outcome it produces in a module-private registry. Governance artifacts produced outside the gate are rejected at the evidence layer. |
| **Bounded authority model** | AI systems occupy a clearly defined role: proposal only. Human authority classes occupy the authorization role. This boundary is enforced by the gate, not by convention. |

---

## Outcome States → Governance Semantics

| State | Governance Meaning |
|-------|--------------------|
| **ALLOW** | All governance conditions satisfied. Release authorization issued. Action may proceed. Full evidence bundle produced. |
| **HOLD** | Required authorization absent. Action suspended. No release authorization issued. Accountability record created. Resolution requires human authorization to be presented. |
| **REJECT** | Governance condition failed. Action permanently blocked for this request. No release authorization. Accountability record created. The request must be corrected and resubmitted. |

---

## What CerbaSeal Enforces vs. What It Does Not

This separation is critical for regulatory mapping. CerbaSeal enforces authority and process — not correctness, safety, or intent.

| Enforces | Does Not Enforce |
|----------|-----------------|
| Whether the required authority is present | Whether the action is the right one to take |
| Whether the request is structurally sound | Whether the reasoning is sufficient |
| Whether audit readiness is declared | Whether the approver was appropriately senior |
| Whether the action class is recognized | Whether harm could result from an allowed action |
| Whether prohibitions are applied | Whether policy content is appropriate for context |
| Whether AI systems stay within their authority role | Whether the AI's proposal was accurate or safe |

Contextual correctness — the judgment of whether an action is good — remains with human reviewers, domain-specific policy systems, and upstream decision logic.

`CerbaSeal enforces authority — not judgment.`
