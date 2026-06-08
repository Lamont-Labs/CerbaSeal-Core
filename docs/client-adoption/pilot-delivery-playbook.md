# CerbaSeal — Pilot Delivery Playbook

**Audience:** Line Axia (primary), Lamont Labs (reference)  
**Purpose:** Week-by-week guide to delivering a Tier 2 Controlled Workflow Pilot. Who does what, when, and what the expected outputs are.  
**Version:** 0.1.0

---

## How to Use This Playbook

This playbook covers a standard 5-week Tier 2 pilot. Adjust the timeline for Tier 1 (compress to 3 weeks) or Tier 3 (extend to 8 weeks).

Each week has:
- **Who does what** — explicitly assigned by role (Line Axia / Client / Lamont Labs / Jesse)
- **Expected outputs** — what exists at the end of the week that didn't at the start
- **Jesse hours** — estimated hours where Jesse participates
- **Gate check** — what must be true before the next week begins

Jesse hours are targeted at ≤ 8 total across the full pilot. If Jesse hours exceed 8, review the scope and support model.

---

## Pre-Pilot — Agreement and Readiness

**When:** Before Week 1 begins  
**Owner:** Line Axia (commercial), Lamont Labs (technical readiness)

**Activities:**

| Activity | Who | Notes |
|---|---|---|
| Complete client readiness assessment | Line Axia | Must score READY or LIKELY READY WITH SUPPORT |
| Sign working agreement | Line Axia + Client + Jesse | Commercial terms, support hours, IP, data handling |
| Confirm pilot tier | Line Axia + Jesse | Tier 1 / 2 / 3 |
| Agree pilot success criteria | Line Axia + Client | From pilot success framework — documented and signed |
| Confirm client technical owner | Client | Named person, available throughout pilot |
| Confirm Line Axia account contact | Line Axia | Named person for client escalations |
| Jesse confirms support hour allocation | Jesse | How many hours, in what time windows |

**Expected outputs:**
- Signed working agreement
- Completed readiness assessment
- Named contacts on all sides
- Agreed success criteria document

**Gate:** Working agreement signed. Named client technical owner confirmed. Success criteria agreed.

---

## Week 1 — Kick-Off and Workflow Mapping

**Goal:** Client team understands CerbaSeal. Workflow is mapped to CerbaSeal configuration.

### Day 1–2: 30-Minute Kick-Off Session

**Who runs it:** Line Axia (facilitator)  
**Who attends:** Client operational lead + client technical owner + Line Axia  
**Jesse:** Not required (unless client specifically requests)

Activities:
- Run the 30-minute onboarding agenda (`training/30-minute-onboarding-agenda.md`)
- Show the browser demo (`pnpm demo:web`) — REJECT / HOLD / ALLOW in live system
- Confirm agreed pilot scope: one workflow, one decision path
- Distribute role-specific training materials (self-directed reading)

**Outputs:**
- Client team has seen the enforcement gate in action
- Training materials distributed to each role
- Any early questions captured in writing

### Day 3–4: Workflow Mapping Session

**Who runs it:** Line Axia (facilitator) with client operational lead and technical owner  
**Jesse:** Optional standby — can answer technical questions asynchronously  
**Duration:** 2–3 hours

Activities:
- Work through sections A–M of the workflow mapping workbook
- Complete the CerbaSeal Field Map
- Resolve any ambiguities about ALLOW / HOLD / REJECT conditions
- Identify the three test scenarios (one per outcome)

**Outputs:**
- Completed workflow mapping workbook
- Signed-off CerbaSeal Field Map
- Three agreed test scenarios documented

### Day 5: Configuration Summary and Deployment Prep

**Who:** Client technical owner (primary), Line Axia (review)  
**Jesse:** Not required

Activities:
- Client technical owner reviews quickstart deployment guide
- Confirms Node.js 18+ available, pnpm available, server accessible
- Audit log path chosen and directory created
- `.env` file drafted (no secrets — just paths)

**Outputs:**
- Deployment environment confirmed ready
- Client technical owner has read and understood the quickstart guide

**Jesse hours this week:** 0–1 (async question answering if needed)

**Week 1 Gate:** Workflow mapping complete. CerbaSeal Field Map signed off. Deployment environment confirmed ready.

---

## Week 2 — Deployment and Validation

**Goal:** CerbaSeal is deployed, tests pass, proof verified, audit log writing. Client technical owner can operate independently.

### Day 1–2: Deployment

**Who:** Client technical owner (primary), Line Axia (support)  
**Jesse:** On standby — available within agreed support window if needed

Activities (from quickstart deployment guide):
1. Clone repository
2. `pnpm install`
3. `pnpm test` — confirm 419/419 passing
4. `pnpm audit:repo` — confirm 15/15 passing
5. `pnpm export:proof` + `pnpm verify:proof` — confirm stableChecksum
6. Configure `.env` with audit log path
7. `pnpm demo:support:validate` — confirm health check passes
8. Run browser demo — confirm REJECT / HOLD / ALLOW scenarios work

**If any step fails:** Client technical owner uses `troubleshooting-guide.md`. Escalates to Line Axia if unresolved. Line Axia escalates to Jesse if needed.

### Day 3: Workflow Configuration Test

**Who:** Client technical owner  
**Jesse:** Not required

Activities:
- Configure the enforcement request using the completed CerbaSeal Field Map
- Run the three agreed test scenarios against the deployed system
- Confirm outcomes match expected: REJECT / HOLD / ALLOW
- Confirm evidence bundles are produced
- Confirm audit log file is writing and chain is intact

### Day 4–5: Admin Handover

**Who:** Client technical owner reviews all admin responsibilities  
**Jesse:** Not required

Activities:
- Client technical owner reads `client-admin-guide.md` fully
- Confirms backup procedure for audit log
- Confirms access control on audit log path
- Runs `pnpm verify:proof` independently to confirm they can do it

**Outputs:**
- CerbaSeal deployed and passing all checks
- Three test scenarios producing expected outcomes
- Evidence bundles confirmed in audit log
- Client technical owner operating independently

**Jesse hours this week:** 0–2 (standby, only if troubleshooting needed)

**Week 2 Gate:** All checks pass (419 tests, 15/15 audit, proof verified). Three test scenarios confirmed. Client technical owner operating independently.

---

## Week 3 — Scenario Expansion and Evidence Review

**Goal:** Run a broader set of client-relevant scenarios. Review evidence quality. Confirm operational team understanding.

### Day 1–3: Extended Scenario Testing

**Who:** Client technical owner + client operational lead  
**Jesse:** Not required

Activities:
- Run additional scenarios beyond the three baseline cases
- Include edge cases: expired approval, malformed request, unknown authority class
- Document each scenario: input → expected outcome → actual outcome
- Capture any unexpected results for review

### Day 4–5: Evidence Review Session

**Who:** Line Axia (advisory) + client compliance or operational lead  
**Jesse:** Not required

Activities:
- Review evidence bundles from all test scenarios
- Walk through the audit log with the client
- Explain how the evidence maps to compliance requirements (using `eu-ai-act-nis2-mapping-support.md`)
- Confirm the client can retrieve and read evidence without assistance

**Outputs:**
- Expanded scenario set documented
- Evidence bundles reviewed and understood by client
- Any questions captured and answered (add to FAQ if new)

**Jesse hours this week:** 0–1 (async only, if an unexpected scenario result needs investigation)

**Week 3 Gate:** Extended scenarios complete. Evidence review done. Client operational team understands evidence output.

---

## Week 4 — Operational Confidence and Issue Resolution

**Goal:** Simulate realistic operational conditions. Resolve any open issues. Confirm the client can run independently.

### Day 1–2: Operational Simulation

**Who:** Client operational team (led by them, not by Line Axia)  
**Jesse:** Not required

Activities:
- Client runs a set of scenarios without Line Axia guidance
- Client technical owner interprets any unexpected outcomes independently
- Client uses `troubleshooting-guide.md` for any issues that arise
- Client escalates to Line Axia only if the troubleshooting guide doesn't resolve it

### Day 3–4: Open Issue Resolution

**Who:** Line Axia (coordinator), Jesse (if technical issue), Client  
**Jesse:** As needed — this is the week where any remaining issues are resolved

Activities:
- Review any open issues from Weeks 1–3
- Resolve outstanding questions
- Clarify any aspects of the workflow configuration that need adjustment
- Document any configuration changes with rationale

### Day 5: Confirm Pilot Readiness for Closeout

**Who:** Line Axia  
**Jesse:** Not required

Activities:
- Review success criteria checklist from pilot success framework
- Identify any criteria not yet confirmed
- Plan Week 5 review session agenda

**Jesse hours this week:** 0–3 (issue resolution only — if no issues, 0)

**Week 4 Gate:** All major issues resolved. Client team operating independently. Ready for closeout review.

---

## Week 5 — Review and Closeout

**Goal:** Formally review the pilot against agreed success criteria. Produce closeout deliverables. Define next steps.

### Day 1–2: End-of-Pilot Checklist Run

**Who:** Client technical owner, Line Axia  
**Jesse:** Not required

Activities:
- Run the complete success criteria checklist from `pilot-success-framework.md`
- For each criterion: confirmed / not confirmed / partially confirmed
- Document any criteria not met and why

### Day 3: End-of-Pilot Review Session

**Who:** Client (operational + technical leads + sponsor), Line Axia, Jesse (optional — recommend attending)  
**Duration:** 60–90 minutes

Agenda:
- Walk through success criteria (confirmed vs. not)
- Client shares: what worked, what was confusing, what would need to change
- Line Axia shares: sales/advisory learnings
- Jesse (if attending): technical learnings and roadmap notes
- Define next step: continue, expand, procure, or pause

### Day 4–5: Closeout Deliverables

**Who:** Line Axia (primary), Jesse (technical input)

Produce:
- Pilot outcome summary (1–2 pages)
- Workflow configuration record (final CerbaSeal Field Map)
- Support log (hours spent by layer)
- Lessons learned (internal — for improving Pilot 2)
- Client next-steps communication

**Jesse hours this week:** 1–2 (review session attendance, technical input to deliverables)

---

## Jesse Hours Target Summary

| Week | Target Jesse Hours | What It Covers |
|---|---|---|
| Pre-Pilot | 1 | Agreement review, hour allocation |
| Week 1 | 0–1 | Async question answering only |
| Week 2 | 0–2 | Standby for deployment issues |
| Week 3 | 0–1 | Async only, unexpected scenario investigation |
| Week 4 | 0–3 | Issue resolution (if issues exist) |
| Week 5 | 1–2 | Review session, deliverable input |
| **Total** | **2–10** | Target ≤ 8 for a well-prepared pilot |

If actual Jesse hours exceed 10 for a Tier 2 pilot, conduct a root cause review: was it a client readiness issue, a documentation gap, or an unexpected technical problem?

---

## Escalation During the Playbook

| Issue Type | Who Handles | Escalation Path |
|---|---|---|
| Operational question (what does HOLD mean?) | Client self-serves from FAQ | Line Axia if FAQ doesn't cover it |
| Deployment issue (tests fail) | Client uses troubleshooting guide | Line Axia → Jesse if not resolved |
| Unexpected enforcement behavior | Line Axia reviews with client | Jesse if code-level investigation needed |
| Scope expansion request | Line Axia declines, documents | Notes for post-pilot discussion |
| Commercial question | Line Axia | Jesse if material commercial impact |
| Out-of-scope support request | Line Axia declines per `support-boundaries.md` | Document request, define as next phase |

---

## Playbook Variations

### Tier 1 Discovery Pilot (3 weeks)
- Week 1: Kick-off + workflow mapping (compressed — synthetic scenarios only)
- Week 2: Deployment + baseline scenario testing
- Week 3: Evidence review + closeout
- Jesse hours target: ≤ 4

### Tier 3 Extended Governance Pilot (8 weeks)
- Weeks 1–5: Same as Tier 2
- Week 6: Second decision path mapping and configuration
- Week 7: Extended scenario testing on second path
- Week 8: Expansion review + closeout + post-pilot expansion plan
- Jesse hours target: ≤ 16

---

## After the Playbook — Continuous Improvement

After each pilot closeout:

1. **Review Jesse hours by layer** — where did founder involvement occur and why?
2. **Identify documentation gaps** — what questions came up that aren't in any guide?
3. **Update the knowledge base** — add new questions to FAQ or troubleshooting guide
4. **Improve the playbook** — adjust week-by-week activities based on what actually happened
5. **Update the train-the-trainer program** — add what Line Axia learned to their facilitation notes

The playbook improves with each pilot. By Pilot 3, Jesse's involvement should be down to 2–4 hours per engagement.
