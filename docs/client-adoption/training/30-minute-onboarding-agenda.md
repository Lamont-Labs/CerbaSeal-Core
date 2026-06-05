# CerbaSeal — 30-Minute Onboarding Agenda

**Audience:** Line Axia (facilitator), client team (operational + technical leads)  
**Format:** Live session, remote or in-person  
**Prerequisites:** Client has passed readiness assessment; workflow mapping workbook is complete  
**Goal:** Client team understands what CerbaSeal does, what they will see during the pilot, and what their responsibilities are.

---

## Attendees

**Required:**
- Client technical owner (admin)
- Client operational lead (supervisor of reviewers and operators)

**Optional / recommended:**
- 1–2 representative reviewers/approvers
- Line Axia account contact (facilitator)

**Not required:**
- Lamont Labs / Jesse (unless a specific technical deep-dive is needed)

---

## Agenda

### [00:00 – 05:00] Welcome and Framing (5 minutes)

**Facilitator (Line Axia) opens:**

1. Introduce attendees briefly
2. State the purpose of this session:  
   *"By the end of this 30 minutes, you'll know exactly what CerbaSeal does in your workflow, what ALLOW/HOLD/REJECT mean for your team, and what you're responsible for during the pilot."*
3. Confirm the pilot scope:  
   *"We're focusing on [workflow name] — one workflow, one decision path. Everything in this session is about that one workflow."*

---

### [05:00 – 10:00] What CerbaSeal Does (5 minutes)

**Key points to cover:**

- CerbaSeal is an enforcement gate — it sits between your AI system and the actions it proposes
- Three outcomes: ALLOW, HOLD, REJECT
- The most important rule: **AI cannot authorize its own proposals. Ever.** This is structural — it cannot be bypassed.
- Every decision produces a permanent evidence record

**Show** the live browser demo at `pnpm demo:web`:
1. Click "Run blocked AI action" → show REJECT (AI self-authorization blocked)
2. Click "Run missing-approval action" → show HOLD (no approval yet)
3. Click "Run approved action" → show ALLOW (all conditions met)

**Ask:** "Any questions about what you just saw?"

---

### [10:00 – 17:00] Your Workflow in CerbaSeal (7 minutes)

**Walk through the completed workflow mapping:**

Pull up the CerbaSeal field map from the workflow mapping workbook. Show it on screen.

Cover each item:

- **"This is your workflow class: [workflowClass]"** — this identifies your specific governed workflow
- **"When your AI system proposes [action], this is what CerbaSeal sees: [proposedActionClass]"**
- **"The approver in your system maps to: [authorityClass]"** — e.g., "Your Senior Analyst role maps to `senior_analyst`"
- **"Approval is required? [Yes/No]"** — and what that means in practice
- **"Your audit log will write to: [path]"** — explain that this is their evidence file

**Walk through one real scenario:**

*"Let's say [specific example from their workflow]. Here's what would happen..."*

Walk through: AI proposes → gate evaluates → HOLD → analyst approves → ALLOW → evidence recorded.

**Ask:** "Does this match how you think about the workflow?"

---

### [17:00 – 22:00] Roles and Responsibilities (5 minutes)

Cover the three roles briefly:

**Technical Admin ([admin name]):**
- Manages the deployment
- Monitors the audit log
- Runs verification checks
- First technical point of contact

**Reviewers/Approvers ([names]):**
- Receive HOLD notifications
- Review AI proposals
- Provide authorization
- Their approval is permanent — review carefully

**Operators ([names or "your team"]):**
- Work with decision outcomes daily
- Route HOLD decisions to reviewers
- Read reason codes for REJECT outcomes
- Do not attempt to work around outcomes

**Escalation path:**
1. Technical issue → admin
2. Issue unresolved → Line Axia contact ([name, email])
3. Line Axia escalates to Lamont Labs if needed

---

### [22:00 – 27:00] What to Expect During the Pilot (5 minutes)

Cover:

1. **Scenarios we will run:**
   - REJECT scenario: AI actor attempts self-authorization → outcome: REJECT
   - HOLD scenario: AI proposes action without approval → outcome: HOLD → analyst approves → re-submit → ALLOW
   - ALLOW scenario: Complete request with valid approval → outcome: ALLOW

2. **Support hours:** *"We have [X] support hours available over [Y] weeks. Routine questions go to [Line Axia contact]. Technical issues go through [admin]."*

3. **Evidence review:** *"At the end of the testing period, we'll review the evidence bundles together. You'll be able to see the audit chain and what each decision produced."*

4. **What success looks like:** Review the agreed success criteria from the pilot success framework.

5. **Out of scope reminders:**
   - No second workflow during this pilot
   - No custom feature requests
   - No compliance certification — this produces evidence, not certification

---

### [27:00 – 30:00] Questions and Next Steps (3 minutes)

**Open questions:** Ask attendees if they have any questions.

**Confirm next steps:**
- [ ] Admin: deploy CerbaSeal using quickstart guide (target date: [date])
- [ ] Admin: verify tests pass (391/391), audit passes (15/15), proof verified
- [ ] Facilitator: schedule first scenario testing session
- [ ] Facilitator: confirm support contact is saved in team communications

**Confirm contacts are saved:**
- Line Axia account contact: [name, email, WhatsApp if applicable]
- Technical escalation path is clear

**Close:**  
*"The pilot is one workflow, controlled scope, and we'll be with you throughout. The goal is learning — for you and for us. If something unexpected happens, that's information, not failure. Let's do it."*

---

## Facilitator Notes

- Keep it to 30 minutes. Don't over-explain the technical internals.
- The demo is your best tool — seeing REJECT / HOLD / ALLOW takes 2 minutes and communicates more than 10 minutes of explanation.
- The workflow mapping is the most important thing to verify in the room — if the client looks confused about their own workflow, stop and resolve that before anything else.
- If the technical owner has deployment questions, schedule a separate technical session after this one.
- Don't promise anything outside the agreed pilot scope. If someone asks "can we also govern [other workflow]?" — acknowledge the interest, note it for post-pilot discussion, stay focused.

---

## Materials to Have Ready

- [ ] Browser demo running (`pnpm demo:web`)
- [ ] Completed workflow mapping workbook (CerbaSeal field map)
- [ ] Pilot success criteria document (from pilot success framework)
- [ ] Line Axia contact details to share
- [ ] Quickstart deployment guide link for the admin
- [ ] Training guide links for each role
