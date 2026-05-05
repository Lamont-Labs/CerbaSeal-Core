# CerbaSeal

CerbaSeal is an enforcement layer for high-risk AI actions.

Most AI systems rely on policy. CerbaSeal enforces it.

It ensures:
- AI systems cannot authorize themselves
- Required approvals cannot be bypassed
- Every decision produces verifiable evidence

Current proof state:

- 372 / 372 tests passing (15 test files)
- Adversarial audit complete
- Fail-closed behavior validated
- REJECT / HOLD / ALLOW runtime demo
- Non-forgery protection
- Misuse + boundary condition tests

Designed for rapid external review — demo, proof, and audit path available without setup.

---

## Hosted Demo

Live demo (Replit-hosted):

**https://cerbaseal.replit.app/**

Fastest review path:

1. Open the hosted demo.
2. Click "Run blocked AI action."
3. Click "Run missing-approval action."
4. Click "Run approved action."
5. Open "View enforcement proof."

The hosted demo is intentionally scoped as a demonstration surface.

It is not a production API, authentication layer, persistence layer, policy engine, customer validation system, or production deployment.

---

## Quick Review

Start here:

- One-page overview: [docs/one-page.md](docs/one-page.md)
- Enforcement boundary: [docs/architecture/enforcement-boundary.md](docs/architecture/enforcement-boundary.md)
- Browser demo: `pnpm demo:web` → [docs/demo/browser-demo.md](docs/demo/browser-demo.md)
- Terminal demo: `pnpm demo`
- Consumer example: `pnpm demo:consumer`
- Agent-gate demo: `pnpm demo:agent`
- Auditor view: `pnpm demo:audit`
- Full test suite: `pnpm test`
- Integration spec: [docs/integration/integration-spec.md](docs/integration/integration-spec.md)
- Deployment modes: [docs/deployment/deployment-modes.md](docs/deployment/deployment-modes.md)

For the fastest review, open the hosted demo or run `pnpm demo:web` locally.

CerbaSeal should be reviewed as a deterministic enforcement primitive.

It is not a dashboard, policy platform, monitoring layer, or domain-specific application.

---

## Support Readiness

CerbaSeal includes support-readiness utilities intended to reduce pilot support burden.

They provide:

- local health check
- integrity verification
- operator action reports
- pilot-safe mode documentation

Run:

```
pnpm demo:support
pnpm demo:support:validate
```

These utilities do not provide production monitoring, SLA, managed hosting, or legal certification.

---

## External Review Artifacts

These artifacts are designed to show how CerbaSeal can be reviewed, demonstrated, and mapped to external workflows without introducing client-specific assumptions.

- One-page overview: [docs/one-page.md](docs/one-page.md)
- External positioning: [docs/positioning/external-positioning.md](docs/positioning/external-positioning.md)
- Pilot memo template: [docs/pilot/pilot-memo-template.md](docs/pilot/pilot-memo-template.md)
- Pilot intake checklist: [docs/pilot/pilot-intake-checklist.md](docs/pilot/pilot-intake-checklist.md)
- Consumer example: [examples/consumer-example/](examples/consumer-example/)
- Agent-gate demo: [examples/agent-gate/](examples/agent-gate/)
- Auditor view: [examples/auditor-view/](examples/auditor-view/)
- Browser demo: [examples/browser-demo/](examples/browser-demo/)

---

## Start Here

→ [docs/demo/enforcement-loop.md](docs/demo/enforcement-loop.md)

## What It Does

CerbaSeal sits between AI systems and execution layers and determines whether an action is:
- REJECTED (invalid authority)
- HELD (missing required conditions)
- ALLOWED (fully authorized)

CerbaSeal is domain-agnostic.  
The included demo uses a regulated-system reference workflow as an example, but the enforcement model applies to any high-risk action system.

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

- 372 / 372 tests passing (15 test files)
- Adversarial audit complete
- Core enforcement loop validated
- External Reviewer & Pilot Readiness Portal live (`pnpm demo:web` → `/review`, `/pilot`, `/security`, `/deployment`)
- Brand system: CerbaSeal mark integrated across all portal pages (`docs/positioning/cerbaseal-brand-system.md`)
