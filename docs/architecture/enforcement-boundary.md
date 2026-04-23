# Enforcement Boundary

CerbaSeal enforces structural validity and authorization requirements
for high-risk actions at runtime.

It guarantees that:
- all required invariants are satisfied before execution
- no action is executed without proper authority
- all outcomes are recorded as immutable evidence

CerbaSeal does NOT evaluate:
- whether an action is correct
- whether reasoning is sufficient or justified
- whether the outcome is desirable
- whether an action is safe in a domain-specific sense

## Responsibility Separation

| Layer | Responsibility |
|------|--------|
| Decision Systems (AI / Humans) | Determine what action should be taken |
| CerbaSeal | Determine whether the action is authorized to execute |
| Execution Systems | Perform the action |

## Implication

A structurally valid and properly authorized request will be allowed,
even if the decision is contextually incorrect.

Contextual correctness must be enforced by:
- human reviewers
- domain-specific policy systems
- upstream decision logic

CerbaSeal enforces authority — not judgment.
