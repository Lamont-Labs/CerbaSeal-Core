# CerbaSeal — Partner Support Guide

**Audience:** Partner technical lead providing first-line support  
**Use:** Diagnose and resolve the 10 most common issues before escalating to Lamont Labs  
**Scope:** Partner Tier 2 — issues that should not reach Jesse  

---

## Before You Diagnose

Run these three commands first. They surface 80% of issues automatically:

```bash
pnpm test          # 432 tests — all must pass
pnpm audit:repo    # 16 checks — all must pass
tsx deployment-starter/verify.ts  # 3 scenarios — all must pass
```

If any of these fail, read the error output before going further. CerbaSeal's diagnostics are specific: they name the exact check that failed and often name the exact field or condition that caused it.

---

## Issue 1 — Gate Returns REJECT When ALLOW or HOLD Is Expected

**Symptoms:**
- `finalState` is `REJECT` unexpectedly
- `releaseAuthorization` is null
- Client reports "everything is being blocked"

**Diagnosis:**

Check `decisionEnvelope.trace.reasonCodes` on the result:

| Reason Code | What It Means |
|---|---|
| `AI_NON_AUTHORITATIVE` | The actor submitting the request has `actorAuthorityClass: "ai"`. AI actors cannot authorize anything. |
| `MALFORMED_REQUEST` | The request is missing required fields or fails schema validation |
| `PROHIBITED_USE` | `prohibitedUse: true` is set on the request |
| `STALE_CONTROLS` | `controlStatus.stale: true` or `criticalControlsValid: false` on a sensitive request |
| `UNTRUSTED_ACTOR` | `trustState.trusted: false` |
| `BLOCKED_ACTION_POLICY` | The `actionPolicies` entry for this workflow + action is set to `blocked` |

**Resolution steps:**

1. Log the full `GateResult` object and read `decisionEnvelope.trace.reasonCodes`
2. Match the code to the table above
3. Fix the corresponding field in the request or the policy file
4. Re-run `pnpm audit:repo` after any policy change

**Most common root cause:** The client's integration is setting `actorAuthorityClass` to `"ai"` on the request actor instead of using `"system"`. The AI is the proposal source (`proposal.proposalSourceKind: "ai"`), but the system actor submits the request. See `examples/agent-integration-starter/` for the correct pattern.

---

## Issue 2 — Gate Returns HOLD That Never Resolves

**Symptoms:**
- Request returns `finalState: HOLD`
- Resubmission with `ApprovalArtifact` also returns `HOLD`
- `releaseAuthorization` remains null

**Diagnosis:**

A resubmitted HOLD that doesn't resolve is almost always an artifact construction problem. Check these fields on the `ApprovalArtifact`:

| Field | Requirement |
|---|---|
| `forRequestId` | Must exactly match the original request's `requestId` |
| `approvedAt` | Must not predate `createdAt` on the original request |
| `approverAuthorityClass` | Must be in the configured `approvalChains` for this workflow |
| `privilegedAuthSatisfied` | Must be `true` |
| `immutableSignature` | Must be non-empty string |

**Resolution steps:**

1. Log the `ApprovalArtifact` being submitted
2. Log the original request's `requestId` and `createdAt`
3. Compare `forRequestId` — must be character-for-character identical (case-sensitive)
4. Compare `approvedAt` against `createdAt` — `approvedAt` must be later
5. Check `approvalChains` in the policy file — the approver's class must be listed
6. If no `approvalChains` entry exists for this workflow, any valid human class is accepted — but verify `workflowRules` doesn't have a conflicting entry

**Most common root cause:** `forRequestId` mismatch. The integration generates a new request ID on resubmission instead of using the original. The original `requestId` must be preserved through the entire HOLD → approval → resubmit cycle.

---

## Issue 3 — Chain Verification Fails

**Symptoms:**
- `pnpm verify:proof` reports a staleChecksum mismatch
- Audit export tool reports chain integrity failure
- Hash chain broken at record N

**Diagnosis:**

The JSONL audit log is append-only and hash-chained. Each record's hash is incorporated into the next. A chain failure means either:

1. A record was modified after writing
2. A record was deleted from the middle of the log
3. The log file was replaced or truncated
4. Two processes wrote to the same log file concurrently

**Resolution steps:**

1. Run `tsx examples/audit-export/index.ts --verify-chain` to identify the exact record where the chain breaks
2. Look at records N-1 and N — what changed between them?
3. If the log was corrupted: the evidence chain for that period is invalid. Report this honestly. Start a new log file for new decisions.
4. If concurrent writes: configure the gate to use a single writer process, or implement a write queue. Never run two gate instances writing to the same JSONL file.

**Preventing this:** The `FileBackedAppendOnlyLogService` uses atomic appends, but concurrent process writes from two separate gate instances will corrupt the chain. One gate instance per log file.

---

## Issue 4 — Wizard Output Doesn't Match Expected Policy

**Symptoms:**
- Client ran `pnpm setup` and the generated `cerbaseal.policy.json` doesn't reflect what they entered
- Actor mappings missing or wrong
- Approval chain references wrong authority class

**Diagnosis:**

The wizard writes what you enter. Discrepancies are almost always input transcription errors. Check:

1. Role names — they are case-sensitive and must match exactly what the client's system sends in `actorAuthorityClass`
2. Authority class spelling — must be one of: `system`, `ai`, `analyst`, `reviewer`, `manager`, `compliance_officer`
3. Workflow class — the wizard lowercases and underscores the workflow name. "Transaction Fraud Review" → `transaction_fraud_review`. Verify this matches what the client's integration sends in `workflowClass`

**Resolution steps:**

1. Open `cerbaseal.policy.json` and compare each field against the workflow mapping worksheet
2. Edit the file directly — it is plain JSON
3. Re-run `pnpm audit:repo` — check 16 validates the structure
4. Run a test request through the gate to verify the mapping resolves correctly

**Tip:** Run the gate with a request that uses the client's exact role name string and check whether `actorAuthorityClass` in the result matches the expected canonical class.

---

## Issue 5 — Approval Artifact Rejected with INVALID_APPROVAL_AUTHORITY

**Symptoms:**
- Artifact submits but gate returns HOLD again
- `trace.reasonCodes` includes `INVALID_APPROVAL_AUTHORITY`
- The approver's role name is in `actorMappings` but approval is still rejected

**Diagnosis:**

`INVALID_APPROVAL_AUTHORITY` means the approval artifact's `approverAuthorityClass` is not in the `approvalChains` entry for this workflow. The actor mapping translates role names to authority classes — but approval chain validation uses the canonical authority class, not the role name.

**Resolution steps:**

1. Check `approvalChains` in `cerbaseal.policy.json` for the relevant workflow
2. Check the `approverAuthorityClass` field on the `ApprovalArtifact` — is it the canonical class (e.g. `analyst`) or the role name string (e.g. `Senior Analyst`)?
3. The `ApprovalArtifact.approverAuthorityClass` must be the canonical class — `analyst`, `reviewer`, `manager`, or `compliance_officer` — not the role name
4. The actor mapping translates role names on requests; approval artifacts use canonical classes directly

**Fix:** The integration's approval collection step must map the human approver's role to the canonical authority class before constructing the artifact. This mapping must match what's in `actorMappings` in the policy file.

---

## Issue 6 — `pnpm audit:repo` Fails Check 16 (Policy File Invalid)

**Symptoms:**
- Check 16 fails: `cerbaseal.policy.json parses without error — FAIL`
- Error message references a specific field

**Diagnosis:**

Check 16 validates:
- `actorMappings` values must be canonical authority classes
- `workflowRules` entries must have `workflowClass` (string) and `requiresApproval` (boolean)
- `approvalChains` values must be arrays of canonical authority classes
- `actionPolicies` values must be `requires_approval`, `auto_allow`, or `blocked`
- The file must be valid JSON

**Resolution steps:**

1. Read the exact error message — it names the field and the invalid value
2. Open `cerbaseal.policy.json` in a JSON validator first (check for syntax errors)
3. Fix the named field
4. Re-run `pnpm audit:repo`

**Most common causes:**
- `actorMappings` value is a role name string instead of a canonical class (e.g. `"Senior Analyst"` instead of `"analyst"`)
- `workflowRules` entry missing `requiresApproval` field or has it as a string (`"true"`) instead of boolean (`true`)
- `actionPolicies` value misspelled (e.g. `"requires_approvals"` with trailing s)
- Trailing comma in JSON (JSON does not allow trailing commas)

---

## Issue 7 — Test Suite Fails After Config Changes

**Symptoms:**
- `pnpm test` was passing, now fails after editing `cerbaseal.config.json` or `cerbaseal.policy.json`
- Error references a specific test file

**Diagnosis:**

The test suite includes tests that validate the repo's config files against the schema. If you edited a config file in a way that breaks the schema, tests that load those files will fail.

**Resolution steps:**

1. Note which test file is failing
2. If it's in `test/config-policy-layer.test.ts`: the policy file is the issue — re-run check 16 manually
3. If it's in `test/execution-gate-service.test.ts`: this is likely not related to your config change — check for other edits
4. Do not modify test files to make them pass — fix the config

**Important:** The test suite must not be modified to accommodate a client deployment. If a test legitimately fails due to a valid config change, escalate to Lamont Labs.

---

## Issue 8 — Proof Snapshot Verification Fails

**Symptoms:**
- `pnpm verify:proof` reports a mismatch
- `stableChecksum` does not match the computed checksum

**Diagnosis:**

The proof snapshot was generated at a specific point in time from specific source files. If any source file has changed since the snapshot was generated, the checksum will not match. This is expected behavior — the checksum is designed to detect changes.

**Resolution steps:**

1. Determine whether source files changed intentionally (e.g. a policy update) or unintentionally (e.g. a file was modified by mistake)
2. If intentional: generate a new snapshot with `pnpm export:proof` and document that the policy was updated
3. If unintentional: investigate what changed and restore the original state before re-verifying
4. If the log file changed: see Issue 3 (chain verification failure)

**Key point for clients:** A checksum mismatch is not a bug — it is the system working correctly. The proof snapshot is tamper-evident by design. If the checksum doesn't match, something changed.

---

## Issue 9 — Gate Returns HOLD for a Workflow That Should Auto-Allow

**Symptoms:**
- Client expects an ALLOW but receives HOLD
- The workflow isn't in `approvalChains`
- No `approvalRequired: true` on the request

**Diagnosis:**

A HOLD occurs when any approval requirement is triggered. Check these sources in order:

1. `workflowRules` in `cerbaseal.policy.json` — does the workflow have `requiresApproval: true`?
2. `approvalChains` — is the workflow listed here? (listing = approval required)
3. The request itself — is `approvalRequired: true` set on the incoming request?
4. `actionPolicies` — is the specific action set to `requires_approval`?

**Resolution steps:**

1. Check each source above in order
2. If `workflowRules` has `requiresApproval: true`: either the client's requirement, or a misconfiguration — confirm intent with client
3. If `approvalChains` lists the workflow: approval is always required for chain-listed workflows — remove the entry if not intended
4. If the request has `approvalRequired: true`: the caller is setting this — it's coming from the integration code, not the policy file
5. If `actionPolicies` has `requires_approval`: the specific action requires approval — change to `auto_allow` if intended

**Security note:** `workflowRules.requiresApproval: false` does NOT suppress a chain requirement. If the workflow is in `approvalChains`, it always requires approval regardless of `workflowRules`. The most restrictive source wins.

---

## Issue 10 — Audit Log Not Writing / Log File Not Found

**Symptoms:**
- Gate is running but the JSONL file is empty or not created
- `FileBackedAppendOnlyLogService` errors in logs
- `pnpm export:proof` fails with a log-related error

**Diagnosis:**

The `FileBackedAppendOnlyLogService` creates the log file on first write, but the directory must exist and be writable.

**Resolution steps:**

1. Check the configured log path in the service initialization
2. Verify the directory exists: `ls -la /var/log/cerbaseal/` (or your configured path)
3. Verify the directory is writable by the process running the gate
4. If the directory doesn't exist: create it (`mkdir -p /var/log/cerbaseal/`)
5. Check process permissions — the gate process must have write access
6. Re-run `tsx deployment-starter/verify.ts` and check that the log file is created and contains 3 entries

**For development:** Use `memory` as the log path during development. Use a real file path for any pilot or production deployment — `memory` does not persist across restarts and cannot be exported.

---

## Escalation to Lamont Labs (Tier 3)

Use this path only after you have exhausted the resolution steps above.

**Before escalating, document:**
- The exact command or action that triggered the issue
- The full error output (not a summary — the complete text)
- The `decisionEnvelope.trace.reasonCodes` if the issue is gate-related
- Which of the 10 issues above most closely matches and what you tried
- The output of `pnpm audit:repo` at the time of the issue

**What requires Tier 3 (Jesse):**
- Suspected bug in the enforcement core (not a configuration issue)
- Chain corruption with no obvious cause (no concurrent writers, no manual edits)
- Test suite failures that are not related to config changes
- New core invariant requirements
- Windows deployment questions

**Everything else in this guide is resolvable at Tier 2.**
