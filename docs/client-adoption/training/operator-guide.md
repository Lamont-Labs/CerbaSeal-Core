# CerbaSeal — Operator Guide

**Audience:** Operations staff who work with the results of CerbaSeal decisions day-to-day  
**Assumed knowledge:** Basic understanding of what CerbaSeal is (read `getting-started-guide.md` first)  
**Reading time:** 20 minutes

---

## Your Role

As an operator, you interact with CerbaSeal's outputs — not its internals. Your responsibilities:

- Understand what ALLOW, HOLD, and REJECT mean for your specific workflow
- Know how to route HOLD decisions to the appropriate reviewer
- Know how to read a reason code when something is REJECTed unexpectedly
- Know when to escalate an issue and how

You do not need to manage the CerbaSeal service, configure deployments, or modify the enforcement logic. That is the admin's responsibility.

---

## Understanding Decisions in Your Workflow

Your workflow has been mapped to CerbaSeal's language during the setup process. The key terms you need to know:

| Your Workflow Term | CerbaSeal Term | What It Means |
|---|---|---|
| AI proposal / recommendation | `proposal.action` | What the AI is suggesting should happen |
| Case / ticket / transaction | `requestId` | The unique identifier for this governance evaluation |
| Approver / reviewer | `approvalArtifact.approverId` | The human who authorized the action |
| Action type | `proposedActionClass` | The category of action being governed |
| Policy version | `policyPackRef` | Which policy applies to this decision |

*This table will be filled in with your specific workflow terms during onboarding.*

---

## What to Do When You See ALLOW

ALLOW means:
- The proposed action passed all governance checks
- A human with appropriate authority authorized it
- The authorization is valid and recorded in the audit log

**Your action:** Proceed with the authorized action according to your workflow. The `ReleaseAuthorization` record confirms the authorization — store or reference it as needed per your procedure.

**What not to do:** Do not execute an action that did not go through CerbaSeal. Do not attempt to manually create authorization records outside the system.

---

## What to Do When You See HOLD

HOLD means:
- The proposed action is structurally valid
- Authorization has not been provided yet
- The action is paused, waiting for a human reviewer to approve

**Your action:**
1. Route the HOLD notification to the appropriate reviewer (as defined in your workflow procedure)
2. Include the `requestId` in the notification — the reviewer will need it to reference the case
3. Wait for the reviewer to provide approval
4. Once approval is provided, the system re-submits the request — it should produce ALLOW

**What HOLD is not:** HOLD is not an error. It is the expected behavior when an action requires human review and that review has not happened yet. A HOLD that stays unresolved too long is an operational issue — not a CerbaSeal issue.

**SLA note:** If your workflow has a time requirement for HOLD resolution, that is enforced by your downstream system, not by CerbaSeal. Ensure HOLD resolution is monitored per your internal SLA.

---

## What to Do When You See REJECT

REJECT means:
- The request violated one of CerbaSeal's governance rules
- The action has not executed and will not execute from this request
- Evidence of the rejection is recorded in the audit log

**Your first action:** Read the reason code. Every REJECT includes a reason code that explains what failed.

### Reason Code Reference

| Reason Code | Plain Language Meaning | What Typically Causes It |
|---|---|---|
| `AI_SELF_AUTHORIZATION_BLOCKED` | An AI system tried to approve its own proposal | An automated system submitted a request with AI as both the actor and approver. This is blocked by design. |
| `APPROVAL_REQUIRED_NOT_PRESENT` | Approval was required but not provided | The request was submitted without an approval artifact when one was required. |
| `APPROVAL_EXPIRED` | The approval is past its expiry date | The approval artifact's `expiresAt` timestamp has passed. A new approval is needed. |
| `APPROVAL_PREDATES_REQUEST` | The approval timestamp is before the request was created | The approval was recorded at a time before the request existed. Timestamp error in the submitting system. |
| `MALFORMED_REQUEST` | A required field is missing or invalid | One or more required fields are empty, wrong type, or contain an unrecognized value. |
| `PROHIBITED_USE_FLAGGED` | The action type is explicitly prohibited | This action type has been flagged as prohibited. It cannot be authorized under any circumstances. |
| `UNKNOWN_AUTHORITY_CLASS` | The approver's role is not recognized | The authority class value in the request is not a valid CerbaSeal authority class. |
| `GATE_INTERNAL_REJECT` | An unexpected error occurred — the gate rejected fail-safely | An internal error occurred. The gate is fail-closed. Contact support. |

**If the reason code is `AI_SELF_AUTHORIZATION_BLOCKED`:** This is by design. The submitting AI system attempted to authorize its own proposal. This is the governance working as intended. The issue is in how the submitting system constructs the request — it needs to route to a human authority instead.

**If the reason code is `MALFORMED_REQUEST`:** A required field is incorrect. This typically indicates a configuration or integration issue in the calling system. Contact your technical owner.

**If the reason code is `GATE_INTERNAL_REJECT`:** Contact your Line Axia account contact immediately with the full REJECT record.

---

## Reading the Diagnostic Output

When a request is REJECTed or HOLDed, CerbaSeal produces a diagnostic record that includes:

- `finalState` — ALLOW / HOLD / REJECT
- `reasonCode` — the specific reason (see table above)
- `failedInvariant` — which specific governance check failed (for REJECT)
- `requestId` — the identifier for the evaluation

You can request a full diagnostic report from your technical owner using:

```bash
pnpm demo:support
```

This produces a system status report including recent events and integrity status.

---

## Evidence and Audit Access

The evidence record for every decision is stored in the audit log. You may need to access this for:

- Internal audit or compliance review
- Responding to a customer inquiry about a decision
- Investigating an unexpected outcome

Access to the audit log is controlled by your admin. Request access through your internal process. Do not attempt to access the audit log file directly without authorization.

When you need to reference a specific decision, use the `requestId` to identify it in the audit log.

---

## Common Operational Scenarios

### Scenario: A case is stuck in HOLD for too long

1. Check whether the HOLD notification reached the assigned reviewer
2. If not: re-route the notification
3. If yes: follow up with the reviewer
4. If the reviewer is unavailable: escalate to their backup per your internal procedure
5. Do not attempt to bypass the HOLD — this will produce REJECT

### Scenario: A REJECT occurred for a case that should have been approved

1. Read the reason code
2. If the reason code is `APPROVAL_PREDATES_REQUEST`: the approval timestamp is wrong. A new request must be created with a valid approval.
3. If the reason code is `APPROVAL_EXPIRED`: the approval has expired. Obtain a fresh approval and submit a new request.
4. If the reason code is unexpected: contact your technical owner with the full REJECT record and `requestId`

### Scenario: The AI proposed an action that seems wrong

CerbaSeal governed the authorization process — it does not evaluate whether the AI's proposal was correct. If you believe the AI made a poor recommendation, your options are:

1. Do not approve the HOLD — leave it in HOLD status
2. If it was approved and ALLOWed: follow your organization's exception or reversal process
3. Raise the concern with your AI system's owner — this is a model quality issue, not a CerbaSeal issue

### Scenario: You need to produce evidence of a past decision for an audit

1. Identify the `requestId` for the relevant decision
2. Request the audit log extract from your admin
3. The audit chain can be verified by your admin with `pnpm verify:proof`

---

## What Operators Should Not Do

- Do not attempt to modify CerbaSeal outputs or audit log entries
- Do not create manual authorization records outside the system
- Do not tell a reviewer that they need to approve something "to get past the system" — the system works correctly. The workflow may need redesigning if approvals are being treated as obstacles.
- Do not report HOLD outcomes as failures — HOLD is expected behavior
- Do not escalate to Lamont Labs directly — your Line Axia account contact is your first escalation point

---

## Escalation Path

1. **Check this guide** and the `faq.md` for the situation
2. **Contact your technical owner** if the issue is a technical error (GATE_INTERNAL_REJECT, service not available)
3. **Contact your Line Axia account contact** for all other issues
4. **Your Line Axia contact escalates to Lamont Labs** where needed

Provide the `requestId`, the reason code (if a REJECT), and what you expected to happen versus what did happen.
