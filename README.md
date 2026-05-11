# CerbaSeal

CerbaSeal is deterministic execution governance infrastructure.

It enforces an authorization boundary between AI-generated decisions and real-world execution — ensuring every consequential action is governed, evidenced, and reproducible before it runs.

CerbaSeal enforces authority — not judgment.

It guarantees:
- AI systems cannot authorize their own proposals
- Required human approvals cannot be bypassed
- Every decision produces a verifiable, replayable evidence bundle
- Unexpected failures produce governed outcomes, not uncaught exceptions

---

## Governance Properties

These are what distinguish CerbaSeal from middleware or policy tooling:

**Invariant enforcement** — 12 hard invariants govern every execution path. Each is linked to its covering tests. None can be silently bypassed.

**Replayability** — every evidence bundle can be re-evaluated through the same gate and will produce the same outcome. Outcomes are not just logged — they are reproducible.

**Proof exportability** — `pnpm export:proof` emits a sealed proof snapshot. The `stableChecksum` field is a SHA-256 hash of all enforcement-state fields (invariants, test results, validators) excluding timestamps. It is stable across runs on an unchanged repo, and changes when enforcement state changes. Reviewers can compare it across time.

**Self-auditing** — `pnpm audit:repo` runs 13 automated checks against the repo's own governance integrity: test suite, type coverage, import boundaries, invariant linkage, validator assertions, and documentation consistency. The repo enforces its own structural constraints.

**Boundary enforcement** — architectural import rules prevent test code from leaking into source, example contamination, and cross-example coupling. Enforced by `pnpm check:imports` at 4 boundary rules.

**Fail-closed model** — unexpected runtime exceptions produce a controlled REJECT outcome, registered in the evidence layer. No unhandled error propagates to the caller.

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

It is not a production system or deployment surface.

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
- Proof snapshot: `pnpm export:proof` → `docs/reports/proof-snapshot.json`
- Integration spec: [docs/integration/integration-spec.md](docs/integration/integration-spec.md)
- Deployment modes: [docs/deployment/deployment-modes.md](docs/deployment/deployment-modes.md)

For the fastest review, open the hosted demo or run `pnpm demo:web` locally.

CerbaSeal should be reviewed as an execution enforcement boundary.

It is not a dashboard, policy system, or domain application.

---

## Proven at runtime

Current enforcement state (stable across runs on this commit):

```
stableChecksum: 7695187faf66906d868c5c4764fd6068e7ddbe0b1f69933e47a85d67c0d08ec0
```

- 372 / 372 tests passing (15 test files)
- 13 / 13 audit checks passing
- 12 / 12 invariants covered and linked to tests
- Adversarial integrity audit complete (phases 2–7)
- Fail-closed behavior validated
- Non-forgery protection verified
- Misuse + boundary condition tests
- Import boundary violations: 0

Run `pnpm export:proof` to regenerate. Run `pnpm audit:repo` to verify all 13 checks independently.

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
- REJECTED (hard invariant failed)
- HELD (required approval missing)
- ALLOWED (all conditions satisfied)

CerbaSeal is domain-agnostic.  
The included demo uses a regulated-system reference workflow as an example, but the enforcement model applies to any high-risk action system.

## Why It Matters

CerbaSeal enforces authorization at execution time.  
It does not determine whether an action is the correct one to take.

The enforcement boundary is explicit and tested: `test/security/contextual-boundary.test.ts` documents 25 cases where structurally valid, properly authorized requests ALLOW even when the decision might be contextually poor. That precision is intentional.

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

Version: 0.1.0

- Full test suite passing
- Audit coverage complete
- Reviewer & pilot portal live (`pnpm demo:web` → `/review`, `/pilot`, `/security`, `/deployment`)
- Brand system: CerbaSeal mark integrated across all portal pages (`docs/positioning/cerbaseal-brand-system.md`)

---

## Known Limitations

These are accurate as of v0.1.0 and are stated without softening.

- Audit log is in-memory — not persisted across process restarts
- No cryptographic signing — evidence is hash-linked, not key-signed or attested
- No identity provider — actor identity is caller-supplied with no independent attestation
- No persistent storage — all state exists per process instance
- No production deployment hardening
- No third-party security review completed
- loggingReady is caller-declared — gate does not verify actual log system health
- Hash chain proves consistency, not origin authenticity

These limitations are documented and visible to reviewers. See `/security` portal page for the full control inventory and known-limitations list.
