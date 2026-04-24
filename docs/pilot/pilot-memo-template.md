# CerbaSeal Pilot Memo Template

## Purpose

This memo defines a narrow, controlled pilot for evaluating CerbaSeal as a runtime enforcement layer for high-risk AI-assisted actions.

The pilot is designed to test whether CerbaSeal can enforce authorization boundaries and produce evidence for every decision outcome.

## Pilot Principle

The pilot should evaluate one workflow, one action boundary, and one approval model.

The goal is not production deployment.

The goal is to determine whether the enforcement model is useful, inspectable, and operationally compatible with the target environment.

## Scope

In scope:

- one high-risk workflow
- one or two action classes
- one approval path
- one evidence output format
- controlled test or sandbox environment
- REJECT / HOLD / ALLOW evaluation

Out of scope:

- production deployment
- live customer-impacting decisions
- cryptographic signing guarantees
- identity provider integration
- persistent audit database
- full policy engine behavior
- contextual correctness evaluation
- broad workflow automation

## Required Inputs

The pilot requires:

1. Workflow description
2. Trigger event
3. Proposed action classes
4. Actor roles
5. Approval requirements
6. Existing decision system or simulated decision source
7. Execution boundary to be protected
8. Evidence requirements
9. Deployment constraints
10. Success criteria

## CerbaSeal Deliverables

CerbaSeal will provide:

- governed request structure
- enforcement evaluation
- REJECT / HOLD / ALLOW outcomes
- reason codes
- decision envelope
- release authorization when allowed
- blocked action record when rejected or held
- evidence bundle output where applicable
- pilot summary report

## Success Criteria

A pilot is successful if:

- unauthorized actions are blocked
- missing approvals produce HOLD
- valid approved actions produce ALLOW
- evidence is produced for every outcome
- reviewers can understand why each decision occurred
- integration requirements are clear after pilot completion

## Enforcement Boundary

CerbaSeal enforces authority, not judgment.

It does not decide whether an action is correct.

It decides whether an action is authorized to execute.

## Suggested Pilot Timeline

Week 1:
- workflow selection
- input mapping
- success criteria definition

Week 2:
- request mapping
- scenario construction
- controlled evaluation

Week 3:
- evidence review
- gap analysis
- integration findings

Week 4:
- pilot report
- go / no-go recommendation for next phase

## Open Questions

- What system generates the proposed action?
- What action is being protected?
- Who can approve the action?
- What evidence must be retained?
- Where would CerbaSeal sit in the workflow?
- What data cannot leave the environment?
- What would make the pilot valuable to stakeholders?

## Next-Step Decision

At the end of the pilot, the reviewer should decide:

- proceed to deeper technical integration
- revise scope and retest
- stop due to poor fit
