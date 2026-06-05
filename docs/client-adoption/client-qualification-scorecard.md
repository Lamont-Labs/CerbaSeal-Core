# CerbaSeal — Client Qualification Scorecard

**Audience:** Line Axia  
**Purpose:** Rapid qualification scoring for prospects — Green / Yellow / Red — without requiring Jesse.  
**When to use:** During or immediately after a discovery call. Complete within 24 hours.  
**Version:** 0.1.0

---

## How to Use

Score each criterion. Sum the scores. Apply the rating. The rating determines your next action.

Use this alongside the discovery script (`client-discovery-script.md`), not instead of it.

---

## Section A — Must-Pass Criteria (Disqualifiers)

These are binary. If any answer is NO, stop. Do not proceed to scoring.

| Criterion | Pass | Fail |
|---|---|---|
| Prospect has at least one AI workflow in production today (not planned) | Yes → Continue | No → Stop. Not ready. |
| Prospect has a named technical owner who can manage a Node.js service | Yes → Continue | No → Stop. Deployment impossible. |
| Prospect does not expect compliance certification from CerbaSeal | Correct expectation → Continue | Expects certification → Stop. Correct or disqualify. |
| Prospect does not expect 24/7 support | Correct expectation → Continue | Expects 24/7 → Stop. Explain scope or disqualify. |
| Prospect is willing to host CerbaSeal in their own environment | Yes → Continue | No → Stop. Discuss alternatives. |

**All five must pass before scoring.**

---

## Section B — Scored Criteria

Score each 0–3: 0 = not present / 3 = strong / intermediate values for partial.

### B1 — AI Workflow Quality

| Criterion | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| AI workflow exists and is in production | No workflow | Planned | In testing | In production |
| Workflow produces consequential outputs | No consequence | Low consequence | Moderate | High — financial, compliance, customer impact |
| Decision point is identifiable | Cannot describe | Vague | Described generally | Specific and clear |
| Human oversight exists (even informal) | None | Informal/ad hoc | Partially structured | Structured but undocumented |

**B1 Score:** \_\_\_ / 12

---

### B2 — Evidence and Audit Need

| Criterion | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Audit trail gap is acknowledged | Not aware of gap | Vaguely concerned | Aware of specific gap | Has experienced a real request for evidence they couldn't produce |
| Regulatory or compliance driver exists | None | General awareness | Specific regulation identified | Active regulatory engagement or deadline |
| Internal audit or board driver | None | Considered | Active discussion | Formal requirement |

**B2 Score:** \_\_\_ / 9

---

### B3 — Technical Capability

| Criterion | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Technical owner named and available | No technical person | Technical person exists but not identified | Named but partially available | Named, committed, comfortable with Node.js |
| Infrastructure control | Third-party controlled, locked | Shared/complex | Mostly controlled | Fully client-controlled server environment |
| Node.js and basic DevOps experience | None | Basic familiarity | Comfortable | Experienced |

**B3 Score:** \_\_\_ / 9

---

### B4 — Organizational Fit

| Criterion | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Internal champion exists | No champion | Potential champion | Named champion | Named champion with budget authority |
| Decision-making path is clear | Long/complex procurement | Multiple approvals needed | One approval needed | Decision-maker on the call |
| Timeline urgency | No driver | General interest | Q4 target | Active urgency (audit, incident, deadline) |
| Pilot scope appetite | Wants everything at once | Skeptical of constraints | Open to one workflow | Eager to start small and prove value |

**B4 Score:** \_\_\_ / 12

---

### B5 — Commercial Fit

| Criterion | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Budget awareness exists | No budget discussion | Exploring options | Budget allocated | Budget confirmed and available |
| Pricing expectations are realistic | Expects free or near-free | Significantly below market | Moderate expectation | Realistic for a scoped pilot |
| Procurement timeline | 12+ months | 6–12 months | 3–6 months | Can move in weeks |

**B5 Score:** \_\_\_ / 9

---

## Scoring Summary

| Section | Max | Score |
|---|---|---|
| B1 — AI Workflow Quality | 12 | |
| B2 — Evidence and Audit Need | 9 | |
| B3 — Technical Capability | 9 | |
| B4 — Organizational Fit | 12 | |
| B5 — Commercial Fit | 9 | |
| **Total** | **51** | |

---

## Qualification Rating

| Score | Rating | Color | Action |
|---|---|---|---|
| 41–51 | **Strong Fit** | 🟢 Green | Advance immediately to workflow mapping session |
| 28–40 | **Possible Fit with Conditions** | 🟡 Yellow | Identify specific gaps. Define what must change before advancing. Set a conditional timeline. |
| 15–27 | **Not Ready** | 🔴 Red | Do not advance. Document barriers. Set a re-evaluation date (3–6 months). |
| 0–14 | **Poor Fit** | ⛔ Disqualify | End the sales conversation politely. Document why. |

---

## Yellow Flag — Conditions Required

If the rating is Yellow, identify which sections pulled the score down and define what must change:

| Section | Gap | Required Change Before Advancing |
|---|---|---|
| B1 — AI Workflow | No workflow in production | Wait until workflow is deployed |
| B2 — Evidence Need | No regulatory driver | May advance if organizational driver exists — weaker fit |
| B3 — Technical | No named technical owner | Require named owner before scheduling workflow mapping |
| B3 — Technical | No controlled infrastructure | Resolve infrastructure access before scheduling deployment |
| B4 — Organizational | No internal champion | Require named champion with authority before advancing |
| B4 — Organizational | Long procurement | Accept but plan for longer sales cycle; do not block workflow mapping |
| B5 — Commercial | Budget not confirmed | Accept for early stage; require confirmation before signing |

---

## Automatic Disqualifiers (Override Any Score)

Even with a high score, disqualify if:

- Prospect explicitly expects CerbaSeal to certify compliance with any regulation
- Prospect expects Jesse to be available 24/7 or on-call
- Prospect wants to govern 5+ workflows in the pilot
- No technical owner and client is unwilling/unable to hire or designate one
- Prospect's procurement requires 12+ months and they have no urgency driver

---

## Field Notes (Fill in after discovery call)

**Prospect:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
**Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
**Scored by (Line Axia):** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  

**AI Workflow described:**  
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Named technical owner:**  
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Urgency driver:**  
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Rating:** \_\_\_\_\_\_\_\_\_\_\_ (Green / Yellow / Red / Disqualify)

**Total score:** \_\_\_\_ / 51

**Conditions required before advancing (if Yellow):**  
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Agreed next step:**  
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Send to Jesse:** Yes / No (Jesse informed for Green ratings; brief summary only)
