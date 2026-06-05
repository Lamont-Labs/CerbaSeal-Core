# CerbaSeal — Agent Integration Starter Kit

## What This Is

A working example of the AI agent integration pattern: the agent proposes, a human reviews, CerbaSeal enforces the boundary.

**Use this when:**
- You have an AI agent (LLM-based or otherwise) that proposes real-world actions
- You need to ensure the agent cannot act without human review
- You want a verifiable record that every agent action was human-approved

## The Critical Insight

**An AI actor cannot authorize its own proposals.** This is a hard rule, not a configuration option.

```typescript
// WRONG — this will always REJECT
const request = {
  actorAuthorityClass: "ai",          // AI is acting
  proposal: {
    proposalSourceKind: "ai",          // AI proposed
    ...
  },
  approvalRequired: false              // Doesn't matter — fraud_triage always requires approval
};

// CORRECT — system carries AI proposal, human approves
const request = {
  actorAuthorityClass: "system",       // System submits on behalf of agent
  proposal: {
    proposalSourceKind: "ai",          // AI's recommendation is recorded
    ...
  },
  approvalRequired: true,
  approvalArtifact: humanApproval      // Human reviewed and approved
};
```

## Integration Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Your Agent System                      │
│                                                          │
│  AI Model → Proposes Action → Queue/Pending State        │
│                                    │                     │
│                           Notify Human Reviewer          │
│                                    │                     │
│                           Reviewer approves in UI        │
│                                    │                     │
│                    Construct ApprovalArtifact            │
│                                    │                     │
│                    Submit to CerbaSeal gate              │
│                                    │                     │
│                         ALLOW → Execute                  │
└──────────────────────────────────────────────────────────┘
```

## Run It

```bash
pnpm tsx examples/agent-integration-starter/index.ts
```

## What to Implement

### 1. Proposal capture
When your AI agent produces a recommendation, store it as a pending governed request. Do not execute it yet.

### 2. Reviewer notification
When a request is in `HOLD` state, notify the appropriate reviewer. Include enough context for them to make an informed decision.

### 3. Approval bridge
When the reviewer approves in your UI:

```typescript
const approval: ApprovalArtifact = {
  approvalId: generateUniqueId(),
  approverId: reviewer.userId,
  forRequestId: originalRequestId,        // Must match the original request exactly
  approverAuthorityClass: "reviewer",     // Or whatever authority class the reviewer has
  privilegedAuthSatisfied: true,          // True if reviewer authenticated with MFA or similar
  immutableSignature: signatureFromYourSystem,  // Any non-empty string
  approvedAt: new Date().toISOString()    // Must be after request.createdAt
};

// Resubmit with approval
const approvedRequest = { ...originalRequest, approvalArtifact: approval };
const result = gate.evaluate(approvedRequest);
```

### 4. Execution gate
Only execute the action if `result.decisionEnvelope.finalState === "ALLOW"` and `result.releaseAuthorization !== null`.

## What the Evidence Proves

After an approved agent action, the evidence bundle proves:

- The AI model version and rule set that generated the recommendation
- The confidence score and reasoning codes from the model
- The reviewer identity and their authority class
- The timestamp of the approval (must postdate the request)
- The full hash-linked event chain from request to release

This directly answers Olivia's question: "Can you prove what happened?"
