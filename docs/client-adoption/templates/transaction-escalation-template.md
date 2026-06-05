# CerbaSeal Governance Template — Transaction Escalation

**Template version:** 0.1.0  
**Use case:** AI-assisted escalation of high-value, high-risk, or anomalous transactions for human review before processing.  
**Suitable for:** Payment processors, banking, trade finance, treasury operations, regulated lending.

> **Disclaimer:** This template supports structured governance evidence and enforcement. It does not constitute legal compliance with any regulation. Compliance determination requires qualified legal and regulatory review. The client remains responsible for their compliance obligations.

---

## Use Case Description

An AI system reviews transactions in real-time or batch and identifies candidates for escalation — transactions that exceed risk thresholds, match anomaly patterns, or require human sign-off per internal policy or regulatory requirement. CerbaSeal enforces that no escalation or block action executes without a human authority authorizing it.

**Why governance matters here:** Transaction escalation decisions are time-sensitive and consequential. Incorrect escalations cause customer friction and reputational damage. Missed escalations enable fraud or compliance violations. The evidence trail proves that every consequential decision was made by a human, with a recorded authorization.

---

## What AI Is Allowed to Do

- Analyze transactions against risk models, rules, and anomaly detection systems
- Generate a risk score and classification
- Propose one of the defined action classes
- Submit the governed request to CerbaSeal for evaluation
- Surface diagnostic information to human reviewers

**AI is allowed to propose. AI is not allowed to authorize.**

---

## What AI Is Not Allowed to Do

- Authorize its own escalation or block proposals
- Execute transaction holds, escalations, or reversals without passing through the gate
- Override the enforcement gate
- Approve requests submitted by other AI systems

---

## Required Human Approval Points

| Action | Approval Required? | Suggested Approver Authority Class |
|---|---|---|
| Escalate transaction for manual review | Yes | `senior_analyst` |
| Place transaction on temporary hold | Yes | `senior_analyst` or `operations_manager` |
| Approve high-value transaction above threshold | Yes | `operations_manager` or `compliance_officer` |
| Reject transaction (block execution) | Yes | `compliance_officer` |
| Clear transaction for processing (low-risk override) | Recommended | `senior_analyst` |

**Note:** These are recommended defaults. Actual approval requirements must be defined in the client's workflow mapping and agreed in the pilot configuration.

---

## Suggested Authority Classes

| Role in Client Organization | CerbaSeal Authority Class |
|---|---|
| Transaction analyst | `senior_analyst` |
| Operations manager | `operations_manager` |
| Compliance officer | `compliance_officer` |
| Risk manager | `operations_manager` |
| Automated rules engine (non-AI) | `system` |
| AI risk model | `ai` (cannot authorize) |

---

## Example ALLOW Conditions

A request produces ALLOW when all invariants pass. For transaction escalation, the key conditions are:

1. Approver is a human with a recognized authority class (not `"ai"`)
2. A complete approval artifact is present: `approverId`, `approvalId`, `immutableSignature`, `approvedAt`
3. `approvedAt` is after the request `createdAt`
4. Approval is not expired
5. `policyPackRef` identifies the applicable policy version (e.g., `"tx-escalation-policy-v2.1"`)
6. `requestId` uniquely identifies this transaction evaluation
7. `loggingReady: true`
8. `trustState.trusted: true`
9. The transaction proposal is present and non-empty
10. `prohibitedUse: false`

**Example ALLOW scenario:**  
AI scores transaction TXN-4492 (€85,000 international wire) as high-risk. Operations manager Björn reviews and approves escalation to compliance review. System submits request with Björn's approval artifact. All invariants pass. Outcome: ALLOW. Transaction moves to compliance hold queue with a `ReleaseAuthorization` record.

---

## Example HOLD Conditions

A request produces HOLD when:

- The request is structurally valid
- `approvalRequired: true`
- No approval artifact is present yet

**Example HOLD scenario:**  
AI flags TXN-7731 for anomalous velocity pattern. The system submits a hold request immediately (no analyst has reviewed yet). The request is valid — the transaction data, policy reference, and logging state are all correct — but no approval artifact is present. Outcome: HOLD. The transaction enters a review queue. Processing does not proceed until an authorized human approves.

**Operational note:** For time-sensitive payments, design the downstream system to handle HOLD gracefully (notify analyst, pause processing, set SLA timer). HOLD is not a rejection — it is a pause.

---

## Example REJECT Conditions

| Condition | Reason Code | What It Means |
|---|---|---|
| AI submits request and attempts to self-approve | `AI_SELF_AUTHORIZATION_BLOCKED` | AI system cannot authorize its own transaction hold. Structural violation. |
| Approval postdates the approval by using a future timestamp | `MALFORMED_REQUEST` | Approval timestamp must be a valid past or present ISO datetime. |
| Approval was issued before the request was created | `APPROVAL_PREDATES_REQUEST` | The approval cannot predate the thing it is approving. |
| `policyPackRef` is missing | `MALFORMED_REQUEST` | Every transaction escalation must reference an applicable policy version. |
| `requestId` is empty or reused | `MALFORMED_REQUEST` | Every evaluation requires a unique, non-empty request identifier. |
| Transaction type is flagged as prohibited use | `PROHIBITED_USE_FLAGGED` | The proposed action is explicitly prohibited. No override. |

**Example REJECT scenario:**  
A legacy automated system submits a transaction hold request with `actorAuthorityClass: "ai"`. The system has no approval from a human authority. The non-self-authorization invariant fires immediately. Outcome: REJECT. `AI_SELF_AUTHORIZATION_BLOCKED`. The transaction hold does not execute. Evidence is recorded. The legacy system must be updated to route through human authorization.

---

## Evidence Generated

For every evaluation:

| Evidence Item | Contents |
|---|---|
| `EvidenceBundle` | Full evaluation record: request, outcome, invariant trace, timestamp |
| `DecisionEnvelope` | Final state (ALLOW / HOLD / REJECT), reason code, policyPackRef |
| `AuditLogEntry` | Hash-linked entry in the append-only audit log |
| `ReleaseAuthorization` | ALLOW only — approver identity, timestamp, requestId link |
| `BlockedActionRecord` | HOLD / REJECT — reason code, invariant identifier |

The evidence bundle for a transaction escalation contains everything needed to reconstruct the governance decision: who proposed what, who authorized it, when, under which policy, and what outcome was produced.

---

## Common Client Questions

**Q: What if a transaction must be held immediately — before a human can review?**  
A: HOLD is the correct outcome in this case. The transaction is paused pending approval. The system should be designed to route HOLD outcomes to the analyst review queue immediately. CerbaSeal does not manage the notification or SLA — that is the client's downstream responsibility.

**Q: Can we set a time limit on HOLD?**  
A: CerbaSeal does not enforce HOLD timeouts. Set `expiresAt` on the approval artifact to limit how long a specific approval is valid. For HOLD duration limits, implement a timer in the downstream system that escalates or escalates further if the HOLD is not resolved within the SLA.

**Q: Is the `requestId` the same as the transaction ID?**  
A: The `requestId` is the identifier for a specific governance evaluation. For most cases, you can use the transaction ID as the `requestId`. If you need to re-evaluate the same transaction under different conditions, generate a new `requestId` — do not reuse the old one.

**Q: What policy version should we use in `policyPackRef`?**  
A: This is your organization's policy reference. Use a version-controlled identifier that corresponds to the policy document or rule set that governs this workflow at the time of the request. Example: `"tx-escalation-policy-v2.1"`. This field is checked for presence — not for content.

**Q: Can we have different authority classes for different transaction amounts?**  
A: CerbaSeal validates that the approver has a recognized authority class. Tiered approval by amount (e.g., `senior_analyst` for <€50K, `compliance_officer` for >€50K) requires the calling system to select the appropriate authority class before submitting the approval artifact. CerbaSeal enforces the class — the calling system enforces the threshold.

---

## Pilot Success Metric

The transaction escalation pilot succeeds if:

- [ ] AI actor cannot self-authorize any transaction escalation in any test scenario
- [ ] HOLD path confirmed: transaction stays pending until human approval provided
- [ ] ALLOW path confirmed: valid human approval produces authorized escalation with `ReleaseAuthorization`
- [ ] REJECT path confirmed: structural violation produces correct reason code
- [ ] Evidence bundle produced for every test evaluation
- [ ] Audit chain verifies after all test runs
- [ ] Operations team understands HOLD resolution process without external assistance

---

## Known Limitations

- CerbaSeal does not verify transaction data accuracy — it governs the authorization process, not the underlying data quality.
- Approver identity is caller-declared. CerbaSeal cannot verify that the named approver actually reviewed the transaction.
- `proposal.confidence` is recorded but not enforced — high confidence scores do not change the approval requirement.
- CerbaSeal does not manage notification, SLA, or escalation timers for HOLD outcomes — those are client-side responsibilities.
- The audit chain proves consistency, not origin — implement signing via `CERBASEAL_SIGNING_KEY` to add cryptographic protection to the proof snapshot.

---

*This template is illustrative and does not certify compliance with any financial regulation, directive, or regulatory requirement.*
