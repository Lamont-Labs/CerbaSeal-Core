# CerbaSeal — Pilot Sizing and Pricing Framework

**Audience:** Line Axia (commercial planning) and Lamont Labs  
**Purpose:** Support pricing discussions with working ranges. Define pilot tiers, scope, and pricing factors.  
**Version:** 0.1.0  
**Status:** Working price ranges established — for commercial planning. No prices are committed. Final pricing requires agreement between Line Axia, Lamont Labs, and the client in a signed working agreement.

---

## Framing

CerbaSeal is priced as a scoped enforcement engagement — not a seat license, not a per-user SaaS, not an enterprise platform subscription.

The value delivered is:
- Structural enforcement of human authorization over AI-proposed actions
- Verifiable, tamper-evident evidence production for governance and audit
- A controlled, deployable enforcement primitive for one workflow

Pricing reflects: scope of workflow, complexity of integration, support commitment, client technical maturity, and deployment mode.

Pilot pricing differs from post-pilot production pricing. The pilot is an evaluation. Post-pilot is a service.

---

## Quick Reference — Pilot Pricing Matrix

*These are client-facing fees — the total the client pays Line Axia for the pilot engagement.*

| Tier | Pilot Type | Best Fit | Duration | Client Fee (EUR) |
|---|---|---|---|---|
| 0 | Discovery / Readiness Assessment | Interested but unclear | 1–2 weeks | €5K–€12K |
| 1 | Validation Pilot | Early-stage, low complexity | 30 days | €15K–€30K |
| **2** | **Controlled Workflow Pilot** | **Most likely first real pilot** | **45–90 days** | **€35K–€75K** |
| 3 | Regulated Evidence Pilot | Fintech / health / legal / insurance | 60–90 days | €75K–€150K |
| 4 | Strategic Anchor Pilot | Larger client or high-value reference | 90+ days | €150K–€250K+ |

---

## Recommended First Offer Range

For Line Axia's likely first pilot, anchor around:

**€45K–€75K total client fee**

That is high enough to cover advisory, implementation, training, support, and learning cost, but not so high that it forces full enterprise procurement.

Use this phrasing with prospects:

> "For a first CerbaSeal pilot, I would treat €35K–€75K as the realistic working range, with €45K–€60K as the likely starting target. Anything below €25K should be treated as discovery or validation only, not a full pilot."

---

## Pricing Adjustment Factors

### Add to price when:

- Client needs self-hosting help (deployment assistance beyond documentation)
- Client has a weak technical team (more support hours required)
- Workflow is poorly defined (mapping work is significant)
- More than one team needs training
- Evidence pack must support investor or procurement review (custom format)
- Security or legal review is required
- Support window exceeds 10–20 hours

### Discount only when:

- Client is a strategic reference (named case study, co-marketing, or testimonial)
- Workflow is extremely clean and well-documented (minimal mapping effort)
- Client has a strong technical team (self-directed, minimal hand-holding)
- Pilot is synthetic-only (no real production data or deployment)
- A strong follow-on agreement is likely and contractually scoped

---

## Pilot Tiers — Detail

### Tier 0 — Discovery / Readiness Assessment

**Who it's for:** A prospect who is interested but doesn't yet have a clear picture of which workflow to govern, whether CerbaSeal fits their context, or whether their team is ready for a deployment.

**Scope:**
- Workflow discovery session (using client-discovery-script.md)
- Readiness scoring against the qualification scorecard
- Deployment fit assessment
- Summary report: which tier is appropriate and what they'd need to proceed
- No live CerbaSeal deployment

**What is included:**
- 60-minute discovery call
- Readiness assessment report
- Tier recommendation with rationale
- Summary of open questions before a pilot can proceed

**What is excluded:**
- CerbaSeal deployment of any kind
- Evidence generation
- Training
- Ongoing support

**Duration:** 1–2 weeks  
**Client fee:** €5K–€12K  
**Conversion path:** Tier 1 Validation or Tier 2 Controlled Workflow Pilot

---

### Tier 1 — Validation Pilot

**Who it's for:** An early-stage client with low deployment complexity who wants to validate that CerbaSeal produces the right outcomes for their context before committing to a full engagement. Or a Line Axia client where Line Axia leads the technical integration.

**Scope:**
- One workflow, defined and agreed
- Synthetic or limited real scenarios (not live production data)
- CerbaSeal deployed in a test or staging environment
- Enforcement evaluation with evidence bundle generation
- Short support window (defined hours only)
- Outcome: proof of concept with documented evidence output

**What is included:**
- Workflow mapping session (workbook-guided)
- CerbaSeal-Core deployment assistance
- Defined test scenario execution (minimum: REJECT, HOLD, ALLOW)
- Evidence bundle review
- Defined support hours
- Pilot closeout summary

**What is excluded:**
- Production deployment hardening
- Live production data processing
- Custom workflow development
- New integrations
- Training beyond the defined onboarding session
- Ongoing support after pilot close

**Duration:** 30 days  
**Client fee:** €15K–€30K  
**Client readiness requirement:**
- Passes readiness assessment at LIKELY READY WITH SUPPORT or better
- Has a technical owner available
- Can provide synthetic scenarios

**Conversion path:** Tier 2 Controlled Workflow Pilot or post-pilot production engagement

---

### Tier 2 — Controlled Workflow Pilot *(primary revenue model)*

**Who it's for:** The primary first paid pilot model. A client with a real, operating AI workflow who wants to validate CerbaSeal in their actual environment before a production commitment.

**Scope:**
- One real workflow, fully mapped using the workbook
- Client-controlled deployment in the client's own environment
- Enforcement running on representative real or near-real scenarios
- File-backed audit log configured and validated
- Evidence chain verified
- Defined support hours for deployment, issues, and onboarding
- End-of-pilot review session

**What is included:**
- Readiness assessment
- Workflow mapping workbook session (with client operational and technical leads)
- CerbaSeal-Core deployment with file-backed audit log
- Agreed scenario set execution and evidence review
- Operator and admin training (using training kit)
- Defined support hours
- End-of-pilot review and closeout summary
- Pilot outcome documentation

**What is excluded:**
- Second workflow or adjacent decision paths
- Production monitoring infrastructure
- Legal or regulatory certification or advisory
- Custom feature development
- Infrastructure management (client owns the environment)
- Indefinite ongoing support

**Duration:** 45–90 days  
**Client fee:** €35K–€75K  
**Client readiness requirement:**
- Passes readiness assessment at READY or LIKELY READY WITH SUPPORT
- Has a named technical owner available throughout
- Has a production or staging environment available
- Can commit internal time: ~4–8 hours across the engagement

**Conversion path:** Post-pilot production engagement, license, or expanded pilot (Tier 3)

---

### Tier 3 — Regulated Evidence Pilot

**Who it's for:** A client in a regulated context (fintech, health, legal, insurance) where the evidence pack must meet a higher documentation standard, stakeholder training is broader, and the audit trail needs to be structured for regulatory or advisory review.

**Scope:**
- One consequential workflow in a regulated context
- Client-controlled deployment with stronger configuration documentation
- Evidence pack structured for regulatory or advisory presentation
- Stakeholder training beyond operational roles (compliance, legal, or executive audience)
- Advisory evidence pack for investor, auditor, or procurement review

**What is included:**
- Everything in Tier 2
- Stronger configuration documentation (deployment rationale, boundary documentation)
- Structured evidence pack (formatted for advisory or regulatory presentation)
- Additional training session for compliance or executive audience
- Advisory walkthrough of evidence chain with designated stakeholder
- Post-pilot closeout with written evidence summary

**What is excluded:**
- Legal certification or regulatory compliance certification
- Third-party security review
- Custom feature development
- Second workflow

**Duration:** 60–90 days  
**Client fee:** €75K–€150K  
**Client readiness requirement:**
- Passes readiness assessment at READY
- Named sponsor at director or compliance officer level
- Clear regulatory or advisory driver for the pilot

**Conversion path:** Full production engagement with Line Axia as delivery partner

---

### Tier 4 — Strategic Anchor Pilot

**Who it's for:** A larger client or high-value reference opportunity where the pilot is expected to anchor a broader commercial relationship. Deeper support, stronger reporting, and an explicit expansion plan are included.

**Scope:**
- Client-controlled deployment with full operational documentation
- Deeper support commitment (extended hours, defined escalation path)
- Stronger reporting: structured pilot progress updates and final report
- Expansion plan document: what a post-pilot production engagement would look like

**What is included:**
- Everything in Tier 3
- Extended support hours with defined escalation path
- Structured pilot progress updates (at agreed intervals)
- Final pilot report (suitable for board or investor review)
- Expansion plan: commercial, technical, and operational requirements for full production

**What is excluded:**
- Production SLA guarantees
- Legal or regulatory certification
- Custom feature development beyond agreed scope
- Multi-workflow production operation

**Duration:** 90+ days  
**Client fee:** €150K–€250K+  
**Client readiness requirement:**
- Completed Tier 2 or Tier 3, OR has an internal governance mandate and named executive sponsor
- Clear post-pilot commitment pathway (budget authority identified)
- Willing to be a reference or case study

**Conversion path:** Multi-workflow production engagement, preferred partner relationship

---

## Pricing Factors Reference

Use these factors when sizing an engagement. Final prices are set collaboratively between Line Axia and Lamont Labs for each client.

| Factor | Lower Complexity | Higher Complexity |
|---|---|---|
| Deployment mode | Client is technically able; deploys independently | Client needs significant deployment assistance |
| Workflow complexity | Simple, well-defined, single decision path | Complex, multi-step, unclear boundaries |
| Support hours | Client is self-sufficient; few questions | Client needs frequent clarification and guidance |
| Client technical maturity | Has Node.js experience; can manage environment | No prior Node.js experience; needs hand-holding |
| Legal/security review requirements | No DPA required; no specific security checklist | DPA required; security questionnaire or review needed |
| Training needs | Technical audience; self-directed | Mixed/non-technical audience; live training required |
| Evidence/reporting needs | Standard audit log output | Custom reporting format or structured exports required |
| Integration complexity | CerbaSeal is standalone; no external system integration | Integration with client's existing case management, SIEM, or workflow system |

---

## What Is Not Priced Here

The following are explicitly out of scope for pilot pricing and require a separate commercial discussion:

- Production SLA guarantees
- Ongoing managed hosting
- Multi-client support (Line Axia managing CerbaSeal across many clients)
- Third-party security review facilitation
- Legal advisory or compliance certification
- Custom feature development or new workflow classes

These are post-pilot commercial items. Do not include them in pilot pricing conversations.

---

## Revenue Structure Notes (Internal)

*For Line Axia / Lamont Labs planning only. Not for client communication.*

The commercial model between Line Axia and Lamont Labs is percentage/margin based — Line Axia contracts with the client, Lamont Labs receives an agreed share.

Key open questions to resolve before first paid pilot:
1. What percentage of pilot revenue goes to Lamont Labs?
2. How are support hours tracked and reported?
3. What triggers a scope-change conversation? (i.e., when does support hour usage require a formal notification?)
4. Does the post-pilot production engagement use the same percentage structure?
5. Is there a minimum engagement fee below which a pilot is not economically viable?

---

## Market Context — Research Benchmarks

*Confirmed benchmarks informing the pricing tiers above.*

- **AI governance platforms** (Credo AI, Holistic AI, Arthur): ~$50K to several hundred thousand per year for mid-market to enterprise deployments
- **Compliance automation tools** (Vanta, Drata): $7.5K–$100K+ annually depending on company size and frameworks — not directly comparable but sets enterprise expectation
- **Enterprise pilots**: commonly priced at 10–30% of expected annual contract value; examples around $25K–$50K for 90-day pilots
- **Boutique AI implementation work**: $35K–$150K for scoped engagements; larger firms much higher
- **Consulting implementations of governance tooling**: $50K–$500K+ for custom implementations at enterprise scale

CerbaSeal's Tier 2 range (€35K–€75K) sits at the lower end of boutique AI implementation, reflecting its early-stage status and the bounded pilot scope. Tier 3 and Tier 4 are consistent with regulated-context governance engagements.

---

## Pricing Principles

These principles should guide pricing decisions regardless of final numbers:

1. **Pilot pricing is not production pricing.** Clients should understand they are paying for a controlled evaluation — not a production service.
2. **Price reflects scope, not features.** The enforcement core is the same for all tiers. Price reflects integration effort, support commitment, and training.
3. **Under-promise and over-deliver.** Better to agree to fewer hours and have capacity left than to promise more and burn out.
4. **Do not price below sustainability.** If the pilot cannot be delivered sustainably at the agreed price, renegotiate before signing.
5. **Post-pilot pricing is a separate conversation.** Do not lock post-pilot pricing into the pilot agreement. Use a conversion-path placeholder only.

---

*This document contains working price ranges for commercial planning. No prices are committed. Final pricing requires agreement between Line Axia, Lamont Labs, and the client in a signed working agreement.*
