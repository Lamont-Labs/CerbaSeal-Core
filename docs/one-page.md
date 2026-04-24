# CerbaSeal-Core — One Page

## What It Is

CerbaSeal-Core is a deterministic enforcement gate for AI-assisted systems.

It sits between decision-making systems and execution systems, ensuring that consequential actions cannot execute unless they satisfy a complete invariant check set.

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

- **REJECT** — action refused outright because a hard requirement failed
- **HOLD** — action paused because required human approval is missing
- **ALLOW** — action authorized because all required conditions passed

Every outcome produces evidence.

Nothing is silently discarded.

---

## Core Enforcement Claims

CerbaSeal guarantees that:

- invalid requests cannot produce release authorization
- AI actors cannot authorize their own AI-sourced proposals
- required human approval cannot be bypassed
- approval artifacts must be bound to the request they approve
- forged gate results cannot enter the evidence layer
- unexpected runtime errors fail closed
- all outcomes are recorded with hash-linked evidence

---

## Fastest Review Path

Run the browser demo:

```
pnpm demo:web
```

Then click:

- AI tries to act without authority
- Human submits action without approval
- Approved action

This shows the full enforcement loop visually in under one minute.

---

## What The Demo Shows

The live demo proves the full enforcement loop:

- **REJECT** — AI self-authorization is blocked
- **HOLD** — missing approval pauses execution
- **ALLOW** — valid approval produces release authorization

Run:

```
pnpm demo
```

Expected output:

```
REJECT — AI self-authorization blocked
HOLD — missing approval paused
ALLOW — valid approved request released
```

---

## Current Proof

Current proof package:

- 195 / 195 passing tests
- adversarial integrity tests
- misuse scenario tests
- contextual boundary tests
- fail-closed tests
- non-forgery tests
- full REJECT / HOLD / ALLOW runtime demo
- documented enforcement boundary
- domain-agnostic reference workflow
- integration documentation
- deployment mode documentation

---

## Enforcement Boundary

CerbaSeal does not determine whether a decision is correct.

It determines whether an action is authorized to execute.

Contextual correctness remains the responsibility of:

- human reviewers
- upstream decision systems
- domain-specific policy systems

A structurally valid and properly authorized request may be allowed even if the decision itself is contextually poor.

This is intentional.

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

## Vision

CerbaSeal can become a standard enforcement layer for high-risk AI-assisted actions across regulated, automated, and mission-critical systems.

Its role is simple:

> Before execution, prove the action is authorized.
