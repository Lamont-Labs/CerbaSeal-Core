# CerbaSeal — Admin Guide

**Audience:** Client technical admin — the person who deploys and manages CerbaSeal  
**Assumed knowledge:** Comfortable with Node.js, command line, and managing services  
**Reading time:** 25 minutes  
**See also:** `client-admin-guide.md` (responsibilities), `quickstart-deployment-guide.md` (deployment steps)

---

## Admin Responsibilities Summary

You are responsible for:
- Deploying and maintaining the CerbaSeal service
- Managing the audit log file
- Verifying enforcement integrity
- Troubleshooting technical issues
- Escalating issues through the defined support path

You are not responsible for:
- The enforcement logic (Lamont Labs owns that)
- Commercial decisions (Line Axia handles that)
- Compliance interpretations of evidence (Line Axia advisory role)

---

## Environment Setup

**Required:**
- Node.js 18 or higher: `node --version`
- pnpm: `pnpm --version`
- Git access to CerbaSeal-Core repository

**Initial setup:**

```bash
git clone https://github.com/Lamont-Labs/CerbaSeal-Core.git
cd CerbaSeal-Core
pnpm install
```

**Environment variables (`.env` file in project root):**

```bash
# Required for file-backed audit log
CERBASEAL_AUDIT_LOG_PATH=/data/cerbaseal/audit/audit.jsonl

# Optional: HMAC signing of proof snapshots
# CERBASEAL_SIGNING_KEY=your-signing-key-here
```

Never commit the `.env` file to version control. Add it to `.gitignore`.

---

## Service Verification Checklist

Run these commands after every deployment or restart:

```bash
# 1. Test suite (must be 391/391)
pnpm test

# 2. Repo audit (must be 15/15)
pnpm audit:repo

# 3. Export and verify proof snapshot
pnpm export:proof
pnpm verify:proof

# 4. Health and integrity check
pnpm demo:support
pnpm demo:support:validate
```

**Expected stableChecksum:** `82fa1380edf2f7540d1c73d89fa314d8f80d169c7d14309716b63bec6c917b61`

If any of these fail, stop. Do not mark deployment as complete. See `troubleshooting-guide.md`.

---

## Starting and Stopping the Service

**Browser demo / portal:**
```bash
pnpm demo:web
```

**Terminal demo:**
```bash
pnpm demo
```

**Support utilities:**
```bash
pnpm demo:support
```

To stop: `Ctrl+C` in the terminal running the service.

For production-style process management, use `pm2`, `systemd`, or your container platform's process management. CerbaSeal is a standard Node.js process.

---

## Audit Log Management

**Location:** Set by `CERBASEAL_AUDIT_LOG_PATH`  
**Format:** JSON Lines (`.jsonl`) — one JSON object per line  
**Growth:** Grows with each enforcement evaluation — estimate by your evaluation volume

**Check log is writing:**
```bash
tail -5 $CERBASEAL_AUDIT_LOG_PATH
```

**Count log entries:**
```bash
wc -l $CERBASEAL_AUDIT_LOG_PATH
```

**Verify chain integrity:**
```bash
pnpm verify:proof
```

**Backup log (manual — do this at end of every session):**
```bash
cp $CERBASEAL_AUDIT_LOG_PATH /backup/cerbaseal/audit-$(date +%Y%m%d-%H%M%S).jsonl
```

The audit log is append-only — do not delete entries or truncate the file. If you need to archive, copy the file and retain the original.

---

## Proof Snapshot Management

The proof snapshot is a signed summary of CerbaSeal's current enforcement state.

**Export:**
```bash
pnpm export:proof
# Output: docs/reports/proof-snapshot.json
```

**Verify:**
```bash
pnpm verify:proof
```

**When to export:**
- After every deployment
- After any configuration change
- Before and after a testing session
- On request from Line Axia or for audit purposes

**Backup:**
```bash
cp docs/reports/proof-snapshot.json /backup/cerbaseal/proof-$(date +%Y%m%d).json
```

---

## User and Role Management

CerbaSeal validates `actorAuthorityClass` values. The mapping between your organization's roles and CerbaSeal authority classes was defined in the workflow mapping workbook.

**Valid authority classes:**
- `ai` — AI / automated system (cannot authorize)
- `senior_analyst`
- `compliance_officer`
- `operations_manager`
- `system` — Trusted non-AI automated process
- `human` — Generic human actor

If a request uses an unrecognized authority class, it will REJECT with `MALFORMED_REQUEST`. Ensure your calling system uses only the approved authority classes defined in your pilot configuration.

**Role-to-class mapping for this deployment:**

*Fill in from your workflow mapping workbook:*

| Organization Role | CerbaSeal Authority Class |
|---|---|
| | |
| | |

---

## Health Check Commands

| Command | What It Checks |
|---|---|
| `pnpm test` | Full test suite — enforcement logic correctness |
| `pnpm audit:repo` | Repo structural integrity — 15 automated checks |
| `pnpm verify:proof` | Proof snapshot integrity — stableChecksum match |
| `pnpm demo:support` | System health — local health check and integrity |
| `pnpm demo:support:validate` | Support readiness validation |

Run these after: initial deployment, restart after downtime, version updates, or any unexpected behavior.

---

## Monitoring for Issues

CerbaSeal does not include built-in monitoring or alerting. During a pilot:

- Run `pnpm demo:support` at the start of each session
- Check the audit log tail after each test run
- Run `pnpm verify:proof` periodically (daily minimum during active testing)
- Monitor disk space for the audit log directory

**Signs of an issue:**
- Test suite fails
- Proof checksum does not match
- Audit log file is not growing after evaluations
- Service produces unexpected outcomes (e.g., ALLOW when REJECT expected)

If any of these occur, stop and follow the escalation path.

---

## Version Management

CerbaSeal-Core is version-controlled in Git. The current pilot version is `v0.1.0`.

**Check current version:**
```bash
cat package.json | grep '"version"'
```

**Do not update the version during a pilot** without explicit approval from Lamont Labs. A version change may affect enforcement behavior and invalidates the stableChecksum. Any version update requires re-running the full verification checklist.

---

## Security Practices

- Do not expose the CerbaSeal service port publicly — restrict to internal network or specific calling systems
- Do not share the `.env` file or its contents
- Do not commit `.env` to version control
- Do not share audit log files containing client data without appropriate data handling procedures
- If using `CERBASEAL_SIGNING_KEY`, treat it as a secret — rotate it following your organization's key management policy
- If you share a request object for support purposes, redact personal data before sending

---

## Escalation Path

1. Check `troubleshooting-guide.md` for the symptom
2. Attempt the safe actions described there
3. Contact your Line Axia account contact with:
   - Symptom description
   - Commands run and their output
   - CerbaSeal version (`cat package.json | grep version`)
   - Node.js version (`node --version`)
   - OS and environment details
4. Line Axia escalates to Lamont Labs as needed

**What to include in any escalation:**
- Exact error message or unexpected output
- The `requestId` if related to a specific evaluation
- Whether the issue is reproducible or intermittent
- What changed before the issue appeared (version, config, restart, new deployment)
