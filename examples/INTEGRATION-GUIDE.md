# CerbaSeal Integration Guide

Use this guide to choose the right starter kit for your architecture. Answer the question for your system and follow the path to the recommended kit.

---

## Decision tree

**Q1: Does your system already have a web framework or HTTP layer?**

- Yes, Express.js → **express-middleware** kit
- Yes, another framework (Fastify, NestJS, Hapi) → **express-middleware** kit (same middleware contract, same interface)
- No, or you need a standalone service → go to Q2

**Q2: Does your system emit events to webhook endpoints?**

- Yes → **webhook-adapter** kit
- No → go to Q3

**Q3: Do AI agents propose actions that need human review before execution?**

- Yes, and I need a job queue → **async-queue** kit
- No, I just need to read existing audit logs → **audit-export** kit

---

## Starter kit selection table

| Your architecture | Recommended kit | What it demonstrates | Time to working integration |
|---|---|---|---|
| Express.js API server | `examples/express-middleware/` | `cerbaSealGate()` middleware; ALLOW → next(), REJECT → 403, HOLD → 202 | 30 minutes |
| Webhook-driven event pipeline | `examples/webhook-adapter/` | HTTP receiver; POST /event → gate → POST callback; async approval loop | 1 hour |
| AI agent with async human-in-the-loop | `examples/async-queue/` | In-memory JobQueue; enqueue → HOLD → approve → ALLOW; replaces any queue backend | 1–2 hours |
| Existing deployment, need compliance output | `examples/audit-export/` | Read JSONL log; verify chain integrity; export counts by event type | 30 minutes |
| Any of the above + starting from scratch | `examples/rest-api-starter/` | Standalone HTTP gate server; evaluate endpoint; decision history | 1 hour |
| Full approval lifecycle walkthrough | `examples/financial-approval-starter/` | HOLD → manager approves → ALLOW; ApprovalArtifact construction | 30 minutes |
| AI agent self-authorization prevention | `examples/agent-integration-starter/` | Wrong pattern (AI self-auth → REJECT) vs correct pattern (system actor + approval → ALLOW) | 30 minutes |
| Fraud triage with persistent audit log | `examples/fraud-workflow-starter/` | FileBackedAppendOnlyLogService; risk-scored triage; JSONL audit log on disk | 1 hour |

---

## Key integration concepts

### The actor boundary

CerbaSeal enforces a strict boundary: **an AI actor cannot authorize its own proposals**. This is unconditional and cannot be overridden by any policy.

The correct pattern for AI agents:
```
actorId: "governance-system"       ← system actor submits the request
actorAuthorityClass: "system"
proposal.proposalSourceKind: "ai"  ← AI is the source of the proposal
proposal.authorityBearing: false   ← AI does not claim authority
approvalRequired: true             ← human approval required before ALLOW
```

### HOLD vs REJECT

| State | Meaning | What to do |
|---|---|---|
| `ALLOW` | Gate passed, action is authorized | Proceed with the action |
| `HOLD` | Gate passed but human approval required | Queue for review; resubmit with `ApprovalArtifact` |
| `REJECT` | Gate blocked the action unconditionally | Do not proceed; log the reason codes |

`HOLD` is resumable. `REJECT` is terminal for that request — create a new request if the actor believes the block is incorrect.

### Approval artifact construction

Every HOLD that becomes an ALLOW requires a valid `ApprovalArtifact`:

```typescript
const approval: ApprovalArtifact = {
  approvalId: "approval_unique_id",
  approverId: "reviewer-alice-001",
  forRequestId: "the-original-request-id",    // must match exactly
  approverAuthorityClass: "reviewer",          // analyst | reviewer | manager | compliance_officer
  privilegedAuthSatisfied: true,
  immutableSignature: "sig_reviewer_alice_...",
  approvedAt: "2026-06-08T14:00:00.000Z"      // must not predate createdAt
};
```

Then resubmit the original request with `approvalArtifact` set.

### Audit log integration

Every gate evaluation writes to the audit log. Use `FileBackedAppendOnlyLogService` for persistence:

```typescript
const logService = new FileBackedAppendOnlyLogService("./cerbaseal-audit.jsonl");
```

The JSONL file can be read by the **audit-export** kit for compliance reporting, or shipped directly to your SIEM.

---

## Combining kits

These kits compose. A production deployment might use:

- **express-middleware** to gate incoming API routes
- **async-queue** for AI-agent-proposed actions that need reviewer approval
- **webhook-adapter** to notify downstream systems of every gate decision
- **audit-export** on a schedule to produce compliance evidence packages

Start with the kit that matches your most urgent integration need, then layer in the others.
