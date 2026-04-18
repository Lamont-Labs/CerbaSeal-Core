# Scope Boundary

## What CerbaSeal Is in This Repository

This repository presents CerbaSeal as a **reviewable enforcement proof surface**.

It is intended to prove that:

- the architecture is real
- the enforcement boundary is explicit
- AI is not authority
- consequential transitions are governed
- evidence survives both allow and block outcomes

## What this repository does include

Current in-scope artifacts:

- runtime execution gate
- invariant enforcement logic
- decision envelope model
- blocked action model
- append-only audit chain
- evidence bundle model
- export manifest model
- replay behavior
- tests for failure and release conditions
- reviewer-facing documentation

## What this repository does not include

Out of scope for this phase:

- client-specific workflow bindings
- production integrations into customer systems
- full customer policy packs
- multi-workflow configuration surface
- broad administrative UI
- deployment automation
- legal compliance guarantee
- generalized full product behavior

## Why this boundary exists

The current requirement is not to build the full CerbaSeal system before payment and pilot scope exist.

The current requirement is to provide a reviewable surface that allows a technical reviewer to validate whether CerbaSeal’s enforcement architecture is real, coherent, and worth piloting.

## What must wait for paid pilot

The following belong inside pilot scope, not pre-pilot unpaid work:

- actual customer workflows
- real source systems
- real policy encoding for named organizations
- real hosting topology for a named client
- real data-processing boundaries for a named environment
- real operational procedures for a named deployment

## Review-safe claim boundary

The cleanest current claim is:

CerbaSeal is a narrow, enforcement-oriented governance layer whose architectural core can be formalized, inspected, and tested before client-specific deployment exists.
