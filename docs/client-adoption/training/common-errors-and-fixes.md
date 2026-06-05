# CerbaSeal — Common Errors and Fixes

**Audience:** Technical users and operators  
**Purpose:** Quick-reference for the most common error conditions and their resolution.

---

## Request-Level Errors

### Error: `AI_SELF_AUTHORIZATION_BLOCKED`

**What happened:** An AI actor (`actorAuthorityClass: "ai"`) submitted a request and attempted to self-authorize.

**Is this a bug?** No. This is the enforcement gate working correctly. AI self-authorization is structurally prohibited.

**Fix:** The calling system must route to a human authority. The request must include an approval artifact from a human authority class (`senior_analyst`, `compliance_officer`, `operations_manager`, or `human`). Alternatively, the request should be submitted without an approval artifact, which will produce HOLD, and then re-submitted after a human provides authorization.

---

### Error: `APPROVAL_REQUIRED_NOT_PRESENT`

**What happened:** The workflow requires approval (`approvalRequired: true`), but no `approvalArtifact` was provided.

**Fix:** Provide a complete `approvalArtifact` before submitting:
```json
{
  "approverId": "analyst-007",
  "approvalId": "approval-2026-001",
  "immutableSignature": "sig-value",
  "approvedAt": "2026-06-05T10:00:00.000Z"
}
```
Or, if the workflow is designed to first produce HOLD and then wait for approval: this outcome is expected. Submit without the artifact first (HOLD), then re-submit with the artifact (ALLOW).

---

### Error: `APPROVAL_PREDATES_REQUEST`

**What happened:** The `approvalArtifact.approvedAt` timestamp is earlier than the request's `createdAt` timestamp.

**Why:** An approval cannot logically predate the thing it is approving.

**Fix:** Correct the `approvedAt` timestamp. It must be a valid ISO datetime that is at or after `createdAt`. Common cause: clock skew between systems, or a stale approval artifact being reused.

```
approvedAt must be >= createdAt
```

---

### Error: `APPROVAL_EXPIRED`

**What happened:** The `approvalArtifact.expiresAt` timestamp is in the past.

**Fix:** Obtain a fresh approval. The previous approval artifact has expired and cannot be used. Set `expiresAt` to a future time, or omit it for non-expiring approvals.

---

### Error: `MALFORMED_REQUEST` (missing field)

**What happened:** One or more required fields are missing or empty.

**Required fields checklist:**

| Field | Valid Value |
|---|---|
| `requestId` | Non-empty string |
| `workflowClass` | Non-empty string |
| `proposedActionClass` | Non-empty string |
| `proposal.action` | Non-empty string |
| `policyPackRef` | Non-empty string |
| `provenanceRef.modelVersion` | Non-empty string |
| `provenanceRef.ruleSetVersion` | Non-empty string |
| `loggingReady` | `true` (boolean) |
| `trustState.trusted` | `true` (boolean) |
| `actor.authorityClass` | Valid authority class |

**Fix:** Check each required field in the submitted request. Identify the missing or empty field and correct it.

---

### Error: `MALFORMED_REQUEST` (unknown authority class)

**What happened:** The `actorAuthorityClass` value is not recognized.

**Valid values:**
- `ai`
- `senior_analyst`
- `compliance_officer`
- `operations_manager`
- `system`
- `human`

**Fix:** Update the calling system to use one of the valid authority class values. Custom values are not supported in this version.

---

### Error: `PROHIBITED_USE_FLAGGED`

**What happened:** The request has `prohibitedUse: true`.

**Is this a bug?** No. The calling system has flagged this action as prohibited.

**Fix:** If this flag was set incorrectly, correct the calling system to set `prohibitedUse: false` for non-prohibited actions. If the flag is correct, the action is prohibited and should not proceed.

---

### Error: `GATE_INTERNAL_REJECT`

**What happened:** An unexpected runtime error occurred during evaluation. The gate rejected the request fail-safely.

**Is this normal?** No. This should not occur in normal operation.

**Fix:**
1. Capture the full error output
2. Note the `requestId`
3. Check whether the request object is well-formed
4. Contact your Line Axia account contact immediately with the full error details
5. Do not attempt to work around this error

---

## System-Level Errors

### Error: Tests failing (`pnpm test`)

**What happened:** One or more tests in the test suite are failing.

**Fix:**
```bash
# Check git status — are there uncommitted changes?
git status

# Revert any changes
git checkout .

# Clean install
rm -rf node_modules
pnpm install

# Re-run tests
pnpm test
```

If tests still fail on a clean, unmodified repository: do not deploy. Contact Lamont Labs with the full test output.

---

### Error: Audit check failing (`pnpm audit:repo`)

**What happened:** One or more of the 15 automated repo audit checks failed.

**Common causes:**
- Test suite has failing tests (audit checks include test coverage)
- Documentation is out of sync with implementation
- Import boundaries violated

**Fix:**
```bash
# Run with verbose output to identify the specific failing check
pnpm audit:repo
```

Read the output carefully — the failing check name indicates the specific area to investigate. Contact Lamont Labs if the failing check is not caused by a local change.

---

### Error: Proof checksum mismatch (`pnpm verify:proof`)

**What happened:** The `stableChecksum` in the proof snapshot does not match the expected value.

**Expected:** `82fa1380edf2f7540d1c73d89fa314d8f80d169c7d14309716b63bec6c917b61`

**Fix:**
```bash
# Check for uncommitted changes
git status

# If clean, re-export
pnpm export:proof
pnpm verify:proof
```

If the mismatch persists on a clean repository: stop. This indicates a potential integrity issue. Contact Lamont Labs immediately. Do not attempt to edit the proof file.

---

### Error: Audit log not writing

**What happened:** The audit log file is not being created or updated after evaluations.

**Checks:**
```bash
# Is the path configured?
echo $CERBASEAL_AUDIT_LOG_PATH

# Does the directory exist?
ls -la $(dirname $CERBASEAL_AUDIT_LOG_PATH)

# Is it writable?
touch $CERBASEAL_AUDIT_LOG_PATH && echo "Writable"

# Is the service using the env variable?
# Restart the service after setting/changing CERBASEAL_AUDIT_LOG_PATH
```

**Fix:** Ensure the env variable is set before starting the service. The service reads environment variables at startup — changes to the `.env` file require a service restart.

---

### Error: Service won't start

**What happened:** The CerbaSeal service (demo:web or demo) fails to start.

**Quick checks:**
```bash
node --version    # Must be 18+
pnpm --version    # Must be installed
ls node_modules   # Must be populated (run pnpm install if empty)
lsof -i :3000     # Check if port is in use (for demo:web)
```

**Fix by cause:**

| Cause | Fix |
|---|---|
| Node.js too old | Install Node.js 18+ |
| pnpm not installed | Install pnpm |
| Dependencies missing | `pnpm install` |
| Port in use | Kill the conflicting process or configure an alternate port |

---

## Quick Fix Reference

| Error Code | Quick Fix |
|---|---|
| `AI_SELF_AUTHORIZATION_BLOCKED` | Route to human approver. AI cannot self-approve. |
| `APPROVAL_REQUIRED_NOT_PRESENT` | Add approval artifact to request. |
| `APPROVAL_PREDATES_REQUEST` | Fix `approvedAt` — must be >= `createdAt`. |
| `APPROVAL_EXPIRED` | Get fresh approval. |
| `MALFORMED_REQUEST` | Check all required fields. Check authority class is valid. |
| `PROHIBITED_USE_FLAGGED` | Set `prohibitedUse: false` if flagged incorrectly. |
| `GATE_INTERNAL_REJECT` | Escalate immediately. Do not work around. |
| Tests failing | Clean install, check for local changes, escalate if persists. |
| Checksum mismatch | Check for changes, re-export, escalate if persists. |
| Log not writing | Check env variable set, directory exists, writable, service restarted. |
