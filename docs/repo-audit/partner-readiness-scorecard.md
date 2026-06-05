# Partner Readiness Scorecard
**CerbaSeal-Core v0.1.0 — Phase 7 Audit**
Generated: 2026-06-05

---

## Purpose

Evaluate whether a consulting partner — who has gone through available partner enablement — can sell, scope, onboard, support, and deliver a CerbaSeal pilot without Jesse Lamont's direct involvement.

Each capability is scored 0–100.

---

## Scoring Rubric

| Score | Meaning |
|---|---|
| 90–100 | Partner can do this independently with existing assets |
| 70–89 | Partner can mostly do this; one or two questions require Jesse |
| 50–69 | Partner can start but typically escalates to Jesse mid-process |
| 30–49 | Partner requires Jesse involvement on most engagements |
| 0–29 | Jesse is the only delivery mechanism; partners cannot help |

---

## What a "Ready Partner" Looks Like

A ready partner, at minimum, can:
1. Pre-qualify a prospect without a Jesse call
2. Scope and price a Tier 0–2 pilot without Jesse
3. Deliver an onboarding session and policy pack without Jesse
4. Handle first-line operational support without escalating every ticket
5. Deliver an evidence package to the client's auditors without Jesse

Currently, no partner can do all five of these things. This scorecard measures how close the infrastructure is to enabling them.

---

## Category 1: Selling CerbaSeal

**"Can a partner confidently sell CerbaSeal to a new prospect?"**

### Score: **52 / 100**

**What exists:**
- `cerbaseal-pricing-brief.pdf` — pricing structure, tier definitions
- `cerbaseal-commercial-framework.pdf` — full commercial context
- `docs/client-adoption/client-discovery-script.md` — discovery call script
- `docs/client-adoption/frequently-asked-objections.md` — objection handling (250 lines)
- `docs/client-adoption/eu-ai-act-nis2-mapping-support.md` — EU regulatory angle
- `docs/positioning/external-positioning.md` — positioning framework
- `docs/positioning/cerbaseal-brand-system.md` — brand guidance

**What is missing:**
- No partner-specific sales deck or pitch guide (existing materials are CEO-voice, not partner-voice)
- No "how to introduce CerbaSeal in your practice" guide for partners
- No demo environment partners can show without Jesse configuring it
- Partners cannot run the web app demo independently (it requires the enforcement server)
- No standard discovery call agenda that maps prospect answers to recommended tier

**Specific failure:** A partner at a consulting firm wants to include CerbaSeal in a proposal. They have the pricing brief but no framing document that explains how CerbaSeal fits into the partner's existing practice narrative.

**Improvement path:**
- Create a 1-page partner sales brief: "How to introduce CerbaSeal to your AI governance clients"
- The web app (`/assess` + `/partner`) is fully self-running and partner-shareable today — this is a quick win
- Define a standard discovery call agenda: prospect answers 5 questions → maps to recommended tier

---

## Category 2: Scoping Pilots

**"Can a partner define the scope, timeline, and price of a pilot?"**

### Score: **35 / 100**

**What exists:**
- `docs/client-adoption/pilot-sizing-and-pricing-framework.md` (331 lines) — comprehensive
- `docs/client-adoption/workflow-mapping-workbook.md` (380 lines) — workflow mapping
- `CERBASEAL_PILOT_READINESS_BINDER.md` — complete pilot readiness reference
- `/pilot` web app page — generates a pilot plan from a form

**What is missing:**
- The pricing framework is written for Jesse, not for a partner to apply
- No tiered authority table: what scope/price can a partner commit without Jesse?
- The pilot plan generator (`/pilot` page) produces a great output but partners need authorization to present that plan as binding
- Workflow mapping output does not automatically translate into a configuration quote

**Specific failure:** A partner completes a workflow mapping with the client. The workbook is filled in, but the partner has no way to convert that into a policy pack specification or a concrete price quote. They call Jesse.

**Improvement path:**
- Define partner deal authorities: L2 partner can commit to Tier 0–2 scope; Tier 3+ requires Jesse review
- Convert the pricing framework into a partner-facing quoting form (4 inputs → price range)
- The `/pilot` web app already generates a structured plan — add a "submit for approval" flow for partners

---

## Category 3: Onboarding Clients

**"Can a partner deliver client onboarding and initial deployment?"**

### Score: **38 / 100**

**What exists:**
- `quickstart-deployment-guide.md` (325 lines) — detailed
- `train-the-trainer-program.md` (245 lines) — program description
- `client-admin-guide.md` (256 lines) — admin guide
- Multiple deployment docs (though fragmented)
- `/training` web app — partner can walk clients through training modules

**What is missing:**
- **No partner has been certified.** The train-the-trainer program exists as a document but has not been run. Zero certified L2 partners exist.
- Policy pack authoring is entirely Jesse-dependent (see Category 5)
- No "partner onboarding kit" — a single package with everything a partner needs to deliver their first client onboarding
- Partners cannot validate that a deployment is correct (no go/no-go checklist for partners)

**Specific failure:** A partner has done everything right — the client is qualified, the environment is deployed — but the policy pack hasn't been authored. Everything stops. Jesse needs 2–4 hours. The partner has to wait.

**Improvement path:**
- Run the train-the-trainer session for the first partner cohort
- Create a "partner onboarding kit" — a single ZIP or document bundle with everything needed for a first client engagement
- Policy-pack wizard (see founder-dependency-audit.md) removes the blocking dependency

---

## Category 4: Supporting Clients

**"Can a partner handle client support issues without escalating to Jesse?"**

### Score: **45 / 100**

**What exists:**
- `support-boundaries.md` (199 lines) — defines what is and isn't supported
- `troubleshooting-guide.md` (361 lines) — comprehensive error reference
- `/troubleshoot` web app — guided decision tree for common issues
- `diagnostic-report-service.ts` — programmatic diagnostics
- Reason codes are documented and machine-readable

**What is missing:**
- No formal support tier system (Tier 1 / Tier 2 / Tier 3) with explicit escalation criteria
- Partners do not know which issues they are expected to resolve vs. which require Jesse
- No SLA framework for partner-tier support (response time commitments)
- HOLD resolution authorization is not documented — partners don't know which holds operators can release
- No partner support runbook

**Specific failure:** A client reports that a legitimate payment is being HELD. The partner knows to use the troubleshooter, diagnoses the issue as a policy pack misconfiguration, but does not know if they are authorized to modify the policy pack or must involve Jesse.

**Improvement path:**
- Define three support tiers with explicit escalation criteria and response times
- HOLD release authorization matrix: which reason codes can a partner authorize a release for?
- Create a "Partner Support Runbook" (2–3 pages) covering the 10 most common issues

---

## Category 5: Delivering Evidence Packages

**"Can a partner review, interpret, and deliver an evidence package to a client's auditors?"**

### Score: **25 / 100**

**What exists:**
- `evidence-bundle-service.ts` auto-generates compliant bundles
- `generate-evidence-report.ts` produces a readable PDF
- `examples/auditor-view/` shows the evidence structure
- `docs/reports/adversarial/` provides third-party validation support

**What is missing:**
- No "Evidence Package Reader's Guide" for partners or clients
- Partners cannot explain what each section means
- No training for partners on how to present evidence to an auditor
- EU AI Act mapping is not integrated into the evidence bundle output
- Partners have no authority to sign off on evidence packages — Jesse is currently the only person who can deliver evidence to a client's auditors

**Specific failure:** A client's internal audit team receives the evidence bundle. They ask the partner three questions about what the chain hash means. The partner doesn't know and calls Jesse.

**Improvement path:**
- Evidence Package Reader's Guide — 2 pages, written for a non-technical auditor
- Add an "evidence package briefing" module to the `/training` web app
- Define evidence delivery authority for L3 partners

---

## Category 6: Operating Independently

**"Can a partner manage an ongoing client relationship without Jesse?"**

### Score: **22 / 100**

**What exists:**
- Partner enablement kit described in `/partner` web app
- Certification path described (L1–L4) in the web app
- `train-the-trainer-program.md` defines the program
- `docs/operations/solo-support-risk-reduction.md` acknowledges the gap

**What is missing:**
- **No certified partners.** The certification path exists as a description, not as an implemented program.
- No partner portal or partner agreement
- No quarterly business review process or cadence between Jesse and partners
- Partners cannot independently renew client contracts or expand scope
- No partner knowledge base or community

**This is the lowest score in the partner audit because no partner currently exists who can operate independently.**

**Improvement path:**
- Run the first partner certification session (L1 → L2 pathway)
- Create a minimal partner agreement that defines rights, responsibilities, and deal authorities
- Define a monthly partner check-in cadence
- L1 → L2 certification is achievable in 1–2 days per partner

---

## Overall Partner Scorecard

| Category | Score | Primary Gap |
|---|---|---|
| 1. Selling | 52 / 100 | No partner-voice pitch guide; no shareable demo |
| 2. Scoping pilots | 35 / 100 | No deal authority definition; pricing framework is Jesse-facing |
| 3. Onboarding clients | 38 / 100 | No certified partners; no partner onboarding kit; policy-pack dependency |
| 4. Supporting clients | 45 / 100 | No formal support tiers; no HOLD authorization guide |
| 5. Delivering evidence | **25 / 100** | **No evidence reader's guide; no partner authority for evidence sign-off** |
| 6. Operating independently | **22 / 100** | **No certified partners; no implemented certification program** |
| **Overall Average** | **36 / 100** | |

---

## Critical Path to Partner Readiness

The partner readiness score is constrained by three interlocked dependencies:

```
Certified Partner
  ← Partner Certification Session (Jesse delivers once)
    ← Partner Onboarding Kit (documents to deliver)
      ← Policy-Pack Wizard (removes the blocking dependency)
        ← Canonical policy-pack templates
```

Without the policy-pack wizard, partners cannot deliver onboarding. Without onboarding, certification has no practical meaning. Without certification, the partner score stays near 30.

**Immediate actions to raise partner score above 60:**

| Action | Score Impact | Effort |
|---|---|---|
| Policy-pack wizard | +15 pts across categories | High (1–2 weeks) |
| Partner onboarding kit | +10 pts | Low (2 days) |
| Evidence reader's guide | +10 pts | Low (half day) |
| Support tier definition | +8 pts | Low (half day) |
| Partner deal authority definition | +8 pts | Low (half day) |
| First partner certification session | +5 pts (structural) | Medium (1 day prep) |

**Target partner score with actions above: 60–70 / 100**

**Target partner score (fully scaled): 85 / 100**
