# CerbaSeal Governance Template — Account Hold Recommendation

**Template version:** 0.1.0  
**Use case:** AI-assisted recommendation to place an account on hold for review, due to fraud signals, compliance concerns, or operational risk.  
**Suitable for:** Banking, credit, insurance, fintech, any regulated platform with account management.

> **Disclaimer:** This template supports structured governance evidence and enforcement. It does not constitute legal compliance with any regulation. Compliance determination requires qualified legal and regulatory review. The client remains responsible for their compliance obligations.

---

## Use Case Description

An AI system identifies accounts with elevated risk profiles — based on behavioral patterns, fraud signals, compliance flags, or regulatory watchlist matches — and recommends placing the account on hold. Account holds have direct customer impact. They must be authorized by a human with appropriate authority before execution. CerbaSeal enforces this authorization requirement structurally.

**Why governance matters here:** An unauthorized account hold can cause significant customer harm and regulatory liability. An unauthorized failure to hold a genuinely risky account can cause financial and compliance damage. The evidence trail proves that every hold decision was made by a qualified human, with a verifiable record of authorization.

---

## What AI Is Allowed to Do

- Analyze account activity, transaction patterns, and risk signals
- Match accounts against internal and external risk criteria
- Generate a risk classification and recommendation
- Submit a governed hold recommendation to CerbaSeal for evaluation
- Provide rationale and confidence data to support human review

**AI is allowed to recommend. AI is not allowed to authorize.**

---

## What AI Is Not Allowed to Do

- Authorize its own hold recommendations
- Execute account restrictions, freezes, or closures without human authorization through the gate
- Approve the recommendations of other AI systems
- Bypass the governance gate under any condition

---

## Required Human Approval Points

| Action | Approval Required? | Suggested Approver Authority Class |
|---|---|---|
| Recommend account monitoring (no restriction) | No (may vary by policy) | — |
| Place account on soft hold (limited functionality) | Yes | `senior_analyst` |
| Place account on full hold (frozen) | Yes | `compliance_officer` |
| Initiate account closure review | Yes | `compliance_officer` |
| Escalate to external authority (e.g., FIU) | Yes | `compliance_officer` |
| Clear account from hold | Yes | `operations_manager` or `compliance_officer` |

---

## Suggested Authority Classes

| Role in Client Organization | CerbaSeal Authority Class |
|---|---|
| KYC / AML analyst | `senior_analyst` |
| Compliance officer | `compliance_officer` |
| Risk officer | `compliance_officer` |
| Operations manager | `operations_manager` |
| Automated risk scoring system (non-AI) | `system` |
| AI risk model | `ai` (cannot authorize) |

---

## Example ALLOW Conditions

All invariants must pass. Key conditions for account hold authorization:

1. Approver is a human with a recognized authority class (not `"ai"`)
2. Approval artifact is present and complete
3. `approvedAt` is a valid ISO datetime that postdates `createdAt`
4. Approval is not expired (`expiresAt` is in the future if set)
5. `policyPackRef` references the applicable AML/KYC or account management policy version
6. `requestId` is unique and non-empty (recommend using: `[account-id]-[evaluation-timestamp]`)
7. `loggingReady: true`
8. `trustState.trusted: true`
9. Proposal describes the recommended hold action with account identifier
10. `prohibitedUse: false` (no prohibited action type flagged)
11. `sensitive: true` (recommended for account holds — flags the record as containing sensitive data)

**Example ALLOW scenario:**  
AI flags account ACC-00821 for AML pattern match (structuring indicators). Compliance officer Mireille reviews the AI's analysis and approves a full account hold for further investigation. The system submits the governed request with Mireille's compliance officer approval. All invariants pass. Outcome: ALLOW. The account hold is authorized. A `ReleaseAuthorization` is issued and linked to Mireille's approval record.

---

## Example HOLD Conditions

A request produces HOLD when:

- The account hold recommendation is structurally valid
- `approvalRequired: true`
- No approval artifact is provided yet

**Example HOLD scenario:**  
An AI system identifies account ACC-00934 as a potential match against a sanctions watchlist. The system submits a hold recommendation immediately. The request is valid but no compliance officer has reviewed it yet. Outcome: HOLD. The account is not frozen yet — the recommendation is queued for compliance review. Once a compliance officer reviews and approves, the request is re-submitted and produces ALLOW.

**Operational design note:** For regulatory time-sensitive holds (e.g., where a watchlist match may require action within a regulatory deadline), ensure the HOLD queue is monitored and has an SLA. CerbaSeal does not enforce the SLA — the downstream system must.

---

## Example REJECT Conditions

| Condition | Reason Code |
|---|---|
| AI system submits hold with self-issued approval | `AI_SELF_AUTHORIZATION_BLOCKED` |
| Approval timestamp predates request creation | `APPROVAL_PREDATES_REQUEST` |
| Approval artifact expired | `APPROVAL_EXPIRED` |
| `policyPackRef` missing or empty | `MALFORMED_REQUEST` |
| `requestId` is empty or reused from a prior evaluation | `MALFORMED_REQUEST` |
| `actorAuthorityClass` value not recognized | `MALFORMED_REQUEST` |
| Action type explicitly flagged as prohibited | `PROHIBITED_USE_FLAGGED` |
| Unexpected runtime error | `GATE_INTERNAL_REJECT` (fail-closed) |

**Example REJECT scenario:**  
A legacy automated system submits an account freeze request using `actorAuthorityClass: "ai"` with an internal approval flag. CerbaSeal's non-self-authorization invariant fires immediately. Outcome: REJECT. `AI_SELF_AUTHORIZATION_BLOCKED`. The account freeze does not execute. Evidence is recorded. The legacy system must be redesigned to route through human authorization before account freeze requests are submitted.

---

## Evidence Generated

For every evaluation:

| Evidence Item | Description |
|---|---|
| `EvidenceBundle` | Full record: request (including account identifier, AI recommendation, risk rationale), outcome, invariant trace |
| `DecisionEnvelope` | Final state, reason code, policy reference, timestamp |
| `AuditLogEntry` | SHA-256 hash-linked audit log entry |
| `ReleaseAuthorization` | ALLOW only — compliance officer identity, approval timestamp, authorization chain |
| `BlockedActionRecord` | HOLD / REJECT — reason code, failed invariant |

The evidence bundle provides a complete audit trail for the account hold decision: what the AI found, what human reviewed and authorized it, when, and under which policy. This evidence is relevant to AML, KYC, and regulatory audit scenarios.

---

## Common Client Questions

**Q: If an account must be held immediately for a regulatory reason, can we bypass the gate?**  
A: No. CerbaSeal's gate cannot be bypassed. However, the gate can evaluate a request with a human authorization in real-time. In urgent cases, ensure the compliance officer is immediately available to authorize holds — the gate evaluation itself takes milliseconds.

**Q: Can the same person who flagged the account approve the hold?**  
A: CerbaSeal does not enforce recusal. Your organizational policy determines whether the same person can flag and approve. CerbaSeal records who approved — recusal audit is the client's governance responsibility.

**Q: How do we link the CerbaSeal evidence record to our case management system?**  
A: Use the `requestId` as the link. Set `requestId` to a value that corresponds to the case, account, or ticket ID in your case management system. The evidence bundle will reference this ID, enabling you to match CerbaSeal records to your internal case records.

**Q: Does CerbaSeal store personal data?**  
A: CerbaSeal processes the `GovernedRequest` object you submit. If that object contains personal data (such as an account holder's identifier), that data is included in the audit log. Design your request objects to include only the identifiers necessary for governance — not full personal data sets.

**Q: What happens if the same account needs to be re-evaluated?**  
A: Each evaluation requires a new `requestId`. If a hold is cleared and the account is later flagged again, submit a new request with a new unique ID. The previous evaluation remains in the audit log unchanged.

---

## Pilot Success Metric

The account hold pilot succeeds if:

- [ ] AI system cannot self-authorize any hold in any test scenario
- [ ] HOLD path confirmed: hold recommendation queued until compliance officer approval provided
- [ ] ALLOW path confirmed: compliance officer approval produces authorized hold with evidence record
- [ ] REJECT path confirmed: structural violations produce correct reason codes
- [ ] Evidence bundle produced for every evaluation
- [ ] Audit chain verifies after all scenarios
- [ ] Compliance team can retrieve and interpret evidence records without external assistance

---

## Known Limitations

- CerbaSeal does not evaluate whether the AI's risk assessment is accurate.
- Approver identity is caller-declared — CerbaSeal does not verify that the named compliance officer actually reviewed the account.
- Data minimization in the request object is the client's responsibility.
- CerbaSeal does not manage HOLD resolution timers, regulatory deadline tracking, or escalation workflows.
- `sensitive: true` is a flag for downstream handling — CerbaSeal does not change its behavior based on this field.

---

*This template is illustrative and does not certify AML, KYC, or any other regulatory compliance.*
