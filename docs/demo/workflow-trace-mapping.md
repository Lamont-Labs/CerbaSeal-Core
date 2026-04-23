# Workflow Trace Mapping

This document maps each enforcement trace in the demo to its corresponding step in the Aurelion Bank High-Risk Transaction Escalation workflow. See [client-workflow-canonical.md](./client-workflow-canonical.md) for the full workflow definition.

---

## trace_reject_001 → Step 2 (AI Attempt — Blocked)

This trace represents the moment the AI Detection System attempts to escalate a transaction without human authority. The actor is the AI system and the proposal source is AI. CerbaSeal evaluates these facts and applies the invariant that AI actors cannot authorize their own proposals. The result is REJECT. A DecisionEnvelope and EvidenceBundle with a full audit chain are produced. No execution occurs.

---

## trace_hold_001 → Step 4 (Missing Approval — Paused)

This trace represents the Fraud Analyst's review of the same case. The actor is human, the action is `account_hold`, and the request is otherwise valid. However, the workflow requires explicit compliance approval for sensitive actions, and no approval artifact is attached. CerbaSeal evaluates this and finds the required approval missing. The result is HOLD. A DecisionEnvelope and EvidenceBundle are produced. The action is paused until approval is supplied.

---

## trace_allow_001 → Step 6 (Authorized Execution)

This trace represents the re-submission of the analyst's request after the Compliance Officer has issued approval. The approval artifact is bound to the specific requestId, includes a signature, and carries the compliance officer's authority classification. CerbaSeal evaluates all invariants and finds them satisfied. The result is ALLOW. A DecisionEnvelope, ReleaseAuthorization, and EvidenceBundle are produced. The `account_hold` proceeds to execution.
