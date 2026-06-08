# CerbaSeal — Quickstart Deployment Guide

**Audience:** Client technical owner, Line Axia technical contact  
**Purpose:** Make deployment repeatable and unsurprising.  
**Version:** CerbaSeal-Core v0.1.0

---

## What This Guide Covers

This guide walks through deploying CerbaSeal-Core in a client-controlled environment for a pilot engagement. It covers three paths depending on available time and goal:

- **15-minute demo path** — verify CerbaSeal runs and produces correct outcomes
- **60-minute technical validation path** — full verification including tests, audit, and proof
- **Half-day pilot setup path** — complete pilot-ready deployment with file-backed logging

This guide covers the enforcement core. It does not cover production infrastructure hardening, network configuration, or third-party security review. See `docs/deployment/runbook.md` for production deployment considerations.

---

## Prerequisites

Before starting, confirm the following:

| Requirement | Check |
|---|---|
| Node.js 18 or higher installed | `node --version` |
| pnpm installed | `pnpm --version` |
| Git available | `git --version` |
| Access to the CerbaSeal-Core repository | Provided by Lamont Labs |
| At least 500MB free disk space | |
| Write access to a directory for audit log output | |
| 30 minutes of uninterrupted time | |

If any of these are missing, stop and resolve before proceeding. Do not attempt to work around missing prerequisites.

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/Lamont-Labs/CerbaSeal-Core.git
cd CerbaSeal-Core
```

If you do not have access to the repository, contact Lamont Labs or Line Axia to provide access credentials.

---

## Step 2 — Install Dependencies

```bash
pnpm install
```

Expected output: package installation messages ending with a summary. No errors.

If you see errors:
- Confirm Node.js 18+ is installed: `node --version`
- Confirm pnpm is installed: `pnpm --version`
- If using a private network, confirm npm registry access

---

## Step 3 — Run the Test Suite

```bash
pnpm test
```

Expected output:
```
432 passed | 0 failed | 17 test files
```

If any tests fail, stop. Do not proceed to deployment. Contact Lamont Labs with the full test output. A failing test suite means the enforcement core is not in a verified state.

---

## Step 4 — Run the Repo Audit

```bash
pnpm audit:repo
```

Expected output:
```
15/15 checks passed
```

This verifies the repository's structural integrity — test coverage, invariant linkage, import boundaries, documentation consistency. It is separate from the test suite.

If any checks fail, contact Lamont Labs with the full output.

---

## Step 5 — Export and Verify the Proof Snapshot

```bash
pnpm export:proof
pnpm verify:proof
```

Expected output from `verify:proof`:
```
Proof verification: PASSED
stableChecksum: 82fa1380edf2f7540d1c73d89fa314d8f80d169c7d14309716b63bec6c917b61
```

This confirms the enforcement state matches the expected checksum. If the checksum does not match, the repository has been modified from the verified state. Stop and contact Lamont Labs.

The proof snapshot is written to `docs/reports/proof-snapshot.json`.

---

## Step 6 — Set Up the Environment

Create a `.env` file in the project root for any environment-specific configuration.

```bash
# Optional: enable HMAC signing of proof snapshots
# CERBASEAL_SIGNING_KEY=your-signing-key-here

# Optional: set audit log file path
# CERBASEAL_AUDIT_LOG_PATH=/data/cerbaseal/audit/audit.jsonl
```

For a pilot deployment without signing, no `.env` file is required. The system runs without environment variables in unsigned mode.

**Note:** The `.env` file should never be committed to version control. Add it to `.gitignore`.

---

## Step 7 — Enable the File-Backed Audit Log

By default, CerbaSeal uses an in-memory audit log that does not persist across restarts. For a pilot, enable the file-backed log.

Set the audit log path in your environment:

```bash
export CERBASEAL_AUDIT_LOG_PATH=/path/to/your/audit/audit.jsonl
```

Or add it to your `.env` file:

```
CERBASEAL_AUDIT_LOG_PATH=/data/cerbaseal/audit/audit.jsonl
```

Confirm the directory exists and is writable:

```bash
mkdir -p /data/cerbaseal/audit
touch /data/cerbaseal/audit/audit.jsonl
```

The file-backed log preserves the hash chain across restarts. Each entry is a JSON line with the event, hash, and chain link.

---

## Step 8 — Verify Health and Integrity

```bash
pnpm demo:support
pnpm demo:support:validate
```

Expected output: health check results and integrity verification. All checks should pass.

This runs the support-readiness utilities: local health check, integrity verification, operator action report, and system status.

---

## Step 9 — Run the Enforcement Scenarios

Run all three outcome types to confirm the gate is working:

```bash
# Terminal demo — shows REJECT, HOLD, ALLOW in sequence
pnpm demo

# Browser demo — interactive enforcement interface
pnpm demo:web
```

For the browser demo, open the URL shown in the terminal (typically http://localhost:3000 or the configured port). Click each scenario button and confirm the outcomes displayed match expectations.

**Expected outcomes:**
- "Run blocked AI action" → REJECT (AI actor attempting self-authorization)
- "Run missing-approval action" → HOLD (approval required but not present)
- "Run approved action" → ALLOW (all invariants pass)

---

## Step 10 — Verify Evidence Bundles

After running scenarios, verify that evidence bundles are being produced:

```bash
# View audit report
pnpm demo:audit
```

This shows the audit log entries from the scenarios run. Each entry includes:
- Event type and timestamp
- Decision outcome
- Evidence bundle identifier
- Hash chain link

For the file-backed log, confirm the file is being written:

```bash
cat /data/cerbaseal/audit/audit.jsonl | head -5
```

---

## Step 11 — Backup Note

CerbaSeal does not manage backups. The client is responsible for backing up:

- The audit log file (`*.jsonl`)
- The proof snapshot (`docs/reports/proof-snapshot.json`)
- The environment configuration (`.env`)

For a pilot, back up the audit log file at the end of each testing session. For production, implement automated backup according to your environment's standard practices.

---

## Step 12 — Rollback Note

If a deployment needs to be rolled back:

1. Stop the CerbaSeal process
2. The audit log file preserves all evidence from runs — do not delete it
3. If reverting to a previous version, re-run Steps 3–5 after the revert to verify the enforcement state
4. Contact Lamont Labs before making changes to the enforcement core

---

## When to Stop and Ask for Help

Stop and contact Lamont Labs or Line Axia if:

- Any test fails in Step 3
- The proof checksum does not match in Step 5
- The browser demo produces an unexpected outcome (e.g., AI actor produces ALLOW)
- The audit log is not writing after enabling the file-backed log
- Any error message contains `INVARIANT_VIOLATION` or `CHAIN_INTEGRITY_FAILURE`
- You are unsure whether a result is expected

Do not attempt to work around unexpected results. Contact support with the full error output.

---

## 15-Minute Demo Path

**Goal:** Verify CerbaSeal runs and produces correct outcomes.

1. Clone repository (Step 1)
2. Install dependencies (Step 2)
3. Run `pnpm demo:web` (part of Step 9)
4. Open browser demo
5. Run all three scenarios
6. Observe REJECT / HOLD / ALLOW outcomes

**Done.** You have confirmed the enforcement gate is operational.

---

## 60-Minute Technical Validation Path

**Goal:** Full verification for a technical reviewer.

1. Steps 1–5 (clone, install, test, audit, proof)
2. Step 8 (support validation)
3. Step 9 (scenarios)
4. Step 10 (evidence verification)
5. Optional: review `docs/reports/proof-snapshot.json`
6. Optional: review portal routes at `/review`, `/pilot`, `/security`, `/deployment`

**Done.** You have independently verified the enforcement state, test suite, audit checks, and proof snapshot.

---

## Half-Day Pilot Setup Path

**Goal:** Complete pilot-ready deployment with persistent audit logging.

1. Steps 1–5 (clone, install, test, audit, proof)
2. Step 6 (environment setup)
3. Steps 7–8 (file-backed log, health check)
4. Step 9 (scenarios)
5. Step 10 (evidence verification)
6. Run workflow-specific scenarios using the client's mapped configuration from the workflow mapping workbook
7. Confirm evidence bundles are written to the file-backed log
8. Back up the audit log file

**Done.** CerbaSeal is deployed and producing verifiable evidence for the pilot workflow.

---

## Troubleshooting

See `docs/client-adoption/troubleshooting-guide.md` for detailed troubleshooting by symptom.

---

## Support Scope

During a pilot engagement, Lamont Labs provides support for:

- Deployment issues within the defined scope
- Test failures that are not environment-related
- Proof verification failures
- Unexpected enforcement gate behavior

Lamont Labs does not provide support for:

- Infrastructure setup outside the enforcement core
- Network configuration
- Production hardening beyond this guide
- Custom workflow development

Contact your Line Axia account contact first. They will escalate to Lamont Labs where appropriate.
