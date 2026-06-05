# Documentation Consolidation Plan
**CerbaSeal-Core v0.1.0 — Phase 3 Audit**
Generated: 2026-06-05

---

## Problem Statement

The repository contains approximately 100 markdown files across 15 subdirectories. The same topics — deployment, onboarding, pilot delivery, training, threat model, boundaries — appear in 3 to 5 different documents each. This creates four specific problems:

1. **Navigation failure.** A new client, partner, or reviewer cannot find the right document without asking.
2. **Update divergence.** When something changes, not all copies get updated.
3. **Trust erosion.** When documents contradict each other, readers stop trusting any of them.
4. **Maintenance burden.** Jesse has to maintain multiple versions of the same content.

The goal is one authoritative document per topic. Other documents either merge into it or are archived.

---

## Consolidation Zones

### Zone 1: Reviewer Entry Point (currently 3 documents → 1)

**Problem:** `00-external-reviewer-brief.md`, `00-quick-review-walkthrough.md`, and `00-reviewer-start-here.md` all serve the same "reviewer just arrived" use case.

**Target state:**
```
docs/00-reviewer-guide.md    ← merged canonical entry point
```

**Content to merge:**
- From `00-reviewer-start-here.md`: what to look for, review structure
- From `00-external-reviewer-brief.md`: external reviewer context, what CerbaSeal claims
- From `00-quick-review-walkthrough.md`: step-by-step walkthrough (keep as Section 3)

**Archive:**
- `docs/00-reviewer-start-here.md`
- `docs/00-external-reviewer-brief.md`

**Keep as renamed:**
- `docs/00-reviewer-guide.md` (merged)
- `docs/00-quick-review-walkthrough.md` (walkthrough companion — keep separately as it serves a distinct navigational function)

---

### Zone 2: Architecture and Boundary Definitions (currently 6 documents → 2)

**Problem:** `bounded-autonomy-model.md`, `execution_boundary.md`, `system_boundary.md`, `trust_boundaries.md`, `09-trust-boundary-and-limitations.md`, and `architecture/enforcement-boundary.md` all describe where CerbaSeal's authority begins and ends.

**Target state:**
```
docs/architecture/enforcement-model.md   ← master architecture document
docs/architecture/trust-boundaries.md   ← trust and limitation definition
```

**Content mapping:**
- `bounded-autonomy-model.md` → merge into `enforcement-model.md` (core section)
- `execution_boundary.md` → merge into `enforcement-model.md` (execution section)
- `system_boundary.md` → merge into `enforcement-model.md` (scope section)
- `architecture/enforcement-boundary.md` → merge into `enforcement-model.md`
- `trust_boundaries.md` → merge into `trust-boundaries.md`
- `09-trust-boundary-and-limitations.md` → merge into `trust-boundaries.md`

**Archive:** All 6 source documents after merge.

---

### Zone 3: Adversarial and Security Reports (currently 3 documents → 2)

**Problem:** `06-adversarial-integrity-report.md` (208 lines) and `06-adversarial-validation-summary.md` (132 lines) cover the same adversarial test results with different framing. `06-runtime-layer-stack.md` has an incorrect prefix number.

**Target state:**
```
docs/06-adversarial-integrity-report.md   ← master (absorbs summary)
docs/architecture/runtime-layer-stack.md  ← moved out of numbered series
```

**Action:**
- Append the "validation summary" section from `06-adversarial-validation-summary.md` as a summary appendix in `06-adversarial-integrity-report.md`.
- Move `06-runtime-layer-stack.md` to `docs/architecture/runtime-layer-stack.md` (no number prefix — it is architectural reference, not a review document).

**Archive:** `06-adversarial-validation-summary.md`, `06-runtime-layer-stack.md` (after content move).

---

### Zone 4: Deployment Documentation (currently 8 documents → 2)

**Problem:** Deployment instructions appear in `docs/09-deployment-model.md`, `docs/deployment/deployment-modes.md`, `docs/deployment/runbook.md`, `docs/client-adoption/quickstart-deployment-guide.md`, `docs/client-adoption/onboarding-sequence.md`, `docs/deployment/mode-c-client-controlled.md`, `docs/deployment/eu-pilot-deployment-posture.md`, and `docs/15-eu-deployment-posture.md`.

**Target state:**
```
docs/deployment/deployment-guide.md    ← canonical unified deployment guide
docs/deployment/runbook.md             ← keep separately (operational reference)
```

**Content mapping for deployment-guide.md:**

```
Section 1: Deployment Modes (A/B/C) — from deployment-modes.md + 09-deployment-model.md
Section 2: Standard Deployment (Mode B) — from quickstart-deployment-guide.md
Section 3: Client-Controlled Deployment (Mode C) — from mode-c-client-controlled.md
Section 4: EU Deployment Posture — from eu-pilot-deployment-posture.md
Section 5: Pre-Launch Checklist — from pilot-deployment-checklist.md
```

**Archive:**
- `docs/09-deployment-model.md`
- `docs/15-eu-deployment-posture.md`
- `docs/deployment/deployment-modes.md`
- `docs/deployment/mode-c-client-controlled.md`
- `docs/deployment/eu-pilot-deployment-posture.md`
- `docs/deployment/pilot-deployment-checklist.md` (content moves into Section 5)
- `docs/client-adoption/onboarding-sequence.md`

**Keep separate:**
- `docs/deployment/runbook.md` — operational runbook belongs separate for on-call use
- `docs/client-adoption/quickstart-deployment-guide.md` — keep as a lean "first 30 minutes" doc that links to the full guide

---

### Zone 5: Pilot Delivery (currently 7 documents → 2)

**Problem:** Pilot delivery guidance is spread across `pilot-delivery-playbook.md`, `pilot-success-framework.md`, `pilot-intake-checklist.md`, `pilot-readiness-brief.md`, `pilot-operations-model.md`, `pilot-safe-mode.md`, and `CERBASEAL_PILOT_READINESS_BINDER.md`.

**Target state:**
```
CERBASEAL_PILOT_READINESS_BINDER.md    ← master pre-pilot document (external-facing)
docs/client-adoption/pilot-delivery-playbook.md  ← master in-pilot document (internal)
docs/pilot/pilot-intake-checklist.md            ← keep as standalone checklist
```

**Content mapping:**

Into `CERBASEAL_PILOT_READINESS_BINDER.md`:
- Absorb `docs/pilot/pilot-readiness-brief.md`

Into `pilot-delivery-playbook.md`:
- Absorb `docs/client-adoption/pilot-success-framework.md` (success criteria section)
- Absorb key content from `docs/pilot-operations-model.md`
- Absorb `docs/operations/pilot-safe-mode.md` (as an appendix)

**Archive:**
- `docs/pilot/pilot-readiness-brief.md`
- `docs/client-adoption/pilot-success-framework.md`
- `docs/pilot-operations-model.md`
- `docs/operations/pilot-safe-mode.md`

---

### Zone 6: Training Materials (currently 10 documents → web app + 1 reference)

**Problem:** Training content exists in 8 docs in `docs/client-adoption/training/`, partially duplicated in `docs/client-adoption/client-admin-guide.md`, `docs/client-adoption/train-the-trainer-program.md`, and partially superseded by the live `/training` web app.

**Target state:**
```
/training (web app)                              ← primary self-service training
docs/client-adoption/training-reference.md       ← offline reference doc (merged)
docs/client-adoption/train-the-trainer-program.md ← keep as partner program doc
```

**Content mapping for training-reference.md:**
- Executive overview content from `10-minute-executive-overview.md`
- Operator content from `operator-guide.md` + `30-minute-onboarding-agenda.md`
- Admin content from `admin-guide.md` (merge with `client-admin-guide.md`)
- FAQ from `faq.md`
- Getting started from `getting-started-guide.md`
- Reviewer guide from `reviewer-guide.md`

**Archive:** All 8 individual training files, `client-admin-guide.md`

**Keep separate:** `train-the-trainer-program.md` — distinct document for partner enablement.

---

### Zone 7: Client Adoption / Onboarding (currently 6 documents → 3)

**Problem:** `client-discovery-script.md`, `frequently-asked-objections.md`, `eu-ai-act-nis2-mapping-support.md`, `client-readiness-assessment.md`, `client-qualification-scorecard.md`, and `support-boundaries.md` all address the pre-sale and early adoption phase.

**Target state:**
```
docs/client-adoption/client-discovery-script.md    ← KEEP (sales tool)
docs/client-adoption/frequently-asked-objections.md ← KEEP (sales tool)
docs/client-adoption/eu-ai-act-nis2-mapping-support.md ← KEEP (compliance tool)
docs/client-adoption/support-boundaries.md         ← KEEP (contract reference)
```

**Archive:**
- `docs/client-adoption/client-readiness-assessment.md` → superseded by `/assess`
- `docs/client-adoption/client-qualification-scorecard.md` → superseded by `/assess`

---

### Zone 8: Founder Independence (currently 3 documents → 1)

**Target state:**
```
docs/FOUNDER-INDEPENDENCE-KIT.md    ← canonical independence roadmap
```

**Archive:**
- `docs/client-adoption/founder-dependency-reduction-plan.md` → content merged into kit
- `docs/reports/FOUNDER_INDEPENDENCE_SESSION_SUMMARY.md` → session notes, not reusable

---

### Zone 9: Line Axia — Remove From Main Tree

All Line Axia bespoke content (call summaries, PDFs, bespoke scripts) should be in `archive/line-axia/`, not in the main documentation tree. See duplicate-analysis.md for full list.

---

## Document Numbering Reform

The numbered doc scheme (00-17, with gaps and collisions) was designed for a sequential reviewer walk-through but has grown unwieldy. Recommended approach:

**Keep numbered series for reviewer-facing docs:**
```
docs/00-reviewer-guide.md          (reviewer entry)
docs/01-system-definition.md       (what CerbaSeal is)
docs/02-scope-boundary.md          (what it covers)
docs/03-architecture-diagram.md    (how it works)
docs/04-threat-model-lite.md       (security posture)
docs/05-non-goals.md               (what it does not do)
docs/06-adversarial-integrity-report.md  (validation evidence)
docs/07-diagnostic-support-model.md     (support model)
docs/10-review-scope-clarification.md   (scope limits)
docs/13-non-bypassability-model.md      (bypass-resistance)
docs/17-pilot-boundary-and-client-binding.md  (pilot binding)
```

**Move all non-reviewer docs out of numbered series:**
```
docs/architecture/     ← technical reference
docs/deployment/       ← deployment reference
docs/client-adoption/  ← commercial/onboarding
docs/pilot/            ← pilot operations
docs/security/         ← security reference
```

Remove: duplicate numbered variants (06b, 07b, 09b after renaming).

---

## Resulting Document Count

| Zone | Before | After | Reduction |
|---|---|---|---|
| Reviewer entry | 3 | 2 | -1 |
| Architecture/boundary | 6 | 2 | -4 |
| Adversarial/security | 3 | 2 | -1 |
| Deployment | 8 | 3 | -5 |
| Pilot delivery | 7 | 3 | -4 |
| Training | 10 | 3 | -7 |
| Client adoption | 6 | 4 | -2 |
| Founder independence | 3 | 1 | -2 |
| Line Axia (archive) | 12 | 0 | -12 |
| **Total** | **58** | **20** | **-38** |

This is a 65% reduction in active documentation files in the zones covered. The remaining ~40 files outside these zones are either specialized enough to keep as-is or are code/config rather than documentation.

---

## Single Source of Truth Map

After consolidation, the canonical location for each topic:

| Topic | Canonical Document |
|---|---|
| What CerbaSeal is | `docs/01-system-definition.md` |
| Architecture and enforcement model | `docs/architecture/enforcement-model.md` |
| Trust boundaries | `docs/architecture/trust-boundaries.md` |
| Threat model | `docs/04-threat-model-lite.md` |
| Non-goals | `docs/05-non-goals.md` |
| Adversarial validation | `docs/06-adversarial-integrity-report.md` |
| Deployment (all modes) | `docs/deployment/deployment-guide.md` |
| Runbook (operations) | `docs/deployment/runbook.md` |
| Pilot delivery | `docs/client-adoption/pilot-delivery-playbook.md` |
| Pilot binder (external) | `CERBASEAL_PILOT_READINESS_BINDER.md` |
| Client training | `/training` web app |
| Training reference (offline) | `docs/client-adoption/training-reference.md` |
| Onboarding quickstart | `docs/client-adoption/quickstart-deployment-guide.md` |
| Readiness assessment | `/assess` web app |
| Troubleshooting | `/troubleshoot` web app |
| Partner enablement | `/partner` web app |
| Founder independence | `docs/FOUNDER-INDEPENDENCE-KIT.md` |
| Governance vocabulary | `docs/governance-vocabulary.md` |
| EU compliance mapping | `docs/client-adoption/eu-ai-act-nis2-mapping-support.md` |
| Pricing/commercial | `cerbaseal-pricing-brief.pdf` + `docs/client-adoption/pilot-sizing-and-pricing-framework.md` |
