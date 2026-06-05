# CerbaSeal Governance Template — Fraud Triage

**Template version:** 0.1.0  
**Use case:** AI-assisted fraud triage where an AI classifier flags transactions or accounts for human review.  
**Suitable for:** Financial services, fintech, payment processors, lending platforms.

> **Disclaimer:** This template supports structured governance evidence and enforcement. It does not constitute legal compliance with any regulation. Compliance determination requires qualified legal and regulatory review. The client remains responsible for their compliance obligations.

---

## Use Case Description

An AI system reviews transactions, accounts, or events for fraud indicators and proposes an action — typically escalation for human review, temporary hold, or no action. The AI cannot execute the action directly. A human analyst must authorize escalation. CerbaSeal enforces that gate structurally.

**Why governance matters here:** Fraud decisions directly affect customers. An unauthorized AI escalation can freeze accounts incorrectly. An unauthorized AI non-escalation can miss real fraud. Both have financial, reputational, and regulatory consequences. The enforcement gate ensures the AI's role is always proposal-only.

---

## What AI Is Allowed to Do

- Analyze transactions, events, or account activity for fraud indicators
- Generate a fraud risk assessment and confidence score
- Propose one of the defined action classes (see below)
- Submit the proposal to CerbaSeal for governance evaluation

**AI is allowed to propose. AI is not allowed to authorize.**

---

## What AI Is Not Allowed to Do

- Authorize its own escalation proposals (blocked by non-self-authorization invariant — hard rule, cannot be bypassed)
- Execute account freezes, transaction holds, or escalation actions without passing through the gate
- Override or suppress the governance gate
- Provide the approval for its own requests

---

## Required Human Approval Points

| Action | Approval Required? | Approver Authority Class |
|---|---|---|
| Escalate case for senior review | Yes — hardcoded | `senior_analyst` |
| Place account on temporary hold | Yes | `compliance_officer` or `operations_manager` |
| Clear transaction as no-fraud | Recommended | `senior_analyst` |
| Refer to external authority | Yes | `compliance_officer` |

**Note:** For `fraud_triage` workflow class, approval is hardcoded as required. This cannot be disabled by a flag or configuration — it is enforced at the code level.

---

## Suggested Authority Classes

| Role in Client Organization | CerbaSeal Authority Class |
|---|---|
| Fraud analyst | `senior_analyst` |
| Senior fraud investigator | `senior_analyst` |
| Compliance officer | `compliance_officer` |
| Operations manager | `operations_manager` |
| Automated fraud system (non-AI) | `system` |
| AI classifier | `ai` (cannot authorize) |

---

## Example ALLOW Conditions

A request produces ALLOW when all of the following are true:

1. The actor submitting the request is not the AI system (`actorAuthorityClass ≠ "ai"`)
2. A valid approval artifact is present with a recognized approver authority class
3. The approval timestamp is a valid ISO datetime and postdates the request creation
4. The approval is not expired
5. A `policyPackRef` is present (e.g., `"fraud-policy-v1.2"`)
6. `requestId` is non-empty and unique
7. `loggingReady: true`
8. `trustState.trusted: true`
9. `proposal` is present and non-empty
10. `prohibitedUse: false`
11. `actorAuthorityClass` is a recognized valid class

**Example ALLOW scenario:**  
AI flags transaction TX-9921 as high-risk. Fraud analyst Alice (authority class: `senior_analyst`) reviews and approves escalation. The system submits the request with Alice's approval artifact. All invariants pass. Outcome: ALLOW. A `ReleaseAuthorization` is issued. TX-9921 is escalated to the fraud investigation queue.

---

## Example HOLD Conditions

A request produces HOLD when:

- The request is structurally valid (all required fields present)
- `approvalRequired: true` (or hardcoded true for `fraud_triage`)
- No `approvalArtifact` is present, OR the artifact is present but structurally incomplete

**Example HOLD scenario:**  
AI flags transaction TX-8844 as medium-risk and submits an escalation request. No analyst has reviewed it yet. The request is valid but lacks an approval artifact. Outcome: HOLD. The case enters the analyst review queue. Once an analyst approves, the request is re-submitted with the approval artifact and will produce ALLOW.

---

## Example REJECT Conditions

A request produces REJECT when:

| Condition | Reason Code |
|---|---|
| AI actor submits with approval = self | `AI_SELF_AUTHORIZATION_BLOCKED` |
| `approvalArtifact.approvedAt` predates `createdAt` | `APPROVAL_PREDATES_REQUEST` |
| `approvalArtifact.expiresAt` is in the past | `APPROVAL_EXPIRED` |
| `policyPackRef` is missing | `MALFORMED_REQUEST` |
| `requestId` is empty | `MALFORMED_REQUEST` |
| `actorAuthorityClass` is not recognized | `MALFORMED_REQUEST` |
| `prohibitedUse: true` | `PROHIBITED_USE_FLAGGED` |
| Unknown error during evaluation | `GATE_INTERNAL_REJECT` (fail-closed) |

**Example REJECT scenario:**  
An automated system submits a fraud escalation request with `actorAuthorityClass: "ai"` and attempts to include an approval from itself. The non-self-authorization invariant fires. Outcome: REJECT. Reason code: `AI_SELF_AUTHORIZATION_BLOCKED`. No escalation executes. Evidence is recorded.

---

## Evidence Generated

For every evaluation (ALLOW, HOLD, REJECT):

| Evidence Item | Description |
|---|---|
| `EvidenceBundle` | Complete record of the evaluation: request, outcome, timestamp, invariant trace |
| `DecisionEnvelope` | The governance decision with final state, reason code, and policy reference |
| `AuditLogEntry` | SHA-256 hash-linked entry in the append-only audit log |
| `ReleaseAuthorization` | Present on ALLOW only — contains requestId, approver reference, and authorization timestamp |
| `BlockedActionRecord` | Present on HOLD and REJECT — contains reason code and failed invariant identifier |

All evidence is retained in the hash-chained audit log. The chain can be verified at any time with `pnpm verify:proof`.

---

## Common Client Questions

**Q: Can a senior analyst approve their own cases?**  
A: CerbaSeal does not enforce recusal. The system checks that a recognized human authority class provides approval — it does not verify whether the approver is the same person who flagged the case. Recusal policy is an organizational governance matter, not a CerbaSeal enforcement boundary.

**Q: What if an analyst makes a mistake in their approval?**  
A: A HOLD or REJECT cannot be retroactively changed to ALLOW for the same request. A new request (new `requestId`) must be submitted if re-evaluation is needed. The original decision and evidence remain in the audit log.

**Q: How long do approvals remain valid?**  
A: Set the `expiresAt` field on the approval artifact. If not set, CerbaSeal does not enforce expiry — but you should set it as an operational practice to prevent stale approvals from being used.

**Q: Can the AI's confidence score affect the outcome?**  
A: Not directly. `proposal.confidence` is recorded but not gated — any confidence value passes. The enforcement decision is based on the authority and approval model, not the AI's confidence.

---

## Pilot Success Metric

The fraud triage pilot succeeds if:

- [ ] AI actor cannot produce ALLOW in any test scenario
- [ ] HOLD path is confirmed: case stays held until analyst approval is provided
- [ ] ALLOW path is confirmed: valid analyst approval produces authorized escalation
- [ ] REJECT path is confirmed: structural violation produces REJECT with correct reason code
- [ ] Evidence bundle is produced for every evaluation
- [ ] Audit chain passes verification after all test scenarios
- [ ] Client's fraud analyst team can read reason codes and diagnostic output without assistance

---

## Known Limitations

- CerbaSeal does not verify approver identity independently. Approver identity is caller-declared.
- CerbaSeal does not evaluate the AI's fraud assessment quality — only that the governance process was followed.
- Multiple instances of `AppendOnlyLogService` have no coordination — ensure a single audit log instance per deployment.
- `proposal.confidence` is not gated — invalid confidence values (null, negative, >1.0) pass through.
- The audit chain proves structural consistency, not origin authenticity. A fabricated chain with recomputed hashes would pass `verifyChain()`.

---

*This template is an illustration based on the CerbaSeal demo workflow. It is not legal advice and does not certify compliance with any regulation.*
