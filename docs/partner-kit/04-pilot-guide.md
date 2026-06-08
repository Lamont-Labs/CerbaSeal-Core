# CerbaSeal Express Pilot — 1-Day Guide

**Audience:** Partner lead running a CerbaSeal pilot engagement  
**Format:** One-day structured delivery — morning to evidence package  
**Output:** Live enforcement gate with ALLOW/HOLD/REJECT verified, cryptographically chained audit log, exportable evidence package  

---

## Commercial Framing

**A CerbaSeal pilot is a guided governance validation engagement — not a free trial, not a broad consulting project, and not a production rollout.**

The pilot is successful when the client and partner can show that a defined workflow can be mapped, evaluated, audited, and reviewed through CerbaSeal with clear operational responsibilities and evidence outputs.

| Principle | Meaning |
|-----------|---------|
| One workflow first | Begin with a single high-value workflow rather than broad platform adoption |
| Guided implementation | Partner and Lamont Labs provide structure, templates, and support rather than leaving the client to interpret the system alone |
| Client-controlled environment | Client retains control of deployment environment, identity systems, network controls, and business operations |
| Defined support window | Support expectations are explicit, bounded, and aligned to pilot scope |
| Evidence-first closeout | The pilot ends with evidence package, verification output, support log, and lessons learned |

**Before you run the pilot day:** Confirm the pilot is priced and scoped as a commercial engagement covering discovery, mapping, deployment, validation, evidence review, support window, and closeout. For pricing tiers and commercial model options, see [08-pricing-and-commercial-model.md](08-pricing-and-commercial-model.md).

---

## Overview

The CerbaSeal Express Pilot is designed to take a client from zero to a live, verified enforcement gate in a single day. By end of day, the client has:

- A running enforcement gate configured for their specific workflow
- Three verified scenarios: ALLOW, HOLD, and REJECT — each producing a real audit event
- A cryptographically chained audit log covering all decisions made during the pilot
- An exported proof snapshot they can take to their risk committee or regulatory reviewer

The day is structured in 5 sessions. Two in the morning, three in the afternoon.

---

## Client-Facing Agenda

*(Copy and share with the client for pre-pilot approval)*

---

**CerbaSeal Governance Pilot — Day Agenda**

**Date:** [date]  
**Location:** [location or remote]  
**Participants:** [partner lead name], [client technical lead], [client reviewer / approver representative]

---

**Morning**

| Time | Session | Who |
|---|---|---|
| 09:00 – 10:30 | Workflow Mapping (90 min) | Partner lead + client technical lead |
| 10:30 – 10:45 | Break | — |
| 10:45 – 11:45 | Policy Pack Authoring (60 min) | Partner lead + client technical lead |

**Afternoon**

| Time | Session | Who |
|---|---|---|
| 12:00 – 13:00 | Deployment (60 min) | Partner lead + client technical lead |
| 13:00 – 14:00 | Lunch break | — |
| 14:00 – 15:00 | Integration (60 min) | Partner lead + client technical lead |
| 15:00 – 15:30 | Verification (30 min) | Partner lead + client technical lead + approver representative |

**End of Day**

| Deliverable | What It Is |
|---|---|
| Live enforcement gate | Running against the client's workflow, verified with real decisions |
| Audit log | JSONL file with REJECT, HOLD, and ALLOW entries from the pilot |
| Evidence package | Proof snapshot: test results + audit checks + git provenance + stableChecksum |

---

**What the client needs to prepare:**
- One workflow selected for the pilot (AI-assisted decisions → consequential actions)
- Names and role titles of 1–3 people who approve decisions in that workflow
- A laptop with Node.js 18+ and pnpm installed, or access to a Linux server where you'll deploy

---

*(End of client-facing agenda)*

---

## Session 1 — Workflow Mapping (90 min)

**Time:** 09:00 – 10:30  
**Who:** Partner lead + client technical lead  
**Tool:** `docs/client-adoption/workflow-mapping-workbook.md`

**Goal:** Understand the client's current workflow well enough to configure CerbaSeal for it.

**What to capture:**

1. **Workflow name and class** — What is this workflow called? What short identifier should CerbaSeal use? Example: "Transaction Fraud Review" → `transaction_fraud_review`

2. **Action classes** — What specific actions does this workflow produce? List every action class the AI can propose. Example: `hold`, `allow`, `reject`, `escalate`, `account_hold`

3. **Actors** — Who interacts with this workflow?
   - What AI system is involved? What ID does it use?
   - What human roles review and approve decisions? What are their exact role titles?

4. **Approval requirements** — For each action class: should it require a human sign-off? Which human roles can provide that sign-off?

5. **Blocking requirements** — Are there any action classes that should never execute regardless of approvals? (Map these to `blocked` in action policies)

**Output of this session:** A completed worksheet that maps to all four sections of `cerbaseal.policy.json`: actor mappings, workflow rules, approval chains, and action policies.

**Facilitator tip:** Ask "what would go wrong if an AI made this decision without human review?" for each action class. That answer tells you whether the action is `requires_approval`, `auto_allow`, or `blocked`.

---

## Session 2 — Policy Pack Authoring (60 min)

**Time:** 10:45 – 11:45  
**Who:** Partner lead + client technical lead  
**Tool:** `pnpm setup`, then manual editing of `cerbaseal.policy.json`

**Goal:** Produce a valid `cerbaseal.policy.json` that passes audit check 16.

**Steps:**

1. Run `pnpm setup`. Enter answers from the workflow mapping session.

2. Open the generated `cerbaseal.policy.json`. Extend it with everything from the worksheet:
   - Add all client role names to `actorMappings`
   - Add `workflowRules` with `requiresApproval: true` for every workflow requiring sign-off
   - Add `approvalChains` with specific authority-class constraints if needed
   - Add `actionPolicies` for every action class

3. Run `pnpm audit:repo`. All 16 checks must pass.

4. Walk through the policy with the client. For each entry, confirm: "Is this what you intended?"

**Expected duration:** 30 minutes of authoring, 30 minutes of review and confirmation.

**Reference:** `docs/client-adoption/policy-pack-authoring-guide.md`

---

## Session 3 — Deployment (60 min)

**Time:** 12:00 – 13:00  
**Who:** Partner lead + client technical lead  
**Tool:** `docs/partner-kit/03-deployment-guide.md`

**Goal:** CerbaSeal running in the client's environment with a verified, persistent audit log.

**Steps:**

1. Confirm the deployment target: same machine as policy authoring, or a separate server?

2. If separate server: clone the repo, copy the generated config files, run `pnpm install`, re-run `pnpm audit:repo`.

3. Set the audit log path in the config to a persistent, writable location (not `memory` for pilot). Example: `/var/log/cerbaseal/pilot.jsonl`

4. Start the gate service using the selected integration starter kit.

5. Run `tsx deployment-starter/verify.ts`. All 9 assertions must pass.

**Output:** CerbaSeal running, 3 verification events written to the audit log, 9 passing assertions on screen.

---

## Session 4 — Integration (60 min)

**Time:** 14:00 – 15:00  
**Who:** Partner lead + client technical lead  
**Tool:** `examples/INTEGRATION-GUIDE.md` + selected starter kit

**Goal:** A working integration between the client's actual system and the CerbaSeal gate — or a realistic simulation of it.

**Options depending on client readiness:**

**Option A (Production integration):** Connect the client's actual AI system to the gate. Their system submits real `GovernedRequest` objects and routes decisions based on the gate result. This is the target state.

**Option B (Simulation):** Use the selected starter kit as a realistic simulation of the integration. Run a scripted workflow that submits 3–5 requests with different parameters and shows real ALLOW/HOLD/REJECT decisions. This is appropriate when the client's AI system isn't accessible on the day.

**What to demonstrate during this session:**

1. Submit a request with `actorAuthorityClass: "ai"` — show the REJECT with reason `AI_NON_AUTHORITATIVE`

2. Submit a valid request without an approval artifact — show the HOLD and explain the approval loop

3. Construct an `ApprovalArtifact` with the client's approver (use their role name from actor mappings) — resubmit the request — show the ALLOW and the release authorization

**Checkpoint:** After each decision, open the JSONL audit log and show the client the entry that was written. This is the moment where the audit trail becomes concrete for them.

---

## Session 5 — Verification and Evidence Export (30 min)

**Time:** 15:00 – 15:30  
**Who:** Partner lead + client technical lead + client approver representative  
**Goal:** Client sees the full ALLOW/HOLD/REJECT lifecycle with their own approver in the seat

**Steps:**

1. **Live REJECT:** Submit a self-authorization attempt (AI actor as approver). Show the client the REJECT.

2. **Live HOLD:** Submit a legitimate request without approval. Show the client the HOLD state.

3. **Live ALLOW:** Have the client's approver representative construct or provide the approval artifact. Submit the resubmission. Show the ALLOW with the release authorization.

4. **Export the evidence package:**
```bash
pnpm export:proof
pnpm verify:proof
```

5. Open `proof-snapshot.json` and show the client:
   - `testResults`: 432 tests, all passing
   - `auditChecks`: 16 checks, all passing
   - `gitProvenance`: the exact commit that produced this gate
   - `stableChecksum`: the fingerprint that makes the snapshot tamper-evident

6. Run `pnpm generate:evidence-report`. Open `governance-summary.md` and review it with the client.

**End state:** Client has a live gate, a JSONL audit log with real pilot decisions, a verified proof snapshot, and a human-readable evidence report they can take to their risk committee.

---

## Debrief (15 min — end of day)

Close the day with these three questions:

1. **"Does this match what you expected the governance boundary to look like?"** — Listen for gaps between what they assumed CerbaSeal does and what they've now seen it do. Address mismatches immediately.

2. **"What would need to be true for this to be running in production in your environment?"** — This surfaces the blockers for the next phase. Note them all.

3. **"Who in your organization needs to see the evidence package?"** — This identifies who the next conversation is with and what they need to hear.

---

## Pre-Pilot Partner Preparation Checklist

Complete these steps before the pilot day:

- [ ] CerbaSeal-Core cloned and `pnpm test` passing (432/432)
- [ ] `pnpm audit:repo` passing (16/16)
- [ ] Workflow mapping worksheet prepared (not blank — have the right questions ready)
- [ ] Integration starter kit selected based on client's architecture
- [ ] Audit log path decided and target directory writable
- [ ] `tsx deployment-starter/verify.ts` run at least once on a clean installation
- [ ] Evidence report format reviewed (`pnpm generate:evidence-report`)
- [ ] Support guide reviewed ([05-support-guide.md](05-support-guide.md)) — know the 10 common issues before the day

---

## If Things Go Wrong

| Problem | When It Happens | Recovery |
|---|---|---|
| `pnpm test` fails on client machine | Session 3 | Check Node.js version. Run `pnpm install` again. |
| Audit check 16 fails | Session 2 or 3 | Read the error message carefully — it names the exact field. Fix JSON syntax. |
| `verify.ts` HOLD scenario fails | Session 3 | Check `approvalChains` — must list at least one authority class for the workflow |
| Integration not ready | Session 4 | Switch to Option B (simulation). Use the fraud-workflow-starter as a worked example. |
| Client approver not available | Session 5 | Use a synthetic approver for the demo. Note that a real approver is needed for production. |
| `export:proof` fails | Session 5 | Run `pnpm test` first. Proof requires passing tests. Then retry. |

---

*After the pilot, deliver the handoff package using the checklist in [03-deployment-guide.md](03-deployment-guide.md). If the client is proceeding to production, begin the policy review and production deployment planning.*
