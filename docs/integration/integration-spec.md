# CerbaSeal Integration Specification (Domain-Agnostic)

## Purpose
Defines how external systems interact with CerbaSeal without requiring domain-specific logic.

---

## System Position

CerbaSeal sits between:

[ Upstream System ] → [ CerbaSeal ] → [ Execution System ]

Upstream:
- AI models
- Rule engines
- Human input systems

Downstream:
- Execution engines
- State mutation systems
- External APIs

---

## Invocation Model

### Function Call

evaluate(request: GovernedRequest) → GateResult

---

## Input Contract (Minimal Requirements)

Required fields:
- requestId
- workflowClass
- proposedActionClass
- proposal
- policyPackRef
- provenanceRef
- loggingReady
- trustState

Optional:
- approvalArtifact
- controlStatus

---

## Output Contract

GateResult contains:
- decisionEnvelope (always present)
- releaseAuthorization (ALLOW only)
- blockedActionRecord (REJECT/HOLD only)

---

## Execution Rules

System consuming CerbaSeal MUST:

IF result.finalState === "ALLOW":
  → execute permittedActionClass

IF result.finalState === "HOLD":
  → request human approval
  → re-submit request

IF result.finalState === "REJECT":
  → do not execute
  → store evidence bundle

---

## Idempotency Requirement

requestId MUST be unique per evaluation attempt.

---

## Failure Behavior

CerbaSeal guarantees:
- no unhandled exceptions
- always returns structured result OR throws CerbaSealError at boundary

---

## Integration Modes

1. Library (in-process)
2. Service (HTTP wrapper)
3. Sidecar (co-located enforcement)
4. Pipeline step (async evaluation)

---

## Local Demonstration Surfaces

CerbaSeal currently includes two local demonstration surfaces:

- terminal demo: `pnpm demo`
- browser demo: `pnpm demo:web`

Both are demonstration wrappers around the same enforcement model.

They are not production interfaces.

They are not authentication layers.

They are not persistence layers.

They are not policy engines.

Production integration should be implemented through an explicit client-controlled integration boundary.

The purpose of the demos is to show the enforcement states:

- REJECT
- HOLD
- ALLOW

---

## Non-Responsibilities

CerbaSeal does NOT:
- fetch data
- validate business logic
- interpret intent
- manage identities
- persist storage
