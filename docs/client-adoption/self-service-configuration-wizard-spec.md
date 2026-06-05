# CerbaSeal — Self-Service Configuration Wizard Specification

**Status:** Design specification — not yet implemented  
**Purpose:** Define the future wizard that guides a client through generating a CerbaSeal pilot configuration without requiring Line Axia or Lamont Labs on every step.  
**Version:** 0.1.0

---

## Why This Matters

The current workflow mapping process requires a facilitated session with both Line Axia and the client. That model does not scale beyond a small number of simultaneous pilots. The wizard replaces the manual facilitation for technically able clients, producing a configuration package that can be handed directly to the technical owner for deployment.

This spec defines the wizard design so that when implementation begins, the design is already validated.

---

## Wizard Overview

**Format:** Web-based step-by-step form (no coding required for the client)  
**Output:** A downloadable configuration package containing:
- CerbaSeal field map (JSON)
- Pilot checklist (Markdown)
- Scenario test scripts (TypeScript / shell)
- Handoff pack (Markdown)

**Audience:** A client technical or operational lead who has passed the readiness assessment and is ready to configure a pilot without a facilitated session.

**Estimated completion time:** 30–60 minutes

---

## Step 1 — Choose Your Workflow

**Goal:** Name and describe the workflow being governed.

**Questions:**

| Question | Input Type | Validation |
|---|---|---|
| What is the name of this workflow? | Text field | Required, max 100 chars |
| Describe what this workflow does in 1–3 sentences. | Textarea | Required, max 500 chars |
| How often does this workflow run? | Select: Continuously / Hourly / Daily / Weekly / On-demand | Required |
| Is this workflow currently in production (live), or in testing? | Radio: Production / Testing / Planning | Required |
| What industry or sector does this workflow operate in? | Select: Financial services / Healthcare / Legal / Technology / Impact/NGO / Other | Required |

**CerbaSeal field mapped:** `workflowClass` (auto-generated from workflow name: snake_case)

**Sample output:**
```json
{
  "workflowClass": "transaction_fraud_review",
  "workflowDescription": "Reviews flagged transactions for potential fraud before escalating to a senior analyst."
}
```

---

## Step 2 — Define the Actions

**Goal:** Identify what actions the workflow can produce.

**Instructions shown to user:**  
*"List the actions your AI system can propose. Examples: 'escalate for review', 'freeze account', 'approve transaction', 'send alert'."*

**Questions:**

| Question | Input Type | Validation |
|---|---|---|
| Action 1 name | Text field | Required |
| Action 1 description | Text field | Optional |
| Is Action 1 consequential (does it change something in the real world)? | Yes / No | Required |
| Can Action 1 be reversed? | Yes / No / Partially | Required |
| Action 2 (optional) | Text field + same questions | Optional, up to 5 actions |

**Guidance shown to user:**  
*"A consequential action changes something real — a financial record, a customer status, an operational state. If in doubt, treat it as consequential."*

**CerbaSeal field mapped:** `proposedActionClass` (one per action)

---

## Step 3 — Define the AI Role

**Goal:** Characterize the AI system's role in the workflow.

**Questions:**

| Question | Input Type | Validation |
|---|---|---|
| What does your AI system produce? (e.g., a recommendation, a score, a ranked list) | Text field | Required |
| Which AI model or system generates this output? | Text field (model name/version) | Optional |
| Where is the AI model hosted? | Select: Our own infrastructure / Cloud provider / Third-party API / Unknown | Required |
| Does your AI system ever approve its own proposals? | Yes / No / Unsure | Required — if Yes, show warning |

**Warning shown if "Yes" to self-approval:**  
> ⚠️ "CerbaSeal enforces that AI systems cannot authorize their own proposals. This is a hard rule that cannot be changed. If your current workflow allows self-authorization, CerbaSeal will reject those requests. This is by design."

**CerbaSeal fields mapped:** `actor.authorityClass = "ai"`, `provenanceRef.modelVersion`

---

## Step 4 — Define the Human Approvers

**Goal:** Map client role names to CerbaSeal authority classes.

**Instructions shown to user:**  
*"Who in your organization has the authority to approve AI-proposed actions? Select the role that best matches."*

**Questions:**

| Question | Input Type | Validation |
|---|---|---|
| What is the approver's role called in your organization? | Text field | Required |
| Which CerbaSeal authority class best describes this role? | Select (with descriptions) | Required |
| Are there multiple approver roles? | Yes / No | If Yes, repeat |

**Authority class selector with descriptions:**

| Option | Description |
|---|---|
| `senior_analyst` | An experienced analyst who reviews and approves AI-proposed actions |
| `compliance_officer` | A compliance professional responsible for regulatory oversight |
| `operations_manager` | An operations manager with authority over workflow decisions |
| `system` | A trusted automated system (not AI) that can authorize actions |
| `human` | A general human actor (use if none of the above fit) |

**CerbaSeal fields mapped:** `actor.authorityClass` (approver), `approvalArtifact.approverId` format

---

## Step 5 — Define Approval Rules

**Goal:** Specify when approval is required.

**Questions:**

| Question | Input Type | Validation |
|---|---|---|
| Is human approval required for this workflow? | Yes / No | Required |
| If yes, which actions require approval? | Checklist of actions from Step 2 | Required if Yes |
| How is approval currently recorded? | Select: System click/button / Email confirmation / Signed document / Verbal (not recommended) / Other | Required |
| What should happen to a request while waiting for approval? | Radio: Hold and notify / Hold silently / Reject and require re-submission | Required |

**Note shown for verbal approval:**  
> "Verbal approval is not currently supported as a structured approval artifact. CerbaSeal requires a programmatic approval record. We recommend moving to a system-recorded approval for the pilot."

**CerbaSeal fields mapped:** `approvalRequired`, `approvalArtifact` structure

---

## Step 6 — Define Evidence Requirements

**Goal:** Configure the audit log and evidence retention.

**Questions:**

| Question | Input Type | Validation |
|---|---|---|
| Where should CerbaSeal write the audit log? | Text field (file path) | Required, must be a valid path |
| How long must audit records be retained? | Select: 1 year / 3 years / 5 years / 7 years / Other | Required |
| Who owns the audit records? | Select: Our organization / Line Axia / Jointly | Required |
| Who should have access to audit records? | Text field (role names) | Required |
| Should the proof snapshot be HMAC-signed? | Yes / No | Optional — if Yes, prompt for signing key setup |

**CerbaSeal fields mapped:** `CERBASEAL_AUDIT_LOG_PATH`, evidence bundle configuration, `CERBASEAL_SIGNING_KEY` (optional)

---

## Step 7 — Define the Deployment Mode

**Goal:** Confirm the deployment environment.

**Questions:**

| Question | Input Type | Validation |
|---|---|---|
| Where will CerbaSeal run? | Select: Our own server / Our cloud environment / Line Axia-provided environment | Required |
| What operating system is your server? | Select: Linux / macOS / Windows / Other | Required |
| Is Node.js 18+ already installed? | Yes / No / Unsure | Required |
| Is pnpm installed? | Yes / No / Unsure | Required |
| Do you have write access to the audit log directory? | Yes / No / Unsure | Required |

**Warnings shown if Node.js or pnpm not installed:**  
> "You will need to install these before deployment. The quickstart guide includes installation instructions."

**CerbaSeal mode reference:** Mode A (Lamont Labs hosted) / Mode B (client cloud) / Mode C (client on-prem)

---

## Step 8 — Generate Configuration Summary

**Goal:** Review all inputs before generating the configuration package.

**Display:** A summary page showing all answers from Steps 1–7, organized by CerbaSeal field.

**Sample summary:**

```
Workflow: transaction_fraud_review
Action: escalate_for_review (consequential, partially reversible)
AI Actor: ai (cannot self-authorize)
Approver: senior_analyst (mapped from "Senior Fraud Analyst")
Approval required: Yes
Approval method: System click
Audit log path: /data/cerbaseal/audit/fraud-review.jsonl
Retention: 7 years
Evidence owner: Our organization
Deployment: Our own server (Linux, Node.js 18+)
```

**User action:** Review and confirm. Or go back to any step and edit.

---

## Step 9 — Generate Pilot Checklist

**Goal:** Auto-generate a personalized pilot checklist from the configuration.

**Output:** A markdown checklist pre-filled with the client's workflow name, action class, approver role, audit log path, and scenario descriptions.

**Sample output:**

```markdown
# CerbaSeal Pilot Checklist — Transaction Fraud Review

## Deployment
- [ ] Node.js 18+ installed on target server
- [ ] pnpm installed
- [ ] CerbaSeal-Core cloned and dependencies installed
- [ ] pnpm test — 391/391 passing
- [ ] pnpm audit:repo — 15/15 passing
- [ ] pnpm export:proof — stableChecksum confirmed
- [ ] Audit log path configured: /data/cerbaseal/audit/fraud-review.jsonl
- [ ] Audit log directory exists and is writable

## Scenario Testing
- [ ] REJECT scenario: AI actor (ai) attempts to authorize escalate_for_review — outcome: REJECT
- [ ] HOLD scenario: escalate_for_review submitted without approval — outcome: HOLD
- [ ] ALLOW scenario: escalate_for_review submitted with senior_analyst approval — outcome: ALLOW

## Evidence Verification
- [ ] Evidence bundle generated for each scenario
- [ ] pnpm verify:proof passes after scenarios
- [ ] Audit log file contains 3 entries minimum

## Training
- [ ] Technical owner has reviewed admin guide
- [ ] Operational reviewers have reviewed operator guide
- [ ] FAQ reviewed
```

---

## Step 10 — Export Handoff Pack

**Goal:** Produce a complete, downloadable configuration package for the client's technical owner.

**Package contents:**

| File | Description |
|---|---|
| `cerbaseal-config.json` | CerbaSeal field map with all configured values |
| `pilot-checklist.md` | Personalized pilot checklist from Step 9 |
| `scenario-test.ts` | TypeScript test script for the three core scenarios |
| `scenario-test.sh` | Shell script version for non-TypeScript environments |
| `deployment-summary.md` | Summary of deployment configuration and environment requirements |
| `evidence-requirements.md` | Evidence retention and access control requirements |
| `handoff-notes.md` | Notes for the technical owner: what was configured, what to verify, who to contact |

**Download:** Single ZIP file. Client stores it securely — it contains configuration details.

---

## Data Model

```typescript
interface WizardConfiguration {
  workflowClass: string;
  workflowDescription: string;
  workflowFrequency: "continuous" | "hourly" | "daily" | "weekly" | "on_demand";
  actions: {
    name: string;
    actionClass: string;
    consequential: boolean;
    reversible: "yes" | "no" | "partially";
  }[];
  aiModel: {
    description: string;
    modelVersion?: string;
    hostingLocation: string;
  };
  approvers: {
    clientRoleName: string;
    authorityClass: ActorAuthorityClass;
  }[];
  approvalRequired: boolean;
  approvalMethod: string;
  holdBehavior: "hold_and_notify" | "hold_silent" | "reject";
  evidence: {
    auditLogPath: string;
    retentionPeriod: string;
    owner: "client" | "line_axia" | "joint";
    accessRoles: string[];
    hmacSigning: boolean;
  };
  deployment: {
    mode: "mode_a" | "mode_b" | "mode_c";
    os: string;
    nodeInstalled: boolean;
    pnpmInstalled: boolean;
  };
}
```

---

## Future Implementation Plan

**Phase 1 — Wizard backend (no UI)**  
Build a CLI or script-based version of the wizard that takes a JSON input file and generates the configuration package. Validates fields, generates the checklist and test scripts.

Estimated complexity: 1–2 weeks of development.

**Phase 2 — Simple web form**  
Build a multi-step web form (React + local state, no backend required) that collects inputs and generates the package in the browser. No server required — all generation is client-side.

Estimated complexity: 2–4 weeks of development.

**Phase 3 — Integrated portal page**  
Add the wizard as a new route in the browser demo portal (`/wizard`). Integrates with the existing portal design system.

Estimated complexity: 1 week of integration.

**Phase 4 — Validation and pre-flight**  
Add a pre-flight check step that validates the client's environment before generating the package (checks Node.js version, tests pnpm, verifies audit log path is writable).

Estimated complexity: 1–2 weeks of development.

**Gate for Phase 1:** At least one pilot completed manually, with the workflow mapping workbook used. Phase 1 should encode what was learned from that process.
