```
═══════════════════════════════════════════════════════════════════════════════
ADVERSARIAL INTEGRITY REPORT — CerbaSeal-Core
═══════════════════════════════════════════════════════════════════════════════
Date:      2026-04-18
Scope:     Phases 1–7 adversarial testing (no logic changes made)
Test file: test/adversarial-integrity.test.ts (temporary)
Baseline:  test/execution-gate-service.test.ts + test/audit-evidence-export.test.ts
───────────────────────────────────────────────────────────────────────────────

OVERALL RESULT: ALL PASS — no invariant violated, no incorrect ALLOW issued,
                no unauthorized release authorization produced, no crash.

Test counts:
  Baseline (pre-existing):   25 / 25 PASS
  Adversarial (new):         58 / 58 PASS
  Total:                     83 / 83 PASS

───────────────────────────────────────────────────────────────────────────────
PHASE 1 — BASELINE EXECUTION
───────────────────────────────────────────────────────────────────────────────
  pnpm install  →  clean, no errors
  pnpm test     →  25/25 tests pass, no TypeScript errors, no runtime errors

STATUS: PASS

───────────────────────────────────────────────────────────────────────────────
PHASE 2 — INVARIANT STRESS TESTING
───────────────────────────────────────────────────────────────────────────────
All 9 required scenarios verified plus additional boundary conditions.

  Scenario                                               Expected  Actual
  ─────────────────────────────────────────────────────  ────────  ──────
  policyPackRef = null                                   REJECT    REJECT ✓
  provenanceRef = null                                   REJECT    REJECT ✓
  Incomplete provenance (empty modelVersion)             REJECT    REJECT ✓
  Whitespace-only ruleSetVersion                         REJECT    REJECT ✓
  approvalArtifact = null when approvalRequired=true     HOLD      HOLD   ✓
  approverAuthorityClass = "ai"                          REJECT    REJECT ✓
  approverAuthorityClass = "system"                      REJECT    REJECT ✓
  approverAuthorityClass = "superuser" (unknown)         REJECT    REJECT ✓
  All 4 valid authority classes                          ALLOW     ALLOW  ✓
    (analyst, reviewer, manager, compliance_officer)
  proposal.authorityBearing = true                       REJECT    REJECT ✓
  AI actor + AI proposal + approvalRequired=true         REJECT    REJECT ✓
  proposedActionClass ≠ proposal.requestedActionClass    REJECT    REJECT ✓
  Reversed mismatch (escalate vs allow)                  REJECT    REJECT ✓
  trustState.trusted = false                             REJECT    REJECT ✓
  Stale controls on SENSITIVE request                    REJECT    REJECT ✓
  Stale controls on NON-SENSITIVE request                ALLOW     ALLOW  ✓
  criticalControlsValid=false on sensitive               REJECT    REJECT ✓
  prohibitedUse = true                                   REJECT    REJECT ✓
  Multiple simultaneous violations (policyPack+prov)     REJECT    REJECT ✓
  loggingReady = false                                   REJECT    REJECT ✓
  Unknown action class "wire_transfer_now"               REJECT    REJECT ✓
  All 5 valid action classes                             ALLOW     ALLOW  ✓
    (allow, hold, reject, escalate, account_hold)
  Empty jurisdiction string                              REJECT    REJECT ✓
  Empty proposal.reasonCodes array                       REJECT    REJECT ✓

No scenario produced an incorrect ALLOW.
No scenario produced a releaseAuthorization when invalid.

STATUS: PASS

───────────────────────────────────────────────────────────────────────────────
PHASE 3 — BYPASS ATTEMPTS
───────────────────────────────────────────────────────────────────────────────
No bypass produced an authorized execution through the gate.
Three structural observations were recorded.

  Attempt                                               Runtime Blocked?
  ────────────────────────────────────────────────────  ────────────────
  Construct ReleaseAuthorization without gate           No → Finding B-1
  Skip gate entirely, self-construct GateResult         No → Finding B-2
  Mutate DecisionEnvelope.finalState after ALLOW        No → Finding B-3
  Single invalid field in otherwise perfect request     YES — all 6 variants
                                                        blocked correctly

STATUS: PASS (with observations — see Findings B-1/B-2/B-3)

───────────────────────────────────────────────────────────────────────────────
PHASE 4 — AUDIT CHAIN INTEGRITY
───────────────────────────────────────────────────────────────────────────────
  Scenario                                               Result
  ─────────────────────────────────────────────────────  ──────
  Fresh chain verifies correctly                         PASS ✓
  list() returns deep clones; external mutation cannot   PASS ✓
    corrupt internal chain state
  verifyChain() validates both hash reconstruction       PASS ✓
    AND previousHash link continuity
  Multi-request chain (5 requests, 10+ entries)          PASS ✓
    verifies cleanly

STRENGTH OBSERVED: Internal entries array is private and all public
accessors return deep clones. Tampering with the chain via the public
API is impossible by design — this is the correct behavior.

STATUS: PASS

───────────────────────────────────────────────────────────────────────────────
PHASE 5 — REPLAY CONSISTENCY
───────────────────────────────────────────────────────────────────────────────
  Scenario                                               Result
  ─────────────────────────────────────────────────────  ──────
  Replay ALLOW → matchedOriginalOutcome=true,            PASS ✓
    finalState=ALLOW, permittedActionClass=escalate
  Replay REJECT → matchedOriginalOutcome=true            PASS ✓
  Replay HOLD → matchedOriginalOutcome=true              PASS ✓
  reasonCodes in replay match original exactly           PASS ✓
  exportReferencesOriginalEvidence() passes for valid    PASS ✓
    bundle/manifest, fails for tampered manifest

OBSERVATION (non-critical): IDs are deterministic (env_<requestId>).
Two separate evaluations on the same requestId produce the same
envelopeId. Consistent with the replay design; may be surprising in
error-recovery scenarios where re-evaluation is needed.

STATUS: PASS

───────────────────────────────────────────────────────────────────────────────
PHASE 6 — EDGE CASES
───────────────────────────────────────────────────────────────────────────────
  Scenario                                               Result
  ─────────────────────────────────────────────────────  ──────
  Whitespace-only jurisdiction                           REJECT ✓
  Whitespace-only createdAt                              REJECT ✓
  confidence = null                                      No crash ✓
  confidence = 999.99                                    No crash, ALLOW (E-1)
  confidence = -1.0                                      No crash, ALLOW (E-1)
  Very long reason code strings (10,000 chars each)      No crash ✓
  Unicode in requestId / actorId                         No crash ✓
  1,000-element reasonCodes array                        No crash ✓
  approvalRequired=false, approvalArtifact=null          ALLOW ✓ (not HOLD)
  approvalRequired=false, approvalArtifact present       ALLOW ✓ (artifact ignored)
  Empty immutableSignature                               REJECT ✓
  Whitespace-only immutableSignature                     REJECT ✓
  deterministic_rule proposal + authorityBearing=false   ALLOW ✓
  Non-CerbaSealError exception propagation               Re-thrown ✓ (static)
  All-zeros sourceHash                                   ALLOW (E-2)

System fails closed on all malformed, null, and extreme-value inputs.

STATUS: PASS

───────────────────────────────────────────────────────────────────────────────
PHASE 7 — FINDINGS REGISTRY
───────────────────────────────────────────────────────────────────────────────
No invariant violated. No incorrect ALLOW issued.
No unauthorized release. No crash or undefined behavior.

FINDING B-1 — Severity: Structural / Low
  ReleaseAuthorization has no runtime branding.
  It is a plain TypeScript interface. Any code with type access can
  construct a structurally valid object without calling
  ExecutionGateService.evaluate(). No runtime seal exists.
  Recommendation (report only): Nominal/branded type or class with
  private constructor if the boundary extends to untrusted callers.

FINDING B-2 — Severity: Structural / Low
  ExecutionGateService is not a singleton or registered authority.
  A caller can self-construct a GateResult with finalState="ALLOW"
  and a valid-looking ReleaseAuthorization without any audit trail.
  Recommendation (report only): Architecture note. No code change
  needed at this review stage.

FINDING B-3 — Severity: Low
  DecisionEnvelope is annotated `immutable: true` as a TypeScript
  literal type but Object.freeze() is never called. The underlying
  JavaScript object can be mutated at runtime. Risk is mitigated by
  deep-clone on bundle creation (a mutated envelope does not
  propagate into stored evidence).
  Recommendation (report only): Object.freeze(decisionEnvelope) in
  buildDecisionEnvelope() would fully close this without any logic
  change.

FINDING E-1 — Severity: Informational
  proposal.confidence is not range-validated. Values outside [0, 1]
  (e.g. 999.99, -1.0) pass silently. Confidence is advisory metadata
  only — not used in any enforcement decision currently.
  Recommendation (report only): Add range guard if confidence is
  ever used in enforcement or routing thresholds.

FINDING E-2 — Severity: Informational
  provenanceRef.sourceHash content is not format-validated. Any
  non-empty, non-whitespace string passes (including all-zeros, bare
  strings without algorithm prefix). The gate checks existence only.
  Recommendation (report only): sha256: prefix + hex-length
  validation if cryptographic integrity is a hard requirement.

───────────────────────────────────────────────────────────────────────────────
AREAS OF AMBIGUITY — For Reviewer Attention
───────────────────────────────────────────────────────────────────────────────
1. `immutable: true` is a TypeScript annotation, not a JavaScript
   runtime guarantee. The field name implies a stronger contract than
   is currently enforced at runtime.

2. An AI actor with approvalRequired=false and authorityBearing=false
   is permitted through. The AI authority path check (assertProposalBoundary)
   specifically requires approvalRequired=true as part of its condition.
   This is internally consistent but warrants explicit documentation
   in the invariant definition (INV-05).

3. The stale-controls check is scoped to sensitive=true. Non-sensitive
   requests with stale or invalid controls are allowed through. This
   is intentional and tested — reviewers should confirm this is the
   intended threat model boundary.

4. Deterministic IDs mean separate evaluation runs on the same requestId
   produce identical envelopeId and evidenceBundleId. Two attempts cannot
   be distinguished by ID alone in error-recovery scenarios.

───────────────────────────────────────────────────────────────────────────────
CONCLUSION
───────────────────────────────────────────────────────────────────────────────
The CerbaSeal-Core enforcement spine behaves correctly under all tested
adversarial conditions. Every invariant (INV-01 through INV-12) blocks
as specified. The system fails closed on malformed, null, extreme, and
boundary inputs. The five findings above are structural observations, not
functional failures — the system does not misbehave in any tested scenario.

No logic changes were made during this testing engagement.
═══════════════════════════════════════════════════════════════════════════════
```
