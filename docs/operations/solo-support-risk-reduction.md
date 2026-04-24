# Solo-Support Risk Reduction Model

## Purpose

This document explains how CerbaSeal reduces dependence on a single operator during a controlled pilot.

CerbaSeal cannot remove all organizational, legal, or integration risk.

It can reduce operational support risk by being:

- deterministic
- fail-closed
- self-explaining
- self-verifying
- bounded in scope
- inspectable without founder involvement

## Core Support Principle

CerbaSeal should not require constant human intervention to remain safe.

If the system cannot authorize an action, it should return REJECT or HOLD with evidence and diagnostics.

The safe failure mode is non-execution.

## What The System Already Provides

CerbaSeal already provides:

- deterministic ALLOW / HOLD / REJECT outcomes
- fail-closed runtime behavior
- reason codes
- invariant traces
- evidence bundles
- hash-linked audit chains
- replay validation
- diagnostic reports
- browser demo
- consumer example
- agent-gate example
- auditor-readable certificate output

## Remaining Support Concern

A pilot reviewer may still ask:

- How do we know the system is healthy?
- How do we know the evidence chain is valid?
- How do we know replay still matches original outcomes?
- How does an operator know what to do after REJECT or HOLD?
- What pilot mode prevents open-ended customization?

This document defines the supportability layer added around CerbaSeal to answer those questions.

## Supportability Additions

CerbaSeal adds four support surfaces:

1. Health Check
   - confirms core local runtime checks pass

2. Integrity Verification
   - verifies demo scenario outputs, replay consistency, evidence chain shape, and expected result states

3. Operator Action Mapping
   - converts reason codes into recommended next actions

4. Pilot-Safe Mode Profile
   - documents a constrained operating profile for small pilots

## What This Does Not Solve

This does not provide:

- production SLA
- insurance
- legal liability coverage
- identity provider integration
- persistent audit database
- cryptographic signing
- managed hosting
- 24/7 support

Those require organizational and infrastructure decisions outside the current core.

## Pilot-Safe Operating Principle

Pilot-safe mode means:

- fixed workflow scope
- fixed action classes
- no custom logic per client
- local or controlled environment only
- no production decision impact
- fail-closed behavior preserved
- evidence generated for every evaluation
- operator guidance generated from reason codes

## Support Claim

CerbaSeal can support a controlled pilot because the system is designed to fail safely, explain outcomes, and provide deterministic verification artifacts without requiring continuous founder intervention.
