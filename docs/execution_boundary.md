# Execution Boundary

## Purpose

This document defines where governed execution becomes possible in the CerbaSeal proof slice and what conditions must be satisfied before any release is issued.

---

## The single execution gate

All governed action evaluation occurs in one place:

```
ExecutionGateService.evaluate(request: GovernedRequest): GateResult
```

This is the sole decision point in the proof slice. There is no secondary path, no bypass path, and no shortcut path. If `evaluate()` is not called, no `ReleaseAuthorization` is ever produced.

---

## Conditions required before release

The following conditions must all be true before a `ReleaseAuthorization` is issued. Each is enforced structurally, not by convention:

| Condition | Enforcement point |
|---|---|
| Request schema is valid | `assertRequestShape()` |
| Action class is recognized | `assertKnownActionClass()` |
| Proposal action matches request action | inline check in `evaluate()` |
| Policy pack reference is present | `assertPolicyPack()` |
| Provenance reference is present and complete | `assertProvenance()` |
| Logging is ready | `assertLoggingReady()` |
| AI has not crossed into authority-bearing behavior | `assertProposalBoundary()` |
| Prohibited use flag is not set | `assertProhibitedUse()` |
| Control status is valid for sensitive workflows | `assertControlStatus()` |
| Trust state is valid | `assertTrustState()` |
| Approval is present and valid (when required) | `assertApprovalState()` |

All checks must pass. The first failure throws a `CerbaSealError`, which routes to the blocked decision path. There is no partial success.

---

## What failure produces

When any condition above fails:

- `finalState` is set to `HOLD` or `REJECT` (never `ALLOW`)
- `releaseAuthorization` is `null`
- `blockedActionRecord` is populated
- `decisionEnvelope` is issued with the failure state recorded
- Audit entries are written

A blocked outcome is never silent. It always produces a governed artifact.

---

## AI cannot call execution directly

AI-generated proposals enter as `proposal.proposalSourceKind: "ai"`. This is a descriptor, not an authorization. The following invariants prevent AI from becoming an authority:

- `proposal.authorityBearing` must be `false`, or execution is rejected
- An AI actor with `actorAuthorityClass: "ai"` and `approvalRequired: true` is rejected regardless of other state
- No approval artifact signed by an AI actor is treated as valid

There is no code path by which an AI proposal directly produces a `ReleaseAuthorization`.

---

## What is outside this boundary

The following are outside the execution boundary of this proof slice:

- How the request was constructed upstream
- Whether the caller actually invoked the gate (the gate cannot prove its own invocation)
- What occurs in client systems after a `ReleaseAuthorization` is received
- Infrastructure enforcement of the decision

These are intentional gaps. See `docs/trust_boundaries.md` and `docs/system_boundary.md`.

---

## No alternate execution paths

This proof slice contains no:

- administrative override paths
- emergency bypass flags
- debug-mode execution shortcuts
- environment-conditional enforcement relaxation

The same invariant set applies regardless of request origin, actor type, or workflow class.
