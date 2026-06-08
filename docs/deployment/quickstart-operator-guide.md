# CerbaSeal — Quickstart Operator Guide

**Audience:** A technical owner deploying CerbaSeal for the first time  
**Time:** Under 2 hours for a standard deployment  
**Prerequisites:** Node.js 18+, pnpm, access to the CerbaSeal-Core source

This guide mirrors the `pnpm setup` wizard and can be followed manually if you prefer to work directly with the config files instead of running the interactive wizard.

---

## Step 1 — Clone and install

```bash
git clone <cerbaseal-core-repo-url>
cd cerbaseal-core
pnpm install
```

Confirm the installation is correct:

```bash
pnpm test
```

Expected output (last 3 lines):
```
Test Files  17 passed (17)
     Tests  432 passed (432)
  Duration  ~7s
```

Then run the full audit:

```bash
pnpm audit:repo
```

Expected output:
```
16 / 16 checks passed
Status: PASS
```

If either fails, do not proceed. Check Node.js version (`node --version` — must be 18+) and pnpm installation.

---

## Step 2 — Configure and start the gate

Two options. Choose one.

### Option A — Docker (no Node.js tooling required)

If the client machine has Docker and Docker Compose but no Node.js toolchain, use Docker Compose:

```bash
cp deployment-starter/.env.template deployment-starter/.env
# Edit deployment-starter/.env — set CERBASEAL_ENV=production
docker compose -f deployment-starter/docker-compose.yml up
```

Confirm the gate is running:

```bash
curl http://localhost:3000/health
# Expected: { "status": "ok", "gateReady": true, "auditChainValid": true, ... }
```

The Docker path skips Steps 3–5 below. The container handles configuration via `.env` and the baked-in `cerbaseal.policy.json`. Audit logs are persisted at `deployment-starter/data/audit.jsonl` on the host.

For custom policy: edit `deployment-starter/cerbaseal.policy.json` before building, or mount a policy file via the compose volume config.

See `deployment-starter/README.md` for Docker details.

### Option B — Node.js direct (full wizard)

**Prerequisites:** Node.js 18+, pnpm. Then:

```bash
pnpm setup
```

The wizard asks 6 questions and writes two files to the repo root:

| Question | What to enter |
|---|---|
| Deployment mode | A (Lamont Labs-hosted), B (partner-hosted), or C (client-controlled) |
| Workflow name | Your AI workflow's plain English name (e.g. "Transaction Fraud Review") |
| AI actor identifier | The ID your AI system uses when submitting requests |
| Number of approver roles | 1–3 human roles that will approve AI proposals |
| Approver role names + classes | Your role name (e.g. "Senior Analyst") → authority class (e.g. `analyst`) |
| Audit log path | File path for persistent logs, or `memory` for development |
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

---

## Step 3 — Review the generated config files

Two files are written to the repo root:

### `cerbaseal.config.json`
Defines the authority classes and workflow classes known to the runtime.

```json
{
  "authorityClasses": {
    "core": ["system", "ai", "analyst", "reviewer", "manager", "compliance_officer"],
    "extended": []
  },
  "workflowClasses": {
    "core": ["fraud_triage", "transaction_escalation", "account_hold_recommendation"],
    "extended": ["transaction_fraud_review"]
  }
}
```

Verify your workflow class appears under `workflowClasses.extended`.

### `cerbaseal.policy.json`
Defines actor mappings, approval chains, and action behaviour.

```json
{
  "actorMappings": {
    "Senior Analyst": "analyst"
  },
  "approvalChains": {
    "transaction_fraud_review": ["analyst"]
  },
  "actionPolicies": {
    "transaction_fraud_review": {
      "escalate": "requires_approval",
      "account_hold": "requires_approval",
      "allow": "auto_allow"
    }
  }
}
```

Verify:
- Your approver role names appear as keys in `actorMappings`
- Your workflow class and approver classes appear in `approvalChains`
- Action policies match your governance requirements

Edit either file if values need adjustment. Both files are human-readable JSON.

---

## Step 4 — Run `pnpm audit:repo`

After any edit to the config files, re-run the audit:

```bash
pnpm audit:repo
```

**What a passing result looks like (all 16 checks):**
```
CerbaSeal Repo Audit
====================================================
  ✓ PASS  1. Full test suite passes — 432 tests passed
  ✓ PASS  2. TypeScript compiles without errors — tsc --noEmit clean
  ✓ PASS  3. README anchor strings present — all 4 anchors found
  ✓ PASS  4. All portal routes respond 200 — 9 routes checked
  ...
  ✓ PASS  16. cerbaseal.policy.json parses without error — policy file valid

====================================================
16 / 16 checks passed
Status: PASS
```

Check 16 specifically validates `cerbaseal.policy.json` structure. If it fails, the error message names the specific field that is invalid.

---

## Step 5 — Run `verify.ts`

The verification script runs 3 live scenarios against the enforcement gate:

```bash
tsx deployment-starter/verify.ts
```

**What a passing result looks like:**
```
CerbaSeal Deployment Verification
====================================================
Runs 3 scenarios. All must [PASS] before production.

Scenario 1: REJECT — AI actor cannot self-authorize
  [PASS] finalState is REJECT
  [PASS] releaseAuthorization is null
  [PASS] blockedActionRecord is present

Scenario 2: HOLD — approval required but not supplied
  [PASS] finalState is HOLD
  [PASS] humanApprovalRequired is true
  [PASS] releaseAuthorization is null

Scenario 3: ALLOW — valid request with analyst approval
  [PASS] finalState is ALLOW
  [PASS] releaseAuthorization is present
  [PASS] humanApprovalPresent is true

====================================================
Results: 9 passed, 0 failed

✓ All 3 scenarios passed. Deployment verified.
```

When all 9 assertions show `[PASS]`, you have confirmed that:
1. The AI-cannot-self-authorize invariant is enforced (REJECT)
2. Missing approval causes a hold (HOLD)
3. Valid approval releases the gate (ALLOW)

Your deployment is verified and ready for integration.

---

## If a check fails

| Symptom | Likely cause | Resolution |
|---|---|---|
| Test suite fails | Source corruption or dependency issue | `pnpm install` then `pnpm test` |
| Audit check 16 fails | Invalid `cerbaseal.policy.json` | Check JSON syntax; review error message |
| verify.ts REJECT fails | Gate not rejecting AI self-authorization | Do not use `actorAuthorityClass: "ai"` with approval |
| verify.ts HOLD fails | approvalRequired flag not working | Check policy actorMappings and approvalChains |
| verify.ts ALLOW fails | approvalArtifact forRequestId mismatch | Ensure `forRequestId` matches the request's `requestId` |

For unresolved issues: `docs/client-adoption/troubleshooting-guide.md`

---

## Next steps after verification

- Integrate `ExecutionGateService` into your application (see `deployment-starter/index.ts`)
- Implement your approval bridge (when HOLD is returned, notify approvers)
- Set up the audit log at the configured path
- Train your team: `docs/client-adoption/training/`
- Run the full pilot checklist: `docs/deployment/pilot-deployment-checklist.md`
