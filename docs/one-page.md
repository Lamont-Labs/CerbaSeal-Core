# CerbaSeal — One Page

## What It Is

CerbaSeal is deterministic execution governance infrastructure.

It sits between decision-making systems and execution systems, enforcing an authorization boundary that ensures consequential actions cannot run unless they satisfy a complete invariant check set.

CerbaSeal enforces authority — not judgment.

---

## Problem

AI systems are moving from generating text to proposing and triggering actions.

Those actions may affect workflows, records, accounts, infrastructure, approvals, transactions, customer outcomes, or internal operations.

Most governance tools observe, log, summarize, or report after the fact.

CerbaSeal enforces the execution boundary before the action occurs.

---

## Solution

CerbaSeal evaluates every governed request before execution.

Every request produces exactly one outcome:

- **REJECT** — action refused outright because a hard invariant failed
- **HOLD** — action paused because required human approval is missing
- **ALLOW** — action authorized because all required conditions passed

Every outcome produces a verifiable, replayable evidence bundle.

Nothing is silently discarded.

---

## Core Enforcement Claims

CerbaSeal guarantees that:

- invalid requests cannot produce release authorization
- AI actors cannot authorize their own AI-sourced proposals
- required human approval cannot be bypassed
- approval artifacts must be bound to the request they approve
- forged gate results cannot enter the evidence layer
- unexpected runtime errors fail closed, producing a governed REJECT
- all outcomes are recorded with hash-linked evidence

---

## Governance Properties

**Invariant enforcement** — 12 hard invariants govern every execution path. Each is linked to its covering tests. None can be silently bypassed.

**Replayability** — every evidence bundle can be re-evaluated and will produce the same outcome. Outcomes are reproducible, not just logged.

**Proof exportability** — `pnpm export:proof` emits a sealed proof snapshot. The `stableChecksum` is a SHA-256 hash of enforcement-state fields stable across runs. Reviewers can compare it across time to detect governance drift.

**Self-auditing** — `pnpm audit:repo` runs 13 automated checks against the repo's own governance integrity: tests, type coverage, import boundaries, invariant linkage, and validator assertions.

**Fail-closed model** — unexpected runtime exceptions produce a controlled REJECT registered in the evidence layer. No exception propagates to the caller unhandled.

---

## Fastest Review Path

Run the browser demo:

```
pnpm demo:web
```

Then click:

- AI tries to act without authority → REJECT
- Human submits action without approval → HOLD
- Approved action → ALLOW

This shows the full enforcement loop visually in under one minute.

Or open the hosted demo directly: **https://cerbaseal.replit.app/**

---

## Verified State

Current enforcement state (stable across runs on this commit):

```
stableChecksum: 7695187faf66906d868c5c4764fd6068e7ddbe0b1f69933e47a85d67c0d08ec0
```

- 372 / 372 tests passing (15 test files)
- 13 / 13 audit checks passing
- 12 / 12 invariants covered and linked to tests
- Adversarial integrity audit complete
- Fail-closed behavior validated
- Non-forgery protection verified
- Import boundary violations: 0

---

## Enforcement Boundary

CerbaSeal does not determine whether a decision is correct.

It determines whether an action is authorized to execute.

Contextual correctness remains the responsibility of:

- human reviewers
- upstream decision systems
- domain-specific policy systems

A structurally valid and properly authorized request may be allowed even if the decision itself is contextually poor.

This is intentional. The boundary is explicit and tested.

CerbaSeal enforces authority — not judgment.

---

## Why Now

AI-assisted systems are increasingly capable of proposing, escalating, approving, or triggering actions.

High-risk environments need a runtime enforcement layer that separates:

- proposal
- approval
- execution
- evidence

CerbaSeal is built for that boundary.

---

## Support Readiness

CerbaSeal includes support-readiness utilities for controlled pilots:

- health check
- integrity verification
- operator action reports
- pilot-safe mode documentation

These reduce routine support burden by making the system self-explaining and self-verifying.

They do not replace production support, legal review, or deployment hardening.

---

## Vision

CerbaSeal can become a standard enforcement layer for high-risk AI-assisted actions across regulated, automated, and mission-critical systems.

Its role is simple:

> Before execution, prove the action is authorized.
