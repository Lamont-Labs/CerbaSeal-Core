# CerbaSeal — Financial Approval Starter Kit

## What This Is

A working example of the two-step financial approval pattern: an AI model recommends an action, a human analyst reviews it, and a manager must approve before the action executes.

**Use this when:**
- You have an AI model that scores or recommends financial actions
- You need human review before any consequential action is taken
- Your approval chain has multiple authority levels (analyst → manager)

## Pattern

```
1. AI model scores transaction → recommends action
2. CerbaSeal gate receives request (no approval yet) → HOLD
3. Human analyst reviews → agrees or overrides
4. Manager approves
5. CerbaSeal gate receives request (with approval artifact) → ALLOW
6. Action is executed with evidence
```

## Run It

```bash
pnpm tsx examples/financial-approval-starter/index.ts
```

Expected output:
```
CERBASEAL FINANCIAL APPROVAL STARTER

Step 1 — Submit without approval (expected: HOLD)
  → Gate decision: HOLD
  → Reason: REQUIRED_APPROVAL_MISSING, DECISION_HELD

Step 2 — Manager reviews and approves
Step 3 — Resubmit with approval (expected: ALLOW)
  → Gate decision: ALLOW
  → Release authorization: release_txn-escalation-001
  → Action class: escalate

Step 4 — Generate evidence bundle
  → Evidence bundle: evidence_txn-escalation-001
  → Event chain length: 4
  → Audit chain valid: true

Step 5 — Verify: AI alone cannot authorize (expected: REJECT)
  → Gate decision: REJECT
  → Reason: AI_CANNOT_AUTHORIZE, DECISION_REJECTED
```

## Key Fields for Financial Workflows

| Field | Value | Why |
|---|---|---|
| `workflowClass` | `transaction_escalation` | Maps to the built-in transaction escalation workflow |
| `actorAuthorityClass` | `analyst` | The analyst reviewing the AI recommendation |
| `approvalArtifact.approverAuthorityClass` | `manager` | The manager giving final approval |
| `approvalRequired` | `true` | Financial actions always require human approval |
| `proposal.authorityBearing` | `false` | AI cannot authorize its own proposals |

## Adapting to Your System

1. **Map your roles:** Replace `"analyst"` and `"manager"` with the authority classes that match your organization. Add custom roles via `cerbaseal.config.json` (no code changes).

2. **Connect your AI model:** The `proposal` field carries the AI recommendation. Set `confidence` to your model's score, `reasonCodes` to the signal names your model uses.

3. **Implement the approval bridge:** When your manager approves in your system (button click, signed record, etc.), construct an `ApprovalArtifact` with `forRequestId` bound to the original request. Resubmit the request with this artifact.

4. **Persist the audit log:** Swap `AppendOnlyLogService` for `FileBackedAppendOnlyLogService` to persist across restarts:
   ```typescript
   import { FileBackedAppendOnlyLogService } from "../../src/services/audit/file-backed-append-only-log-service.js";
   const logService = new FileBackedAppendOnlyLogService("./audit/financial.jsonl");
   ```

## Custom Authority Classes

If your organization has roles like `risk_officer` or `vp_risk`, add them to `cerbaseal.config.json`:
```json
{
  "authorityClasses": {
    "core": ["system", "ai", "analyst", "reviewer", "manager", "compliance_officer"],
    "extended": ["risk_officer", "vp_risk", "head_of_compliance"]
  }
}
```

Then initialize:
```typescript
import { loadCerbaSealConfig } from "../../src/config/cerbaseal-config.js";
const config = loadCerbaSealConfig();
const gate = new ExecutionGateService(config);
```

## What CerbaSeal Guarantees

- Every ALLOW has a `releaseAuthorization` bound to the specific request, approver, and approval artifact
- Every HOLD and REJECT has a `blockedActionRecord` with reason codes explaining why
- The audit event chain is hash-linked — any tampering invalidates the chain
- AI actors cannot authorize their own proposals — ever

## What CerbaSeal Does Not Guarantee

- That your approval UI actually enforces who can approve (CerbaSeal trusts the `ApprovalArtifact` you construct)
- That your system acts on the gate decision (CerbaSeal decides; your system must honor that decision)
- That the action was actually executed (CerbaSeal authorizes; execution is your responsibility)

See `docs/09-trust-boundary-and-limitations.md` for the complete trust boundary.
