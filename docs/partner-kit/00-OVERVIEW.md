# CerbaSeal — Partner Delivery Kit

**Version:** v0.1.0  
**Audience:** Certified consulting partners and partner candidates  
**Purpose:** Everything you need to sell, deploy, configure, and support a CerbaSeal pilot without founder involvement  

---

## What This Kit Is

The Partner Delivery Kit is the complete reference for a consulting partner who has agreed to deliver CerbaSeal pilots to enterprise clients. It covers the full engagement lifecycle — from the first sales conversation to a completed pilot with a signed evidence package.

This kit does not assume prior knowledge of CerbaSeal. It assumes you are a competent technical consultant who can follow structured guides and run command-line tools.

---

## How to Use This Kit

Work through the documents in order for your first engagement. After that, use them as reference material.

| # | Document | What It Covers | When to Use |
|---|---|---|---|
| 01 | [Sales Brief](01-sales-brief.md) | Positioning, qualification, objection handling | Before and during the sales conversation |
| 02 | [Technical Brief](02-technical-brief.md) | Architecture, invariants, evidence chain | Technical discovery and design review |
| 03 | [Deployment Guide](03-deployment-guide.md) | Step-by-step deployment for a client environment | During or before the pilot engagement |
| 04 | [1-Day Pilot Guide](04-pilot-guide.md) | The CerbaSeal Express Pilot: morning to evidence package | Running your first pilot |
| 05 | [Support Guide](05-support-guide.md) | 10 most common partner issues with diagnosis and resolution | During and after deployment |
| 06 | [Objection Handling](06-objection-handling.md) | 8 enterprise objections with persona-calibrated responses | Sales and technical discussions |
| 07 | [Certification Framework](07-certification-framework.md) | Three levels, competencies, practical exercises, pass/fail criteria | Certification preparation and assessment |

---

## The Three Certification Levels

You must hold Level 1 certification before delivering any client deployment. You must hold Level 2 before running a client pilot without Jesse's involvement. Level 3 confirms you can lead a full pilot independently from kickoff to evidence package.

| Level | Name | What It Proves | Minimum Before |
|---|---|---|---|
| **Level 1** | Deploy | Can stand up CerbaSeal and verify it works | Any client deployment |
| **Level 2** | Configure | Can author a policy pack for a new client without assistance | Unsupervised pilot delivery |
| **Level 3** | Lead Pilots | Can run a full pilot engagement independently | Leading engagement solo |

Certification is not a one-time event. Each level has a practical exercise with a pass/fail checklist. See [07-certification-framework.md](07-certification-framework.md) for the full criteria.

---

## Where to Get Help

| Situation | Who to Contact |
|---|---|
| Kit content questions or corrections | Review the relevant document first; most answers are here |
| Client deployment issues | [Support Guide — 05-support-guide.md](05-support-guide.md) |
| Gate behaviour you can't explain | [Technical Brief — 02-technical-brief.md](02-technical-brief.md) |
| Escalation beyond the kit | Lamont Labs Tier 3 — reserve for issues not resolvable with this kit |

**Lamont Labs escalation is Tier 3.** The expectation is that Level 2+ partners resolve 80%+ of issues independently using this kit and the self-service tooling (`pnpm audit:repo`, diagnostic report, troubleshooter portal).

---

## What Requires Jesse (Lamont Labs Tier 3)

Be clear with clients about what is and is not self-service:

1. **New core enforcement invariants** — adding a new hard rule requires TypeScript changes and new tests
2. **New proposal source kinds** beyond `ai` and `deterministic_rule`
3. **Cryptographic signing infrastructure** — HMAC signing is available; PKI-backed signing requires implementation work
4. **Third-party security review** — Jesse must coordinate; not yet completed for v0.1.0
5. **Windows deployment** — not tested; support posture is unclear

Everything else — deployment, policy authoring, integration, training, and first-line support — is self-service with this kit.

---

## Supporting Tools

| Tool | Command | What It Does |
|---|---|---|
| Full test suite | `pnpm test` | 432 tests; must all pass |
| Repo audit | `pnpm audit:repo` | 16 automated checks against governance integrity |
| Setup wizard | `pnpm setup` | Interactive setup → writes config files |
| Deployment verification | `tsx deployment-starter/verify.ts` | Live REJECT / HOLD / ALLOW scenarios |
| Proof snapshot | `pnpm export:proof` | Cryptographically chained evidence snapshot |
| Proof verification | `pnpm verify:proof` | Verifies snapshot has not been tampered with |
| Evidence report | `pnpm generate:evidence-report` | Human-readable compliance evidence |

---

*CerbaSeal v0.1.0 — Lamont Labs / Jesse Lamont*
