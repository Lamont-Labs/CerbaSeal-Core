# High-Risk Transaction Escalation — Workflow

This workflow is a reference example demonstrating CerbaSeal behavior in a high-risk environment.  
It is not limited to fraud systems and can be mapped to any domain involving controlled actions.

This is the simplified walkthrough of the reference enforcement workflow. For the full canonical definition, see [client-workflow-canonical.md](./client-workflow-canonical.md).

---

## Steps

**1. Detection**  
The AI Detection System flags a transaction showing cross-border mismatch, abnormal velocity, or repeated failures. It generates a proposal: `escalate` or `account_hold`.

**2. AI Attempt — Blocked**  
The AI submits the proposal directly for execution. CerbaSeal evaluates the request and finds the actor is AI and the proposal source is AI. Result: **REJECT**. The AI cannot authorize its own proposals. A DecisionEnvelope and EvidenceBundle are created.

**3. Analyst Review**  
A Fraud Analyst reviews the same case independently and submits an `account_hold` action. No approval artifact is attached.

**4. Missing Approval — Paused**  
CerbaSeal evaluates the analyst's request. The actor is human, but the approval is required and not present. Result: **HOLD**. A DecisionEnvelope and EvidenceBundle are created. The action waits.

**5. Compliance Approval**  
A Compliance Officer reviews the case and issues an approval. The approval is bound to the specific requestId, includes a signature, and carries the officer's authority classification.

**6. Authorized Execution**  
The request is re-submitted with the approval attached. CerbaSeal evaluates all invariants — all pass, approval is valid and bound. Result: **ALLOW**. A DecisionEnvelope, ReleaseAuthorization, and EvidenceBundle are created.

**7. Execution + Audit**  
The `account_hold` is applied. A full audit record exists: complete trace, immutable hash-linked chain, replayable decision.
