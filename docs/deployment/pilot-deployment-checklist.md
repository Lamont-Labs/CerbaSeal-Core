# Pilot Deployment Checklist

**Version:** 0.1.0  
**Classification:** Lamont Labs / Line Axia Confidential  
**Use:** Complete this checklist before the first governed request is evaluated in the Line Axia pilot environment.

---

## Pre-Deployment (Lamont Labs)

- [ ] Export proof snapshot: `pnpm export:proof`
- [ ] Verify proof snapshot: `pnpm verify:proof` — must output `Status: VERIFIED`
- [ ] Record `stableChecksum` from `docs/reports/proof-snapshot.json`
- [ ] Confirm all 415 tests pass: `pnpm test`
- [ ] Confirm 15/15 audit checks pass: `pnpm audit:repo`
- [ ] Confirm 12/12 invariants covered: `pnpm check:invariants`
- [ ] Tag release in git with version matching `package.json`
- [ ] Deliver proof snapshot to Line Axia integration contact

---

## Environment Setup (Line Axia)

- [ ] Node.js 22.x LTS installed: `node --version` → `v22.x.x`
- [ ] pnpm 10.x installed: `pnpm --version` → `10.x.x`
- [ ] Clone or install CerbaSeal-Core at the agreed pinned version
- [ ] Run `pnpm install --frozen-lockfile` — no unexpected dependency changes
- [ ] Run `pnpm test` — all tests pass in Line Axia environment
- [ ] Run `pnpm audit:repo` — 15/15 checks pass
- [ ] Run `pnpm verify:proof` — `stableChecksum` matches Lamont Labs delivery
- [ ] Persistent volume provisioned for JSONL audit log
- [ ] File permissions set: audit log file owned by CerbaSeal process user, not world-readable
- [ ] `CERBASEAL_SIGNING_KEY` set in deployment secrets (optional but recommended)

---

## Integration Adapter Verification (Line Axia)

- [ ] `GovernedRequest` construction verified against CerbaSeal type definitions
- [ ] All `actorAuthorityClass` values in the adapter map to a valid CerbaSeal class
- [ ] `fraud_triage` workflow always supplies a human `approvalArtifact`
- [ ] `approvalArtifact.approvedAt` is set at approval time (not copied from template)
- [ ] `approvalArtifact.forRequestId` is set to the specific request being approved
- [ ] `loggingReady` is only set to `true` after confirming audit log is writable
- [ ] `proposedActionClass` and `proposal.requestedActionClass` are always identical

---

## First Governed Request (Joint — Lamont Labs + Line Axia)

- [ ] Execute one test request through the full flow
- [ ] Confirm `result.decisionEnvelope.finalState` is as expected
- [ ] Confirm `log.verifyChain()` returns `true` after first request
- [ ] Confirm JSONL audit file has at least one entry
- [ ] Confirm evidence bundle is produced successfully
- [ ] Confirm replay produces same outcome: `replay.matchedOriginalOutcome === true`

---

## Pilot Go / No-Go Gate

All items above must be checked before marking pilot as live.

| Check | Result | Notes |
|---|---|---|
| stableChecksum match | | Record the verified checksum here |
| All tests pass in Line Axia environment | | Record test count |
| First governed request validated | | Record requestId |
| Chain integrity confirmed | | `verifyChain() === true` |

**Authorized by (Lamont Labs):** Jesse J. Lamont  
**Authorized by (Line Axia):** ______________________  
**Date:** ______________________

---

*Last updated: 2026-06-04 — CerbaSeal v0.1.0 pilot*
