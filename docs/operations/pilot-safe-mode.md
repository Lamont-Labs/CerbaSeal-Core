# Pilot-Safe Mode

## Purpose

Pilot-safe mode is a constrained operating profile for evaluating CerbaSeal in a small controlled pilot.

It is designed to reduce support burden, prevent scope creep, and preserve safety.

## Principle

The pilot should constrain variability.

Constrained variability reduces operational support requirements.

## Pilot-Safe Constraints

Pilot-safe mode should use:

- one workflow class
- one or two action classes
- fixed approval requirements
- fixed request schema
- fixed evidence output
- no production execution
- no custom policy engine behavior
- no identity provider dependency
- no persistent storage dependency
- no client-specific code forks

## Runtime Behavior

In pilot-safe mode:

- invalid requests produce REJECT
- missing approval produces HOLD
- valid approved requests produce ALLOW
- every result produces evidence
- operator guidance is generated from reason codes
- system health checks can be run before demonstrations
- integrity verification can be run after demonstrations

## Support Model

Pilot-safe mode is designed so that:

- operators can see why a decision happened
- reviewers can inspect proof output
- repeated scenarios produce stable outcomes
- failures default to non-execution
- founder intervention is not required for routine interpretation

## What Pilot-Safe Mode Does Not Provide

Pilot-safe mode does not provide:

- production SLA
- production monitoring
- incident response team
- managed hosting
- cryptographic signing
- persistent evidence database
- legal compliance certification
- customer production deployment

## Recommended Use

Use pilot-safe mode for:

- controlled evaluations
- design partner walkthroughs
- technical review
- audit workflow mapping
- pre-production feasibility checks

Do not use pilot-safe mode for live customer-impacting production decisions.
