# Pilot Delivery Audit
**CerbaSeal-Core v0.1.0 — Phase 5 Audit**
Generated: 2026-06-05

---

## Purpose

Measure the friction in every step of the CerbaSeal pilot experience. Identify the highest-friction steps. Estimate current and target founder hours per pilot.

---

## Friction Scale

- **Low (L):** Partner or client can do this with existing documentation, < 30 min
- **Medium (M):** Requires Jesse involvement or significant client effort, 30 min – 2 hours
- **High (H):** Blocking step requiring Jesse, > 2 hours or creates scheduling dependency
- **Critical (C):** Single-point-of-failure requiring Jesse; if Jesse is unavailable, the pilot stalls

---

## Phase 1: Pre-Pilot (Discovery → Signed)

### Step 1.1 — Client Discovery Call

| Attribute | Detail |
|---|---|
| Friction | **High** |
| Current state | Jesse conducts a 60–90 minute call to understand the prospect's use case, workflow, AI system, and compliance requirements |
| Why friction | No self-qualification tool existed before `/assess`. Calls often include significant education before reaching qualification |
| Blocker? | Yes — Jesse's calendar is the gating constraint |
| Existing assets | `client-discovery-script.md`, `frequently-asked-objections.md` |
| Gap | No structured intake form; prospect arrives cold |
| Recommendation | Require prospects to complete `/assess` before the discovery call. Share `one-page.md` + `cerbaseal-system-breakdown.pdf` in advance. This should reduce calls to 30 minutes |
| **Hours saved** | **0.5–1h per pilot** |

---

### Step 1.2 — Client Qualification Assessment

| Attribute | Detail |
|---|---|
| Friction | **Medium → Low** (post web app) |
| Current state | Jesse assesses whether the prospect has a qualifiable workflow, technical environment, and team capacity |
| Recent improvement | `/assess` now provides a self-service readiness score. Prospects can generate a READY / READY WITH SUPPORT / NOT READY verdict independently |
| Remaining gap | Jesse still reviews the output and decides whether to proceed. No formal "assessment pass threshold" is documented |
| Recommendation | Publish a pass/fail threshold: assessment score ≥ 32/48 = proceed; < 32 = support conversation required. This can be enforced without Jesse review for scores above threshold |
| **Hours saved** | **0.5h per pilot** |

---

### Step 1.3 — Pilot Scoping and Pricing

| Attribute | Detail |
|---|---|
| Friction | **High** |
| Current state | Jesse scopes the pilot, defines tier, sets pricing |
| Existing assets | `pilot-sizing-and-pricing-framework.md` (331 lines) — thorough but founder-facing |
| Gap | Partners cannot scope a pilot without Jesse because the framework is documented but not distributed as a partner-facing tool |
| Recommendation | Convert `pilot-sizing-and-pricing-framework.md` into a partner-facing scoping form with pre-set tier definitions. L2 partners should be authorized to scope Tier 0–2 pilots without Jesse review |
| **Hours saved** | **1–2h per pilot** |

---

### Step 1.4 — Pilot Agreement / Commercial

| Attribute | Detail |
|---|---|
| Friction | **High** |
| Current state | Jesse handles all commercial conversations |
| Existing assets | Pricing brief PDF, commercial framework PDF |
| Gap | No standard pilot agreement template; no partner deal authority defined |
| Recommendation | Create a standard 2-page pilot agreement template. Define partner authority: partners can commit to Tier 0–1 scope without Jesse sign-off |
| **Hours saved** | **1–2h per pilot** |

---

**Phase 1 Total Friction (Current):** 4–7 founder hours
**Phase 1 Total Friction (Target):** 1–2 founder hours

---

## Phase 2: Pilot Setup (Signed → Live)

### Step 2.1 — Policy Pack Authoring

| Attribute | Detail |
|---|---|
| Friction | **CRITICAL** |
| Current state | Jesse writes the policy pack from scratch. A policy pack defines what the gate will ALLOW, HOLD, or REJECT for this specific workflow |
| Why critical | No template, no wizard, no partner training exists for this step |
| Hours | 2–4 hours per policy pack; more for complex multi-workflow deployments |
| Existing assets | `architecture/invariants/invariant-registry.yaml`, `scripts/generate-pilot-config.ts` |
| Gap | The invariant model is powerful but opaque. Clients cannot read YAML. Partners do not know which invariants apply to which workflow types |
| Recommendation | Build a policy-pack wizard (4 guided questions → YAML output). Create 4–5 canonical templates for common types. This is the **#1 priority** for reducing founder hours |
| **Hours saved** | **2–4h per pilot** |

---

### Step 2.2 — Workflow Mapping

| Attribute | Detail |
|---|---|
| Friction | **High** |
| Current state | Jesse leads or validates the mapping of the client's actual workflow to CerbaSeal enforcement points |
| Existing assets | `workflow-mapping-workbook.md` (380 lines) — thorough and well-structured |
| Gap | The workbook is comprehensive but Jesse must validate the output. No "mapping acceptance criteria" exists that a partner can apply independently |
| Recommendation | Add an acceptance checklist to the workbook. Train L2 partners to validate it. Jesse reviews only for Tier 3–4 |
| **Hours saved** | **1–2h per pilot** |

---

### Step 2.3 — Environment Deployment

| Attribute | Detail |
|---|---|
| Friction | **Medium** |
| Current state | Technical client or partner deploys the CerbaSeal enforcement layer |
| Existing assets | `quickstart-deployment-guide.md` (325 lines), `deployment/runbook.md`, `deployment-modes.md`, deployment checklist |
| Gap | Documentation exists but is split across 5+ files. A technical partner spends 30–60 minutes finding the right document for their deployment mode |
| Recommendation | Consolidate into one unified deployment guide (see documentation-consolidation-plan.md). Partners should reach the correct section in < 5 minutes |
| **Hours saved** | **0.5–1h per pilot** |

---

### Step 2.4 — Integration and Connectivity Testing

| Attribute | Detail |
|---|---|
| Friction | **Medium** |
| Current state | Client technical team connects their AI system to the CerbaSeal gate. Jesse validates the integration |
| Existing assets | Integration examples (5 starter kits), `integration-spec.md`, `test/integration/` |
| Gap | Integration test suite validates CerbaSeal internals, not client connectivity. No client-facing "integration health check" tool exists |
| Recommendation | Expose the `/diagnostics` endpoint output as a client-readable health report. Add an `integration-test-checklist.md` that a partner can administer |
| **Hours saved** | **0.5–1h per pilot** |

---

### Step 2.5 — Operator Training Delivery

| Attribute | Detail |
|---|---|
| Friction | **Medium** |
| Current state | Jesse delivers the initial operator training session (60–90 min) |
| Existing assets | `/training` web app, `train-the-trainer-program.md`, `30-minute-onboarding-agenda.md` |
| Gap | Training materials are now self-service via the web app, but no partner has been certified to deliver training. The train-the-trainer program exists on paper but has not been executed |
| Recommendation | Certify first partner at L2. Run train-the-trainer session once. Jesse should not deliver operator training after the first 2 pilots |
| **Hours saved** | **1–2h per pilot** |

---

**Phase 2 Total Friction (Current):** 6–12 founder hours
**Phase 2 Total Friction (Target):** 1–3 founder hours

---

## Phase 3: Pilot Operations (Live → Evidence)

### Step 3.1 — Initial Monitoring and Support

| Attribute | Detail |
|---|---|
| Friction | **High** |
| Current state | Jesse is the only support contact for operational issues during early pilot days |
| Existing assets | `support-boundaries.md`, `/troubleshoot` web app |
| Gap | Support escalation tiers are not formally defined. Clients contact Jesse for issues that could be self-resolved |
| Recommendation | Publish a support tier table: Tier 1 (self-service `/troubleshoot`), Tier 2 (partner support within 4h), Tier 3 (Jesse within 24h). Only Tier 3 reaches Jesse |
| **Hours saved** | **1–3h per pilot** |

---

### Step 3.2 — HOLD Decision Resolution

| Attribute | Detail |
|---|---|
| Friction | **High** |
| Current state | When a legitimate action is unexpectedly held, operators contact Jesse to understand why and whether to release |
| Existing assets | `operator-action-service.ts` implements release capability; `troubleshooter` web app diagnoses |
| Gap | Clients do not know which HOLDs they can release themselves (using operator-action-service) vs. which require policy pack changes |
| Recommendation | Add a "HOLD response guide" to the operator documentation: if HOLD reason code is X, release authority belongs to the operator; if reason code is Y, escalate |
| **Hours saved** | **0.5–1h per incident** |

---

### Step 3.3 — Evidence Package Generation

| Attribute | Detail |
|---|---|
| Friction | **Medium** |
| Current state | Evidence bundles are auto-generated by `evidence-bundle-service.ts`. Jesse reviews and delivers to the client |
| Existing assets | `evidence-bundle-service.ts`, `generate-evidence-report.ts`, `auditor-view/` example |
| Gap | Clients cannot interpret the evidence bundle without Jesse explaining it. No "how to read your evidence package" guide exists |
| Recommendation | Create a 2-page "Evidence Package Reader's Guide". Partners should be able to review and deliver evidence packages independently at L2 |
| **Hours saved** | **1–2h per evidence review** |

---

### Step 3.4 — Pilot Sign-Off and Handoff

| Attribute | Detail |
|---|---|
| Friction | **Medium** |
| Current state | Jesse reviews pilot results, signs off on evidence, and handles the commercial handoff to production |
| Existing assets | `pilot-delivery-playbook.md` covers this but Jesse is still required for sign-off |
| Gap | No "pilot completion certificate" or formal handoff document that a partner can issue |
| Recommendation | Create a pilot completion checklist that a partner can complete and counter-sign. Jesse reviews only the final 1-page summary |
| **Hours saved** | **1–2h per pilot** |

---

**Phase 3 Total Friction (Current):** 5–10 founder hours
**Phase 3 Total Friction (Target):** 1–3 founder hours

---

## Founder Hours Summary

| Phase | Current (Hours) | Realistic Best (Hours) | Target (Hours) |
|---|---|---|---|
| Phase 1: Pre-Pilot | 4–7 | 2–4 | 1–2 |
| Phase 2: Setup | 6–12 | 3–6 | 1–3 |
| Phase 3: Operations | 5–10 | 3–5 | 1–3 |
| **Total per pilot** | **15–29** | **8–15** | **3–8** |

| Scenario | Total Hours |
|---|---|
| **Current state (June 2026)** | 15–29 hours |
| **Realistic near-term (docs consolidated, web app live)** | 10–18 hours |
| **After policy-pack wizard + partner certification** | 5–10 hours |
| **Target state (L2 partners delivering independently)** | 3–5 hours |

---

## Highest-Friction Steps (Priority Order)

| Rank | Step | Current Hours | Reduction Available | Unblocked By |
|---|---|---|---|---|
| 1 | Policy pack authoring | 2–4h | 2–4h | Policy-pack wizard |
| 2 | Operator training delivery | 1–2h | 1–2h | First partner certification |
| 3 | Evidence package review | 1–2h | 1–2h | Evidence reader's guide |
| 4 | Pilot scoping and pricing | 1–2h | 1–2h | Partner deal authority |
| 5 | Commercial negotiations | 1–2h | 0.5–1.5h | Standard pilot agreement |
| 6 | Client discovery call | 1–2h | 0.5–1h | Pre-call self-assessment |
| 7 | HOLD decision resolution | 1–3h/incident | 0.5–1.5h/incident | HOLD response guide |
| 8 | Integration validation | 0.5–1h | 0.5h | Integration health check |

**Single highest-leverage action:** Policy-pack wizard. Removes the single largest block of unscalable founder time and is the prerequisite for partner-delivered pilots.
