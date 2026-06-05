# CerbaSeal — Pilot Sizing and Pricing Framework

**Audience:** Line Axia (commercial planning) and Lamont Labs  
**Purpose:** Support pricing discussions without locking final numbers. Define pilot tiers, scope, and pricing factors.  
**Version:** 0.1.0  
**Status:** Working framework. No prices are set. This document is for internal planning only.

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

## Pilot Tiers

### Tier 1 — Discovery Pilot

**Who it's for:** A technically able prospect who wants to verify CerbaSeal works for their context before committing to a full engagement. Or a Line Axia client where Line Axia leads the technical integration.

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
- Defined support hours (placeholder: [X] hours over [Y] weeks)
- Pilot closeout summary

**What is excluded:**
- Production deployment hardening
- Live production data processing
- Custom workflow development
- New integrations
- Training beyond the defined onboarding session
- Ongoing support after pilot close

**Duration estimate:** 2–4 weeks

**Client readiness requirement:**
- Passes readiness assessment at LIKELY READY WITH SUPPORT or better
- Has a technical owner available
- Can provide synthetic scenarios

**Pricing factors:**
- Minimal integration work (scenario-only)
- Short support window
- Line Axia handles most client interaction

**Conversion path:** Tier 2 Controlled Workflow Pilot or post-pilot production engagement

---

### Tier 2 — Controlled Workflow Pilot

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
- Defined support hours (placeholder: [X] hours over [Y] weeks)
- End-of-pilot review and closeout summary
- Pilot outcome documentation

**What is excluded:**
- Second workflow or adjacent decision paths
- Production monitoring infrastructure
- Legal or regulatory certification or advisory
- Custom feature development
- Infrastructure management (client owns the environment)
- Indefinite ongoing support

**Duration estimate:** 4–6 weeks

**Client readiness requirement:**
- Passes readiness assessment at READY or LIKELY READY WITH SUPPORT
- Has a named technical owner available throughout
- Has a production or staging environment available
- Can commit internal time: ~4–8 hours across the engagement

**Pricing factors:**
- Integration complexity (how much mapping work is needed)
- Client technical maturity (lower maturity = more support hours needed)
- Deployment mode (Mode B/C — client-controlled vs Line Axia-assisted)
- Evidence reporting requirements (standard vs custom format)
- Legal/DPA requirements (if applicable, add-on)

**Conversion path:** Post-pilot production engagement, license, or expanded pilot (Tier 3)

---

### Tier 3 — Extended Governance Pilot

**Who it's for:** A client who has completed Tier 2 successfully and wants to extend the pilot scope before a full production commitment. Or a client with a more complex workflow that cannot be reasonably reduced to a single path.

**Scope:**
- Primary workflow (from Tier 2) plus one adjacent decision path
- Longer support window
- Additional training (second role group or deeper operator training)
- Post-pilot expansion plan document
- Evidence review with compliance/audit framing (advisory, via Line Axia)

**What is included:**
- Everything in Tier 2
- Second decision path mapping and configuration
- Extended support hours (placeholder: [X] hours over [Y] weeks)
- Additional training session for second role group
- Post-pilot expansion plan: what would full production look like?
- Compliance advisory session (Line Axia advisory layer — not legal certification)

**What is excluded:**
- Third workflow
- Production SLA guarantees
- Legal or regulatory certification
- Custom feature development beyond agreed scope

**Duration estimate:** 6–10 weeks

**Client readiness requirement:**
- Completed Tier 2 successfully
- Client has a documented post-pilot goal (expand, procure, or full deployment)
- Named sponsor at director level or above

**Pricing factors:**
- All Tier 2 factors, plus:
- Second decision path complexity
- Extended support window length
- Compliance advisory session scope (Line Axia lead)
- Training audience size and depth

**Conversion path:** Full production engagement with Line Axia as delivery partner

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

## Market Context Notes (Research In Progress)

*These are directional observations for pricing research, not final benchmarks.*

**Adjacent pricing signals to research:**
- Modular compliance tooling (per-feature, per-workflow pricing): $500–$5,000/month range for specialist tools
- AI governance platforms (Credo AI, Holistic AI, Arthur): enterprise licensing, typically $30K–$150K/year at scale
- Vanta, Drata (full compliance suites): $15K–$50K/year — not directly comparable but sets enterprise expectation
- Consulting implementations of governance tooling: $50K–$500K+ for custom implementations at enterprise scale
- Developer infrastructure SaaS (enforcement/policy): $1K–$10K/month at team scale (OPA/Styra reference)

**Pilot pricing hypothesis for research:**
- Tier 1 Discovery Pilot: €[TBD] — short, low-complexity, learning-oriented
- Tier 2 Controlled Workflow Pilot: €[TBD] — the primary revenue vehicle
- Tier 3 Extended Governance Pilot: €[TBD] — larger scope, more advisory time

*All prices TBD pending market research and first client conversations.*

---

## Pricing Principles

These principles should guide pricing decisions regardless of final numbers:

1. **Pilot pricing is not production pricing.** Clients should understand they are paying for a controlled evaluation — not a production service.
2. **Price reflects scope, not features.** The enforcement core is the same for all tiers. Price reflects integration effort, support commitment, and training.
3. **Under-promise and over-deliver.** Better to agree to fewer hours and have capacity left than to promise more and burn out.
4. **Do not price below sustainability.** If the pilot cannot be delivered sustainably at the agreed price, renegotiate before signing.
5. **Post-pilot pricing is a separate conversation.** Do not lock post-pilot pricing into the pilot agreement. Use a conversion-path placeholder only.

---

*This document is an internal planning framework. No prices are committed. Final pricing requires agreement between Line Axia, Lamont Labs, and the client in a signed working agreement.*
