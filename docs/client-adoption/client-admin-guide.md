# CerbaSeal — Client Admin Guide

**Audience:** Client technical/administrative owner  
**Purpose:** Define the client administrator role, responsibilities, and boundaries during a CerbaSeal pilot.  
**Version:** CerbaSeal-Core v0.1.0

---

## Your Role as Client Admin

The client admin is the named technical and operational owner of CerbaSeal within your organization during the pilot. This role is essential — without a named client admin, a pilot cannot proceed.

You are responsible for:
- Owning the deployment in your environment
- Maintaining the audit log and evidence files
- Managing access to the CerbaSeal service within your organization
- Escalating issues to Line Axia through the defined support path
- Making decisions about your deployment environment

You are not responsible for:
- The enforcement core logic — that is maintained by Lamont Labs
- Commercial negotiations — that is managed by Line Axia
- Legal or regulatory interpretations of evidence — that requires your legal team and Line Axia's advisory input

---

## Deployment Ownership

CerbaSeal operates in a client-controlled deployment (Mode C). This means:

**You own the environment.** CerbaSeal runs on infrastructure you control. Lamont Labs does not have access to your server, your network, or your data.

**You own the process lifecycle.** You start, stop, and restart the CerbaSeal service. No external party can do this on your behalf without direct access to your environment.

**You own the configuration.** Environment variables, file paths, and deployment parameters are set by you. Lamont Labs can advise on configuration — they cannot change it remotely.

**Your deployment responsibilities:**

| Responsibility | Description |
|---|---|
| Service startup and shutdown | Start and stop CerbaSeal as needed |
| Environment variable management | Maintain `.env` file with correct values |
| Node.js and dependency version management | Keep Node.js 18+ and dependencies current |
| Port and network configuration | Expose or restrict CerbaSeal service ports within your network |
| Server availability | Ensure the server running CerbaSeal is available when the workflow requires it |
| Disk space management | Monitor and manage disk space for audit log files |

---

## Audit File Ownership

The audit log file is yours. It contains a hash-chained record of every enforcement decision made during the pilot.

**Your audit file responsibilities:**

| Responsibility | Description |
|---|---|
| File path selection | You choose where the audit log is stored on your infrastructure |
| File permissions | Restrict read/write access to authorized personnel only |
| Backup | Back up the audit log file regularly — it is not automatically backed up by CerbaSeal |
| Retention | Retain the audit log for the period agreed in your working agreement |
| Access control | Define who in your organization can read the audit log |

**What the audit log contains:**
- A JSON Lines (`.jsonl`) file
- One record per enforcement evaluation
- Each record includes: event type, outcome (ALLOW/HOLD/REJECT), request ID, timestamp, and SHA-256 hash link to the previous record
- No personal data beyond what was included in the original request object

**What the audit log does not contain:**
- Lamont Labs credentials or access tokens
- Line Axia contact information
- Data that leaves your environment

**Checking audit log integrity:**

```bash
pnpm verify:proof
```

This verifies the hash chain is intact. Run this periodically and whenever you want to confirm the log has not been tampered with.

---

## Evidence Retention Responsibility

CerbaSeal produces evidence bundles for every evaluation. Evidence bundles are stored in the audit log file.

You are responsible for:
- Retaining evidence for the period specified in your working agreement
- Ensuring evidence is not deleted during the pilot
- Providing evidence to auditors, regulators, or Line Axia on request (per your working agreement terms)

Lamont Labs and Line Axia do not retain copies of your evidence. If you delete the audit log file, the evidence is gone.

**Recommended retention practice:** At the end of each pilot session, copy the audit log file to a backup location. Label it with the date and session identifier.

---

## User and Role Mapping Responsibility

CerbaSeal validates `actorAuthorityClass` values. The mapping between your organization's actual roles (e.g., "Senior Fraud Analyst") and CerbaSeal's authority class identifiers (e.g., `senior_analyst`) is your responsibility to define and maintain.

**This mapping must be:**
- Agreed during the workflow mapping workbook session
- Documented in the pilot configuration
- Communicated to anyone who constructs `GovernedRequest` objects in your system

**Valid authority class values:**
- `ai` — AI or automated system (cannot authorize its own proposals)
- `senior_analyst` — Senior analyst or equivalent
- `compliance_officer` — Compliance officer or equivalent
- `operations_manager` — Operations manager or equivalent
- `system` — Trusted system process (non-AI)
- `human` — Generic human actor

If your organization requires a custom authority class not in this list, contact Lamont Labs through Line Axia. This requires a code change and is outside pilot scope.

---

## Backup Responsibility

CerbaSeal does not perform automatic backups. You are responsible for:

| Item | Backup Frequency | What to Back Up |
|---|---|---|
| Audit log file (`*.jsonl`) | End of every testing session | Copy to a separate storage location |
| Proof snapshot | After every `pnpm export:proof` run | `docs/reports/proof-snapshot.json` |
| Environment configuration | Whenever `.env` changes | Secure copy of `.env` (never commit to version control) |
| CerbaSeal-Core repository | As needed | `git bundle` or equivalent |

---

## Environment Responsibility

Your environment is your responsibility. Lamont Labs and Line Axia do not manage, monitor, or have access to your server or infrastructure.

**Environment checklist:**

| Item | Your Responsibility |
|---|---|
| Node.js 18+ installed | Yes |
| Server availability | Yes |
| Network access controls | Yes — restrict access to CerbaSeal service as appropriate |
| Operating system patches | Yes |
| Firewall rules | Yes |
| Secrets management | Yes — `.env` file contents are your responsibility |

**CerbaSeal's environment footprint:**
- Runs as a Node.js process
- No outbound network connections required
- No external API calls (zero-dependency enforcement core)
- Writes only to the configured audit log file path
- Reads environment variables from the process environment

---

## Security Boundary Responsibility

You are responsible for the security of the environment in which CerbaSeal runs.

**What CerbaSeal does:**
- Evaluates `GovernedRequest` objects submitted by your calling system
- Produces `GateResult` objects returned to your calling system
- Writes to the audit log file

**What CerbaSeal does not do:**
- Make outbound network connections
- Access external APIs
- Store credentials
- Transmit data to Lamont Labs or Line Axia
- Access any system other than the audit log file path

**Your security responsibilities:**
- Control who can submit requests to CerbaSeal (your API surface, not CerbaSeal's)
- Control who can read the audit log file
- Control who can access the server environment
- Ensure the calling system (the system that submits `GovernedRequest` objects) is trustworthy — CerbaSeal trusts the caller's declared fields

**Known security boundary:** CerbaSeal trusts caller-declared fields (e.g., `loggingReady`, `trustState.trusted`, `actorAuthorityClass`). The enforcement core does not independently verify these values. Your calling system is responsible for ensuring accurate declarations.

See `docs/security/access-control-and-rate-limiting.md` for production-grade access control design considerations.

---

## What Lamont Labs Does Not Access

In a client-controlled (Mode C) deployment:

| Item | Lamont Labs Access |
|---|---|
| Your server or infrastructure | None |
| Your audit log file | None |
| Your `.env` configuration | None |
| Your GovernedRequest data | None (unless you share it explicitly for support) |
| Your network | None |

If you share data for support purposes (e.g., sharing a request object to debug an unexpected REJECT), you control what you share. Redact personal data before sharing.

---

## What Line Axia Supports

Line Axia is your primary point of contact during the pilot. They support:

- Workflow mapping and configuration guidance
- Escalation of technical issues to Lamont Labs
- Commercial and agreement questions
- Compliance advisory (what the evidence means in your regulatory context)
- Training and onboarding facilitation

Line Axia does not provide:
- Direct access to CerbaSeal source code changes
- Infrastructure management in your environment
- Legal or regulatory certification

---

## What Requires Client Approval

The following require your explicit approval before action:

| Action | Why Approval Is Needed |
|---|---|
| Changes to the enforcement core | Any change to CerbaSeal source code affects enforcement behavior |
| Changes to the audit log path or format | Affects evidence continuity |
| Addition of new workflows to the pilot | Beyond agreed pilot scope |
| Version upgrades during the pilot | May affect enforcement behavior |
| Sharing of audit log data with third parties | Evidence ownership is yours |

Do not allow changes to any of the above without explicit documented approval from your named technical owner.

---

## Admin Quick Reference

| Task | Command |
|---|---|
| Run full test suite | `pnpm test` |
| Run repo audit | `pnpm audit:repo` |
| Export proof snapshot | `pnpm export:proof` |
| Verify proof snapshot | `pnpm verify:proof` |
| Run health check | `pnpm demo:support` |
| Start browser demo | `pnpm demo:web` |
| View audit report | `pnpm demo:audit` |
| Check audit log file | `cat $CERBASEAL_AUDIT_LOG_PATH \| tail -10` |

---

## Escalation Path

1. Try to resolve using `docs/client-adoption/troubleshooting-guide.md`
2. Contact your Line Axia account contact with the symptom and what you tried
3. Line Axia escalates to Lamont Labs where needed

Response times are per the agreed support SLA in your working agreement.
