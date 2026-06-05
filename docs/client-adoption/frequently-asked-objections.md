# CerbaSeal — Frequently Asked Objections

**Audience:** Line Axia (sales and advisory use)  
**Purpose:** Detailed objection handling for every common prospect pushback — with full answers and follow-up questions.  
**Version:** 0.1.0

---

## How to Use This Guide

This guide goes deeper than the quick objection table in the partner enablement pack. Each objection includes:
- The full objection as a prospect might say it
- What the objection usually *actually means* underneath
- The recommended response
- Follow-up questions to ask
- When to concede and when to hold your ground

---

## Category 1 — "We don't need this yet"

### 1a. "Our AI is still early-stage — this feels premature."

**What it usually means:** *We don't have a mature enough AI deployment to warrant governance infrastructure, or we don't feel the urgency yet.*

**Response:**

> "That actually makes sense — governance infrastructure applied too early, before there's anything to govern, is overhead without benefit. But there's a specific moment where 'early-stage' ends: when an AI system starts proposing actions that affect real customers, finances, or compliance-relevant records. Once that's happening, the cost of not having governance evidence starts accumulating invisibly. When an auditor asks 'show me who authorized that decision in Q3,' retroactive reconstruction is very hard.

> Can you tell me more about where you are? Is the AI workflow actually running in any capacity, or is it genuinely still in design?"

**Follow-up:** If they describe an AI workflow that's influencing real decisions, even informally — that's not early-stage anymore.

**When to concede:** If the AI workflow genuinely doesn't exist yet and they have no deployment plans in the next 6 months. Note the conversation and check back in.

---

### 1b. "We're already compliant — we have policies and controls in place."

**What it usually means:** *We have paperwork. We don't see why we need technical enforcement on top of policies.*

**Response:**

> "Policies are necessary but not sufficient for what regulators are now asking for. The EU AI Act in particular doesn't ask 'do you have a human oversight policy?' — it asks 'can you demonstrate that human oversight actually happened for specific decisions?' That requires a technical evidence trail, not just a policy document.

> CerbaSeal is the technical layer that makes your policies real — it's what proves the policy was followed, not just that it exists. Without it, the answer to 'show me the record of human authorization for this AI decision' is usually 'we have a process, but we can't show you the specific record for that specific decision.'

> Would that be a problem in your context — being asked to produce specific records?"

**When to concede:** If their regulatory context genuinely doesn't require decision-level evidence — some industries don't, yet. Acknowledge it and leave the door open.

---

## Category 2 — "This seems too limited"

### 2a. "We need something that covers our whole AI governance program."

**What it usually means:** *We want a full compliance platform, not a single enforcement primitive.*

**Response:**

> "A full AI governance program has many components — policy management, vendor risk assessment, model monitoring, incident reporting, documentation management. CerbaSeal addresses one specific and technically hard problem within that: enforcing that human authorization happens before AI-proposed actions execute, and producing verifiable evidence of that authorization.

> It's not a full governance platform, and it doesn't claim to be. But the specific thing it does — structural enforcement at the decision boundary with a tamper-evident audit trail — is the thing that's hardest to build yourself and most impactful for audit and regulatory conversations.

> The question isn't whether you need a full governance program. You do. The question is: do you have a solution for this specific piece today — the authorization boundary?"

**Follow-up:** *"What's currently in place for proving AI authorization at the decision level?"*

**When to concede:** If they already have a robust technical authorization enforcement layer. Rare, but possible.

---

### 2b. "We looked at Vanta / [big compliance platform]. Why would we use this instead?"

**What it usually means:** *We're comparing CerbaSeal to enterprise GRC platforms and think bigger = better.*

**Response:**

> "Vanta and similar platforms do something different — they help you manage compliance documentation, security questionnaires, and evidence collection for frameworks like SOC 2, ISO 27001, and GDPR. They're excellent for what they do.

> CerbaSeal is a different category. It enforces the authorization boundary at runtime — before an AI-proposed action executes. Vanta cannot tell you, for a specific AI decision made last Tuesday, that a specific human authorized it before it ran and produce a tamper-evident record of that authorization. CerbaSeal can.

> These are complementary, not competing. If you're using Vanta, CerbaSeal feeds it better AI governance evidence than anything else will.

> Are you currently trying to address AI decision authorization specifically, or is this more about broad compliance framework coverage?"

---

### 2c. "One workflow isn't enough. We have AI in many places."

**What it usually means:** *We need comprehensive coverage, not a point solution.*

**Response:**

> "That's exactly why we start with one workflow. Organizations that try to govern everything at once typically govern nothing well — the scope becomes too complex to define success criteria for, and pilots turn into multi-year implementation projects.

> What we've found is that one well-governed workflow teaches you more than you expect: how to map AI actions to governance requirements, how your human authorization process actually works versus how you thought it worked, and what evidence is actually useful when you need it.

> The second workflow is always faster than the first. By the time you've done one successfully, you have a template.

> Which of your AI workflows has the highest consequence if something goes wrong? That's where we start."

**When to hold your ground:** Always. Pilot scope is one workflow. This is non-negotiable.

---

## Category 3 — "We're concerned about you specifically"

### 3a. "This is a one-person company. What happens if Jesse isn't available?"

**What it usually means:** *We're worried about key-person dependency and business continuity.*

**Response:**

> "That's a fair and important concern — and it's one we've been deliberate about. The deployment model is specifically designed around this: CerbaSeal runs in your infrastructure, not ours. If Lamont Labs became unavailable tomorrow, your enforcement layer would keep running, your audit log would keep accumulating evidence, and your technical team would have everything they need to continue operating.

> The pilot engagement is scoped to bounded support hours precisely because we designed it so clients can self-operate after onboarding. That's not aspirational — it's structural.

> We also have a tiered support model where Line Axia handles day-to-day support, and Jesse is involved only for code-level issues. The goal is that Jesse's involvement per pilot is under 8 hours.

> What specifically are you worried about — if Jesse was unavailable for a week, what operational impact are you imagining?"

---

### 3b. "You haven't had a third-party security review. We can't bring in unreviewed software."

**What it usually means:** *Security review is a procurement requirement, or a real risk concern.*

**Response:**

> "That's completely understandable, and it's something we're transparent about. A formal third-party security review hasn't been completed. The enforcement core has gone through rigorous internal adversarial testing — 391 tests including bypass attempts, forgery scenarios, and boundary probes — but that's not the same as an independent external review.

> A third-party security review is on the roadmap as a pre-commercial milestone. For a pilot engagement in a controlled environment, most organizations treat this as a bounded risk — you're evaluating a scoped system in your own environment, not deploying it as a production-critical service.

> Is the security review a hard requirement for any vendor, or is it something that can be addressed during the pilot period? Some organizations do a limited security assessment as part of the pilot rather than requiring a full review before starting."

**When to concede:** If their procurement policy genuinely requires it and won't flex. Acknowledge the limitation, note the roadmap, and revisit when the review is complete.

---

### 3c. "We need a vendor with EU presence."

**What it usually means:** *Data sovereignty, GDPR, or procurement policy requires an EU entity.*

**Response:**

> "Line Axia is the EU-based delivery partner for this engagement. We're an EU entity, and we contract with clients on that basis. Jesse Lamont / Lamont Labs is a named party in the agreement as the technology provider, but the contractual relationship with you is through Line Axia.

> For data residency specifically: CerbaSeal is designed to run entirely in your infrastructure. No enforcement data leaves your environment — the audit log, evidence bundles, and proof snapshots all stay on your servers. The EU presence question for data is answered by your deployment model, not by where the developer is based.

> Does that address the concern, or is there a specific GDPR or procurement policy requirement we should understand?"

---

## Category 4 — "The timing doesn't work"

### 4a. "We need this in production in 4 weeks."

**What it usually means:** *They have a real deadline and want to move fast.*

**Response:**

> "Let me be honest about what's realistic. A well-prepared pilot takes 4–6 weeks — that's deployment, testing, evidence review, and closeout. If your deadline is in 4 weeks, we're looking at a very compressed Tier 1 Discovery Pilot — synthetic scenarios, no live data, validation only.

> The question is: what do you actually need to be true in 4 weeks? Is it that you need to demonstrate to an auditor or board that governance is in place? Or that it needs to be processing live transactions by that date? Those require different things.

> Let's figure out the minimum valuable outcome that works for your deadline and scope from there."

**When to be careful:** Don't promise something you can't deliver. A compressed timeline increases the risk of the pilot failing. Be explicit about that trade-off.

---

### 4b. "August is coming — nobody works in August."

**What it usually means:** *European procurement reality.*

**Response:**

> "We know. Nothing moves in August. Let's use that to our advantage — if you're interested in moving forward, June and July are the right time to do the workflow mapping and get the working agreement drafted. Deployment can happen in September when your team is back. That means the pilot closes before the end of Q4 — which is exactly the right timeline.

> Does your team have bandwidth now to start the foundational work — workflow mapping and commercial structure — even if deployment waits until September?"

---

### 4c. "Our procurement takes 6–12 months."

**What it usually means:** *Enterprise procurement reality, or they're looking for a reason to delay.*

**Response:**

> "Enterprise procurement for a full production deployment, yes — that's realistic. But a pilot agreement is typically a much lighter commercial instrument. It's a scoped, time-limited engagement with a defined exit — not a multi-year contract.

> What would it take to get a pilot agreement through your procurement in 6–8 weeks? Is there a simplified vendor review process for bounded pilots, or a way to route this through an existing approved vendor relationship?"

---

## Category 5 — "I don't understand what this actually does"

### 5a. "I still don't understand how this is different from our current logging."

**What it usually means:** *They have an audit log and don't see why this is different.*

**Response:**

> "Here's the key distinction: your current logging records what happened after it happened. CerbaSeal enforces governance before it happens.

> Specifically: an AI system cannot produce an authorized execution outcome without passing through CerbaSeal's gate. The authorization isn't added to a log retroactively — it's required as a precondition for the action to be authorized at all. The evidence is produced as part of the enforcement, not appended after.

> The practical difference: with a standard audit log, you can prove that something happened. With CerbaSeal, you can prove that a specific human authorized a specific AI action before it ran, that the authorization was valid, and that the evidence record cannot have been created without that authorization having occurred. That's a different claim.

> When was the last time someone asked you to prove AI authorization specifically — not just that an action happened?"

---

### 5b. "We have a human in the loop already. What does CerbaSeal add?"

**What it usually means:** *They have a human review step and think that covers governance.*

**Response:**

> "A human in the loop is necessary — but a process step and structural enforcement are different things. A human review step can be bypassed under load, skipped in an emergency, or informally worked around. There's also no guaranteed record that the review happened and that it happened before the action ran.

> CerbaSeal makes the human review structural: the execution pathway literally cannot produce an ALLOW outcome without a valid human authorization passing through the enforcement gate. And every decision — the authorized ones AND the rejected/held ones — produces a permanent, tamper-evident evidence record.

> The question isn't whether you have humans reviewing — it's whether you can prove, for any specific decision, that the review happened before the action ran and that the record hasn't been altered since."

---

## Category 6 — Concessions You Can and Cannot Make

### Can Make
- Adjusting pilot timeline within reason
- Discussing pricing flexibility within the working ranges (Tier 2 is €35K–€75K; adjustments are justified by scope factors)
- Answering technical questions in writing with Jesse's input
- Offering the 30-minute onboarding session as a free discovery demo

### Cannot Make
- Promising compliance certification of any kind
- Expanding pilot scope to multiple workflows
- Committing to 24/7 support
- Promising a third-party security review by a specific date
- Altering the enforcement core behavior during a pilot
- Committing to Jesse's indefinite availability

When a prospect pushes for something you cannot commit to, say:

> *"I want to be direct with you: that's not something I can commit to in the current pilot scope. Here's what I can commit to: [what you CAN do]. If [their request] is a firm requirement, let's understand whether there's a path to addressing it in a post-pilot commercial arrangement."*

Always leave the door open. Never close a relationship — just define what's possible now versus later.
