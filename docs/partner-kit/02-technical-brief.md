# CerbaSeal — Technical Brief

**Audience:** Partner technical leads, client CTOs, engineering managers  
**Time:** 20 minutes  
**Purpose:** Understand what CerbaSeal is, how it works, and where it fits in a client's architecture  

---

## The Problem in One Sentence

In AI-assisted workflows, the path from "AI recommends" to "action executes" is almost always unenforced. CerbaSeal makes it technically impossible to cross that boundary without meeting every governance requirement.

---

## The 7 Layers

CerbaSeal is structured as 7 layers. Each layer has a specific job. Partners need to understand what each does and where their integration touches the system.

```
┌──────────────────────────────────────────────────────┐
│  7. Evidence Layer     — Proof snapshot + export     │
│  6. Audit Layer        — Append-only JSONL log        │
│  5. Policy Layer       — Client-specific rules        │
│  4. Enforcement Gate   — The evaluation engine        │
│  3. Provenance Layer   — AI model + rule traceability │
│  2. Trust Layer        — Actor identity + trust state │
│  1. Request Layer      — Governed request schema      │
└──────────────────────────────────────────────────────┘
```

### Layer 1 — Request Layer

Every governed action starts as a `GovernedRequest`. This is a structured object that carries everything the gate needs to make a decision: who is asking, what they're proposing, what workflow it belongs to, provenance references, trust state, and control status.

**Where partners touch this:** The client's AI system or orchestration layer constructs a `GovernedRequest` and submits it to the gate. The schema is fixed. Partners use the integration starter kits as templates for constructing valid requests.

### Layer 2 — Trust Layer

The request carries a `trustState` object indicating whether the actor is trusted. A request with `trusted: false` is rejected immediately. This allows the host environment to signal to the gate that an actor's session or token is no longer valid.

**Where partners touch this:** Client identity systems populate `trustState`. This is typically a simple boolean derived from session validation.

### Layer 3 — Provenance Layer

Every request must reference the AI model version, rule set version, and source hash that generated the proposal. Without a complete provenance reference, the gate rejects the request. This makes every AI decision traceable to its source.

**Where partners touch this:** The client's AI pipeline must track and expose its model version and rule set version. Partners help clients instrument their AI systems to carry this information.

### Layer 4 — Enforcement Gate

The `ExecutionGateService` is the core. It evaluates every `GovernedRequest` against 12 hard invariants (unconditional) and any policy rules the client has defined (additive). It returns a `GateResult` containing one of three decisions.

The 12 invariants are described in detail in the next section.

**Where partners touch this:** Partners instantiate the gate service with the client's config and policy. This is one line of TypeScript. Partners do not modify the gate.

### Layer 5 — Policy Layer

The `cerbaseal.policy.json` file contains client-specific rules:

- **Actor mappings** — translate client role names to CerbaSeal authority classes
- **Workflow rules** — declare which workflows require human approval
- **Approval chains** — declare which authority classes can approve each workflow
- **Action policies** — per-workflow, per-action behaviour overrides

The policy layer adds restrictions. It cannot relax core invariants.

**Where partners touch this:** Partners author the policy file during workflow mapping. This is the most important configuration task in a pilot. See [03-deployment-guide.md](03-deployment-guide.md).

### Layer 6 — Audit Layer

Every gate evaluation is written to an append-only log. The `FileBackedAppendOnlyLogService` writes decisions to a JSONL file. Each entry is cryptographically chained to the previous one — the hash of each record is incorporated into the next, making the chain tamper-evident.

**Where partners touch this:** Partners configure the log path during setup. The log is the raw evidence trail that the evidence export reads from.

### Layer 7 — Evidence Layer

`pnpm export:proof` generates a proof snapshot: a JSON file containing the test suite results, audit check results, git provenance, and a stable checksum. `pnpm verify:proof` verifies the snapshot has not been tampered with.

**Where partners touch this:** Partners run `export:proof` at the end of the pilot to generate the client's evidence package, and `verify:proof` to confirm its integrity.

---

## The 12 Hard Invariants

Invariants are unconditional rules that the gate enforces regardless of configuration or policy. They cannot be overridden by any policy file, configuration option, or API call.

| # | Invariant | What It Enforces |
|---|---|---|
| 1 | **AI Non-Authoritative** | An AI actor cannot authorize its own proposals. Ever. |
| 2 | **No Required Approval, No Release** | If approval is required, the gate holds until it is present and valid |
| 3 | **No Policy Pack, No Execution** | Every request must carry a policy pack reference |
| 4 | **No Provenance, No Action** | Every request must carry complete provenance (model, rule set, source hash) |
| 5 | **No Logging, No Execution** | The audit log must be ready before any request is evaluated |
| 6 | **Request Schema Valid** | The request must be structurally complete and carry a non-empty requestId |
| 7 | **Proposal and Request Must Match** | The proposed action and the proposal's requested action must be identical |
| 8 | **Prohibited Use Must Block** | Any request flagged as prohibited use is rejected immediately |
| 9 | **Stale Controls Block Sensitive Release** | Sensitive requests with stale or invalid control status are rejected |
| 10 | **Trust State Required** | The actor must have a valid trust state |
| 11 | **No Bypass of Execution Gate** | A GateResult not produced by the gate cannot create a valid evidence bundle |
| 12 | **Immutable Decision Envelope** | Once issued, the decision envelope cannot be modified |

**Key point for clients:** These are not configuration options. They are the enforcement boundary. Policy adds restrictions on top. Nothing removes them.

---

## The 3 Decision Outcomes

Every gate evaluation returns one of three final states:

| State | Meaning | What Happens |
|---|---|---|
| **ALLOW** | All invariants and policy requirements satisfied | `releaseAuthorization` is issued; the action is authorized |
| **HOLD** | Approval required but not present | `blockedActionRecord` is issued; resubmit with a valid `ApprovalArtifact` |
| **REJECT** | An invariant or blocking policy is violated | `blockedActionRecord` is issued; the action is permanently blocked for this request |

`HOLD` is resumable — the client collects the human approval and resubmits the request with an `ApprovalArtifact`. `REJECT` is terminal for that request.

---

## The Approval Artifact

When a gate returns `HOLD`, the human approval is collected and packaged as an `ApprovalArtifact`:

```typescript
const artifact: ApprovalArtifact = {
  approvalId: "approval_unique_id",
  approverId: "reviewer-alice-001",
  forRequestId: "the-original-request-id",    // must match exactly
  approverAuthorityClass: "analyst",           // must be in configured chain
  privilegedAuthSatisfied: true,
  immutableSignature: "sig_reviewer_alice_...",
  approvedAt: "2026-06-08T14:00:00.000Z"      // must not predate request createdAt
};
```

The gate validates:
- `forRequestId` must match the original request's `requestId` (prevents artifact reuse)
- `approvedAt` must not predate `createdAt` (prevents forged timestamps)
- `approverAuthorityClass` must be in the configured approval chain (when chain is defined)
- `privilegedAuthSatisfied` must be `true`
- `immutableSignature` must be non-empty

---

## The 6 Authority Classes

CerbaSeal uses a fixed set of canonical authority classes. All actors are mapped to one of these:

| Class | Meaning | Can Approve? |
|---|---|---|
| `system` | Trusted automated system (not AI) | Yes — if configured in approval chain |
| `ai` | AI/ML system | **Never** |
| `analyst` | Experienced human reviewer | Yes |
| `reviewer` | General human reviewer | Yes |
| `manager` | Manager with sign-off authority | Yes |
| `compliance_officer` | Compliance professional | Yes |

Clients map their own role names to these classes via `actorMappings` in the policy file. This translation happens before any invariant check, so client role names can flow through the system without code changes.

---

## Where a Partner Integration Touches the System

A minimal integration has four contact points:

**1. Request construction** — The client's AI pipeline constructs a `GovernedRequest` before submitting to the gate. Partners use the integration starter kits as templates.

**2. Gate evaluation** — `gate.evaluate(request)` returns a `GateResult`. The integration routes `ALLOW` → proceed, `HOLD` → queue for human review, `REJECT` → terminate.

**3. Approval collection** — When the gate returns `HOLD`, the integration notifies the appropriate human, collects their approval, constructs an `ApprovalArtifact`, and resubmits the request.

**4. Audit log consumption** — At the end of the day (or on schedule), the audit log is exported for compliance reporting or shipped to the client's SIEM.

---

## Why This Is Different from Config-Based Controls

Most approval systems are built on configuration: "if the user has role X and action Y is pending, show an approval button." The enforcement is in the application logic. An engineer who modifies the application logic can bypass it.

CerbaSeal's enforcement is at the infrastructure layer. The gate is the only path from AI proposal to release authorization. There is no alternative path. An engineer who bypasses the gate does not get a `ReleaseAuthorization` — and the evidence bundle service will reject any GateResult not issued by the gate. The audit trail reflects this. The invariants are tested with adversarial scenarios specifically designed to find bypass paths.

**The auditor's view:** Every consequential AI-assisted decision in a CerbaSeal-governed workflow is:
- Associated with a specific human approver (name, authority class, timestamp)
- Cryptographically chained to every other decision in the log
- Exportable as a structured evidence package with a stable checksum
- Verifiable after the fact by re-running `pnpm verify:proof`

---

## Diagram Description (for Whiteboard Use)

```
AI System
    │
    │  GovernedRequest
    ▼
┌─────────────────────────────┐
│  ExecutionGateService        │
│                             │
│  ① Check 12 invariants      │
│  ② Apply policy rules       │
│  ③ Issue GateResult         │
└─────────────────────────────┘
    │
    ├── ALLOW → ReleaseAuthorization → Proceed
    │
    ├── HOLD  → BlockedActionRecord → Human review
    │               │
    │               └── ApprovalArtifact → Resubmit → ALLOW
    │
    └── REJECT → BlockedActionRecord → Terminate
    
Every evaluation → AppendOnlyLog → ProofSnapshot → Evidence Export
```

Draw this on a whiteboard. Walk the client through each path. Show them that `HOLD → Human Review → Resubmit` is the approval loop, and that every step is logged.

---

*For deployment details, see [03-deployment-guide.md](03-deployment-guide.md). For integration starter kit selection, see `examples/INTEGRATION-GUIDE.md`.*
