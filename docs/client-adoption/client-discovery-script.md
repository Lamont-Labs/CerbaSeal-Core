# CerbaSeal — Client Discovery Script

**Audience:** Line Axia (Olivia, Tina, or any team member)  
**Purpose:** Run a full discovery call with a prospect without Jesse on the line.  
**Format:** Structured conversational guide — not a rigid script. Adapt to the conversation.  
**Call duration:** 45–60 minutes  
**Goal:** Determine whether a prospect is a good fit for a CerbaSeal pilot and identify the right workflow.

---

## Before the Call

**Prepare:**
- [ ] Know the prospect's industry and general AI use case (from email or prior contact)
- [ ] Review the client readiness assessment so you know what you're scoring
- [ ] Have the Line Axia partner enablement pack open for reference
- [ ] Review the relevant governance template (fraud triage / transaction escalation / account hold / generic) if you have a sense of the workflow type
- [ ] Have the pilot sizing framework open — you may need to reference tier definitions

**You do not need Jesse on this call.** If a deeply technical question arises that you cannot answer, write it down and follow up asynchronously.

---

## Opening (5 minutes)

**Objective:** Set expectations and put the prospect at ease about the call format.

> "Thanks for making the time. The purpose of today's call is really just for us to understand your situation — what you're working with, what problems you're trying to solve, and whether CerbaSeal is actually relevant for you. I'd rather spend an hour finding out it's not the right fit than waste your time on something that doesn't match.

> So I'm going to ask a lot of questions. Is that okay? And if at any point you want to go off-script and just tell me what you're thinking, please do."

---

## Section 1 — Their World (10 minutes)

**Objective:** Understand the organization, industry, and general AI posture before going into specifics.

**Questions to ask:**

1. *"Tell me a bit about [organization name] — what do you do and where does AI fit in your operations today?"*

   **Listen for:** Industry, whether AI is actually deployed or just planned, scale of AI use, whether they're doing anything consequential with AI.

2. *"When you think about AI in your organization — is it one specific use case, or is AI in a lot of places?"*

   **Listen for:** Breadth of AI use. If it's in many places, ask: *"Which one are you most concerned about from a governance perspective?"* — this is often where the real need lives.

3. *"What's your regulatory or compliance context? Are you operating in a regulated industry, or are there specific regulations you're worried about?"*

   **Listen for:** EU AI Act awareness, NIS2, GDPR, financial regulation, healthcare regulation. High regulatory context = stronger fit.

4. *"How did you come to be thinking about AI governance specifically? What prompted this conversation?"*

   **Listen for:** Is there an incident, an audit, a regulator, a board question, or just general awareness? Urgency driver matters for timeline.

**Scoring as you go (silent — don't share):**
- Industry and regulatory context: High relevance (3) / Moderate (2) / Low (1) / Unknown (0)
- AI is actually deployed: Yes (3) / Partially (2) / Planned (0)
- Real urgency driver: Yes (3) / General awareness (1) / None (0)

---

## Section 2 — The AI Workflow (15 minutes)

**Objective:** Identify the specific workflow — if there is one — where CerbaSeal would apply.

**Questions to ask:**

5. *"Can you walk me through a specific example — an AI-assisted decision or action that happens in your operation today? Not in theory — something that's actually happening."*

   **Listen for:** Concreteness. Vague answers ("we're using AI to improve efficiency") are a yellow flag. Specific answers ("our model flags transactions over €50K for escalation") are a strong green signal.

6. *"When the AI makes that recommendation — what happens next? Does someone review it before it executes? Or does it execute automatically?"*

   **Listen for:** Whether there's currently any human oversight, even informal. If it executes automatically with no review: that's actually the strongest use case for CerbaSeal (most urgency). If there's informal review: that's where CerbaSeal adds structure to something that already exists.

7. *"How often does this workflow run? And what's the consequence if the AI gets it wrong — what's the worst-case outcome?"*

   **Listen for:** Volume (frequency tells you operational importance) and consequence (high-consequence = strong fit). Low-consequence workflows are poor pilot candidates.

8. *"Is there currently any record of who authorized what — when an AI recommends something and a human approves it, is that recorded anywhere?"*

   **Listen for:** If yes — what format? Is it reliable? Is it tamper-evident? If no — this is often the moment the prospect realizes the gap.

9. *"Has anyone ever asked you to produce a log of AI governance decisions — an auditor, a regulator, a board member? And if they did, could you?"*

   **Listen for:** Whether the audit evidence need is real or theoretical. If they've actually been asked and couldn't answer — that's an immediate urgency driver.

**Scoring as you go:**
- Specific AI workflow exists and is in production: Yes (3) / In testing (2) / Planned (0)
- Consequential AI actions: High-consequence (3) / Moderate (2) / Low (1)
- Human oversight currently informal or absent: Yes (3) / Structured but undocumented (2) / Fully documented (1)
- Audit trail evidence gap is real: Experienced it (3) / Aware of gap (2) / Not a concern (0)

---

## Section 3 — Their Technical and Organizational Reality (10 minutes)

**Objective:** Assess whether they can actually deploy and operate CerbaSeal.

**Questions to ask:**

10. *"Who would own the technical deployment on your side? Do you have a DevOps or engineering person who could manage a Node.js service in your environment?"*

    **Listen for:** Named person, comfort with server management. No technical owner = pilot cannot proceed. Must be a non-negotiable.

11. *"What does your infrastructure look like? Are you on cloud, on-prem, or mixed? And is there someone who controls the server environment for this kind of deployment?"*

    **Listen for:** Whether they have a controlled environment. Key question: is the environment theirs to deploy into, or is it locked down by a third party?

12. *"How does your organization typically make decisions about bringing in a new tool or service? Who would need to approve something like a pilot engagement?"*

    **Listen for:** Decision-making path. Is the person on the call the decision-maker, or is there a procurement process? Long procurement = bad fit for a pilot timeline.

13. *"What does your timeline look like? Is there any urgency — a deadline, an audit, a product launch — that's driving timing on your end?"*

    **Listen for:** Urgency vs. exploration. Q4 target (what Olivia mentioned) = reasonable. "We're just exploring" with no driver = low urgency, longer sales cycle.

**Scoring as you go:**
- Technical owner named and available: Yes (3) / Likely (2) / No (0 — flag)
- Client-controlled infrastructure: Yes (3) / Shared/complex (1) / No (0)
- Decision-maker on the call or accessible: Yes (3) / Accessible (2) / Long procurement (1)
- Timeline urgency: Real driver (3) / Q4 target (2) / Exploratory (1)

---

## Section 4 — Checking for Red Flags (5 minutes)

**Objective:** Explicitly check for the red flags that disqualify a prospect from the first pilot.

**Questions to ask or probe for:**

14. *"What's your expectation of what a pilot would look like — what would you want to see at the end to say 'this was worth our time'?"*

    **Red flags to listen for:**
    - Expects regulatory certification or compliance proof → Address immediately (see objection guide)
    - Expects unlimited support → Address scope upfront
    - Wants to govern 5 workflows → Pilot is one workflow only
    - Expects Jesse on-call → Explain support model now

15. *"Are there any constraints I should know about — security review requirements, data sovereignty requirements, specific compliance certifications your vendors need to have?"*

    **Listen for:** Requirements that can't be met at the pilot stage (SOC 2 certification, ISO 27001, etc.). If present, explain the current status honestly and assess whether it's a blocker.

---

## Section 5 — Explaining CerbaSeal (5 minutes)

**Objective:** Give them just enough explanation to understand the fit — tailored to what you learned about their workflow.

**Do not give the full 2-minute pitch at this point.** You've been listening for 35 minutes. Now you know enough to be specific.

Example framing using what you learned:

> "Based on what you've described — [their specific workflow] — here's where CerbaSeal fits. Right now, your AI is proposing [their action] and a human reviews it informally. CerbaSeal would make that review structural: the action cannot execute without passing through the enforcement gate, and every decision — whether approved, held, or rejected — produces a tamper-evident record.

> The specific thing you mentioned about [audit/regulator/board] — this is exactly what CerbaSeal produces. It doesn't certify compliance, but it produces the evidence trail that supports it.

> The deployment would be in your environment — nothing leaves your infrastructure. And the pilot scope would be exactly this workflow: one workflow, one decision path, controlled evaluation."

**Then:** Ask what questions they have.

---

## Section 6 — Qualifying Next Steps (5 minutes)

**Objective:** Either advance to readiness assessment and workflow mapping, or identify what needs to change first.

**Close the call with:**

16. *"Based on what we've talked about — how does this feel? Does it match what you were hoping for, or does it feel like it's aimed at something different?"*

    **Listen for:** Enthusiasm, uncertainty, or misalignment. Address misalignment now, not in a follow-up email.

17. *"The next step, if you want to continue, would be a workflow mapping session — about 2 hours where we go deep on [their specific workflow] and figure out exactly how CerbaSeal would work for you. We'd come back with a configuration and a deployment plan. Is that something you'd want to do?"*

**If yes:** Schedule the workflow mapping session. Send the workflow mapping workbook ahead of time so they can prepare.

**If uncertain:** Identify what would help them decide. Usually it's:
- Seeing the system run (send browser demo link or schedule a demo)
- Getting internal approval
- Understanding pricing better (send pilot sizing framework)

**If no:** Thank them. Ask what would need to change for this to be relevant. Document and log.

---

## After the Call

**Within 24 hours:**

1. Complete the client readiness assessment scoring based on the call
2. Send a follow-up email summarizing:
   - What you heard from them (their workflow, their gap)
   - What CerbaSeal would do in their context
   - Clear next step
3. If advancing: send workflow mapping workbook with a note to review Section A before your session

**Share with Jesse:** A brief written summary (3–5 bullets) of the call. You do not need Jesse to review every lead — just keep him informed of pipeline.

---

## Quick Scoring Reference

Total up your silent scoring from Sections 1–3:

| Score | Rating | Action |
|---|---|---|
| 24–33 | Green — Strong fit | Advance to workflow mapping session |
| 16–23 | Yellow — Possible fit | Identify and resolve key gaps before advancing |
| 8–15 | Red — Poor fit | Do not advance. Document what would need to change. |
| 0–7 | Disqualify | Not a fit at this time |

*This is a rough guide. Use judgment — a perfect score with no named technical owner is still a no-go.*

---

## Questions You Cannot Answer — What To Do

If a question comes up that you genuinely cannot answer, use this:

> "That's a good technical question — let me get you a clear answer on that from Jesse rather than guess. I'll follow up in writing by [specific date]."

Write it down. Send it to Jesse asynchronously. Jesse responds. You relay the answer in writing.

Do not let unanswered technical questions create open loops. Close them in writing within 48 hours.
