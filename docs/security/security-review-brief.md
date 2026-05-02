# CerbaSeal — Security Review Brief

## Security Review Scope

CerbaSeal is currently a deterministic enforcement library and demo with:
- no external API calls
- no database
- no authentication layer
- no persistent storage
- no framework dependency

Security review should focus on:
- enforcement integrity (can the gate be bypassed?)
- bypass resistance (can a GateResult be forged?)
- evidence integrity (can bundles be tampered after creation?)
- replay correctness (can replay mismatch be hidden?)
- deployment assumptions (what is caller-supplied and unverified?)

## Implemented Controls

| Control | Invariant / Fix | Tested |
|---|---|---|
| AI non-authority — ai+ai → REJECT unconditionally | INV-05 | ✓ |
| Approval artifact binding — forRequestId must match requestId | INV-03 / Fix 1 | ✓ |
| Workflow-level approval enforcement — fraud_triage always requires approval | Fix 2 | ✓ |
| Gate issuance registry — WeakSet prevents forged GateResults | INV-06 / Fix 3 | ✓ |
| Fail-closed catch-all — unexpected exceptions → controlled REJECT | Fix 6 | ✓ |
| Known action class validation | INV-11 | ✓ |
| Proposal/request action match | INV-12 | ✓ |
| Policy pack required | INV-01 | ✓ |
| Provenance required (all three fields) | INV-02 | ✓ |
| Logging readiness required | INV-04 | ✓ |
| Trust state required | INV-09 | ✓ |
| Stale controls block sensitive release | INV-08 | ✓ |
| Prohibited use immediate reject | INV-10 | ✓ |
| Immutable decision envelope (literal true) | INV-07 | ✓ |
| Evidence bundle deep cloning | EvidenceBundleService | ✓ |
| Append-only audit log with SHA-256 hash chaining | AppendOnlyLogService | ✓ |
| Export hash verification by index (not just count) | Fix 5 | ✓ |
| requestId non-empty validation | INV-11 / Fix 7 | ✓ |

## Known Limitations

These are accurately documented limitations, not implementation oversights:

- Audit log is in-memory — not persisted across process restarts
- No cryptographic signing — evidence is hash-linked, not key-signed or attested
- No identity provider — actor identity is caller-supplied with no independent attestation
- No persistent storage — all state exists per process instance
- No production deployment hardening
- No third-party security review completed yet
- loggingReady is caller-declared — gate does not verify actual log system health
- immutableSignature content is not cryptographically verified — any non-empty string passes
- SHA-256 hash chain proves consistency, not origin — fabricated chain with recomputed hashes passes verifyChain()
- Multiple AppendOnlyLogService instances have no coordination
- approvedAt has no expiry check or timestamp format validation
- actorAuthorityClass range — only "ai" is specifically matched; unknown values are not explicitly rejected

## Reviewer Questions

A third-party reviewer should address:

1. Can any caller obtain ReleaseAuthorization without ExecutionGateService.evaluate()?
2. Can evidence be accepted without a gate-issued GateResult?
3. Can replay mismatch be hidden from the diagnostic layer?
4. Can audit chain tampering be detected given SHA-256 without HMAC?
5. Are all unexpected errors fail-closed under all import configurations?
6. Are claims in docs consistent with code behavior?
7. Are deployment assumptions clearly separated from implemented behavior?
8. Is the WeakSet bypass prevention robust across module boundaries and import configurations?
9. What changes are required before client deployment?
10. What is the trust model for caller-supplied fields (loggingReady, trustState, prohibitedUse)?

## Current Non-Claims

CerbaSeal does NOT claim:

- production readiness for client deployment
- cryptographic identity attestation of callers
- legal or regulatory compliance certification
- third-party security review completion
- persistent evidence storage
- formal SLA or managed support
- protection against malicious caller-supplied fields (loggingReady, trustState, prohibitedUse are all caller-declared)

## Current Limitation Notice

This is a review-ready core demo, not a production client deployment.
No third-party security review has been completed.
All limitations listed here are accurate as of the current repository state.
