# CerbaSeal-Core

**Enforcement Review Repository**

This repository is a security-review-grade enforcement proof surface for CerbaSeal.

It is not the full CerbaSeal system. It exists to prove that CerbaSeal is a real, inspectable, bounded enforcement layer — not a concept deck or policy narrative.

---

## What CerbaSeal Is

CerbaSeal is a **structural enforcement layer** that sits inside consequential AI-assisted workflows and determines whether a proposed action:

- may proceed
- must be held for accountable human review
- must be rejected outright

CerbaSeal does not describe governance after the fact. It makes governance constraints operational at runtime.

---

## What CerbaSeal Is Not

- a policy platform
- a dashboard
- a general-purpose AI governance suite
- a legal certification engine
- a replacement for organizational governance responsibilities
- a standalone full customer implementation in this repository

---

## What Enforcement Claim This Proves

CerbaSeal proves the following claim:

> All consequential actions evaluated through the gate are subject to a complete invariant check set. Invalid, incomplete, or unauthorized requests cannot produce a release authorization. Outcomes are deterministic, auditable, and replayable.

This claim is inspectable. Every part of it is backed by runnable code and passing tests.

---

## Start Here for Reviewers

| Document | Purpose |
|---|---|
| `docs/trust_boundaries.md` | What is trusted, untrusted, and conditionally trusted |
| `docs/execution_boundary.md` | The single gate: what must be true before release |
| `docs/control_matrix.md` | Control → enforcement point → failure behavior → evidence |
| `specs/approval_artifact.md` | What counts as a valid approval in the proof slice |
| `docs/system_boundary.md` | What CerbaSeal does and does not do |
| `docs/current_maturity.md` | Honest assessment of maturity and known gaps |
| `docs/reconstructability.md` | How to inspect or reconstruct a governed decision |
| `docs/runtime_context.md` | Language, dependencies, and what is intentionally omitted |

---

## System Flow

```
Request → Execution Gate → Decision → Audit → Evidence → Export / Replay
```

There is no valid execution path outside this flow.

---

## The Single Proof Path

```
src/services/execution/execution-gate-service.ts
```

`ExecutionGateService.evaluate()` is the sole decision point. All invariant checks occur here. `ReleaseAuthorization` is issued only on full success. Every other outcome routes to a blocked decision record.

---

## Key Guarantees

- No policy → no execution
- No provenance → no action
- No approval → no release
- AI cannot authorize
- Stale controls block sensitive actions
- Invalid trust state blocks execution

Adversarially tested. 88 / 88 tests pass. No invariant violations. No incorrect execution outcomes.

---

## Failure Behavior

CerbaSeal is designed to fail closed under all invalid or incomplete conditions.

| Condition | Outcome |
|---|---|
| Missing approval | HOLD — no release issued |
| Missing provenance | REJECT — no execution allowed |
| Invalid trust state | REJECT — execution blocked |
| Prohibited use | REJECT — immediate rejection |
| Logging unavailable | REJECT — execution blocked |

All failure states produce governed artifacts: decision envelope, blocked action record, audit log entries. No failure condition degrades into silent execution.

---

## Trust Boundaries

Trust boundary definitions live in `docs/trust_boundaries.md`.

In brief:
- Inbound requests are untrusted until validated by the gate
- AI proposals are structurally untrusted and cannot satisfy approval requirements
- Approval artifacts are conditionally trusted only after passing all authority checks
- The audit log is trusted once entries are committed
- Evidence bundles are authoritative from the point of creation

Known structural limitations — including the inability to prove gate invocation, and the absence of cryptographic chain anchoring — are documented explicitly in `docs/09-trust-boundary-and-limitations.md` and `docs/current_maturity.md`.

---

## Implementation Inspection Path

**Documentation:**

1. `docs/00-reviewer-start-here.md`
2. `docs/trust_boundaries.md`
3. `docs/execution_boundary.md`
4. `docs/control_matrix.md`
5. `docs/07-invariant-model.md`
6. `architecture/invariants/invariant-registry.yaml`

**Core implementation:**

- `src/services/execution/execution-gate-service.ts` — single enforcement gate
- `src/services/audit/append-only-log-service.ts` — hash-chained audit log
- `src/services/evidence/evidence-bundle-service.ts` — evidence assembly
- `src/services/export/export-manifest-service.ts` — export manifest
- `src/services/replay/replay-service.ts` — replay consistency
- `src/services/diagnostics/diagnostic-report-service.ts` — diagnostic reports

**Tests:**

- `test/execution-gate-service.test.ts`
- `test/audit-evidence-export.test.ts`
- `test/adversarial-integrity.test.ts`
- `test/diagnostic-report-service.test.ts`

---

## What Remains Outside Scope Until Pilot

- client-specific workflow logic and request construction
- real customer policy packs and policy resolution
- integrations into client systems
- persistent storage layer
- identity provider integration
- production infrastructure and deployment hardening
- cryptographic signing of decision artifacts

These are not omitted by accident. They require client-specific implementation and are the subject of a paid pilot engagement.

---

## Running the Repository

```bash
pnpm install
pnpm test
```

No network access. No environment setup. No external services required.

---

## Core Guarantee

**CerbaSeal does not claim governance. It proves that governance became runtime behavior.**
