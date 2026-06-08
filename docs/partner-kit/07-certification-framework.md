# CerbaSeal — Partner Certification Framework

**Audience:** Partners preparing for certification, and assessors conducting evaluations  
**Version:** v0.1.0  
**Purpose:** Define the three certification levels, their competencies, practical exercises, and pass/fail criteria  

---

## Overview

Partner certification exists for one reason: to confirm that a partner can deliver CerbaSeal to a client without founder involvement. Certification is not a training programme — it is an assessment of demonstrated capability.

**Three levels:**

| Level | Name | What It Proves |
|---|---|---|
| **Level 1** | Deploy | Can stand up CerbaSeal and verify it works |
| **Level 2** | Configure | Can author a policy pack for a new client without assistance |
| **Level 3** | Lead Pilots | Can run a full pilot engagement independently |

**Prerequisites:**
- Level 1 is the entry requirement before any client deployment
- Level 2 requires Level 1 as a prerequisite
- Level 3 requires Level 2 as a prerequisite and one completed Level 2 client delivery

**Assessment:** Each level has a practical exercise with a pass/fail checklist. There is no written exam. Certification is assessed by a Level 3 partner or by Jesse Lamont for the first cohort.

---

## Level 1 — Deploy

### What Level 1 Proves

A Level 1 partner can:
- Set up the CerbaSeal environment from scratch on a clean machine
- Run the setup wizard and review the generated configuration files
- Run and interpret the repo audit (16 checks)
- Run and interpret the deployment verification (3 scenarios)
- Explain what each of the 3 outcomes (ALLOW, HOLD, REJECT) means and how to trigger each
- Export and verify a proof snapshot

Level 1 does not require the partner to author a policy pack or configure approval chains. That is Level 2.

### Level 1 Competencies

**Environment Setup**
- [ ] Can clone the repository and run `pnpm install` without assistance
- [ ] Knows how to verify the Node.js version requirement and resolve version mismatches
- [ ] Can explain why `pnpm test` must pass before any deployment proceeds

**Audit**
- [ ] Can run `pnpm audit:repo` and interpret the 16 checks
- [ ] Can identify which check failed and locate the cause in the output
- [ ] Knows what to do when each of the 5 most common checks fails

**Verification**
- [ ] Can run `tsx deployment-starter/verify.ts` and interpret the 9 assertions
- [ ] Can explain what each verification scenario tests and why it matters
- [ ] Can articulate the difference between REJECT (terminal) and HOLD (resumable)

**Evidence**
- [ ] Can run `pnpm export:proof` and explain what the proof snapshot contains
- [ ] Can run `pnpm verify:proof` and explain what a checksum mismatch means
- [ ] Can explain why the audit log is append-only and hash-chained

### Level 1 Practical Exercise

**Setup:** Assessor provides a clean Linux or macOS machine with Node.js 18+ and pnpm installed but no CerbaSeal code.

**Time limit:** 2 hours

**The candidate must, without assistance:**

1. Clone the CerbaSeal-Core repository
2. Install dependencies and run `pnpm test` — 432/432 passing
3. Run `pnpm audit:repo` — 16/16 passing
4. Run `pnpm setup` with the following answers:
   - Mode: C (client-controlled)
   - Workflow: "Insurance Claim Review"
   - AI actor: "claim-scoring-ai"
   - Approver: "Claims Manager" → `manager`
   - Audit log: a file path of their choice
   - Environment: production
5. Review the generated `cerbaseal.policy.json` and confirm the mapping is correct
6. Re-run `pnpm audit:repo` — still 16/16
7. Run `tsx deployment-starter/verify.ts` — 9/9 passing
8. Run `pnpm export:proof` and `pnpm verify:proof`

**Pass/fail checklist:**

| Criterion | Pass |
|---|---|
| `pnpm test` shows 432/432 passing | ✓ |
| `pnpm audit:repo` shows 16/16 passing after setup | ✓ |
| `verify.ts` shows 9/9 passing | ✓ |
| `cerbaseal.policy.json` contains correct actor mapping | ✓ |
| `pnpm verify:proof` completes without error | ✓ |
| Candidate can explain what each verification scenario tests | ✓ |
| Candidate can explain the difference between REJECT and HOLD | ✓ |
| Completed within 2 hours | ✓ |

**Fail condition:** Any unresolved failed check, or inability to explain the scenarios without reading from documentation.

---

## Level 2 — Configure

### What Level 2 Proves

A Level 2 partner can:
- Conduct a workflow mapping session with a client and extract the information needed to author a policy pack
- Author a complete `cerbaseal.policy.json` from a workflow description, without using the setup wizard
- Validate the policy file against the repo audit and explain any failures
- Extend an existing policy to add a new workflow or new action policy
- Explain the security floor (fraud_triage hardcoded baseline) and why it cannot be removed via policy
- Verify the policy behaves as expected by submitting test requests

### Level 2 Competencies

**Workflow Mapping**
- [ ] Can facilitate a 60–90 minute workflow mapping session using the workbook
- [ ] Can extract actor names, authority classes, action classes, and approval requirements from a client conversation
- [ ] Can identify which actions should be `requires_approval`, `auto_allow`, or `blocked` based on governance requirements

**Policy Authoring**
- [ ] Can write `actorMappings`, `workflowRules`, `approvalChains`, and `actionPolicies` without using the wizard
- [ ] Understands that `workflowRules: requiresApproval: false` does NOT suppress a chain requirement
- [ ] Understands that `approvalChains` restricts which authority classes can approve; `workflowRules` does not
- [ ] Can add a new workflow to an existing policy without breaking existing entries

**Validation**
- [ ] Can run `pnpm audit:repo` and use check 16 failure messages to locate and fix policy errors
- [ ] Can submit a test request and interpret the `decisionEnvelope` to verify the policy is working
- [ ] Can construct a valid `ApprovalArtifact` and verify the HOLD → ALLOW lifecycle

**Security Model**
- [ ] Can explain the 6 authority classes and which can and cannot approve
- [ ] Can explain why `actorAuthorityClass: "ai"` always results in REJECT for self-authorization attempts
- [ ] Can explain the difference between `workflowRules` enforcement (any human class) and `approvalChains` enforcement (specific classes only)

### Level 2 Practical Exercise

**Setup:** Assessor provides a workflow description (written, 1 page). Candidate has the CerbaSeal-Core repo and a blank `cerbaseal.policy.json`.

**Time limit:** 90 minutes

**The workflow description provided by the assessor:**

> **Mortgage Underwriting Approval**
> 
> A mortgage AI scores applications and recommends one of three actions: `approve`, `decline`, `refer_to_senior`. The AI is called "underwriting-ai-system". The following human roles review decisions:
> 
> - Junior Underwriter — can review but not approve high-value decisions
> - Senior Underwriter — can approve standard and high-value decisions  
> - Head of Underwriting — can approve all decisions including exceptions
> 
> Governance requirements:
> - `approve` and `decline` actions always require Senior Underwriter or above
> - `refer_to_senior` is a safe routing action and does not require additional approval
> - No action can be taken without a human in the loop on any underwriting decision

**The candidate must, without assistance:**

1. Map the workflow to CerbaSeal structures (actor classes, approval chains, action policies)
2. Write a complete `cerbaseal.policy.json` covering all requirements
3. Run `pnpm audit:repo` — all 16 checks must pass
4. Submit a test request using the integration entry point and verify:
   - `approve` with no approval artifact → HOLD
   - `approve` with a Junior Underwriter approval artifact → HOLD (wrong authority class)
   - `approve` with a Senior Underwriter approval artifact → ALLOW
   - `refer_to_senior` with no approval artifact → ALLOW (auto_allow policy)
   - AI actor attempting self-authorization → REJECT

**Pass/fail checklist:**

| Criterion | Pass |
|---|---|
| `actorMappings` correctly maps all 3 role names to canonical classes | ✓ |
| `workflowRules` or `approvalChains` correctly enforces approval for `approve` and `decline` | ✓ |
| `approvalChains` restricts to `senior_underwriter_class` and above (not junior) | ✓ |
| `refer_to_senior` is correctly set to `auto_allow` | ✓ |
| `pnpm audit:repo` shows 16/16 passing | ✓ |
| `approve` with no artifact returns HOLD | ✓ |
| `approve` with Junior Underwriter artifact returns HOLD | ✓ |
| `approve` with Senior Underwriter artifact returns ALLOW | ✓ |
| `refer_to_senior` with no artifact returns ALLOW | ✓ |
| AI self-authorization returns REJECT | ✓ |
| Candidate can explain each result without reading from documentation | ✓ |
| Completed within 90 minutes | ✓ |

**Fail condition:** Any scenario produces the wrong outcome, or the candidate cannot explain why any result occurred.

---

## Level 3 — Lead Pilots

### What Level 3 Proves

A Level 3 partner can run a complete CerbaSeal pilot engagement from initial sales conversation to delivered evidence package — without any founder involvement. This includes qualifying the client, structuring the pilot, facilitating workflow mapping, deploying, integrating, verifying, and delivering the evidence package in a structured debrief.

### Level 3 Competencies

**Sales and Qualification**
- [ ] Can qualify a prospect using the 3 qualification questions without assistance
- [ ] Can handle all 8 enterprise objections using the objection handling guide
- [ ] Can close to a pilot (not a purchase) and structure the pilot agreement

**Pilot Delivery**
- [ ] Can run a 1-day pilot using the 5-session structure in [04-pilot-guide.md](04-pilot-guide.md)
- [ ] Can facilitate a 90-minute workflow mapping session with a real or realistic client stakeholder
- [ ] Can select the right integration starter kit for the client's architecture and adapt it on the day

**Support and Troubleshooting**
- [ ] Can diagnose and resolve all 10 common issues in [05-support-guide.md](05-support-guide.md) without escalation
- [ ] Knows when an issue requires Tier 3 escalation and what to document before escalating
- [ ] Can explain proof snapshot verification and chain integrity to a non-technical client stakeholder

**Client Handoff**
- [ ] Can deliver the handoff package using the checklist in [03-deployment-guide.md](03-deployment-guide.md)
- [ ] Can run the evidence report and explain `governance-summary.md` to a risk committee audience
- [ ] Can identify follow-on opportunities (additional workflows, production deployment, ongoing support)

### Level 3 Practical Exercise

**Setup:** The candidate runs a complete mock pilot with an assessor playing the role of the client. The client has a prepared workflow description that includes intentional ambiguities, one misconfigured policy file introduced partway through, and one common support issue triggered during the integration session.

**Time limit:** 8 hours (simulates a full pilot day)

**The exercise covers:**

| Session | What Is Assessed |
|---|---|
| Client qualification (30 min) | Candidate asks the 3 qualification questions, handles 2 scripted objections |
| Workflow mapping (90 min) | Candidate facilitates the workbook session, extracts all required information |
| Policy authoring (60 min) | Candidate writes the policy file without assistance; assessor introduces a syntax error partway through |
| Deployment (60 min) | Candidate deploys from scratch; assessor introduces a node version mismatch |
| Integration (60 min) | Candidate selects and adapts a starter kit; assessor introduces a `forRequestId` mismatch in the approval flow |
| Verification and evidence (30 min) | Candidate runs all 5 verification scenarios and delivers the evidence package |
| Debrief (30 min) | Candidate delivers a structured debrief, identifies follow-on opportunities |

**Pass/fail checklist:**

| Criterion | Pass |
|---|---|
| Qualification: candidate asks all 3 questions and correctly assesses pilot readiness | ✓ |
| Objection handling: candidate handles both scripted objections without breaking flow | ✓ |
| Workflow mapping: all required information is captured in the worksheet | ✓ |
| Policy: policy file passes `pnpm audit:repo` after candidate finds and fixes the introduced error | ✓ |
| Deployment: candidate resolves the node version issue and reaches 16/16 passing | ✓ |
| Integration: candidate identifies the `forRequestId` mismatch and resolves it | ✓ |
| Verification: all 5 scenarios produce the correct outcome | ✓ |
| Evidence: `pnpm verify:proof` passes; candidate explains the checksum to the "client" | ✓ |
| Debrief: candidate identifies at least one follow-on opportunity | ✓ |
| Completed within 8 hours | ✓ |
| No Tier 3 escalations for issues resolvable with the support guide | ✓ |

**Fail condition:** Any unresolved issue that would have blocked a real client pilot, or a Tier 3 escalation for a Tier 2-resolvable issue.

---

## Maintaining Certification

Certification does not expire automatically, but partners are expected to re-verify their Level 1 assessment after any major CerbaSeal version update. When the test count changes or audit check count changes, re-run the exercise to confirm the outputs still match.

A partner whose client delivery produces a Tier 3 escalation for a Tier 2-resolvable issue may be asked to re-certify at the relevant level before their next engagement.

---

## Assessor Notes

For the first cohort of partners, Jesse Lamont will serve as assessor. As Level 3 partners complete their certification, they are eligible to assess Level 1 and Level 2 candidates. Level 3 certification assessment always requires Jesse or another designated Level 3 assessor.

**Assessment principles:**
- Assess demonstrated capability, not knowledge recall
- All exercises use real tools on real deployments — no simulations
- A candidate who solves a problem by reading the support guide passes; a candidate who escalates a Tier 2 issue to Tier 3 fails that criterion
- The goal is a partner who can deliver CerbaSeal independently — the assessment should confirm that, not create artificial difficulty

---

*Partner Delivery Kit — [00-OVERVIEW.md](00-OVERVIEW.md) for the full kit index.*
