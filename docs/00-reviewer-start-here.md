# Reviewer Start Here

## Purpose of this repository

This repository is the **minimum reviewable enforcement package** for CerbaSeal.

Its purpose is to let a technical reviewer answer four questions:

1. Is CerbaSeal a real system architecture rather than a concept?
2. Where does enforcement actually occur?
3. What stops a consequential action from proceeding incorrectly?
4. What evidence exists after an action is allowed, held, or rejected?

## The shortest accurate description of CerbaSeal

CerbaSeal is a **structural enforcement layer for consequential AI-assisted workflows**.

It decides whether a proposed action:

- may proceed
- must pause for accountable human authority
- must fail closed

Its value is in runtime control and preserved evidence, not governance language alone.

## What to review first

Read these in order:

1. `docs/01-system-definition.md`
2. `docs/02-scope-boundary.md`
3. `docs/06-runtime-layer-stack.md`
4. `docs/07-invariant-model.md`
5. `docs/13-non-bypassability-model.md`
6. `docs/15-eu-deployment-posture.md`

Then inspect:

- `architecture/invariants/invariant-registry.yaml`
- `src/services/execution/execution-gate-service.ts`
- `src/services/audit/append-only-log-service.ts`
- `src/services/evidence/evidence-bundle-service.ts`
- `src/services/export/export-manifest-service.ts`
- `src/services/replay/replay-service.ts`

Then inspect tests:

- `test/execution-gate-service.test.ts`
- `test/audit-evidence-export.test.ts`

## What is in scope for this review package

This repository is intended to prove:

- runtime gating exists
- AI is non-authoritative
- approval requirements are structural
- fail-closed behavior is default
- blocked actions still leave evidence
- event history is append-only
- evidence bundles are exportable
- replay yields stable governed outcomes

## What is intentionally not in scope

This repository does not attempt to prove:

- client-specific implementation completeness
- integration readiness for a named customer
- full production infrastructure
- broad UI/product maturity
- legal compliance by itself

## Expected reviewer conclusion

The intended conclusion is:

CerbaSeal is architecturally real, narrowly scoped, enforcement-oriented, and reviewable before client-specific pilot implementation exists.

That is the correct conclusion for this phase.
