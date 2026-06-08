# CerbaSeal Operational Runbook

**Version:** 0.1.0  
**Classification:** Pilot Operations — Lamont Labs Confidential  
**Audience:** Lamont Labs technical staff and authorized Line Axia integration contacts

---

## 1. Purpose

This runbook describes how to operate, monitor, and maintain a CerbaSeal-Core enforcement node during the pilot period. It is scoped to the Mode C (client-controlled) deployment described in `mode-c-client-controlled.md`.

---

## 2. Prerequisites

| Requirement | Minimum | Notes |
|---|---|---|
| Node.js | 22.x LTS | Tested on v22.22.0 |
| pnpm | 10.x | Tested on 10.26.1 |
| OS | Linux (Ubuntu 22.04+) or macOS 14+ | Windows not supported for pilot |
| RAM | 512 MB | In-memory audit log; scale with volume |
| Disk | 1 GB | For persistent audit log + JSONL storage |

---

## 3. Installation

```bash
# Clone and install
git clone https://github.com/Lamont-Labs/CerbaSeal-Core.git
cd CerbaSeal-Core
pnpm install --frozen-lockfile

# Verify baseline
pnpm test
pnpm audit:repo
pnpm export:proof
pnpm verify:proof
```

All four commands must exit 0 before any integration work begins.

---

## 4. Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `NODE_ENV` | No | Set to `production` for live deployments |
| `CERBASEAL_SIGNING_KEY` | No | 32+ character secret for optional proof-snapshot HMAC signing |
| `CERBASEAL_AUDIT_LOG_PATH` | No | Filesystem path for persistent JSONL audit log; defaults to in-memory if unset |

**Key management:**
- `CERBASEAL_SIGNING_KEY` must not be stored in version control.
- Rotate keys using a deployment secret manager (e.g., AWS Secrets Manager, HashiCorp Vault).

---

## 5. Starting the Enforcement Node

CerbaSeal-Core is a library, not a standalone server. There is no HTTP surface to start. Integration points are through the TypeScript API.

```typescript
import { ExecutionGateService } from "@lamont-labs/cerbaseal-core";
import { AppendOnlyLogService } from "@lamont-labs/cerbaseal-core";
import { EvidenceBundleService } from "@lamont-labs/cerbaseal-core";

const gate = new ExecutionGateService();
const log = new AppendOnlyLogService();           // in-memory, or
// const log = new FileBackedAppendOnlyLogService("/var/data/cerbaseal-audit.jsonl");
const evidence = new EvidenceBundleService(log);
```

---

## 6. Health Checks

### 6.1 Pre-flight Verification

Run before any production traffic:

```bash
pnpm test                 # 431 tests must pass
pnpm check:invariants     # 12/12 invariants covered
pnpm audit:repo           # 15/15 checks passed
pnpm verify:proof         # stableChecksum verified
```

### 6.2 Audit Chain Integrity

Call `log.verifyChain()` programmatically at any time. Returns `true` if the chain is intact, `false` if any entry has been tampered with. Log verification failures as critical incidents.

---

## 7. Monitoring (Pilot Scope)

During the pilot, monitoring is operator-managed. Recommended signals:

| Signal | How to Capture |
|---|---|
| Gate evaluation results | Log `result.decisionEnvelope.finalState` per request |
| Chain integrity failures | Alert on `log.verifyChain() === false` |
| HOLD accumulation | Alert if HOLD queue exceeds configurable threshold |
| Test pass rate | Run `pnpm test` in CI on every push |

---

## 8. Audit Log Persistence

### In-Memory (default)
- Entries are lost on process restart.
- Suitable for testing and demo purposes only.

### File-Backed (recommended for pilot)
```typescript
import { FileBackedAppendOnlyLogService } from "@lamont-labs/cerbaseal-core";

const log = new FileBackedAppendOnlyLogService("/var/data/cerbaseal-audit.jsonl");
```
- Entries are persisted as JSONL (one JSON object per line).
- Chain is loaded from disk on construction and verified automatically.
- Append operations are synchronous for crash safety (no partial writes).

---

## 9. Backup and Recovery

### Backup
```bash
# Copy the JSONL file
cp /var/data/cerbaseal-audit.jsonl /backups/cerbaseal-audit-$(date +%Y%m%d-%H%M%S).jsonl
```

### Recovery Verification
After restoring from backup, verify chain integrity:
```typescript
const log = new FileBackedAppendOnlyLogService("/var/data/cerbaseal-audit.jsonl");
const intact = log.verifyChain();
// intact must be true before resuming operations
```

---

## 10. Incident Response

| Severity | Condition | Action |
|---|---|---|
| P0 | `verifyChain()` returns false | Halt processing; preserve log file; contact Lamont Labs |
| P0 | Gate rejects with `MALFORMED_REQUEST` unexpectedly | Check calling code schema against CerbaSeal types |
| P1 | HOLD queue grows without approver action | Escalate to client approver on duty |
| P2 | Any test failure on push | Block merge; investigate before deploying |

**Lamont Labs contact:** jesse@lamontlabs.io

---

## 11. Upgrading

1. Run `pnpm test` and `pnpm export:proof` **before** upgrading to capture the baseline `stableChecksum`.
2. Update the dependency version.
3. Run `pnpm install --frozen-lockfile`.
4. Run `pnpm test`, `pnpm audit:repo`, `pnpm export:proof`.
5. Compare the new `stableChecksum` against the pre-upgrade snapshot. If it changed, review the diff before deploying.

---

*Last updated: 2026-06-04 — CerbaSeal v0.1.0 pilot*
