# CERBASEAL PILOT READINESS BINDER
**Prepared for:** Jesse Lamont | Line Axia Pilot Discussion with Olivia Aréchiga  
**Source:** CerbaSeal repository (v0.1.0) — repository evidence only  
**Date compiled:** June 2026  
**Classification legend used throughout:**
- **[IMPLEMENTED]** — Code exists, tests pass, behavior is verified
- **[DEMO ONLY]** — Present in repository as a demonstration surface, not a production artifact
- **[DOCUMENTED]** — Written and stated in docs, not yet implemented as code
- **[PLANNED]** — Stated as future work, not yet present
- **[OUT OF SCOPE]** — Explicitly excluded from this repository and pilot phase

---

## CONTENTS

1. Executive Summary
2. Technical Readiness & Deployment
3. Solo Founder Capacity Review
4. Commercial Discussion Preparation
5. Gap Analysis
6. Hardest Questions
7. Olivia Agenda Response Guide
8. One-Page Call Cheat Sheet

---

---

# SECTION 1: EXECUTIVE SUMMARY

---

## What CerbaSeal Is

CerbaSeal is a **deterministic execution enforcement layer** that sits between decision-making systems (AI models, rule engines, humans) and execution systems (state mutation, external APIs, workflow actions). It evaluates every governed request before execution and produces exactly one of three outcomes:

- **REJECT** — a hard invariant failed; action blocked permanently for this request
- **HOLD** — required human approval is missing; action suspended pending approval
- **ALLOW** — all conditions satisfied; release authorization issued

**[IMPLEMENTED]** The enforcement gate (`ExecutionGateService.evaluate()`), 12 hard invariants (INV-01 through INV-12), fail-closed error handling, hash-chained append-only audit log, and evidence bundle generation are fully coded and tested.

CerbaSeal does not determine whether an action is *correct*. It determines whether an action is *authorized to execute*. That distinction is structural, intentional, and tested.

---

## Current Maturity

| Dimension | State |
|-----------|-------|
| Version | 0.1.0 |
| Test suite | **[IMPLEMENTED]** 372/372 passing (15 test files) |
| Audit checks | **[IMPLEMENTED]** 14/14 passing |
| Invariant coverage | **[IMPLEMENTED]** 12/12 invariants, all linked to tests |
| Validator assertions | **[IMPLEMENTED]** 229 assertions (106 + 13 + 110 across 3 validators) |
| stableChecksum | `7695187faf66906d868c5c4764fd6068e7ddbe0b1f69933e47a85d67c0d08ec0` |
| Hosted demo | **[DEMO ONLY]** https://cerbaseal.replit.app/ |
| Persistent storage | **[PLANNED]** — not implemented |
| Cryptographic signing | **[PLANNED]** — not implemented |
| Production deployment | **[PLANNED]** — not executed |
| Third-party security review | **[PLANNED]** — not completed |
| Pilot client | None — no engagement currently contracted |

Source: `docs/reports/proof-snapshot.json`, `docs/current_maturity.md`, `docs/security/security-review-brief.md`

---

## What Is Proven

The following are **[IMPLEMENTED]** and verified by passing tests and the `pnpm audit:repo` check suite:

- The enforcement gate enforces all 12 invariants without exception
- AI systems cannot authorize their own proposals (INV-05, adversarially tested)
- Required human approval cannot be bypassed (INV-03, adversarially tested)
- Unexpected runtime exceptions produce a controlled REJECT, not an unhandled error (fail-closed)
- Evidence bundles are produced for every outcome including REJECT and HOLD
- Gate-bypassed results are rejected by the evidence layer (WeakSet registry, INV-06)
- Approval artifacts must be bound to the exact requestId they govern (cannot be reused)
- Forged GateResult objects cannot enter the evidence bundle pipeline
- The audit log is append-only with SHA-256 hash chaining
- All outcomes are replayable — same request produces same outcome deterministically
- A proof snapshot can be exported (`pnpm export:proof`) and verified for tamper-evidence (`pnpm verify:proof`)
- Repo self-audits its own structural integrity at 14 automated checks

Source: `docs/status/current-state.md` (security fixes 1–7), `docs/security/security-review-brief.md`, `test/`, `scripts/repo-audit.ts`

---

## What Is Not Yet Proven

These are gaps explicitly documented in the repository:

- **[PLANNED]** Gate invocation cannot be externally proven. A trusted caller who constructs a valid request, bypasses `ExecutionGateService.evaluate()`, and constructs a GateResult manually cannot be distinguished from a legitimate call — as long as the underlying request is valid. See `docs/09-trust-boundary-and-limitations.md`.
- **[PLANNED]** The SHA-256 hash chain proves *internal consistency*, not *origin authenticity*. A fabricated chain with recomputed hashes will pass `verifyChain()`.
- **[PLANNED]** `immutableSignature` is checked for non-empty only. No cryptographic verification.
- **[PLANNED]** `loggingReady`, `trustState`, and `prohibitedUse` are caller-declared. The gate does not independently verify them.
- **[PLANNED]** `DecisionEnvelope` is not frozen at runtime. Objects can be mutated between `evaluate()` and `createBundle()`.
- **[OUT OF SCOPE]** No production deployment has occurred. All state is in-memory per process instance.
- **[OUT OF SCOPE]** No identity provider integration. Actor identity is caller-supplied.
- **[OUT OF SCOPE]** No third-party security review has been completed.

Source: `docs/09-trust-boundary-and-limitations.md`, `docs/current_maturity.md`, `docs/security/security-review-brief.md`

---

## Biggest Strengths

1. **Enforcement is structurally real, not narrative.** The invariants are code. The tests are adversarial. The behavior is deterministic and has been hostile-audited. Seven security fixes were applied following a self-conducted hostile audit before any external review began.
2. **Self-certifying.** Any reviewer can independently re-run `pnpm test`, `pnpm audit:repo`, and `pnpm verify:proof` and arrive at the same verified state. The stableChecksum is stable across runs on an unchanged repo.
3. **Limitations are documented without softening.** `docs/09-trust-boundary-and-limitations.md`, `docs/current_maturity.md`, and `docs/security/security-review-brief.md` state every known gap precisely. A reviewer who reads them will not be surprised by what the system cannot do.
4. **Fail-closed model.** The safe failure mode is non-execution. When the system cannot authorize, it HOLDS or REJECTs with evidence. It does not fail open.
5. **Process is documented.** A pilot engagement model, issue handling process, response time commitments, documentation requirements, and exit deliverables are all specified in `docs/pilot-operations-model.md` before any client has been engaged.

---

## Biggest Risks

1. **Solo founder.** Jesse is the only developer and the only operator. There is no team, no organizational redundancy, no on-call infrastructure, and no institutional continuity beyond the repository and documentation.
2. **No persistent storage.** All audit log state is in-memory. A process restart wipes the log. This is not a gap that can be papered over for any regulated use case.
3. **No third-party security review.** The system has been adversarially tested internally. No external security firm has reviewed it. For a regulated financial workflow (fraud triage, account actions), this will be a hard requirement before production.
4. **No production deployment has occurred.** The demo environment is Replit-hosted. There is no reference production deployment, no infrastructure runbook, no deployment hardening guide, and no operational track record.
5. **Caller-trust boundary.** The system assumes it is called by trusted application code. It cannot guarantee callers are honest. `loggingReady`, `trustState`, and `prohibitedUse` are caller-declared fields. A dishonest caller can pass false values.
6. **No client workflow bound.** Everything in the repository is domain-agnostic. The fraud triage reference scenario exists as a demo construct. No real workflow, no real policy pack, no real approval model, no real identity source, no real execution system is connected.

---

## Pilot Readiness Assessment

**CerbaSeal's enforcement core is ready for a controlled, scoped pilot against a simulated or test-environment workflow.**

It is **not** ready for:
- production deployment where real customer data or real actions are at stake
- regulatory submission or compliance certification of any kind
- autonomous operation without a responsible technical owner
- any scenario where the caller cannot be trusted as an honest application component

The correct pilot shape, per `docs/pilot/pilot-readiness-brief.md`: **one client, one workflow, one decision path, one approval model, one enforcement promise, one verifiable outcome.**

Agreement prerequisites must be in place before pilot execution: commercial terms, evidence ownership, liability boundary, support period, payment, data processing agreement (if applicable), and version freeze. None of these currently exist.

---

---

# SECTION 2: TECHNICAL READINESS & DEPLOYMENT

---

## 2.1 Current Deployment Readiness

**Current State:** **[DEMO ONLY]** CerbaSeal runs as a Node.js/TypeScript package on Replit. The only deployed instance is the hosted demo at `https://cerbaseal.replit.app/`. This is a demonstration surface, not a production deployment.

**Evidence:**
- `README.md`: "The hosted demo is intentionally scoped as a demonstration surface. It is not a production system or deployment surface."
- `docs/security/security-review-brief.md`: "This is a review-ready core demo, not a production client deployment."
- `docs/current_maturity.md`: "It is not a finished standalone deployable product."

**Gaps:**
- No persistent storage layer
- No infrastructure hardening
- No secrets management
- No access control on enforcement services
- No rate limiting or abuse prevention
- No production monitoring or alerting
- No deployment runbook

**Risks:** Attempting to position the Replit demo as anything other than a demonstration surface would be factually inaccurate and create downstream trust risk.

**Recommended Discussion Points:**
- Be explicit that current deployment is demo-only
- Frame the pilot as running against a test or sandbox environment, not production
- Define "deployment" in the pilot agreement as a controlled environment the client owns or controls

---

## 2.2 Definition of Pilot-Ready

**Current State:** **[DOCUMENTED]** Defined in `docs/pilot/pilot-readiness-brief.md` and `docs/pilot-operations-model.md`.

Per the repository, "pilot-ready" means the enforcement core can be deployed against a defined workflow in a controlled environment and produce verifiable outcomes. It does **not** mean production-ready.

**Pilot-ready checklist from the repository (`docs/pilot/pilot-readiness-brief.md`):**
- One workflow defined by both parties ✓ (process defined, no named client workflow yet)
- Client inputs mapped: action model, approval model, provenance, policy pack reference, deployment environment ✗ (none mapped — awaiting first client engagement)
- Working agreement signed: commercial terms, liability, evidence ownership, DPA ✗ (not in place)
- Deployment environment selected ✗ (not determined)
- Success criteria agreed by both parties ✗ (not defined for any client)

**Evidence:** `docs/pilot/pilot-readiness-brief.md` — "Current Limitation Notice: This is a review-ready core demo, not a production client deployment. No pilot client currently exists."

**Gaps:** Every item requiring named client context (workflow binding, policy encoding, authority-role mapping, deployment topology) is pending first engagement.

**Recommended Discussion Points:**
- Use the Week 1 onboarding process from `docs/pilot-operations-model.md` as the structure for this conversation
- Frame the pilot readiness discussion as defining which of the required inputs Line Axia can supply

---

## 2.3 Gap Between Current State and Pilot-Ready

**[DOCUMENTED]** The repository explicitly lists what must wait for paid pilot scope (`docs/17-pilot-boundary-and-client-binding.md`):

| Item | Status | Notes |
|------|--------|-------|
| Actual client workflow binding | **[OUT OF SCOPE]** | Requires named client input |
| Customer-specific action taxonomy | **[OUT OF SCOPE]** | Requires named client input |
| Customer-specific policy pack encoding | **[OUT OF SCOPE]** | Requires named client input |
| Real system integrations | **[OUT OF SCOPE]** | Requires named client environment |
| Real production hosting topology | **[OUT OF SCOPE]** | Requires client infrastructure decision |
| Real data-flow and DPA mapping | **[OUT OF SCOPE]** | Requires legal review and client context |
| Authority-role mapping to client org | **[OUT OF SCOPE]** | Requires client org chart and approval model |
| Deployment hardening and operational runbooks | **[PLANNED]** | Not yet written |
| Persistent storage | **[PLANNED]** | Not yet implemented |
| Cryptographic signing | **[PLANNED]** | Not yet implemented |
| Third-party security review | **[PLANNED]** | Not yet completed |

**Evidence:** `docs/17-pilot-boundary-and-client-binding.md`, `docs/current_maturity.md`, `docs/pilot/pilot-memo-template.md` (Out of scope section)

---

## 2.4 Relationship Between VeraSeal, Cerba, and CerbaSeal

**Current State:** The name "VeraSeal" does not appear anywhere in this repository. No such entity, product, or system is defined, referenced, or described in any source file, documentation, script, or configuration.

"CerbaSeal" is the product name. "Lamont Labs" is the developer/company name, referenced in `docs/15-eu-deployment-posture.md`.

"Cerba" is not defined as a separate entity in any repository document. It appears to be a prefix forming the compound name "CerbaSeal." No etymology or entity separation is documented.

**Recommended Discussion Points:**
- If Olivia asks about VeraSeal: answer honestly that VeraSeal is not referenced anywhere in the CerbaSeal repository. If there is a separate product or prior relationship involving the VeraSeal name, that context does not exist in this repository and cannot be answered from repository evidence.
- Do not invent or speculate. If the relationship exists, Jesse should be prepared with context not derivable from this repository.

---

## 2.5 Current Deployment Architecture

**Current State:** **[DOCUMENTED]** Four deployment modes are described in `docs/deployment/deployment-modes.md`. None are currently deployed in production.

| Mode | Description | Status |
|------|-------------|--------|
| **Mode 1 — Embedded Library** | Runs inside client application, in-process, lowest latency, no network boundary | **[DOCUMENTED]** |
| **Mode 2 — Internal Service** | HTTP wrapper around `evaluate()`, centralized enforcement, requires network trust | **[DOCUMENTED]** |
| **Mode 3 — Sidecar** | Runs alongside service, enforces before execution, ideal for regulated systems | **[DOCUMENTED]** |
| **Mode 4 — Air-Gapped Evaluation** | Manual submission, offline verification, regulatory use case | **[DOCUMENTED]** |

**Current actual deployment:** Replit-hosted Node.js demo server (`examples/browser-demo/server.ts`). **[DEMO ONLY]**

**Evidence:** `docs/deployment/deployment-modes.md`

**Gaps:** No production deployment in any mode. Mode selection for a pilot requires client infrastructure input.

---

## 2.6 Data Flow Architecture

**Current State:** **[IMPLEMENTED]** as a library; data flow for a production deployment is **[DOCUMENTED]** only.

**Documented data flow from `docs/integration/integration-spec.md`:**

```
[ Upstream System ]
  ↓ constructs GovernedRequest
[ CerbaSeal ExecutionGateService.evaluate() ]
  ↓ produces GateResult (DecisionEnvelope + ReleaseAuthorization or BlockedActionRecord)
[ EvidenceBundleService ]
  ↓ produces EvidenceBundle (request + decision + release + event chain)
[ AppendOnlyLogService ]
  ↓ appends hash-linked audit events
[ Calling System ]
  ↓ reads finalState (ALLOW / HOLD / REJECT)
  ↓ on ALLOW: proceeds with execution
  ↓ on HOLD: requests human approval, resubmits
  ↓ on REJECT: does not execute, stores evidence
```

**Key data characteristics:**
- **[IMPLEMENTED]** CerbaSeal does not make external network calls
- **[IMPLEMENTED]** All evaluation is in-process; no data leaves the process boundary during evaluation
- **[PLANNED]** No persistence — all data exists per process instance only
- **[OUT OF SCOPE]** CerbaSeal does not define what data the GovernedRequest contains about the client's workflow — that is caller-supplied

**Evidence:** `docs/integration/integration-spec.md`, `docs/deployment/deployment-modes.md`

---

## 2.7 Governance Flow Architecture

**Current State:** **[IMPLEMENTED]** as described below.

```
Every GovernedRequest is evaluated against 12 invariants in sequence:
INV-01: policyPackRef present (policy gating)
INV-02: provenanceRef complete (provenance assurance)
INV-03: approvalArtifact valid if required (human authority gate)
INV-04: loggingReady = true (audit readiness obligation)
INV-05: actor is not AI claiming authority (AI authority boundary)
INV-06: GateResult originated from gate (gate integrity)
INV-07: decision envelope flagged immutable (decision record integrity)
INV-08: criticalControlsValid if sensitive workflow (control currency)
INV-09: trustState.trusted = true (trust validation gate)
INV-10: prohibitedUse = false (prohibited use enforcement)
INV-11: requestId non-empty, action class recognized (input integrity)
INV-12: proposal action class matches request action class (proposal binding)

Any invariant failure → REJECT (hard fail) or HOLD (approval-related)
All pass → ALLOW (ReleaseAuthorization issued)
All outcomes → EvidenceBundle generated → AuditLog appended
```

**Evidence:** `docs/governance-vocabulary.md`, `docs/bounded-autonomy-model.md`, `architecture/invariants/invariant-registry.yaml`

---

## 2.8 EU-Hosted Deployment Feasibility

**Current State:** **[DOCUMENTED]** at principle level only. `docs/15-eu-deployment-posture.md` addresses this explicitly.

**What the repository supports in principle:**
- CerbaSeal makes no external network calls (data does not leave the process)
- Evidence bundles are exportable and portable
- Audit entries are independently inspectable
- Replay does not depend on a hidden external service
- All four deployment modes can theoretically operate in EU-hosted infrastructure

**What the repository does NOT claim:**
- Final EU hosting architecture is not defined
- No final GDPR position for any named client
- No DPA language drafted
- No vendor assurance package complete
- No EU legal-entity structure determined

**Open questions per `docs/15-eu-deployment-posture.md`:**
1. Can CerbaSeal run in client-controlled or EU-hosted infrastructure? (Architecturally yes; operationally — requires deployment design)
2. What data, if any, leaves the client environment? (Currently: nothing, because there is no persistence or outbound call — but this is per-demo, not per-production)
3. What vendor-facing documentation can Lamont Labs provide for NIS2 vendor-risk context? (Not yet produced)
4. Does a later EU deployment model require a different legal or commercial structure? (Not answered)

**Recommended Discussion Points:**
- EU-hosted deployment is architecturally compatible in principle, but the exact deployment design, legal structure, and DPA are open questions for pilot scoping — not pre-pilot blockers
- Do not overstate readiness; do not understate compatibility

---

## 2.9 Client-Controlled Deployment Feasibility

**Current State:** **[DOCUMENTED]** as a goal. **[PLANNED]** as an implementation.

Per `docs/15-eu-deployment-posture.md`: "CerbaSeal should be understood as an enforcement layer that is intended to sit inside client workflows, not as a SaaS destination where client data must necessarily flow into a US-hosted system."

Mode 1 (Embedded Library) and Mode 3 (Sidecar) are architecturally suited to client-controlled deployment. Mode 2 (Internal Service) could also run in client infrastructure.

**Current actual state:** The library is a Node.js TypeScript package. A client could, in principle, run it in their own environment. There is no deployment tooling (container images, Helm charts, Terraform, infrastructure scripts) and no hardening for production use.

**Gaps:** Deployment tooling, production hardening, infrastructure documentation, and a reference deployment do not exist in this repository.

---

## 2.10 Operational Support Requirements

**Current State:** **[DOCUMENTED]** in `docs/pilot-operations-model.md`.

**During pilot, support includes:**
- Email support for governance questions and issue investigation
- Weekly review calls (30 minutes scheduled)
- Weekly status update: open issues, resolved issues, enforcement metrics
- Pilot configuration assistance, evidence review, governance review, bug investigation

**Response times (documented):**
| Priority | Definition | Response |
|----------|-----------|----------|
| P1 — System unusable | Pilot environment down or gate not producing outcomes | Same business day |
| P2 — Major pilot impact | Enforcement behavior deviates from invariants | Within 24 hours |
| P3 — General issue | Documentation error, config question | Within 3 business days |
| P4 — Enhancement | Scope expansion | Weekly planning |

**What support does NOT include:**
- Custom feature development outside pilot scope
- Production deployment work
- Regulatory certification or legal compliance opinions
- Integration engineering into client internal systems
- Data migration, data modeling, schema design for production

**Evidence:** `docs/pilot-operations-model.md`

**Risks:** All support is provided by one person (Jesse Lamont). There is no team, no escalation path, no coverage model for sustained unavailability.

---

## 2.11 Third-Party Dependencies

**[IMPLEMENTED]** Runtime dependencies (from `package.json`):
- `tsx` ^4.21.0 — TypeScript execution runtime

**[IMPLEMENTED]** Dev dependencies:
- `typescript` ^5.6.3
- `vitest` ^2.1.8 — test framework
- `@types/node` ^22.10.2

**Assessment:** Dependency surface is minimal. No framework dependencies. No database clients. No authentication libraries. No network clients. No cloud SDK. The enforcement core has no runtime dependency beyond `tsx` and standard Node.js built-ins.

**Third-party services:** None. The demo is hosted on Replit. There is no third-party cloud provider, no SaaS integration, no external API in use.

---

## 2.12 Open-Source Dependencies

All dependencies listed above are open-source. There are no proprietary runtime dependencies.

The `tsx`, `typescript`, `vitest`, and `@types/node` packages are well-maintained, widely-used, permissively licensed open-source projects. No license audit has been formally documented in the repository, but no dependency is commercially restricted.

---

## 2.13 Security Posture

**Current State:** **[IMPLEMENTED]** controls with **[PLANNED]** hardening.

**Implemented security controls (`docs/security/security-review-brief.md`):**

| Control | Implementation | Test Coverage |
|---------|---------------|---------------|
| AI cannot authorize own proposal | INV-05 / absolute invariant | ✓ adversarially tested |
| Approval bound to specific requestId | Security fix 1 | ✓ |
| Approval requirement not caller-suppressible for sensitive workflows | Security fix 2 | ✓ |
| Forged GateResult blocked at evidence layer | WeakSet registry (INV-06 / fix 3) | ✓ |
| Fail-closed on all unexpected exceptions | Security fix 6 | ✓ |
| Input schema and action class validation | INV-11 | ✓ |
| Proposal binding to declared action class | INV-12 | ✓ |
| SHA-256 hash-chained audit log | AppendOnlyLogService | ✓ |
| Evidence bundles deep-cloned at creation | EvidenceBundleService | ✓ |

**Known security limitations (documented, not yet addressed):**
- Audit chain proves consistency, not origin — SHA-256 without HMAC
- `immutableSignature` is non-empty check only; no cryptographic verification
- `loggingReady`, `trustState`, `prohibitedUse` are caller-declared
- `DecisionEnvelope` not frozen at runtime — mutation window exists
- Deterministic IDs — no temporal uniqueness guarantee
- No third-party security review completed
- No access controls on enforcement services
- No rate limiting or abuse prevention
- No cryptographic signing of decision artifacts

**Evidence:** `docs/security/security-review-brief.md`, `docs/09-trust-boundary-and-limitations.md`

---

## 2.14 Trust Model

**Current State:** **[IMPLEMENTED]** with explicitly stated boundaries.

**What CerbaSeal trusts (from `docs/09-trust-boundary-and-limitations.md`):**
- `ExecutionGateService` is invoked by trusted backend logic
- Requests are authenticated and validated upstream
- Identity, authorization, and cryptographic guarantees exist outside this layer
- Caller-supplied fields (`loggingReady`, `trustState.trusted`, `prohibitedUse`) are accurate

**What CerbaSeal does NOT trust:**
- It does not trust that the gate was called. It cannot detect a bypassed gate if the underlying request is valid.
- It does not trust object immutability at runtime — `Object.freeze()` is not called

**Summary from `docs/09-trust-boundary-and-limitations.md`:**

> "CerbaSeal-Core provides enforcement correctness, not execution control. It guarantees: 'If the gate is used, the outcome is correct and provable.' It does not guarantee: 'That the gate was used.'"

**Evidence:** `docs/09-trust-boundary-and-limitations.md`, `docs/current_maturity.md`

---

## 2.15 Operational Risks

| Risk | Severity | Mitigation in Repo | Gap |
|------|----------|-------------------|-----|
| In-memory audit log lost on restart | High | None — stated limitation | Persistent storage required for production |
| Solo founder unavailability | High | 48-hour self-service model documented | No team, no coverage |
| No third-party security review | High | Limitations fully disclosed | External review required before production |
| Caller-supplied field dishonesty | Medium | Documented as trust boundary | No independent verification implemented |
| Gate bypass by trusted caller | Medium | WeakSet blocks forged results; invocation provenance not guaranteed | Caller must be trusted |
| Audit chain fabrication | Medium | Hash chain proves consistency; not origin | HMAC required for origin proof |
| Stale docs | Low | Check 14 in audit script detects stale test counts | Not all fields checked |
| No monitoring | High | None — not implemented | Production monitoring required |

---

---

# SECTION 3: SOLO FOUNDER CAPACITY REVIEW

---

## 3A. How CerbaSeal Reduces Founder Dependency

The repository contains explicit, systematic design choices intended to reduce the amount of founder presence required per engagement.

### Self-Certifying Enforcement State

**[IMPLEMENTED]** Any reviewer — including Olivia, a client's security team, or a regulator — can independently verify the system state without Jesse's involvement:

```bash
pnpm test          # Runs all 372 tests
pnpm audit:repo    # Runs all 14 structural checks
pnpm verify:proof  # Verifies stableChecksum and manifestChecksum
```

The `stableChecksum` (`7695187faf...`) is stable across runs on an unchanged repo. It changes when enforcement state changes. It can be compared across time without founder presence.

Evidence: `README.md`, `scripts/verify-proof.ts`

### Always-Live Review Portal

**[DEMO ONLY — but available 24/7]** The demo at `https://cerbaseal.replit.app/` provides:
- `/` — live REJECT / HOLD / ALLOW demonstration
- `/review` — external reviewer portal with full documentation
- `/pilot` — pilot readiness and intake checklist
- `/security` — security controls inventory and known limitations
- `/deployment` — deployment posture and modes
- `/one-page` — printable one-page system brief

A reviewer can read all governance documentation, run the enforcement demo, and form an accurate view of system capabilities without a meeting.

Evidence: `examples/browser-demo/`, `docs/status/current-state.md`

### Support-Readiness Utilities

**[IMPLEMENTED]** Four support surfaces reduce routine support burden:

1. **Health check** — confirms core runtime checks pass (`pnpm demo:support`)
2. **Integrity verification** — verifies demo scenarios, replay consistency, evidence chain shape
3. **Operator action mapping** — converts reason codes into recommended next actions
4. **Pilot-safe mode profile** — defines a constrained operating profile

Evidence: `docs/operations/solo-support-risk-reduction.md`, `examples/support-readiness/`

### Documented Issue Process

**[DOCUMENTED]** `docs/pilot-operations-model.md` defines:
- Every issue receives an ID, severity level, date, status, and resolution notes
- No issue is considered received without an ID in the queue
- Verbal-only issues do not exist
- Weekly queue shared with pilot participant

A structured issue queue is independent of founder memory — the process can run even when Jesse is not immediately available.

### Documented Founder Unavailability Protocol

**[DOCUMENTED]** `docs/pilot-operations-model.md` defines what happens during up to 48-hour unavailability:

- All self-service items remain accessible (demo, docs, proof snapshot, audit script)
- Issue queue reviewed on return
- P1/P2 handled first, in severity order
- P3/P4 handled within standard windows from return date

### Fail-Closed Safe Default

**[IMPLEMENTED]** The system's safe failure mode is non-execution. When the system cannot authorize, it HOLDS or REJECTs. It does not fail open. An inattentive or temporarily unavailable founder does not create a path to unauthorized execution — the gate's safety posture is conservative by design.

Evidence: `docs/operations/solo-support-risk-reduction.md`

### Documented Evidence Artifacts

**[IMPLEMENTED]** Every ALLOW, HOLD, and REJECT produces an evidence bundle. Evidence bundles are exportable via `pnpm export:proof`. Pilot participants keep all pilot artifacts. Evidence can be reviewed, replayed, and verified independently.

Evidence: `docs/pilot-operations-model.md` (Exit Deliverables)

---

## 3B. Remaining Founder Risks

These risks are present in the repository and cannot be mitigated by documentation alone.

### Risk 1: Single Point of Failure for Code Changes

**Status:** Unmitigated in this repository.

Any bug fix, configuration change, or scope extension requires Jesse. There is no second developer, no documented handoff process, no contributor model, and no succession plan visible in this repository.

For P1/P2 issues requiring live code changes, there is no fallback.

### Risk 2: No Sustained Unavailability Coverage

**Status:** 48 hours documented; beyond that — unaddressed.

The pilot operations model defines a 48-hour self-service model. What happens if Jesse is unavailable for a week due to illness, family emergency, or travel in a different timezone? The repository does not answer this.

### Risk 3: No Organizational Continuity

**Status:** Unaddressed.

CerbaSeal is a Lamont Labs product with one named person. If Jesse is unable to continue, there is no documented transition plan, no escrow for the codebase (the GitHub repo exists but no active management plan), and no SLA backup.

### Risk 4: Support Commitment vs. Capacity

**Status:** Documented commitments exist; capacity is one person.

The support commitments in `docs/pilot-operations-model.md` (weekly calls, tracked issues, response times, weekly status updates, final report) are reasonable and well-defined. For a single client pilot, they are operationally achievable by one person. For concurrent pilots, they become a capacity risk.

### Risk 5: No QA Layer Independent of Founder

**Status:** Partially mitigated.

The automated test suite (`pnpm test`), repo audit (`pnpm audit:repo`), and CI pipeline (`.github/workflows/audit.yml`) provide automated quality gates. However, any change to the codebase is only reviewed by Jesse. There is no independent code review process.

### Risk 6: Integration Engineering Is Founder-Dependent

**Status:** Unavoidable at current stage.

Adapting CerbaSeal to a client's actual workflow — mapping request fields, constructing GovernedRequest objects from client events, configuring the approval model — requires developer work by Jesse. This is not self-service. It is the core of what a paid pilot engagement requires.

---

---

# SECTION 4: COMMERCIAL DISCUSSION PREPARATION

---

## Assets Contributed by Lamont Labs

These items exist in the repository and represent Lamont Labs' contribution to any pilot engagement:

**[IMPLEMENTED] Enforcement Core:**
- `ExecutionGateService` — the enforcement gate
- `AppendOnlyLogService` — hash-chained audit log
- `EvidenceBundleService` — evidence bundle assembly
- `DiagnosticReportService` — structured reason-code diagnostics
- All 12 invariants and their enforcement logic
- Fail-closed error handling architecture
- 372 passing tests including adversarial and hostile boundary tests
- 14-check repo audit system
- Proof export and verification scripts

**[DEMO ONLY] Demonstration Surfaces:**
- Hosted live demo (`https://cerbaseal.replit.app/`)
- Browser demo with REJECT / HOLD / ALLOW scenarios
- Review and pilot portal (5 pages)
- Consumer, agent-gate, auditor-view examples

**[DOCUMENTED] Process and Governance Documentation:**
- Pilot operations model (onboarding, issue handling, response times, exit deliverables)
- Pilot memo template and intake checklist
- Governance vocabulary (invariant-to-enterprise mapping)
- Bounded autonomy model
- Trust boundary and limitations (no softening)
- EU deployment posture
- Integration specification
- Deployment modes documentation
- Security review brief

---

## Assets Contributed by Line Axia (Required for Pilot)

The following are **[OUT OF SCOPE]** from this repository and must come from Line Axia for a pilot to proceed:

- **Workflow definition:** What workflow is being governed? What decision point does the pilot protect?
- **Action taxonomy:** What action classes are relevant to their system? (The current recognized classes are generic: `allow`, `hold`, `reject`, `escalate`, `account_hold`)
- **Approval model:** Who approves HOLD outcomes? What authority classes exist in their organization? What constitutes a valid approval artifact?
- **Provenance source:** What AI model or decision system generates proposals? What are the model version, rule set version, and source hash fields?
- **Policy pack reference:** What policy document or version governs this workflow?
- **Deployment environment:** Where will the pilot run? Client-controlled? EU-hosted? Replit sandbox?
- **Evidence requirements:** What must be retained? Who owns pilot evidence records?
- **Integration touchpoints:** What system calls CerbaSeal? What system receives the decision?
- **Success criteria:** What does "governance working" look like for their workflow?

---

## Areas Requiring Clarification Before Pilot

1. **Commercial terms:** No commercial agreement exists. Pilot pricing, IP ownership, and revenue terms are not defined in this repository.
2. **Evidence ownership:** Who owns the evidence bundles produced during the pilot? `docs/pilot-operations-model.md` states "the pilot participant keeps all pilot artifacts" — but this requires a written agreement.
3. **Data processing:** If Line Axia's workflow data flows through CerbaSeal during the pilot, a DPA may be required. This is an open question per `docs/15-eu-deployment-posture.md`.
4. **Liability boundary:** Not defined anywhere in the repository. Must be in the working agreement.
5. **Version freeze:** What version of CerbaSeal is frozen for the pilot? What happens if a bug fix requires a version change?

---

## IP Considerations

**What is clear from the repository:**
- CerbaSeal is a Lamont Labs product
- The repository is not open-source (no LICENSE file is referenced in the repository survey)
- The enforcement core, documentation, and demo artifacts are Lamont Labs IP

**What is not addressed in the repository:**
- Exclusivity — no mention of whether CerbaSeal can be offered to competing clients in the same space
- Licensing model — no commercial license, SaaS terms, or usage rights are defined
- White-labeling — no mention of whether Line Axia can rebrand or embed the enforcement core
- Client data produced during a pilot — ownership and use rights are not defined

**Recommendation:** Do not make any IP, exclusivity, or licensing commitment in this discussion without legal review. State clearly that commercial terms require a separate agreement.

---

## Exclusivity Considerations

**From repository evidence:** Nothing in the repository grants or promises exclusivity to any client. The pilot operations model is designed for a generic "pilot participant" model — not a client-exclusive relationship.

**Discussion point:** If Line Axia is expecting exclusivity in their industry vertical, this is a commercial term that has no current basis in the repository and would need to be negotiated and written into a formal agreement.

---

## Questions Jesse Should Ask

1. **What is the specific workflow you want to govern?** (Without this, no pilot can be scoped)
2. **What is the action that needs to be protected?** (What would happen if an unauthorized AI action executed?)
3. **Who, in your organization, can approve HOLD outcomes?** (Authority model needed)
4. **Where would this pilot run?** (Client-controlled? EU-hosted? Sandbox? Replit?)
5. **What data cannot leave your environment?** (Critical for DPA and deployment design)
6. **What does pilot success look like to you?** (What would make this worth proceeding to production?)
7. **What is your timeline?** (Week 1 scoping assumes a specific kickoff — when can that happen?)
8. **Who is the technical counterpart?** (Jesse needs an integration contact on Line Axia's side)
9. **What is your existing approval process?** (To map existing authority classes to CerbaSeal's approval model)
10. **Is there a regulatory framework driving this decision?** (DORA, NIS2, GDPR, internal compliance?)
11. **What is the procurement and contracting process on your side?** (Working agreement timelines)
12. **Are you expecting exclusivity in any vertical?** (Get this on the table early)

---

## Questions Olivia Is Likely to Ask

1. What is CerbaSeal, and what does it actually do in production?
2. What is your deployment model — is this a service we subscribe to, or code we run ourselves?
3. How do we know the enforcement logic is correct and hasn't been tampered with?
4. What happens if you (Jesse) are unavailable?
5. Has this been security reviewed by a third party?
6. Can this run in our environment without data leaving our systems?
7. What does the pilot process look like, step by step?
8. What are the commercial terms?
9. Who owns the evidence records produced during the pilot?
10. What are the limitations we should know about before committing?
11. What is the relationship between CerbaSeal and VeraSeal? *(be prepared for this — see Section 2.4)*
12. What does the working agreement look like?
13. What happens at the end of the pilot?
14. What would the production version require that the pilot version doesn't have?
15. How do we know a successful pilot would actually lead to a production-ready product?

---

---

# SECTION 5: GAP ANALYSIS

---

| Area | Implemented | Partially Implemented | Planned | Not Implemented |
|------|-------------|----------------------|---------|-----------------|
| **DEPLOYMENT** | | | | |
| Library/in-process mode architecture | ✓ | | | |
| Demo environment (Replit) | ✓ (demo only) | | | |
| Production infrastructure | | | ✓ | |
| Persistent storage | | | ✓ | |
| Container/deployment tooling | | | | ✓ |
| Infrastructure runbook | | | | ✓ |
| Production monitoring/alerting | | | ✓ | |
| Secrets management | | | ✓ | |
| **GOVERNANCE** | | | | |
| Enforcement gate (12 invariants) | ✓ | | | |
| Fail-closed error handling | ✓ | | | |
| Evidence bundle generation | ✓ | | | |
| Hash-chained audit log | ✓ (in-memory) | | ✓ (persisted) | |
| Deterministic/replayable outcomes | ✓ | | | |
| Proof export + verification | ✓ | | | |
| Client-specific workflow binding | | | ✓ | |
| Policy pack content/resolution | | | ✓ | |
| **SECURITY** | | | | |
| AI non-authority enforcement | ✓ | | | |
| Approval binding to requestId | ✓ | | | |
| Gate bypass prevention (WeakSet) | ✓ | | | |
| Adversarial test coverage | ✓ | | | |
| Cryptographic signing | | | ✓ | |
| HMAC-anchored audit chain | | | ✓ | |
| Third-party security review | | | ✓ | |
| Object freeze at runtime | | ✓ (documented, not frozen) | ✓ | |
| Identity provider integration | | | ✓ | |
| Caller field independent verification | | | ✓ | |
| Rate limiting / abuse prevention | | | ✓ | |
| **SUPPORT** | | | | |
| Support model documented | ✓ | | | |
| Response times documented | ✓ | | | |
| Support-readiness utilities | ✓ | | | |
| Operator action mapping (reason codes) | ✓ | | | |
| Formal SLA | | | | ✓ |
| Second-person coverage | | | | ✓ |
| 24/7 support | | | | ✓ |
| **DOCUMENTATION** | | | | |
| Governance vocabulary | ✓ | | | |
| Bounded autonomy model | ✓ | | | |
| Trust boundary and limitations | ✓ | | | |
| EU deployment posture (principle) | ✓ | | | |
| Integration specification | ✓ | | | |
| Deployment modes | ✓ | | | |
| Pilot operations model | ✓ | | | |
| Pilot intake checklist | ✓ | | | |
| Security review brief | ✓ | | | |
| NIS2/GDPR vendor assurance package | | | ✓ | |
| Production deployment runbook | | | | ✓ |
| **CONTINUITY** | | | | |
| Proof snapshot exportable/verifiable | ✓ | | | |
| Self-service documentation | ✓ | | | |
| Always-live demo portal | ✓ (demo) | | | |
| Automated repo audit | ✓ | | | |
| CI pipeline (GitHub Actions) | ✓ | | | |
| Second developer | | | | ✓ |
| Organizational succession plan | | | | ✓ |
| Escrow / source code continuity | | | | ✓ |
| **VERIFICATION** | | | | |
| stableChecksum | ✓ | | | |
| verify:proof script | ✓ | | | |
| 14-check audit suite | ✓ | | | |
| External attestation of gate invocation | | | ✓ | |
| **AUDITABILITY** | | | | |
| Hash-chained audit log | ✓ (in-memory) | | ✓ (persistent) | |
| Evidence bundles for all outcomes | ✓ | | | |
| Replay validation | ✓ | | | |
| Export manifest | ✓ | | | |
| Persistent audit database | | | ✓ | |
| External audit chain signing | | | ✓ | |
| **PILOT OPERATIONS** | | | | |
| Pilot operations model | ✓ | | | |
| Onboarding process defined | ✓ | | | |
| Issue handling process | ✓ | | | |
| Exit deliverables defined | ✓ | | | |
| Named pilot client | | | | ✓ |
| Working agreement | | | | ✓ |
| Commercial terms | | | | ✓ |

---

---

# SECTION 6: THE HARDEST QUESTIONS

The following are the 25 hardest questions a skeptical technical or regulatory partner could ask. Each is answered from repository evidence only.

---

**Q1. Can the enforcement gate be bypassed?**

*Honest Answer:* A trusted internal caller can bypass `ExecutionGateService.evaluate()`. If the caller constructs a valid GovernedRequest, passes it to the gate, and receives a genuine GateResult — but then throws that GateResult away and manually constructs a replacement — CerbaSeal cannot detect this. The `WeakSet` registry blocks *forged* GateResults (objects not produced by the gate), but it cannot detect a gate call that was made and then ignored.

*Repository Evidence:* `docs/09-trust-boundary-and-limitations.md`, Section 1 (Gate Invocation Provenance)

*Risk If Answered Poorly:* If you claim the gate cannot be bypassed under any circumstances, a technical reviewer will find this limitation in the code and lose trust in the entire claim set.

---

**Q2. Can the audit trail be fabricated?**

*Honest Answer:* Yes, with effort. The SHA-256 hash chain proves internal consistency — that no events were added, removed, or reordered within the chain. However, the hash algorithm is public and unsalted. A fully fabricated audit chain with correctly recomputed hashes will pass `verifyChain()`. The chain proves consistency, not origin.

*Repository Evidence:* `docs/09-trust-boundary-and-limitations.md`, Section 3 (Audit Chain Authenticity); `docs/current_maturity.md`

*Risk If Answered Poorly:* Claiming the audit chain is cryptographically unforgeable would be false and checkable.

---

**Q3. What happens to all audit data when the server restarts?**

*Honest Answer:* It is lost. The audit log is entirely in-memory. There is no persistence layer. A process restart produces an empty log.

*Repository Evidence:* `README.md` (Known Limitations), `docs/security/security-review-brief.md`

*Risk If Answered Poorly:* For any regulated use case, this is a showstopper if misrepresented as a minor limitation.

---

**Q4. Has a third-party security firm reviewed this?**

*Honest Answer:* No. CerbaSeal has been adversarially tested internally, and the test results are documented and verifiable. Seven security fixes were applied following an internal hostile audit. No external security firm has reviewed the codebase.

*Repository Evidence:* `docs/security/security-review-brief.md`: "No third-party security review has been completed."

*Risk If Answered Poorly:* For a financial services or regulated context, this will be a hard requirement before production. Implying it has been done would be false.

---

**Q5. What is your identity model? How do you know who is approving actions?**

*Honest Answer:* CerbaSeal has no identity provider. Actor identity (`authorityClass`, `approverAuthorityClass`) is caller-supplied with no independent attestation. The system verifies that the approval *structure* is correct — the right authority class, the right requestId binding, a non-empty signature field — but it does not independently verify the identity of the approver.

*Repository Evidence:* `docs/09-trust-boundary-and-limitations.md`, `docs/security/security-review-brief.md`

*Risk If Answered Poorly:* Claiming identity verification is misleading. The system verifies approval *shape*, not approver *identity*.

---

**Q6. The immutableSignature field — is the signature actually verified cryptographically?**

*Honest Answer:* No. `immutableSignature` is checked for presence (non-empty string). Any non-empty string passes. There is no cryptographic signature verification.

*Repository Evidence:* `docs/security/security-review-brief.md`: "immutableSignature content is not cryptographically verified — any non-empty string passes."

*Risk If Answered Poorly:* If a technical reviewer tests this, they will immediately see that a string like `"abc"` passes the approval check.

---

**Q7. What prevents a calling system from lying about loggingReady, trustState, or prohibitedUse?**

*Honest Answer:* Nothing. These fields are caller-declared. CerbaSeal does not independently verify them. A dishonest caller can set `loggingReady: true` when no logging system is connected, set `trustState.trusted: true` when trust has not been validated, or set `prohibitedUse: false` for a request that is genuinely prohibited.

*Repository Evidence:* `docs/security/security-review-brief.md` (Current Non-Claims): "Protection against malicious caller-supplied fields (loggingReady, trustState, prohibitedUse are all caller-declared)" is explicitly not claimed.

*Risk If Answered Poorly:* These are legitimate regulatory concerns about any enforcement system. Misrepresenting this would undermine the entire trust model discussion.

---

**Q8. Can the same approval be reused for multiple requests?**

*Honest Answer:* No — this was a discovered vulnerability that was fixed. The `ApprovalArtifact` is bound to a specific `requestId` via `forRequestId`. If `forRequestId !== requestId`, the approval is rejected. This was security fix 1, applied after an internal hostile audit.

*Repository Evidence:* `docs/status/current-state.md` (Security Fixes Applied, Fix 1); `docs/security/security-review-brief.md`

*Risk If Answered Poorly:* This is actually a strength. Answer it correctly and it demonstrates that the system has been internally stress-tested.

---

**Q9. What does GDPR compliance look like for data processed through CerbaSeal?**

*Honest Answer:* Not addressed in this repository for any named client or workflow. The architecture is compatible with a privacy-respecting deployment (no external calls, data stays in process), but no GDPR analysis, DPA, or privacy impact assessment has been performed. EU deployment posture is documented at the architectural principle level only.

*Repository Evidence:* `docs/15-eu-deployment-posture.md`: "This repository does not claim: final GDPR position for a named client, final DPA language."

*Risk If Answered Poorly:* Any claim of GDPR compliance would be false and potentially serious.

---

**Q10. What happens when a bug is found in production that causes enforcement to fail?**

*Honest Answer:* Jesse investigates it as a P1 or P2 issue and applies a fix. There is no second developer, no on-call rotation, no SLA with legal backing, and no organizational escalation path. Response commitment is same-business-day (P1) or 24 hours (P2), with the restart-date provision for extended unavailability.

*Repository Evidence:* `docs/pilot-operations-model.md`

*Risk If Answered Poorly:* Do not imply organizational support infrastructure that does not exist.

---

**Q11. How do we know the enforcement state hasn't changed between when you sent us the proof snapshot and now?**

*Honest Answer:* Re-run `pnpm verify:proof`. The `stableChecksum` is a SHA-256 hash of all enforcement-state fields — test results, audit checks, invariant coverage, validator assertions — excluding timestamps. If enforcement state has not changed, the checksum will match. If it has changed, the checksum will differ and the script will exit non-zero.

*Repository Evidence:* `scripts/verify-proof.ts`, `README.md`, `docs/reports/proof-snapshot.json`

*Risk If Answered Poorly:* This is actually one of CerbaSeal's strongest points. Answer it precisely and demonstrate it.

---

**Q12. What is your commercial model? Who owns the IP? What are we licensing?**

*Honest Answer:* None of this is defined in the repository. There is no commercial license, no pricing model, no IP assignment, no SaaS terms. These are open questions that require a working agreement.

*Repository Evidence:* No LICENSE file referenced, no commercial terms document present.

*Risk If Answered Poorly:* Making an improvised commitment in this meeting could create obligations without legal review.

---

**Q13. What does "deterministic" mean in practice? Can two identical requests ever produce different outcomes?**

*Honest Answer:* On the same version of the codebase with the same inputs, yes — identical requests produce identical outcomes. The enforcement logic is purely functional: no randomness, no external state, no time-dependent evaluation. Replay is tested explicitly. The stableChecksum confirms this property across runs.

*Repository Evidence:* `docs/one-page.md`, `README.md`, `docs/governance-vocabulary.md` (Deterministic enforcement)

*Risk If Answered Poorly:* This is a genuine strength. State it precisely.

---

**Q14. What is the relationship between the demo fraud triage workflow and a real Line Axia workflow?**

*Honest Answer:* None — yet. The fraud triage scenario in the demo is a reference construct built specifically for demonstration purposes. It is not derived from any real client workflow. Mapping the enforcement model to a Line Axia workflow is pilot work.

*Repository Evidence:* `docs/bounded-autonomy-model.md` (Reference Scenario section): "To make the model concrete, the following describes how the bounded autonomy model applies to the reference fraud triage workflow included in CerbaSeal's demonstration environment."

*Risk If Answered Poorly:* Implying the demo IS a Line Axia workflow would be inaccurate.

---

**Q15. What is your uptime SLA?**

*Honest Answer:* None exists. The only current deployment is Replit-hosted demo infrastructure. There is no SLA, no uptime guarantee, no managed hosting, and no infrastructure commitment. Pilot support commits to response times for issue investigation, not to uptime guarantees.

*Repository Evidence:* `docs/operations/solo-support-risk-reduction.md`: "This does not provide: production SLA, insurance."

---

**Q16. What changed between the proof snapshot date (May 11, 2026) and today?**

*Honest Answer:* The proof snapshot was generated on commit `7d3b0920d7e6b38e6347b96f8211d550a47b97d0`. Subsequent commits have added shared CSS, animations, governance docs, check 14 to the audit script, and the `verify:proof` script. The stableChecksum in the current repo will differ from the snapshot because audit check count changed (13→14). Re-running `pnpm export:proof` produces an updated snapshot.

*Repository Evidence:* `docs/reports/proof-snapshot.json` (generatedAt: 2026-05-11), `scripts/verify-proof.ts`

*Risk If Answered Poorly:* Know the delta. Do not claim the snapshot is current if it is stale.

---

**Q17. Can CerbaSeal enforce that an action was NOT executed, not just that it was not authorized?**

*Honest Answer:* No. CerbaSeal enforces the authorization decision and produces a ReleaseAuthorization. Whether the calling system actually respects that authorization and does not execute on a REJECT — that is the responsibility of the calling system. CerbaSeal cannot reach into a downstream execution layer and prevent execution.

*Repository Evidence:* `docs/13-non-bypassability-model.md`, `docs/architecture/enforcement-boundary.md`

*Risk If Answered Poorly:* This is the deepest architectural limitation. State it clearly.

---

**Q18. Is CerbaSeal NIS2-compliant? DORA-compliant?**

*Honest Answer:* No compliance certification of any kind is claimed or present in this repository. The architecture is designed to be compatible with governance and audit requirements, and the governance vocabulary provides regulatory mapping language — but no formal compliance analysis, certification, or qualified legal opinion has been performed.

*Repository Evidence:* `docs/security/security-review-brief.md`: "CerbaSeal does NOT claim: legal or regulatory compliance certification."

---

**Q19. What does the actor know about why their action was rejected?**

*Honest Answer:* They receive a `BlockedActionRecord` containing the `finalState` (REJECT or HOLD), the specific `reason` code (e.g., `AI_CANNOT_AUTHORIZE`, `REQUIRED_APPROVAL_MISSING`, `CONTROL_STALE_OR_INVALID`), and a `diagnosticReport` with invariant-level tracing. The operator action mapping converts these reason codes into recommended next actions. Diagnostic output is designed to be readable without founder involvement.

*Repository Evidence:* `docs/governance-vocabulary.md` (Reason Code table), `docs/operations/solo-support-risk-reduction.md`

*Risk If Answered Poorly:* This is a strength — the system produces actionable diagnostic output, not opaque rejections.

---

**Q20. What if we need a custom action class that CerbaSeal doesn't recognize?**

*Honest Answer:* An unrecognized action class triggers INV-11 (`UNKNOWN_ACTION_CLASS`) and is rejected. The recognized action classes in the current codebase are: `allow`, `hold`, `reject`, `escalate`, `account_hold`. Adding a new recognized action class requires a code change by Jesse.

*Repository Evidence:* `docs/bounded-autonomy-model.md`, INV-11, `docs/governance-vocabulary.md`

---

**Q21. Why should we trust a system with no organizational backing?**

*Honest Answer:* The basis for trust is the repository itself, not the organization. The invariants are verifiable code. The tests are re-runnable. The stableChecksum is independently computable. The known limitations are stated without softening. A reviewer who finds a discrepancy between the documentation and the code should stop the discussion — and so should Jesse.

The organizational risk is a real risk, separately documented in the pilot operations model as the founder-dependency section.

*Repository Evidence:* `docs/current_maturity.md`, `docs/09-trust-boundary-and-limitations.md`

---

**Q22. What if we discover a security vulnerability during the pilot?**

*Honest Answer:* It enters the issue queue as a P1/P2 Security Concern with same-business-day or 24-hour response commitment. The vulnerability is investigated, a fix is developed, and the fix is documented. The pilot participant is notified immediately. The pilot scope document and change log are updated.

*Repository Evidence:* `docs/pilot-operations-model.md` (Issue categories: "Security concern — a potential vulnerability or trust model gap")

---

**Q23. The enforcement core is in TypeScript. Would a production system be in TypeScript?**

*Honest Answer:* The repository does not commit to a production language. The current proof of concept is TypeScript/Node.js. Language selection for a production system would be part of deployment design in the pilot phase. TypeScript is fully viable for production Node.js services; however, no production deployment exists against which to evaluate this question.

*Repository Evidence:* `package.json`, `tsconfig.json`

---

**Q24. How do we know you haven't changed the enforcement logic since the proof snapshot was generated?**

*Honest Answer:* Run `git log` to see all commits since the snapshot. Run `pnpm verify:proof` against the current snapshot — if enforcement state changed, the stableChecksum will not match. Run `pnpm audit:repo` to confirm 14/14 checks pass. The combination of version control history, stableChecksum verification, and live repo audit provides a transparent, auditable record.

*Repository Evidence:* `scripts/verify-proof.ts`, `scripts/repo-audit.ts`, `.github/workflows/audit.yml`

---

**Q25. What would it take to go from pilot to production?**

*Honest Answer:* Based on the repository's own documented gaps, production would require at minimum: (1) persistent storage layer, (2) cryptographic signing of decision artifacts, (3) HMAC-anchored audit chain, (4) identity provider integration or integration spec, (5) third-party security review, (6) production deployment hardening (infrastructure, secrets management, access control, rate limiting), (7) monitoring and alerting, (8) a completed pilot that demonstrates the enforcement model is compatible with the target workflow. None of these are currently implemented.

*Repository Evidence:* `docs/current_maturity.md` (Production hardening is incomplete), `docs/security/security-review-brief.md`

*Risk If Answered Poorly:* Do not imply production readiness is one sprint away. The list above is substantial.

---

---

# SECTION 7: OLIVIA AGENDA RESPONSE GUIDE

The following covers the deployment-related topics expected in the Olivia Aréchiga discussion. For each topic, a recommended answer, supporting evidence, overstatement risks, and likely follow-ups are provided.

---

### Topic 1: Current Deployment Readiness

**Recommended Answer:**
CerbaSeal's enforcement core is fully implemented and verified. The current deployment is a Replit-hosted demonstration. There is no production deployment. A pilot would run against a test or sandbox environment that Line Axia controls, not a production system.

**Supporting Evidence:**
- `README.md` ("The hosted demo is intentionally scoped as a demonstration surface. It is not a production system.")
- `docs/current_maturity.md`
- `docs/deployment/deployment-modes.md`

**What Not to Overstate:**
- Do not imply the Replit demo is production infrastructure
- Do not imply deployment is ready to happen without additional work
- Do not imply specific infrastructure readiness for Line Axia's environment

**Follow-up Questions Likely to Appear:**
- What would we need to deploy this in our environment?
- Is this a service or a library?
- Who owns the infrastructure during the pilot?

---

### Topic 2: Definition of Pilot-Ready

**Recommended Answer:**
Pilot-ready means the enforcement core can evaluate governed requests for a defined workflow in a controlled environment and produce verifiable REJECT / HOLD / ALLOW outcomes with evidence. It does not mean production-ready. The pilot requires Line Axia to provide the workflow definition, action model, approval model, and deployment environment. We supply the enforcement layer, documentation, and support model.

**Supporting Evidence:**
- `docs/pilot/pilot-readiness-brief.md`
- `docs/pilot-operations-model.md`
- `docs/pilot/pilot-memo-template.md`

**What Not to Overstate:**
- Do not imply the pilot requires minimal input from Line Axia — it requires substantial input
- Do not imply production readiness follows automatically from pilot success

**Follow-up Questions Likely to Appear:**
- What do we need to provide for the pilot to start?
- What is the timeline from "agreement signed" to "pilot running"?

---

### Topic 3: Gap Between Current State and Pilot-Ready

**Recommended Answer:**
The enforcement core is ready. What is not ready is the client-specific layer: which of your workflows we're governing, your authority model, your approval process, your deployment environment, and your success criteria. Those are defined in Week 1 of the onboarding process. Once we have those inputs, configuration takes place in Week 2. Evidence review and gap analysis in Week 3. Pilot report in Week 4.

**Supporting Evidence:**
- `docs/17-pilot-boundary-and-client-binding.md`
- `docs/pilot-operations-model.md` (Week 1 onboarding structure)
- `docs/pilot/pilot-readiness-brief.md` (Required Client Inputs)

**What Not to Overstate:**
- Do not imply the Week 1 scope is already defined for Line Axia's workflow

**Follow-up Questions Likely to Appear:**
- Can you walk us through what Week 1 looks like?
- What decisions do we need to have made before Week 1?

---

### Topic 4: Relationship Between VeraSeal, Cerba, and CerbaSeal

**Recommended Answer:**
"VeraSeal" does not appear in this repository. CerbaSeal is the product. Lamont Labs is the company. "Cerba" is the first syllable of the CerbaSeal product name — it is not a separate entity in the codebase or documentation. If there is context about VeraSeal from a prior conversation or relationship, Jesse should address that directly from personal knowledge rather than from repository evidence.

**Supporting Evidence:**
- `docs/15-eu-deployment-posture.md` (mentions Lamont Labs)
- No "VeraSeal" reference found in any repository file

**What Not to Overstate:**
- Do not invent a relationship between VeraSeal and CerbaSeal if none exists
- Do not speculate if you do not know

**Follow-up Questions Likely to Appear:**
- Is CerbaSeal a rebrand of something else?
- Is there a parent company or prior product relationship?

---

### Topic 5: Current Deployment Architecture

**Recommended Answer:**
CerbaSeal is a TypeScript/Node.js enforcement library. It runs as an in-process module (embedded library mode), as an HTTP-wrapped service, as a sidecar, or in an air-gapped evaluation mode. The correct mode for a Line Axia pilot depends on your infrastructure. All four modes are architecturally documented. None are currently deployed in production.

**Supporting Evidence:**
- `docs/deployment/deployment-modes.md`
- `docs/integration/integration-spec.md`

**What Not to Overstate:**
- Do not claim a mode has been production-deployed
- Do not claim HTTP service or sidecar scaffolding exists as ready-to-deploy code — the modes are architectural documentation

---

### Topic 6: Data Flow Architecture

**Recommended Answer:**
An upstream system constructs a GovernedRequest and calls `ExecutionGateService.evaluate()`. CerbaSeal evaluates it against 12 invariants. The result — ALLOW, HOLD, or REJECT — flows back to the calling system along with a structured evidence bundle. CerbaSeal makes no external network calls. All processing is in-memory within the process boundary. Nothing leaves the deployment environment during evaluation.

**Supporting Evidence:**
- `docs/integration/integration-spec.md`
- `docs/deployment/deployment-modes.md`

**What Not to Overstate:**
- Data persistence does not currently exist — if Line Axia requires audit data to be retained across sessions, that is a gap

---

### Topic 7: Governance Flow Architecture

**Recommended Answer:**
Every request passes through 12 sequential invariant checks: policy gating, provenance assurance, human authority gate, audit readiness, AI authority boundary, gate integrity, decision record integrity, control currency, trust validation, prohibited use enforcement, input integrity, and proposal binding. One failure at any point produces HOLD or REJECT. All pass means ALLOW. Every outcome produces an evidence bundle that is hash-linked to the audit log.

**Supporting Evidence:**
- `docs/governance-vocabulary.md`
- `docs/bounded-autonomy-model.md`
- `architecture/invariants/invariant-registry.yaml`

---

### Topic 8: EU-Hosted Deployment Feasibility

**Recommended Answer:**
Architecturally, yes. CerbaSeal makes no external calls and has no dependency on US-hosted infrastructure. Data does not leave the process boundary during evaluation. A client-controlled or EU-hosted deployment is the intended model — not a SaaS destination. The exact deployment design, hosting selection, legal structure, and DPA are open questions for pilot scoping. No final EU hosting architecture, GDPR position, or DPA language has been defined.

**Supporting Evidence:**
- `docs/15-eu-deployment-posture.md`
- `docs/deployment/deployment-modes.md`

**What Not to Overstate:**
- Do not claim GDPR compliance
- Do not claim a specific EU hosting solution exists
- Do not claim a DPA template is ready

**Follow-up Questions Likely to Appear:**
- What data protection agreement would we need?
- Are you registered as a data processor in the EU?

---

### Topic 9: Client-Controlled Deployment Feasibility

**Recommended Answer:**
Yes — this is the intended model. CerbaSeal is a library that runs in your infrastructure, not a service where your data flows to our servers. Mode 1 (embedded library) and Mode 3 (sidecar) both run entirely within client infrastructure. The pilot would run in an environment you own or control.

**Supporting Evidence:**
- `docs/15-eu-deployment-posture.md`
- `docs/deployment/deployment-modes.md`

**What Not to Overstate:**
- Do not imply there is deployment tooling ready (no Helm, Terraform, Docker configurations exist in the repository)

---

### Topic 10: Operational Support Requirements

**Recommended Answer:**
During the pilot: email support, weekly 30-minute review calls, tracked issue queue, weekly status updates. Response times are P1 same business day, P2 within 24 hours, P3 within 3 business days. All issues are assigned IDs and tracked. The pilot participant can verify enforcement state, read evidence bundles, and re-run the audit independently without waiting for me.

**Supporting Evidence:**
- `docs/pilot-operations-model.md`

**What Not to Overstate:**
- Do not imply there is a team, an on-call rotation, or a formal SLA
- Be direct about the solo-founder model

---

### Topic 11: Third-Party Dependencies

**Recommended Answer:**
The runtime dependency surface is minimal: `tsx` for TypeScript execution, `typescript` for compilation, `vitest` for testing, and Node.js built-ins. No database clients, no cloud SDKs, no authentication libraries, no external service dependencies. The enforcement core has no third-party runtime calls.

**Supporting Evidence:**
- `package.json`
- `docs/deployment/deployment-modes.md`

---

### Topic 12: Open-Source Dependencies

**Recommended Answer:**
All dependencies are open-source and permissively licensed. No commercial dependencies. No proprietary runtime components.

---

### Topic 13: Security Posture

**Recommended Answer:**
CerbaSeal has been adversarially tested internally. Seven security vulnerabilities were discovered and fixed in a hostile self-audit before any external review. The security controls cover AI non-authority enforcement, approval binding, gate bypass prevention, and fail-closed behavior. Known limitations are fully documented: no cryptographic signing, no third-party review, caller-declared trust fields, in-memory audit log. No third-party security review has been completed. For production in a regulated environment, that review would be required.

**Supporting Evidence:**
- `docs/security/security-review-brief.md`
- `docs/status/current-state.md` (Security Fixes 1–7)

---

### Topic 14: Trust Model

**Recommended Answer:**
CerbaSeal assumes it is called by trusted application code. It enforces that *if* the gate is used, the outcome is correct and provable. It cannot guarantee that the gate was used. Identity, authentication, and upstream validation are the responsibility of the calling system. CerbaSeal provides enforcement correctness, not execution control.

**Supporting Evidence:**
- `docs/09-trust-boundary-and-limitations.md`

**What Not to Overstate:**
- Do not imply CerbaSeal independently verifies identity
- Do not imply the hash chain proves the chain was produced by CerbaSeal (it proves consistency, not origin)

---

### Topic 15: Operational Risks

**Recommended Answer:**
The three most significant operational risks are: (1) in-memory audit log lost on restart — production requires persistent storage; (2) solo founder — no team, no organizational redundancy; (3) no third-party security review — required before production deployment in a regulated context. These are documented honestly in the repository.

**Supporting Evidence:**
- `README.md` (Known Limitations)
- `docs/security/security-review-brief.md`
- `docs/operations/solo-support-risk-reduction.md`

---

---

# SECTION 8: ONE-PAGE CALL CHEAT SHEET

---

## What Exists

**Enforcement core (IMPLEMENTED, tested):**
- `ExecutionGateService` — 12 invariants, fail-closed
- `AppendOnlyLogService` — in-memory, hash-chained
- `EvidenceBundleService` — all outcomes
- `DiagnosticReportService` — reason codes with operator guidance
- Proof export + verification scripts

**Verification (IMPLEMENTED):**
- 372/372 tests passing
- 14/14 audit checks passing
- 12/12 invariants covered
- 229 validator assertions
- stableChecksum: `7695187faf66906d868c5c4764fd6068e7ddbe0b1f69933e47a85d67c0d08ec0`

**Demo (DEMO ONLY):**
- Live demo: https://cerbaseal.replit.app/
- 5 portal pages: /, /review, /pilot, /security, /deployment, /one-page
- Support-readiness utilities (pnpm demo:support)

**Documentation (DOCUMENTED):**
- Pilot operations model (onboarding, issues, response times, exit)
- Governance vocabulary (invariant → regulatory mapping)
- Bounded autonomy model
- Trust boundary and limitations
- EU deployment posture (principle level)
- Integration spec
- Deployment modes (4 modes)

---

## What Doesn't Exist

- Persistent audit storage (in-memory only)
- Cryptographic signing of any artifact
- Third-party security review
- Identity provider integration
- Production deployment of any kind
- Client-specific workflow (no client exists)
- Commercial agreement, working agreement, or DPA
- Deployment tooling (no containers, no Helm, no Terraform)
- Production monitoring or alerting
- Organizational team or second developer
- Formal SLA

---

## What Is Proven

- Enforcement gate correctly applies all 12 invariants — adversarially tested
- AI systems cannot authorize their own proposals — absolute invariant, cannot be configured away
- Required human approval cannot be bypassed — forRequestId binding tested
- Gate-forged results are blocked by WeakSet registry
- All outcomes produce evidence bundles — including REJECT and HOLD
- Unexpected exceptions fail closed — controlled REJECT, not unhandled error
- Outcomes are deterministic and replayable — same input → same output
- Proof snapshot can be independently verified — stableChecksum is stable on unchanged repo

---

## What Is Planned

- Persistent storage layer
- Cryptographic signing (decision artifacts + audit chain HMAC)
- Third-party security review
- Production deployment hardening
- Identity provider integration
- Access controls, rate limiting
- Production monitoring and alerting
- Client-specific workflow binding (first pilot scope)

---

## Key Metrics

| Metric | Value |
|--------|-------|
| Tests passing | 372 / 372 |
| Audit checks | 14 / 14 |
| Invariants covered | 12 / 12 |
| Validator assertions | 229 |
| stableChecksum | `7695187faf66906d868c5c4764fd6068e7ddbe0b1f69933e47a85d67c0d08ec0` |
| Proof snapshot generated | 2026-05-11 |
| Version | 0.1.0 |
| Active pilot clients | 0 |
| Runtime dependencies | 1 (tsx) |
| External network calls | 0 |
| Known open security issues | 0 (all tracked items are documented limitations, not open bugs) |

---

## Key Talking Points

1. **"The enforcement core is real, not narrative."** Every claim can be re-verified independently by running `pnpm test && pnpm audit:repo && pnpm verify:proof`. The stableChecksum is stable.

2. **"The limitations are documented without softening."** `docs/09-trust-boundary-and-limitations.md` states every gap precisely. A reviewer who reads it will not be surprised by what the system cannot do.

3. **"The fail-closed model means the safe default is non-execution."** When in doubt, the system HOLDS or REJECTs. It does not fail open.

4. **"A pilot is scoped to one workflow."** One client, one workflow, one decision path, one approval model, one enforcement promise, one verifiable outcome. Constrained scope produces a clear result.

5. **"You can verify governance state independently of me."** The proof snapshot, the audit script, and the demo portal are all independently verifiable.

---

## Topics to Avoid Overstating

| Topic | Correct Statement | Do Not Say |
|-------|-----------------|------------|
| Deployment readiness | Demo-only; production requires work | "Ready to deploy" |
| Cryptographic guarantees | Hash chain proves consistency, not origin | "Cryptographically signed" |
| Third-party security review | Not yet completed | "Security reviewed" |
| Identity verification | Caller-supplied; not independently attested | "We verify identity" |
| GDPR compliance | Architecture is compatible in principle; no analysis done | "GDPR compliant" |
| VeraSeal relationship | Not in repository | Any claim about VeraSeal |
| Persistence | In-memory; lost on restart | "Persistent audit trail" |
| Production readiness | Not production-ready | "Production-ready" |
| SLA | Documented response times; no formal SLA | "We offer an SLA" |
| Team | Solo founder | "Our team" |

---

## Pilot Readiness Summary

**CerbaSeal's enforcement core is ready.**

A controlled, scoped pilot against a test-environment workflow is viable today, with the following prerequisites:

1. Line Axia defines the workflow to be governed
2. Line Axia provides the action model, approval model, and authority classes
3. Both parties agree on a deployment environment Line Axia controls
4. A working agreement is signed covering commercial terms, evidence ownership, liability, and DPA if applicable
5. Success criteria are defined jointly before the pilot begins

The enforcement logic, governance documentation, support model, and issue handling process are ready. The client-specific layer is not — because it requires the client.

**Current status: No pilot client. No working agreement. No commercial terms. No deployment environment selected. Architecture and enforcement core: verified and reviewable.**

---

*Document compiled from repository evidence only. Version 0.1.0. Every statement is traceable to a source file in the CerbaSeal repository. No statements have been inferred, speculated, or sourced from outside the repository.*

*Sections where repository evidence was absent (VeraSeal, commercial terms, Jesse's personal context) are explicitly noted as not present in the repository.*
