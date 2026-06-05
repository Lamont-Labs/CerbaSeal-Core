# CerbaSeal — Fraud Workflow Starter Kit

## What This Is

A working fraud triage pattern with AI-scored risk classification, automatic routing to the correct approver level, and a persistent JSONL audit log.

**Use this when:**
- You have a fraud detection model that scores transactions
- Different risk levels require different approval authority (analyst vs. compliance officer)
- You need a durable audit trail that survives process restarts

## Pattern

```
Transaction → Fraud Model Score → Risk Classification
                                        │
              ┌─────────────────────────┼──────────────────────────┐
              │                         │                           │
          Score < 50              50 ≤ Score < 80              Score ≥ 80
         Auto-allow              Hold → Analyst           Hold → Compliance Officer
              │                         │                           │
           ALLOW                 HOLD → ALLOW               HOLD → ALLOW
              │                   (with approval)            (with approval)
              └────────────────────────┬──────────────────────────┘
                                       │
                              Persistent Audit Log
                              (hash-chained JSONL)
```

## Run It

```bash
# Run the fraud workflow demo
pnpm tsx examples/fraud-workflow-starter/index.ts

# Set a custom audit log path
CERBASEAL_AUDIT_LOG_PATH=/data/audit/fraud.jsonl pnpm tsx examples/fraud-workflow-starter/index.ts
```

Expected output:
```
CERBASEAL FRAUD WORKFLOW STARTER
Audit log: ./audit/fraud-triage.jsonl

Transaction: txn-low-001
  Amount: €45 | Risk score: 12 | Action: allow
  Gate decision (no approval): ALLOW

Transaction: txn-med-001
  Amount: €2800 | Risk score: 63 | Action: hold
  Gate decision (no approval): HOLD
  Gate decision (with analyst approval): ALLOW

Transaction: txn-high-001
  Amount: €18500 | Risk score: 91 | Action: escalate
  Gate decision (no approval): HOLD
  Gate decision (with compliance_officer approval): ALLOW
```

## Risk Classification Rules

| Risk Score | Action | Approver Required |
|---|---|---|
| 0–49 | `allow` | None (deterministic rule, no approval needed) |
| 50–79 | `hold` | `analyst` |
| 80–100 | `escalate` | `compliance_officer` |

These thresholds are in `index.ts` — change them to match your model's calibration.

**Important:** The `fraud_triage` workflow class has **unconditional approval enforcement**. Even when `approvalRequired: false` is set in the request, the gate requires approval. This is by design — the gate ignores the caller's flag for this workflow class. The output above shows the low-risk transaction getting HOLD because of this enforcement.

To allow auto-approval for low-risk transactions, switch the workflow class to `transaction_escalation` for those cases, which respects the `approvalRequired` flag from the caller.

## Persistent Audit Log

This starter uses `FileBackedAppendOnlyLogService` which writes to a JSONL file. The audit log:

- Survives process restarts (entries are loaded on startup)
- Verifies chain integrity on load (tampered entries are detected)
- Appends new entries without modifying existing ones
- Can be read with any JSONL viewer or `cat`

**Set the log path:**
```bash
export CERBASEAL_AUDIT_LOG_PATH=/data/cerbaseal/audit/fraud-triage.jsonl
```

**Verify the chain:**
```bash
pnpm verify:proof
```

## Adapting to Your System

1. **Connect your fraud model:** Replace the hardcoded `riskScore` and `riskSignals` in `buildFraudRequest()` with your model's actual output.

2. **Adjust risk thresholds:** Change the `classifyRisk()` function to match your model's score distribution.

3. **Add more approver levels:** Extend the thresholds and approver classes. Add custom classes via `cerbaseal.config.json`.

4. **Connect your approval system:** When an analyst or compliance officer approves in your portal, construct an `ApprovalArtifact` and call `processFraudTransaction(txn, true)` with the approval attached to the re-submitted request.

## Key Fraud Workflow Invariant

`fraud_triage` is a special workflow class with unconditional approval enforcement:

```typescript
const WORKFLOWS_REQUIRING_APPROVAL = new Set<WorkflowClass>(["fraud_triage"]);
```

This means: even if a caller sets `approvalRequired: false` on a fraud triage request, CerbaSeal will still require approval. This prevents accidental or malicious bypass of the approval requirement for this workflow class.
