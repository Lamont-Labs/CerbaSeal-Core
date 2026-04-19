# Trust Boundaries

## Purpose

This document defines what CerbaSeal treats as trusted, untrusted, and conditionally trusted within the enforcement proof slice.

---

## Untrusted by default

The following inputs are treated as untrusted until validated:

**Inbound requests**
Every `GovernedRequest` is untrusted at entry. It must pass the full invariant evaluation inside `ExecutionGateService.evaluate()` before any action is permitted. No assumption of prior validation by upstream systems is made.

**AI output**
AI-generated proposals are untrusted by structural rule. They are accepted as proposal-only input. AI cannot satisfy an approval requirement, and AI-originated authority is blocked at `assertProposalBoundary()`. An AI actor with `authorityBearing: true` results in immediate rejection.

**External system state**
Systems outside CerbaSeal — identity providers, upstream validators, policy stores — are not trusted inside the gate. CerbaSeal does not verify the claims of external systems. It validates what arrives in the request fields against the invariants it controls directly.

---

## Conditionally trusted

**Approval artifacts**
An approval is conditionally trusted only after passing all of the following checks:

- `approverAuthorityClass` is one of the recognized classes (`analyst`, `reviewer`, `manager`, `compliance_officer`)
- `privilegedAuthSatisfied` is `true`
- `immutableSignature` is present and non-empty
- The artifact is present at the time of evaluation

An approval that is absent, unsigned, issued by an invalid authority class, or unverified does not grant conditional trust. Execution is blocked.

**Policy pack reference**
A policy pack reference is conditionally trusted only when `policyPackRef` is non-null. Its content is not evaluated inside this proof slice — but its presence is a required precondition for execution.

**Provenance reference**
Provenance is conditionally trusted only when `provenanceRef` is non-null and all three fields (`modelVersion`, `ruleSetVersion`, `sourceHash`) are non-empty.

---

## Trusted within scope

**The execution gate**
`ExecutionGateService` is the sole trusted execution authority. A governed action is permitted only when the gate issues a `ReleaseAuthorization`. No other code path in this repository constitutes an execution authority.

**The audit log**
Entries written to `AppendOnlyLogService` are trusted as committed evidence once appended. The log is append-only through its public API. Entries are hash-chained. `verifyChain()` confirms structural integrity of the committed chain.

**Decision envelopes and evidence bundles**
Once a `DecisionEnvelope` is committed and wrapped into an `EvidenceBundle`, that bundle is the authoritative record of what occurred. The bundle is deep-cloned at creation and is not affected by subsequent mutations of the source objects.

---

## Explicit non-trust assertions

- Logging not ready → execution does not proceed
- Control state stale or invalid → sensitive execution does not proceed
- Trust state invalid → execution does not proceed
- Prohibited use detected → execution does not proceed
- No policy pack → execution does not proceed
- No provenance → execution does not proceed

None of these conditions produce a fallback or a degraded-mode execution. Each results in a fail-closed decision with a recorded artifact.
