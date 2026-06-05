# CerbaSeal — Troubleshooting Guide

**Audience:** Client technical owner, Line Axia technical contact  
**Purpose:** Diagnose and resolve common issues during pilot deployment and operation.  
**Version:** CerbaSeal-Core v0.1.0

---

## How to Use This Guide

Find the symptom that matches your situation. Follow the "First Checks" steps in order. If you cannot resolve the issue using the safe actions listed, escalate using the path at the bottom of this guide.

Do not modify enforcement core source files to work around an issue. Always escalate before making changes to the gate or invariant logic.

---

## Issue 1 — System Will Not Start

**Symptom:** Running `pnpm demo:web` or `pnpm demo` produces an error immediately or no output.

**Likely Causes:**
- Node.js version too old
- Dependencies not installed
- Port already in use
- Missing environment variable

**First Checks:**

```bash
# Check Node.js version (must be 18+)
node --version

# Check pnpm is available
pnpm --version

# Check dependencies are installed
ls node_modules | head -5

# Check if port is in use (for browser demo)
lsof -i :3000
```

**Safe Actions:**

| If... | Then... |
|---|---|
| Node.js < 18 | Install Node.js 18 or higher. Do not proceed with older versions. |
| Dependencies not installed | Run `pnpm install` and retry. |
| Port in use | Kill the process using the port or configure an alternate port. |
| Missing env variable | Check `.env` file exists and contains required values. |

**When to Escalate:** If the system will not start after completing all checks above, escalate with the full terminal error output.

---

## Issue 2 — Tests Fail

**Symptom:** `pnpm test` reports one or more failing tests.

**Likely Causes:**
- Repository has been modified from the verified state
- Node.js version mismatch
- Dependency installation issue
- Environment variable interfering with tests

**First Checks:**

```bash
# Check current git status — are there uncommitted changes?
git status

# Check Node.js version
node --version

# Reinstall dependencies cleanly
rm -rf node_modules
pnpm install
pnpm test
```

**Safe Actions:**

| If... | Then... |
|---|---|
| `git status` shows modified files | Do not modify source files. Revert: `git checkout .` |
| Tests still fail after clean install | Run `pnpm test -- --reporter=verbose` and capture full output |
| Specific test files failing | Note which test file and which test name |

**When to Escalate:** Any test failure after a clean install on an unmodified repository. Provide the full test output to Lamont Labs.

**Important:** Do not proceed to deployment if tests are failing. A failing test suite means the enforcement core is not in a verified state.

---

## Issue 3 — Audit Chain Fails Verification

**Symptom:** `pnpm verify:proof` reports a chain integrity failure or mismatched checksum.

**Likely Causes:**
- Repository has been modified
- Proof snapshot is from a different version
- File was edited or corrupted

**First Checks:**

```bash
# Check git status
git status

# Re-export the proof
pnpm export:proof

# Verify again
pnpm verify:proof
```

**Safe Actions:**

| If... | Then... |
|---|---|
| Git status shows changes | Revert with `git checkout .` and re-export |
| Checksum still mismatches after clean repo | Stop. Do not use this deployment. Escalate immediately. |
| Proof file is missing | Run `pnpm export:proof` to regenerate |

**When to Escalate:** A persistent checksum mismatch on an unmodified repository. This indicates a potential integrity issue. Do not attempt to resolve by editing the proof file.

---

## Issue 4 — Proof Snapshot Fails Verification

**Symptom:** `pnpm verify:proof` outputs `FAILED` or a different stableChecksum than expected.

**Expected checksum:** `82fa1380edf2f7540d1c73d89fa314d8f80d169c7d14309716b63bec6c917b61`

**First Checks:**

```bash
# What checksum is reported?
pnpm verify:proof

# Is the repo in a clean state?
git log --oneline -3
git status
```

**Safe Actions:**

| If... | Then... |
|---|---|
| Checksum differs and repo is clean | Note the reported checksum and escalate |
| Checksum differs and repo has changes | Revert and re-export |
| Proof file is corrupted or empty | Delete and re-run `pnpm export:proof` |

**When to Escalate:** Any persistent checksum failure on an unmodified, clean repository.

---

## Issue 5 — Request Returns REJECT Unexpectedly

**Symptom:** A request that you expect to ALLOW is returning REJECT.

**Likely Causes:**
- Missing or invalid approval artifact
- Actor authority class is `"ai"` — AI cannot self-authorize
- Approval timestamp predates request creation
- Prohibited use is flagged
- PolicyPackRef is empty
- RequestId is empty or malformed

**First Checks:**

1. Check the `reasonCode` in the REJECT response — it identifies which invariant failed
2. Check the `failedInvariant` field for the specific check that triggered the REJECT
3. Review the request object against the required field checklist

**Reason Code Reference:**

| Reason Code | Cause | Fix |
|---|---|---|
| `AI_SELF_AUTHORIZATION_BLOCKED` | Actor is `"ai"` and attempted ALLOW | AI cannot approve its own proposals. Use a human authority class for the approver. |
| `APPROVAL_REQUIRED_NOT_PRESENT` | `approvalRequired: true` but no `approvalArtifact` provided | Provide a valid approval artifact |
| `APPROVAL_EXPIRED` | `approvalArtifact.expiresAt` is in the past | Provide a fresh approval |
| `APPROVAL_PREDATES_REQUEST` | `approvedAt` is before `createdAt` | Correct the timestamp — approval must postdate the request |
| `MALFORMED_REQUEST` | Required field missing or invalid | Check all required fields: requestId, workflowClass, proposedActionClass, proposal, policyPackRef, provenanceRef, loggingReady, trustState |
| `PROHIBITED_USE_FLAGGED` | `prohibitedUse: true` | This action is explicitly prohibited. Do not attempt to override. |
| `UNKNOWN_AUTHORITY_CLASS` | `actorAuthorityClass` value is not recognized | Use a valid authority class: `ai`, `senior_analyst`, `compliance_officer`, `operations_manager`, `system`, or `human` |

**When to Escalate:** If the reason code is not in the table above, or if a REJECT is occurring on a request that you believe satisfies all invariants. Provide the full request object (redacted of any sensitive data) and the full REJECT response.

---

## Issue 6 — Request Returns HOLD Unexpectedly

**Symptom:** A request returns HOLD when you expect ALLOW.

**Likely Causes:**
- `approvalRequired: true` but no approval artifact provided
- For `fraud_triage` workflows: approval is hardcoded as required and cannot be disabled
- Approval artifact is present but malformed

**First Checks:**

1. Is `approvalRequired: true` in the request?
2. Is `approvalArtifact` present and populated?
3. Is `approvalArtifact.immutableSignature` non-empty?
4. Is `approvalArtifact.approvedAt` a valid ISO datetime?
5. Is `approvalArtifact.approvedAt` after `request.createdAt`?

**Safe Action:** Provide a complete, valid approval artifact with all required fields. HOLD is the correct behavior when approval is required and not yet provided — it is not an error.

**When to Escalate:** If a full, valid approval artifact is provided and the request still returns HOLD.

---

## Issue 7 — Approval Artifact Rejected

**Symptom:** Approval artifact is provided but the request returns REJECT with an approval-related reason code.

**First Checks:**

Verify the approval artifact structure:

```typescript
approvalArtifact: {
  approverId: "analyst-007",          // non-empty string
  approvalId: "approval-2026-001",    // non-empty string
  immutableSignature: "sig-value",    // non-empty string
  approvedAt: "2026-06-05T09:00:00.000Z",  // valid ISO datetime
  // expiresAt: "2026-06-12T09:00:00.000Z"  // optional
}
```

| Common Problem | Fix |
|---|---|
| `approvedAt` is not a valid ISO datetime | Use format: `YYYY-MM-DDTHH:mm:ss.sssZ` |
| `approvedAt` is before `createdAt` | The approval must postdate the request. Correct the timestamp. |
| `immutableSignature` is empty string | Provide any non-empty string value for the signature field |
| `approvalId` or `approverId` is missing | Both fields are required |
| Approval is bound to a different requestId | Each approval artifact is bound to one request. Do not reuse approval artifacts. |

---

## Issue 8 — Unknown Authority Class Rejected

**Symptom:** Request returns REJECT with `UNKNOWN_AUTHORITY_CLASS` or `MALFORMED_REQUEST`.

**Cause:** The `actorAuthorityClass` field contains a value that is not in the valid set.

**Valid authority class values:**
- `"ai"`
- `"senior_analyst"`
- `"compliance_officer"`
- `"operations_manager"`
- `"system"`
- `"human"`

**Fix:** Use one of the values above. Custom authority class values are not supported in the current version. If a client workflow requires a different authority class, contact Lamont Labs — this requires a code change.

---

## Issue 9 — Logging Not Ready

**Symptom:** Request returns REJECT with a logging-related reason. Or `loggingReady` error in diagnostic output.

**Cause:** The request has `loggingReady: false` or the field is missing.

**Fix:** Set `loggingReady: true` in the request object. This is a caller-declared field — CerbaSeal does not independently verify that a log system is healthy. The caller is responsible for ensuring logging is operational before setting this field.

**Note:** For the file-backed audit log, confirm the log file path is writable before setting `loggingReady: true`.

---

## Issue 10 — Persistent Audit File Issue

**Symptom:** The audit log file is not being written, or entries are not persisting across restarts.

**First Checks:**

```bash
# Is the environment variable set?
echo $CERBASEAL_AUDIT_LOG_PATH

# Does the directory exist?
ls -la $(dirname $CERBASEAL_AUDIT_LOG_PATH)

# Is the file writable?
touch $CERBASEAL_AUDIT_LOG_PATH

# Are entries in the file?
wc -l $CERBASEAL_AUDIT_LOG_PATH
cat $CERBASEAL_AUDIT_LOG_PATH | tail -3
```

| Problem | Fix |
|---|---|
| Environment variable not set | Set `CERBASEAL_AUDIT_LOG_PATH` in your environment or `.env` file |
| Directory does not exist | Create it: `mkdir -p /path/to/audit/` |
| File is not writable | Check permissions: `chmod 644 /path/to/audit.jsonl` |
| File is empty after runs | Confirm the file-backed log service is configured — restart the service after setting the env variable |
| Entries exist but chain seems broken | Run `pnpm verify:proof` to check chain integrity |

**When to Escalate:** If the audit file is writing but the hash chain fails verification.

---

## Issue 11 — Client Workflow Not Mapping Cleanly

**Symptom:** The client workflow does not fit neatly into the CerbaSeal field model. Required fields are unclear or don't match client terminology.

**This is not a bug.** CerbaSeal is a general enforcement primitive. Mapping a specific client workflow to its field model always requires interpretation.

**Steps:**

1. Return to the workflow mapping workbook (`docs/client-adoption/workflow-mapping-workbook.md`)
2. Re-work sections A–F with both operational and technical client contacts together
3. Use the completed fraud triage example as a reference
4. Identify which CerbaSeal field maps to which client concept — even if the terminology differs

**Common mapping difficulties:**

| Client Says | CerbaSeal Field |
|---|---|
| "The AI recommendation" | `proposal.action` |
| "The case / ticket / transaction" | `requestId` (a unique identifier for this evaluation) |
| "The approver" | `approvalArtifact.approverId` (and their role = `actorAuthorityClass`) |
| "The policy we follow" | `policyPackRef` |
| "Our AI model" | `provenanceRef.modelVersion` |
| "Is this a sensitive case?" | `sensitive: true/false` |
| "This action is not allowed" | `prohibitedUse: true` |

**When to Escalate:** If a core client requirement cannot be expressed in the CerbaSeal field model. This may indicate that the workflow is out of scope for the current pilot, or that the model requires extension (which is a separate engagement).

---

## Support Escalation Path

**Step 1 — Self-resolve using this guide**  
Most issues in this guide can be resolved without escalation. Work through all First Checks before escalating.

**Step 2 — Contact Line Axia**  
If self-resolution fails, contact your Line Axia account contact. Provide:
- The symptom
- The issue number from this guide
- The First Checks you ran and what they showed
- Any relevant error messages or output

**Step 3 — Line Axia escalates to Lamont Labs**  
Line Axia will escalate to Lamont Labs where the issue is in the enforcement core or requires a code-level investigation. Expect response within the agreed support SLA.

**What to include in any escalation:**
- CerbaSeal version (`cat package.json | grep version`)
- Operating system and Node.js version
- Full error output or terminal log
- The request object that produced the unexpected result (redact any personal data)
- Steps already taken

**What not to do:**
- Do not modify enforcement core source files
- Do not delete the audit log file
- Do not attempt to edit the proof snapshot
- Do not share unredacted client data in escalation communications
