# CerbaSeal — Objection Handling Reference

**Audience:** Partner sales and technical staff  
**Use:** Enterprise sales conversations — calibrated for security, compliance, and technical buyer personas  
**Note:** This guide is for partners who are not the founder. The responses below are written to be delivered by a knowledgeable partner, not by Jesse.  

---

## How to Use This Guide

Eight enterprise objections are documented below. For each, you'll find:
- The **underlying concern** — what the prospect actually worries about
- **2–3 response paths** calibrated for different buyer personas
- A **closing move** to advance the conversation

Memorise the underlying concern, not the scripts. The scripts are starting points.

---

## Objection 1 — "We're not sure we need this level of governance yet."

**Underlying concern:** The prospect doesn't see a live, pressing problem. They view governance infrastructure as a future investment, not an immediate need.

**Response — Security buyer (CISO):**
"The timing question is worth examining. Most organisations that invest in AI governance infrastructure do so after an incident or after a regulatory finding — not before. The cost of building governance infrastructure reactively, under time pressure, after something has gone wrong, is significantly higher than deploying it proactively on a controlled timeline. What does your current audit trail for AI-influenced decisions look like?"

**Response — Compliance buyer (Head of Risk / CCO):**
"EU AI Act enforcement began in 2026. High-risk AI systems — which covers most AI-assisted decisions in financial services, insurance, and healthcare — require technically enforced human oversight mechanisms. A documented process that says 'humans review AI decisions' is not the same as a system that makes it technically impossible to proceed without human approval. If you've had a compliance review of your AI oversight mechanism in the last 12 months, I'd be curious what it said."

**Response — Technical buyer (CTO / Engineering Lead):**
"That's reasonable. Here's the question I'd put to you: what's the marginal cost of adding CerbaSeal to a workflow you're already running, versus adding it after the workflow is in production and embedded in multiple systems? A standard integration is 30–60 minutes of engineering time. Retrofitting governance infrastructure into a mature production system is weeks. The time to add an enforcement layer is before the workflow is live."

**Closing move:** "Would it be useful to do a one-day pilot on one of your existing workflows? No commitment beyond the day. At the end you have a live enforcement gate, three verified scenarios, and an evidence export. The pilot answers the question of whether you need this — with evidence rather than a conversation."

---

## Objection 2 — "We already have an approval workflow. Our system handles this."

**Underlying concern:** The prospect believes their existing approval mechanism is sufficient and sees CerbaSeal as redundant.

**Response — Security buyer:**
"What I'd want to understand is whether the approval in your system is enforced or recorded. In most approval workflows, the approval is a UI element — a button that triggers a state change. An engineer who modifies the application logic, or a system that processes events in the wrong order, can bypass the approval without leaving a trace. CerbaSeal is an enforcement layer: the AI proposal literally cannot become a release authorization without a valid approval artifact passing through the gate. It's the difference between a process and an invariant."

**Response — Compliance buyer:**
"The question regulators are starting to ask isn't 'do you have an approval workflow?' It's 'show me the specific human who approved this specific decision, with a timestamp, before the decision executed.' In most systems, the audit log records what happened after the fact. CerbaSeal generates a cryptographically chained approval record before the action executes. That distinction matters when an auditor reviews a specific decision."

**Response — Technical buyer:**
"I'd ask you to walk me through what happens if a developer pushes a change that skips the approval step in your system. Does something block the deployment? Does the gate reject the request? Or is it caught in code review? CerbaSeal's enforcement is at the infrastructure layer — it's not in the application code. You can't bypass it by pushing code. The invariants are tested with adversarial scenarios designed to find bypass paths. That's a different assurance level from an application-layer control."

**Closing move:** "Can we look at a specific decision that went through your system recently? I'd like to show you what the CerbaSeal evidence record would look like for that same decision, and you can judge whether the assurance level is different from what you have today."

---

## Objection 3 — "The timing isn't right. We'll look at this in Q3."

**Underlying concern:** There's no immediate trigger. The prospect isn't feeling urgency.

**Response — Security buyer:**
"That's a reasonable position. The question is what changes in Q3. If there's a specific event — a board review, a regulatory deadline, an audit — then timing to that is smart. If Q3 is a placeholder because this isn't urgent enough today, I'd gently push back: the pilot we're proposing is a single day. The commitment is one engineer's time and a specific workflow. If Q3 is the right answer for a full deployment, the pilot in Q2 is the right answer for having the evidence ready when Q3 arrives."

**Response — Compliance buyer:**
"Worth checking: does your Q3 timeline account for the EU AI Act enforcement calendar? The high-risk system requirements are not advisory. If you have AI-assisted decisions in financial services, insurance, or HR, the clock is running. A Q3 deployment that needs to produce evidence by Q4 is a compressed timeline."

**Response — Technical buyer:**
"Fair enough. One practical note: the pilot is a single day with one of your engineers. We're not asking for a project. If Q3 is when you want to deploy, running the pilot now means your team knows the system before deployment pressure starts."

**Closing move:** "If Q3 is the target, when should we schedule the pilot? Four weeks before the target deployment gives your team time to plan the integration."

---

## Objection 4 — "We don't have the budget for this right now."

**Underlying concern:** CerbaSeal is perceived as a discretionary cost with no clear ROI.

**Response — Security buyer:**
"I want to make sure we're comparing the right numbers. The cost of one wrongful AI-assisted account action at scale — customer complaints, regulatory response, potential fines, reputational damage — is typically much higher than a governance infrastructure investment. I'm not saying that to create fear. I'm saying: the budget conversation is easier when you frame CerbaSeal as incident prevention infrastructure, not software."

**Response — Compliance buyer:**
"Budget constraints are real. Two questions: First, is the constraint 'no budget exists' or 'it needs to come from the right cost center'? AI governance infrastructure can sit in risk, compliance, technology, or legal budgets depending on how it's framed. Second, what does a regulatory finding cost your organization in remediation, reporting, and management time? That's the comparison baseline."

**Response — Technical buyer:**
"Pilot pricing is scoped to one workflow and one day. It's not an enterprise commitment — it's a proof of concept with a fixed cost. If the pilot doesn't produce demonstrable value, you walk away. If it does, you have a working deployment and the evidence to justify the broader investment."

**Closing move:** "What would it take for the pilot to be approvable under existing budget? Sometimes a pilot can be approved as a technology evaluation under a different budget line than a deployment contract."

---

## Objection 5 — "This is too complex for our team to implement and maintain."

**Underlying concern:** The prospect doesn't have engineering bandwidth or technical confidence to operate a new governance layer.

**Response — Security buyer:**
"The complexity concern is worth examining directly. A standard deployment is: clone the repo, run `pnpm setup` (a wizard that asks 6 questions), run `pnpm audit:repo` to verify. That's the full setup. The configuration is two JSON files. The integration is a function call that returns ALLOW, HOLD, or REJECT. Ongoing maintenance is running `pnpm test` and `pnpm audit:repo` after any policy change. We can walk through that entire flow in 30 minutes."

**Response — Compliance buyer:**
"The operational complexity is intentionally low. Once deployed, the policy file is edited in a text editor. The audit log is a JSONL file that any SIEM can ingest. Evidence export is one command. The system is designed to be operated by a technical owner, not a software engineer. Your risk team can run the audit checks without engineering involvement."

**Response — Technical buyer:**
"Honestly, the best way to answer this objection is to show you the code. The integration is one function: `gate.evaluate(request)`. The request schema is documented. The result is a typed object with a final state of ALLOW, HOLD, or REJECT. We have 8 integration starter kits — copy the one that matches your architecture and adapt it. The most complex integration I've seen was one afternoon of a senior engineer's time."

**Closing move:** "Can I walk you through the setup right now? It takes about 15 minutes. If you think it's within your team's capability after seeing it, we schedule the pilot. If not, we have an honest conversation about what support looks like."

---

## Objection 6 — "We'd prefer to build this ourselves."

**Underlying concern:** The prospect has in-house capability and prefers proprietary solutions or worries about vendor dependency.

**Response — Security buyer:**
"Building a cryptographically chained audit log with tamper-evident hash chains, a formally specified invariant model, adversarial test scenarios, and a self-service policy layer is a significant engineering effort. It's the kind of thing that looks simple from the outside — 'we'll add approvals' — and turns out to take 6–12 months when done correctly. The question isn't whether your team can build it. It's whether the governance infrastructure problem is a better use of their time than the things only they can build."

**Response — Compliance buyer:**
"One thing to consider: CerbaSeal's evidence package includes 432 passing tests including adversarial and forgery scenarios. When you show this to an auditor, you're not showing them 'we wrote an approval flow.' You're showing them a formally specified governance system with documented invariants and a cryptographically verifiable evidence chain. Building that from scratch requires matching that specification — which is available for review."

**Response — Technical buyer:**
"That's a reasonable choice. CerbaSeal is open for technical review — you can read every invariant and every test. If you choose to build your own, you'll want to cover: schema validation, the authority-class model, the approval artifact validation (forRequestId matching, timestamp validation, authority-class chain validation), the hash-chained audit log, and the proof snapshot format. Happy to walk through the specification so you build to the same standard."

**Closing move:** "Would it make sense to do the pilot anyway and use it as a benchmark? Your team can evaluate whether building to this specification is worth the investment, with a concrete reference implementation to measure against."

---

## Objection 7 — "We're concerned about vendor lock-in."

**Underlying concern:** The prospect doesn't want to be dependent on Lamont Labs for critical governance infrastructure.

**Response — Security buyer:**
"This is a legitimate concern and worth addressing directly. CerbaSeal-Core runs in your environment, on your infrastructure. There is no cloud dependency, no SaaS platform, no phone-home mechanism. You control the source, the config, and the audit log. If Lamont Labs disappeared tomorrow, your deployment would continue running exactly as it does today."

**Response — Compliance buyer:**
"The lock-in question is actually inverted from most software. The audit log format is JSONL — standard text. The proof snapshot is JSON with a SHA-256 checksum. The policy file is plain JSON. If you ever need to migrate to a different governance system, your evidence trail is fully portable. The governance record doesn't live in CerbaSeal — it lives in your JSONL files."

**Response — Technical buyer:**
"The library model means the enforcement core is code in your repository. You can review it, fork it, and control the upgrade cadence. The commercial relationship covers support and updates, but you're not dependent on an API endpoint for enforcement — the gate runs in-process. The only external dependency is the pnpm package, which you can pin to a specific version."

**Closing move:** "Does the architecture answer the lock-in concern? If the remaining question is the commercial relationship, we can talk about what the support contract looks like and what self-service looks like after the pilot."

---

## Objection 8 — "How do we know CerbaSeal is actually secure?"

**Underlying concern:** The prospect wants security assurance — cryptographic, adversarial, or audit-level — before trusting an enforcement layer with their governance process.

**Response — Security buyer:**
"The honest answer is: there is no third-party security review completed for v0.1.0. What we can give you is: 432 passing tests including adversarial scenarios designed to find bypass paths, cryptographically chained audit logs with hash chain verification, a formally specified invariant model, and full source access for your security team to review. The proof snapshot gives you a verifiable baseline checksum. A third-party security review is on the roadmap — it's not ready today."

**Response — Compliance buyer:**
"The security posture for v0.1.0 is: enforcement in your environment (no external attack surface), hash-chained audit records (tamper-evident after the fact), and an invariant model that is tested adversarially. What we can't give you is a SOC 2 or ISO 27001 certification today. That's the honest answer. The pilot lets your security team evaluate the implementation directly before you make a commitment."

**Response — Technical buyer:**
"Full source access. Read every invariant, read every test, run the adversarial scenarios yourself. The test suite includes scenarios specifically designed to test bypass attempts — AI self-authorization, forged approval artifacts, pre-dated timestamps, stale trust states. Run `pnpm test` and watch the adversarial scenarios pass. That's the current security assurance level. For a third-party review, that's Tier 3 — something we can coordinate for production deployments with enterprise security requirements."

**Closing move:** "Would it help to schedule a technical review session where your security team can ask questions directly about the implementation and the test coverage? That's a better use of time than a sales conversation on this topic."

---

*For the short version of objection handling (5 most common), see [01-sales-brief.md](01-sales-brief.md).*
