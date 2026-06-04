# CerbaSeal — Line Axia Pre-Call Summary

**Prepared for:** Line Axia CTO Review  
**Date:** 2026-06-04  
**Version:** 0.1.0  
**Prepared by:** Jesse Lamont / Lamont Labs

---

## What CerbaSeal Is

CerbaSeal is deterministic execution governance infrastructure. It enforces an authorization boundary between AI-generated decisions and real-world execution. No AI system governed by CerbaSeal can authorize its own proposals — authority requires a human-issued or system-issued approval that passes through the enforcement gate.

The core claim: **every consequential action is governed, evidenced, and reproducible before it runs.**

---

## What This Repository Demonstrates

This repository is a minimal, fully-reviewable enforcement proof package. It is not a narrative — it is executable, auditable code.

| Proof Point | Status |
|---|---|
| 391 passing tests (16 test files) | ✓ Verified |
| 15 / 15 repo audit checks | ✓ Verified |
| 12 / 12 invariants covered and linked to tests | ✓ Verified |
| 229 validator assertions across 3 portal validators | ✓ Verified |
| Adversarial / bypass / forgery tests | ✓ Pass |
| Fail-closed on all invalid input | ✓ Verified |
| Cryptographic audit chain (SHA-256 HMAC-linked) | ✓ Implemented |
| Persistent audit log (JSONL, hash-chain preserved) | ✓ Implemented |
| Proof snapshot with optional HMAC-SHA256 signing | ✓ Implemented |
| CI/CD pipeline (GitHub Actions) | ✓ Configured |
| Deployment runbook + pilot checklist | ✓ Documented |
| Access control and rate limiting design | ✓ Documented |
| Artifact signing roadmap | ✓ Documented |

Run `pnpm verify:proof` at any time to confirm the stableChecksum on this exact state:

```
stableChecksum: a33c892ee4ceb6809feec90fe5f3bab425c25955fba34d51c4fb2ee0b942c587
```

---

## What the Enforcement Gate Guarantees

Every request that passes `ExecutionGateService.evaluate()` has been verified against 11 invariants:

1. Actor is not self-authorizing (AI cannot approve its own proposals)
2. Approval is required for the actor's authority class
3. Approval is present and properly structured
4. Approval is not expired and postdates the request creation time
5. Policy pack reference is present
6. Request ID is non-empty
7. Actor authority class is a known valid value (not unknown/arbitrary)
8. Logging readiness is declared
9. Trust state is declared trusted
10. Proposal is present and non-empty
11. Prohibited use is not flagged

Any violation → `REJECT`. Gate is fail-closed: unknown or malformed inputs are never silently passed.

---

## What Was Hardened for This Call

Since initial architecture was established, the following were added specifically for pilot readiness:

**Phase 1 — Persistent Audit:**  
`FileBackedAppendOnlyLogService` — JSONL-backed, hash-chain preserved across process restarts. Both in-memory and file-backed implementations satisfy the same `IAuditLogService` interface, so callers are storage-agnostic.

**Phase 5 — Authority Class Hardening:**  
`actorAuthorityClass` is now fully validated at runtime. Unknown values produce `REJECT` with `MALFORMED_REQUEST`. Previously, only `"ai"` was specifically checked.

**Phase 6 — Approval Timestamp Enforcement:**  
`approvedAt` is now validated: must parse as a valid ISO date and must not predate `request.createdAt`. Previously, any non-empty string passed.

**Phase 4 — HMAC Proof Signing:**  
`pnpm export:proof` / `pnpm verify:proof` now support optional HMAC-SHA256 signing via `CERBASEAL_SIGNING_KEY` environment variable. Backward-compatible: unsigned mode still works without a key.

**Phase 3 — CI/CD:**  
GitHub Actions workflow (`.github/workflows/audit.yml`) runs on every push: typecheck → 391 tests → invariant coverage → 15/15 audit checks → proof export → proof verify → upload proof artifact.

**Phases 2 + 7 — Deployment + Security Docs:**  
`docs/deployment/runbook.md` — operational deployment runbook for Node.js/container/Kubernetes  
`docs/deployment/mode-c-client-controlled.md` — Mode C architecture (client hosts enforcement layer)  
`docs/deployment/pilot-deployment-checklist.md` — pre-launch verification checklist  
`docs/security/artifact-signing-roadmap.md` — path from hash-chain to key-signed attestation  
`docs/security/access-control-and-rate-limiting.md` — design for production-grade access control

---

## What Remains Client-Specific

The following are intentionally out of scope for this proof package:

- **Request construction** — logic that transforms client workflow events into `GovernedRequest` objects is client-specific
- **Policy pack content** — `policyPackRef` must reference real policy content defined per workflow type
- **Production infrastructure** — hosting topology, database selection, persistence configuration
- **Identity provider integration** — actor identity is currently caller-declared; production requires attestation

These are scoped, not missing. They are the integration work that begins during a pilot engagement.

---

## Review Entry Points

| Goal | Where to look |
|---|---|
| Technical overview | `README.md` |
| Live review portal | `/review` (browser, running demo) |
| Pilot readiness portal | `/pilot` |
| Security posture | `/security` |
| Deployment plan | `/deployment` |
| Full audit report | `docs/reports/FULL_AUDIT_REPORT_2026-06-04.md` |
| Current maturity (honest) | `docs/current_maturity.md` |
| Known limitations | `README.md` → Known Limitations section |
| Deployment runbook | `docs/deployment/runbook.md` |
| Access control design | `docs/security/access-control-and-rate-limiting.md` |
| Signing roadmap | `docs/security/artifact-signing-roadmap.md` |
| Proof snapshot | `docs/reports/proof-snapshot.json` |

---

## The Framing for the Call

CerbaSeal is not a pitch. It is an enforcement primitive with a claim that can be verified in < 5 minutes:

```bash
git clone https://github.com/Lamont-Labs/CerbaSeal-Core.git
cd CerbaSeal-Core
pnpm install
pnpm test           # 391 tests, all pass
pnpm audit:repo     # 15/15 checks pass
pnpm verify:proof   # stableChecksum confirmed
```

The question for the call is not whether the enforcement layer works — it demonstrably does. The question is what Line Axia's first governed workflow looks like, and what the integration interface between CerbaSeal and Line Axia's existing infrastructure needs to be.

---

## Suggested Call Agenda

1. **(5 min)** CerbaSeal overview — what problem it solves, why determinism matters for AI governance
2. **(10 min)** Live demo — run the browser portal, show enforcement decisions, walk through a governed request
3. **(10 min)** Architecture review — enforcement gate, audit chain, proof snapshot, deployment modes
4. **(10 min)** Line Axia workflow mapping — which Line Axia AI workflows would benefit from governance first?
5. **(10 min)** Pilot scope definition — Mode A/B/C deployment, integration surface, timeline
6. **(5 min)** Next steps

---

*This document was generated as part of pre-pilot hardening for CerbaSeal v0.1.0.*
