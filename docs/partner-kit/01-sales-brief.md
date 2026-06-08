# CerbaSeal — Partner Sales Brief

**Audience:** Partner sales and consulting staff  
**Use:** Live sales conversations, qualification calls, executive briefings  
**Time:** 2 pages — read in 5 minutes, use for 30-minute conversations  

---

## What CerbaSeal Is

CerbaSeal is **execution governance infrastructure for AI-assisted workflows**. It is the enforcement layer that sits between an AI system's proposal and the real-world action that follows from it.

When an AI recommends approving a loan, flagging a transaction, placing an account on hold, or escalating a case — CerbaSeal is the gatekeeper that decides whether that recommendation becomes an action. It enforces three outcomes: **ALLOW**, **HOLD**, or **REJECT**.

It is not a monitoring tool. It is not an audit logger. It is the gate.

**The positioning in one sentence:**  
CerbaSeal makes it technically impossible for an AI system to execute a consequential action without the appropriate human sign-off — and it proves that on every single decision.

---

## Why It Matters Now

Enterprise AI deployments in financial services, insurance, healthcare, and regulated industries share a common problem: the AI makes a recommendation, a human reviews a dashboard, and then something happens. But the chain of custody from recommendation to action is undocumented, unaudited, and in most cases unenforced. If a regulator asks "who authorized this action?", the answer is usually "the system."

Three forces are making this urgent:

**1. EU AI Act (2026 enforcement):** High-risk AI systems must have human oversight mechanisms that are technically enforced, not just procedurally described. A policy document that says "humans review AI decisions" does not satisfy the requirement. A system that makes it technically impossible to proceed without a valid human approval does.

**2. Internal audit pressure:** Risk and compliance teams are asking harder questions about AI accountability. "We have a human in the loop" is not the same as "we can prove a specific named human approved this specific decision before it executed."

**3. Incidents:** The first wave of AI decision-making incidents — incorrect fraud flags, wrongful holds, automated account actions — is creating board-level appetite for governance infrastructure that was previously optional.

---

## Who Champions This (and Who Signs)

| Persona | Pain | Why CerbaSeal |
|---|---|---|
| **CISO** | AI decisions are creating liability they can't see | CerbaSeal makes every AI-influenced decision an auditable artifact |
| **CRO / Head of Risk** | Approval processes exist but aren't technically enforced | CerbaSeal is enforcement infrastructure — it cannot be bypassed |
| **Head of AI Governance** | Needs to demonstrate human oversight to regulators | ALLOW/HOLD/REJECT decisions are cryptographically chained and exportable |
| **CTO / Engineering Lead** | Wants to deploy AI responsibly without building governance from scratch | CerbaSeal is a library + config file; 30–60 minutes to integration |

**Economic buyer** is typically the CRO or CISO. **Technical buyer** is the Engineering Lead or Head of Platform. **Champion** is usually the person closest to a recent incident or incoming regulatory deadline.

---

## The 3 Questions to Qualify a Prospect

Ask these in order. A "yes" to all three means the prospect is ready for a pilot conversation.

**Question 1: Do you have an AI system making recommendations that result in real-world actions?**

If yes: What kind of actions? (Transaction blocks, account holds, loan decisions, case escalations, content flags?) These are exactly the workflows CerbaSeal governs.

If no: Not a fit today. CerbaSeal is enforcement infrastructure — it needs an AI decision surface to govern.

**Question 2: Can you tell me who approved the last 10 AI-influenced decisions in that workflow — by name, with a timestamp?**

If they can't answer this clearly: CerbaSeal solves the problem they just described. Every CerbaSeal decision carries a cryptographically bound record of which human approved it, when, and with what authority.

If they can: Ask to see the audit trail. Is it technically enforced, or procedurally described? If enforcement relies on people following a process rather than the system preventing bypass, CerbaSeal closes the gap.

**Question 3: Is there a regulatory deadline, upcoming audit, or board-level risk review that creates urgency?**

If yes: The pilot timing is immediate. Frame CerbaSeal as the evidence-generating infrastructure that answers the regulatory question.

If no: Urgency comes from the incident risk. Walk through a worst-case scenario — "if an AI system approved an incorrect account hold on 10,000 accounts next quarter, what would your audit trail look like?" — and let the prospect articulate the problem.

---

## 5 Common Objections and How to Handle Them

### "You're too early. We need something more mature."

**Underlying concern:** They're worried about betting on an unproven vendor.

**Response:** CerbaSeal is infrastructure, not a SaaS platform. The enforcement core is a library with 432 passing tests including adversarial and forgery scenarios. It runs in their environment, on their infrastructure, under their control. There's no vendor dependency once it's deployed. The risk profile of adopting CerbaSeal is closer to adopting a database driver than a software platform.

**Follow-up:** "The pilot is designed to prove this. Deploy, verify, run three scenarios, export the evidence package. If it doesn't perform exactly as described, you walk away with no obligation."

---

### "This is too complex. Our team can't implement it."

**Underlying concern:** They don't have the bandwidth or the technical depth to integrate a new enforcement layer.

**Response:** A standard deployment takes under 2 hours from clone to verified gate. The setup wizard generates configuration files. Integration is a function call — `gate.evaluate(request)` — that returns a structured result. The most complex integration we've seen was one afternoon of a senior engineer's time.

**Follow-up:** Walk through the deployment guide during the call. Show them `pnpm setup` → `pnpm audit:repo` → `tsx verify.ts`. Let the simplicity speak.

---

### "We already have controls. Approvals happen in our platform."

**Underlying concern:** They think they already have the problem solved.

**Response:** "Can I ask you something? When an AI recommendation gets approved in your platform — is it technically impossible to proceed without the approval, or is the approval logged after the fact?" Most platforms log approvals; they don't enforce them at the execution boundary. CerbaSeal is the enforcement point. The AI proposal literally cannot become an action without a valid approval artifact passing through the gate.

**Follow-up:** This is not about replacing their approval workflow. It's about putting an enforcement layer under it that makes the human sign-off technically mandatory, not procedurally expected.

---

### "We don't have budget for this."

**Underlying concern:** They see CerbaSeal as a cost with no clear ROI.

**Response:** Frame it as insurance against a specific liability. "What does one incident cost — a wrongful account action, a regulatory finding, an internal audit exception? The question isn't whether CerbaSeal fits the budget. It's whether the risk of not having it fits the risk appetite."

**Follow-up:** Pilot pricing is scoped to a single workflow and a fixed timeframe. It is a proof-of-concept investment, not an enterprise commitment. Start small, prove value, then expand.

---

### "It's not a priority right now."

**Underlying concern:** No urgency. They're not feeling the regulatory pressure or the incident risk yet.

**Response:** "That's fair. When do you expect to be ready?" Then listen. If there's a specific event coming (audit, board review, regulation deadline), anchor to that. If there's no specific event, acknowledge it and leave a door open: "The pilot is designed to be low-friction. When the priority changes — and it usually changes after an incident or an audit finding — we can move in days."

**Do not push.** An unqualified prospect forced into a pilot is a failed pilot. Reserve your capacity for accounts where urgency is real.

---

## The Closing Move

After qualifying the prospect and handling objections, close to a pilot — not a purchase:

> "Here's what I'd propose: a one-day pilot, focused on one of your existing workflows. Morning is workflow mapping and policy configuration. Afternoon is deployment and integration. End of day you have a live enforcement gate running against your workflow, three verified scenarios — ALLOW, HOLD, REJECT — and a cryptographically chained evidence export you can take to your risk committee. No commitment beyond the pilot day."

The pilot is the sale. The sale is the pilot.

---

*See [06-objection-handling.md](06-objection-handling.md) for the full 8-objection reference with persona-calibrated responses.*
