# CerbaSeal External Positioning

## One-Sentence Description

CerbaSeal is a deterministic enforcement layer that prevents high-risk AI-assisted actions from executing unless they are authorized.

## Ten-Second Version

AI systems can propose actions.

CerbaSeal decides whether those actions are authorized to execute.

Every outcome is recorded as evidence.

## What CerbaSeal Is

CerbaSeal is:

- an enforcement gate
- an authorization boundary
- a runtime control layer
- an evidence generator
- a fail-closed decision primitive

## What CerbaSeal Is Not

CerbaSeal is not:

- a dashboard
- a chatbot
- a policy-writing tool
- a model evaluator
- a risk scoring system
- a replacement for human judgment
- a production identity system
- a persistence layer

## Core Claim

Before execution, CerbaSeal answers one question:

Is this action authorized to execute?

## Why It Matters

AI systems are increasingly connected to tools, workflows, and execution systems.

If AI can trigger actions, organizations need a deterministic layer that separates:

- proposal
- approval
- authorization
- execution
- evidence

CerbaSeal is built for that separation.

## Proof Points

Current proof points:

- live REJECT / HOLD / ALLOW demo
- browser demo
- 202 passing tests
- adversarial misuse testing
- non-forgery protection
- fail-closed behavior
- contextual boundary testing
- integration and deployment documentation

## Best First Use Cases

CerbaSeal is best suited for workflows where:

- actions are consequential
- approval matters
- evidence matters
- execution can be gated
- unauthorized execution creates risk

Examples remain generic:

- account action
- transaction action
- access control action
- escalation action
- infrastructure action
- workflow state change

## Boundary Statement

CerbaSeal enforces authority, not judgment.

It does not decide whether the action is correct.

It decides whether the action is authorized to execute.
