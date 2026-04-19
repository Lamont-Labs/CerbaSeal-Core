# Decision Reconstructability

## Purpose

Explains how a reviewer or operator can inspect and reconstruct what occurred during a governed event.

---

## What is captured at evaluation time

For every governed request evaluation, the following are captured:

**The request itself**
The full `GovernedRequest` is stored inside the `EvidenceBundle`. This includes the proposed action, the approval artifact (if present), the provenance reference, the policy pack reference, and all control and trust state fields. The request is deep-cloned into the bundle; it cannot be modified after capture.

**The decision outcome**
The `DecisionEnvelope` records:
- `finalState`: `ALLOW`, `HOLD`, or `REJECT`
- `permittedActionClass`: the action class permitted (ALLOW only; `null` otherwise)
- `trace.checkedInvariants`: which invariants were evaluated
- `trace.reasonCodes`: the reason codes assigned to the outcome
- `trace.evaluatedAt`: evaluation timestamp
- `issuedAt`: envelope issuance timestamp

**The release authorization (ALLOW only)**
When execution is permitted, a `ReleaseAuthorization` is issued. It records:
- `releaseAuthorizationId`
- `requestId`
- `envelopeId`
- `actionClass`
- `releasedAt`

**The blocked action record (HOLD / REJECT only)**
When execution is blocked, a `BlockedActionRecord` is issued. It records:
- `finalState`
- `reasonCodes`
- `checkedInvariants`
- `recordedAt`

**The audit event chain**
`AppendOnlyLogService` records a sequence of events for each evaluation:
- `REQUEST_EVALUATED` — always recorded
- `RELEASE_AUTHORIZED` — recorded for ALLOW outcomes only
- `ACTION_BLOCKED` — recorded for HOLD/REJECT outcomes only
- `EVIDENCE_BUNDLE_CREATED` — recorded when the bundle is assembled

Each entry is SHA-256 hash-chained to the previous entry.

---

## How to inspect a decision later

**From an evidence bundle:**
The `EvidenceBundle` is a single artifact containing the request, the decision envelope, the release authorization or blocked action record, and the full event chain for that request. It is the primary inspection surface.

**Verify chain integrity:**
Call `AppendOnlyLogService.verifyChain()` to confirm that the hash chain has not been tampered with. Returns `true` if structurally intact.

**Replay the decision:**
Pass the `EvidenceBundle` to `ReplayService.replay()`. This re-evaluates the captured request through the current gate implementation and compares the outcome to the original. A match confirms the decision was deterministic and stable. A mismatch is flagged as `matchedOriginalOutcome: false` and escalates to `CRITICAL` severity in the diagnostic report.

**Generate a diagnostic report:**
Pass the bundle and replay result to `DiagnosticReportService.createReport()`. The report includes:
- plain-language operator explanation
- invariant-level pass/fail trace
- audit summary with event count and chain verification status
- recommended next action

---

## What cannot be reconstructed from this proof slice

- The source system or user that constructed the request
- Whether `ExecutionGateService.evaluate()` was actually invoked (vs. a forged result)
- The content of the policy pack referenced by `policyPackRef`
- What the client system did after receiving a `ReleaseAuthorization`
