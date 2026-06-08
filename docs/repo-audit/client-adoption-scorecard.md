# Client Adoption Scorecard
**CerbaSeal-Core v0.1.0 — Phase 6 Audit**
Generated: 2026-06-05

---

## Purpose

Evaluate whether a new client can understand, deploy, configure, validate, operate, and generate evidence with CerbaSeal — **without direct founder involvement**.

Each capability is scored 0–100.

---

## Scoring Rubric

| Score | Meaning |
|---|---|
| 90–100 | Fully self-service. Client can do this today with existing assets |
| 70–89 | Mostly self-service. Minor friction or one unclear step |
| 50–69 | Partially self-service. Works for a technical client; fails for others |
| 30–49 | Founder involvement required for most clients |
| 0–29 | Completely founder-dependent. No self-service path exists |

---

## Category 1: Understanding CerbaSeal

**"Can a new client understand what CerbaSeal does and why they need it?"**

### Score: **72 / 100**

**What works:**
- `docs/one-page.md` provides a clear single-page explanation
- `cerbaseal-system-breakdown.pdf` is a thorough technical reference (1,710 lines of source)
- `docs/01-system-definition.md` defines the system clearly
- `docs/governance-vocabulary.md` defines the vocabulary
- `cerbaseal-commercial-framework.pdf` explains the commercial context
- Home page of the web app communicates the core proposition

**What fails:**
- 100+ documentation files with no clear reading order for a new client
- Three competing "start here" documents (00-external-reviewer-brief, 00-reviewer-start-here, 00-quick-review-walkthrough) — clients cannot tell which applies to them
- No client-specific entry point distinct from the technical reviewer entry point
- The commercial framing (why an executive should care) and the technical framing (how it works) live in different documents with no bridge

**Gap:** A client-facing "what is CerbaSeal and what does it do for me" landing document does not exist as a single unified asset. The closest is `one-page.md` but it is not organized as client onboarding.

**Improvement path:**
- Create a single `docs/client-adoption/client-introduction.md` — 3 sections: the problem, what CerbaSeal does, and what a pilot looks like
- Link from the web app home page

---

## Category 2: Deploying CerbaSeal

**"Can a new client deploy CerbaSeal to their environment?"**

### Score: **55 / 100**

**What works:**
- `quickstart-deployment-guide.md` (325 lines) covers the deployment sequence
- `deployment-modes.md` explains the 3 deployment modes
- `cerbaseal.config.json` provides a config example
- Docker/Node deployment is technically feasible with existing docs
- `examples/rest-api-starter/` and `examples/agent-integration-starter/` provide concrete integration patterns

**What fails:**
- Deployment documentation is split across 8+ files (see documentation-consolidation-plan.md)
- No "which deployment mode should I use?" decision guide
- Mode C (client-controlled) setup requires understanding the config schema deeply — no annotated config example
- EU data residency constraints add complexity that is not fully documented in a single place
- No post-deployment health check procedure

**Specific failure scenario:** A client deploying Mode C (client controls the enforcement layer) reads `quickstart-deployment-guide.md`, then `mode-c-client-controlled.md`, then `deployment-modes.md` — three documents with partial overlap and slightly different assumptions. They end up contacting Jesse.

**Improvement path:**
- Unified deployment guide (see documentation-consolidation-plan.md Zone 4)
- Add a "choose your deployment mode" decision tree at the top of the deployment guide
- Add an annotated `cerbaseal.config.json` with inline comments explaining each field

---

## Category 3: Configuring CerbaSeal

**"Can a new client configure CerbaSeal for their specific workflow?"**

### Score: **28 / 100**

**What works:**
- `cerbaseal.config.json` exists as a starting point
- `generate-pilot-config.ts` can generate a configuration
- `architecture/invariants/invariant-registry.yaml` documents all invariants
- `docs/client-adoption/workflow-mapping-workbook.md` guides the mapping process

**What fails:**
- Policy pack authoring requires writing YAML/JSON that references the invariant registry — no client can do this without deep product knowledge
- No wizard, no UI, no guided form
- The `workflow-mapping-workbook.md` output does not automatically translate into a CerbaSeal configuration
- No library of canonical policy packs for common workflow types (financial approval, fraud review, compliance hold, etc.)
- Clients who complete the workflow mapping workbook still need Jesse to translate the output into an actual policy pack

**This is the lowest score in the entire audit. Configuration is the primary gating factor for self-service adoption.**

**Improvement path:**
- Policy-pack wizard (4 guided questions → YAML) — this is the single highest-impact build
- Canonical template library for top 4 workflow types
- Annotated policy pack for the `fraud-workflow-starter` example

---

## Category 4: Validating CerbaSeal

**"Can a new client verify that CerbaSeal is working correctly for their use case?"**

### Score: **60 / 100**

**What works:**
- Test suite passes 431 tests covering all invariants
- `scripts/verify-proof.ts` validates proof bundle integrity
- `scripts/check-invariant-coverage.ts` verifies invariant test coverage
- `scripts/export-proof.ts` produces a signed proof bundle
- Adversarial integrity report provides third-party-style validation

**What fails:**
- All validation tools require running TypeScript scripts — no client-facing validation UI
- The test suite validates CerbaSeal internals, not the client's specific policy pack
- No "run these 3 commands to confirm your deployment is working" quickcheck
- The proof bundle format is documented but not explained in plain language for a non-technical client

**Improvement path:**
- Add a `pnpm run validate` target that produces a human-readable health report
- Create a "deployment validation quickcheck" — 3 test requests (an obvious ALLOW, an obvious REJECT, and a HOLD scenario) that a client can run to confirm their policy pack is working

---

## Category 5: Operating CerbaSeal

**"Can a client's operations team run CerbaSeal day-to-day without contacting Jesse?"**

### Score: **52 / 100**

**What works:**
- `client-admin-guide.md` (256 lines) covers admin operations
- `operator-action-service.ts` provides programmatic operator controls
- `/troubleshoot` web app guides first-line diagnosis
- `deployment/runbook.md` covers operational procedures
- Audit log is append-only and self-evidencing

**What fails:**
- Operators do not know which HOLD decisions they are authorized to release vs. which require escalation
- No operator dashboard — operators must query the API or parse log files to understand system state
- `solo-support-risk-reduction.md` acknowledges the support gap but doesn't fully close it
- Escalation paths are described but not structured as a formal support tier system
- System health monitoring requires API calls — no monitoring integration guide exists

**Improvement path:**
- HOLD response authorization matrix: which reason codes can operators release, and which require escalation
- Support tier table: Tier 1 (self-service), Tier 2 (partner), Tier 3 (founder)
- Monitoring integration guide (Datadog/PagerDuty/etc.)

---

## Category 6: Generating Evidence

**"Can a client generate the compliance evidence package they need for their audit?"**

### Score: **65 / 100**

**What works:**
- `evidence-bundle-service.ts` automatically generates compliant evidence bundles
- `generate-evidence-report.ts` produces a readable evidence PDF
- Audit log is cryptographically chained and tamper-evident
- `examples/auditor-view/` shows what the evidence looks like
- `docs/reports/adversarial/` provides third-party-style validation evidence

**What fails:**
- Clients cannot interpret the evidence bundle without explanation
- No "Evidence Package Reader's Guide" for clients and their auditors
- EU AI Act / NIS2 mapping is documented (`eu-ai-act-nis2-mapping-support.md`) but not integrated into the evidence bundle output
- Evidence package delivery to an auditor requires Jesse's involvement

**Improvement path:**
- 2-page Evidence Package Reader's Guide (what each section means, how an auditor should read it)
- Automate the EU AI Act mapping as a section within the evidence bundle
- Partner training for evidence package delivery

---

## Overall Scorecard

| Category | Score | Gap |
|---|---|---|
| 1. Understanding CerbaSeal | 72 / 100 | No unified client introduction; too many competing entry points |
| 2. Deploying CerbaSeal | 55 / 100 | Fragmented deployment docs; no deployment mode decision guide |
| 3. Configuring CerbaSeal | **28 / 100** | **No self-service configuration path — policy pack authoring is founder-only** |
| 4. Validating CerbaSeal | 60 / 100 | No client-facing validation tool; test suite is internal only |
| 5. Operating CerbaSeal | 52 / 100 | No HOLD authorization guide; no formal support tier system |
| 6. Generating Evidence | 65 / 100 | No evidence reader's guide; EU mapping not in bundle output |
| **Overall Average** | **55 / 100** | |

---

## Priority Actions by Impact on Score

| Action | Affects Category | Score Impact |
|---|---|---|
| Policy-pack wizard | Configure | +30–40 pts |
| Unified deployment guide | Deploy | +15–20 pts |
| HOLD response authorization matrix | Operate | +15–20 pts |
| Evidence reader's guide | Evidence | +15 pts |
| Client introduction document | Understand | +10 pts |
| Deployment validation quickcheck | Validate | +15 pts |
| Support tier table | Operate | +10 pts |

**Target overall score with actions above: 80 / 100**
