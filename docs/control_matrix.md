# Control / Failure / Evidence Matrix

Maps each core control to where it is enforced, what happens on failure, and what evidence is produced.

---

| Control | What it does | Enforced in | Failure behavior | Evidence produced |
|---|---|---|---|---|
| **Request schema validation** | Checks that `jurisdiction`, `createdAt`, and `proposal.reasonCodes` are non-empty | `assertRequestShape()` | `REJECT` — no release issued | `DecisionEnvelope` with `finalState: REJECT`, `BlockedActionRecord`, audit entry |
| **Action class validation** | Checks that `proposedActionClass` and `proposal.requestedActionClass` are recognized values | `assertKnownActionClass()` | `REJECT` — unknown class is not permitted | `DecisionEnvelope` with `REJECT`, `BlockedActionRecord`, audit entry |
| **Proposal / request action match** | Checks that the top-level action and the proposal's requested action are identical | inline in `evaluate()` | `REJECT` — mismatched actions are rejected | `DecisionEnvelope` with `REJECT`, `BlockedActionRecord`, audit entry |
| **Policy pack presence** | Checks that `policyPackRef` is non-null | `assertPolicyPack()` | `REJECT` — no execution without policy context | `DecisionEnvelope` with `REJECT`, `BlockedActionRecord`, audit entry |
| **Provenance presence and completeness** | Checks that `provenanceRef` is non-null and all fields (`modelVersion`, `ruleSetVersion`, `sourceHash`) are non-empty | `assertProvenance()` | `REJECT` — no action without provenance | `DecisionEnvelope` with `REJECT`, `BlockedActionRecord`, audit entry |
| **Logging readiness** | Checks that `loggingReady` is `true` | `assertLoggingReady()` | `REJECT` — execution blocked if audit path is not ready | `DecisionEnvelope` with `REJECT`, `BlockedActionRecord`, audit entry |
| **AI non-authority enforcement** | Checks that `proposal.authorityBearing` is `false`; blocks AI-sourced authority paths | `assertProposalBoundary()` | `REJECT` — AI cannot authorize | `DecisionEnvelope` with `REJECT`, `BlockedActionRecord`, audit entry |
| **Prohibited use enforcement** | Checks that `prohibitedUse` is `false` | `assertProhibitedUse()` | `REJECT` — prohibited use results in immediate rejection | `DecisionEnvelope` with `REJECT`, `BlockedActionRecord`, audit entry |
| **Control status validation** | For sensitive workflows, checks that `criticalControlsValid` is `true` and `stale` is `false` | `assertControlStatus()` | `REJECT` — stale or invalid controls block sensitive execution | `DecisionEnvelope` with `REJECT`, `BlockedActionRecord`, audit entry |
| **Trust state validation** | Checks that `trustState.trusted` is `true` | `assertTrustState()` | `REJECT` — invalid trust state blocks all execution | `DecisionEnvelope` with `REJECT`, `BlockedActionRecord`, audit entry |
| **Approval enforcement** | When `approvalRequired` is `true`, checks that a valid `approvalArtifact` is present with recognized authority class, privileged auth satisfied, and non-empty signature | `assertApprovalState()` | `HOLD` (missing artifact) or `REJECT` (invalid artifact) — no release issued | `DecisionEnvelope` with `HOLD` or `REJECT`, `BlockedActionRecord`, audit entry |
| **Single execution gate** | Ensures all checks occur in one path before any release is issued | `ExecutionGateService.evaluate()` | Any single failing check prevents `ReleaseAuthorization` from being issued | Full `GateResult` with decision artifacts regardless of outcome |
| **Append-only decision logging** | Records all governed events in a hash-chained append-only log | `AppendOnlyLogService.append()` | Entries cannot be modified or deleted through the public API; `verifyChain()` detects tampering | `AuditLogEntry` with `entryHash` and `previousHash` linkage |
| **Evidence bundle creation** | Assembles request, decision, and audit chain into a single inspectable artifact | `EvidenceBundleService.createBundle()` | Bundle is deep-cloned at creation; subsequent mutations do not affect it | `EvidenceBundle` containing full decision context |
| **Replay consistency** | Re-evaluates the stored request through the gate and compares outcome to the recorded decision | `ReplayService.replay()` | Mismatch produces `matchedOriginalOutcome: false`; diagnostic report escalates to `CRITICAL` severity | `ReplayResult` with outcome comparison |

---

## Notes

All failure states produce a `DecisionEnvelope`. There is no failure condition that produces no artifact.

`ReleaseAuthorization` is only present in the `GateResult` when `finalState: ALLOW`. It is `null` in all blocked outcomes.

The audit log receives entries for every evaluation path: `REQUEST_EVALUATED`, `RELEASE_AUTHORIZED` (ALLOW only), `ACTION_BLOCKED` (HOLD/REJECT only), and `EVIDENCE_BUNDLE_CREATED`.
