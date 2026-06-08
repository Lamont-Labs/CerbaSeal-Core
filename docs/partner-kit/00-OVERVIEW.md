# CerbaSeal — Partner Delivery Kit

**Version:** v0.1.0  
**Audience:** Certified consulting partners and partner candidates  
**Purpose:** Everything you need to sell, deploy, configure, and support a CerbaSeal pilot without founder involvement  

---

## What This Kit Is

The Partner Delivery Kit is the complete reference for a consulting partner who has agreed to deliver CerbaSeal pilots to enterprise clients. It covers the full engagement lifecycle — from the first sales conversation to a completed pilot with a signed evidence package, including commercial structure, pricing framework, market positioning, and risk awareness.

This kit does not assume prior knowledge of CerbaSeal. It assumes you are a competent technical consultant who can follow structured guides and run command-line tools.

---

## Operating Model — Guided Independence

CerbaSeal's delivery model is **guided independence**: clients retain control of their environment and workflow; partners and Lamont Labs provide a repeatable path for deployment, workflow mapping, configuration, validation, evidence review, and escalation support. Routine operation does not depend on a single founder or implementation engineer.

| Responsibility Area | Client Role | Partner / Lamont Labs Role |
|--------------------|------------|---------------------------|
| Environment ownership | Provide hosting environment, network controls, persistence volume, and operational monitoring | Provide deployment guide, Docker Compose path, Node.js Direct path, and validation steps |
| Workflow definition | Identify business workflow, actor roles, approval path, and success criteria | Guide workflow mapping into request, config, policy, and verification structures |
| Identity and access | Operate identity provider, authentication, privileged access, and network-level API controls | Document trust-state expectations and boundary assumptions; support integration planning |
| Policy configuration | Review and approve how organizational roles and approval chains are represented | Provide policy template, configuration guidance, validation scripts, and certification path |
| Pilot execution | Run representative requests and review outcomes with stakeholders | Facilitate setup, evidence capture, issue triage, and closeout |
| Evidence review | Use evidence outputs for internal governance and audit preparation | Provide export procedures, verification steps, and interpretation support |

---

## How to Use This Kit

Work through the documents in order for your first engagement. After that, use them as reference material.

### Delivery Documents

| # | Document | What It Covers | When to Use |
|---|---|---|---|
| 01 | [Sales Brief](01-sales-brief.md) | Positioning, qualification, objection handling | Before and during the sales conversation |
| 02 | [Technical Brief](02-technical-brief.md) | Architecture, invariants, evidence chain | Technical discovery and design review |
| 03 | [Deployment Guide](03-deployment-guide.md) | Step-by-step deployment for a client environment | During or before the pilot engagement |
| 04 | [1-Day Pilot Guide](04-pilot-guide.md) | The CerbaSeal Express Pilot: morning to evidence package | Running your first pilot |
| 05 | [Support Guide](05-support-guide.md) | 10 most common partner issues with diagnosis and resolution | During and after deployment |
| 06 | [Objection Handling](06-objection-handling.md) | 8 enterprise objections with persona-calibrated responses | Sales and technical discussions |
| 07 | [Certification Framework](07-certification-framework.md) | Three levels, competencies, practical exercises, pass/fail criteria | Certification preparation and assessment |

### Commercial Documents

| # | Document | What It Covers | When to Use |
|---|---|---|---|
| 08 | [Pricing and Commercial Model](08-pricing-and-commercial-model.md) | 5 pilot tiers, annual licensing, channel economics, pilot package structure | Before pricing discussions and pilot scoping |
| 09 | [Market Positioning](09-market-positioning.md) | Category placement, buyer personas, comparable benchmarks, regulatory context | Before sales conversations and proposal writing |
| 10 | [Adoption Roadmap](10-adoption-roadmap.md) | Build priorities, founder independence metrics, recommended next steps | Partner planning and roadmap discussions |
| 11 | [Risk Register](11-risk-register.md) | Risk areas, mitigations, out-of-scope items, external communication posture | Pilot scoping and client kickoff preparation |
| 12 | [Partner Discussion Brief](12-partner-discussion-brief.md) | Q&A format for partner commercial calls, negotiation posture, talking points | Immediately before a partner or commercial discussion |

---

## The Three Certification Levels

You must hold Level 1 certification before delivering any client deployment. You must hold Level 2 before running a client pilot without Jesse's involvement. Level 3 confirms you can lead a full pilot independently from kickoff to evidence package.

| Level | Name | What It Proves | Minimum Before |
|---|---|---|---|
| **Level 1** | Deploy | Can stand up CerbaSeal, pass all tests and audits, and export a verified proof snapshot | Any client deployment |
| **Level 2** | Configure | Can author a policy pack for a new client workflow without assistance | Unsupervised pilot delivery |
| **Level 3** | Lead Pilots | Can run a full pilot from kickoff to evidence closeout with appropriate escalation discipline | Leading engagement solo |

Certification is not a one-time event. Each level has a practical exercise with a pass/fail checklist. See [07-certification-framework.md](07-certification-framework.md) for the full criteria.

---

## Where to Get Help

| Situation | Who to Contact |
|---|---|
| Kit content questions or corrections | Review the relevant document first; most answers are here |
| Pricing or commercial scoping questions | [08-pricing-and-commercial-model.md](08-pricing-and-commercial-model.md) |
| Market category or positioning questions | [09-market-positioning.md](09-market-positioning.md) |
| Client deployment issues | [Support Guide — 05-support-guide.md](05-support-guide.md) |
| Gate behavior you can't explain | [Technical Brief — 02-technical-brief.md](02-technical-brief.md) |
| Risk or out-of-scope questions | [Risk Register — 11-risk-register.md](11-risk-register.md) |
| Escalation beyond the kit | Lamont Labs Tier 3 — reserve for issues not resolvable with this kit |

**Lamont Labs escalation is Tier 3.** The expectation is that Level 2+ partners resolve 80%+ of issues independently using this kit and the self-service tooling (`pnpm audit:repo`, diagnostic report, troubleshooter portal).

---

## What Requires Lamont Labs Tier 3

Be clear with clients about what is and is not self-service. See [11-risk-register.md](11-risk-register.md) for the full list and external communication posture.

1. **New core enforcement invariants** — adding a new hard rule requires TypeScript changes and new tests
2. **New proposal source kinds** beyond `"ai"` and `"deterministic_rule"`
3. **Cryptographic signing infrastructure** — HMAC signing is available; PKI-backed signing requires implementation work
4. **Third-party security review** — not yet completed for v0.1.0; planned for v0.2.0
5. **Windows deployment** — not tested; support posture is unclear
6. **Gate behavior that survives the standard support guide diagnosis path**

Everything else — deployment, policy authoring, integration, training, and first-line support — is self-service with this kit.

---

## Supporting Tools

| Tool | Command | What It Does |
|---|---|---|
| Full test suite | `pnpm test` | 391 tests across 17 test files; must all pass |
| Repo audit | `pnpm audit:repo` | 16 automated checks against governance integrity |
| Setup wizard | `pnpm setup` | Interactive setup → writes config files |
| Deployment verification | `tsx deployment-starter/verify.ts` | Live REJECT / HOLD / ALLOW scenarios; 9/9 assertions |
| Proof snapshot | `pnpm export:proof` | Cryptographically chained evidence snapshot |
| Proof verification | `pnpm verify:proof` | Verifies snapshot has not been tampered with |
| Evidence report | `pnpm generate:evidence-report` | Human-readable compliance evidence |

---

*CerbaSeal v0.1.0 — Lamont Labs / Jesse Lamont*
