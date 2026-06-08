# Consistency Report
**CerbaSeal-Core v0.1.0 — Phase 9 Audit**
Generated: 2026-06-05

---

## Purpose

Identify inconsistencies in language, terminology, and claims across CerbaSeal documentation. Inconsistencies erode trust with reviewers, clients, and partners who read more than one document.

---

## Inconsistency 1: Pilot Readiness Verdict Language

**Problem:** The vocabulary for expressing whether a client is ready for a pilot is inconsistent across documents.

| Source | Language Used |
|---|---|
| `/assess` web app | READY / READY WITH SUPPORT / NOT READY |
| `docs/client-adoption/client-readiness-assessment.md` | "qualified" / "conditionally qualified" / "not recommended" |
| `docs/client-adoption/client-qualification-scorecard.md` | "suitable" / "unsuitable" / "requires review" |
| `CERBASEAL_PILOT_READINESS_BINDER.md` | "pilot-ready" / "pre-pilot remediation required" |
| `docs/pilot/pilot-readiness-brief.md` | "ready to proceed" / "not ready" |

**Impact:** A client who reads the readiness assessment docs and then uses the web app tool gets different verdict language. Partners cannot consistently communicate readiness status.

**Canonical:** Use the web app language everywhere. It is the most precise and the only interactive tool.

**Action:** Update all docs to use: **READY / READY WITH SUPPORT / NOT READY**

---

## Inconsistency 2: Deployment Mode Names

**Problem:** The three deployment modes are named differently across documents.

| Source | Mode Names |
|---|---|
| `docs/deployment/deployment-modes.md` | Mode A / Mode B / Mode C |
| `docs/09-deployment-model.md` | Hosted / Hybrid / Client-Controlled |
| `docs/deployment/mode-c-client-controlled.md` | "client-controlled" (unnamed modes A and B) |
| `docs/client-adoption/quickstart-deployment-guide.md` | "standard deployment" / "client deployment" |
| `CERBASEAL_PILOT_READINESS_BINDER.md` | "deployment mode" (unspecified which lettering) |

**Impact:** A partner reading one doc cannot correlate the mode name to a doc in a different subdirectory.

**Canonical:** Modes should always be referred to as **Mode A**, **Mode B**, and **Mode C**, with the descriptive name in parentheses on first use. Example: "Mode C (Client-Controlled)."

**Action:** Standardize all deployment references to Mode A / Mode B / Mode C.

---

## Inconsistency 3: Founder Attribution

**Problem:** The founder is referred to by different names in different contexts, creating confusion about whether these are the same person.

| Source | Attribution Used |
|---|---|
| `docs/FOUNDER-INDEPENDENCE-KIT.md` | "Jesse" |
| `docs/client-adoption/founder-dependency-reduction-plan.md` | "the founder" |
| `docs/operations/solo-support-risk-reduction.md` | "solo founder" |
| `docs/reports/FOUNDER_INDEPENDENCE_SESSION_SUMMARY.md` | "Jesse Lamont" |
| `/partner` web app | "Jesse" |
| `docs/client-adoption/support-boundaries.md` | "CerbaSeal team" |
| `cerbaseal-commercial-framework.pdf` | "Lamont Labs" |

**Impact:** Clients and partners reading multiple documents are uncertain whether "the founder," "Jesse," "Jesse Lamont," and "the CerbaSeal team" are the same entity. This is particularly confusing for EU clients who want to understand who has access to their data.

**Canonical:** Use **Jesse Lamont** on first reference in any document; **Jesse** on subsequent references within the same document. Use **Lamont Labs** as the corporate entity name. Do not use "CerbaSeal team" as an abstraction for what is currently one person.

---

## Inconsistency 4: Founder Hours per Pilot

**Problem:** Multiple documents give different estimates of how many hours Jesse spends per pilot.

| Source | Claim |
|---|---|
| `docs/FOUNDER-INDEPENDENCE-KIT.md` | "Target: 3–5 founder hours per pilot" |
| `docs/client-adoption/founder-dependency-reduction-plan.md` | "Current: 8–12 hours per pilot" |
| `docs/operations/solo-support-risk-reduction.md` | "Reduce to < 10 founder hours per pilot" |
| `docs/reports/FULL_AUDIT_REPORT_2026-06-04.md` | Various estimates |
| This audit (pilot-delivery-audit.md) | "Current: 15–29 hours; Target: 3–8 hours" |

**Impact:** Partners, clients, and investors reading multiple documents get conflicting signals about the product's current state. Some figures appear to be aspirational targets stated as current state.

**Canonical:** Use the figures from `docs/repo-audit/pilot-delivery-audit.md` (2026-06-05), which are the most recent and most decomposed estimates. Update all other documents that cite founder hour figures.

**Current (June 2026):** 15–29 hours per pilot
**Target:** 3–8 hours per pilot

---

## Inconsistency 5: Compliance Claims

**Problem:** EU AI Act and NIS2 compliance language varies across documents, with some making stronger claims than others.

| Source | Language |
|---|---|
| `docs/15-eu-deployment-posture.md` | "supports compliance with EU AI Act Article 9" |
| `docs/client-adoption/eu-ai-act-nis2-mapping-support.md` | "maps to EU AI Act requirements" |
| `docs/04-threat-model-lite.md` | (no EU compliance mention) |
| `cerbaseal-commercial-framework.pdf` | "supports EU AI Act compliance posture" |
| `docs/06-adversarial-integrity-report.md` | (no EU compliance mention) |

**Impact:** The deployment posture document makes the strongest claim ("supports compliance with...") while the threat model makes no claim. A reviewer reading both will note the inconsistency.

**Canonical:** Use the language from `eu-ai-act-nis2-mapping-support.md` — it is the most careful and defensible. CerbaSeal "supports compliance posture" for specific articles; it does not "ensure compliance" or "certify compliance."

**Standard language:** "CerbaSeal supports [client's] EU AI Act Article 9 compliance posture by providing cryptographically chained audit evidence of human approval before consequential AI actions."

---

## Inconsistency 6: Evidence Terminology

**Problem:** The output of the evidence generation system is referred to by different names.

| Source | Term Used |
|---|---|
| `src/services/evidence/evidence-bundle-service.ts` | "evidence bundle" |
| `docs/client-adoption/quickstart-deployment-guide.md` | "compliance report" |
| `docs/06-adversarial-integrity-report.md` | "audit evidence" |
| `docs/pilot/pilot-delivery-playbook.md` | "evidence package" |
| `docs/client-adoption/training/reviewer-guide.md` | "audit bundle" |
| `generate-evidence-report.ts` | "evidence report" |

**Impact:** When a client asks "where is my evidence package?" and the partner sends them an "audit bundle," the client isn't sure they received the right thing.

**Canonical:** Use **evidence bundle** (the term from the source code). Documents and UI should call it an "evidence bundle" consistently.

**Action:** Update all documentation to use "evidence bundle" as the canonical term.

---

## Inconsistency 7: "Production" vs. "Mode C"

**Problem:** Some documents describe the production deployment state as "Mode C" or "client-controlled deployment," others use "production deployment" generically.

| Source | Language |
|---|---|
| `docs/deployment/deployment-modes.md` | Mode A / B / C |
| `docs/client-adoption/pilot-delivery-playbook.md` | "production deployment" |
| `docs/17-pilot-boundary-and-client-binding.md` | "client-binding" |
| `CERBASEAL_PILOT_READINESS_BINDER.md` | "go live" |

**Canonical:** A pilot becomes "production" when it moves to Mode C (Client-Controlled) or is contractually binding. Both terms are valid — but documents should use Mode C on first reference so clients can find the right deployment documentation.

---

## Inconsistency 8: Support Model Description

**Problem:** The support model (what Jesse/Lamont Labs provides, what a client handles themselves) is described differently across docs.

| Source | Description |
|---|---|
| `docs/client-adoption/support-boundaries.md` | Detailed support scope with specific inclusions/exclusions |
| `docs/operations/solo-support-risk-reduction.md` | Frames support as a risk problem, not a scope problem |
| `docs/client-adoption/training/faq.md` | Answers support questions without referencing support-boundaries |
| `/troubleshoot` web app | Implies client self-service as the first step (correct) |

**Canonical:** Use `support-boundaries.md` as the single reference for support scope. All other documents should link to it rather than restating the terms.

---

## Inconsistency 9: Tier Numbering

**Problem:** Pilot tiers appear in some documents but not others, with inconsistent numbering where they do appear.

| Source | Tier Language |
|---|---|
| `/assess` web app | Tier 0 / Tier 1 / Tier 2 / Tier 3 / Tier 4 |
| `docs/client-adoption/pilot-sizing-and-pricing-framework.md` | Tier 1 / Tier 2 / Tier 3 / Tier 4 (no Tier 0) |
| `/partner` web app | L1 / L2 / L3 / L4 (partner certification levels) |
| `docs/client-adoption/train-the-trainer-program.md` | Level 1 / Level 2 / Level 3 |

**Impact:** The web app uses Tier 0–4 for client pilots; the pricing framework uses Tier 1–4 (no zero tier); the partner certification uses L1–L4. A reader cannot tell whether "Tier 2" means the same thing in each context.

**Canonical:**
- **Pilot tiers:** Tier 0 (validation), Tier 1 (single workflow), Tier 2 (multi-workflow), Tier 3 (department), Tier 4 (enterprise) — consistent with `/assess` web app
- **Partner certification levels:** L1 / L2 / L3 / L4 — use "L" prefix to distinguish from pilot tiers
- Update `pilot-sizing-and-pricing-framework.md` to include Tier 0

---

## Inconsistency 10: "Pilot" vs. "Production" Claims

**Problem:** Some documents state CerbaSeal is in "pilot" stage; others imply production readiness.

| Source | Claim |
|---|---|
| `docs/current_maturity.md` | "v0.1.0 — pilot readiness" |
| `cerbaseal-commercial-framework.pdf` | (describes production deployment scenarios) |
| `docs/06-adversarial-integrity-report.md` | Frames testing as production validation |
| `docs/positioning/external-positioning.md` | (positioning language varies) |
| Package version | `0.1.0` |

**Canonical:** CerbaSeal v0.1.0 is **pilot-ready**. The enforcement core is production-quality (431 passing tests, adversarial-validated, cryptographically chained audit), but the product is in active pilot delivery, not general availability.

**Standard language:** "CerbaSeal v0.1.0 is production-grade enforcement infrastructure in active pilot delivery. General availability follows successful pilot completion."

---

## Summary of Required Updates

| Inconsistency | Documents to Update | Priority |
|---|---|---|
| Readiness verdict language | client-readiness-assessment, qualification-scorecard, pilot-readiness-brief, binder | High |
| Deployment mode names | 09-deployment-model, quickstart-deployment-guide, binder, 5+ others | High |
| Founder attribution | support-boundaries, solo-support-risk-reduction, founder-dependency-reduction-plan | Medium |
| Founder hours estimates | FOUNDER-INDEPENDENCE-KIT, founder-dependency-reduction-plan, solo-support-risk | High |
| Compliance claim language | 15-eu-deployment-posture, commercial-framework | High |
| Evidence terminology | quickstart, adversarial-report, reviewer-guide, pilot-delivery-playbook | Medium |
| Production/Mode C | pilot-delivery-playbook, 17-pilot-boundary | Medium |
| Support model | faq, solo-support-risk-reduction | Low |
| Tier numbering | pilot-sizing-and-pricing-framework | High |
| Pilot vs. production claims | positioning, commercial-framework | High |

**Total documents requiring terminology updates:** ~20
**Recommendation:** Apply all high-priority updates as part of the documentation consolidation work (Phase 3). The merge-and-consolidate process is the right time to enforce consistent terminology across the new canonical documents.
