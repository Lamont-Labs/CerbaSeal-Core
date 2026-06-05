# CerbaSeal — Pre-Call Summary

**Date:** 2026-06-05  
**Version:** 0.1.0  
**Author:** Jesse Lamont / Lamont Labs  
**Purpose:** State-of-repo summary for Line Axia call. Cite this document; do not inflate or soften.

---

## Repository State

All systems are passing.

| Check | Result |
|---|---|
| Test suite | 391 / 391 passing (16 test files) |
| Repo audit | 15 / 15 checks passing |
| Invariant coverage | 12 / 12 covered and linked to tests |
| Validator assertions | 229 (106 + 13 + 110 across 3 validators) |
| stableChecksum | `e6b9765095b9ae4c93722a83b6fc8bd61ca753c16efcaeadc56c0794333695a3` |
| CI/CD pipeline | GitHub Actions — full audit on every push to main |

---

## What Is Complete

### Enforcement Core
- Single execution gate with 12 invariants, fail-closed on all invalid input
- ALLOW / HOLD / REJECT outcomes — deterministic, no side effects
- ReleaseAuthorization issued only on ALLOW; linked to exact request, approver, evidence bundle
- Evidence bundle service with deep-clone immutability
- Replay consistency verification
- Diagnostic report generation with invariant-level tracing

### Audit Log
- In-memory append-only log with SHA-256 hash chain (default)
- File-backed persistent log (`FileBackedAppendOnlyLogService`) — JSONL, hash chain verified on load, survives process restarts. **Caller must configure explicitly.**
- Shared hash utilities (`audit-hash-utils.ts`) — same algorithm across both implementations, chains are cross-verifiable

### Security Hardening (7 fixes + 2 phases)
1. ApprovalArtifact bound to `requestId` — approval cannot be reused across requests
2. `fraud_triage` approval hardcoded — caller cannot suppress approval requirement
3. GateResult fabrication blocked — WeakSet prevents forged results entering evidence layer
4. AI non-authority made absolute — no approval flag can bypass the AI actor check
5. Evidence export compares actual hashes, not just event count
6. Unexpected exceptions produce controlled REJECT — fail-closed applies to all error types
7. `requestId` validated as non-empty — prevents ambiguous audit artifacts
- Phase 5: `actorAuthorityClass` validated at runtime — all 6 valid values enforced; any unknown value REJECTS with `MALFORMED_REQUEST` regardless of approval state
- Phase 6: Approval timestamp validated — `approvedAt` must parse as valid ISO date and must not predate `request.createdAt`

### Proof Integrity
- `pnpm export:proof` — sealed proof snapshot with `stableChecksum` + `manifestChecksum`
- Optional HMAC-SHA256 signing over `stableChecksum` via `CERBASEAL_SIGNING_KEY`
- `pnpm verify:proof` — cryptographic verification of snapshot integrity

### CI/CD
- `.github/workflows/audit.yml` — TypeScript check, 391 tests, import boundary, invariant coverage, 15/15 audit, proof export + verify, snapshot artifact upload (90-day retention) on every push

### Client Adoption Pack
All documents are complete and ready for Line Axia use:
- Client Readiness Assessment (qualification scoring rubric)
- Workflow Mapping Workbook (facilitated session guide)
- Quickstart Deployment Guide (15-min / 60-min / half-day paths)
- Pilot Sizing and Pricing Framework (Tier 0–4, EUR ranges)
- Pilot Delivery Playbook (Jesse hour targets, handoff criteria)
- Support Boundaries document (Tier 1/2/3 model)
- Troubleshooting Guide
- Training materials (6 guides: operator, reviewer, admin, FAQ, errors, onboarding agenda)
- Governance templates (3 workflow templates)
- Line Axia Partner Enablement Pack

### Deployment Documentation
- Mode C (client-controlled) deployment spec
- Operational runbook (install, health checks, environment variables, incident response)
- Pilot deployment checklist

---

## What Is Not Complete (Honest Gaps)

These are not implementation oversights. They are stated design boundaries for this proof slice.

### Repository access
The quickstart guide and runbook reference `github.com/Lamont-Labs/CerbaSeal-Core.git`. That repo is not yet public. A client cannot clone it today without direct access from Jesse. **This must be resolved before any client onboarding.**

### No npm package
Clients receive git source, not an npm package. Integration requires cloning the repo and importing TypeScript directly. There is no `@lamont-labs/cerbaseal-core` on npm.

### Actor authority classes are code, not config
The 6 valid actor authority classes (`system`, `ai`, `analyst`, `reviewer`, `manager`, `compliance_officer`) are TypeScript constants enforced at runtime. Adding a new client role requires Jesse to write new code and cut a new release. This is the primary "configuration vs. engineering" gap — clients cannot self-configure new authority types.

### Workflow classes are code, not config
The 3 supported workflow classes (`fraud_triage`, `transaction_escalation`, `account_hold_recommendation`) are TypeScript types. A new client workflow requires code changes and a new release.

### No policy engine
`policyPackRef` is a required field but its content is never evaluated. CerbaSeal verifies the field exists — it does not read, parse, or enforce actual policy content. A full policy engine is a post-pilot implementation item.

### No network surface
CerbaSeal is a library, not a service. There is no HTTP endpoint, no REST API, no SDK. The client's integration adapter must call the TypeScript API directly.

### Production hardening not complete
The following are documented as roadmap items, not current capabilities:
- Cryptographic signing of decision envelopes (see `docs/security/artifact-signing-roadmap.md`)
- Identity provider integration for actor/approver verification
- Production monitoring and alerting
- Rate limiting (integration adapter responsibility)
- Formal SLA

### No compliance certification
CerbaSeal produces governance evidence — it does not certify AI Act, GDPR, SOC 2, or ISO compliance. This must be stated clearly to any client with regulatory expectations.

### No third-party security review
No external security review has been completed. Security controls are self-documented and adversarially tested internally. A third-party pentest is a pre-production requirement.

---

## Deployment Reality

| Question | Answer |
|---|---|
| Can a client deploy today? | With Jesse's direct involvement: yes. Independently: no — repo is not public. |
| How long to deploy? | 15-minute demo → 60-minute validation → half-day pilot setup (per quickstart guide) |
| What does the client need? | Node.js 22, pnpm 10, Linux/macOS host, a technical contact who can manage a Node.js service |
| What does Jesse provide? | Library source, proof snapshot, runbook, onboarding session, Tier 3 escalation support |
| What does Line Axia own? | Integration adapter, hosting environment, audit log storage, approver workflow |

---

## Jesse Time Budget

Per `docs/client-adoption/pilot-delivery-playbook.md`:

| Activity | Estimated Hours |
|---|---|
| Pre-engagement assessment | 1.0 |
| Workflow mapping session | 2.0 |
| Integration setup and review | 2.0 |
| Validation and testing | 1.5 |
| Proof export and handoff | 0.5 |
| Buffer | 1.0 |
| **Tier 2 target total** | **≤ 8 hours** |

Realistic range per playbook: 2–10 hours depending on client integration complexity. The 8-hour target assumes a cooperative client with a technical contact and a well-defined workflow.

---

## Support Model

Tier 1 (Line Axia self-service) → Tier 2 (Line Axia with docs) → Tier 3 (Jesse, ≤5% of volume)

Target split: 80% / 15% / 5%. Tier 3 triggers: chain verification failures, enforcement anomalies, upgrade coordination.

Jesse's **30-day absence test**: the system passes if Line Axia has the troubleshooting guide, client admin guide, support boundaries doc, and a stable codebase. The gap is Tier 3 escalations that require code changes — those cannot be handled without Jesse.

---

## Pilot Pricing Reference

| Tier | Scope | EUR Range |
|---|---|---|
| Tier 0 | Single workflow, Jesse-led demo | €5K–€12K |
| Tier 1 | One workflow, minimal integration | €15K–€35K |
| **Tier 2** | **One workflow, standard integration** | **€35K–€75K** |
| Tier 3 | One workflow, complex integration | €75K–€120K |
| Tier 4 | Multi-workflow + Line Axia custom dev | €150K–€250K+ |

First offer starting point: **€45K–€60K** (Tier 2 base, before add/discount factors).

---

## Product Classification

CerbaSeal is **execution governance infrastructure** — not AI output filtering, not policy management, not a compliance platform, not middleware.

It enforces:
- Authority (who can authorize)
- Sequence (what conditions must be met)
- Evidence (every outcome is permanently recorded)

It does not enforce:
- Correctness (is this the right action?)
- Quality (is the AI reasoning good?)
- Compliance (does this satisfy a regulatory standard?)

The correct comparables are internal control layers, not AI safety tools or policy engines.

---

## What Line Axia Needs to Hear

1. The enforcement core is real and passes adversarial testing. It is not a demo narrative.
2. Client onboarding requires a technical contact on their side. No technical contact = no pilot.
3. New workflow types and actor roles require code from Jesse — they are not configurable by clients.
4. The repo must be made accessible before any client can begin. Public GitHub or private invite required.
5. Pricing is Tier 2 (€35K–€75K); recommend opening at €45K–€60K.
6. The pilot produces a governance record, not a compliance certification. This distinction must be explicit in every client conversation.
7. Line Axia owns the integration adapter, hosting, identity binding, and approver workflow. CerbaSeal provides the enforcement spine.

---

*Generated: 2026-06-05 — CerbaSeal v0.1.0 pre-call state*
