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

## System Flow

```
Request → Execution Gate → Decision → Audit → Evidence → Export / Replay
```

There is no valid execution path outside this flow.

---

## Core Concept

All actions must pass through a single execution gate.

If any invariant fails:

- execution is blocked
- the decision is recorded
- no release is issued

---

## Key Guarantees

- No policy → no execution
- No provenance → no action
- No approval → no release
- AI cannot authorize
- Stale controls block sensitive actions
- Invalid trust state blocks execution

This enforcement layer has been adversarially tested against invariant violations, bypass attempts, and edge-case inputs with zero incorrect execution outcomes.

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

All failure states still produce governed artifacts:

- decision envelope
- blocked action record
- audit log entries

No failure condition degrades into silent execution.

---

## Review Path

**Start with the documentation:**

1. `docs/00-reviewer-start-here.md`
2. `docs/01-system-definition.md`
3. `docs/06-runtime-layer-stack.md`
4. `docs/07-invariant-model.md`
5. `docs/13-non-bypassability-model.md`
6. `architecture/invariants/invariant-registry.yaml`

**Then inspect the implementation:**

- `src/services/execution/execution-gate-service.ts` — single enforcement gate
- `src/services/audit/append-only-log-service.ts` — hash-chained audit log
- `src/services/evidence/evidence-bundle-service.ts` — evidence assembly
- `src/services/export/export-manifest-service.ts` — export manifest
- `src/services/replay/replay-service.ts` — replay consistency

**Then inspect the tests:**

- `test/execution-gate-service.test.ts`
- `test/audit-evidence-export.test.ts`
- `test/adversarial-integrity.test.ts`

---

## Scope Boundary

### What is implemented

- execution gate with full invariant enforcement
- approval boundary enforcement
- blocked-action and release-authorization semantics
- append-only audit log chain with hash verification
- evidence bundle generation
- export manifest generation
- replay consistency checks

### What is out of scope for this review package

- client-specific workflow logic
- real customer policy packs
- integrations into client systems
- multi-workflow productization
- production infrastructure mapping
- full deployment hardening

---

## Adversarial Validation

This enforcement layer has been independently tested under adversarial conditions covering invariant violations, bypass attempts, audit-chain integrity, replay consistency, and edge-case inputs.

- `docs/06-adversarial-validation-summary.md` — summary of testing scope and findings
- `docs/reports/adversarial/cerbaseal-core-adversarial-integrity-2026-04-18.md` — full report

**Result:** 83 / 83 tests passed. No invariant violations. No incorrect execution outcomes.

---

## Running the Repository

```bash
npm install
npm test
```

---

## Core Guarantee

**CerbaSeal does not claim governance. It proves that governance became runtime behavior.**
