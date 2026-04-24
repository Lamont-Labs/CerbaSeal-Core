# CerbaSeal

CerbaSeal is an enforcement layer for high-risk AI actions.

It ensures:
- AI systems cannot authorize themselves
- Required approvals cannot be bypassed
- Every decision produces verifiable evidence

---

## Quick Review

Start here:

- One-page overview: [docs/one-page.md](docs/one-page.md)
- Enforcement boundary: [docs/architecture/enforcement-boundary.md](docs/architecture/enforcement-boundary.md)
- Live terminal demo: `pnpm demo`
- Browser demo: [docs/demo/browser-demo.md](docs/demo/browser-demo.md)
- Full test suite: `pnpm test`
- Integration spec: [docs/integration/integration-spec.md](docs/integration/integration-spec.md)
- Deployment modes: [docs/deployment/deployment-modes.md](docs/deployment/deployment-modes.md)

Current proof state:

- 195 / 195 tests passing
- REJECT / HOLD / ALLOW runtime demo
- fail-closed behavior
- non-forgery protection
- contextual boundary tests
- misuse scenario tests
- domain-agnostic reference workflow

CerbaSeal should be reviewed as a deterministic enforcement primitive.

It is not a dashboard, policy platform, monitoring layer, or domain-specific application.

---

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

See: [docs/architecture/enforcement-boundary.md](docs/architecture/enforcement-boundary.md)

## Integration

See:
- [docs/integration/integration-spec.md](docs/integration/integration-spec.md)
- [docs/integration/system-flow.md](docs/integration/system-flow.md)
- [docs/deployment/deployment-modes.md](docs/deployment/deployment-modes.md)

CerbaSeal is designed to be embedded as a deterministic enforcement layer.

## Repo Structure

/docs/ — documentation  
/src/ — core system  
/test/ — validation  
/examples/ — non-binding integration examples  

## Status

- 96 tests passing  
- Adversarial audit complete  
- Core enforcement loop validated  
