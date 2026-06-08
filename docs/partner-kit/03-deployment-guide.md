# CerbaSeal — Partner Deployment Guide

**Audience:** Partner technical lead deploying CerbaSeal for a client  
**Time:** Under 2 hours for a standard deployment  
**Prerequisites:** Node.js 18+, pnpm, access to the CerbaSeal-Core source, completed workflow mapping session with client  

---

## Before You Start

Have the following ready before beginning:

- [ ] Node.js 18+ confirmed: `node --version`
- [ ] pnpm confirmed: `pnpm --version`
- [ ] Client workflow mapped: workflow name, actions, approver roles, authority classes
- [ ] Audit log path decided: file path for production (`/var/log/cerbaseal/workflow.jsonl`) or `memory` for development
- [ ] Deployment mode selected: A (Lamont Labs-hosted), B (partner-hosted), or C (client-controlled)

If you haven't done workflow mapping yet, complete that session first. Use `docs/client-adoption/workflow-mapping-workbook.md` as your facilitation guide.

---

## Step 1 — Clone and Install

```bash
git clone <cerbaseal-core-repo-url>
cd cerbaseal-core
pnpm install
```

Verify the installation is correct:

```bash
pnpm test
```

Expected output (last 3 lines):
```
Test Files  17 passed (17)
     Tests  432 passed (432)
  Duration  ~7s
```

Run the full audit:

```bash
pnpm audit:repo
```

Expected output:
```
16 / 16 checks passed
Status: PASS
```

**Do not proceed if either check fails.** The most common cause is an incorrect Node.js version. Verify with `node --version` — must be 18.0 or higher.

---

## Step 2 — Run the Setup Wizard

```bash
pnpm setup
```

The wizard asks 6 questions. Have your workflow mapping notes ready.

| Question | What to Enter |
|---|---|
| Deployment mode | A, B, or C |
| Workflow name | Client's plain English workflow name (e.g. "Transaction Fraud Review") |
| AI actor identifier | The ID the AI system uses in requests (e.g. "fraud-ai-agent") |
| Number of approver roles | 1–3 |
| Approver role names + classes | Client role name → authority class (e.g. "Senior Analyst" → `analyst`) |
| Audit log path | Production file path or `memory` for dev |
| Environment | `dev`, `staging`, or `production` |

**What a successful run looks like:**
```
CONFIGURATION SUMMARY
----------------------------------------------------
Deployment mode  : Mode C — Client-controlled
Workflow name    : Transaction Fraud Review
Workflow class   : transaction_fraud_review
AI actor         : fraud-ai-agent
Approvers        : Senior Analyst → analyst
Audit log        : /var/log/cerbaseal/fraud-review.jsonl
Environment      : production

Running pnpm audit:repo to verify configuration...

16 / 16 checks passed
Status: PASS

✓ Setup complete — CerbaSeal is configured and all 16 audit checks pass.
```

The wizard writes two files to the repo root: `cerbaseal.config.json` and `cerbaseal.policy.json`.

---

## Step 3 — Review and Extend the Policy File

Open `cerbaseal.policy.json`. The wizard generates a baseline. You will almost always need to extend it.

**Check the actor mappings:**
```json
"actorMappings": {
  "Senior Analyst": "analyst",
  "Head of Risk": "manager"
}
```
Verify every client role name that will appear in requests is mapped. Missing mappings cause `REJECT` with `MALFORMED_REQUEST`.

**Add workflowRules if not already present:**
```json
"workflowRules": [
  { "workflowClass": "transaction_fraud_review", "requiresApproval": true }
]
```
This is the simplest way to declare that the workflow requires human approval. The gate enforces it even if the caller doesn't set `approvalRequired: true`.

**Verify approval chains:**
```json
"approvalChains": {
  "transaction_fraud_review": ["analyst", "manager"]
}
```
Only approvers whose authority class is in this array will be accepted. If a `reviewer` tries to approve a chain that requires `analyst | manager`, the gate rejects the approval artifact.

**Review action policies:**
```json
"actionPolicies": {
  "transaction_fraud_review": {
    "escalate":     "requires_approval",
    "hold":         "requires_approval",
    "allow":        "requires_approval",
    "reject":       "auto_allow",
    "account_hold": "requires_approval"
  }
}
```
`requires_approval` — gate holds until a valid approval is present.  
`auto_allow` — no approval required by policy (core invariants still apply).  
`blocked` — gate rejects this action immediately regardless of anything else.

**Full policy authoring reference:** `docs/client-adoption/policy-pack-authoring-guide.md`

---

## Step 4 — Re-Run the Audit

After any edit to the policy file, re-run:

```bash
pnpm audit:repo
```

Check 16 specifically validates `cerbaseal.policy.json`. If it fails, the error message names the exact field that is invalid.

**All 16 checks must pass before proceeding.**

---

## Step 5 — Select an Integration Starter Kit

Use `examples/INTEGRATION-GUIDE.md` to select the right kit for the client's architecture.

| Client Architecture | Kit |
|---|---|
| Express.js API server | `examples/express-middleware/` |
| Webhook event pipeline | `examples/webhook-adapter/` |
| AI agent with human-in-the-loop | `examples/async-queue/` |
| Compliance export only | `examples/audit-export/` |
| Starting from scratch | `examples/rest-api-starter/` |
| Full approval lifecycle walkthrough | `examples/financial-approval-starter/` |
| Fraud triage + persistent audit log | `examples/fraud-workflow-starter/` |

Copy the selected starter kit into the client's codebase. Each kit includes a `README.md` with adaptation instructions. Time to working integration: 30 minutes for simple kits, 1–2 hours for async queue.

**Critical integration points:**

**Request construction:**
```typescript
const request: GovernedRequest = {
  requestId: crypto.randomUUID(),
  workflowClass: "transaction_fraud_review",
  jurisdiction: "EU",
  actorId: "fraud-ai-agent",
  actorAuthorityClass: "system",    // system submits; AI proposes
  proposedActionClass: "hold",
  proposal: {
    proposalSourceKind: "ai",
    authorityBearing: false,         // AI never claims authority
    requestedActionClass: "hold",
    confidence: 0.91,
    reasonCodes: ["velocity_anomaly", "geo_mismatch"],
    proposalCreatedAt: new Date().toISOString()
  },
  sensitive: true,
  prohibitedUse: false,
  policyPackRef: "cerbaseal.policy.json@v1",
  provenanceRef: {
    modelVersion: "fraud-model-v2.3",
    ruleSetVersion: "ruleset-2026-06-01",
    sourceHash: "sha256-abc123..."
  },
  approvalRequired: false,           // policy will enforce if required
  approvalArtifact: null,
  loggingReady: true,
  controlStatus: { criticalControlsValid: true, stale: false, verificationRunId: "vr_001" },
  trustState: { trusted: true, trustStateId: "trust_001" },
  createdAt: new Date().toISOString()
};
```

**Gate evaluation:**
```typescript
const result = gate.evaluate(request);

if (result.decisionEnvelope.finalState === "ALLOW") {
  // Proceed with the action
  const authId = result.releaseAuthorization!.releaseAuthorizationId;
} else if (result.decisionEnvelope.finalState === "HOLD") {
  // Queue for human review, then resubmit with ApprovalArtifact
} else {
  // REJECT — log reason codes, do not proceed
  const reasons = result.decisionEnvelope.trace.reasonCodes;
}
```

---

## Step 6 — Run Deployment Verification

```bash
tsx deployment-starter/verify.ts
```

This runs 3 live scenarios against the gate:

1. **REJECT** — AI actor attempts self-authorization → must be rejected
2. **HOLD** — Request submitted without approval artifact → must be held
3. **ALLOW** — Request with valid approval artifact → must be allowed

**All 9 assertions must show `[PASS]`.** If any fail, see the troubleshooting table below.

---

## Step 7 — Generate the Initial Proof Snapshot

Before handing off to the client's team:

```bash
pnpm export:proof
```

Then verify it:

```bash
pnpm verify:proof
```

Expected output: `Proof snapshot verified — stableChecksum confirmed`.

This is the baseline evidence record. Every subsequent `export:proof` run is comparable to this baseline. Ship this snapshot with the handoff package.

---

## Handoff Checklist

Use this checklist when transferring operation to the client's technical owner:

**Deployment verification:**
- [ ] `pnpm test` — 432/432 passing
- [ ] `pnpm audit:repo` — 16/16 passing
- [ ] `tsx deployment-starter/verify.ts` — 9/9 passing (REJECT, HOLD, ALLOW)
- [ ] `pnpm export:proof` — stableChecksum confirmed
- [ ] `pnpm verify:proof` — verification passes

**Configuration verification:**
- [ ] All client role names appear in `actorMappings`
- [ ] Workflow class appears in `workflowRules` (requiresApproval: true)
- [ ] Approval chain matches client's authorization structure
- [ ] Action policies match governance requirements for each action class
- [ ] Audit log path is correct and writable

**Client team readiness:**
- [ ] Technical owner has run `pnpm audit:repo` independently and can interpret results
- [ ] Technical owner knows where to find logs and how to read JSONL format
- [ ] Technical owner has reviewed `docs/client-adoption/training/admin-guide.md`
- [ ] Operational reviewers have reviewed `docs/client-adoption/training/reviewer-guide.md`
- [ ] Escalation path confirmed: client self-service → partner (you) → Lamont Labs

**Evidence package:**
- [ ] `proof-snapshot.json` exported and verified
- [ ] JSONL audit log contains at least 3 entries (one per verification scenario)
- [ ] Client has a copy of the handoff package (config files, proof snapshot, checklist)

---

## Troubleshooting Quick Reference

| Symptom | Likely Cause | Resolution |
|---|---|---|
| `pnpm test` fails | Node.js version or dependency issue | `node --version` (must be 18+); `pnpm install` then retry |
| Audit check 2 (TypeScript) fails | Compile error from a config edit | Fix JSON syntax in config files; re-run |
| Audit check 16 (policy) fails | Invalid `cerbaseal.policy.json` | Read the error message — it names the exact field |
| REJECT during verify.ts scenario 1 | Expected — this is the AI self-auth test | Confirm it shows `[PASS] finalState is REJECT` |
| HOLD doesn't release | `forRequestId` mismatch in ApprovalArtifact | Ensure `forRequestId` exactly matches the original `requestId` |
| ALLOW fails with INVALID_APPROVAL_AUTHORITY | Approver not in configured chain | Check `approvalChains` — approver's class must be listed |
| `export:proof` stableChecksum changes | Source file or test count changed | Expected after code changes; not expected after config changes only |

**For issues not in this table:** See [05-support-guide.md](05-support-guide.md).

---

*For policy authoring detail, see `docs/client-adoption/policy-pack-authoring-guide.md`. For integration kit selection, see `examples/INTEGRATION-GUIDE.md`.*

---

## Appendix — Deployment and Pilot Checklist

Use this checklist as the single authoritative sign-off for any deployment moving toward pilot operation. Both partner and client should be able to check every item before the pilot run begins.

### Deployment Steps

| Step | Checklist Item | Owner |
|------|---------------|-------|
| 1 | Confirm pilot workflow, actor roles, approval path, and deployment mode | Client + partner |
| 2 | Confirm hosting environment, network controls, persistence path, and operational owner | Client |
| 3 | Prepare `cerbaseal.config.json` and `cerbaseal.policy.json` | Partner + client review |
| 4 | Run installation path: Docker Compose or Node.js Direct | Partner engineer |
| 5 | Run `pnpm test` — all tests must pass | Partner engineer |
| 6 | Run `pnpm audit:repo` — all 16 checks must pass | Partner engineer |
| 7 | Run setup wizard or manually verify config/policy files | Partner engineer |
| 8 | Run ALLOW, HOLD, and REJECT verification scenarios via `tsx deployment-starter/verify.ts` | Partner + client |
| 9 | Confirm `GET /health` returns `status: "ok"` and `auditChainValid: true` | Partner engineer |
| 10 | Run representative pilot requests against the mapped workflow | Client + partner |
| 11 | Run `pnpm export:proof` and `pnpm verify:proof` — checksum must match | Partner |
| 12 | Review evidence package with operational and compliance stakeholders | Client + partner |
| 13 | Document issues, support tickets, and next-step recommendation | Partner + Lamont Labs as needed |

### Partner Readiness Checklist

Before leading any client deployment, confirm you can demonstrate each of the following independently:

| Readiness Area | Partner Must Be Able to Demonstrate |
|---------------|-------------------------------------|
| Positioning | Explain CerbaSeal as governance enforcement infrastructure, not workflow software or compliance software |
| Deployment | Stand up deployment starter and validate health without Lamont Labs intervention |
| Configuration | Author a policy for a new workflow using actor mappings, approval chains, workflow rules, and action policies |
| Verification | Run ALLOW, HOLD, and REJECT scenarios and interpret output |
| Evidence | Export and verify proof package; explain evidence artifacts to a client stakeholder |
| Support | Resolve common deployment and configuration issues using support guide before escalating |
| Escalation discipline | Know which issues require Lamont Labs Tier 3 involvement |
| Pilot leadership | Guide a client through discovery, mapping, deployment, verification, pilot run, evidence closeout, and handoff |
