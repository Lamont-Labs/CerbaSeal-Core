# Founder Dependency Audit
**CerbaSeal-Core v0.1.0 — Phase 4 Audit**
Generated: 2026-06-05

---

## Purpose

Identify every workflow where Jesse Lamont (the founder) is currently the only person who can perform the work. For each dependency, classify the type and recommend how to eliminate or reduce it.

---

## Classification Key

- **SELF-SERVICE** — Client or partner can do this independently today
- **PARTNER-SERVICE** — A trained consulting partner can do this without Jesse
- **FOUNDER-REQUIRED** — Currently requires Jesse's direct involvement

**Reduction Recommendations:**
- **AUTOMATE** — Script or system can replace manual founder work
- **DOCUMENT** — Accurate documentation would allow self-service
- **TEMPLATE** — A filled template removes the need for Jesse to draft from scratch
- **WIZARD** — A UI decision guide removes ambiguity
- **TRAINING** — Training a partner once removes the recurring dependency
- **CONFIGURATION** — A config file or form replaces a custom conversation

---

## Pre-Pilot Phase

### 1. Client Discovery and Qualification

**Current:** FOUNDER-REQUIRED
Jesse conducts the discovery call, assesses fit, and determines whether a prospect is a real pilot candidate.

**Gap:** No structured qualification gate exists before the call. Jesse cannot delegate this without extensive background briefing.

**Recommendation:** WIZARD + TEMPLATE
- The `/assess` readiness assessment in the web app partially addresses this — a prospect can self-qualify before a call.
- Add: a structured intake form linked to the assessment output. The form output should feed directly into Jesse's pre-call prep, reducing the discovery call from 90 minutes to 30 minutes.
- Existing asset: `docs/client-adoption/client-discovery-script.md` — good, but not yet self-service for clients.
- Existing asset: `docs/client-adoption/client-qualification-scorecard.md` — exists but not distributed as a client-facing tool.

**Priority:** HIGH
**Estimated hour reduction:** 1-2h per pilot

---

### 2. Policy Pack Authoring

**Current:** FOUNDER-REQUIRED (Critical)
Jesse writes every policy pack. A policy pack defines what CerbaSeal will ALLOW, HOLD, or REJECT for a specific client workflow. There is no template or wizard that allows a partner or client to author one independently.

**Gap:** Policy packs require deep knowledge of the invariant model and reason-code vocabulary. No guided authoring tool exists.

**Recommendation:** WIZARD + TEMPLATE + TRAINING
- Build a policy-pack wizard that walks through: workflow name → actor roles → approval thresholds → escalation paths → evidence requirements.
- Create 4-5 canonical policy pack templates for common workflow types (financial approval, fraud review, escalation routing, compliance hold).
- Existing asset: `architecture/invariants/invariant-registry.yaml` — this defines the invariants. A wizard could present these as guided choices rather than raw YAML.
- Existing asset: `scripts/generate-pilot-config.ts` — generates configuration. Could be the backend of a wizard.

**Priority:** CRITICAL
**Estimated hour reduction:** 3-6h per pilot

---

### 3. Workflow Mapping

**Current:** FOUNDER-REQUIRED
Jesse participates in (or leads) the mapping of the client's actual workflow to CerbaSeal enforcement points.

**Gap:** The `workflow-mapping-workbook.md` exists (380 lines) and is thorough, but Jesse still needs to validate the output and translate it into a policy pack.

**Recommendation:** DOCUMENT + TEMPLATE
- The workbook exists. The gap is validation: a partner needs to be trained to validate the output without Jesse.
- Add a "workflow-mapping acceptance criteria" checklist that a partner can use to confirm the mapping is complete and correct.
- Train partners to validate outputs at Level 2 certification.

**Priority:** HIGH
**Estimated hour reduction:** 1-2h per pilot

---

## Onboarding Phase

### 4. Deployment Environment Setup

**Current:** PARTNER-SERVICE (partially) / FOUNDER-REQUIRED for non-standard environments
Standard Docker/Node deployment can be done by a technical partner. Edge cases (custom auth, non-standard infrastructure, EU data residency) require Jesse.

**Gap:** Deployment documentation exists (`docs/deployment/`, `docs/client-adoption/quickstart-deployment-guide.md`) but is fragmented across 5+ documents. Partners report friction in knowing which document applies to their situation.

**Recommendation:** DOCUMENT + CONFIGURATION
- Consolidate all deployment documentation into a single runbook that branches by deployment mode (Mode A / B / C) and environment type.
- The `cerbaseal.config.json` schema should be documented as the single configuration source. Remove all references to per-environment manual steps that are not in the config.

**Priority:** HIGH
**Estimated hour reduction:** 0.5-1.5h per pilot

---

### 5. Integration Testing and Validation

**Current:** FOUNDER-REQUIRED (for sign-off)
Partners can run integration tests, but Jesse signs off on results before a pilot goes live.

**Gap:** No formal acceptance test document exists that a partner can administer and sign. The test suite passes 415 tests, but these are internal — no client-facing validation checklist exists.

**Recommendation:** DOCUMENT + AUTOMATE
- Create a formal "Pilot Go/No-Go Checklist" that a partner can complete and counter-sign without Jesse. Tie it to the existing audit check results.
- `scripts/check-invariant-coverage.ts` and `scripts/check-imports.ts` can automate most of the validation. Expose their output as a human-readable report.
- Existing asset: `docs/deployment/pilot-deployment-checklist.md` — exists but not designed for partner-administered sign-off.

**Priority:** HIGH
**Estimated hour reduction:** 1-2h per pilot

---

### 6. Client Operator Training

**Current:** FOUNDER-REQUIRED (typically)
Jesse delivers or co-delivers the initial operator training session.

**Gap:** Training materials exist (8 docs in `client-adoption/training/`, 4 tracks in the web app) but are not yet delivered as self-service resources that a partner can administer.

**Recommendation:** TRAINING
- Partners at L2 certification should be able to deliver operator training without Jesse.
- The `/training` web app page is the right vehicle. Partners need authorization to use it as a training tool in client sessions.
- Existing asset: `docs/client-adoption/train-the-trainer-program.md` (245 lines) — this program exists on paper. Implement it.

**Priority:** MEDIUM
**Estimated hour reduction:** 1-2h per pilot

---

## Ongoing Operations

### 7. Evidence Package Review

**Current:** FOUNDER-REQUIRED
When a client needs to produce a compliance evidence package (for an audit, regulator, or internal review), Jesse is typically involved in reviewing and signing off.

**Gap:** Evidence bundle generation is automated (`src/services/evidence/evidence-bundle-service.ts`), but there is no partner-facing guide for interpreting and presenting the output.

**Recommendation:** DOCUMENT + TRAINING
- Create an "Evidence Package Review Guide" — a 2-page document explaining what each section of the evidence bundle means and how an auditor should read it.
- Existing asset: `examples/auditor-view/` — the auditor view example exists but is not documented as a client-deliverable tool.

**Priority:** MEDIUM
**Estimated hour reduction:** 1-2h per evidence review

---

### 8. Escalation Resolution

**Current:** FOUNDER-REQUIRED (Critical)
When a HOLD decision creates a business problem (approval blocked, legitimate payment held), the client contacts Jesse.

**Gap:** Operator action tools exist (`src/services/support/operator-action-service.ts`) but clients don't have clear guidance on which escalations they can resolve themselves vs. which require founder involvement.

**Recommendation:** DOCUMENT + WIZARD
- The `/troubleshoot` web app page partially addresses this — clients can diagnose before escalating.
- Add escalation tier definitions: Tier 1 (client self-service), Tier 2 (partner support), Tier 3 (founder required).
- Existing asset: `docs/client-adoption/support-boundaries.md` (199 lines) — defines boundaries but doesn't give clients enough self-service guidance.

**Priority:** HIGH
**Estimated hour reduction:** 0.5-2h per incident

---

### 9. Commercial Negotiations and Expansion

**Current:** FOUNDER-REQUIRED
All commercial conversations require Jesse. Partners can prospect and generate proposals but cannot close deals.

**Gap:** Pricing framework exists (`cerbaseal-pricing-brief.pdf`, `docs/client-adoption/pilot-sizing-and-pricing-framework.md`), but partners have no authorization framework for what they can commit to without escalating to Jesse.

**Recommendation:** TEMPLATE + CONFIGURATION
- Define explicit partner deal authorities: what tier/scope a partner can commit to without Jesse review.
- Create a standard proposal template that partners can complete without customization.
- Existing asset: `docs/client-adoption/pilot-sizing-and-pricing-framework.md` (331 lines) — thorough but founder-facing, not partner-facing.

**Priority:** MEDIUM
**Estimated hour reduction:** 1-3h per deal

---

### 10. Partner Certification and Onboarding

**Current:** FOUNDER-REQUIRED
Jesse manages all partner relationships. No one else can certify a new partner.

**Gap:** Certification path is described in the web app and in documentation, but the certification process itself (assessment, validation, credential issuance) does not exist as an independent process Jesse can delegate.

**Recommendation:** TEMPLATE + TRAINING
- Create a partner certification assessment Jesse can administer once, then have a Senior Partner administer for subsequent candidates.
- Define what "Level 1 Certified" means in testable terms, not descriptive terms.

**Priority:** LOW (no partners to certify yet, but design for scale)
**Estimated hour reduction:** 3-5h per partner onboarded

---

## Summary Table

| Workflow | Classification | Recommendation | Priority | Hours/Pilot |
|---|---|---|---|---|
| Client discovery/qualification | FOUNDER-REQUIRED | WIZARD | HIGH | 1-2h |
| Policy pack authoring | FOUNDER-REQUIRED | WIZARD + TEMPLATE | CRITICAL | 3-6h |
| Workflow mapping validation | FOUNDER-REQUIRED | DOCUMENT + TRAINING | HIGH | 1-2h |
| Deployment setup (standard) | PARTNER-SERVICE | DOCUMENT | HIGH | 0.5-1.5h |
| Integration validation sign-off | FOUNDER-REQUIRED | DOCUMENT + AUTOMATE | HIGH | 1-2h |
| Client operator training | FOUNDER-REQUIRED | TRAINING | MEDIUM | 1-2h |
| Evidence package review | FOUNDER-REQUIRED | DOCUMENT | MEDIUM | 1-2h |
| Escalation resolution | FOUNDER-REQUIRED | DOCUMENT + WIZARD | HIGH | 0.5-2h |
| Commercial negotiations | FOUNDER-REQUIRED | TEMPLATE | MEDIUM | 1-3h |
| Partner certification | FOUNDER-REQUIRED | TEMPLATE + TRAINING | LOW | 3-5h/partner |

---

## Current vs. Target State

| State | Founder Hours Per Pilot |
|---|---|
| Current (June 2026) | 12–20 hours |
| After policy-pack wizard | 8–14 hours |
| After partner certification + training | 5–9 hours |
| Target (fully scaled) | 2–4 hours |

**The single highest-leverage action:** Build a policy-pack authoring wizard. This removes 3–6 founder hours per pilot and is the blocker for partner-delivered pilots.

---

## Workflows That Are Already Self-Service

| Workflow | Tool | Since |
|---|---|---|
| Readiness assessment | `/assess` web page | 2026-06-04 |
| Pilot plan generation | `/pilot` web page | 2026-06-04 |
| Troubleshooting (first line) | `/troubleshoot` web page | 2026-06-04 |
| Operator training (self-paced) | `/training` web page | 2026-06-04 |
| Partner information | `/partner` web page | 2026-06-04 |
| Invariant coverage check | `pnpm run check-invariants` | v0.1.0 |
| Evidence bundle generation | `evidence-bundle-service.ts` | v0.1.0 |
| Proof verification | `scripts/verify-proof.ts` | v0.1.0 |
