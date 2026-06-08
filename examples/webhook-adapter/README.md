# CerbaSeal Webhook Adapter

## Pattern

CerbaSeal as a webhook receiver. An HTTP server accepts a workflow event (`POST /event`), evaluates it through the execution gate, and POSTs the decision to a configurable callback URL. Supports the full async approval loop: `HOLD` pauses execution while a human reviews; after approval, the downstream system can retry with an `ApprovalArtifact` attached.

## When to use this kit

- Your existing system emits events to webhook endpoints (Stripe-style, GitHub-style, or internal)
- You want CerbaSeal to sit between an event source and a downstream action executor
- You need async approval loops: HOLD → human reviews → resubmit with approval → ALLOW

## Prerequisites

- Node.js 18+ (for native `fetch`)
- `pnpm tsx` available (already set up in this repo)
- `CERBASEAL_CALLBACK_URL` set to your downstream system's callback endpoint

## Setup

1. **Set your callback URL**
   ```sh
   export CERBASEAL_CALLBACK_URL=https://your-system.example.com/cerbaseal/callback
   ```

2. **Start the adapter**
   ```sh
   pnpm tsx examples/webhook-adapter/index.ts
   ```

3. **Send a workflow event**
   ```sh
   curl -X POST http://localhost:4100/event \
     -H "Content-Type: application/json" \
     -d '{
       "requestId": "evt-001",
       "workflowClass": "transaction_escalation",
       "jurisdiction": "EU",
       "actorId": "governance-system",
       "actorAuthorityClass": "system",
       "proposedActionClass": "escalate",
       "proposal": {
         "proposalSourceKind": "ai",
         "authorityBearing": false,
         "requestedActionClass": "escalate",
         "confidence": 0.87,
         "reasonCodes": ["velocity_spike"],
         "proposalCreatedAt": "2026-06-01T12:00:00.000Z"
       },
       "sensitive": true,
       "prohibitedUse": false,
       "policyPackRef": { "id": "policy_txn_v1", "version": "1.0.0" },
       "provenanceRef": {
         "modelVersion": "risk-v3",
         "ruleSetVersion": "rules-2.1",
         "sourceHash": "sha256:abc123"
       },
       "approvalRequired": false,
       "approvalArtifact": null,
       "loggingReady": true,
       "controlStatus": { "criticalControlsValid": true, "stale": false, "verificationRunId": "vr-001" },
       "trustState": { "trusted": true, "trustStateId": "ts-001" },
       "createdAt": "2026-06-01T12:00:00.000Z"
     }'
   ```

## What a correct run looks like

The adapter responds `202 Accepted` immediately, then POSTs the decision to `CALLBACK_URL`:

```json
{
  "requestId": "evt-001",
  "workflowClass": "transaction_escalation",
  "finalState": "ALLOW",
  "envelopeId": "env_evt-001",
  "evidenceBundleId": "evidence_evt-001",
  "humanApprovalRequired": false,
  "releaseAuthorization": { "releaseAuthorizationId": "release_evt-001", "actionClass": "escalate", ... },
  "blockedActionRecord": null,
  "callbackSentAt": "2026-06-01T12:00:00.123Z"
}
```

For `HOLD` decisions, the callback contains `finalState: "HOLD"` and a null `releaseAuthorization`. Your system should queue the request for human review, then resubmit with an `approvalArtifact` attached to resume the workflow.

## Validate

```sh
pnpm tsx examples/webhook-adapter/validate-webhook-adapter.ts
```

All checks print `[PASS]` and the script exits with code 0.
