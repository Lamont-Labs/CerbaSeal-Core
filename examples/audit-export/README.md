# CerbaSeal Audit Export

## Pattern

Read the JSONL audit log produced by `FileBackedAppendOnlyLogService`, verify hash chain integrity, and export a formatted evidence summary. Optionally enrich the report with workflow class, actor authority, and actor ID grouping from a companion evidence bundle log.

## When to use this kit

- A compliance reviewer needs a chain-verified audit summary
- You need to feed CerbaSeal audit entries into a SIEM or log aggregator
- You want to verify audit log integrity on a file produced by your deployment
- You need decision counts grouped by outcome, workflow, and actor for compliance reporting

## How the audit log is produced

`FileBackedAppendOnlyLogService` appends one `AuditLogEntry` per event. `EvidenceBundleService` triggers 3 entries per gate evaluation:

| Event type | When written | Inferred meaning |
|---|---|---|
| `REQUEST_EVALUATED` | Every evaluation | Decision was submitted |
| `RELEASE_AUTHORIZED` | ALLOW outcomes only | → ALLOW decision |
| `ACTION_BLOCKED` | HOLD / REJECT outcomes only | → HOLD or REJECT decision |
| `EVIDENCE_BUNDLE_CREATED` | Every evaluation | Bundle was sealed |

Each entry has: `eventId`, `requestId`, `eventType`, `timestamp`, `payloadHash`, `previousHash`, `entryHash`. The payloads are one-way hashed (not stored inline) so chain integrity is verifiable from the entry fields alone.

## Prerequisites

- Node.js 18+
- `pnpm tsx` available
- An audit JSONL file from a running CerbaSeal deployment (see Setup)

## Setup

1. **Use `FileBackedAppendOnlyLogService` in your deployment** (instead of the in-memory `AppendOnlyLogService`):
   ```typescript
   import { ExecutionGateService } from "cerbaseal-review/src/services/execution/execution-gate-service.js";
   import { FileBackedAppendOnlyLogService } from "cerbaseal-review/src/services/audit/file-backed-append-only-log-service.js";
   import { EvidenceBundleService } from "cerbaseal-review/src/services/evidence/evidence-bundle-service.js";

   const gate = new ExecutionGateService();
   const logService = new FileBackedAppendOnlyLogService("./audit.jsonl");
   const evidenceService = new EvidenceBundleService(logService);

   // After each gate evaluation:
   const result = gate.evaluate(request);
   evidenceService.createBundle({ request, gateResult: result });
   // → audit.jsonl receives 3–4 new entries
   ```
   See `examples/fraud-workflow-starter/` for a complete working example.

2. **Run the audit export**
   ```sh
   # Basic: chain verification + outcome counts from audit log
   pnpm tsx examples/audit-export/index.ts ./audit.jsonl

   # Full: add workflow/actor grouping via evidence bundle enrichment
   pnpm tsx examples/audit-export/index.ts ./audit.jsonl ./evidence-log.jsonl
   ```

3. **For richer grouping (workflow class, actor, actor authority)**, also write evidence bundles:
   ```typescript
   import { writeEvidenceBundle } from "./examples/audit-export/index.js";

   const result = gate.evaluate(request);
   const bundle = evidenceService.createBundle({ request, gateResult: result });
   writeEvidenceBundle("./evidence-log.jsonl", bundle);
   ```

## What a correct run looks like

**Without evidence bundles** (from raw audit log):
```
Reading audit log: ./audit.jsonl
Parsed 15 entries

═══════════════════════════════════════════════════════════
  CerbaSeal Audit Log Evidence Summary
═══════════════════════════════════════════════════════════
  Audit log        : ./audit.jsonl
  Total entries    : 15
  Unique requests  : 5
  Chain valid      : YES ✓

  Inferred Decision Outcomes (from event types):
    ALLOW   (RELEASE_AUTHORIZED)  : 4
    BLOCKED (ACTION_BLOCKED)       : 1

  By Event Type:
    REQUEST_EVALUATED                    5
    RELEASE_AUTHORIZED                   4
    ACTION_BLOCKED                       1
    EVIDENCE_BUNDLE_CREATED              5

  Note: workflowClass, actorId, and actorAuthorityClass dimensions
  require the evidence bundle log. See README for how to produce it.
═══════════════════════════════════════════════════════════
```

**With evidence bundles** (full grouping):
```
  By Workflow Class:
    transaction_escalation               4
    fraud_triage                         1

  By Actor Authority Class:
    system                               4
    analyst                              1

  By Actor ID:
    governance-system                    3
    risk-orchestrator                    1
    analyst-jane-001                     1
```

## Using the output programmatically

```typescript
import { parseAuditLog, parseEvidenceBundleLog, buildAuditSummary } from "./examples/audit-export/index.js";

const entries = parseAuditLog("/var/log/cerbaseal/audit.jsonl");
const bundles = parseEvidenceBundleLog("/var/log/cerbaseal/evidence-log.jsonl"); // optional
const summary = buildAuditSummary(entries, bundles);

// summary.chainValid              — alert if false (possible tampering)
// summary.inferredOutcomes.allow  — ALLOW count from RELEASE_AUTHORIZED events
// summary.inferredOutcomes.blocked — HOLD/REJECT count from ACTION_BLOCKED events
// summary.byWorkflowClass         — per-workflow counts (if bundles provided)
// summary.byActorAuthorityClass   — per-authority-class counts (if bundles provided)
```

## Validate

```sh
pnpm tsx examples/audit-export/validate-audit-export.ts
```

All checks print `[PASS]` and the script exits with code 0.
