# Mode C: Client-Controlled Deployment

**Version:** 0.1.0  
**Classification:** Lamont Labs Confidential  
**Audience:** Line Axia CTO / Integration Engineering

---

## 1. What Is Mode C?

Mode C is the deployment model for the Line Axia pilot. In this model:

- CerbaSeal-Core runs **inside Line Axia's infrastructure**
- Line Axia owns and controls the hosting environment
- Lamont Labs provides the library, proof snapshots, and audit support
- There is no Lamont Labs network access to the running enforcement node

This is distinct from a SaaS or managed-service model. Line Axia retains full operational control.

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Line Axia Environment                                   │
│                                                          │
│   ┌───────────────────┐     ┌─────────────────────────┐ │
│   │  Line Axia        │     │  CerbaSeal-Core         │ │
│   │  Integration      │────▶│  ExecutionGateService   │ │
│   │  Adapter          │     │  AppendOnlyLogService   │ │
│   └───────────────────┘     │  EvidenceBundleService  │ │
│                              └─────────────────────────┘ │
│                                         │                 │
│                              ┌──────────▼──────────────┐ │
│                              │  JSONL Audit Log        │ │
│                              │  (persistent, on-disk)  │ │
│                              └─────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

CerbaSeal has **no outbound network calls**. It is a pure in-process library.

---

## 3. What Lamont Labs Provides

| Deliverable | Format | Notes |
|---|---|---|
| CerbaSeal-Core library | npm package or git source | Pinned version with proof snapshot |
| Proof snapshot | `docs/reports/proof-snapshot.json` | SHA-256 verified enforcement state |
| Verification script | `pnpm verify:proof` | Reproducible in Line Axia's environment |
| Operational runbook | `docs/deployment/runbook.md` | Installation, health checks, incident response |
| Integration type definitions | TypeScript `.d.ts` | All `GovernedRequest`, `DecisionEnvelope`, `EvidenceBundle` types |

---

## 4. What Line Axia Provides

| Responsibility | Notes |
|---|---|
| Hosting environment | Node.js 22.x LTS, 512 MB+ RAM |
| Integration adapter | Constructs `GovernedRequest` objects from Line Axia workflow events |
| Identity binding | Verifies actor and approver identities before calling CerbaSeal |
| Audit log storage | Persistent volume for JSONL audit file |
| Approver workflow | Human approvers with `reviewer` or `compliance_officer` authority class |
| Incident response | P0/P1 escalation to Lamont Labs per `runbook.md` Section 10 |

---

## 5. Data Flow

### 5.1 Inbound (Line Axia → CerbaSeal)

Line Axia's integration adapter constructs a `GovernedRequest` for each governed workflow event. Required fields:

- `requestId` — unique per request, non-empty
- `workflowClass` — one of: `fraud_triage`, `transaction_escalation`, `account_hold_recommendation`
- `actorId` — identity of the system or user initiating the request
- `actorAuthorityClass` — must be one of: `system`, `ai`, `analyst`, `reviewer`, `manager`, `compliance_officer`
- `proposedActionClass` — must be one of: `allow`, `hold`, `reject`, `escalate`, `account_hold`
- `policyPackRef` — policy pack identity and version
- `provenanceRef` — model version, rule set version, source hash
- `approvalArtifact` — required for `fraud_triage` workflow; must reference a valid human approver

### 5.2 Outbound (CerbaSeal → Line Axia)

CerbaSeal returns a `GateResult` containing:
- `decisionEnvelope` — immutable decision record with `finalState`: `ALLOW | HOLD | REJECT`
- `releaseAuthorization` — present only on `ALLOW`; identifies the specific action class released
- `blockedActionRecord` — present on `HOLD` or `REJECT`; includes reason codes for audit

---

## 6. Governed Request Constraints

CerbaSeal enforces these at runtime — Line Axia's integration adapter must satisfy them:

| Constraint | Invariant | Effect if violated |
|---|---|---|
| Policy pack must be present | INV-01 | REJECT |
| Provenance must be complete | INV-02 | REJECT |
| Human approval required for `fraud_triage` | INV-03 | HOLD |
| Logging must be ready | INV-04 | REJECT |
| AI cannot be authoritative | INV-05 | REJECT |
| Actor authority class must be known | INV-11 | REJECT |
| Approval timestamp must postdate request | INV-03 | REJECT |
| Prohibited use must be false | INV-10 | REJECT |
| Controls must not be stale for sensitive requests | INV-08 | REJECT |
| Trust state must be valid | INV-09 | REJECT |

---

## 7. Audit Log Handoff

At the end of the pilot period, Line Axia exports the JSONL audit log. Lamont Labs verifies chain integrity using `log.verifyChain()` and produces a final proof snapshot. This constitutes the governance record for the pilot.

---

## 8. Limitations in Mode C

| Limitation | Notes |
|---|---|
| No Lamont Labs visibility into live traffic | By design. Line Axia controls the environment. |
| No real-time Lamont Labs monitoring | Incident reporting is manual per runbook |
| No remote key management | `CERBASEAL_SIGNING_KEY` is managed by Line Axia |
| In-memory log does not survive restarts | Use `FileBackedAppendOnlyLogService` for pilot |

---

*Last updated: 2026-06-04 — CerbaSeal v0.1.0 pilot*
