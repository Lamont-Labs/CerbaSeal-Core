# CerbaSeal Audit Export

## Pattern

Read a persisted CerbaSeal evidence bundle log and export a formatted evidence report grouped by decision outcome, workflow class, actor authority, and actor ID. Shows clients how to integrate CerbaSeal's canonical decision output into their existing log aggregation and compliance tooling.

## When to use this kit

- A compliance reviewer needs decision counts grouped by workflow, actor, and outcome
- You need to feed CerbaSeal decision data into a SIEM, log aggregator, or compliance dashboard
- You want a structured JSON summary suitable for downstream reporting systems

## The input file: evidence bundle JSONL

CerbaSeal's canonical decision artifact is the **EvidenceBundle** — produced by `evidenceService.createBundle()` after each gate evaluation. It contains:

- `decisionEnvelope.finalState` — ALLOW / HOLD / REJECT
- `decisionEnvelope.workflowClass` — the workflow that was governed
- `request.actorId` — who submitted the request
- `request.actorAuthorityClass` — their authority class (system, analyst, reviewer, etc.)
- `request.approvalArtifact` — the approver identity (if applicable)
- `eventChain` — the hash-linked audit event chain

Persist one bundle per evaluation to a JSONL file using `writeEvidenceBundle()`:

```typescript
import { ExecutionGateService } from "cerbaseal-review/src/services/execution/execution-gate-service.js";
import { AppendOnlyLogService } from "cerbaseal-review/src/services/audit/append-only-log-service.js";
import { EvidenceBundleService } from "cerbaseal-review/src/services/evidence/evidence-bundle-service.js";
import { writeEvidenceBundle } from "./examples/audit-export/index.js";

const gate = new ExecutionGateService();
const logService = new AppendOnlyLogService();          // or FileBackedAppendOnlyLogService
const evidenceService = new EvidenceBundleService(logService);

// After each evaluation:
const result = gate.evaluate(request);
const bundle = evidenceService.createBundle({ request, gateResult: result });
writeEvidenceBundle("./evidence-log.jsonl", bundle);
```

See `examples/fraud-workflow-starter/` for a complete working deployment. Add the `writeEvidenceBundle()` call alongside the existing `evidenceService.createBundle()` call in that starter.

## Prerequisites

- Node.js 18+
- `pnpm tsx` available (already set up in this repo)
- An evidence-log.jsonl file produced by your deployment (see above)

## Setup

1. **Add `writeEvidenceBundle()` to your deployment** (see above)

2. **Run the export**
   ```sh
   pnpm tsx examples/audit-export/index.ts ./evidence-log.jsonl
   ```

3. **Review the output**
   - Text summary prints to stdout, grouped by outcome / workflow / actor authority / actor ID
   - JSON summary follows for piping into downstream systems

## What a correct run looks like

```
Reading evidence bundle log: ./evidence-log.jsonl

Parsed 12 evidence bundles

═══════════════════════════════════════════════════════════
  CerbaSeal Audit Evidence Summary
═══════════════════════════════════════════════════════════
  Source file      : ./evidence-log.jsonl
  Total decisions  : 12
  ALLOW            : 8
  HOLD             : 3
  REJECT           : 1

  By Decision Outcome:
    ALLOW        8  ████████
    HOLD         3  ███
    REJECT       1  █

  By Workflow Class:
    transaction_escalation               8
    fraud_triage                         4

  By Actor Authority Class:
    system                               9
    analyst                              3

  By Actor ID:
    governance-system                    7
    risk-orchestrator                    2
    analyst-jane-001                     3
═══════════════════════════════════════════════════════════
```

## Using the output programmatically

```typescript
import { parseEvidenceBundleLog, buildAuditSummary } from "./examples/audit-export/index.js";

const bundles = parseEvidenceBundleLog("/var/log/cerbaseal/evidence-log.jsonl");
const summary = buildAuditSummary(bundles);

// summary.byFinalState          — outcome counts for metrics
// summary.byWorkflowClass       — per-workflow breakdown
// summary.byActorAuthorityClass — authority class distribution
// summary.byActorId             — per-actor decision counts
// summary.allowCount            — convenience count for ALLOW
// summary.holdCount             — convenience count for HOLD
// summary.rejectCount           — convenience count for REJECT
```

## Validate

```sh
pnpm tsx examples/audit-export/validate-audit-export.ts
```

All checks print `[PASS]` and the script exits with code 0.
