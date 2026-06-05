# CerbaSeal — Workflow Mapping Workbook

**Used by:** Line Axia (with client)  
**Purpose:** Turn a client's existing AI workflow into CerbaSeal configuration language.  
**When to use:** After a client passes the readiness assessment. Before pilot deployment begins.  
**Estimated time:** 2–4 hours with the client's technical and operational contacts together.

---

## How to Use This Workbook

Work through sections A–M with the client. Both operational and technical people should be in the room. Operational staff understand what the workflow does. Technical staff understand how to implement it.

Each section collects client language. The mapping table at the end of each section translates it into CerbaSeal language. You do not need to show clients the CerbaSeal language — the goal is to understand their process well enough to configure it.

At the end, complete the CerbaSeal Field Map. That becomes the pilot configuration.

---

## A. What Workflow Are We Governing?

**Goal:** Name the workflow precisely. Vague workflow names produce vague pilots.

| Question | Client Response |
|---|---|
| What is the name of this workflow in your organization? | |
| What business problem does it solve? | |
| How long has this workflow been in operation? | |
| How frequently does it run? (per day / per week) | |
| What would happen if this workflow stopped working for 24 hours? | |
| Who owns this workflow operationally? | |

**CerbaSeal field:** `workflowClass`  
**Format:** short identifier, e.g. `fraud_triage`, `transaction_escalation`, `account_hold`  
**Value for this client:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

## B. What Starts the Workflow?

**Goal:** Identify the trigger. CerbaSeal governs at the decision point — we need to know what creates the need for a decision.

| Question | Client Response |
|---|---|
| What event triggers the workflow to begin? | |
| Is the trigger automated (system event) or manual (human-initiated)? | |
| What information is available at the start of the workflow? | |
| Who or what generates the initial data? | |
| Is there a system that produces a case, ticket, or record at the start? | |

**Notes:**

---

## C. What Does AI Propose?

**Goal:** Identify exactly what the AI system proposes. This becomes the `proposal` field.

| Question | Client Response |
|---|---|
| What does the AI system recommend or propose? | |
| Is the proposal a single action or a ranked list? | |
| What form does the proposal take? (text, category, score, structured object) | |
| Which AI model or system produces the proposal? | |
| What version of the model is in use? | |
| Where is the model hosted or operated? | |

**CerbaSeal fields:**
- `proposal.action` — what the AI is proposing
- `proposal.rationale` — why (if provided)
- `proposal.confidence` — confidence score (if available)
- `provenanceRef.modelVersion` — model identifier
- `provenanceRef.sourceHash` — optional content hash

**Values for this client:**

| Field | Value |
|---|---|
| proposal.action | |
| provenanceRef.modelVersion | |

---

## D. What Actions Can Happen?

**Goal:** List all the actions the workflow can produce. These become `ActionClass` values.

| Possible Action | Description | Consequential? (Y/N) |
|---|---|---|
| | | |
| | | |
| | | |
| | | |
| | | |

**Guidance:** A consequential action is one that changes something in the real world — a financial transaction, a status change, a communication sent, a record locked. Non-consequential actions (view, log, notify internally) may not need governing.

**CerbaSeal field:** `proposedActionClass`  
**Values for this client:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

## E. Which Actions Are Consequential?

**Goal:** Identify which actions need enforcement. Not all actions require governance.

| Action | Why It Is Consequential | Can It Be Reversed? | What Is the Worst Case If It Executes Without Approval? |
|---|---|---|---|
| | | | |
| | | | |
| | | | |

**Guidance for Line Axia:** CerbaSeal enforces most strictly for irreversible, high-impact actions. Help the client think about consequence and reversibility together.

**Decision:** Which actions will be governed in the pilot?

| Action | In Pilot? (Y/N) | Reason If No |
|---|---|---|
| | | |
| | | |

---

## F. Who Can Approve?

**Goal:** Identify human authority classes. These become `ActorAuthorityClass` values and the `approvalArtifact` authority requirement.

| Question | Client Response |
|---|---|
| Who in your organization has the authority to approve AI-proposed actions? | |
| Is approval authority defined by role, seniority, or case type? | |
| Can AI system outputs serve as approval for other AI system outputs? (Expected answer: No) | |
| Is there a tiered approval model? (e.g., low-risk: analyst; high-risk: manager) | |
| What does an approval look like today? (email, system click, verbal, signed form) | |

**CerbaSeal `ActorAuthorityClass` values:**

| Client Role Name | CerbaSeal Authority Class |
|---|---|
| AI / automated system | `ai` |
| Senior analyst / reviewer | `senior_analyst` |
| Compliance officer | `compliance_officer` |
| Operations manager | `operations_manager` |
| System process (automated, non-AI) | `system` |

**Values for this client:**

| Approver Role | CerbaSeal AuthorityClass | Required for Which Actions? |
|---|---|---|
| | | |
| | | |

---

## G. What Must Never Be AI-Authorized?

**Goal:** Identify the absolute prohibition cases. These map to the `prohibitedUse` flag and the non-self-authorization invariant.

| Question | Client Response |
|---|---|
| Are there any actions that must never execute without human authorization under any circumstances? | |
| Are there any action types that are always prohibited regardless of AI confidence? | |
| Are there any data types or subject categories that should never be included in AI proposals? | |
| Is there any action that would constitute a regulatory violation if taken by an automated system? | |

**CerbaSeal enforcement:** The gate enforces that `actor.authorityClass === "ai"` can never produce an ALLOW outcome. This is a hard invariant — it cannot be bypassed by any flag or field.

**Additional prohibitions for this client:**

| Prohibited Action / Condition | Why Prohibited |
|---|---|
| | |
| | |

---

## H. What Evidence Must Be Retained?

**Goal:** Define logging and evidence requirements. These configure the audit log and evidence bundle.

| Question | Client Response |
|---|---|
| Does a regulator, internal audit, or security team require evidence of AI decisions? | |
| How long must evidence be retained? | |
| Who owns the evidence records? (Client, Line Axia, or shared?) | |
| Must the evidence be tamper-evident? | |
| Is there a specific format or system evidence must be exported to? | |
| Who is authorized to access the evidence records? | |

**CerbaSeal evidence model:**
- Every evaluation — ALLOW, HOLD, and REJECT — produces an `EvidenceBundle`
- Bundles are linked by SHA-256 hash chain
- The chain can be exported as a JSONL file
- Chain integrity can be verified at any time with `pnpm verify:proof`
- Evidence ownership is the client's responsibility in Mode C (client-controlled) deployment

**Values for this client:**

| Field | Value |
|---|---|
| Retention period | |
| Evidence owner | |
| Export format required | |
| Access control requirement | |

---

## I. What Should Result in ALLOW?

**Goal:** Define the conditions under which an AI-proposed action should be authorized.

Complete this sentence: *"The action should be ALLOWED when..."*

| Condition | Example |
|---|---|
| | |
| | |
| | |

**CerbaSeal ALLOW conditions (all must be true simultaneously):**
- Actor is not AI (non-self-authorization)
- Approval artifact is present and valid
- Approval is not expired
- Approval postdates the request creation
- PolicyPackRef is present
- RequestId is non-empty
- ActorAuthorityClass is a known valid class
- LoggingReady is true
- TrustState is trusted
- Proposal is present and non-empty
- ProhibitedUse is not flagged

---

## J. What Should Result in HOLD?

**Goal:** Define the conditions under which the action should pause for human review.

Complete this sentence: *"The action should be HELD (paused for approval) when..."*

| Condition | Example |
|---|---|
| Approval is required but not yet present | AI has proposed an escalation but no analyst has reviewed yet |
| | |
| | |

**CerbaSeal HOLD behavior:** A HOLD is not a rejection. The request is structurally valid but missing an approval. Once approval is provided, the same request can be re-submitted and will ALLOW (if all other conditions pass).

---

## K. What Should Result in REJECT?

**Goal:** Define the conditions under which the action should be refused outright.

Complete this sentence: *"The action should be REJECTED when..."*

| Condition | Example |
|---|---|
| | |
| | |
| | |

**CerbaSeal REJECT behavior:** A REJECT is permanent for that request. The action did not execute. Evidence is generated regardless. The request cannot be re-submitted — a new request (new requestId) must be created if retrying.

---

## L. What Downstream System Receives the Final Decision?

**Goal:** Identify what CerbaSeal's output connects to.

| Question | Client Response |
|---|---|
| What system or process executes when the decision is ALLOW? | |
| What system or process handles HOLD (waiting for approval)? | |
| What system or process handles REJECT (logging, alerting)? | |
| Who in the client organization monitors for HOLD decisions needing review? | |
| Is there a ticketing or case management system that should receive the outcome? | |

**CerbaSeal output fields:**
- `gateResult.finalState` — ALLOW / HOLD / REJECT
- `gateResult.releaseAuthorization` — present on ALLOW only; contains requestId, approver reference
- `gateResult.blockedActionRecord` — present on HOLD / REJECT; contains reason code and invariant trace

---

## M. What Does the Client Consider Success?

**Goal:** Define pilot success before the pilot starts. Prevents disagreement at the end.

| Question | Client Response |
|---|---|
| What would make you say the pilot was successful? | |
| What would make you say the pilot failed? | |
| How many scenarios do you want to test during the pilot? | |
| Who signs off on pilot success on the client side? | |
| If successful, what is the next step? (expand, procure, pause) | |

**Agreed pilot success criteria (fill in together):**

1. \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
2. \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
3. \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

## CerbaSeal Field Map — Complete After Workbook

*This is the output of the workbook. Use this to configure the pilot.*

| CerbaSeal Field | Client Value |
|---|---|
| `workflowClass` | |
| `proposedActionClass` | |
| `actor.authorityClass` (AI actor) | `ai` |
| `actor.authorityClass` (approver) | |
| `approvalArtifact.approverId` (role or user ID format) | |
| `approvalArtifact.approvedAt` (ISO datetime required) | |
| `policyPackRef` | |
| `provenanceRef.modelVersion` | |
| `provenanceRef.ruleSetVersion` | |
| `trustState.trusted` | `true` |
| `loggingReady` | `true` |
| `approvalRequired` | `true` / `false` |
| `prohibitedUse` | `false` (unless specific conditions apply) |
| `sensitive` | `true` / `false` |
| Evidence retention period | |
| Evidence file path (for file-backed log) | |
| Downstream ALLOW handler | |
| Downstream HOLD handler | |
| Downstream REJECT handler | |

---

## Completed Example — Fraud Triage / Transaction Escalation

*This example is illustrative. It is based on the CerbaSeal demo workflow.*

| CerbaSeal Field | Example Value |
|---|---|
| `workflowClass` | `fraud_triage` |
| `proposedActionClass` | `escalate_for_review` |
| `actor.authorityClass` (AI) | `ai` |
| `actor.authorityClass` (approver) | `senior_analyst` |
| `approvalArtifact.approverId` | `analyst-007` |
| `approvalArtifact.approvedAt` | `2026-06-05T09:00:00.000Z` |
| `policyPackRef` | `fraud-policy-v1.2` |
| `provenanceRef.modelVersion` | `fraud-classifier-v3` |
| `provenanceRef.ruleSetVersion` | `rule-set-2026-06` |
| `trustState.trusted` | `true` |
| `loggingReady` | `true` |
| `approvalRequired` | `true` |
| `prohibitedUse` | `false` |
| `sensitive` | `true` |
| Evidence retention | 7 years |
| Evidence file path | `/data/cerbaseal/audit/fraud-triage.jsonl` |
| Downstream ALLOW handler | Case management system — move to "escalated" queue |
| Downstream HOLD handler | Alert queue — analyst assigned for review |
| Downstream REJECT handler | Case log — record decision, no escalation executed |

**What ALLOW means in this workflow:**  
A transaction has been flagged by the AI classifier, a senior analyst has reviewed and approved escalation, all invariants pass, and the case is authorized to move to the escalation queue.

**What HOLD means in this workflow:**  
The AI has proposed escalation but no analyst approval has been recorded yet. The case sits in a review queue until a senior analyst provides approval, at which point the request is re-submitted.

**What REJECT means in this workflow:**  
The request is structurally invalid — most commonly because an AI actor attempted to self-authorize an escalation, or the approval artifact is missing or malformed. The case does not escalate. Evidence is preserved.

---

## Workbook Sign-Off

| Party | Name | Date |
|---|---|---|
| Client operational lead | | |
| Client technical lead | | |
| Line Axia | | |
| Lamont Labs (if required) | | |

*Completing this workbook is a prerequisite for pilot deployment. It does not constitute a commercial agreement.*
