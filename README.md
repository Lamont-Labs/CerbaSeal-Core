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

**Bounded autonomy** — every governed AI system operates within an explicit Execution Scope Policy: a defined permitted action set, authority boundary (AI may propose, never authorize), required authorization conditions, and a prohibited use envelope. These are not advisory guidelines — they are enforced by the invariant check sequence on every request. See [docs/bounded-autonomy-model.md](docs/bounded-autonomy-model.md).

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
- Bounded autonomy model: [docs/bounded-autonomy-model.md](docs/bounded-autonomy-model.md)
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
stableChecksum: e6b9765095b9ae4c93722a83b6fc8bd61ca753c16efcaeadc56c0794333695a3
```

- 432 / 432 tests passing (17 test files)
- 15 / 15 audit checks passing
- 12 / 12 invariants covered and linked to tests
- 229 validator assertions (106 + 13 + 110 across 3 validators)
- Adversarial integrity audit complete (phases 2–7)
- Fail-closed behavior validated
- Non-forgery protection verified
- Misuse + boundary condition tests
- Import boundary violations: 0

Run `pnpm export:proof` to regenerate. Run `pnpm audit:repo` to verify all 15 checks independently. Run `pnpm verify:proof` to verify the exported snapshot has not been tampered with.

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

## Governance Reference

- Governance vocabulary: [docs/governance-vocabulary.md](docs/governance-vocabulary.md) — translates all invariants and reason codes into enterprise governance semantics
- Bounded autonomy model: [docs/bounded-autonomy-model.md](docs/bounded-autonomy-model.md) — formalizes Execution Scope Policy and the AI authority boundary
- Trust boundary and limitations: [docs/09-trust-boundary-and-limitations.md](docs/09-trust-boundary-and-limitations.md) — stated limitations without softening

## Pilot Operations

- Pilot operations model: [docs/pilot-operations-model.md](docs/pilot-operations-model.md) — how a pilot engagement operates: onboarding, issue tracking, support commitment, response times, documentation requirements, founder availability, and exit deliverables

---

## Adoption Layer

The enforcement core is complete. The adoption layer is now also complete.

**[Founder Independence Kit](docs/FOUNDER-INDEPENDENCE-KIT.md)** — single entry point for complete self-service deployment, from qualification to evidence reporting.

**[Client Onboarding Sequence](docs/client-adoption/onboarding-sequence.md)** — exact phase-by-phase sequence a new client follows without Jesse.

**Authority Class Registry** — clients add custom authority classes (e.g., `risk_officer`, `supervisor`) via `cerbaseal.config.json` with no TypeScript changes:
```json
{ "authorityClasses": { "core": [...], "extended": ["risk_officer", "supervisor"] } }
```
```typescript
import { loadCerbaSealConfig } from "./src/config/cerbaseal-config.js";
const gate = new ExecutionGateService(loadCerbaSealConfig());
```

**Integration Starter Kits** — working code for the four most common integration patterns:
- [REST API Starter](examples/rest-api-starter/) — HTTP wrapper, all endpoints
- [Financial Approval Starter](examples/financial-approval-starter/) — manager approves analyst recommendation
- [Fraud Workflow Starter](examples/fraud-workflow-starter/) — AI-scored triage with file-backed audit
- [Agent Integration Starter](examples/agent-integration-starter/) — AI proposes, human approves

**Pilot Config Generator** — from wizard input to complete pilot package in one command:
```bash
cp scripts/wizard-input.example.json wizard-input.json
# fill in your values
pnpm generate:pilot-config
# → pilot-config/cerbaseal-config.json
# → pilot-config/pilot-checklist.md
# → pilot-config/scenario-test.ts
# → pilot-config/deployment-summary.md
```

**Evidence Package Generator** — one command produces the governance evidence package:
```bash
pnpm export:proof && pnpm generate:evidence-report
# → evidence-package/governance-summary.md
# → evidence-package/decision-summary.json
# → evidence-package/audit-integrity-summary.md
```

---

## Client Adoption Pack

Materials for Line Axia and pilot clients to qualify, onboard, deploy, and operate CerbaSeal without depending on Jesse for every step.

**Qualification and Planning:**
- [Client Readiness Assessment](docs/client-adoption/client-readiness-assessment.md) — scoring rubric to determine pilot fit before committing resources
- [Workflow Mapping Workbook](docs/client-adoption/workflow-mapping-workbook.md) — facilitated session guide: turns a client workflow into CerbaSeal configuration
- [Pilot Sizing and Pricing Framework](docs/client-adoption/pilot-sizing-and-pricing-framework.md) — three pilot tiers, scope definitions, and pricing factors
- [Pilot Success Framework](docs/client-adoption/pilot-success-framework.md) — agreed success criteria for client, Lamont Labs, and Line Axia

**Deployment and Operations:**
- [Quickstart Deployment Guide](docs/client-adoption/quickstart-deployment-guide.md) — 15-min demo / 60-min validation / half-day pilot setup paths
- [Client Admin Guide](docs/client-adoption/client-admin-guide.md) — admin responsibilities, audit file ownership, escalation path
- [Troubleshooting Guide](docs/client-adoption/troubleshooting-guide.md) — symptom-indexed issue resolution and support escalation

**Training:**
- [Getting Started Guide](docs/client-adoption/training/getting-started-guide.md) — what CerbaSeal is, what ALLOW/HOLD/REJECT mean
- [Operator Guide](docs/client-adoption/training/operator-guide.md) — daily operations and HOLD resolution
- [Reviewer Guide](docs/client-adoption/training/reviewer-guide.md) — authorizing AI-proposed actions
- [Admin Guide](docs/client-adoption/training/admin-guide.md) — deployment, audit log, verification commands
- [FAQ](docs/client-adoption/training/faq.md) — common questions for all audiences
- [Common Errors and Fixes](docs/client-adoption/training/common-errors-and-fixes.md) — quick-reference error resolution
- [30-Minute Onboarding Agenda](docs/client-adoption/training/30-minute-onboarding-agenda.md) — facilitator guide for kick-off session
- [10-Minute Executive Overview](docs/client-adoption/training/10-minute-executive-overview.md) — non-technical briefing

**Governance Templates:**
- [Fraud Triage Template](docs/client-adoption/templates/fraud-triage-template.md)
- [Transaction Escalation Template](docs/client-adoption/templates/transaction-escalation-template.md)
- [Account Hold Recommendation Template](docs/client-adoption/templates/account-hold-recommendation-template.md)
- [Generic Human Approval Template](docs/client-adoption/templates/generic-human-approval-template.md)

**Partner Materials (Line Axia):**
- [Line Axia Partner Enablement Pack](docs/client-adoption/line-axia-partner-enablement-pack.md) — 30-sec/2-min explanations, objection handling, when to involve Jesse
- [EU AI Act / NIS2 Mapping Support](docs/client-adoption/eu-ai-act-nis2-mapping-support.md) — regulatory framing with careful compliance language
- [Self-Service Configuration Wizard Spec](docs/client-adoption/self-service-configuration-wizard-spec.md) — future 10-step wizard design

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

- Audit log default is in-memory (`AppendOnlyLogService`) — entries are lost on process restart. Persistent audit is available via `FileBackedAppendOnlyLogService` (JSONL, hash-chain integrity preserved across restarts) — the caller must configure it explicitly.
- No cryptographic signing — evidence is hash-linked, not key-signed or attested (optional HMAC-SHA256 snapshot signing available via `CERBASEAL_SIGNING_KEY`)
- No identity provider — actor identity is caller-supplied with no independent attestation
- No production deployment hardening beyond the enforcement library
- No third-party security review completed
- loggingReady is caller-declared — gate does not verify actual log system health
- Hash chain proves consistency, not origin authenticity

These limitations are documented and visible to reviewers. See `/security` portal page for the full control inventory and known-limitations list.
