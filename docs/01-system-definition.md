# System Definition

## CerbaSeal in one sentence

CerbaSeal is a structural enforcement layer that sits inside consequential AI-assisted workflows and determines whether a proposed action may proceed, must be held for human review, or must be rejected outright.

## Core framing

CerbaSeal should be understood as:

- enforcement infrastructure
- runtime control surface
- evidence-producing governance layer

CerbaSeal should not be understood as:

- descriptive governance
- policy narrative
- dashboard-based oversight
- post-hoc reporting only

## Core operating principle

CerbaSeal does not ask reviewers to trust claims like:

- “the model behaved correctly”
- “human oversight exists”
- “the system is compliant”

Instead, CerbaSeal is designed so that governed transitions leave behind evidence that can later answer:

- what happened
- what logic or source influenced the action
- what checks passed or failed
- whether human authority was required
- whether human authority was present
- what final action was allowed, held, or rejected

## Three non-negotiable enforcement requirements

CerbaSeal is built around three foundational requirements:

### 1. Fail-closed default behavior

If a request is incomplete, unverifiable, malformed, unapproved, or operationally ambiguous, the system rejects or holds the action rather than allowing degraded execution.

### 2. Structural authority separation

AI may classify, score, summarize, or propose.

AI may not:

- approve
- sign
- lock
- release
- override
- bypass consequential execution paths

### 3. Cryptographic decision provenance

Every governed transition should produce a tamper-evident record showing:

- what entered the system
- what source logic or model reference applied
- what authority state existed
- what checks passed or failed
- what final action was permitted or blocked

## Current maturity position

CerbaSeal is:

- architecturally real
- assembly-defined
- built from existing Lamont Labs enforcement primitives

CerbaSeal is not yet:

- a fully packaged standalone deployable product
- a client-specific production implementation
- a broad commercial product surface

That distinction matters and should be preserved in all review discussions.
