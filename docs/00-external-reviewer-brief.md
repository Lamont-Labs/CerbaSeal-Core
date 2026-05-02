# CerbaSeal — External Reviewer Brief

## What CerbaSeal Is

CerbaSeal is a deterministic execution enforcement spine for AI-assisted workflows.

It sits between a decision system (AI or rules engine) and an execution system (anything that acts).
Every proposed action passes through a deterministic gate and receives one of three verdicts:

- **ALLOW** — all required conditions pass; a release authorization is issued
- **HOLD** — request is structurally valid but required human approval is absent
- **REJECT** — a hard enforcement invariant failed; action is refused

Every outcome produces a hash-linked evidence trail. Nothing is silently discarded.

CerbaSeal enforces authority — not judgment. It does not determine whether an action is correct.
It determines whether the action is authorized to execute.

## What It Proves

CerbaSeal proves that:

- AI actors cannot authorize their own AI-sourced proposals (INV-05)
- Required human approval cannot be bypassed (INV-03)
- Approval artifacts must be bound to the exact request they approve
- Forged gate results cannot enter the evidence layer (INV-06, WeakSet)
- Unexpected runtime errors fail closed — no silent success
- All outcomes are recorded with hash-linked evidence
- Replay of stored evidence produces identical outcomes deterministically

All of these are backed by code and passing tests.

## What To Inspect First

1. `src/services/execution/execution-gate-service.ts` — the enforcement gate
2. `src/domain/constants/invariants.ts` — 12 named invariant codes
3. `src/domain/constants/reason-codes.ts` — 17 named reason codes
4. `test/security/` — fail-closed, non-forgery, misuse, contextual boundary tests
5. `test/adversarial-integrity.test.ts` — 66 adversarial tests
6. `architecture/invariants/invariant-registry.yaml` — machine-readable invariant definitions

## How To Run Tests

```
pnpm test
```

Expected: 323 / 323 passing, 0 failing (15 test files).

## How To Run The Demo

Browser demo (local):
```
pnpm demo:web
```
Then open http://localhost:3001

Browser demo (hosted):
https://cerbaseal.replit.app/

Portal pages:
- /review — reviewer portal
- /pilot — pilot readiness
- /security — security review surface
- /deployment — deployment posture

Terminal demo:
```
pnpm demo
```

Support readiness validation:
```
pnpm demo:support:validate
```

## What Is Out Of Scope

The following are out of scope for this review package:

- client-specific implementation completeness
- integration readiness for a named client
- full production infrastructure
- persistent storage
- cryptographic signing of decision artifacts
- identity provider integration
- formal legal or regulatory compliance certification
- third-party security review (not yet completed)

## Current Maturity

**Currently implemented:**
- deterministic execution gate
- ALLOW / HOLD / REJECT outcomes
- 12 named invariant checks
- evidence bundle service
- append-only hash-linked audit log
- replay service
- export manifest
- diagnostic report service
- operator action guidance
- system health and integrity verification
- browser demo (live at https://cerbaseal.replit.app/)
- 323 passing tests (15 test files)
- external reviewer / pilot readiness portal (`/review`, `/pilot`, `/security`, `/deployment`)

**Not yet implemented / requires pilot:**
- client-specific workflow binding
- client deployment infrastructure
- third-party security review
- production monitoring
- persistent audit storage
- cryptographic signing
- identity provider integration
- formal SLA

## Current Limitation Notice

This is a review-ready core demo, not a production client deployment.
No client has been deployed. No production decisions are being made through this system.
