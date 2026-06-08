# CerbaSeal — Partner Discussion Brief

**Audience:** Partner principals preparing for a commercial discussion with Lamont Labs  
**Version:** v0.1.0 | June 2026  
**Format:** Single-session reference — read before the call, use during it  
**Classification:** Partner Confidential — Authorized Recipients Only

---

## Purpose

This brief is designed for the immediate partner conversation. The goal is to give the partner a clear view of what CerbaSeal is, what has been built, what a first pilot should validate, and what commercial questions need to be answered before a formal offer is prepared.

**Best meeting objective:** Leave with enough agreement to draft a one-page heads-of-terms outline covering pilot scope, compensation structure, support boundaries, IP ownership, and exclusivity principles.

---

## What You Need to Know Before the Call

| Question | Practical Answer |
|----------|----------------|
| What is CerbaSeal? | A deterministic governance enforcement layer that sits between a proposed decision and execution |
| What does it produce? | ALLOW, HOLD, or REJECT decision plus reason codes, audit entries, and evidence bundle |
| Is it a workflow system? | No. It integrates with existing workflow, identity, case, AI, and operational systems |
| Can it be deployed by a client or partner? | Yes, using guided Docker Compose or Node.js Direct paths with configuration and verification steps |
| What is the first pilot? | One governed workflow, one approval model, one deployment path, and one evidence package |
| What should pricing reflect? | Discovery, workflow mapping, deployment support, validation, evidence review, support window, software value, and partner role |
| What should not be promised? | Production certification, regulatory compliance certification, unlimited custom development, or 24/7 support without written scope |

---

## Discussion Priorities

| Priority | Question to Resolve |
|----------|-------------------|
| Pilot client profile | Which client type is most likely to buy first: seed/Series A AI company, fintech, insurance, regulated SaaS, or enterprise AI team? |
| Pilot scope | Which workflow has the cleanest path to evidence within 45–90 days? |
| Commercial structure | Will the partner charge the client directly and compensate Lamont Labs by percentage, fixed technical fee, or hybrid model? |
| Support window | How many partner/client support hours are included, how are they scheduled, and what triggers Tier 3 escalation? |
| Exclusivity | What concrete commitments, time limits, territory, exit terms, and minimum activity would justify exclusivity? |

---

## Negotiation Posture

| Topic | Recommended Stance |
|-------|------------------|
| Pricing | Do not name a final number until pilot scope, support expectations, and partner responsibilities are defined |
| IP | Lamont Labs retains CerbaSeal core IP. Client-specific workflow artifacts and derivative improvements need written treatment |
| Support | Bounded, scheduled, and role-defined. Avoid open-ended availability commitments |
| Exclusivity | Open to discussion only with written terms, activity commitments, limited duration, and defined exit conditions |
| Pilot success | Define before work begins: evidence package, operational sustainability, client value, and next-step clarity |

---

## Talking Points — What Has Been Built

Use these when the partner asks about technical readiness or wants to assess credibility:

- **391 tests passing** across 17 test files, including adversarial bypass scenarios
- **16 repository governance checks** passing (`pnpm audit:repo`)
- **12 unconditional invariants** — cannot be bypassed by configuration or policy
- **3 decision states** (ALLOW / HOLD / REJECT) with deterministic, reproducible output
- **Cryptographically chained audit log** — SHA-256 forward chain, verifiable at any time
- **Two deployment paths** — Docker Compose and Node.js Direct, documented with step-by-step guides
- **8 partner kit documents** covering sales, technical, deployment, pilot, support, objection handling, and certification
- **Evidence export and verification** — `pnpm export:proof` + `pnpm verify:proof` produces a cryptographically verifiable proof snapshot

---

## Talking Points — What Is Not Yet Built

Use these proactively. Surfacing limitations builds trust; hiding them destroys it.

- Third-party security review is planned for v0.2.0 — not yet completed
- PKI-backed signature validation is roadmap; v0.1.0 checks presence and format only
- Policy pack builder and workflow wizard are on the roadmap — policy authoring is currently JSON with partner guidance
- Production monitoring integrations are environment-specific — operator responsibility
- Windows deployment is not tested in v0.1.0

---

## Questions to Ask the Partner

| Question | What You Learn |
|----------|---------------|
| What does a successful first pilot look like from your side? | Defines success criteria in partner language |
| What type of first client do you expect to approach? | Calibrates pilot tier and pricing range |
| What implementation role do you expect to own? | Clarifies channel model and founder involvement level |
| What pricing are you seeing in your market? | Partner contributes market evidence; you validate or adjust |
| What commitments would come with any EU exclusivity? | Surfaces whether territory discussion is premature |

---

## Guided Independence — How to Frame CerbaSeal's Operating Model

When the partner asks about support and delivery, use this framing:

> "The operating model is guided independence. The client retains control of their environment, workflow, identity systems, and operations. We — Lamont Labs and the partner — provide deployment guidance, workflow mapping support, configuration validation, evidence review, and defined escalation. Routine operation after pilot closeout does not require the founder to be present."

**What this means in practice:**
- Partner leads discovery, mapping, deployment, verification, and evidence closeout
- Lamont Labs is Tier 3 — reserved for core invariant changes, unresolved defects, and roadmap questions
- Client uses self-service tooling for health checks, audit verification, and diagnostic reporting

---

## If the Partner Asks About Competitors

Use the category framing from [09-market-positioning.md](09-market-positioning.md):

> "The closest structural analog is runtime policy enforcement — think Styra/OPA — but CerbaSeal is designed specifically for AI-assisted decision workflows. The comparable buyer outcome is the AI governance control plane category — Credo AI, Arthur AI — but CerbaSeal is enforcement-first, not monitoring-first. The key differentiation: CerbaSeal makes bypass technically impossible, not just procedurally documented."

---

## After the Call — Immediate Actions

1. Draft a one-page heads-of-terms outline covering: pilot scope, compensation structure, support boundaries, IP ownership, exclusivity principles
2. Confirm which pilot tier (0–4) matches the proposed engagement
3. Define the specific workflow the pilot will govern
4. Agree on support hours, escalation triggers, and closeout criteria
5. If exclusivity is raised: do not commit — return with written terms proposal

---

*This brief should be updated after each major partner call to reflect new information about client types, market pricing feedback, and support scope expectations.*
