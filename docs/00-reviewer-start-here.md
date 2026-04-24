# Reviewer Start Here

## Recommended Review Path

Use this path for the fastest review:

1. Read the one-page overview: [docs/one-page.md](../one-page.md)
2. Run the live terminal demo: `pnpm demo`
3. Review the enforcement boundary: [docs/architecture/enforcement-boundary.md](../architecture/enforcement-boundary.md)
4. Review the browser demo: [docs/demo/browser-demo.md](demo/browser-demo.md)
5. Review the integration model: [docs/integration/integration-spec.md](../integration/integration-spec.md)
6. Run the full test suite: `pnpm test`

CerbaSeal-Core should be reviewed as a deterministic enforcement primitive.

It is not a dashboard.

It is not a policy platform.

It is not a monitoring layer.

It is not a domain-specific application.

The core question for review is:

> Does the system reliably prevent unauthorized execution and produce evidence for every outcome?

---

Before reviewing the system:

→ Read: [docs/architecture/enforcement-boundary.md](architecture/enforcement-boundary.md)

This defines what the system does and does not do.

---

## Start Here (Recommended)

If you are new to CerbaSeal, begin with:

→ `docs/demo/enforcement-loop.md`

This document shows the system's full enforcement loop (REJECT / HOLD / ALLOW) in a single, real-world scenario.

---

## Purpose

This repository is the **minimum reviewable enforcement package** for CerbaSeal.

Its purpose is to let a technical reviewer answer four questions:

1. Is CerbaSeal a real system architecture rather than a concept?
2. Where does enforcement actually occur?
3. What stops a consequential action from proceeding incorrectly?
4. What evidence exists after an action is allowed, held, or rejected?

---

## What CerbaSeal Is

CerbaSeal is a **structural enforcement layer for consequential AI-assisted workflows**.

It decides whether a proposed action:

- may proceed
- must pause for accountable human authority
- must fail closed

Its value is in runtime control and preserved evidence, not governance language alone.

---

## Recommended Review Order

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

---

## What Is In Scope

This repository is intended to prove:

- runtime gating exists
- AI is non-authoritative
- approval requirements are structural
- fail-closed behavior is default
- blocked actions still leave evidence
- event history is append-only
- evidence bundles are exportable
- replay yields stable governed outcomes

---

## What Is Intentionally Not In Scope

- client-specific implementation completeness
- integration readiness for a named customer
- full production infrastructure
- broad UI or product maturity
- legal compliance by itself

---

## Expected Reviewer Conclusion

CerbaSeal is architecturally real, narrowly scoped, enforcement-oriented, and reviewable before client-specific pilot implementation exists.

That is the correct conclusion for this phase.
