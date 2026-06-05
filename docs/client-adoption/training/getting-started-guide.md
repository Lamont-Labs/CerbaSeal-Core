# CerbaSeal — Getting Started Guide

**Audience:** Anyone new to CerbaSeal — technical or non-technical  
**Reading time:** 15 minutes  
**What you will know after reading this:** What CerbaSeal is, what it does, what it does not do, and how to understand its three outcomes.

---

## What Is CerbaSeal?

CerbaSeal is an enforcement gate. It sits between an AI system and any action that AI system proposes — and it decides, structurally, whether that action is authorized to execute.

Think of it as a checkpoint. Every time an AI system proposes a consequential action (sending a payment, freezing an account, escalating a case), the proposal must pass through CerbaSeal's gate before anything happens in the real world.

CerbaSeal makes one of three decisions:

- **ALLOW** — The action is authorized. It may proceed.
- **HOLD** — The action is paused. A human must review and approve before it can proceed.
- **REJECT** — The action is refused. It will not execute. The reason is recorded.

Every decision — including HOLD and REJECT — produces a permanent, verifiable record. Nothing is lost. Nothing is silent.

---

## What Problem Does CerbaSeal Solve?

When AI systems take consequential actions, there are two things organizations typically struggle to prove:

1. **That a human actually authorized the action** before it ran
2. **That the record of authorization cannot be altered** after the fact

Standard audit logs, human review steps, and policy documents don't solve this structurally — they can be bypassed, added after the fact, or modified.

CerbaSeal solves this structurally, at the code level:

- An AI system **cannot authorize its own proposals** — this is a hard rule built into the enforcement gate. No setting, flag, or configuration can change it.
- Every authorized action has a human-issued approval that is recorded in the evidence bundle.
- Every evidence bundle is linked by a cryptographic hash chain — the chain can be verified at any time.

---

## What CerbaSeal Is Not

CerbaSeal does not:

- **Evaluate whether the AI's decision was correct.** CerbaSeal governs authorization, not judgment. Whether the AI recommended the right thing is a separate question.
- **Certify compliance** with the EU AI Act, GDPR, SOC 2, or any other regulation. It produces evidence that supports compliance review. Compliance certification is a legal and regulatory determination.
- **Replace human oversight.** It enforces that human oversight happens. The humans still need to make good decisions.
- **Monitor AI performance or output quality.** That is outside its scope.
- **Manage your IT infrastructure.** CerbaSeal is software you deploy — it does not manage your servers, databases, or networks.

---

## The Three Outcomes — Explained Simply

### ALLOW

The action has been authorized. Everything checked out:
- A human with appropriate authority reviewed and approved the proposal
- The approval is valid, not expired, and postdates the request
- All governance conditions are met
- The proposal passed all 12 enforcement checks

When an action is ALLOWed, CerbaSeal issues a `ReleaseAuthorization` — a structured record that says: *"This specific action was authorized by this specific person, at this specific time, under this specific policy."*

**What to do when you see ALLOW:** The downstream system can proceed with the authorized action.

---

### HOLD

The action is paused. The request is valid — the AI's proposal is well-formed and the governance conditions are mostly met — but human authorization has not been provided yet.

HOLD is not a rejection. It is a pause. Once a human with appropriate authority reviews and approves the proposal, the request is re-submitted with the approval. It will then produce ALLOW (if everything else still checks out).

**What to do when you see HOLD:** Route the request to the appropriate reviewer. Once approved, re-submit with the approval record.

---

### REJECT

The action has been refused. Something fundamentally violated the governance rules:
- An AI system tried to authorize its own proposal
- The approval artifact is missing, expired, or structurally invalid
- A required field is missing or malformed
- The action type is prohibited

REJECT is permanent for that request. The same request cannot be re-submitted. If re-evaluation is needed, a new request must be created.

Every REJECT produces an evidence record explaining exactly which governance rule was violated and why.

**What to do when you see REJECT:** Read the reason code. Do not attempt to work around a REJECT. If the REJECT is unexpected, contact your Line Axia account contact with the reason code and request details.

---

## The Evidence Record

Every decision — ALLOW, HOLD, or REJECT — produces an **evidence bundle**. The bundle contains:

- What was proposed (the action, who proposed it, which AI model)
- What decision was made (ALLOW / HOLD / REJECT)
- Why the decision was made (which conditions passed, which failed, and the reason code)
- When the decision was made (timestamp)
- Who authorized it (approver identity and authority class, for ALLOW)

Evidence bundles are stored in an append-only audit log. Each entry is linked to the previous one by a cryptographic hash — this means the log cannot be altered without detection. The chain can be verified at any time.

---

## The Audit Log

The audit log is a file that grows over time. Every enforcement decision adds one entry. Entries are in JSON Lines format — one JSON object per line, human-readable.

The log is:
- **Append-only** — entries can never be deleted or modified
- **Hash-chained** — each entry references the hash of the previous entry
- **Verifiable** — the chain integrity can be confirmed at any time using `pnpm verify:proof`
- **Owned by you** — in a client-controlled deployment, the log file lives on your infrastructure

---

## How Replay Works

CerbaSeal's decisions are deterministic. Given the same input, the gate will always produce the same output.

This means any past decision can be **replayed** — the original request can be re-evaluated through the same gate, and it will produce the same outcome. This is useful for audit, investigation, and verification purposes.

---

## What You Need to Use CerbaSeal

To use CerbaSeal, you need:

- A defined AI workflow — a specific AI system proposing a specific action
- A server environment you control (or a deployment arrangement with Line Axia)
- Node.js 18 or higher
- A technical person who can manage the deployment
- Human approvers whose authorization will be recorded for each action

You do not need to understand the source code. You do need to understand what ALLOW, HOLD, and REJECT mean for your workflow.

---

## Next Steps

- **Technical owner:** Read the `admin-guide.md` and `quickstart-deployment-guide.md`
- **Operators (daily users):** Read the `operator-guide.md`
- **Reviewers and approvers:** Read the `reviewer-guide.md`
- **Executives:** Read `10-minute-executive-overview.md`
- **Questions:** Start with `faq.md`, then contact your Line Axia account contact

---

*CerbaSeal-Core v0.1.0. This is a pilot-stage enforcement system. It is not a production-hardened or certified system.*
