# CerbaSeal — Reviewer Guide

**Audience:** Human reviewers and approvers — the people who authorize AI-proposed actions  
**Assumed knowledge:** Basic understanding of what CerbaSeal is (read `getting-started-guide.md` first)  
**Reading time:** 15 minutes

---

## Your Role

As a reviewer, you are the human authority in the CerbaSeal governance model. When an AI system proposes a consequential action and CerbaSeal produces a HOLD outcome, the request is waiting for you.

Your decision — to approve or not to approve — determines whether the action executes. Your approval is recorded in the evidence bundle, with your identity, authority class, and timestamp. This record is permanent.

**Your authority matters.** CerbaSeal enforces that AI systems cannot authorize their own proposals. That means your review is not a formality — it is the structural point at which human judgment enters the process.

---

## What You Are Reviewing

When you receive a HOLD notification, you are being asked to review:

1. **What the AI proposed** — the specific action the AI system recommends
2. **Why it proposed it** — the rationale and (if available) the confidence score
3. **Whether to authorize it** — your judgment call, based on the information provided

You are not being asked to approve every AI proposal automatically. You are being asked to genuinely review the proposal and make a considered decision.

---

## What Happens When You Approve

When you approve a HOLD request:

1. Your system records your approval as an `ApprovalArtifact`:
   - Your identifier (approver ID)
   - Your authority class (your role, e.g., `senior_analyst`)
   - The timestamp of your approval (ISO datetime)
   - An immutable signature value
2. The request is re-submitted to CerbaSeal with your approval artifact
3. CerbaSeal evaluates the request again — with your approval present
4. If all conditions are met, the outcome is ALLOW
5. The `ReleaseAuthorization` record is created, linking your approval to the authorized action

**Your approval is permanent.** The evidence bundle recording your approval is stored in the audit log and cannot be altered. Review carefully.

---

## What Happens When You Do Not Approve

If you review a proposal and decide not to approve:

- The request stays in HOLD (if no one else approves it)
- Or, if your system supports it, you can mark it as declined — which causes the action to be abandoned
- The AI's proposal does not execute
- The evidence record reflects that the proposal was reviewed and not authorized

Not approving is a legitimate outcome. It is not a failure of the system.

---

## What to Consider Before Approving

Your organization's policy defines your approval standards. In addition, consider:

**Is the AI's proposal reasonable?**  
Does the AI's rationale make sense given what you know about this case? Is the confidence score consistent with the risk level?

**Is the timing right?**  
Do you have enough information to approve now? If not, is there more you need before you can make a sound decision?

**Is this within your authority?**  
Your authority class determines what actions you are authorized to approve. If the action requires a higher authority class than yours, do not approve it — route it to the appropriate approver.

**Is this action reversible?**  
If the action is difficult or impossible to reverse, apply extra care. Governance evidence does not undo an action — it proves what happened.

---

## Your Approval Record — What Is Captured

When you approve, the following is recorded permanently in the evidence bundle:

| Field | What It Contains | Example |
|---|---|---|
| `approverId` | Your identifier in the system | `analyst-007` |
| `approvalId` | The unique identifier for this approval act | `approval-2026-001` |
| `authorityClass` | Your role / authority class | `senior_analyst` |
| `approvedAt` | When you approved (ISO datetime) | `2026-06-05T10:00:00.000Z` |
| `immutableSignature` | A record that this approval was made | [system-generated] |
| `requestId` | The request you approved | `req-TXN-4492` |

This record:
- Cannot be altered after it is written
- Is linked to the decision evidence by the audit chain
- Can be produced in response to an audit or regulatory request

---

## What You Cannot Do

**You cannot approve your own system's self-generated authorizations.**  
CerbaSeal structurally blocks AI self-authorization. No matter what an AI system says or how it constructs a request, it cannot authorize its own proposals. Your role as a human reviewer is what makes authorization possible.

**You cannot approve a request that has already expired.**  
If the HOLD has been pending and the request is no longer valid, a new request must be submitted by the calling system.

**You should not feel pressured to approve automatically.**  
The purpose of HOLD is to create a genuine human review point. If the review is always a rubber stamp, the governance is not working. Take the time you need.

---

## Common Questions

**Q: What if I am not available and a HOLD is time-sensitive?**  
A: There should always be a backup reviewer named in your workflow configuration. If you are unavailable, the system should route to your backup. Ensure your team's availability coverage is configured in the downstream workflow system.

**Q: Can I see the full history of an account or case before approving?**  
A: CerbaSeal provides the governed request — the AI's proposal and the governance context. Historical case data should be available in your case management or workflow system. CerbaSeal does not manage case history.

**Q: What happens if I approve something I shouldn't have?**  
A: The approval and the resulting ALLOW decision are recorded permanently. If the authorized action needs to be reversed, that is handled by your downstream operational system. Contact your operations team. The evidence record will reflect what happened — your approval, the AI's proposal, and the authorized outcome.

**Q: Can two reviewers be required for high-risk approvals?**  
A: CerbaSeal validates one approval artifact per request in the current version. Multi-approval workflows (e.g., requiring two senior analysts to approve) are not enforced by CerbaSeal natively. Your calling system can implement multi-step approval and submit only after all approvals are collected, with the final approver's artifact.

**Q: Can I be audited based on my approvals?**  
A: Yes. Your approver identity (`approverId`) and authority class are recorded in every evidence bundle for actions you approve. This record is permanent and verifiable.

---

## Escalation

If you receive a HOLD notification for something you are not authorized to approve, or something that raises a concern beyond your scope:

1. Do not approve it
2. Route it to the appropriate authority (your manager, compliance officer, etc.) using your internal process
3. The HOLD will remain in place until the appropriate authority approves or the request is abandoned

If you see a REJECT outcome and do not understand why, contact your operations team with the reason code and `requestId`.
