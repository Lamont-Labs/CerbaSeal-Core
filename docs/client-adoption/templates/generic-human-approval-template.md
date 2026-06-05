# CerbaSeal Governance Template — Generic Human Approval

**Template version:** 0.1.0  
**Use case:** Any AI-assisted workflow where an AI proposes a consequential action and a human must authorize it before execution.  
**Suitable for:** Any industry, any workflow type. Use this template when a more specific template does not apply.

> **Disclaimer:** This template supports structured governance evidence and enforcement. It does not constitute legal compliance with any regulation. Compliance determination requires qualified legal and regulatory review. The client remains responsible for their compliance obligations.

---

## Use Case Description

This is the baseline template for any workflow where:

1. An AI system proposes an action
2. That action is consequential (it changes something in the real world)
3. A human must authorize the action before it executes
4. A verifiable record of the authorization must be retained

Use this template as a starting point and adapt it to your specific workflow.

---

## Before Using This Template

Answer these questions. If you cannot answer them, complete the workflow mapping workbook first.

| Question | Your Answer |
|---|---|
| What is the workflow name? | |
| What action does the AI propose? | |
| Who has authority to authorize this action? | |
| What happens if this action executes without authorization? | |
| How long must the authorization record be retained? | |

---

## What AI Is Allowed to Do

- Analyze input data and generate a recommendation or proposal
- Submit the proposal to CerbaSeal as a `GovernedRequest`
- Provide rationale, confidence, and supporting data for human review

**AI is allowed to propose. AI is not allowed to authorize.**

---

## What AI Is Not Allowed to Do

- Authorize its own proposals (blocked structurally — cannot be bypassed)
- Execute consequential actions without passing through the enforcement gate
- Approve requests submitted by other AI systems

---

## Required Human Approval Points

Adapt this table to your workflow:

| Action Class | Approval Required? | Suggested Authority Class |
|---|---|---|
| [Your primary action] | Yes | [Choose: `senior_analyst` / `compliance_officer` / `operations_manager` / `human`] |
| [Secondary action, if any] | [Yes / No] | [Authority class] |

---

## Suggested Authority Classes

| Your Role Name | CerbaSeal Authority Class |
|---|---|
| [Your approver role] | [Matching class] |
| AI / automated system | `ai` (cannot authorize — hard rule) |

**Available authority classes:**
- `ai` — AI or automated system (cannot self-authorize)
- `senior_analyst` — Senior analyst or reviewer
- `compliance_officer` — Compliance professional
- `operations_manager` — Operations or operational manager
- `system` — Trusted non-AI automated system
- `human` — Generic human actor

---

## Example ALLOW Conditions

A request produces ALLOW when all of the following are true simultaneously:

1. **Non-self-authorization:** The actor is not `"ai"` (hard invariant — cannot be bypassed)
2. **Approval present:** A complete `approvalArtifact` is provided
3. **Approval valid:** `approvedAt` is a valid ISO datetime
4. **Approval not premature:** `approvedAt` is after `createdAt`
5. **Approval not expired:** `expiresAt` is in the future (if set)
6. **Policy reference present:** `policyPackRef` is non-empty
7. **Request identified:** `requestId` is non-empty and unique
8. **Logging ready:** `loggingReady: true`
9. **Trusted:** `trustState.trusted: true`
10. **Proposal present:** `proposal.action` is non-empty
11. **No prohibited use:** `prohibitedUse: false`
12. **Known authority class:** `actorAuthorityClass` is a recognized valid value

**Example ALLOW scenario (adapt to your workflow):**  
AI proposes [your action]. [Your approver role] reviews and approves. System submits request with approval artifact. All invariants pass. Outcome: ALLOW. Action is authorized. A `ReleaseAuthorization` is issued with the approver's identity and timestamp.

---

## Example HOLD Conditions

A request produces HOLD when:

- All required fields are present and valid
- `approvalRequired: true`
- No `approvalArtifact` is provided

**What HOLD means:** The action is paused, not rejected. The request is valid but waiting for human authorization. Once authorization is provided, re-submit the request with the approval artifact. The same request (re-submitted with approval) will produce ALLOW if all conditions are met.

**Example HOLD scenario (adapt to your workflow):**  
AI proposes [your action]. No human has reviewed yet. The system submits the request to begin the hold-and-review process. Outcome: HOLD. The proposal enters the review queue. Processing does not proceed until a human authorizes.

---

## Example REJECT Conditions

| Condition | Reason Code | What to Do |
|---|---|---|
| AI actor attempts self-authorization | `AI_SELF_AUTHORIZATION_BLOCKED` | This is by design. AI cannot authorize its own proposals. Redesign the workflow so a human provides the approval. |
| `approvedAt` predates `createdAt` | `APPROVAL_PREDATES_REQUEST` | Correct the approval timestamp. The approval must come after the request. |
| `approvalArtifact.expiresAt` is in the past | `APPROVAL_EXPIRED` | Obtain a fresh approval and re-submit. |
| `policyPackRef` is missing | `MALFORMED_REQUEST` | Add a policy pack reference to the request. |
| `requestId` is empty | `MALFORMED_REQUEST` | Generate a unique request ID for every evaluation. |
| `actorAuthorityClass` is unrecognized | `MALFORMED_REQUEST` | Use a valid authority class from the list above. |
| `prohibitedUse: true` | `PROHIBITED_USE_FLAGGED` | The action is explicitly prohibited. Do not attempt to override. |
| Runtime error during evaluation | `GATE_INTERNAL_REJECT` | The gate is fail-closed. Contact Lamont Labs with the full error output. |

---

## Minimum Request Structure

This is the minimum valid `GovernedRequest` structure for a generic human approval workflow:

```typescript
{
  requestId: "req-[unique-id]",           // Required: unique per evaluation
  workflowClass: "[your-workflow-class]",  // Required: e.g., "content_moderation"
  proposedActionClass: "[your-action]",    // Required: e.g., "remove_content"
  proposal: {
    action: "[description of proposed action]",
    rationale: "[why the AI is proposing this]",
    confidence: 0.87                       // Optional: AI confidence score
  },
  policyPackRef: "[your-policy-ref]",     // Required: e.g., "content-policy-v1.0"
  provenanceRef: {
    modelVersion: "[your-model-id]",       // Required
    ruleSetVersion: "[rule-set-id]",       // Required
    sourceHash: "[optional-hash]"          // Optional
  },
  loggingReady: true,                      // Required: must be true
  trustState: { trusted: true },           // Required: must be trusted
  actor: {
    actorId: "[ai-system-id]",
    authorityClass: "ai"                   // AI submits the proposal
  },
  approvalRequired: true,                  // Set based on your policy
  prohibitedUse: false,                    // Set to true if action is prohibited
  sensitive: false,                        // Set to true for sensitive data
  approvalArtifact: {                      // Required when approvalRequired = true
    approverId: "[approver-id]",
    approvalId: "[approval-id]",
    immutableSignature: "[sig]",
    approvedAt: "2026-06-05T10:00:00.000Z"
  }
}
```

---

## Evidence Generated

For every evaluation (ALLOW, HOLD, REJECT):

| Evidence Item | Contents |
|---|---|
| `EvidenceBundle` | Full evaluation record |
| `DecisionEnvelope` | Final state, reason code, policy reference |
| `AuditLogEntry` | Hash-linked append-only audit entry |
| `ReleaseAuthorization` | ALLOW only — approver, timestamp, authorization link |
| `BlockedActionRecord` | HOLD / REJECT — reason code, failed invariant |

---

## Common Client Questions

**Q: Can we use this template for non-financial workflows?**  
A: Yes. CerbaSeal is domain-agnostic. The enforcement model applies to any workflow where AI proposes a consequential action that requires human authorization.

**Q: What if we need to add a custom field to the request?**  
A: CerbaSeal processes the standard `GovernedRequest` schema. Custom fields outside this schema are not evaluated by the gate. If you need to track additional data, store it alongside the `requestId` in your system.

**Q: How do we handle workflows where approval is not always required?**  
A: Set `approvalRequired: false` for those cases. The gate will allow the action to proceed without an approval artifact. Note: for `fraud_triage` workflow class, approval is hardcoded as required and cannot be disabled.

**Q: Can we run multiple workflows with this template simultaneously?**  
A: Each workflow should have its own `workflowClass` identifier. During the pilot, only one workflow class should be in active use. Multiple simultaneous workflow classes are a post-pilot expansion.

**Q: What is `immutableSignature` in the approval artifact?**  
A: It is a required non-empty string representing an immutable record of the approval act. In the current version, any non-empty string passes — cryptographic verification of this field is on the roadmap. In practice, use a hash, token, or signature value from your approval system.

---

## Pilot Success Metric (Generic)

Adapt these criteria to your specific workflow:

- [ ] AI actor cannot produce ALLOW in any test scenario
- [ ] HOLD path confirmed: action paused until human authorization provided
- [ ] ALLOW path confirmed: valid human authorization produces authorized action with evidence record
- [ ] REJECT path confirmed: structural violations produce correct reason codes
- [ ] Evidence bundle produced for every evaluation
- [ ] Audit chain verifies after all test scenarios
- [ ] Operational team can read reason codes without external assistance

---

## Known Limitations

- CerbaSeal does not evaluate the quality or correctness of the AI's proposal — only that the authorization process was followed
- Approver identity is caller-declared — CerbaSeal does not independently verify the approver's identity
- The audit chain proves structural consistency, not origin authenticity
- Multiple `AppendOnlyLogService` instances in the same deployment have no coordination
- `proposal.confidence` is not gated — any value passes

---

## How to Adapt This Template

1. Replace all `[placeholder]` values with your specific workflow details
2. Define the authority classes for your specific approver roles
3. Set `approvalRequired` based on your policy
4. Define your `policyPackRef` format and values
5. Set `sensitive: true` if your workflow processes sensitive personal data
6. Define the downstream handlers for ALLOW, HOLD, and REJECT in your system

---

*This template is illustrative and does not certify compliance with any regulation.*
