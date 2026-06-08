# CerbaSeal Audit Export

## Pattern

Read a CerbaSeal decision log and export a formatted evidence report grouped by workflow class, actor authority, actor ID, and decision outcome. Verifies hash chain integrity on the raw audit log alongside the reporting output.

## When to use this kit

- A compliance reviewer needs an evidence summary showing decisions by workflow, actor, and outcome
- You need to feed CerbaSeal decision data into a SIEM, log aggregator, or compliance dashboard
- You want to verify audit chain integrity on the raw JSONL log after the fact
- You need a structured JSON summary for downstream tooling

## Two-file approach

CerbaSeal produces two JSONL files per deployment. Both are needed for a complete evidence picture:

| File | Produced by | Contains | Use for |
|---|---|---|---|
| `audit.jsonl` | `FileBackedAppendOnlyLogService` | Hash-chain AuditLogEntry records | Tamper detection, immutability proof |
| `decisions.jsonl` | `writeDecisionRecord()` in this kit | AuditDecisionRecord with workflowClass, actorId, finalState | Grouping, reporting, dashboards |

The `decisions.jsonl` file is the reporting layer. It is NOT a replacement for the immutable audit chain — it is a companion that makes the data human-readable and groupable.

## Prerequisites

- Node.js 18+
- `pnpm tsx` available
- A running CerbaSeal deployment that calls `writeDecisionRecord()` after each evaluation (see Setup)

## Setup

1. **Add `writeDecisionRecord()` to your deployment** — call it after each gate evaluation:
   ```typescript
   import { ExecutionGateService } from "cerbaseal-review/src/services/execution/execution-gate-service.js";
   import { FileBackedAppendOnlyLogService } from "cerbaseal-review/src/services/audit/file-backed-append-only-log-service.js";
   import { EvidenceBundleService } from "cerbaseal-review/src/services/evidence/evidence-bundle-service.js";
   import { writeDecisionRecord } from "./examples/audit-export/index.js";

   const gate = new ExecutionGateService();
   const logService = new FileBackedAppendOnlyLogService("./audit.jsonl");
   const evidenceService = new EvidenceBundleService(logService);

   // After each evaluation:
   const result = gate.evaluate(request);
   evidenceService.createBundle({ request, gateResult: result });
   writeDecisionRecord("./decisions.jsonl", request, result);
   ```
   See `examples/fraud-workflow-starter/` for a complete working deployment example.

2. **Run the audit export**
   ```sh
   # Both files (report + chain verification):
   pnpm tsx examples/audit-export/index.ts ./decisions.jsonl ./audit.jsonl

   # Decisions report only (no chain check):
   pnpm tsx examples/audit-export/index.ts ./decisions.jsonl

   # Chain integrity check only:
   pnpm tsx examples/audit-export/index.ts "" ./audit.jsonl
   ```

3. **Review the output** — text summary prints to stdout, JSON summary follows for piping

## What a correct run looks like

```
Read 12 decision records from ./decisions.jsonl
Read 48 audit chain entries from ./audit.jsonl

═══════════════════════════════════════════════════════════
  CerbaSeal Audit Evidence Summary
═══════════════════════════════════════════════════════════
  Decisions file   : ./decisions.jsonl
  Chain log file   : ./audit.jsonl
  Chain valid      : YES ✓
  Raw log entries  : 48
  Total decisions  : 12

  By Decision Outcome:
    ALLOW       8  ████████
    HOLD        3  ███
    REJECT      1  █

  By Workflow Class:
    transaction_escalation           8
    fraud_triage                     4

  By Actor Authority Class:
    system                           9
    analyst                          3

  By Actor ID:
    governance-system                7
    risk-orchestrator                2
    analyst-jane-001                 3
═══════════════════════════════════════════════════════════
```

If the chain integrity check fails, the export exits with code 1.

## Integrating with a SIEM or compliance dashboard

The JSON output from `buildAuditSummary()` is structured for downstream consumption:

```typescript
import { parseDecisionLog, parseAuditChainLog, buildAuditSummary } from "./examples/audit-export/index.js";

const decisions = parseDecisionLog("/var/log/cerbaseal/decisions.jsonl");
const chain = parseAuditChainLog("/var/log/cerbaseal/audit.jsonl");
const summary = buildAuditSummary(decisions, chain);

// summary.byFinalState      — feed into outcome metrics
// summary.byWorkflowClass   — feed into per-workflow dashboards
// summary.byActorAuthorityClass — track authority class distribution
// summary.chainVerified     — alert if false (possible tampering)
```

## Validate

```sh
pnpm tsx examples/audit-export/validate-audit-export.ts
```

All checks print `[PASS]` and the script exits with code 0.
