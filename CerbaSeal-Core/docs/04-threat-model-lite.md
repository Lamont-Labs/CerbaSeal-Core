# Threat Model (Lite)

This document outlines key failure and attack scenarios considered in this repository.

## 1. Bypass Attempt

Scenario:
A system attempts to execute an action without passing through the execution gate.

Mitigation:
- ReleaseAuthorization is required for execution
- DecisionEnvelope alone is insufficient
- No alternate execution path is defined

---

## 2. AI Authority Escalation

Scenario:
AI attempts to authorize or override execution.

Mitigation:
- AI is structurally non-authoritative
- authority-bearing proposals are rejected
- approval must come from valid human authority

---

## 3. Missing Approval

Scenario:
Required approval is skipped or absent.

Mitigation:
- approvalRequired enforced
- no release without approvalArtifact
- system enters HOLD or REJECT

---

## 4. Audit Tampering

Scenario:
Audit log is modified after the fact.

Mitigation:
- append-only log structure
- hash-linked entries
- chain verification available

---

## 5. Incomplete Evidence

Scenario:
Execution occurs without traceability.

Mitigation:
- evidence bundle required
- both allowed and blocked actions produce artifacts
- export references original evidence

---

## 6. Replay Inconsistency

Scenario:
Same request produces different outcomes over time.

Mitigation:
- deterministic evaluation
- replay service verifies consistency

---

Scope Note:
Infrastructure-level threats (hosting, identity providers, network) are out of scope for this repository.