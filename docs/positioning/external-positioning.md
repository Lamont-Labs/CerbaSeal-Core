# CerbaSeal External Positioning

## One-Sentence Description

CerbaSeal is a deterministic enforcement layer that prevents high-risk AI-assisted actions from executing unless they are authorized.

## Ten-Second Version

AI systems can propose actions.

CerbaSeal decides whether those actions are authorized to execute.

Every outcome is recorded as evidence.

## What CerbaSeal Is

CerbaSeal is:

- an enforcement gate
- an authorization boundary
- a runtime control layer
- an evidence generator
- a fail-closed decision primitive

## What CerbaSeal Is Not

CerbaSeal is not:

- a dashboard
- a chatbot
- a policy-writing tool
- a model evaluator
- a risk scoring system
- a replacement for human judgment
- a production identity system
- a persistence layer

## Core Claim

Before execution, CerbaSeal answers one question:

Is this action authorized to execute?

## Why It Matters

AI systems are increasingly connected to tools, workflows, and execution systems.

If AI can trigger actions, organizations need a deterministic layer that separates:

- proposal
- approval
- authorization
- execution
- evidence

CerbaSeal is built for that separation.

## Governance Vocabulary

CerbaSeal uses precise technical language internally. Enterprise governance reviewers can map that language to familiar control semantics:

| Technical term | Governance meaning |
|---------------|-------------------|
| Invariant violation | Control failure / policy breach |
| REJECT outcome | Unauthorized execution blocked |
| HOLD outcome | Execution suspended pending approval |
| ALLOW outcome | Authorized execution released |
| Evidence bundle | Accountability record / governance artifact |
| Hash-linked audit log | Tamper-evident audit trail |
| stableChecksum | Governance state attestation |
| Fail-closed on exception | Safe failure mode / default-deny execution |
| AI authority boundary (INV-05) | AI may propose — AI may not authorize |
| Forged GateResult rejected | Tamper attempt detected and blocked |

Full translation reference: [docs/governance-vocabulary.md](../governance-vocabulary.md)

---

## Proof Points

Current proof points:

- live REJECT / HOLD / ALLOW demo
- browser demo
- 431 passing tests (17 test files)
- 15 / 15 audit checks passing
- 12 / 12 invariants covered and linked to tests
- adversarial misuse testing
- non-forgery protection
- fail-closed behavior
- contextual boundary testing
- governance state attestation (stableChecksum)
- integration and deployment documentation

## Best First Use Cases

CerbaSeal is best suited for workflows where:

- actions are consequential
- approval matters
- evidence matters
- execution can be gated
- unauthorized execution creates risk

Examples remain generic:

- account action
- transaction action
- access control action
- escalation action
- infrastructure action
- workflow state change

## Boundary Statement

CerbaSeal enforces authority, not judgment.

It does not decide whether the action is correct.

It decides whether the action is authorized to execute.
