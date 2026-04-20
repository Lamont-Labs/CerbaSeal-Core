# CerbaSeal — Deployment Model

## Purpose

This document defines how CerbaSeal is deployed, where it runs, how it integrates into client systems, and what data and operational boundaries exist.

It is intended for security reviewers, infrastructure teams, and procurement stakeholders evaluating CerbaSeal for pilot deployment.

---

## 1. System Positioning

CerbaSeal is not a hosted platform or SaaS product.

CerbaSeal is a **deterministic enforcement layer** that is deployed **inside a client-controlled environment** and inserted into specific decision points within existing workflows.

It does not replace systems.  
It does not own data.  
It does not operate independently of the client environment.

It enforces whether a proposed action:
- may proceed
- must be held for review
- must be rejected

---

## 2. Deployment Topology

CerbaSeal runs within the client's infrastructure boundary.

### Supported deployment models

**A. In-process (preferred)**
- Embedded directly into the client backend service
- Runs alongside existing application logic

**B. Internal service**
- Deployed as a separate service within the client's VPC
- Invoked via internal API calls

### Hosting environment

CerbaSeal can run in:
- client-managed infrastructure
- EU-hosted cloud environments (e.g., AWS EU region, Azure EU region)
- isolated internal networks

CerbaSeal does not require:
- Lamont Labs hosting
- external service dependencies
- outbound network access

---

## 3. Data Flow and Boundaries

### Default behavior

All processing occurs **within the client environment**.

CerbaSeal:
- evaluates structured requests locally
- produces decisions locally
- generates audit and evidence artifacts locally

No client data is required to leave the environment.

---

### External data transfer

CerbaSeal does not transmit data externally by default.

Optional data transfer may occur only if the client chooses to export:
- diagnostic reports
- evidence bundles

These exports are:
- explicit
- client-controlled
- not required for system operation

---

### Data ownership

- All request data remains with the client
- All audit logs remain with the client
- All evidence artifacts remain with the client

Lamont Labs does not require access to client data for system operation.

---

## 4. Integration Model

CerbaSeal integrates at **decision boundaries**, not system boundaries.

### Pattern

Before execution:

1. System constructs a `GovernedRequest`
2. Request is passed to `ExecutionGateService`
3. CerbaSeal returns:
   - ALLOW (with ReleaseAuthorization)
   - HOLD
   - REJECT

4. System proceeds based on result

---

### Key property

CerbaSeal wraps existing actions.

It does not:
- orchestrate workflows
- manage business logic
- replace existing services

It enforces whether an action is permitted to execute.

---

## 5. Execution and Failure Behavior

CerbaSeal is **fail-closed**.

If any required condition is not met:
- execution is blocked
- a structured decision is returned
- the outcome is recorded

---

### Failure modes

- Missing policy → REJECT
- Missing provenance → REJECT
- Missing approval (when required) → HOLD
- Invalid trust state → REJECT
- Logging not ready → REJECT

No failure condition results in silent execution.

---

## 6. Audit and Evidence Model

Every evaluated request produces:

- a DecisionEnvelope
- audit log entries (append-only)
- an EvidenceBundle

### Properties

- append-only audit chain
- hash-linked entries
- replayable decision verification
- deterministic outputs

All artifacts are generated and stored within the client environment.

---

## 7. Replay and Verification

CerbaSeal includes a replay mechanism that:

- re-evaluates the original request
- compares outcomes against recorded decisions
- confirms consistency

This enables:

- independent verification
- audit reproducibility
- regulator-facing evidence

Replay does not require access to Lamont Labs systems.

---

## 8. Diagnostic and Support Model

CerbaSeal includes a structured diagnostic layer.

When issues occur, a `DiagnosticReport` can be generated containing:

- summary of outcome
- invariant evaluation results
- decision path
- audit summary
- replay verification result
- recommended next action

---

### Support flow

1. Client generates diagnostic report
2. Client shares report (optional)
3. Issue is analyzed deterministically

Support does not require:
- direct system access
- live debugging
- log extraction sessions

---

## 9. Trust Boundary

CerbaSeal assumes:

- the calling system is trusted
- request data is validly constructed upstream
- identity and authorization are handled externally

CerbaSeal does not:
- enforce identity systems
- provide runtime attestation
- verify caller authenticity

Its responsibility begins at the evaluation of the governed request.

---

## 10. Sovereignty and EU Deployment Position

CerbaSeal is **sovereignty-compatible by design**.

Because:
- it runs inside client-controlled infrastructure
- it does not require external data processing
- it does not depend on US-hosted services
- it produces verifiable artifacts that remain with the client

A deployment model can be established where:
- all data remains within EU-hosted environments
- all execution occurs within EU-controlled systems
- no data is transmitted to Lamont Labs infrastructure

---

## 11. Operational Scope

This repository demonstrates:
- enforcement logic
- audit and evidence generation
- replay verification
- diagnostic reporting

Out of scope for this deployment model:
- client-specific workflow configuration
- production infrastructure hardening
- identity integration
- policy authoring systems

These are addressed during pilot scoping and implementation.

---

## 12. Summary

CerbaSeal is deployed as a **local enforcement component** that:

- runs inside client-controlled infrastructure
- does not require external data processing
- integrates at decision points
- produces verifiable audit artifacts
- fails closed under all invalid conditions

This enables controlled pilot deployment without introducing:
- data sovereignty risk
- SaaS dependency
- opaque decision-making behavior
