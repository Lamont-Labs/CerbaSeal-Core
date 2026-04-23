# Aurelion Bank — High-Risk Transaction Enforcement Workflow

## Context

Aurelion Bank is an EU-based fintech processing cross-border transactions.  
It uses AI models to detect fraud patterns and assist analysts.

Due to regulatory requirements, no high-risk action (e.g., account restriction, escalation) may be executed without:

- Verified human authority
- Complete audit trace
- Immutable decision record

CerbaSeal is placed between:
→ decision-making systems (AI + analysts)  
→ execution systems (account actions, escalation pipelines)

---

## Actors

### 1. AI Detection System
- Identifies suspicious activity
- Produces proposals (non-authoritative)

### 2. Fraud Analyst
- Reviews flagged cases
- Proposes operational actions

### 3. Compliance Officer
- Grants approval for sensitive actions
- Holds execution authority

---

## Workflow: High-Risk Transaction Escalation

### Step 1 — Detection
AI flags a transaction:
- cross-border mismatch
- abnormal velocity
- repeated failures

AI generates proposal:
→ "escalate" or "account_hold"

---

### Step 2 — AI Attempt (Blocked)

AI attempts to escalate automatically.

CerbaSeal evaluates:
- actor = AI
- proposal source = AI

Result:
→ REJECT

Reason:
→ AI cannot authorize actions

Artifact:
→ DecisionEnvelope (REJECT)
→ EvidenceBundle (with audit chain)

---

### Step 3 — Analyst Review

Fraud analyst reviews the same case.

Submits action:
→ account_hold

No approval attached.

---

### Step 4 — Missing Approval (Paused)

CerbaSeal evaluates:
- actor = human
- approval required = true
- approval artifact = missing

Result:
→ HOLD

Reason:
→ required approval not present

Artifact:
→ DecisionEnvelope (HOLD)
→ EvidenceBundle

---

### Step 5 — Compliance Approval

Compliance officer reviews the case.

Issues approval:
- bound to requestId
- includes signature
- includes authority classification

---

### Step 6 — Authorized Execution

Request is re-submitted with approval.

CerbaSeal evaluates:
- all invariants satisfied
- approval valid and bound

Result:
→ ALLOW

Artifact:
→ DecisionEnvelope (ALLOW)
→ ReleaseAuthorization
→ EvidenceBundle

---

### Step 7 — Execution + Audit

System executes:
→ account_hold applied

Audit record exists:
- full trace
- immutable chain
- replayable decision

---

## Key Properties

- AI cannot execute actions
- Humans cannot bypass approval
- Approval must be explicit and bound
- Every outcome is recorded
- Decisions are replayable and auditable
