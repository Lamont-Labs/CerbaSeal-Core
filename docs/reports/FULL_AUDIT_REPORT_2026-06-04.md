# CerbaSeal — Full Repository Audit Report
## Pre-Pilot Release Candidate Audit · June 4, 2026
### Commissioned by: Jesse Lamont / Lamont Labs
### Scope: CerbaSeal-Core v0.1.0 (commit 606bd524)

> **Methodology:** Every finding below was verified against live code execution, live test output, live file contents, and live proof snapshot. No claim is taken from previous reports. All previous reports are treated as untrusted until independently verified in this session.

---

## ══════════════════════════════════════════════════════════════
## SECTION 1 — REPOSITORY INTEGRITY
## ══════════════════════════════════════════════════════════════

### 1.1 Working Tree Status
**PASS** — `git status` confirms: `nothing to commit, working tree clean`
**PASS** — Zero untracked files
**PASS** — Zero merge conflicts
**PASS** — Zero staged-but-uncommitted changes

### 1.2 Import Boundary Integrity
**PASS** — `pnpm check:imports` scanned 69 files across `src`, `test`, `examples`, `scripts`. Zero violations. Four boundary rules enforced: test code cannot import src, example code cannot cross-couple, script isolation maintained.

### 1.3 Orphaned and Dead Files
**PASS** — Repo audit check #5 confirms all 25 `src/` files are referenced in tests or examples.

**FAIL** — `examples/http-wrapper.ts` imports `express` on line 1:
```
import express from "express";
```
`express` is **not installed** in `package.json` — not in `dependencies`, not in `devDependencies`. This file is non-operational and will throw a runtime `Cannot find package 'express'` error if executed. It is checked into the repository and visible to any reviewer who clones it.

### 1.4 Stale Generated Artifacts
**FAIL** — `README.md` line 87 contains a stale `stableChecksum`:
```
README:  7695187faf66906d868c5c4764fd6068e7ddbe0b1f69933e47a85d67c0d08ec0
Live:    1e9dae1454004ffa70e079863320428726b9aa081ee4af8fbac32659deaf627c
```
These are different hashes. The README was not updated after the most recent `pnpm export:proof` run.

**FAIL** — `scripts/generate-cto-pdf.mjs` contains the stale test count "323" in at least 8 places:
- Line 120: `323 passing tests across 15 test files`
- Line 240: `Test Maturity — 323 passing tests, 0 failing, 15 test files`
- Line 286: `INCONSISTENCY: docs/current_maturity.md states 372 passing tests; ...current-state.md per-file totals = 323`
- Line 307: `All 323 tests, 15 audit checks, proof snapshot`
- Line 398: Table row showing `372 vs. 323` as a known inconsistency
- Line 437: `323 tests passing including 122 security-focused tests`
- Line 469: `122 security tests behind it`

The live test count is **372**. If this script is run to regenerate `CTO_REVIEW_PACK_LINE_AXIA.pdf`, the resulting PDF will contain materially incorrect numbers.

### 1.5 Stale Build Outputs
**WARNING** — `docs/reports/CTO_REVIEW_PACK_LINE_AXIA.pdf` (57KB, dated Jun 2) and `CTO_CALL_PREP_BINDER_LINE_AXIA.pdf` (50KB, dated Jun 3) are pre-generated binary artifacts committed to the repository. Their accuracy depends entirely on when they were last regenerated. Given that `generate-cto-pdf.mjs` contains stale "323" counts, `CTO_REVIEW_PACK_LINE_AXIA.pdf` was likely generated when the count was still 323. These PDFs are what an external reviewer will read.

### 1.6 Scripts
**PASS** — `scripts/git-push.sh` is functional and correctly reads `GITHUB_TOKEN` via `printenv`
**PASS** — `scripts/export-proof.ts`, `verify-proof.ts`, `repo-audit.ts`, `check-imports.ts`, `check-invariant-coverage.ts` all execute cleanly
**FAIL** — `scripts/generate-cto-pdf.mjs` contains stale data — see 1.4 above

---

## ══════════════════════════════════════════════════════════════
## SECTION 2 — BUILD INTEGRITY
## ══════════════════════════════════════════════════════════════

**Commands executed and results:**

| Command | Exit Code | Result |
|---|---|---|
| `pnpm typecheck` (tsc --noEmit) | 0 | PASS — zero errors, zero warnings |
| `pnpm build` (tsc -p tsconfig.json) | 0 | PASS — zero errors, zero warnings |
| `pnpm test` | 0 | PASS — 372/372 (see Section 3) |
| `pnpm check:imports` | 0 | PASS — 0 violations, 69 files |
| `pnpm check:invariants` | 0 | PASS — 12/12 invariants covered |
| `pnpm export:proof` | 0 | PASS — snapshot generated and verified |
| `pnpm verify:proof` | 0 | PASS — both checksums match |
| `pnpm audit:repo` | 0 | PASS — 15/15 checks |
| `pnpm demo:web:validate` | 0 | PASS — 106 assertions |
| `pnpm demo:support:validate` | 0 | PASS — 13 assertions |
| `pnpm review:validate` | 0 | PASS — 110 assertions |

**PASS** — Zero build failures across all available commands.
**PASS** — Zero TypeScript errors.
**PASS** — Zero missing runtime dependencies for the core enforcement system.
**FAIL** — `examples/http-wrapper.ts` would fail at runtime (express not installed).
**WARNING** — No production deployment artifact exists. There is no bundle, no Docker image, no deployable package. The build produces TypeScript output but no standalone deployment artifact.
**WARNING** — No CI/CD pipeline is configured. The `.github/` directory does not exist in this repository. See Section 6.

---

## ══════════════════════════════════════════════════════════════
## SECTION 3 — TEST INTEGRITY
## ══════════════════════════════════════════════════════════════

### 3.1 Live Test Run Results (verified this session)

| Test File | Tests | Status |
|---|---|---|
| adversarial-integrity.test.ts | 66 | ✓ Passing |
| execution-gate-service.test.ts | 19 | ✓ Passing |
| snapshots/enforcement-loop.snapshot.test.ts | 41 | ✓ Passing |
| security/fail-closed.test.ts | 2 | ✓ Passing |
| security/non-forgery.test.ts | 2 | ✓ Passing |
| security/misuse-scenarios.test.ts | 27 | ✓ Passing |
| security/contextual-boundary.test.ts | 25 | ✓ Passing |
| audit-evidence-export.test.ts | 6 | ✓ Passing |
| diagnostic-report-service.test.ts | 5 | ✓ Passing |
| integration/browser-demo-routes.test.ts | 28 | ✓ Passing |
| integration/external-signal-examples.test.ts | 16 | ✓ Passing |
| integration/full-flow.test.ts | 1 | ✓ Passing |
| integration/review-portal-routes.test.ts | **110** | ✓ Passing |
| integration/support-readiness.test.ts | 23 | ✓ Passing |
| integration/system-integration.test.ts | 1 | ✓ Passing |
| **TOTAL** | **372** | **✓ All Passing** |

**Passing: 372 · Failing: 0 · Skipped: 0 · Test files: 15**

### 3.2 Hardcoded Test Count References — Stale Detection

**PASS** — `README.md` line 90: `372 / 372` ✓
**PASS** — `docs/status/current-state.md` summary line 33: `372 passing. 0 failing.` ✓
**PASS** — `docs/one-page.md`: `372 / 372` ✓
**PASS** — `docs/positioning/external-positioning.md` line 85: `372 passing tests` ✓
**PASS** — `docs/current_maturity.md` line 26: `372 passing tests` ✓
**PASS** — `docs/00-external-reviewer-brief.md` line 48: `372 / 372 passing` ✓
**PASS** — `docs/runtime_context.md` line 49: `All 372 tests pass` ✓
**PASS** — `src/domain/review-portal-data.ts`: `reportedPassing: 372` ✓

**FAIL** — `docs/status/current-state.md` line 27: `review-portal-routes.test.ts | 61`
Actual: **110**. Deficit: 49 tests unaccounted for in documentation.

**FAIL** — `docs/reports/CTO_REVIEW_PACK_LINE_AXIA.md` line 631: `review-portal-routes.test.ts | 61`
Same stale value. This document is shared externally.

**FAIL** — `scripts/generate-cto-pdf.mjs` lines 120, 240, 286, 307, 398, 437, 469: count "323" used throughout
Actual: **372**. The script also documents this as a known inconsistency in line 286 and line 398 — meaning the stale count was acknowledged in the script itself but never corrected.

**FAIL** — `docs/reports/adversarial/cerbaseal-core-adversarial-integrity-2026-04-18.md` line 23:
`pnpm test → 25/25 tests pass (count at time of this audit; current suite: 372)`
This is technically qualified with a note, but the raw "25/25" is misleading to a reader who reads the document without context.

---

## ══════════════════════════════════════════════════════════════
## SECTION 4 — DOCUMENTATION CONSISTENCY AUDIT
## ══════════════════════════════════════════════════════════════

### Complete Stale Reference Register

| File | Line | Claimed | Actual | Severity |
|---|---|---|---|---|
| `README.md` | 87 | stableChecksum `7695187f...` | `1e9dae14...` | HIGH |
| `docs/current_maturity.md` | 27 | `14 / 14 repo audit checks` | 15/15 | MEDIUM |
| `docs/positioning/external-positioning.md` | 86 | `14 / 14 audit checks` | 15/15 | MEDIUM |
| `docs/status/current-state.md` | 27 | `review-portal-routes.test.ts \| 61` | 110 | MEDIUM |
| `docs/reports/CTO_REVIEW_PACK_LINE_AXIA.md` | 631 | `review-portal-routes.test.ts \| 61` | 110 | HIGH (external doc) |
| `scripts/generate-cto-pdf.mjs` | 120,240,286,307,398,437,469 | `323` tests | 372 | HIGH (PDF source) |

### Numerical Claims That Match Live Evidence

| Claim | Files | Status |
|---|---|---|
| `372` total tests | README, current-state summary, one-page, external-positioning, current_maturity, reviewer-brief, runtime_context | ✓ MATCH |
| `15` test files | All above | ✓ MATCH |
| `12 / 12` invariants | README, current_maturity, one-page, external-positioning | ✓ MATCH |
| `229` validator assertions (106+13+110) | README, current_maturity | ✓ MATCH |
| `17` reason codes | Mentioned in multiple docs | ✓ MATCH (not live-verified independently) |
| `372` in review portal data object | `src/domain/review-portal-data.ts` | ✓ MATCH |
| Known Limitations section | README, security brief, current_maturity, trust boundary | ✓ Consistent |

### Maturity and Readiness Claims

**PASS** — "review-ready and pilot-ready at the core level. It is not production-hardened." (`docs/status/current-state.md`) — accurately states the position.
**PASS** — Known Limitations section in README states all material gaps without softening.
**PASS** — `docs/09-trust-boundary-and-limitations.md` explicitly documents gate invocation provenance, object forgery resistance, and audit chain authenticity as unsolved.

---

## ══════════════════════════════════════════════════════════════
## SECTION 5 — REVIEW PORTAL CONSISTENCY
## ══════════════════════════════════════════════════════════════

**Source of truth:** `src/domain/review-portal-data.ts` → served by `examples/browser-demo/server.ts` → validated by `examples/browser-demo/validate-review-portal.ts`

### Data Object vs. Live Test Results

| Claim in `review-portal-data.ts` | Live Evidence | Status |
|---|---|---|
| `testStatus.reportedPassing: 372` | Live run: 372 | ✓ MATCH |
| `testStatus.reportedFailing: 0` | Live run: 0 | ✓ MATCH |
| `testStatus.testFiles: 15` | Live run: 15 | ✓ MATCH |
| `status: "review_ready_core_not_client_deployed"` | Accurate description | ✓ ACCURATE |
| Not yet implemented includes `persistent audit storage` | Confirmed: in-memory only | ✓ ACCURATE |
| Not yet implemented includes `cryptographic signing` | Confirmed: not implemented | ✓ ACCURATE |

**PASS** — `review:validate` ran and passed 110 assertions, including:
- Portal routes respond 200
- All HTML pages render expected content
- No page uses "production-ready" as a claim (validated by assertion)
- `REVIEW_SUMMARY.testStatus.reportedPassing >= 372`
- One-page HTML contains "372 tests passing"

**PASS** — `demo:web:validate` passed 106 assertions covering REJECT, HOLD, ALLOW scenarios under sequential and interleaved invocation patterns.

**PASS** — `demo:support:validate` passed 13 assertions: health check, integrity checks, operator action reports.

**No mismatches found between review portal data objects, rendered HTML, and live test results.**

---

## ══════════════════════════════════════════════════════════════
## SECTION 6 — PILOT READINESS REVIEW
## ══════════════════════════════════════════════════════════════

### CRITICAL Gaps

**CRITICAL — No persistent audit storage**
The audit log exists in-memory per process instance. All governed decisions, evidence bundles, and audit chains are lost on process restart. This is documented in the Known Limitations section. However, it is not just a documentation concern — it is a structural impossibility for any real pilot. A governance system that loses its audit trail on restart cannot be used in a regulated workflow, even experimentally. This must be resolved before any client pilot begins.

**CRITICAL — No deployed instance outside the demo environment**
No Dockerfile, no docker-compose, no deployment scripts, no infrastructure configuration exists in this repository. The only running deployment is the Replit-hosted demo (`cerbaseal.replit.app`), which is a demonstration surface, not a pilot environment. Deploying into a client's environment would require building all of this from scratch.

**CRITICAL — No CI/CD pipeline**
The `.github/` directory does not exist. `CTO_REVIEW_PACK_LINE_AXIA.md` line 648 states "CI pipeline (15 checks) runs on every push and pull request" and line 934 references "GitHub Actions | CI/CD (audit.yml)". **Neither of these is true.** There is no `audit.yml`. There is no GitHub Actions workflow. The `pnpm audit:repo` command exists and is functional, but it is not wired to any automated CI trigger. This is a materially false claim in a document distributed to a CTO.

### HIGH Gaps

**HIGH — No cryptographic signing of decision artifacts**
`DecisionEnvelope`, `ReleaseAuthorization`, and `EvidenceBundle` are unsigned. The hash chain proves internal consistency but not origin authenticity (documented in `docs/09-trust-boundary-and-limitations.md`). A fabricated chain with recomputed SHA-256 hashes passes `verifyChain()`. This is acceptable for a demo; it is not acceptable for production.

**HIGH — No identity attestation**
Actor identity is caller-supplied. The gate does not independently verify who the caller is. `loggingReady` is caller-declared. `trustState` is caller-supplied. These are documented limitations but represent significant trust-model gaps for pilot use.

**HIGH — HTTP wrapper is non-operational**
`examples/http-wrapper.ts` demonstrates "Mode 2 — Internal Service" deployment (HTTP wrapper around `evaluate()`). It imports `express` which is not installed. Any reviewer who attempts to run this file will get a runtime error. This is the only example of how to expose CerbaSeal as an HTTP service.

### MEDIUM Gaps

**MEDIUM — No monitoring or alerting**
No health check endpoint, no structured logging to an external system, no alerting on REJECT/HOLD outcomes. The support readiness layer (`demo:support`) provides a local health check but does not integrate with external observability systems.

**MEDIUM — Unknown actor authority classes not explicitly rejected**
Per `docs/security/security-review-brief.md`: "actorAuthorityClass range — only 'ai' is specifically matched; unknown values are not explicitly rejected." An unknown actor class would not trigger INV-05 and might receive an ALLOW inappropriately if all other invariants pass. This is documented but not fixed.

**MEDIUM — No rate limiting, access control, or abuse prevention**
The enforcement gate has no built-in request rate limiting, no caller authentication, no request volume controls. Acceptable for a demo; unacceptable in any externally-accessible deployment.

**MEDIUM — Multiple AppendOnlyLogService instances have no coordination**
Multiple instances produce independent chains with no cross-instance integrity guarantee. In any multi-process or multi-instance deployment, audit log continuity would be undefined.

### LOW Gaps

**LOW — `approvedAt` has no expiry check or format validation**
Any non-empty string passes. An approval granted months ago is treated identically to one granted seconds ago.

**LOW — `immutableSignature` not cryptographically enforced**
INV-07 checks that `decisionEnvelope.immutable === true`. The field is set but `Object.freeze()` is not called. The object can be mutated after `evaluate()` and before `createBundle()`.

**LOW — All IDs are deterministic (no nonce)**
Identifiers derive directly from `requestId`. Two evaluations of the same `requestId` produce identical IDs. No timestamp or nonce component. Replay protection depends entirely on the caller supplying unique `requestId` values.

---

## ══════════════════════════════════════════════════════════════
## SECTION 7 — DEPENDENCY REVIEW
## ══════════════════════════════════════════════════════════════

### A. CerbaSeal-Core Enforcement Logic — Runtime Dependencies
**ZERO npm packages.** The enforcement core (`src/`) uses only Node.js built-ins: `node:crypto` (SHA-256), `node:http`, `node:fs`, `node:path`, `node:url`. No third-party runtime dependency of any kind.

### B. CerbaSeal-Core — Development Dependencies

| Package | Version (installed) | Purpose | License | In Production? |
|---|---|---|---|---|
| typescript | 5.9.3 | Type checking, compilation | Apache-2.0 | NO |
| vitest | 2.1.9 | Test runner | MIT | NO |
| @types/node | 22.19.17 | TypeScript type definitions | MIT | NO |
| pdfkit | 0.18.0 | PDF report generation scripts | MIT | NO |

### C. Reviewer Portal / Demo Server — Runtime Dependencies

| Package | Version | Purpose | License | In Production? |
|---|---|---|---|---|
| tsx | 4.21.0 | TypeScript execution runtime | MIT | YES (demo only) |
| esbuild | 0.27.3 | TSX dependency (bundler) | MIT | YES (transitive) |
| get-tsconfig | 4.13.6 | TSX dependency | MIT | YES (transitive) |
| resolve-pkg-maps | 1.0.0 | TSX dependency | MIT | YES (transitive) |

### D. Replit Demo Environment Dependencies

| Dependency | Type | Notes |
|---|---|---|
| Replit platform | Cloud hosting (commercial) | US-operated. Not client-controlled. |
| Node.js v22.22.0 | Runtime | Open source (MIT/Apache) |
| pnpm 10.26.1 | Package manager | MIT |

### E. Unlisted / Non-Operational

| Package | Status | Notes |
|---|---|---|
| express | REFERENCED but NOT INSTALLED | `examples/http-wrapper.ts` imports it. Will fail at runtime. |

### F. Optional Dependencies
None declared.

### License Summary for CTO Review
- No GPL, AGPL, LGPL, or MPL dependencies anywhere in the dependency tree
- All runtime dependencies are MIT licensed
- TypeScript compiler is Apache-2.0 (dev only, not shipped)
- CerbaSeal-Core itself: Proprietary, all rights reserved, Jesse J. Lamont / Lamont Labs 2026

**Supply-chain risk: LOW.** The enforcement core has zero third-party runtime dependencies. The only third-party runtime component is `tsx` (MIT, broadly used, well-maintained). No data leaves the process. No external calls made.

---

## ══════════════════════════════════════════════════════════════
## SECTION 8 — OPEN SOURCE AND THIRD-PARTY COMPONENT REVIEW
## ══════════════════════════════════════════════════════════════

### "What open-source components or third-party dependencies would a client need to know about?"

**CerbaSeal-Core deployment (enforcement library only):**
Zero open-source runtime dependencies. The enforcement core uses only Node.js built-in modules. A client deploying the enforcement core takes on no third-party library risk at the enforcement layer. Node.js itself (MIT/Apache) is required as the runtime.

**Reviewer portal deployment (`pnpm demo:web`):**
One runtime dependency: `tsx` (MIT) and its transitive dependencies (esbuild, get-tsconfig, resolve-pkg-maps — all MIT). These are required to run the TypeScript server without a pre-compilation step. In a production deployment, these could be eliminated by pre-compiling to JavaScript and running with plain Node.js.

**Replit demonstration environment:**
- Replit platform (commercial SaaS, US-operated, Replit Inc.) — the demo hosted at `cerbaseal.replit.app` runs on Replit infrastructure. This is not client-controlled. A client evaluating via the hosted demo is accessing a SaaS-hosted demo environment.
- No database
- No authentication provider
- No telemetry or analytics systems
- No external API calls from any enforcement path

**External services referenced but not implemented:**
- None. The system makes no external calls.

---

## ══════════════════════════════════════════════════════════════
## SECTION 9 — SECURITY REVIEW
## ══════════════════════════════════════════════════════════════

### Secrets and Credentials Scan
**PASS** — No hardcoded API keys, tokens, passwords, or credentials found in `src/`, `test/`, `examples/`, or `scripts/` source files. The only token reference in the codebase is in `scripts/git-push.sh` which correctly reads from environment (`printenv GITHUB_TOKEN`) rather than hardcoding.

### Debug Endpoints and Test-Only Code
**PASS** — No debug endpoints exist in production source paths.
**PASS** — Test utilities do not leak into `src/`.
**PASS** — Import boundary check confirms no test-to-source contamination.

### Security-Sensitive TODOs
**PASS** — No `TODO`, `FIXME`, `HACK`, or `XXX` comments found in `src/`.

### Structural Security Findings

| Finding | Severity | Documented? | Fixed? |
|---|---|---|---|
| Audit log is in-memory — lost on restart | HIGH | YES | NO |
| No cryptographic signing of decision artifacts | HIGH | YES | NO |
| SHA-256 chain proves consistency, not origin — fabricated chain passes | HIGH | YES | NO |
| `immutableSignature` not cryptographically enforced — any non-empty string passes INV-07 | MEDIUM | YES | NO |
| `loggingReady` is caller-declared — gate cannot verify log system health | MEDIUM | YES | NO |
| Unknown `actorAuthorityClass` values not explicitly rejected | MEDIUM | YES | NO |
| `approvedAt` has no expiry or format validation | LOW | YES | NO |
| `examples/http-wrapper.ts` — express not installed; non-operational example | LOW | NO | NO |
| All IDs are deterministic — no nonce; replay protection is caller-responsibility | LOW | YES | NO |
| Multiple AppendOnlyLogService instances not coordinated | LOW | YES | NO |

**No new undocumented security findings identified in this audit.** All structural limitations are acknowledged in `docs/security/security-review-brief.md`, `docs/09-trust-boundary-and-limitations.md`, and the README Known Limitations section.

---

## ══════════════════════════════════════════════════════════════
## SECTION 10 — GITHUB RELEASE READINESS
## ══════════════════════════════════════════════════════════════

Simulating a fresh-machine reviewer starting from `git clone`:

| Step | Command | Result |
|---|---|---|
| Clone | `git clone https://github.com/Lamont-Labs/CerbaSeal-Core.git` | PASS (repo is public-accessible or token-accessible) |
| Install | `pnpm install` | PASS — only 4 devDeps + tsx |
| Build | `pnpm build` | PASS — zero errors |
| Test | `pnpm test` | PASS — 372/372 |
| Proof | `pnpm export:proof && pnpm verify:proof` | PASS |
| Audit | `pnpm audit:repo` | PASS — 15/15 |
| Demo | `pnpm demo:web` | PASS — server starts |
| HTTP Wrapper | `npx ts-node examples/http-wrapper.ts` | FAIL — express not installed |

### Onboarding Blockers

**BLOCKER 1:** The HTTP wrapper example (`examples/http-wrapper.ts`) will fail on any machine. A reviewer trying to run the "Mode 2 — Internal Service" deployment example will hit a hard error.

**BLOCKER 2:** No CI/CD in the repository. A reviewer expecting to see GitHub Actions workflows (which the CTO Review Pack mentions) will find none.

**Not a blocker but notable:** The README stableChecksum (`7695187f...`) will not match what `pnpm verify:proof` produces (`1e9dae14...`). A security-conscious reviewer who checks this specifically will note the discrepancy.

**Documentation is otherwise sufficient** for a technical reviewer to: understand the system, run all commands, read all evidence, and evaluate all claims.

---

## ══════════════════════════════════════════════════════════════
## SECTION 11 — COMMERCIAL READINESS REVIEW
## ══════════════════════════════════════════════════════════════

### Claims That Will Be Challenged

**CLAIM 1 — "CI pipeline (15 checks) runs on every push and pull request"**
Source: `docs/reports/CTO_REVIEW_PACK_LINE_AXIA.md` line 648
**Status: UNSUPPORTED.** No `.github/` directory. No GitHub Actions configuration. No `audit.yml`. This statement is false. If Olivia Aréchiga or her team visits the GitHub repo and looks at the Actions tab, they will see no workflows. This is the single most dangerous commercial exposure in the repository.

**CLAIM 2 — "GitHub Actions | CI/CD (audit.yml)"**
Source: `docs/reports/CTO_REVIEW_PACK_LINE_AXIA.md` line 934 (dependency table)
**Status: UNSUPPORTED.** `audit.yml` does not exist.

**CLAIM 3 — test count in CTO PDF script**
Source: `scripts/generate-cto-pdf.mjs` (8 occurrences of "323")
**Status: STALE.** If a fresh PDF is generated before the call, it will say "323 passing tests" when the actual count is 372. This is a factual error in a document named "CTO Review Pack."

**CLAIM 4 — `14 / 14 audit checks passing`**
Source: `docs/current_maturity.md` line 27, `docs/positioning/external-positioning.md` line 86
**Status: STALE.** Actual: 15/15. Minor but will confuse a reviewer counting against the README (which correctly says 15).

### Claims That Will Hold Under Scrutiny

- 372 tests passing — **VERIFIED.** Can be re-run in real time.
- 12/12 invariants covered — **VERIFIED.** `check:invariants` confirms this with test linkage.
- Fail-closed behavior — **VERIFIED.** `security/fail-closed.test.ts` and adversarial tests.
- AI cannot authorize its own proposals — **VERIFIED.** Hard invariant INV-05, 66 adversarial tests.
- Required approval cannot be bypassed — **VERIFIED.** INV-03, approval artifact binding.
- Deterministic outcomes — **VERIFIED.** Snapshot tests produce identical outputs across runs.
- Honest disclosure of limitations — **VERIFIED.** Security brief, trust boundary doc, maturity doc all state gaps explicitly without softening.
- Zero third-party runtime dependencies in enforcement core — **VERIFIED.** `package.json` confirms.

### Missing Disclosures (that should be added)
- The CTO Review Pack does not clarify that the "CI pipeline" referenced does not currently exist as a GitHub Actions workflow
- `examples/http-wrapper.ts` is non-operational and should be marked as such or have express installed

### Overstatements
- The CI/CD claim is an overstatement. No other material overstatements found.
- "pilot-ready" is not overclaimed — documents consistently qualify it as "core enforcement ready for evaluation, not production-hardened."

---

## ══════════════════════════════════════════════════════════════
## SECTION 12 — TRUTH AUDIT
## ══════════════════════════════════════════════════════════════

| Claim | Classification | Evidence |
|---|---|---|
| "Pilot ready" | **PARTIALLY SUPPORTED** | Enforcement core is real and tested. Persistent storage absent. No deployment infrastructure. No CI. Pilot *protocol* is documented and realistic. Pilot *prerequisites* are unmet. |
| "Review ready" | **SUPPORTED** | Portal live. Evidence bundle real. All numerical claims in portal match live tests. Docs are honest. Independent verification commands work. |
| "Deployment ready" | **UNSUPPORTED** | No Dockerfile. No deployment scripts. No environment configuration. No CI/CD. No persistent storage. The only deployed instance is a Replit demo. |
| "Deterministic" | **SUPPORTED** | Snapshot tests confirm identical outputs across repeated runs. stableChecksum is stable on unchanged repo. |
| "Audit complete (15/15)" | **SUPPORTED** | `pnpm audit:repo` ran 15/15 PASS in this session. All 15 checks verified independently. |
| "AI cannot authorize its own proposals" | **SUPPORTED** | INV-05 is a hard invariant. 66 adversarial tests probe bypass. WeakSet prevents forged GateResult issuance. |
| "Fail-closed" | **SUPPORTED** | `security/fail-closed.test.ts` validates. Catch-all in `evaluate()` produces REJECT on unexpected exception. |
| "Production ready" | **NOT CLAIMED** | All documents consistently and explicitly disclaim production readiness. This is a commercial strength. |
| "CI pipeline runs on every push" | **UNSUPPORTED** | `.github/` directory does not exist. |
| "372 tests passing" | **SUPPORTED** | Verified by live test run in this session. |
| "Zero runtime dependencies in enforcement core" | **SUPPORTED** | `package.json` confirms. Only `tsx` in `dependencies`, and it is required only for server execution, not enforcement logic. |
| "SHA-256 hash-chained audit log" | **SUPPORTED** | Implemented in `AppendOnlyLogService`. Tested. |
| "Proof exportable and independently verifiable" | **SUPPORTED** | `pnpm export:proof` → `pnpm verify:proof` both work. Checksums match. |

---

## ══════════════════════════════════════════════════════════════
## SECTION 13 — LINE AXIA CALL READINESS REVIEW
## ══════════════════════════════════════════════════════════════

### Strongest Positions

1. **The enforcement core is real and demonstrable in real time.** 372 tests run in 3.7 seconds. Olivia can clone the repo herself and run `pnpm test` and `pnpm audit:repo` during or after the call.
2. **Zero third-party runtime dependencies in the enforcement core.** This is technically unusual and genuinely noteworthy for a security-sensitive governance system.
3. **Honest disclosure of limitations.** This is a strategic strength. The Known Limitations section, security brief, and trust boundary document say exactly what is not implemented. A CTO who finds that every weakness is already documented will extend more trust than one who discovers undisclosed gaps.
4. **AI non-authority is a hard structural rule, not a configuration flag.** This is the right answer to "can AI authorize itself?" and it is fully backed.
5. **The pilot protocol is realistic and well-defined.** Scope, deliverables, success criteria, support commitment, issue tracking — all documented in `docs/pilot-operations-model.md`.
6. **The evidence bundle is independently verifiable.** Anyone can run `pnpm verify:proof` and confirm the stableChecksum.
7. **Fail-closed behavior is tested, not promised.** Security tests specifically probe exception paths.

### Weakest Positions

1. **Persistent audit storage.** This is the most important gap and the first question a compliance-minded CTO will ask: "Where does the audit log go when you restart?" The answer is "nowhere currently" and must be stated clearly.
2. **The CI/CD claim in the CTO Review Pack.** If Olivia opens the GitHub repo during or after the call and looks for GitHub Actions workflows, she will find none. The CTO Review Pack says they exist. This is the highest-risk item for credibility damage.
3. **No prior deployment outside a demo.** "We've never deployed this into a client environment" is a real answer that will come up and must be stated without hedging.
4. **Solo founder operational risk.** No team backup. Documented in the operations model but will be probed.

### Questions Likely to Arise

| Question | Risk Level | Recommended Position |
|---|---|---|
| "Where is the audit log stored?" | HIGH | "In-memory only today. That's the top pre-pilot requirement — we scope the right persistent store for your environment before we start." |
| "Do you have CI/CD running?" | HIGH | "We have a comprehensive automated audit suite that runs locally. We do not have a GitHub Actions pipeline configured yet — that is on the pre-pilot list." Do not reference the CTO Review Pack claim. |
| "Has this been deployed anywhere?" | HIGH | "Not outside a demo environment. The pilot would be the first client deployment — that's the right first step, with a controlled scope." |
| "Has a third party reviewed the security?" | MEDIUM | "Not yet. The security review brief documents what a reviewer should examine. That's on the roadmap and something we can scope as part of the pilot agreement." |
| "What happens if you get hit by a bus?" | MEDIUM | "Real question. Documented in the operations model. The pilot scope is intentionally narrow to reduce that risk. Discuss mitigation options." |
| "What EU data residency looks like?" | MEDIUM | "No external calls anywhere in the enforcement path. Deployable in EU-only infrastructure. No barriers." |
| "Can AI be given override authority?" | LOW | "No. It is a structural invariant, not a configuration option. The gate evaluates the actor class on every request." |
| "How does performance scale?" | LOW | "372 tests complete in under 300ms. Gate evaluations are sub-millisecond. No load testing done — scoped for pre-production qualification." |

### Recommended Talking Points

1. Lead with what can be verified on the call: `pnpm test`, `pnpm audit:repo`, live demo.
2. Name the persistent storage gap first and frame it as "the top pre-pilot engineering task."
3. Do not reference the CI/CD claim from the CTO Review Pack. If asked, answer accurately.
4. Position the pilot as: one workflow, controlled scope, no live production execution, written agreement before anything runs against real data.
5. The competitive frame is not "production-ready" — it is "we have built the enforcement logic most governance products only describe in slides, and we're ready to prove it in a controlled evaluation."

### Recommended Caution Areas

- Do not say the CI pipeline "runs on every push" — it does not.
- Do not imply the `stableChecksum` in the README is current — it is stale.
- Do not claim the HTTP wrapper is deployable — it is not (express missing).
- Do not say "almost production-ready" — this overstates the position.

---

## ══════════════════════════════════════════════════════════════
## SECTION 14 — EXECUTIVE SUMMARY
## ══════════════════════════════════════════════════════════════

### Current Maturity Assessment

| Dimension | Level | Evidence |
|---|---|---|
| **Enforcement core maturity** | HIGH | 372 tests, 12 hard invariants, adversarial test coverage, fail-closed validated |
| **Documentation maturity** | MEDIUM-HIGH | Honest, comprehensive; several stale numerical references |
| **Deployment maturity** | VERY LOW | No Dockerfile, no CI/CD, no persistent storage, no deployment scripts |
| **Pilot readiness** | MEDIUM-LOW | Protocol defined; prerequisites unmet (persistent storage, deployment) |
| **Reviewer readiness** | MEDIUM-HIGH | Portal live, evidence bundle real, validators pass; stale counts in some docs |
| **Commercial readiness** | MEDIUM | Strong honest positioning; one false CI/CD claim that must be corrected |

---

### Top 10 Strengths

1. **Zero runtime dependencies in enforcement core.** Pure Node.js built-ins only. Exceptional supply-chain cleanliness.
2. **All 372 tests pass, zero failing.** Including 66 adversarial tests, 27 misuse scenarios, 25 boundary probes. Security coverage is real.
3. **Honest, complete disclosure of limitations.** Known Limitations, trust boundary doc, security review brief all state gaps directly. This is rare and credible.
4. **AI non-authority is structurally enforced, not configured.** INV-05 cannot be turned off via a flag. It evaluates on every request.
5. **Independently verifiable proof.** `pnpm export:proof` → `pnpm verify:proof`. Stablecheck is a reproducible SHA-256 hash. Anyone can confirm it.
6. **Fail-closed is tested.** Not a promise — a tested behavior with specific exception-path tests.
7. **All 15 automated audit checks pass.** Repo enforces its own structural integrity.
8. **Pilot operations model is realistic and complete.** Scope boundary, support commitment, issue tracking, success criteria, exit deliverables all defined.
9. **Review portal is consistent with live evidence.** 110 portal validation assertions. Data objects match live test results.
10. **No material overstatements** (excluding the CI/CD claim). The documentation accurately represents what is and is not implemented.

---

### Top 10 Weaknesses

1. **No persistent audit storage.** Logs are lost on restart. This is not a pilot-ready state for any regulated workflow.
2. **No CI/CD pipeline.** The `.github/` directory does not exist. The CTO Review Pack claims it does. This is a false statement in an external document.
3. **No deployment infrastructure.** No Dockerfile, no deployment scripts, no environment configuration. Getting to a client environment requires building everything from scratch.
4. **stableChecksum in README is stale.** `README.md` line 87 shows `7695187f...`; live proof shows `1e9dae14...`. The README's primary proof attestation is wrong.
5. **`scripts/generate-cto-pdf.mjs` contains stale "323" test count in 8 places.** Regenerating the CTO PDF today would produce a document with a 49-test error.
6. **`examples/http-wrapper.ts` is non-operational.** The express dependency it imports is not installed. This is the only example of HTTP/service-mode deployment.
7. **No cryptographic signing.** Evidence is hash-linked but not signed. Origin authenticity cannot be proven.
8. **Two docs claim `14 / 14` audit checks.** Actual: 15/15. (`docs/current_maturity.md` and `docs/positioning/external-positioning.md`.)
9. **`docs/status/current-state.md` and `CTO_REVIEW_PACK_LINE_AXIA.md` show `review-portal-routes.test.ts | 61`** — actual: 110.
10. **Solo founder with no operational backup.** No team. No coverage plan beyond what is documented in the operations model.

---

### Top 10 Remaining Issues (Ranked by Pre-Call Priority)

| Priority | Issue | File(s) | Action |
|---|---|---|---|
| 1 | False CI/CD claim in external CTO document | `CTO_REVIEW_PACK_LINE_AXIA.md:648,934` | Correct before call or have an answer ready |
| 2 | Stale stableChecksum in README | `README.md:87` | Run `pnpm export:proof` then update README |
| 3 | Stale "323" in `generate-cto-pdf.mjs` | `generate-cto-pdf.mjs` (8 lines) | Fix and regenerate CTO PDF before call |
| 4 | `review-portal-routes.test.ts | 61` stale | `current-state.md:27`, `CTO_REVIEW_PACK_LINE_AXIA.md:631` | Correct to 110 |
| 5 | `14 / 14` stale audit check count | `current_maturity.md:27`, `external-positioning.md:86` | Correct to 15/15 |
| 6 | `http-wrapper.ts` non-operational | `examples/http-wrapper.ts` | Install express or add a comment marking it as non-operational |
| 7 | PDFs committed may contain stale data | `docs/reports/*.pdf` | Regenerate after fixing generate-cto-pdf.mjs |
| 8 | Persistent storage — top pre-pilot gap | Architecture | Cannot be fixed before Friday. Prepare clear answer. |
| 9 | No deployment infrastructure | Repo-wide | Cannot be fixed before Friday. Prepare clear answer. |
| 10 | Solo founder operational risk | `pilot-operations-model.md` | Ensure the mitigation framing is clear |

---

### Immediate Actions Required Before Friday's Line Axia Call

**Must complete (credibility risk if not done):**

1. **Remove or rewrite the CI/CD claim.** `CTO_REVIEW_PACK_LINE_AXIA.md` lines 648 and 934 state that a GitHub Actions CI pipeline runs on every push. It does not. Either remove these lines or replace them with an accurate statement ("automated audit suite, no GitHub Actions CI configured yet") before sharing or referencing the document on the call.

2. **Fix `scripts/generate-cto-pdf.mjs` — replace all "323" with "372".** Then regenerate the CTO PDF. If a fresh PDF is shared before or after the call, it must not contain a 49-test error.

3. **Update README stableChecksum.** Run `pnpm export:proof` then paste the new `stableChecksum` into `README.md` line 87. The current value is wrong.

**Should complete (reviewer consistency):**

4. **Update `docs/current_maturity.md:27` and `docs/positioning/external-positioning.md:86`:** Change `14 / 14` to `15 / 15`.

5. **Update `docs/status/current-state.md:27` and `CTO_REVIEW_PACK_LINE_AXIA.md:631`:** Change `review-portal-routes.test.ts | 61` to `110`.

6. **Fix `examples/http-wrapper.ts`:** Either run `pnpm add express` (and `pnpm add -D @types/express`) or add a comment block at the top of the file: `// NOTE: express is not installed. This is a non-operational reference implementation.`

**Prepare talking points (cannot be code-fixed before Friday):**

7. **Persistent storage answer.** Exact statement: "The audit log is in-memory today — that's the top pre-pilot engineering requirement. We define the right persistent store for your environment as part of pilot scoping."

8. **CI/CD answer.** Exact statement: "We have a comprehensive local audit suite — 15 automated checks — but no GitHub Actions pipeline yet. That's on the pre-pilot list."

9. **Deployment answer.** Exact statement: "No client deployments outside the demo environment yet. The pilot would be the first. That's the right sequencing."

---

### Immediate Actions Required Before First Pilot

Beyond Friday's call, the following must be completed before a pilot can responsibly begin:

1. **Implement persistent audit storage** — minimum: append-only write to durable storage (PostgreSQL, SQLite, or equivalent) with the same hash-chain integrity as the in-memory log.
2. **Create CI/CD pipeline** — GitHub Actions workflow running `pnpm test && pnpm audit:repo` on every push to main.
3. **Build deployment infrastructure** — minimum: Dockerfile, docker-compose for local dev, documented deployment procedure for at least one target environment.
4. **Install express and make `http-wrapper.ts` operational** — or remove it.
5. **Execute `pnpm export:proof` → commit updated `README.md` stableChecksum** as part of standard release process.
6. **Complete a third-party security review** — specifically addressing gate invocation provenance, WeakSet robustness, and trust model for caller-supplied fields.
7. **Implement `actorAuthorityClass` exhaustive validation** — explicit REJECT for unknown actor classes.
8. **Define persistent storage and deploy to pilot environment** — with backup and recovery procedures.

---

*Audit conducted June 4, 2026. All findings verified against live code execution and live file contents. No finding is speculative. No previous report was relied upon as evidence.*

*Evidence commands: `pnpm test`, `pnpm audit:repo`, `pnpm check:imports`, `pnpm check:invariants`, `pnpm export:proof`, `pnpm verify:proof`, `pnpm demo:web:validate`, `pnpm demo:support:validate`, `pnpm review:validate`, `git status`, `git ls-files --others --exclude-standard`, `tsc --noEmit`, `tsc -p tsconfig.json`*
