# CerbaSeal Express Middleware

## Pattern

CerbaSeal as drop-in Express.js middleware. The `cerbaSealGate()` function returns a standard Express middleware that gates any route. The caller never reaches the downstream handler unless the gate returns `ALLOW`.

| Gate decision | HTTP response    | next() called? |
|---------------|-----------------|----------------|
| `ALLOW`       | — (calls next)  | Yes            |
| `HOLD`        | 202 + hold ref  | No             |
| `REJECT`      | 403 + reason    | No             |

## When to use this kit

- You have an existing Express.js application
- You want to gate specific routes or entire route groups
- You want the gate result available to downstream route handlers via `res.locals`

## Prerequisites

- Express.js installed in your project (`npm install express`)
- Node.js 18+
- CerbaSeal services configured (gate, logService, evidenceService)

## Setup

1. **Copy `cerbaSealGate` into your project** (or import from this file directly)

2. **Create the gate options object**
   ```typescript
   import { ExecutionGateService } from "cerbaseal-review/src/services/execution/execution-gate-service.js";
   import { AppendOnlyLogService } from "cerbaseal-review/src/services/audit/append-only-log-service.js";
   import { EvidenceBundleService } from "cerbaseal-review/src/services/evidence/evidence-bundle-service.js";

   const gate = new ExecutionGateService();
   const logService = new AppendOnlyLogService();
   const evidenceService = new EvidenceBundleService(logService);
   const opts = { gate, logService, evidenceService };
   ```

3. **Apply the middleware to your routes**
   ```typescript
   import express from "express";
   import { cerbaSealGate } from "./cerbaseal-middleware.js";

   const app = express();
   app.use(express.json());

   // Gate a single route
   app.post("/execute-action", cerbaSealGate(opts), (req, res) => {
     const { gateResult } = res.locals;
     res.json({ authorized: true, envelope: gateResult.decisionEnvelope });
   });

   // Gate an entire router
   const adminRouter = express.Router();
   adminRouter.use(cerbaSealGate(opts));
   adminRouter.post("/approve", yourApproveHandler);
   app.use("/admin", adminRouter);

   // Surface HOLD to the caller with a custom handler
   app.post("/ai-action", cerbaSealGate({
     ...opts,
     onHold: (req, res, bundle) => {
       // Queue the job for async review, return a tracking reference
       myQueue.add(bundle.evidenceBundleId, req.body);
       res.status(202).json({ held: true, trackingId: bundle.evidenceBundleId });
     }
   }), yourHandler);
   ```

## What a correct run looks like

```sh
pnpm tsx examples/express-middleware/index.ts
```

```
CERBASEAL EXPRESS MIDDLEWARE — DEMO

Example 1 — REJECT: AI actor attempts self-authorization
  → Response 422: { "error": "Gate evaluation failed", ... }

Example 2 — HOLD: System actor, fraud_triage requires approval
  → Response 202: { "held": true, "envelopeId": "env_mw-hold-001", ... }

Example 3 — ALLOW: System actor, non-approval workflow, all checks pass
  → next() called — gateResult in res.locals: true
```

## Validate

```sh
pnpm tsx examples/express-middleware/validate-express-middleware.ts
```

All checks print `[PASS]` and the script exits with code 0.
