# CerbaSeal — Line Axia Partner Enablement Pack

**Audience:** Line Axia team (Olivia, Tina, and any future team members)  
**Purpose:** Qualify, explain, and position CerbaSeal in client conversations without needing Jesse on every call.  
**Version:** CerbaSeal-Core v0.1.0  
**Status:** Pilot-stage positioning. Do not represent as a production-certified system.

---

## The 30-Second Explanation

> "CerbaSeal is an enforcement gate that sits between an AI system and any action it proposes. Before the action executes, CerbaSeal checks that a human has authorized it, the authorization is valid, and all governance conditions are met. Every decision — allowed, held, or rejected — produces a verifiable audit record. AI systems cannot authorize their own proposals. That's the core guarantee."

Use this when you have 30 seconds at the start of a meeting or need to answer "what does this do?"

---

## The 2-Minute Explanation

> "Most organizations deploying AI agents face the same problem: the AI proposes an action, and unless someone has built a very deliberate control layer, that action can execute without meaningful human oversight or a traceable record of who authorized what.
>
> CerbaSeal solves this structurally. It's an enforcement layer — not a policy document, not an audit log added after the fact, not a prompt instruction. It evaluates every request before execution against a fixed set of governance rules. The most important rule: an AI system can never authorize its own proposal. That requires a human authority.
>
> Every outcome — whether the action was allowed, held for review, or rejected — produces an evidence bundle. That bundle is hash-chained, replayable, and verifiable. If a regulator or auditor asks 'show me every AI decision that touched a customer account in Q3,' this is the system that makes that answer possible.
>
> We're at the pilot stage. This isn't a fully managed SaaS product yet. It's a controlled enforcement core that we deploy with a specific client for a specific workflow. The value is real. The scope is intentionally narrow."

Use this for the first substantive conversation with a new prospect.

---

## What CerbaSeal Does

| Capability | Description |
|---|---|
| Enforcement gate | Evaluates every AI-proposed action before it executes |
| Non-self-authorization | AI systems structurally cannot authorize their own proposals — this is a hard invariant, not a setting |
| ALLOW / HOLD / REJECT | Exactly one deterministic outcome per request |
| Evidence bundle generation | Every outcome produces a tamper-evident record |
| Hash-chained audit log | All events linked by SHA-256 chain — chain integrity verifiable at any time |
| Replay verification | Any past decision can be re-evaluated and will produce the same outcome |
| Proof snapshot | Exportable governance state snapshot with stable checksum |
| Client-controlled deployment | Runs on client infrastructure — no data leaves the client environment |
| Diagnostic reporting | Machine-readable system state available via API |
| Zero external dependencies | Enforcement core has no runtime calls to external services |

---

## What CerbaSeal Does Not Do

Be explicit about these. Prospects who misunderstand scope become difficult clients.

| Not Included | Correct Framing |
|---|---|
| AI output quality evaluation | CerbaSeal governs authorization, not correctness. Whether the AI decision was the right one is a separate question. |
| GDPR, EU AI Act, or SOC 2 certification | CerbaSeal produces governance evidence that supports compliance review. It does not certify compliance. That requires your legal/regulatory advisory work. |
| Full compliance package | CerbaSeal is one enforcement component. It is not a full compliance toolkit like Vanta. |
| Identity verification | Actor identity is caller-declared. CerbaSeal trusts what the calling system says about who the actor is. |
| Production monitoring or alerting | No built-in monitoring infrastructure. |
| Third-party security review | Not yet completed. Planned as a future phase. |
| 24/7 support | Pilot support is scoped and bounded. |
| Multi-workflow deployment out of the box | First pilot is one workflow. Expansion is a next phase. |
| Managed hosting | Pilot is client-controlled. We may offer hosted options in the future. |

---

## Ideal Client Profile

The clients most likely to succeed in a first pilot:

**Organizational characteristics:**
- Operating at least one AI-assisted workflow that produces consequential outputs (financial decisions, status changes, customer-impacting actions)
- Working in a regulated or compliance-sensitive environment (financial services, fintech, impact tech, professional services with AI tools)
- Facing or anticipating EU AI Act, NIS2, or Data Act compliance requirements
- Seed to Series B stage — large enough to have real AI deployments, not so large that procurement takes a year

**Technical characteristics:**
- Has at least one technical person who can manage a Node.js service
- Has server infrastructure they control (cloud, on-prem, container)
- Can provision environment variables and manage a local service

**Operational characteristics:**
- Has a specific AI workflow in mind — not "we want to do AI governance generally"
- Has a named internal champion who owns the initiative
- Understands the difference between a pilot evaluation and a production deployment
- Can commit 4–8 hours of internal time across the pilot engagement

---

## Bad-Fit Client Profile

Disqualify or postpone prospects who match these:

| Red Flag | Why It's a Problem |
|---|---|
| No AI workflow in production | Nothing to govern. Come back later. |
| Expects compliance certification | We cannot certify. Correct the expectation or move on. |
| Expects 24/7 support | Outside scope for a pilot. |
| Wants to govern 5 workflows at once | First pilot is one workflow only. This is a scope problem, not a future-phase problem. |
| No technical owner | Deployment cannot happen. |
| Procurement requires 12+ months | Not compatible with a pilot timeline. |
| Senior leadership not involved | Pilot will stall at first decision point. |

---

## First Pilot Shape

Always describe the first pilot this way:

> "One client. One workflow. One decision path. One approval model. One enforcement promise. One verifiable outcome."

This framing:
- Sets realistic expectations
- Prevents scope creep before it starts
- Makes success criteria unambiguous

The pilot is a **controlled technical evaluation** — not a production deployment, not a certification exercise.

---

## Common Objections and Answers

### "We already have audit logs. Why do we need this?"

> "Standard audit logs record what happened after the fact. CerbaSeal enforces before execution. An AI system cannot produce an authorized action without passing through the gate — the record isn't added retroactively, it's produced as part of the enforcement itself. That's a structural difference that matters when an auditor asks whether an AI decision was actually authorized before it ran."

---

### "How is this different from just adding a human review step in our workflow?"

> "A human review step in a workflow can be bypassed, misconfigured, or skipped under load. CerbaSeal is a structural gate — the execution path physically cannot proceed to ALLOW without passing all invariants. That's a stronger guarantee than a process step. And every decision, including the ones you reject, has a verifiable evidence record."

---

### "We're too early for governance tooling."

> "If you're running AI in a workflow that touches customers, finances, or compliance-relevant decisions — you're not too early. The question is whether you build the evidence trail before you need it or after something goes wrong. The cost of a controlled pilot now is very low compared to reconstructing evidence for a regulator retroactively."

---

### "We need something that covers the whole EU AI Act."

> "CerbaSeal addresses specific provisions — particularly around human oversight and decision traceability. It's not a full compliance framework. What we offer is: one of the hardest technical problems in AI governance (proving that a specific human authorized a specific AI action before it ran) solved structurally. The broader compliance picture is where our advisory work with you adds value."

---

### "What happens if the system goes down during a live workflow?"

> "CerbaSeal is fail-closed — if the gate is unavailable, the action does not execute. That's a design choice that favors safety over availability. For a pilot, this means you should design your workflow so that CerbaSeal unavailability triggers a manual fallback, not an uncontrolled failure."

---

### "You haven't had a third-party security review."

> "That's true and we're transparent about it. The enforcement core has been adversarially tested — 391 tests, including bypass attempts and forgery scenarios. A third-party security review is on the roadmap. For a pilot engagement, we recommend treating this as a controlled evaluation rather than a production system until that review is complete."

---

### "Why only one workflow in the pilot?"

> "Constrained scope is how we ensure the pilot succeeds. A single workflow lets us define success criteria clearly, bound the support commitment, and produce clean learning. Expansion to additional workflows is the natural next phase after a successful pilot. Starting with multiple workflows typically means no workflow is done well."

---

### "What does this cost?"

> "We're in the pricing research phase. The pilot engagement is priced differently from ongoing production use. What I can tell you is that it's structured as a defined-scope engagement — not an open-ended subscription or a large enterprise contract. We'll have specific numbers before we ask you to commit to anything."

---

## How to Explain Zero Runtime Dependencies

> "The enforcement core — the part that makes governance decisions — has no external API calls, no cloud dependencies, no third-party services it calls at runtime. It runs entirely on the client's own infrastructure. That means no data leaves the client's environment during enforcement, and the governance decision doesn't depend on any external service being available."

Use this when:
- Data residency is a concern
- Supply chain security is raised
- GDPR data-leaving-EU questions come up
- Client wants to understand the attack surface

---

## How to Explain Client-Controlled Deployment

> "CerbaSeal runs on infrastructure you control. We do not host your data. We do not have access to your server. Your audit records stay in your environment. Lamont Labs provides the enforcement software — you run it. This is similar to deploying an open-source database: we provide the software, you own the deployment."

Use this when:
- Data sovereignty is raised
- Client asks whether their data goes to a third party
- GDPR or NIS2 supply-chain concerns come up

---

## How to Explain No EU Deployment Yet

> "We don't have a Lamont Labs-hosted EU deployment today. The current model is client-controlled — you deploy it in your own EU infrastructure if that's what your data residency requires. That's actually a stronger position for data sovereignty: nothing leaves your environment. A Lamont Labs-hosted EU option is on the long-term roadmap."

Use this when:
- Client asks about Lamont Labs' EU presence
- Client asks where their data is processed

---

## How to Explain No Third-Party Security Review Yet

> "A formal third-party security review hasn't been completed yet. The enforcement core has been through rigorous internal adversarial testing — 391 tests including bypass attempts, forgery scenarios, and boundary probes. For a pilot engagement in a controlled environment, this level of testing is appropriate. A third-party review is planned as a pre-commercial milestone."

Use this when:
- A security-conscious technical buyer asks
- Procurement checklists include security review requirements

Frame it as: transparent about where we are, clear on the roadmap.

---

## How to Explain Pilot Versus Production

> "A pilot is a controlled technical evaluation of one workflow in the client's environment. It is not a production-hardened system. It does not include 24/7 monitoring, SLA guarantees, or production-scale infrastructure. The purpose of the pilot is to verify that CerbaSeal works for the client's specific workflow, that the evidence output is useful, and that the support model is workable. If the pilot succeeds, the post-pilot commercial engagement includes the production hardening path."

Always use this framing. Never describe a pilot as production.

---

## When to Bring Jesse Into the Conversation

**You do not need Jesse for:**
- Initial prospect qualification
- Explaining what CerbaSeal is and does
- Readiness assessment conversations
- Workflow mapping discussions (you can lead, using the workbook)
- Commercial and agreement negotiations
- Compliance advisory framing

**Bring Jesse in when:**
- The prospect is technically sophisticated and wants to review the enforcement architecture in depth
- A specific technical question cannot be answered by this pack or the technical docs
- There is an unexpected behavior in the enforcement core during a pilot
- A feature request or integration question requires a code-level answer
- The prospect wants to verify the proof snapshot independently with the creator present

Keep Jesse in the loop on commercial progress. Keep Jesse out of conversations he doesn't need to be in — that's what this pack is for.

---

## Review Links for Technical Prospects

If a technical prospect wants to verify the system themselves:

```bash
git clone https://github.com/Lamont-Labs/CerbaSeal-Core.git
cd CerbaSeal-Core
pnpm install
pnpm test           # 391 tests, all pass
pnpm audit:repo     # 15/15 checks pass
pnpm verify:proof   # stableChecksum confirmed
```

Live demo: https://cerbaseal.replit.app/  
Review portal: https://cerbaseal.replit.app/review  
Pilot readiness portal: https://cerbaseal.replit.app/pilot  
Security posture: https://cerbaseal.replit.app/security  

---

*This pack is for internal Line Axia use. Do not distribute to prospects. Use the content — not the document itself — in client conversations.*
