# Current Maturity and Known Gaps

## Purpose

This document states the current maturity of CerbaSeal honestly. The goal is reviewer trust, not commercial positioning.

---

## What is real

CerbaSeal is architecturally real. The enforcement primitives in this repository are based on proven portfolio patterns for governed decision control, fail-closed enforcement, and append-only audit logging. They are not mock implementations, stubs, or placeholder code.

The following are fully implemented and tested in this proof slice:

- single execution gate with complete invariant enforcement
- fail-closed behavior across all invalid input conditions
- append-only, hash-chained audit log
- evidence bundle generation from governed outcomes
- export manifest generation
- replay consistency verification
- diagnostic report generation with invariant-level tracing
- adversarial testing across bypass attempts, edge inputs, and audit chain integrity

Test coverage: 88 passing tests, including adversarial and hostile boundary probes.

---

## What this repository is

This is a minimal reviewable enforcement proof package. It exists to prove that CerbaSeal's enforcement claim is real, inspectable, and technically coherent — before client-specific implementation begins.

It is not a finished standalone deployable product.

---

## What requires client-specific implementation

The following are real constraints that depend on pilot engagement specifics:

**Workflow specifics**
CerbaSeal evaluates `GovernedRequest` objects. The logic that constructs those objects from a client's actual workflow events is not included. That integration is client-specific.

**Policy specifics**
The `policyPackRef` field is a required presence check in this proof slice. Actual policy pack content, policy resolution logic, and policy versioning are outside scope and require client-specific implementation.

**Deployment environment**
This proof slice runs as a Node.js TypeScript package. Production deployment — including infrastructure, persistence, secrets management, scaling, and monitoring — depends on the client's environment and is not defined here.

**Infrastructure constraints**
No assumptions about hosting topology, network architecture, database selection, or operational environment are baked into this proof slice. Those are deferred to deployment design.

---

## Known structural gaps in the proof slice

These are gaps the team is aware of and has documented openly:

**Gate invocation cannot be proven.**
The system cannot verify that `ExecutionGateService.evaluate()` was actually called for a given outcome. A trusted internal caller who bypasses the gate and constructs a forged result will not be detected by replay if the underlying request was valid. See `docs/09-trust-boundary-and-limitations.md`.

**Audit chain proves structural integrity, not origin.**
The hash-chain algorithm is public and unsalted. A fully fabricated audit chain with recomputed hashes will pass `verifyChain()`. Chain verification confirms internal consistency, not that the chain was produced by CerbaSeal itself.

**All IDs are deterministic.**
Identifiers derive directly from `requestId`. Two evaluations of the same `requestId` produce identical IDs. There is no nonce or timestamp component.

**Runtime objects are not frozen.**
The `immutable: true` field on `DecisionEnvelope` is a TypeScript type annotation, not a runtime enforcement mechanism. `Object.freeze()` is not called. Objects can be mutated between `evaluate()` and `createBundle()`.

---

## Production hardening is incomplete

The following are not yet implemented and are not claimed to be:

- cryptographic signing of decision envelopes
- HMAC-anchored audit chains
- persistent storage layer
- access control on the enforcement services
- rate limiting or abuse prevention
- external attestation of gate invocation
- production monitoring and alerting

---

## Summary

CerbaSeal is a real enforcement core, not a prototype narrative. Its current maturity is appropriate for security architecture review and controlled pilot scoping. It is not appropriate to evaluate it as a production deployment package at this stage.
