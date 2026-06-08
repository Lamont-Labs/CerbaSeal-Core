# CerbaSeal Audit Export

## Pattern

Read a JSONL audit log produced by `FileBackedAppendOnlyLogService` and export a formatted evidence summary. Shows clients how to integrate their existing log aggregation with CerbaSeal's output.

## When to use this kit

- A compliance reviewer needs a human-readable evidence summary from a CerbaSeal deployment
- You need to feed CerbaSeal audit entries into a SIEM, log aggregator, or compliance reporting tool
- You want to verify audit chain integrity on a log file after the fact

## Prerequisites

- A JSONL audit log produced by `FileBackedAppendOnlyLogService` (see below to generate one)
- Node.js 18+
- `pnpm tsx` available

## Setup

1. **Produce a JSONL audit log** using `FileBackedAppendOnlyLogService` in your deployment
   ```typescript
   import { FileBackedAppendOnlyLogService } from "cerbaseal-review/src/services/audit/file-backed-append-only-log-service.js";

   const logService = new FileBackedAppendOnlyLogService("./cerbaseal-audit.jsonl");
   // Each gate evaluation appended by EvidenceBundleService writes to this file
   ```
   See `examples/fraud-workflow-starter/` for a complete working example.

2. **Run the audit export**
   ```sh
   pnpm tsx examples/audit-export/index.ts ./cerbaseal-audit.jsonl
   ```

3. **Review the output**
   - Text summary prints to stdout
   - JSON summary follows for piping into downstream systems
   - Exit code 1 if chain integrity check fails

## What a correct run looks like

```
Reading audit log: ./cerbaseal-audit.jsonl

═══════════════════════════════════════════════════
  CerbaSeal Audit Log Evidence Summary
═══════════════════════════════════════════════════
  Source          : ./cerbaseal-audit.jsonl
  Total entries   : 12
  Unique requests : 3
  Chain valid     : YES ✓

  Decisions by Event Type:
    REQUEST_EVALUATED              3
    RELEASE_AUTHORIZED             2
    ACTION_BLOCKED                 1
    EVIDENCE_BUNDLE_CREATED        3
    EXPORT_MANIFEST_CREATED        3

  Decision Outcomes:
    Evaluated   (REQUEST_EVALUATED)      : 3
    Released    (RELEASE_AUTHORIZED)     : 2
    Blocked     (ACTION_BLOCKED)         : 1
═══════════════════════════════════════════════════
```

If the chain integrity check fails, the export exits with code 1 and prints:
```
ERROR: Audit chain integrity check failed. Log may have been tampered with.
```

## Integrating with a SIEM or log aggregator

The JSON output from `buildAuditSummary()` is structured for downstream consumption:
```typescript
import { parseJsonlLog, buildAuditSummary } from "./examples/audit-export/index.js";

const entries = parseJsonlLog("/var/log/cerbaseal/audit.jsonl");
const summary = buildAuditSummary(entries);

// summary.chainValid — send alert if false
// summary.actionsBlocked — feed into your SIEM metrics
// summary.releasesAuthorized — feed into compliance dashboard
```

## Validate

```sh
pnpm tsx examples/audit-export/validate-audit-export.ts
```

All checks print `[PASS]` and the script exits with code 0.
