# CerbaSeal — Train-the-Trainer Program

**Audience:** Line Axia team (Olivia, Tina, future team members)  
**Purpose:** Enable Line Axia to train pilot clients on CerbaSeal without Jesse present.  
**Version:** 0.1.0

---

## What This Program Does

After completing this program, Line Axia team members can:

- Deliver the 30-minute kick-off onboarding session independently
- Answer common client questions without calling Jesse
- Facilitate a workflow mapping session using the workbook
- Interpret enforcement outcomes (ALLOW / HOLD / REJECT) in a client's context
- Handle Tier 1 and Tier 2 support questions
- Know exactly when to escalate to Jesse (and when not to)

This is not a technical training. You do not need to understand the source code. You need to understand what CerbaSeal does, what it produces, and how to explain it to a client in their language.

---

## Prerequisites

Before starting this program, complete:
- [ ] Read `training/getting-started-guide.md` — the same introduction your clients will read
- [ ] Open `pnpm demo:web` and run all three scenarios (REJECT / HOLD / ALLOW) yourself
- [ ] Read `line-axia-partner-enablement-pack.md` in full

If you have not done these three things, do them first. You cannot train clients on something you haven't experienced yourself.

---

## Module 1 — What CerbaSeal Actually Does (Self-Study, 30 minutes)

**Goal:** Build mental models for the three outcomes and the enforcement guarantee.

**Study:**
1. Read `training/getting-started-guide.md`
2. Open the browser demo and run each scenario
3. For each outcome, write down in your own words: *"In a client conversation, I would explain ALLOW as..."*

**The one thing you must be able to say from memory:**

> *"An AI system cannot authorize its own proposals. This is structural — it cannot be bypassed by any flag or configuration. Human authorization is always required for consequential actions."*

Practice saying this until it feels natural. It is the single most important thing to communicate.

**Self-test:** Close all documents and answer these from memory:
- What does ALLOW mean for a client's workflow?
- What does HOLD mean — and what is NOT HOLD?
- What does REJECT mean — and can a rejected request be retried?
- What happens to evidence in all three cases?

---

## Module 2 — The Governance Templates (Self-Study, 45 minutes)

**Goal:** Understand the four workflow templates well enough to map a real client conversation to the right one.

**Study:**
1. Read `templates/fraud-triage-template.md`
2. Read `templates/transaction-escalation-template.md`
3. Read `templates/account-hold-recommendation-template.md`
4. Read `templates/generic-human-approval-template.md`

**The pattern across all templates:**

- AI proposes → Human authorizes → Evidence produced
- AI can never be the authorizer of its own proposal
- ALLOW / HOLD / REJECT each produce permanent evidence
- Governance evidence supports compliance review — it does not certify compliance

**Self-test:** For each template, write one sentence describing: *"This template applies when a client has..."*

---

## Module 3 — Facilitating the Workflow Mapping Session (Practice, 2 hours)

**Goal:** Be comfortable facilitating sections A–M of the workflow mapping workbook with a real client.

**Preparation:**
1. Read `workflow-mapping-workbook.md` in full, including the completed fraud triage example
2. Practice asking the questions in each section aloud — even to yourself
3. Identify the questions that feel awkward or unclear. Reword them in your own language.

**Practice session (internal, before first client):**

Run a mock workflow mapping session with Tina or another team member playing the role of the client. Use a fictional company and a plausible workflow (e.g., "we have an AI that flags suspicious insurance claims for human review").

Work through sections A–M. Complete the CerbaSeal Field Map at the end.

**Key facilitation skills:**

- **Slow down on Section F (Who can approve?)** — This is where most clients realize they haven't defined authority clearly. Give it time.
- **Use the fraud triage example as an anchor** — When clients get confused by CerbaSeal terminology, say "think of it like the fraud triage example: the AI flags it, the analyst approves it, and the approval is recorded."
- **HOLD is not a failure** — Clients sometimes interpret HOLD as a problem. Correct this early: *"HOLD means the system is working. It's doing exactly what it should: pausing until a human authorizes."*
- **Don't fill in the field map for them** — Ask questions and let them give you the answers. The field map only works if it reflects their actual workflow.

**After the practice session:**
- Review the completed field map together
- Identify any sections that felt unclear
- Adjust your facilitation approach

---

## Module 4 — Running the 30-Minute Onboarding (Practice, 1 hour)

**Goal:** Deliver the 30-minute onboarding session confidently, alone.

**Preparation:**
1. Read `training/30-minute-onboarding-agenda.md` in full
2. Set up a demo environment: `pnpm demo:web` running before the session
3. Practice the demo transitions: REJECT → HOLD → ALLOW

**Practice session (internal):**

Deliver the full 30-minute session to Tina or another team member as if they are a client. Time it.

**Key facilitation points:**

**Opening (5 min):** Set the frame. *"By the end of this, you'll know what CerbaSeal does in your specific workflow."* Keep it grounded in their workflow, not generic.

**The demo (part of minute 5–10):** Do not explain what you're about to do. Run it. Then explain what happened. Seeing REJECT before reading about REJECT is more powerful than the reverse.

**Roles and responsibilities (minute 17–22):** This is where you hand off ownership to the client team. Be explicit: *"You own the deployment. You own the audit log. We support you — we don't manage it for you."* Say this clearly. Clients who don't understand this become difficult to support.

**What's out of scope (minute 22–27):** Don't skip this. Clients who don't understand scope at kick-off will ask for out-of-scope things during the pilot. Set the boundary here.

---

## Module 5 — Handling Common Questions (Self-Study, 30 minutes)

**Goal:** Answer 90% of client questions without calling Jesse.

**Study:**
1. Read `training/faq.md` in full
2. Read `training/common-errors-and-fixes.md`
3. Read `frequently-asked-objections.md`

**The most important questions to know cold:**

| Question | Your Answer |
|---|---|
| Does this certify EU AI Act compliance? | No. It produces governance evidence that supports compliance review. Certification is a legal determination. |
| Can the AI approve its own proposals? | No. Structurally impossible. Hard code — not a setting. |
| What happens if the system is unavailable? | Fail-closed. The action doesn't execute. |
| Does data leave our environment? | No. Runs entirely in your infrastructure. |
| What's the difference between HOLD and REJECT? | HOLD = paused, waiting for approval. REJECT = refused, permanent for this request. Both produce evidence. |
| What is an evidence bundle? | A permanent record of the enforcement decision: who proposed what, who authorized, when, under which policy. |
| Can we add a second workflow? | Not during this pilot. That's a next phase. |

**Practice:** Have someone ask you these questions without looking at your notes. Answer from memory.

---

## Module 6 — EU Compliance Framing (Self-Study, 30 minutes)

**Goal:** Be comfortable discussing EU AI Act and NIS2 relevance without overclaiming.

**Study:**
1. Read `eu-ai-act-nis2-mapping-support.md` in full
2. Memorize the standard disclaimer

**The language rules:**
- Use: "supports", "contributes to", "helps evidence", "is relevant to"
- Never use: "certifies", "guarantees compliance", "proves compliance", "satisfies Article X"
- Always: *"Your legal team needs to confirm what this means for your specific compliance obligations."*

**Self-test:** A client says: *"If we use CerbaSeal, we'll be compliant with Article 14 of the EU AI Act."*

Your response:

> *"CerbaSeal contributes to Article 14 requirements by structurally enforcing that AI systems cannot self-authorize — every action requires human authorization, and that authorization is recorded. Whether your implementation satisfies Article 14 fully is a question for your legal team. We can tell you what the evidence says — not what it certifies."*

Practice this response until it feels natural and confident.

---

## Module 7 — When to Involve Jesse (Self-Study, 15 minutes)

**Goal:** Know exactly the threshold for escalating to Jesse — and the threshold for not escalating.

**Involve Jesse when:**
- Tests fail on an unmodified, clean repository
- Proof checksum fails on an unmodified repository
- `GATE_INTERNAL_REJECT` occurs
- A client requests a new authority class or workflow class not in the current system
- A client's deeply technical question about the enforcement architecture requires code-level explanation
- Commercial agreement terms need to be negotiated

**Do not involve Jesse when:**
- A client asks what HOLD means → FAQ
- A client can't get `pnpm install` to work → troubleshooting guide
- A client wants to know about EU AI Act → `eu-ai-act-nis2-mapping-support.md`
- A client wants to add a second workflow → "out of scope, next phase"
- A client has a question you can't immediately answer → "I'll find out and follow up in writing within 48 hours"

**The rule:** If you can find the answer in any document in `docs/client-adoption/`, you should find it there before escalating.

---

## Trainer Certification Checklist

Before facilitating your first solo client session, confirm you can do all of the following without documentation:

**Fundamentals:**
- [ ] Explain CerbaSeal in 30 seconds
- [ ] Explain ALLOW / HOLD / REJECT in plain language
- [ ] Explain why AI cannot self-authorize (structural, not a setting)
- [ ] Explain what an evidence bundle is
- [ ] Explain why CerbaSeal does not certify compliance

**Facilitation:**
- [ ] Run the browser demo (REJECT → HOLD → ALLOW)
- [ ] Facilitate sections A–M of the workflow mapping workbook
- [ ] Complete a CerbaSeal Field Map from a client conversation

**Sessions:**
- [ ] Deliver the 30-minute onboarding agenda solo
- [ ] Handle the top 7 common questions from Module 5

**Support:**
- [ ] Use the support decision tree to route a question
- [ ] Know when to escalate to Jesse vs. when to find the answer yourself

**Compliance framing:**
- [ ] Use the correct language (supports / contributes / helps evidence)
- [ ] Deliver the standard compliance disclaimer naturally

**Certification:** Have Olivia or another experienced team member observe one practice session and confirm.

---

## Ongoing — After Your First Client Session

After each client interaction, spend 10 minutes:

1. What questions did the client ask that you couldn't immediately answer? → Check if the answer exists in documentation. If not, request it be added.
2. What parts of the workflow mapping took longer than expected? → Note for process improvement.
3. Did any out-of-scope requests come up? → Document them. These become data points for future product development.
4. Did you escalate to Jesse? Why? → If it was avoidable, figure out how to avoid it next time.

The training program improves with each delivery. Feedback from real client sessions is the most valuable input.
