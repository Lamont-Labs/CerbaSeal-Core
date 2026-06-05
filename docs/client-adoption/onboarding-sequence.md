# CerbaSeal — Client Onboarding Sequence

**Purpose:** The exact sequence a new client follows to deploy and operate CerbaSeal without requiring Lamont Labs involvement.

**Estimated total time:** 4–8 hours (simple pilot) to 8–20 hours (complex pilot with novel workflow)

**Required by client:** One technical lead (Node.js capable) and one operational lead (approver role)

---

## Phase 0 — Pre-Engagement (Line Axia Only)

*Completed before client is involved.*

- [ ] Line Axia runs [Client Readiness Assessment](client-readiness-assessment.md) — score ≥ 60 required
- [ ] Line Axia completes [Client Qualification Scorecard](client-qualification-scorecard.md)
- [ ] Line Axia selects pilot tier using [Pilot Sizing and Pricing Framework](pilot-sizing-and-pricing-framework.md)
- [ ] Line Axia sends client [10-Minute Executive Overview](training/10-minute-executive-overview.md) to read before kickoff call
- [ ] Line Axia schedules 30-minute kickoff call (no Lamont Labs required)

**Gate:** Client scores ≥ 60 on readiness assessment AND has a defined AI workflow with a human approver role. If below 60, do not proceed.

---

## Phase 1 — Kickoff and Understanding (30 minutes)

*Line Axia runs this session with the client. No Lamont Labs required.*

- [ ] Run [30-Minute Onboarding Agenda](training/30-minute-onboarding-agenda.md)
- [ ] Cover: what CerbaSeal is, what it is not, three outcomes (ALLOW / HOLD / REJECT)
- [ ] Identify: the AI workflow, the human approver role, the evidence requirement
- [ ] Confirm: Node.js 18+, pnpm, Linux/macOS server access
- [ ] Confirm: client has read [10-Minute Executive Overview](training/10-minute-executive-overview.md)

**Output:** Client understands the model and is ready for workflow mapping.

---

## Phase 2 — Workflow Mapping (45–90 minutes)

*Line Axia facilitates. Client technical lead attends.*

**Option A — Facilitated (Line Axia leads):**
- [ ] Open [Workflow Mapping Workbook](workflow-mapping-workbook.md)
- [ ] Complete all sections: workflow name, actor roles, action classes, approval requirements, evidence requirements
- [ ] Map client role names to CerbaSeal authority classes
- [ ] Identify which actions require human approval
- [ ] Confirm audit log path and retention requirements

**Option B — Self-Service (client leads, 30–60 min faster):**
- [ ] Client fills in [wizard-input.example.json](../../scripts/wizard-input.example.json) → saves as `wizard-input.json`
- [ ] Client runs: `pnpm generate:pilot-config`
- [ ] Output folder `pilot-config/` contains: `cerbaseal-config.json`, `pilot-checklist.md`, `scenario-test.ts`, `deployment-summary.md`
- [ ] Line Axia reviews the generated config before deployment

**Output:** `cerbaseal.config.json` with client's authority classes, workflow classes, and action classes defined.

---

## Phase 3 — Technical Setup (30–60 minutes)

*Client technical lead completes. No Line Axia required.*

- [ ] Clone or receive CerbaSeal-Core source
- [ ] `pnpm install` — install dependencies
- [ ] `pnpm test` — confirm 391/391 tests pass
- [ ] `pnpm audit:repo` — confirm 15/15 audit checks pass
- [ ] Create `cerbaseal.config.json` with client-specific authority classes and workflow classes (from Phase 2)
- [ ] Configure audit log path: set `CERBASEAL_AUDIT_LOG_PATH` environment variable
  ```bash
  export CERBASEAL_AUDIT_LOG_PATH=/data/cerbaseal/audit/your-workflow.jsonl
  ```
- [ ] Confirm audit log directory exists and is writable:
  ```bash
  mkdir -p /data/cerbaseal/audit && touch /data/cerbaseal/audit/test.txt && rm /data/cerbaseal/audit/test.txt
  ```
- [ ] Review [Mode C Deployment Guide](../../docs/deployment/mode-c-client-controlled.md)
- [ ] Complete [Pilot Deployment Checklist](../../docs/deployment/pilot-deployment-checklist.md)

**Output:** CerbaSeal deployed and verified in client environment.

---

## Phase 4 — Integration (2–4 hours)

*Client technical lead implements. Line Axia available for questions.*

Choose the integration starter kit that matches your pattern:

| Pattern | Starter Kit |
|---|---|
| HTTP/REST API calls | [rest-api-starter](../../examples/rest-api-starter/) |
| Financial approval workflow | [financial-approval-starter](../../examples/financial-approval-starter/) |
| Fraud triage workflow | [fraud-workflow-starter](../../examples/fraud-workflow-starter/) |
| AI agent integration | [agent-integration-starter](../../examples/agent-integration-starter/) |

Steps:
- [ ] Copy the appropriate starter kit to your project
- [ ] Edit the configuration (workflow class, authority classes, audit log path)
- [ ] Implement your adapter: how your system calls the CerbaSeal gate
- [ ] Implement your approval bridge: how your approval system produces a CerbaSeal `ApprovalArtifact`
- [ ] Run the three core scenarios (REJECT, HOLD, ALLOW) and verify outcomes
- [ ] Verify audit log entries are written

**Blocked if:** Client cannot implement the approval bridge (approval records come from email or verbal confirmation). This requires either switching to system-recorded approval or custom development — escalate to Line Axia.

**Output:** CerbaSeal integrated with client's live system and producing verifiable decisions.

---

## Phase 5 — Scenario Verification (30 minutes)

*Client technical lead runs. Line Axia reviews results.*

If generated via `pnpm generate:pilot-config`, run the generated `pilot-config/scenario-test.ts`. Otherwise run manually:

**Scenario 1 — REJECT (AI cannot self-authorize)**
```
Request: AI actor proposes an action with proposalSourceKind: "ai" and actorAuthorityClass: "ai"
Expected outcome: REJECT
Evidence: blockedActionRecord with reasonCode AI_CANNOT_AUTHORIZE
```

**Scenario 2 — HOLD (approval required but missing)**
```
Request: Valid analyst actor, approvalRequired: true, approvalArtifact: null
Expected outcome: HOLD
Evidence: blockedActionRecord with reasonCode REQUIRED_APPROVAL_MISSING
```

**Scenario 3 — ALLOW (valid approved request)**
```
Request: Valid analyst actor, valid approvalArtifact with matching forRequestId
Expected outcome: ALLOW
Evidence: releaseAuthorization + full eventChain
```

- [ ] All three scenarios produce correct outcomes
- [ ] Audit log contains entries for all three scenarios
- [ ] `pnpm verify:proof` passes

**Output:** Verified decision outcomes and working evidence chain.

---

## Phase 6 — Evidence and Reporting (15 minutes)

*Client operational lead reviews. Line Axia may join.*

- [ ] Generate proof snapshot: `pnpm export:proof`
- [ ] Generate governance report: `pnpm generate:evidence-report`
- [ ] Review `governance-summary.md` — confirm it accurately describes the pilot decisions
- [ ] Review `audit-integrity-summary.md` — confirm hash chain is valid
- [ ] Identify the evidence owner and access control list (from workflow mapping)
- [ ] Confirm audit log file is in agreed retention location

**Output:** Evidence package ready for compliance review.

---

## Phase 7 — Operational Training (30 minutes)

*Line Axia or client lead runs this session.*

Human approvers and reviewers:
- [ ] Read [Operator Guide](training/operator-guide.md)
- [ ] Read [Reviewer Guide](training/reviewer-guide.md)
- [ ] Understand: three decision outcomes and what each means
- [ ] Understand: how to produce a valid `ApprovalArtifact` (the format, required fields)
- [ ] Understand: what to do when a HOLD is issued (notify + supply approval)
- [ ] Read [FAQ](training/faq.md) — answer common questions before they arise

Admins:
- [ ] Read [Admin Guide](training/admin-guide.md)
- [ ] Read [Common Errors and Fixes](training/common-errors-and-fixes.md)
- [ ] Know the Tier 1 / Tier 2 / Tier 3 escalation path

**Output:** Client team can operate CerbaSeal independently.

---

## Phase 8 — Go-Live

- [ ] Pilot declared active — client is running live requests through CerbaSeal
- [ ] Line Axia confirms [Support Boundaries](support-boundaries.md) with client
- [ ] Weekly check-in scheduled for weeks 1–4 (Tier 2 support)
- [ ] Client has access to all self-service materials in this kit

---

## Escalation During Onboarding

If blocked at any phase:

| Phase | Likely issue | Who helps |
|---|---|---|
| Phase 2 | Client workflow doesn't map to CerbaSeal primitives | Line Axia (Tier 2) |
| Phase 3 | Environment setup (Windows, unusual Linux config) | Line Axia then Lamont Labs |
| Phase 4 | Approval bridge is not system-recorded | Line Axia to reassess scope |
| Phase 5 | Unexpected gate outcomes | Check [Common Errors](training/common-errors-and-fixes.md) first |
| Any | Something not covered above | Line Axia → Lamont Labs (2–3 business days) |

---

*See [Founder Independence Kit](../FOUNDER-INDEPENDENCE-KIT.md) for the complete resource index.*
