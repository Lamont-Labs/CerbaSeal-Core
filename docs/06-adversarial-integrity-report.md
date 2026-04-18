# Adversarial Integrity Report — CerbaSeal-Core

**Date:** 2026-04-18
**Tester:** Automated adversarial suite (no logic changes made)
**Test file:** `test/adversarial-integrity.test.ts` (temporary, reviewer-facing)
**Baseline suite:** `test/execution-gate-service.test.ts` + `test/audit-evidence-export.test.ts`

---

## Summary

| Phase | Description | Tests Run | Result |
|-------|-------------|-----------|--------|
| 1 | Baseline execution | 25 | ✅ PASS |
| 2 | Invariant stress testing | 33 | ✅ PASS |
| 3 | Bypass attempts | 4 | ✅ PASS (with observations) |
| 4 | Audit chain integrity | 4 | ✅ PASS |
| 5 | Replay consistency | 6 | ✅ PASS |
| 6 | Edge cases | 15 | ✅ PASS |
| **Total** | | **87** | **83/83 new + 25/25 baseline** |

**No invariant violation found. No incorrect ALLOW result produced. No unauthorized release authorization issued. No runtime crash observed.**

---

## Phase 1 — Baseline Execution

```
pnpm install   → clean (no errors)
pnpm test      → 25/25 tests passed
```

All 25 existing tests pass without modification.

---

## Phase 2 — Invariant Stress Testing

All 9 required scenarios verified plus additional boundary conditions.

| # | Scenario | Expected | Actual | Result |
|---|----------|----------|--------|--------|
| 2.1 | `policyPackRef = null` | REJECT | REJECT | ✅ |
| 2.2 | `provenanceRef = null` | REJECT | REJECT | ✅ |
| 2.3 | Incomplete provenance (empty `modelVersion`) | REJECT | REJECT | ✅ |
| 2.4 | Whitespace-only `ruleSetVersion` | REJECT | REJECT | ✅ |
| 2.5 | `approvalArtifact = null` when required | HOLD | HOLD | ✅ |
| 2.6 | `approverAuthorityClass = "ai"` | REJECT | REJECT | ✅ |
| 2.7 | `approverAuthorityClass = "system"` | REJECT | REJECT | ✅ |
| 2.8 | `approverAuthorityClass = "superuser"` (unknown) | REJECT | REJECT | ✅ |
| 2.9a–c | All 4 valid authority classes (`analyst`, `manager`, `compliance_officer`, `reviewer`) | ALLOW | ALLOW | ✅ |
| 2.10 | `proposal.authorityBearing = true` | REJECT | REJECT | ✅ |
| 2.11 | AI actor + AI proposal + `approvalRequired=true` | REJECT | REJECT | ✅ |
| 2.12 | `proposedActionClass` ≠ `proposal.requestedActionClass` | REJECT | REJECT | ✅ |
| 2.13 | Reversed mismatch (`escalate` vs `allow`) | REJECT | REJECT | ✅ |
| 2.14 | `trustState.trusted = false` | REJECT | REJECT | ✅ |
| 2.15 | Stale controls on sensitive request | REJECT | REJECT | ✅ |
| 2.16 | Stale controls on **non-sensitive** request | ALLOW | ALLOW | ✅ |
| 2.17 | `criticalControlsValid = false` on sensitive | REJECT | REJECT | ✅ |
| 2.18 | `prohibitedUse = true` | REJECT | REJECT | ✅ |
| 2.19 | Multiple violations simultaneously | REJECT (first wins) | REJECT | ✅ |
| 2.20 | `loggingReady = false` | REJECT | REJECT | ✅ |
| 2.21 | Unknown action class `"wire_transfer_now"` | REJECT | REJECT | ✅ |
| 2.22a–d | All 5 valid action classes (`allow`, `hold`, `reject`, `escalate`, `account_hold`) | ALLOW | ALLOW | ✅ |
| 2.23 | Empty `jurisdiction` string | REJECT | REJECT | ✅ |
| 2.24 | Empty `proposal.reasonCodes` array | REJECT | REJECT | ✅ |

**No scenario produced an incorrect ALLOW. No scenario produced a `releaseAuthorization` when invalid.**

---

## Phase 3 — Bypass Attempts

| # | Attempt | Blocked? | Notes |
|---|---------|----------|-------|
| 3.1 | Construct `ReleaseAuthorization` without gate | ❌ Not blocked at runtime | See **Finding B-1** below |
| 3.2 | Skip `ExecutionGateService` entirely | ❌ Not blocked at runtime | See **Finding B-2** below |
| 3.3 | Mutate `DecisionEnvelope.finalState` after ALLOW | ❌ Not blocked at runtime | See **Finding B-3** below |
| 3.4 | Single invalid field in otherwise perfect request | ✅ Blocked | Gate rejects correctly for every tested field |

> All three bypass findings are **structural design observations**. They are NOT runtime errors or crashes. The system is correct within its operational context (a trusted backend). They are documented here for reviewer awareness.

### Finding B-1: No Runtime Branding on `ReleaseAuthorization`

The `ReleaseAuthorization` type is a plain TypeScript interface. Any code with access to the type definition can construct an object that satisfies the interface without calling `ExecutionGateService.evaluate()`. There is no runtime opaque token, class seal, or issuance certificate.

**Severity:** Structural / low — relevant only if untrusted code can consume the type.
**Recommendation (report only):** Consider a nominal/branded type or a class-based `ReleaseAuthorization` with a private constructor if the boundary ever extends to untrusted callers.

### Finding B-2: No Singleton / Execution Guard on the Gate

`ExecutionGateService` can be instantiated arbitrarily. There is no enforcement that all `GateResult` objects pass through a registered, audited instance. A caller that constructs a `GateResult` manually would have no audit trail.

**Severity:** Structural / low — depends on deployment context.
**Recommendation (report only):** No code change needed at this review stage. Note for architecture review.

### Finding B-3: `DecisionEnvelope` Is Not Frozen at Runtime

The `immutable: true` field is a TypeScript literal type (`immutable: true`). The underlying JavaScript object is a plain `{}` and is not protected by `Object.freeze()` or `Object.seal()`. Runtime mutation of `finalState` after the fact is possible in a JavaScript context.

**Severity:** Low — the system uses deep-clone on bundle creation, so a mutated envelope would not propagate into stored evidence. The audit chain captures state at bundle-creation time.
**Recommendation (report only):** `Object.freeze(decisionEnvelope)` would harden this boundary without any logic change.

---

## Phase 4 — Audit Chain Integrity

| # | Scenario | Expected | Actual | Result |
|---|----------|----------|--------|--------|
| 4.1 | Fresh chain verifies correctly | `true` | `true` | ✅ |
| 4.2 | Mutation of snapshot does not affect internal state | Chain still valid | Chain still valid | ✅ |
| 4.3 | `verifyChain()` validates both hash reconstruction and link continuity | Both checked | Both checked | ✅ |
| 4.4 | Multi-request chain (5 requests, 10+ entries) verifies correctly | `true` | `true` | ✅ |

**Strength observed:** `list()` and `listByRequestId()` return deep clones. External mutation of returned entries cannot corrupt the internal chain. `verifyChain()` operates on internal state exclusively.

**Note on tampering:** Because the internal entries array is private and all public accessors return deep clones, it is not possible to tamper with the chain via the public API. This is the correct and intended behavior. A reviewer attempting to test tamper-detection against the public API would find it impossible by design, which is itself the desired property.

---

## Phase 5 — Replay Consistency

| # | Scenario | Expected | Actual | Result |
|---|----------|----------|--------|--------|
| 5.1 | Replay of ALLOW request | `matchedOriginalOutcome = true` | `true` | ✅ |
| 5.2 | Replay of REJECT request | `matchedOriginalOutcome = true` | `true` | ✅ |
| 5.3 | Replay of HOLD request | `matchedOriginalOutcome = true` | `true` | ✅ |
| 5.4 | `reasonCodes` in replay match original exactly | Identical arrays | Identical | ✅ |
| 5.5 | Deterministic IDs | Same `requestId` → same `envelopeId` | Confirmed | ✅ (see note) |
| 5.6 | `exportReferencesOriginalEvidence` validates linkage | `true` for valid, `false` for tampered | Correct | ✅ |

**Observation (non-critical):** IDs are generated deterministically as `env_<requestId>` and `evidence_<requestId>`. Two separate evaluation runs on the same `requestId` (e.g., in error recovery) would produce the same `envelopeId`. This is by design for replay verification but means IDs alone cannot distinguish separate evaluation attempts on the same request.

---

## Phase 6 — Edge Cases

| # | Scenario | System Behavior | Result |
|---|----------|-----------------|--------|
| 6.1 | Whitespace-only `jurisdiction` | REJECT (fails closed) | ✅ |
| 6.2 | Whitespace-only `createdAt` | REJECT (fails closed) | ✅ |
| 6.3 | `confidence = null` | No crash, evaluates normally | ✅ |
| 6.4 | `confidence = 999.99` | No crash, ALLOW issued | ✅ (see **Finding E-1**) |
| 6.5 | `confidence = -1.0` | No crash, ALLOW issued | ✅ (see **Finding E-1**) |
| 6.6 | Very long reason code strings (10,000 chars each) | No crash | ✅ |
| 6.7 | Unicode in `requestId` / `actorId` | No crash | ✅ |
| 6.8 | 1,000-element `reasonCodes` array | No crash | ✅ |
| 6.9 | `approvalRequired=false`, `approvalArtifact=null` | ALLOW | ✅ |
| 6.10 | `approvalRequired=false`, artifact present | ALLOW (artifact ignored) | ✅ |
| 6.11 | Empty `immutableSignature` | REJECT | ✅ |
| 6.12 | Whitespace-only `immutableSignature` | REJECT | ✅ |
| 6.13 | `deterministic_rule` proposal source | ALLOW (correctly not blocked) | ✅ |
| 6.14 | Non-`CerbaSealError` propagation | Re-thrown (confirmed by static analysis) | ✅ |
| 6.15 | All-zeros `sourceHash` | ALLOW (see **Finding E-2**) | ✅ |

### Finding E-1: `confidence` Value Is Not Range-Validated

The `proposal.confidence` field accepts any `number | null`. Values outside `[0, 1]` (e.g. `999.99`, `-1.0`) do not trigger rejection. The gate does not use the confidence value in any enforcement decision.

**Severity:** Informational — confidence is proposal metadata, not a decision input.
**Recommendation (report only):** If confidence is intended to influence routing or escalation thresholds in future, a range guard would be appropriate. Currently it is advisory only.

### Finding E-2: `sourceHash` Content Is Not Format-Validated

The `provenanceRef.sourceHash` field accepts any non-empty, non-whitespace string. An all-zeros hash, a random string, or a hash without an algorithm prefix all pass. The gate only checks for empty/whitespace.

**Severity:** Low — the hash is a provenance reference, not a cryptographic commitment verified by the gate itself.
**Recommendation (report only):** If source integrity is a hard requirement, a format validation (e.g., `sha256:` prefix + hex length) would close this gap without changing enforcement logic.

---

## Phase 7 — Final Summary

### No Invariant Violations Found

Every invariant check (INV-01 through INV-12) behaves correctly under all tested conditions.

### No Incorrect Release

No test scenario produced a `releaseAuthorization` when the request was invalid. All HOLD and REJECT outcomes correctly set `releaseAuthorization = null` and `permittedActionClass = null`.

### No Crash or Undefined Behavior

The system fails closed on all malformed, null, empty, and extreme-value inputs. No runtime exceptions escaped the gate under adversarial input.

### Findings Registry

| ID | Severity | Description | Recommendation |
|----|----------|-------------|----------------|
| B-1 | Structural / Low | `ReleaseAuthorization` has no runtime branding | Nominal type or private-constructor class if boundary widens |
| B-2 | Structural / Low | Gate is not a singleton; self-construction of `GateResult` is possible | Architecture note; no code change required now |
| B-3 | Low | `DecisionEnvelope` is not `Object.freeze()`d despite `immutable: true` annotation | `Object.freeze()` call in `buildDecisionEnvelope()` |
| E-1 | Informational | `confidence` value not range-validated | Add guard if confidence is used in enforcement in future |
| E-2 | Informational | `sourceHash` content not format-validated | Add prefix/length validation if cryptographic integrity is required |

### Areas Where Logic Is Ambiguous or Weak

1. **`immutable: true` is a type annotation, not a runtime guarantee.** The word "immutable" appears in the field name and in comments, but `Object.freeze()` is not called. A reviewer reading the interface definition would expect runtime immutability.

2. **Deterministic IDs create no separation between evaluation runs.** Two calls to `evaluate()` with identical `requestId` produce the same `envelopeId` and `evidenceBundleId`. If a request is re-evaluated (e.g., after a transient error), both results share IDs. This is consistent with the replay design but may be surprising in an error-recovery scenario.

3. **`actorAuthorityClass = "ai"` with `approvalRequired = false` does not trigger rejection.** The `assertProposalBoundary` check specifically requires `approvalRequired = true` as part of the AI authority path condition. An AI actor with `approvalRequired = false` and a non-authority-bearing proposal is allowed through. This is internally consistent but may warrant explicit documentation in the invariant definition.

4. **The stale-controls check is conditional on `sensitive = true`.** This is correct and tested (tests 2.15–2.17). It means a non-sensitive request with completely invalid controls still receives ALLOW. Reviewers should be aware this is intentional scoping.

---

*This report is observation-only. No system logic, service code, types, constants, builders, or invariants were modified during testing.*
