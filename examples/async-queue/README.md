# CerbaSeal Async Queue

## Pattern

CerbaSeal in an async workflow with an in-memory job queue. An AI worker proposes an action, the gate holds it for human review, a reviewer approves, and the job is released. No external queue library required — all state is in-memory to keep the pattern clear.

```
AI proposes action
       ↓
  JobQueue.enqueue()
       ↓
  gate.evaluate()
       ↓
   ┌─────────┬──────────────┐
  HOLD      ALLOW          REJECT
   ↓           ↓              ↓
pending     released       blocked
   ↓
human reviews
   ↓
JobQueue.approve()
   ↓
gate.evaluate() (with ApprovalArtifact)
   ↓
  ALLOW → released
```

## When to use this kit

- AI agents propose consequential actions that require human approval before execution
- You need to decouple the proposal step from the execution step
- You want to model async review loops before integrating a real queue (Bull, BullMQ, SQS, etc.)

## Prerequisites

- Node.js 18+
- `pnpm tsx` available (already set up in this repo)

## Setup

1. **Instantiate the queue** with your gate, log, and evidence services
   ```typescript
   import { JobQueue } from "./examples/async-queue/index.js";

   const queue = new JobQueue(gate, logService, evidenceService);
   ```

2. **Enqueue a job when your AI worker proposes an action**
   ```typescript
   const job = queue.enqueue(governedRequest);
   if (job.status === "HELD") {
     // Notify a human reviewer — the job is waiting
     notifyReviewer(job.jobId);
   } else if (job.status === "ALLOWED") {
     // Execute immediately — no approval required
     executeAction(job.request);
   }
   ```

3. **Approve from your reviewer interface**
   ```typescript
   const released = queue.approve(jobId, {
     reviewerId: "reviewer-alice-001",
     approverAuthorityClass: "reviewer"
   });
   if (released.status === "ALLOWED") {
     executeAction(released.request);
   }
   ```

## What a correct run looks like

```sh
pnpm tsx examples/async-queue/index.ts
```

```
CERBASEAL ASYNC QUEUE — DEMO

Simulating: AI proposes escalation → gate holds → reviewer approves → released

Step 1 — AI worker enqueues job
  → Job ID : queue-job-001
  → Status : HELD (waiting for human approval)
  → Held jobs: 1

Step 2 — Human reviewer approves
  → Status : ALLOWED
  → Released at: 2026-06-08T...
  → Evidence bundle: evidence_queue-job-001
  → Approver: reviewer-alice-001

Step 3 — Audit chain
  → Audit entries: 4
  → Chain valid  : true
```

## Replacing the in-memory queue with a real one

The `JobQueue` class is the integration boundary. To use BullMQ, SQS, or any other queue:
1. Replace `this.jobs = new Map()` with calls to your queue client
2. Keep `gate.evaluate()` and `evidenceService.createBundle()` calls unchanged
3. The approval API (`queue.approve()`) becomes a queue consumer that processes approved messages

## Validate

```sh
pnpm tsx examples/async-queue/validate-async-queue.ts
```

All checks print `[PASS]` and the script exits with code 0.
