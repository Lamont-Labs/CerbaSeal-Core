# CerbaSeal — Founder Dependency Reduction Plan

**Purpose:** Map every current founder dependency, its mitigation, and its current status.  
**Owner:** Jesse Lamont / Lamont Labs  
**Updated:** 2026-06-05  
**Version:** 0.1.0

---

## The Problem Statement

CerbaSeal can only scale if it can be delivered without requiring Jesse Lamont on every step.

Jesse works full-time elsewhere. He operates in a different timezone from Line Axia and most EU clients. He has bounded support hours. He cannot be the answer to every question a pilot client asks.

The goal of this plan is not to remove Jesse from the picture. It is to ensure Jesse only participates at the specific moments where his expertise creates irreplaceable value — and that everything else is handled by documentation, tools, and Line Axia.

**Target state:**  
> A pilot can be sold, qualified, onboarded, deployed, trained, and supported with Jesse participating only at technical validation moments.

---

## Dependency Map — All 8 Layers

### Layer 1 — Sales Independence

**The dependency:** Line Axia cannot explain or position CerbaSeal without Jesse on the call.

**Why it's a problem:** Every prospect introduction requires scheduling across timezones. Sales velocity is capped at Jesse's calendar availability.

**Target state:** Line Axia runs all first calls, discovery, and qualification without Jesse. Jesse joins only at technical validation if the client requests it.

| Mitigation | Status | Artifact |
|---|---|---|
| 30-second and 2-minute explanation scripts | ✓ Done | `line-axia-partner-enablement-pack.md` |
| Objection handling guide | ✓ Done | `line-axia-partner-enablement-pack.md` + `frequently-asked-objections.md` |
| Client discovery script (full call guide) | ✓ Done | `client-discovery-script.md` |
| Qualification scorecard (Green/Yellow/Red) | ✓ Done | `client-qualification-scorecard.md` |
| Pilot sizing guide | ✓ Done | `pilot-sizing-and-pricing-framework.md` |
| "When to bring Jesse" decision rule | ✓ Done | `line-axia-partner-enablement-pack.md` |

**Remaining dependency:** Jesse must be available for deep technical validation sessions if a technically sophisticated client insists. Mitigation: documentation-first; most technical questions answerable from the repo itself.

---

### Layer 2 — Onboarding Independence

**The dependency:** Every pilot starts from a blank page. Jesse facilitates workflow mapping.

**Why it's a problem:** Jesse cannot facilitate every client's workflow mapping session across every timezone. It doesn't scale.

**Target state:** Line Axia facilitates workflow mapping using the workbook. Jesse is not needed.

| Mitigation | Status | Artifact |
|---|---|---|
| Workflow mapping workbook (A–M sections) | ✓ Done | `workflow-mapping-workbook.md` |
| Pre-built governance templates | ✓ Done | `templates/` (4 templates) |
| Client readiness assessment | ✓ Done | `client-readiness-assessment.md` |
| Train-the-trainer program for Line Axia | ✓ Done | `train-the-trainer-program.md` |
| Configuration worksheets in workbook | ✓ Done | `workflow-mapping-workbook.md` → CerbaSeal Field Map |

**Remaining dependency:** Line Axia still needs the first 1–2 workbook sessions with Jesse present to build confidence. After that, they run independently.

---

### Layer 3 — Deployment Independence

**The dependency:** Client cannot deploy without Jesse walking them through it.

**Why it's a problem:** Jesse cannot be available for every deployment session. Time zones, day job, support hour limits.

**Target state:** Client's technical owner can deploy from documentation alone. Jesse is available only for issues outside the troubleshooting guide.

| Mitigation | Status | Artifact |
|---|---|---|
| Quickstart deployment guide (3 time-boxed paths) | ✓ Done | `quickstart-deployment-guide.md` |
| Step-by-step runbook with verification commands | ✓ Done | `docs/deployment/runbook.md` |
| Pilot deployment checklist | ✓ Done | `docs/deployment/pilot-deployment-checklist.md` |
| Client admin guide (admin responsibilities) | ✓ Done | `client-admin-guide.md` |
| Support boundaries (when to escalate vs self-resolve) | ✓ Done | `support-boundaries.md` |

**Remaining dependency:** Some client environments (unusual OS configurations, corporate proxies, non-standard Node.js setups) may require Jesse involvement. Mitigation: troubleshooting guide covers most cases; escalation path defined.

---

### Layer 4 — Training Independence

**The dependency:** Training requires a live session with Jesse.

**Why it's a problem:** Jesse cannot run training for every role at every client. Doesn't scale past 2 pilots.

**Target state:** Client self-trains from the training kit. Line Axia runs a facilitated onboarding session using the agenda (no Jesse required).

| Mitigation | Status | Artifact |
|---|---|---|
| 10-minute executive overview (self-directed) | ✓ Done | `training/10-minute-executive-overview.md` |
| 30-minute onboarding agenda (Line Axia facilitates) | ✓ Done | `training/30-minute-onboarding-agenda.md` |
| Operator guide (role-specific, self-directed) | ✓ Done | `training/operator-guide.md` |
| Reviewer guide (self-directed) | ✓ Done | `training/reviewer-guide.md` |
| Admin guide (technical admin, self-directed) | ✓ Done | `training/admin-guide.md` |
| Getting started guide (all audiences) | ✓ Done | `training/getting-started-guide.md` |
| FAQ (self-service answers) | ✓ Done | `training/faq.md` |
| Train-the-trainer program (Line Axia delivers training) | ✓ Done | `train-the-trainer-program.md` |

**Remaining dependency:** Initial pilot onboarding may benefit from Jesse on the first call for the first client. After that, Line Axia uses the 30-minute agenda independently.

---

### Layer 5 — Operational Independence

**The dependency:** When something happens in production, the client's first instinct is to ask Jesse.

**Why it's a problem:** Jesse is not available 24/7. Support hours are bounded. The client should be able to diagnose and self-resolve most operational events.

**Target state:** The system surfaces its own diagnostic information. Clients resolve 80% of events without contacting support.

| Mitigation | Status | Artifact |
|---|---|---|
| Diagnostic reporting service (`pnpm demo:support`) | ✓ Built | `src/services/` |
| Health check service | ✓ Built | Support readiness layer |
| Integrity verification (`pnpm verify:proof`) | ✓ Built | `scripts/verify-proof.ts` |
| System status reporting | ✓ Built | Browser portal `/security` |
| Troubleshooting guide (symptom-indexed) | ✓ Done | `troubleshooting-guide.md` |
| Reason codes on all REJECT outcomes | ✓ Built | `execution-gate-service.ts` |
| Common errors and fixes (quick reference) | ✓ Done | `training/common-errors-and-fixes.md` |

**Remaining dependency:** `GATE_INTERNAL_REJECT` events require Jesse involvement. Mitigation: these should be rare; the fail-closed behavior makes them safe even if not immediately resolved.

---

### Layer 6 — Support Independence

**The dependency:** Clients ask support questions only Jesse can answer.

**Why it's a problem:** Every support interaction that requires Jesse consumes bounded hours and creates a timezone bottleneck.

**Target state:** Line Axia handles Tier 1 support (general questions, documentation guidance). Jesse handles only Tier 3 (code-level issues, unexpected invariant behavior).

| Mitigation | Status | Artifact |
|---|---|---|
| Support boundaries document (what's in/out) | ✓ Done | `support-boundaries.md` |
| Support decision tree (route questions without founder) | ✓ Done | `support-boundaries.md` |
| FAQ (self-service for common questions) | ✓ Done | `training/faq.md` |
| Common errors and fixes | ✓ Done | `training/common-errors-and-fixes.md` |
| Troubleshooting guide | ✓ Done | `troubleshooting-guide.md` |
| Tiered escalation path | ✓ Done | All support docs |

**Remaining dependency:** Novel issues not covered by any guide require Jesse. Mitigation: every novel issue should be documented and added to the knowledge base so it becomes covered.

---

### Layer 7 — Knowledge Independence

**The dependency:** Support knowledge lives only in Jesse's head.

**Why it's a problem:** If Jesse is unavailable, questions go unanswered. No compounding effect — every answer disappears after each call.

**Target state:** Every question asked during pilots gets documented. Knowledge accumulates in the system, not in one person's memory.

| Mitigation | Status | Artifact |
|---|---|---|
| FAQ (seeded with common questions) | ✓ Done | `training/faq.md` |
| Common errors and fixes | ✓ Done | `training/common-errors-and-fixes.md` |
| Governance vocabulary | ✓ Existing | `docs/governance-vocabulary.md` |
| Frequently asked objections | ✓ Done | `frequently-asked-objections.md` |
| Troubleshooting guide (indexed by symptom) | ✓ Done | `troubleshooting-guide.md` |
| **Pilot learning log (to be created after Pilot 1)** | ⏳ Pending | Create after first pilot |
| **Knowledge base (to grow with each pilot)** | ⏳ Pending | Accumulate from pilot Q&A |

**Remaining dependency:** No structured process yet for capturing questions asked during the pilot and converting them into documentation. This is a post-Pilot-1 deliverable.

---

### Layer 8 — Founder Replacement Test

**The dependency:** No one has tested whether a third party could run a pilot without Jesse.

**Why it's a problem:** If this hasn't been tested, the founder dependency claim is theoretical, not proven.

**Target state:** After Pilot 1, conduct a debrief to measure: how many hours did Jesse actually contribute? Which interactions were unavoidable? Which could have been handled by documentation?

| Mitigation | Status | Artifact |
|---|---|---|
| Pilot delivery playbook (week-by-week delivery guide) | ✓ Done | `pilot-delivery-playbook.md` |
| Post-pilot review framework | ✓ Done | `pilot-success-framework.md` |
| Lamont Labs success metrics (support burden within hours) | ✓ Done | `pilot-success-framework.md` |
| **Founder hour tracking during Pilot 1** | ⏳ Pending | Track actual hours by layer during first pilot |
| **Debrief: actual vs. expected dependencies** | ⏳ Pending | Post-Pilot-1 debrief |

---

## Current Status Summary

| Layer | Dependency | Mitigation Status |
|---|---|---|
| 1. Sales | Line Axia needs Jesse for calls | ✓ Mitigated |
| 2. Onboarding | Every pilot starts from scratch | ✓ Mitigated |
| 3. Deployment | Client cannot deploy without Jesse | ✓ Mitigated |
| 4. Training | Training requires Jesse | ✓ Mitigated |
| 5. Operations | Clients call Jesse when something happens | ✓ Mitigated (diagnostic tooling) |
| 6. Support | Jesse answers support questions | ✓ Mitigated (tiered support) |
| 7. Knowledge | Knowledge in Jesse's head only | ✓ Partially mitigated — accumulation process pending |
| 8. Test | Untested dependency reduction | ⏳ Pending Pilot 1 |

---

## What Remains Genuinely Jesse-Dependent

After all mitigations, these interactions genuinely require Jesse:

| Interaction | Why Jesse | Frequency Estimate |
|---|---|---|
| Novel bug in enforcement core | Only Jesse can fix the source code | Very rare |
| `GATE_INTERNAL_REJECT` investigation | Code-level diagnosis | Very rare |
| New workflow class not covered by templates | Requires code change | Per-pilot, once |
| Custom authority class request | Requires code change | Per-pilot, once |
| Technical validation for a sophisticated technical buyer | Credibility in deep technical conversations | Per prospect, once |
| Commercial agreement terms | Jesse is a named party | Once per pilot |

**Target:** Jesse involvement averages ≤ 4 hours per pilot for a well-prepared Tier 2 engagement.

---

## Handoff Strategy

The handoff strategy is sequenced:

**Before Pilot 1:** All documentation exists. Line Axia has read the enablement pack and train-the-trainer program.

**During Pilot 1:** Jesse participates fully. Every interaction is observed and documented. Time is tracked by layer.

**After Pilot 1 debrief:** Gaps in documentation are identified from actual questions asked. Those gaps are filled.

**Before Pilot 2:** Line Axia runs the onboarding and training without Jesse present. Jesse is on standby for technical questions only.

**After Pilot 2:** Jesse's involvement is measured against Pilot 1. Target: 50% reduction in Jesse hours.

**Before Pilot 3:** Jesse participates only at technical validation and any code-level issues. Line Axia handles everything else.

---

## The Metric That Matters

> **Jesse hours per pilot, by layer.**

Track this from Pilot 1. The target is not zero — it is a number that is compatible with Jesse's full-time job, timezone constraints, and personal sustainability.

A sustainable Jesse contribution per pilot is approximately:
- **4–8 hours** for a well-prepared Tier 2 pilot
- **8–16 hours** for a first pilot with a technically demanding client

Anything above 16 hours for a single pilot is a scope control problem, not a Jesse problem.
