# Threat Model (Lite)

This document outlines the primary failure and attack scenarios considered in this repository.

## 1. Bypass Attempt

### Scenario
A system attempts to execute an action without passing through the execution gate.

### Mitigation
- Execution authority is only granted via ReleaseAuthorization
- DecisionEnvelope alone is insufficient
- Non-bypassability is enforced structurally

---

## 2. AI Authority Escalation

### Scenario
AI attempts to directly authorize or influence final execution.

### Mitigation
- AI is structurally non-authoritative
- authorityBearing proposals are rejected
- approval is required from human authority class

---

## 3. Missing Approval

### Scenario
Required human approval is skipped or faked.

### Mitigation
- approvalRequired enforced
- approvalArtifact required
- privilegedAuth and signature validated

---

## 4. Tampering with Audit History

### Scenario
Audit records are modified after the fact.

### Mitigation
- append-only log
- hash-linked entries
- chain verification capability

---

## 5. Incomplete Evidence

### Scenario
Action occurs without traceability.

### Mitigation
- evidence bundle creation required
- blocked and allowed outcomes both recorded
- export references original evidence

---

## 6. Replay Manipulation

### Scenario
System produces inconsistent outcomes over time.

### Mitigation
- deterministic evaluation
- replay service verifies outcome stability

---

## Scope Note

This is a structural threat model for the enforcement layer only.

Infrastructure-level threats (network, hosting, identity providers) are out of scope for this repository and handled in deployment design.
