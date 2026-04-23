# CerbaSeal

CerbaSeal is an enforcement layer for high-risk AI actions.

It ensures:
- AI systems cannot authorize themselves
- Required approvals cannot be bypassed
- Every decision produces verifiable evidence

## Start Here

→ [docs/demo/enforcement-loop.md](docs/demo/enforcement-loop.md)

## What It Does

CerbaSeal sits between AI systems and execution layers and determines whether an action is:
- REJECTED (invalid authority)
- HELD (missing required conditions)
- ALLOWED (fully authorized)

CerbaSeal is domain-agnostic.  
The included demo uses a fintech-style workflow as a reference example, but the enforcement model applies to any high-risk action system.

## Why It Matters

Most AI systems rely on policy.

CerbaSeal enforces it.

CerbaSeal ensures that only properly authorized actions execute.  
It does not determine whether an action is the correct one to take.

## Repo Structure

/docs/ — documentation  
/src/ — core system  
/test/ — validation  

## Status

- 96 tests passing  
- Adversarial audit complete  
- Core enforcement loop validated  
