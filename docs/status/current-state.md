# CerbaSeal — Current System State

## Summary

CerbaSeal-Core is a deterministic enforcement layer for AI-assisted workflows. It is architecturally complete for its defined scope: evaluating governed requests, producing structured decisions, and generating verifiable audit evidence.

The enforcement loop is fully implemented, adversarially tested, and documented. The system is not production-hardened and is not intended for direct deployment without a client-specific implementation layer.

---

## Test Coverage

| Test File | Tests | Status |
|---|---|---|
| adversarial-integrity.test.ts | 66 | Passing |
| execution-gate-service.test.ts | 19 | Passing |
| snapshots/enforcement-loop.snapshot.test.ts | 39 | Passing |
| security/fail-closed.test.ts | 2 | Passing |
| security/non-forgery.test.ts | 2 | Passing |
| audit-evidence-export.test.ts | 6 | Passing |
| diagnostic-report-service.test.ts | 5 | Passing |

All tests pass. No invariant violations. No incorrect execution outcomes.

---

## Enforcement Loop

Every request receives exactly one of three outcomes:

**REJECT** — The action is refused outright. Produced when a structural invariant is violated: AI actor attempting self-authorization, missing policy reference, invalid trust state, prohibited use, mismatched action class, or any other hard failure condition.

**HOLD** — The action is paused pending human review. Produced only when approval is required but not yet present. The request is otherwise valid. Once approval is supplied, the same request will produce ALLOW.

**ALLOW** — The action is authorized. Produced only when all invariants pass. A ReleaseAuthorization is issued and linked to the specific request, approver, and evidence bundle. No ALLOW is possible without passing every check in sequence.

Every outcome — including REJECT and HOLD — produces a permanent evidence bundle with a hash-linked audit chain.

---

## Security Fixes Applied

Seven targeted security fixes were applied following a hostile audit:

1. ApprovalArtifact bound to requestId — prevents approval reuse across requests
2. fraud_triage approval hardcoded — caller cannot suppress approval requirement for this workflow
3. GateResult fabrication blocked — WeakSet prevents forged results from entering the evidence layer
4. AI non-authority invariant made absolute — no approval flag can bypass the AI actor check
5. exportReferencesOriginalEvidence compares actual hashes — not just event count
6. Unexpected exceptions produce controlled REJECT — fail-closed applies to all error types
7. requestId validated as non-empty — prevents ambiguous audit artifacts

---

## Known Gaps

The following are documented, intentionally accepted limitations for this proof slice. They are not implementation oversights.

**Not validated at runtime:**
- `approvedAt` — no expiry check, no timestamp format validation
- `immutableSignature` content — any non-empty string passes; no cryptographic verification
- `approvalId` and `approverId` — present on the type, never read by the gate
- `actorAuthorityClass` range — only "ai" is specifically matched; unknown values are not explicitly rejected
- `controlStatus.verificationRunId` and `trustState.trustStateId` — recorded but not validated
- `proposal.confidence` — not gated; null, negative, or values above 1.0 all pass
- `createdAt` and `sourceHash` format — non-empty check only

**Assumed from caller input:**
- `loggingReady` — caller-supplied boolean; gate does not verify actual log system health
- `approvalRequired` — advisory for non-hardcoded workflows
- `actorAuthorityClass`, `proposalSourceKind`, `sensitive`, `prohibitedUse`, `trustState.trusted` — all caller-declared with no independent attestation

**Structurally accepted:**
- Audit chain proves consistency, not origin — SHA-256 with no HMAC; a fabricated chain with recomputed hashes passes `verifyChain()`
- Multiple `AppendOnlyLogService` instances have no coordination — no singleton enforcement
- `eventId` is sequential and predictable — `evt_1`, `evt_2`, etc.
- `append()` calls inside `EvidenceBundleService` have no error boundary

---

## Enforcement Boundary

CerbaSeal enforces structural validity and authorization requirements.

It does NOT evaluate:
- correctness of the action
- quality of reasoning
- intent or outcome suitability

Contextual correctness must be enforced by:
- upstream decision systems
- human reviewers
- domain-specific policy engines

This boundary is tested explicitly in `test/security/contextual-boundary.test.ts`.

---

## Not Production-Hardened

This system does not include:

- Cryptographic signing of decision artifacts
- Identity verification or runtime attestation of callers
- Persistent storage — all state is in-memory per instance
- Network layer or API surface
- Policy interpretation — `policyPackRef` is a reference only; policy content is not evaluated
- Client-specific workflow configuration
- Production infrastructure hardening

These are addressed during pilot scoping and client-specific implementation. They are out of scope for this enforcement proof surface by design.
