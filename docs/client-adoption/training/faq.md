# CerbaSeal — Frequently Asked Questions

**Audience:** All users — executives, operators, reviewers, and technical staff  
**Updated:** v0.1.0

---

## General Questions

**Q: What is CerbaSeal?**  
CerbaSeal is an enforcement gate. It sits between an AI system and any consequential action the AI proposes, and it decides — structurally — whether that action is authorized to execute before anything happens.

**Q: What problem does it solve?**  
It solves two problems: (1) proving that a human authorized an AI-proposed action before it ran, and (2) producing a tamper-evident, verifiable record of that authorization. Standard audit logs and process steps do not solve this structurally — they can be bypassed or added after the fact. CerbaSeal enforces the governance at the code level.

**Q: Does CerbaSeal replace human judgment?**  
No. CerbaSeal enforces that human judgment must happen. A human with appropriate authority must review and approve before an AI-proposed action executes. CerbaSeal doesn't evaluate whether the human made a good decision — it records that a human made the decision.

**Q: Who made CerbaSeal?**  
Lamont Labs, founded by Jesse Lamont. CerbaSeal is a TypeScript/Node.js enforcement library.

---

## Outcomes

**Q: What is ALLOW?**  
ALLOW means the action is authorized. All governance conditions are met. A human with appropriate authority approved it. The authorization is valid. The action may proceed. A `ReleaseAuthorization` record is created.

**Q: What is HOLD?**  
HOLD means the action is paused, waiting for human authorization. The request is structurally valid — the AI's proposal is well-formed — but no human has approved it yet. Once a human approves, the request is re-submitted and will ALLOW.

**Q: What is REJECT?**  
REJECT means the action is refused. Something violated the governance rules — most commonly an AI system attempting to authorize its own proposal, a missing required field, or an invalid approval. The action will not execute. Evidence is recorded. A new request must be created to retry.

**Q: Can a REJECT be overridden?**  
No. A REJECT is final for that request. You cannot override it. If the underlying issue is corrected (e.g., a valid human approval is obtained), a new request with a new `requestId` must be submitted.

**Q: Can a HOLD be cancelled?**  
HOLD resolution is managed by your downstream system. CerbaSeal does not cancel HOLDs — it evaluates re-submitted requests. Your system should be designed to either: (1) route HOLDs to a reviewer for approval, or (2) abandon the HOLD if it is no longer relevant (by not re-submitting).

---

## AI and Authorization

**Q: Can an AI system approve its own proposals?**  
No. This is a hard invariant — it cannot be bypassed by any flag, configuration, or field. Any request where an AI actor attempts to authorize its own proposal produces REJECT with `AI_SELF_AUTHORIZATION_BLOCKED`. This is the most fundamental rule in CerbaSeal.

**Q: Can one AI system approve another AI system's proposals?**  
An `ai` authority class cannot produce an authorization that results in ALLOW. The approver must use a human authority class (`senior_analyst`, `compliance_officer`, `operations_manager`, `human`, or `system`). If an automated system (non-AI) can serve as an authorizer in your workflow, it should use `system` as its authority class.

**Q: Does CerbaSeal evaluate whether the AI's decision was correct?**  
No. CerbaSeal governs the authorization process — whether a human authorized the action. Whether the AI's recommendation was the right one is outside CerbaSeal's scope. That is a question for the AI model's own evaluation processes and your human reviewers.

---

## Evidence and Audit

**Q: What is an evidence bundle?**  
An evidence bundle is a complete record of one enforcement evaluation. It contains: what was proposed, who proposed it, what decision was made and why, who authorized it (if ALLOW), the timestamp, and the invariant trace. Every evaluation — ALLOW, HOLD, and REJECT — produces an evidence bundle.

**Q: Can the audit log be altered?**  
Not without detection. The audit log entries are linked by SHA-256 hash chain. Each entry references the hash of the previous one. If any entry is modified, the chain breaks. Chain integrity is verified by `pnpm verify:proof`.

**Q: Who owns the audit log?**  
In a client-controlled (Mode C) deployment, the audit log file lives on your infrastructure. You own it. Lamont Labs and Line Axia do not have access to it.

**Q: How long should we retain audit records?**  
This depends on your regulatory obligations and your working agreement with Line Axia. CerbaSeal does not enforce a retention period — that is your responsibility. Common regulatory requirements in financial services range from 5 to 7 years.

**Q: Can we export the audit log?**  
The audit log is a JSON Lines file on your infrastructure. You can copy, archive, or export it using standard file management tools. CerbaSeal does not manage export format conversion — if you need a specific format, that is a client-side transformation.

**Q: What is the proof snapshot?**  
The proof snapshot is an exportable summary of CerbaSeal's enforcement state — its invariants, test results, and validators — at a specific moment. It includes a `stableChecksum` that is stable across runs on an unchanged system. Reviewers can use it to verify that the enforcement state has not changed.

---

## Compliance and Regulation

**Q: Does CerbaSeal certify EU AI Act compliance?**  
No. CerbaSeal produces governance evidence that is relevant to EU AI Act requirements — particularly Article 12 (record-keeping) and Article 14 (human oversight). It does not certify compliance. Compliance determination is a legal and regulatory matter.

**Q: Does CerbaSeal certify GDPR compliance?**  
No. CerbaSeal governs the authorization process for AI actions. It does not manage personal data, consent, or data subject rights. GDPR compliance is the client's responsibility.

**Q: Is CerbaSeal a compliance platform like Vanta?**  
No. CerbaSeal is a specific enforcement primitive — it enforces human authorization over AI-proposed actions and produces verifiable evidence. It is one component of a compliance posture, not a full compliance platform.

**Q: Has CerbaSeal had a third-party security review?**  
Not yet. The enforcement core has been through rigorous internal adversarial testing (432 tests including bypass and forgery scenarios). A third-party security review is planned as a future milestone.

---

## Deployment and Technical

**Q: Where does CerbaSeal run?**  
In a client-controlled deployment (Mode C), CerbaSeal runs on your infrastructure — your server, your environment. Lamont Labs provides the software. You run it.

**Q: Does CerbaSeal make external API calls?**  
No. The enforcement core has zero runtime dependencies on external services. No data is sent to Lamont Labs or any third party during enforcement decisions.

**Q: Does my data leave my environment?**  
In a client-controlled deployment: no. The audit log and all evidence records stay on your infrastructure.

**Q: What is Node.js? Do I need it?**  
Node.js is a runtime that allows JavaScript/TypeScript programs to run on a server. CerbaSeal requires Node.js version 18 or higher. Your technical owner will handle this — it is a standard, well-supported technology.

**Q: What happens if CerbaSeal is unavailable?**  
CerbaSeal is fail-closed. If the gate is unavailable, the action does not execute. Your calling system should be designed to handle CerbaSeal unavailability by triggering a manual fallback, not an automatic bypass.

**Q: Can we run CerbaSeal on Windows?**  
CerbaSeal is a Node.js application and runs on Windows, macOS, and Linux. Linux is recommended for production-style deployments.

---

## Pilot-Specific Questions

**Q: What does "pilot" mean?**  
A pilot is a controlled technical evaluation of CerbaSeal for one specific workflow. It is not a production deployment, not a certification, and not a long-term commitment. The purpose is to verify that CerbaSeal works for your specific use case.

**Q: What is the support commitment during the pilot?**  
Support during the pilot is scoped and time-limited. A fixed number of hours for onboarding, deployment assistance, and issue resolution is agreed in the working agreement. Open-ended, unlimited support is not included.

**Q: Can we add a second workflow during the pilot?**  
No. The pilot is defined as one workflow. Adding a second workflow is out of scope and requires a separate agreement.

**Q: What happens after the pilot?**  
At the end of the pilot, you will have a documented outcome: what worked, what the evidence produced, and whether the pilot succeeded against agreed criteria. If successful, the next step is a post-pilot commercial engagement for production use.

**Q: Who do we contact for issues?**  
First: check the `troubleshooting-guide.md`. If you cannot resolve it: contact your Line Axia account contact. Line Axia escalates to Lamont Labs where needed. Do not contact Lamont Labs directly unless directed to.
