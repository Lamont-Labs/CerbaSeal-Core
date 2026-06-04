# Access Control and Rate Limiting

**Status:** Pilot Scope Note — Not Yet Implemented  
**Classification:** Lamont Labs Confidential  
**Related:** `docs/deployment/runbook.md`, `docs/deployment/mode-c-client-controlled.md`

---

## 1. Current State (v0.1.0)

CerbaSeal-Core v0.1.0 is a **library**, not a network service. There is no HTTP endpoint, no authentication layer, and no rate limiter in the current codebase.

Access control is enforced through **TypeScript API boundaries** and **enforcement logic** in `ExecutionGateService`:

| Control | Mechanism | Notes |
|---|---|---|
| AI cannot authorize | `assertProposalBoundary` (INV-05) | Rejects if `actorAuthorityClass === "ai"` with `proposalSourceKind === "ai"` |
| Human-only approval | `assertApprovalState` (INV-03) | Approver must be `analyst`, `reviewer`, `manager`, or `compliance_officer` |
| Unknown actor class rejected | `assertActorAuthorityClass` (INV-11) | Any actor class outside the defined set produces REJECT |
| Approval must postdate request | `assertApprovalState` (INV-03) | `approvedAt` must not precede `request.createdAt` |
| No bypass of gate | `assertIsGateIssued` (INV-06) | Evidence bundles reject forged GateResults |
| Prohibited use blocked | `assertProhibitedUse` (INV-10) | Hard-coded — no caller override |

These controls apply to **every** evaluation regardless of the caller. The API has no privileged mode.

---

## 2. What Is Not Implemented

The following controls are **not implemented** in v0.1.0 and are required before any production deployment:

### 2.1 Authentication
- No authentication layer between calling code and the enforcement gate.
- In a deployment context, the calling system (Line Axia integration adapter) is responsible for authenticating users before constructing `GovernedRequest` objects.
- CerbaSeal trusts the `actorId`, `actorAuthorityClass`, and `approvalArtifact` fields as supplied. It validates their structure and relationships, but does not independently verify that the actor identity is authentic.

**Mitigation path:** Before production, integrate with Line Axia's identity provider to verify `actorId` and `approverAuthorityClass` against an authoritative directory. This is an integration-layer concern, not a CerbaSeal-Core concern.

### 2.2 Rate Limiting
- No rate limiting on `ExecutionGateService.evaluate()`.
- High-volume callers could theoretically enumerate rejection conditions or saturate the in-memory audit log.

**Mitigation path:** Implement rate limiting at the integration adapter layer. CerbaSeal itself is deliberately stateless with respect to caller identity to preserve its role as a deterministic enforcement function.

### 2.3 Role-Based Access to Audit Log
- `AppendOnlyLogService.list()` returns all entries to any caller.
- No read-access controls exist.

**Mitigation path:** Wrap `AppendOnlyLogService` in a read-access facade that enforces role checks before returning entries. CerbaSeal provides the underlying immutable store; the application layer enforces read access.

### 2.4 Audit Log Write Isolation
- The `AppendOnlyLogService` instance is passed by reference to `EvidenceBundleService`. Any caller holding a reference can call `log.list()`.
- There is no OS-level isolation of the JSONL file in the file-backed implementation.

**Mitigation path:** Run CerbaSeal in a dedicated process with restricted file system permissions. The JSONL audit log file should be owned by the CerbaSeal process user and not readable by other processes.

---

## 3. Deployment Posture for Pilot

For the Line Axia pilot:

1. CerbaSeal runs **inside Line Axia's environment** (Mode C). Network perimeter is Line Axia's responsibility.
2. All `GovernedRequest` objects are constructed by Line Axia's integration adapter. Line Axia is accountable for authenticating the source of each request.
3. Audit log access is restricted to the CerbaSeal process and Lamont Labs-authorized tooling.
4. No external network exposure. CerbaSeal has no listening ports.

---

## 4. Production Hardening Checklist (Post-Pilot)

- [ ] Integrate identity verification for `actorId` and `approverId` against Line Axia IdP
- [ ] Add rate limiting at integration adapter layer
- [ ] Add read-access controls on audit log API
- [ ] OS-level file permission hardening for JSONL audit log
- [ ] Structured logging to SIEM (format TBD)
- [ ] Approval artifact non-repudiation (see `artifact-signing-roadmap.md`)
- [ ] Pentest of integration adapter surface

---

*Last updated: 2026-06-04 — CerbaSeal v0.1.0 pilot*
