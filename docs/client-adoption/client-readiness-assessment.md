# CerbaSeal — Client Readiness Assessment

**Used by:** Line Axia  
**Purpose:** Determine whether a prospect is a good fit for a CerbaSeal pilot before committing engagement resources.  
**Version:** 0.1.0

---

## How to Use This Assessment

Work through each section with or on behalf of the prospect. Score each category. Sum scores and apply the suitability rating. Use the red flag list as a quick pre-screen before the full assessment.

This assessment does not replace the workflow mapping workbook. It determines whether to proceed to workflow mapping.

---

## Quick Pre-Screen — Red Flags

Stop and do not proceed to assessment if any of the following are true:

| Red Flag | Why It Disqualifies |
|---|---|
| No defined AI workflow — AI is "planned" but not running | Nothing to govern yet. Come back when the workflow exists. |
| No technical owner on the client side | Deployment cannot proceed without a technical contact who owns the environment. |
| Client expects CerbaSeal to certify regulatory compliance | CerbaSeal produces governance evidence — it does not certify AI Act, GDPR, SOC 2, or ISO compliance. |
| Client expects 24/7 support | Outside scope for a pilot engagement. |
| Client expects unlimited custom development | Pilot scope is fixed. Custom features are a separate phase. |
| Client wants to govern multiple workflows immediately | First pilot must be one workflow. Multi-workflow is post-pilot. |
| Client cannot provide sample workflow data or realistic scenarios | Pilot cannot be validated without representative inputs. |
| Client believes "AI governance" means controlling AI outputs or quality | CerbaSeal governs authorization, not output quality or correctness. |

If none of the red flags apply, proceed to the full assessment.

---

## Section 1 — Client Profile

| Field | Response |
|---|---|
| Organization name | |
| Industry / sector | |
| Size (employees / revenue tier) | |
| EU entity (Y/N) | |
| EU AI Act applicability (known / suspected / unknown) | |
| Primary contact | |
| Technical contact (if different) | |
| Internal AI program maturity | |

**Notes:**

---

## Section 2 — AI Workflow Maturity

*Score 0–3 per question. 0 = not present, 1 = early/informal, 2 = defined, 3 = operational.*

| Question | Score (0–3) |
|---|---|
| Does the client have at least one AI-assisted workflow in operation today (not planned)? | |
| Is the AI workflow producing consequential outputs (financial, operational, compliance-relevant)? | |
| Can the client describe a specific decision point where the AI proposes an action? | |
| Is there already some form of human review or approval in the workflow, even informal? | |
| Has the client identified which actions in this workflow carry the most risk? | |

**Section score:** \_\_\_ / 15

**Notes:**

---

## Section 3 — Technical Hosting Capability

*Score 0–3 per question.*

| Question | Score (0–3) |
|---|---|
| Does the client have a technical team or technical owner who can manage a Node.js deployment? | |
| Does the client have a server environment (cloud, on-prem, container) they control? | |
| Can the client configure environment variables and manage a local service? | |
| Does the client have the ability to maintain a file system with persistent storage for audit logs? | |
| Is the client capable of running a test suite and interpreting pass/fail results? | |

**Section score:** \_\_\_ / 15

**Notes:**

---

## Section 4 — Data Sensitivity and Jurisdiction

*Score 0–3 per question.*

| Question | Score (0–3) |
|---|---|
| Is the client clear on what data their AI workflow processes? | |
| Is the client's data jurisdiction understood (EU, US, mixed)? | |
| Is there a data processing agreement in place with the AI vendor(s) they use? | |
| Does the client understand that CerbaSeal processes workflow metadata only — not underlying personal data? | |
| Is a data processing agreement between client and Line Axia feasible if needed? | |

**Section score:** \_\_\_ / 15

**Notes:**

---

## Section 5 — Existing Approval Process

*Score 0–3 per question.*

| Question | Score (0–3) |
|---|---|
| Is there an existing human approval process for high-risk actions in the target workflow? | |
| Are there named individuals or roles who provide approvals today? | |
| Is the approval process documented (even informally)? | |
| Does the client have a clear view of what "approved" looks like (email, system event, signed record)? | |
| Is approval authority by role or by individual — and is that understood? | |

**Section score:** \_\_\_ / 15

**Notes:**

---

## Section 6 — Audit Trail Maturity

*Score 0–3 per question.*

| Question | Score (0–3) |
|---|---|
| Does the client currently maintain any audit log for AI-assisted decisions? | |
| Does the client understand the difference between a log (append-only, timestamped) and a report (derived summary)? | |
| Has the client ever needed to produce evidence of a decision for internal or external review? | |
| Is the client aware of any compliance requirement that mandates decision traceability in their industry? | |
| Does the client have a retention policy or data ownership requirement for audit records? | |

**Section score:** \_\_\_ / 15

**Notes:**

---

## Section 7 — Human Oversight Requirements

*Score 0–3 per question.*

| Question | Score (0–3) |
|---|---|
| Has the client identified specific AI actions that must require human authorization before execution? | |
| Is the client's human oversight requirement driven by internal policy, regulation, or both? | |
| Does the client have a view of what "HOLD pending human review" means in their operational context? | |
| Is there a defined escalation path for disputed or held decisions? | |
| Is the client interested in enforcing that AI systems cannot authorize their own proposals — i.e., the non-self-authorization principle? | |

**Section score:** \_\_\_ / 15

**Notes:**

---

## Section 8 — Internal Champion

*Score 0–3 per question.*

| Question | Score (0–3) |
|---|---|
| Is there a named internal champion who owns this initiative? | |
| Does the champion have authority to commit resources (time, infrastructure) for the pilot? | |
| Does the champion understand what a pilot engagement means (not production, not certification)? | |
| Is the champion technically or operationally comfortable enough to participate in onboarding? | |
| Is the champion's interest self-driven (not just exploratory/delegated)? | |

**Section score:** \_\_\_ / 15

**Notes:**

---

## Section 9 — Timeline and Urgency

*Score 0–3 per question.*

| Question | Score (0–3) |
|---|---|
| Is there a real-world driver creating urgency (regulatory deadline, audit, incident)? | |
| Is the client's timeline compatible with a controlled pilot (months, not days)? | |
| Is the client prepared to allocate internal time for workflow mapping and onboarding (estimate: 4–8 hours across the pilot)? | |
| Is the client's Q4 or near-term operational calendar clear enough to begin? | |

**Section score:** \_\_\_ / 12

**Notes:**

---

## Section 10 — Budget Readiness

*Score 0–3 per question.*

| Question | Score (0–3) |
|---|---|
| Has the client indicated any budget allocation for governance tooling? | |
| Is the client's procurement process compatible with a pilot agreement (not multi-year enterprise contract required)? | |
| Does the client understand that pilot pricing will be different from production pricing? | |
| Is the decision-maker for budget reachable and part of this conversation? | |

**Section score:** \_\_\_ / 12

**Notes:**

---

## Scoring Summary

| Section | Max | Score |
|---|---|---|
| AI Workflow Maturity | 15 | |
| Technical Hosting Capability | 15 | |
| Data Sensitivity and Jurisdiction | 15 | |
| Existing Approval Process | 15 | |
| Audit Trail Maturity | 15 | |
| Human Oversight Requirements | 15 | |
| Internal Champion | 15 | |
| Timeline and Urgency | 12 | |
| Budget Readiness | 12 | |
| **TOTAL** | **129** | |

---

## Suitability Rating

| Score | Rating |
|---|---|
| 100–129 | **READY** — Strong candidate. Proceed to workflow mapping workbook. |
| 75–99 | **LIKELY READY WITH SUPPORT** — Good fit with identified gaps. Proceed with specific support plan for weak sections. |
| 50–74 | **NOT READY YET** — Material gaps exist. Define what needs to change before re-evaluation. Do not start pilot. |
| 0–49 | **BAD FIT FOR FIRST PILOT** — Fundamental gaps in maturity, capability, or alignment. Revisit in a later cycle or different scope. |

**Rating:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
**Assessed by:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
**Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

## Ideal First Pilot Profile (Reference)

The strongest first pilot candidates share these characteristics:

- One workflow already in operation where AI proposes actions a human currently reviews
- One decision path with clear ALLOW / HOLD / REJECT semantics
- One approval model with named human authority (a role, not a system)
- A technical contact on the client side who can manage deployment
- Client understands the pilot is a controlled evaluation — not production certification
- Client can provide representative scenarios for testing (real or synthetic)
- Client is willing to host CerbaSeal in their own environment (or has no objection to Line Axia doing so in a controlled arrangement)
- Client's timeline is measured in weeks-to-months, not days

---

## Next Steps After Assessment

| Rating | Next Step |
|---|---|
| READY | Schedule workflow mapping session. Use `docs/client-adoption/workflow-mapping-workbook.md`. |
| LIKELY READY WITH SUPPORT | Address flagged gaps first. Define support plan. Then proceed to workflow mapping. |
| NOT READY YET | Document specific barriers. Set a re-evaluation date. |
| BAD FIT FOR FIRST PILOT | Do not pursue pilot at this time. Document reason. |

---

*This assessment is a qualification tool. It does not constitute a commercial commitment or pilot agreement. All pilots require a signed working agreement before execution.*
