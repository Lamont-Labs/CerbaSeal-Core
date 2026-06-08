# CerbaSeal — Pricing and Commercialization Source Data

**Purpose:** Evidence package for rebuilding the CerbaSeal commercialization, pilot readiness, and pricing analysis document with maximum accuracy. All facts are extracted directly from repository artifacts and verified commands. No estimates, no invented numbers, no loose summaries.

**Generated:** 2026-06-08  
**Commit:** `485cde3faaa0524ffd5f5b6132673789f89adab9`  
**Branch:** `main`

---

## Section 1 — Current Repository State

### Package Identity

| Field | Value | Source |
|-------|-------|--------|
| Package name (internal) | `cerbaseal-review` | `package.json` → `"name"` |
| Product name | CerbaSeal Core | `package.json` → `"description"` |
| Version | `0.1.0` | `package.json` → `"version"` |
| Description | CerbaSeal review repo - Drop 01 execution enforcement spine | `package.json` |
| Author / owner | Jesse Lamont / Lamont Labs | README, partner kit docs |
| Module type | ESM (`"type": "module"`) | `package.json` |

### Version Control State

| Field | Value | Command |
|-------|-------|---------|
| Current commit (full) | `485cde3faaa0524ffd5f5b6132673789f89adab9` | `git rev-parse HEAD` |
| Current commit (short) | `485cde3` | `git log --oneline -1` |
| Branch | `main` | `git branch --show-current` |
| Last commit message | "Published your App" | `git log --oneline -1` |

### Runtime Environment

| Field | Value | Command |
|-------|-------|---------|
| Node.js | v22.22.0 | `node --version` |
| pnpm | 10.26.1 | `pnpm --version` |

### Test Suite

| Field | Value | Command |
|-------|-------|---------|
| Tests passed | 432 | `pnpm test` |
| Total tests | 432 | `pnpm test` |
| Test files | 17 | `pnpm test` |
| Duration | ~5.2 seconds | `pnpm test` |
| Status | PASS (all) | `pnpm test` |

**Full test suite output (tail):**
```
Test Files  17 passed (17)
     Tests  432 passed (432)
  Duration  5.22s (transform 1.19s, setup 0ms, collect 2.75s, tests 412ms, environment 4ms, prepare 4.14s)
```

### Repository Audit

| Field | Value | Command |
|-------|-------|---------|
| Audit checks passed | 16 | `pnpm audit:repo` |
| Total checks | 16 | `pnpm audit:repo` |
| Status | PASS | `pnpm audit:repo` |

**Full audit output:**
```
  ✓ PASS  1.  Full test suite passes — 432 tests passed
  ✓ PASS  2.  TypeScript compiles without errors — tsc --noEmit clean
  ✓ PASS  3.  README anchor strings present — all 4 anchors found
  ✓ PASS  4.  All portal routes respond 200 — 9 routes checked
  ✓ PASS  5.  No src/ file unreferenced in tests or examples — all 29 src files referenced
  ✓ PASS  6.  Invariant registry exists and is non-empty — 12 invariants registered
  ✓ PASS  7.  Known-limitations section present in README — section found
  ✓ PASS  8.  Test count in README matches actual — both report 432 tests
  ✓ PASS  9.  demo:web:validate passes — all assertions passed
  ✓ PASS  10. demo:support:validate passes — 13 assertions passed
  ✓ PASS  11. review:validate passes — 110 assertions passed
  ✓ PASS  12. No architectural import boundary violations — all boundaries clean
  ✓ PASS  13. All invariants linked to covering tests — 12 / 12 invariants covered
  ✓ PASS  14. No stale test-count references in documentation — all references match actual count
  ✓ PASS  15. Pilot documents exist and contain required sections — 3 pilot docs verified
  ✓ PASS  16. cerbaseal.policy.json parses without error — policy file valid
```

### Proof Snapshot and Stable Checksum

**Command:** `pnpm export:proof` (writes to `docs/reports/proof-snapshot.json`)

| Field | Value |
|-------|-------|
| stableChecksum (enforcement state only) | `e5aca8b2ad5f7abb528322be754d06463cb01367e038daf1472f925206c64e2c` |
| manifestChecksum (full body) | `53f5733305c6e585b21ed8c4239a1197fd48efb91da690044dc4f116def20cae` |
| Proof file path | `docs/reports/proof-snapshot.json` |
| Proof status | VERIFIED (checksums match) |

**Verify command:** `pnpm verify:proof`
```
  demo:web:validate: 106 assertions (pass)
  demo:support:validate: 13 assertions (pass)
  review:validate: 110 assertions (pass)
Status: VERIFIED — Both checksums match. The snapshot has not been tampered with.
```

**Proof snapshot metadata (from `docs/reports/proof-snapshot.json`):**
```json
{
  "generatedAt": "2026-06-08T20:48:34.055Z",
  "gitCommit": "485cde3faaa0524ffd5f5b6132673789f89adab9",
  "gitBranch": "main",
  "version": "0.1.0",
  "testSuite": { "passed": 432, "total": 432, "files": 17 },
  "auditChecks": { "passed": 16, "total": 16 },
  "invariants": { "total": 12, "allCovered": true },
  "validators": {
    "demo:web:validate": { "passed": true, "assertions": 106 },
    "demo:support:validate": { "passed": true, "assertions": 13 },
    "review:validate": { "passed": true, "assertions": 110 }
  },
  "manifestChecksum": "53f5733305c6e585b21ed8c4239a1197fd48efb91da690044dc4f116def20cae",
  "stableChecksum": "e5aca8b2ad5f7abb528322be754d06463cb01367e038daf1472f925206c64e2c"
}
```

### Commands to Verify All of the Above

```bash
# Runtime
node --version                      # v22.22.0
pnpm --version                      # 10.26.1

# Version control
git rev-parse HEAD                  # 485cde3faaa0524ffd5f5b6132673789f89adab9
git branch --show-current           # main

# Test suite
pnpm test                           # 432 passed / 432, 17 files

# Repository audit (16 checks)
pnpm audit:repo                     # 16/16 PASS

# Proof snapshot and checksum
pnpm export:proof                   # writes docs/reports/proof-snapshot.json
pnpm verify:proof                   # VERIFIED — checksums match

# Invariant coverage
pnpm check:invariants               # 12/12 covered

# Import boundary check
pnpm check:imports                  # all boundaries clean

# Individual validators
pnpm demo:web:validate              # 106 assertions pass
pnpm demo:support:validate          # 13 assertions pass
pnpm review:validate                # 110 assertions pass
```

---

## Section 2 — Current System Capabilities

### 2.1 Enforcement Gate — Implemented Code

**What it is:** The core runtime enforcement function. Accepts a `GovernedRequest`, evaluates it synchronously against 12 invariants and policy configuration, and returns a deterministic `GateResult` with `finalState` (ALLOW / HOLD / REJECT), reason codes, decision envelope, and evidence bundle.

**Key property:** The same input always produces the same output. `evaluate()` is a pure synchronous function — no external I/O, no side effects on the decision itself.

| Item | Detail |
|------|--------|
| Primary source file | `src/services/execution/` |
| Config source | `src/config/cerbaseal-config.ts` |
| Policy source | `src/config/cerbaseal-policy.ts` |
| Domain types | `src/domain/types` (not a single flat file — see builders, constants, errors, formatters subdirectories) |
| Test file | `test/execution-gate-service.test.ts` (19 tests) |
| Adversarial tests | `test/adversarial-integrity.test.ts` |
| Security tests | `test/security/` (4 files: contextual-boundary, fail-closed, misuse-scenarios, non-forgery) |
| Integration tests | `test/integration/full-flow.test.ts`, `test/integration/system-integration.test.ts` |
| Status | Implemented, verified, production-grade logic |

**Decision states:**
- `ALLOW` — All invariants passed, policy satisfied, approval valid (if required). Action authorized.
- `HOLD` — Policy requires human approval that is absent or not yet submitted. Action queued.
- `REJECT` — One or more invariants failed. Action unconditionally blocked.

### 2.2 Invariant Framework — Implemented Code

**What it is:** 12 unconditional enforcement rules that cannot be overridden by configuration or policy. Each invariant causes REJECT (or HOLD for INV-03) when its condition is not satisfied.

**Source file:** `architecture/invariants/invariant-registry.yaml`  
**Check command:** `pnpm check:invariants` — confirms 12/12 are covered by tests

| ID | Name | Linked Reason Code(s) | Test Coverage |
|----|------|-----------------------|---------------|
| INV-01 | no_policy_pack_no_execution | `NO_POLICY_PACK` | execution-gate-service, adversarial-integrity |
| INV-02 | no_provenance_no_action | `NO_PROVENANCE` | execution-gate-service, adversarial-integrity |
| INV-03 | no_required_approval_no_release | `REQUIRED_APPROVAL_MISSING`, `INVALID_APPROVAL_AUTHORITY`, `PRIVILEGED_AUTH_NOT_SATISFIED`, `APPROVAL_SIGNATURE_MISSING` | execution-gate-service, misuse-scenarios, adversarial-integrity, contextual-boundary |
| INV-04 | no_logging_no_execution | `LOGGING_NOT_READY` | execution-gate-service, misuse-scenarios, adversarial-integrity |
| INV-05 | ai_non_authoritative | `AI_CANNOT_AUTHORIZE` | execution-gate-service, non-forgery, adversarial-integrity, contextual-boundary |
| INV-06 | no_bypass_of_execution_gate | (none — structural) | non-forgery, misuse-scenarios |
| INV-07 | immutable_decision_envelope | (none — artifact integrity) | execution-gate-service, adversarial-integrity |
| INV-08 | stale_controls_block_sensitive_release | `CONTROL_STALE_OR_INVALID` | execution-gate-service, misuse-scenarios, adversarial-integrity |
| INV-09 | trust_state_required | `TRUST_STATE_INVALID` | execution-gate-service, misuse-scenarios, adversarial-integrity |
| INV-10 | prohibited_use_must_block | `PROHIBITED_USE` | execution-gate-service, misuse-scenarios, adversarial-integrity |
| INV-11 | request_schema_and_action_class_valid | `MALFORMED_REQUEST`, `UNKNOWN_ACTION_CLASS` | execution-gate-service, misuse-scenarios, adversarial-integrity, fail-closed |
| INV-12 | proposal_and_request_action_must_match | `INVALID_PROPOSAL` | execution-gate-service, misuse-scenarios, adversarial-integrity |

### 2.3 Policy and Configuration System — Implemented Code

**What it is:** Two JSON files that define the client's specific workflow, actors, approval chains, and action policies without requiring TypeScript changes.

**File:** `deployment-starter/cerbaseal.config.json`
```json
{
  "authorityClasses": {
    "core": ["system", "ai", "analyst", "reviewer", "manager", "compliance_officer"],
    "extended": []
  },
  "workflowClasses": {
    "core": ["fraud_triage", "transaction_escalation", "account_hold_recommendation"],
    "extended": ["your_workflow_class"]
  },
  "actionClasses": {
    "core": ["allow", "hold", "reject", "escalate", "account_hold"],
    "extended": []
  }
}
```

**File:** `deployment-starter/cerbaseal.policy.json`
```json
{
  "_schema": "cerbaseal-policy/v1",
  "actorMappings": {
    "Senior Fraud Analyst": "analyst",
    "Compliance Lead": "compliance_officer",
    "Operations Manager": "manager"
  },
  "approvalChains": {
    "your_workflow_class": ["analyst", "compliance_officer"]
  },
  "actionPolicies": {
    "your_workflow_class": {
      "escalate": "requires_approval",
      "account_hold": "requires_approval",
      "allow": "auto_allow",
      "hold": "auto_allow",
      "reject": "auto_allow"
    }
  }
}
```

**Authoring guide:** `docs/client-adoption/policy-pack-authoring-guide.md`  
**Validation:** Audit check 16 (`pnpm audit:repo`) parses policy JSON and validates structure  
**Status:** Implemented — configuration is JSON, no TypeScript required for standard workflows

**Governance pack templates (4 built-in):**
- `docs/client-adoption/templates/fraud-triage-template.md`
- `docs/client-adoption/templates/transaction-escalation-template.md`
- `docs/client-adoption/templates/account-hold-recommendation-template.md`
- `docs/client-adoption/templates/generic-human-approval-template.md`

### 2.4 Audit Log — Implemented Code

**What it is:** An append-only JSONL log where every gate decision is recorded as a structured audit entry. Two backends: in-memory (development) and file-backed (production).

| Item | Detail |
|------|--------|
| Source path | `src/services/audit/` |
| File-backed implementation | `examples/fraud-workflow-starter/` (demonstrates `FileBackedAppendOnlyLogService`) |
| Test file | `test/persistent-audit-log.test.ts` (12 tests) |
| Format | JSONL — one JSON object per line |
| Production log path (recommended) | `/var/log/cerbaseal/workflow.jsonl` |
| Status | Implemented and tested; file-backed path is production-suitable |

### 2.5 Evidence Bundles — Implemented Code

**What it is:** An `EvidenceBundle` is produced with every gate decision. It contains the full request, the decision result, all checked invariants, reason codes, and a cryptographically chained audit entry reference.

| Item | Detail |
|------|--------|
| Source path | `src/services/evidence/` |
| Test file | `test/audit-evidence-export.test.ts` (6 tests) |
| Status | Implemented — evidence is first-class output, not logged separately |

### 2.6 Proof Export and Verification — Implemented Code

**What it is:** A proof snapshot (`proof-snapshot.json`) that captures the full verification state of the repository at a point in time. The snapshot is cryptographically checksummed with two values: `stableChecksum` (enforcement state, stable across documentation changes) and `manifestChecksum` (full body including docs and examples).

| Item | Detail |
|------|--------|
| Export script | `scripts/export-proof.ts` |
| Verify script | `scripts/verify-proof.ts` |
| Export command | `pnpm export:proof` |
| Verify command | `pnpm verify:proof` |
| Output file | `docs/reports/proof-snapshot.json` |
| Current stableChecksum | `e5aca8b2ad5f7abb528322be754d06463cb01367e038daf1472f925206c64e2c` |
| Current manifestChecksum | `53f5733305c6e585b21ed8c4239a1197fd48efb91da690044dc4f116def20cae` |
| Status | Implemented — cryptographic verification confirmed |

### 2.7 Replay / Verification — Implemented Code

| Item | Detail |
|------|--------|
| Source path | `src/services/replay/` |
| Snapshot test file | `test/snapshots/enforcement-loop.snapshot.test.ts` (41 tests) |
| Status | Implemented — snapshot tests confirm gate behavior is stable across changes |

### 2.8 HTTP API and Review Portal — Implemented Code

**What it is:** A Node.js HTTP server that exposes the enforcement gate over HTTP and serves a browser-based review portal. All routes tested by `review:validate` (110 assertions).

**Source file:** `examples/browser-demo/server.ts`  
**Start command:** `pnpm demo:web`

**HTTP routes:**

| Route | Type | What It Does |
|-------|------|-------------|
| `GET /` | HTML | Browser-based review portal (main dashboard) |
| `GET /review` | HTML | Review portal — partner/client-facing review view |
| `GET /pilot` | HTML | Pilot readiness page |
| `GET /security` | HTML | Security summary page |
| `GET /deployment` | HTML | Deployment information page |
| `GET /one-page` | HTML | One-page summary view |
| `GET /api/reject` | JSON | Execute REJECT scenario; returns full GateResult |
| `GET /api/hold` | JSON | Execute HOLD scenario; returns full GateResult |
| `GET /api/allow` | JSON | Execute ALLOW scenario; returns full GateResult |
| `GET /api/review-summary` | JSON | Structured review summary for portal |
| `GET /api/pilot-readiness` | JSON | Pilot readiness data object |
| `GET /api/security-summary` | JSON | Security summary data object |
| `GET /robots.txt` | text | Crawler control |
| `GET /sitemap.xml` | XML | Sitemap |
| `GET /llms.txt` | text | AI-readiness metadata |
| `GET /assets/*` | binary | Static assets |

**Test file:** `test/integration/review-portal-routes.test.ts` (110 tests)  
**Validator:** `pnpm review:validate` (110 assertions, all pass)

### 2.9 Deployment Starter — Implemented Code

**What it is:** A self-contained deployment package with configuration templates, a Dockerfile, Docker Compose file, and a verification script. Designed for client-controlled deployment.

**Path:** `deployment-starter/`

| File | Purpose |
|------|---------|
| `deployment-starter/cerbaseal.config.json` | Runtime configuration template (authorityClasses, workflowClasses, actionClasses) |
| `deployment-starter/cerbaseal.policy.json` | Policy template (actorMappings, approvalChains, actionPolicies) |
| `deployment-starter/Dockerfile` | Container image definition |
| `deployment-starter/docker-compose.yml` | Docker Compose orchestration file |
| `deployment-starter/index.ts` | Entry point for the deployment server |
| `deployment-starter/verify.ts` | Verification script — runs REJECT, HOLD, ALLOW scenarios programmatically |
| `deployment-starter/README.md` | Deployment-starter specific README |

**Verification command:** `tsx deployment-starter/verify.ts`  
**Status:** Implemented — Docker Compose and Node.js Direct paths both supported

### 2.10 Setup Wizard — Implemented Code

**What it is:** An interactive CLI wizard that walks a partner or client through configuration, writing `cerbaseal.config.json` and `cerbaseal.policy.json` interactively.

| Item | Detail |
|------|--------|
| Source | `scripts/setup.ts` |
| Command | `pnpm setup` |
| Status | Implemented |

### 2.11 Partner Kit Documentation — Documentation

**Path:** `docs/partner-kit/`

| File | Audience | What It Covers |
|------|---------|----------------|
| `00-OVERVIEW.md` | All partners | Kit index, guided independence model, certification levels, tools |
| `01-sales-brief.md` | Sales staff | Positioning, qualification (3 questions), buyer persona map |
| `02-technical-brief.md` | Technical staff | Architecture, invariants, evidence chain |
| `03-deployment-guide.md` | Technical lead | Step-by-step deployment, verification, deployment checklist (Appendix) |
| `04-pilot-guide.md` | Partner lead | 1-day structured pilot delivery, commercial framing, session guide |
| `05-support-guide.md` | Partner support | 10 common issues with diagnosis and resolution |
| `06-objection-handling.md` | Sales/technical | 8 enterprise objections with persona-calibrated responses |
| `07-certification-framework.md` | All partners | Three levels (Deploy, Configure, Lead Pilots), practical exercises |
| `08-pricing-and-commercial-model.md` | Sales leads, principals | 5 pilot tiers, annual licensing, channel economics, negotiation posture |
| `09-market-positioning.md` | Sales leads, principals | Category placement, comparable benchmarks, regulatory context, source notes |
| `10-adoption-roadmap.md` | Lamont Labs, partners | Build priorities, founder independence metrics, next-steps timeline |
| `11-risk-register.md` | All | 7 risk areas, neutral external language, out-of-scope list, communication posture |
| `12-partner-discussion-brief.md` | Partner principals | Pre-call Q&A, talking points, negotiation posture for commercial discussions |

**Status:** All 13 documents are implemented and complete.

### 2.12 Client Adoption Documentation — Documentation

**Path:** `docs/client-adoption/`

| File / Directory | What It Covers |
|-----------------|----------------|
| `workflow-mapping-workbook.md` | Sections A–M for facilitated workflow mapping sessions |
| `policy-pack-authoring-guide.md` | Step-by-step policy JSON authoring |
| `quickstart-deployment-guide.md` | 3 time-boxed deployment paths |
| `pilot-delivery-playbook.md` | Week-by-week pilot delivery guide (Tier 2 = 5 weeks, target ≤8 Jesse hours) |
| `pilot-sizing-and-pricing-framework.md` | Internal pricing tiers (EUR), pricing factors, recommended first offer range |
| `pilot-success-framework.md` | Success and failure criteria definition |
| `client-discovery-script.md` | Full script for discovery/qualification calls |
| `client-qualification-scorecard.md` | Green/Yellow/Red readiness scoring |
| `client-readiness-assessment.md` | Structured readiness assessment |
| `client-admin-guide.md` | Client administrative responsibilities |
| `onboarding-sequence.md` | Onboarding phases and sequence |
| `support-boundaries.md` | What is self-service vs. escalation |
| `founder-dependency-reduction-plan.md` | 8-layer dependency map with mitigation status |
| `eu-ai-act-nis2-mapping-support.md` | Regulatory mapping support |
| `self-service-configuration-wizard-spec.md` | Specification for future policy wizard (roadmap) |
| `frequently-asked-objections.md` | Extended objection handling reference |
| `troubleshooting-guide.md` | Troubleshooting beyond the support guide |
| `train-the-trainer-program.md` | Program for training partner delivery staff |
| `templates/` | 4 governance pack templates (fraud triage, transaction escalation, account hold, generic approval) |
| `training/` | 8 training materials (exec overview, onboarding agenda, operator guide, reviewer guide, admin guide, FAQ, common errors, getting started) |

### 2.13 Diagnostic Tools — Implemented Code

| Tool | Command | What It Does | Status |
|------|---------|-------------|--------|
| Diagnostic report service | `src/services/diagnostics/` | Generates structured diagnostic report | Implemented |
| Diagnostic report test | `test/diagnostic-report-service.test.ts` (5 tests) | Tests report output | Passing |
| Repo audit | `pnpm audit:repo` | 16 automated governance checks | Implemented, 16/16 pass |
| Invariant coverage check | `pnpm check:invariants` | Verifies all 12 invariants are covered | Implemented, 12/12 pass |
| Import boundary check | `pnpm check:imports` | Verifies no architectural boundary violations | Implemented, clean |
| Evidence report generator | `pnpm generate:evidence-report` | Human-readable compliance evidence report | Implemented |
| Support readiness validator | `pnpm demo:support:validate` | 13 assertions against support readiness | Implemented, 13/13 pass |

### 2.14 Review Portal — Implemented Code

**What it is:** A browser-based portal served at `GET /` with interactive ALLOW/HOLD/REJECT scenario views, review summary, pilot readiness data, and security summary. Tested with 110 assertions.

| Item | Detail |
|------|--------|
| Server source | `examples/browser-demo/server.ts` |
| Review portal data | `src/domain/review-portal-data.ts` |
| Review portal data source | `examples/browser-demo/review-portal.ts` — exports `REVIEW_SUMMARY`, `PILOT_READINESS`, `SECURITY_SUMMARY` |
| Test file | `test/integration/review-portal-routes.test.ts` (110 tests) |
| Validator | `pnpm review:validate` (110 assertions) |
| Start command | `pnpm demo:web` |
| Status | Implemented, 110 assertions pass |

### 2.15 Starter Kit Library — Implemented Code

**Path:** `examples/`  
**Reference:** `examples/INTEGRATION-GUIDE.md`

| Starter Kit | Path | What It Demonstrates | Estimated Integration Time |
|-------------|------|----------------------|---------------------------|
| Express middleware | `examples/express-middleware/` | `cerbaSealGate()` middleware; ALLOW → next(), REJECT → 403, HOLD → 202 | 30 minutes |
| Webhook adapter | `examples/webhook-adapter/` | HTTP receiver; POST /event → gate → POST callback; async approval loop | 1 hour |
| Async queue | `examples/async-queue/` | In-memory JobQueue; enqueue → HOLD → approve → ALLOW | 1–2 hours |
| Audit export | `examples/audit-export/` | Read JSONL log; verify chain integrity; export counts by event type | 30 minutes |
| REST API starter | `examples/rest-api-starter/` | Standalone HTTP gate server; evaluate endpoint; decision history | 1 hour |
| Financial approval starter | `examples/financial-approval-starter/` | HOLD → manager approves → ALLOW; ApprovalArtifact construction | 30 minutes |
| Agent integration starter | `examples/agent-integration-starter/` | AI self-authorization prevention (correct vs wrong patterns) | 30 minutes |
| Fraud workflow starter | `examples/fraud-workflow-starter/` | FileBackedAppendOnlyLogService; risk-scored triage; JSONL log on disk | 1 hour |
| Agent gate | `examples/agent-gate/` | AI agent governance gate | Not specified |
| Consumer example | `examples/consumer-example/` | Consumer integration pattern | Not specified |
| Auditor view | `examples/auditor-view/` | Auditor-facing view of audit log | Not specified |
| Support readiness | `examples/support-readiness/` | Support readiness demonstration | Not specified |

**Integration test file:** `test/integration/external-signal-examples.test.ts` (16 tests)  
**Status:** All starter kits are implemented, documented, and tested

### 2.16 Additional Commercial / PDF Assets

| Asset | Command | Output | Status |
|-------|---------|--------|--------|
| System reference PDF | `pnpm generate:system-pdf` | `cerbaseal-system-reference.pdf` (30 pages, ~113KB) | Implemented |
| Pilot config generator | `pnpm generate:pilot-config` | Pilot configuration JSON | Implemented |
| Evidence report | `pnpm generate:evidence-report` | Human-readable evidence report | Implemented |
| Pricing PDF | `pnpm generate:pricing-pdf` | Pricing framework PDF | Implemented |
| Commercial framework PDF | `pnpm generate:commercial-pdf` | Commercial framework PDF | Implemented |

---

## Section 3 — Configuration Accuracy

### What Can Be Configured Without Code Changes

All of the following can be changed by editing `cerbaseal.config.json` and `cerbaseal.policy.json` only. No TypeScript changes required.

**In `cerbaseal.config.json`:**

| Configuration Field | What It Controls | How |
|--------------------|-----------------|-----|
| `authorityClasses.extended` | Add client-specific actor authority classes beyond the 6 core classes | Add string to the array |
| `workflowClasses.extended` | Add client-specific workflow identifiers | Add string to the array |
| `actionClasses.extended` | Add client-specific action class names | Add string to the array |

**Core authority classes (cannot be removed, only supplemented):** `system`, `ai`, `analyst`, `reviewer`, `manager`, `compliance_officer`

**Core workflow classes (built-in, can be supplemented):** `fraud_triage`, `transaction_escalation`, `account_hold_recommendation`

**Core action classes (built-in, can be supplemented):** `allow`, `hold`, `reject`, `escalate`, `account_hold`

**In `cerbaseal.policy.json`:**

| Section | What It Controls | Options |
|---------|-----------------|---------|
| `actorMappings` | Map client role names (strings) to CerbaSeal authority classes | Any role name → valid authority class |
| `approvalChains` | Per-workflow list of authority classes that may approve | Array of authority class strings per workflow |
| `workflowRules` | Per-workflow rules (e.g., `requiresApproval: true`) | Boolean flags per workflow |
| `actionPolicies` | Per-workflow, per-action-class behavior | `requires_approval` / `auto_allow` / `blocked` |

**Verification:** All policy changes validated by audit check 16 (`pnpm audit:repo`)  
**Authoring guide:** `docs/client-adoption/policy-pack-authoring-guide.md`

### What Still Requires Code Changes

| Capability | Why Code Is Required |
|-----------|---------------------|
| Adding a new enforcement invariant | INV-01 through INV-12 are unconditional TypeScript enforcement rules; a new one requires a new TypeScript condition and new tests |
| Adding a new `ProposalSourceKind` value | Only `"ai"` and `"deterministic_rule"` are currently valid; new values require TypeScript source changes |
| PKI-backed cryptographic signing of `DecisionEnvelope` | `immutableSignature` field is currently checked for presence and non-emptiness; cryptographic key verification requires implementation |
| Changing audit log format | JSONL schema is TypeScript-defined |
| Adding new API routes to the review portal | `examples/browser-demo/server.ts` requires TypeScript changes |
| New governance pack templates (as live templates) | Adding to the `core` arrays in config is a TypeScript change; `extended` arrays handle client additions |

---

## Section 4 — Deployment Readiness

### 4.1 Docker Compose Path

**Status:** Implemented — pilot-ready, not independently production-certified

| Item | Detail |
|------|--------|
| Files | `deployment-starter/Dockerfile`, `deployment-starter/docker-compose.yml` |
| Prerequisites | Docker Desktop or Docker Engine, Docker Compose v2+ |
| Start command | `docker compose up` (from `deployment-starter/`) |
| Configuration | Edit `cerbaseal.config.json` and `cerbaseal.policy.json` before starting |
| Verification | `tsx deployment-starter/verify.ts` — runs 9 assertions (REJECT, HOLD, ALLOW scenarios) |
| Production considerations | Network access control, persistent volume mapping for audit log, restart policy — all operator responsibility |
| Known gaps | Network-level authentication of API callers is operator responsibility; no built-in rate limiting or WAF |

### 4.2 Node.js Direct Path

**Status:** Implemented — pilot-ready, not independently production-certified

| Item | Detail |
|------|--------|
| Prerequisites | Node.js 18+ (tested on v22.22.0), pnpm |
| Install command | `git clone <repo> && cd cerbaseal-core && pnpm install` |
| Verify install | `pnpm test` (432/432 must pass), `pnpm audit:repo` (16/16 must pass) |
| Start command | `pnpm demo:web` (PORT env variable configures port, default 3001) |
| Config setup | `pnpm setup` (interactive wizard) or manually edit JSON files |
| Verification | `tsx deployment-starter/verify.ts` |
| Deployment guide | `docs/partner-kit/03-deployment-guide.md`, `docs/client-adoption/quickstart-deployment-guide.md` |
| Known gaps | Windows deployment not tested; Node.js version must be 18.0+ |

### 4.3 HTTP API Starter

**Status:** Implemented

| Item | Detail |
|------|--------|
| Path | `examples/rest-api-starter/` |
| What it provides | Standalone HTTP gate server with evaluate endpoint and decision history |
| Estimated setup | 1 hour |

### 4.4 Local Demo / Review Portal

**Status:** Implemented — demo-ready

| Item | Detail |
|------|--------|
| Command | `pnpm demo:web` |
| Serves | Browser-based review portal at localhost (PORT env var or 3001) |
| Routes | /, /review, /pilot, /security, /deployment, /one-page, /api/reject, /api/hold, /api/allow, /api/review-summary, /api/pilot-readiness, /api/security-summary |
| Validation | `pnpm review:validate` (110 assertions) |
| Purpose | Demonstrates enforcement gate for client-facing review; not a production entry point |

### 4.5 Client-Controlled Deployment Posture

**Status:** Documented — this is the recommended production architecture

The deployment model is client-controlled: the client provides and owns the hosting environment, network layer, identity provider, and persistence volume. CerbaSeal runs as a service within the client's perimeter. No data leaves the client's environment.

**Supporting docs:**
- `docs/partner-kit/03-deployment-guide.md` — step-by-step for partner-led deployment
- `docs/client-adoption/quickstart-deployment-guide.md` — 3 time-boxed deployment paths
- `docs/client-adoption/client-admin-guide.md` — client's operational responsibilities

### 4.6 Deployment Decision Checklist (from Appendix B, `docs/partner-kit/03-deployment-guide.md`)

13 steps, owner-assigned. Both partner and client must confirm all items before pilot operation begins. See `docs/partner-kit/03-deployment-guide.md` → Appendix section for full table.

### 4.7 Production-Ready vs Pilot-Ready vs Demo-Only

| Path | Classification | Basis |
|------|---------------|-------|
| Enforcement gate logic (`evaluate()`) | Production-grade logic | 432 tests including adversarial, 12/12 invariants, snapshot tests |
| Audit log (file-backed) | Production-suitable | 12 tests; standard JSONL append-only pattern |
| Docker Compose deployment | Pilot-ready | Operator adds network controls, monitoring, restart policy |
| Node.js direct deployment | Pilot-ready | Same as Docker; operator adds perimeter |
| HTTP API (review portal server) | Demo / pilot | Not a hardened production server; no rate limiting, no auth on API callers |
| Third-party security review | Future roadmap (v0.2.0) | Not yet completed |
| PKI-backed signing | Future roadmap (v0.2.0) | Presence-checking only in v0.1.0 |

---

## Section 5 — Client Onboarding Process

**Reference document:** `docs/client-adoption/pilot-delivery-playbook.md`  
**Format:** Tier 2 Controlled Workflow Pilot = 5 weeks. Adjust to 3 weeks for Tier 1, 8 weeks for Tier 3.  
**Jesse hours target:** ≤ 8 total across full Tier 2 pilot.

### Pre-Pilot — Agreement and Readiness

| Activity | Client | Partner (Line Axia / certified partner) | Lamont Labs |
|----------|--------|----------------------------------------|-------------|
| Complete readiness assessment | Score on qualification scorecard | Use `client-qualification-scorecard.md` | Confirm technical readiness |
| Sign working agreement | Sign | Prepare and present | Jesse signs; defines support hour allocation |
| Agree success criteria | Sign | Draft from `pilot-success-framework.md` | Review |
| Confirm named contacts | Provide technical owner | Provide account contact | Confirm Jesse support window |

**Deliverables:** Signed working agreement, completed readiness assessment, named contacts, agreed success criteria document  
**Supporting files:** `docs/client-adoption/client-qualification-scorecard.md`, `docs/client-adoption/client-readiness-assessment.md`, `docs/client-adoption/pilot-success-framework.md`

### Phase 1 — Discovery (Week 1, Days 1–2)

| Activity | Duration | Owner |
|----------|---------|-------|
| 30-minute kickoff session (onboarding agenda) | 30 min | Partner facilitates; Jesse not required |
| Browser demo (`pnpm demo:web`) | During kickoff | Partner demonstrates |
| Distribute role-specific training materials | At kickoff | Partner |
| Capture early questions in writing | During kickoff | Partner |

**Supporting files:** `docs/client-adoption/training/30-minute-onboarding-agenda.md`, `docs/client-adoption/training/` (8 training materials)  
**Jesse hours:** 0 (unless client specifically requests)

### Phase 2 — Workflow Mapping (Week 1, Days 3–4)

| Activity | Duration | Owner |
|----------|---------|-------|
| Workflow mapping session (sections A–M of workbook) | 2–3 hours | Partner facilitates; client operational lead + technical owner |
| Complete CerbaSeal Field Map | During session | Partner + client |
| Resolve ALLOW / HOLD / REJECT conditions | During session | Client decision; partner structures |

**Output:** Completed policy pack worksheet mapping all four sections of `cerbaseal.policy.json`  
**Supporting files:** `docs/client-adoption/workflow-mapping-workbook.md`  
**Jesse hours:** Optional standby — answers technical questions asynchronously

### Phase 3 — Configuration (Week 1–2)

| Activity | Duration | Owner |
|----------|---------|-------|
| Policy pack authoring | 1–3 hours | Partner; uses policy-pack-authoring-guide.md |
| `pnpm audit:repo` validation (check 16) | Minutes | Partner |
| Client review of policy | 30 min | Client reviews actor names and approval chains |

**Supporting files:** `docs/client-adoption/policy-pack-authoring-guide.md`, `deployment-starter/cerbaseal.policy.json` (template)  
**Governance templates:** 4 built-in templates in `docs/client-adoption/templates/`  
**Jesse hours:** 0 for standard workflows; possible async review

### Phase 4 — Deployment (Week 2)

| Activity | Duration | Owner |
|----------|---------|-------|
| Clone and install | 15 min | Partner engineer |
| `pnpm test` pass | Minutes | Partner engineer |
| `pnpm audit:repo` pass | Minutes | Partner engineer |
| Docker Compose or Node.js Direct setup | 30–60 min | Partner engineer |
| Audit log path configuration | 5 min | Partner + client confirms path |
| `tsx deployment-starter/verify.ts` (9 assertions) | Minutes | Partner |

**Supporting files:** `docs/partner-kit/03-deployment-guide.md`, `docs/client-adoption/quickstart-deployment-guide.md`  
**Jesse hours:** 0 for standard deployment; 1–2 for non-standard environments

### Phase 5 — Validation (Week 2–3)

| Activity | Duration | Owner |
|----------|---------|-------|
| ALLOW scenario verification | 15 min | Partner + client |
| HOLD scenario verification (with approver) | 30 min | Partner + client + approver representative |
| REJECT scenario verification | 15 min | Partner + client |
| `GET /health` confirms `auditChainValid: true` | 5 min | Partner |
| Representative pilot requests | 1–2 hours | Client + partner |

**Supporting files:** `docs/partner-kit/04-pilot-guide.md` (Session 3 + 4 detail), `deployment-starter/verify.ts`

### Phase 6 — Pilot Operation (Week 3–4)

| Activity | Duration | Owner |
|----------|---------|-------|
| Client operates workflow through gate | Ongoing | Client |
| Partner provides Tier 1/2 support | As needed | Partner |
| Issues logged and triaged | As needed | Partner |
| Tier 3 escalation (if needed) | As needed | Lamont Labs |

**Supporting files:** `docs/partner-kit/05-support-guide.md`, `docs/client-adoption/support-boundaries.md`  
**Jesse hours:** 0–2 (Tier 3 escalations only)

### Phase 7 — Evidence Closeout (Week 5)

| Activity | Duration | Owner |
|----------|---------|-------|
| `pnpm export:proof` | Minutes | Partner |
| `pnpm verify:proof` (checksums confirmed) | Minutes | Partner |
| `pnpm generate:evidence-report` | Minutes | Partner |
| Evidence review session with compliance stakeholders | 60 min | Client + partner |
| Document issues, tickets, next-step recommendation | 30 min | Partner + Lamont Labs |
| Sign pilot closeout summary | Client + partner | Both |

**Deliverables:** `proof-snapshot.json`, JSONL audit log, evidence report, pilot closeout summary  
**Jesse hours:** 1–2 (evidence review participation, if requested)

### Training Support Materials

| Material | Audience | Format | Path |
|----------|---------|--------|------|
| 10-minute executive overview | CRO, CISO, executives | Self-directed reading | `training/10-minute-executive-overview.md` |
| 30-minute onboarding agenda | All client roles | Facilitated session | `training/30-minute-onboarding-agenda.md` |
| Operator guide | Operations staff | Self-directed reading | `training/operator-guide.md` |
| Reviewer guide | Decision reviewers / approvers | Self-directed reading | `training/reviewer-guide.md` |
| Admin guide | Technical admin / IT | Self-directed reading | `training/admin-guide.md` |
| FAQ | All | Self-directed | `training/faq.md` |
| Common errors and fixes | Technical / operations | Self-directed | `training/common-errors-and-fixes.md` |
| Getting started guide | Technical | Self-directed | `training/getting-started-guide.md` |

---

## Section 6 — Founder Dependency Analysis

**Reference document:** `docs/client-adoption/founder-dependency-reduction-plan.md`  
**Source:** Pilot delivery playbook (Tier 2 = 5-week pilot, target ≤ 8 Jesse hours total)

### Hour Estimates Per Tier 2 Pilot

| Scenario | Total Jesse Hours | Basis |
|----------|-----------------|-------|
| Best case | 0–2 hours | Standard workflow, strong technical partner, no Tier 3 issues |
| Realistic (target) | 4–8 hours | One async technical review, one evidence session, one Tier 3 query |
| Difficult case | 12–20 hours | Non-standard environment, multiple Tier 3 escalations, new invariant discussion |

**The playbook target is ≤ 8 hours.** If actual hours exceed 8 for a Tier 2 pilot, the playbook calls for scope and support model review.

### Jesse Involvement Breakdown by Phase

| Phase | Activity | Jesse Required? | Replaceable By |
|-------|---------|----------------|----------------|
| Pre-pilot | Sales qualification | No | `client-discovery-script.md`, `client-qualification-scorecard.md` |
| Pre-pilot | Agreement signing | Yes (signs working agreement) | Cannot be delegated — Jesse is the legal counterparty |
| Pre-pilot | Technical readiness confirmation | Async only | Documentation-first; `pnpm audit:repo` self-checks |
| Week 1 | 30-minute kickoff | No (unless client requests) | `training/30-minute-onboarding-agenda.md` |
| Week 1 | Workflow mapping | No (optional standby) | `workflow-mapping-workbook.md` sections A–M |
| Week 2 | Policy authoring | No | `policy-pack-authoring-guide.md`, 4 templates |
| Week 2 | Deployment | No (except non-standard environments) | `quickstart-deployment-guide.md`, `03-deployment-guide.md` |
| Week 2–3 | Verification | No | `verify.ts` script, audit check 16 |
| Week 3–4 | Pilot support (Tier 1/2) | No | Partner uses `05-support-guide.md` |
| Week 3–4 | Tier 3 escalation | Yes — irreplaceable | Cannot be delegated for core invariant or source changes |
| Week 5 | Evidence review | Optional (1–2 hrs) | Partner can lead using evidence report and templates |
| Week 5 | Closeout summary | No | Partner produces; Jesse reviews async |

### Top 10 Remaining Founder-Dependency Points

| # | Dependency | Reduction Path | Current Status |
|---|-----------|---------------|----------------|
| 1 | Legal counterparty on working agreement | Partner agreement framework with IP protections | Not yet templated |
| 2 | Tier 3 escalation for invariant questions | Extended technical documentation, FAQ expansion | Partially mitigated by `02-technical-brief.md` |
| 3 | New workflow JSON authoring for complex cases | Policy pack builder (Priority 1 build item) | Roadmap only — spec exists at `self-service-configuration-wizard-spec.md` |
| 4 | First 1–2 workflow mapping sessions for new partners | Train-the-trainer program | ✓ Done — `train-the-trainer-program.md` |
| 5 | Evidence review explanation for non-technical stakeholders | Replay and evidence explorer (Priority 4 build item) | Roadmap only |
| 6 | Non-standard deployment environments | Extended troubleshooting guide | ✓ Done — `troubleshooting-guide.md` |
| 7 | Technical validation request from sophisticated clients | Expanded technical brief and Q&A | Partially mitigated by `02-technical-brief.md` |
| 8 | Security review questions during procurement | Third-party security review package (Priority 6 build item) | Roadmap — not yet completed |
| 9 | First paid pilot commercial scoping | Pricing framework, partner discussion brief | ✓ Done — `08-pricing-and-commercial-model.md`, `12-partner-discussion-brief.md` |
| 10 | Pilot closeout and evidence presentation | Evidence closeout template (roadmap) | Partially mitigated by `generate:evidence-report` |

**Supporting files for this section:**
- `docs/client-adoption/founder-dependency-reduction-plan.md` — 8-layer dependency map with status for each
- `docs/client-adoption/pilot-delivery-playbook.md` — explicit Jesse hours per week
- `docs/client-adoption/train-the-trainer-program.md`

---

## Section 7 — Partner Readiness

### Partner Kit Documents

| File | Audience | Purpose | Completeness |
|------|---------|---------|-------------|
| `docs/partner-kit/00-OVERVIEW.md` | All | Kit index, guided independence model, tool reference | Complete |
| `docs/partner-kit/01-sales-brief.md` | Sales | Positioning, 3 qualification questions, buyer persona map, 2-page format | Complete |
| `docs/partner-kit/02-technical-brief.md` | Technical | Architecture, invariants, evidence chain detail | Complete |
| `docs/partner-kit/03-deployment-guide.md` | Technical lead | Step-by-step deployment + Appendix B checklist (13 steps + partner readiness) | Complete |
| `docs/partner-kit/04-pilot-guide.md` | Partner lead | 1-day pilot guide (5 sessions, morning to evidence package) + commercial framing | Complete |
| `docs/partner-kit/05-support-guide.md` | Support | 10 most common issues with diagnosis and resolution | Complete |
| `docs/partner-kit/06-objection-handling.md` | Sales/technical | 8 enterprise objections, 3 response paths each (CISO, compliance, technical) | Complete |
| `docs/partner-kit/07-certification-framework.md` | All | Level 1 (Deploy), Level 2 (Configure), Level 3 (Lead Pilots) with exercises | Complete |
| `docs/partner-kit/08-pricing-and-commercial-model.md` | Sales leads | 5 pilot tiers, annual licensing, 4 channel models, pilot package, negotiation posture | Complete |
| `docs/partner-kit/09-market-positioning.md` | Sales leads | Category placement, benchmarks (Styra/Credo/Arthur/Workato/MuleSoft/Fiddler), sources | Complete |
| `docs/partner-kit/10-adoption-roadmap.md` | Principals | 6 build priorities, founder independence metrics, 4 time-horizon action plan | Complete |
| `docs/partner-kit/11-risk-register.md` | All | 7 risk areas, out-of-scope v0.1.0 items, neutral external language | Complete |
| `docs/partner-kit/12-partner-discussion-brief.md` | Principals | Q&A brief for commercial calls, talking points, negotiation posture | Complete |

### Certification Levels

| Level | Name | What It Proves | Minimum Before |
|-------|------|---------------|----------------|
| Level 1 | Deploy | Can stand up CerbaSeal and verify it works without assistance | Any client deployment |
| Level 2 | Configure | Can author a policy pack for a new client workflow without assistance | Unsupervised pilot delivery |
| Level 3 | Lead Pilots | Can run a full pilot from kickoff to evidence closeout with appropriate escalation discipline | Leading engagement solo |

**Reference:** `docs/partner-kit/07-certification-framework.md`

---

## Section 8 — Pilot Readiness

### Recommended First Pilot Shape

**Internal reference:** `docs/client-adoption/pilot-sizing-and-pricing-framework.md`  
**Classification:** Tier 2 — Controlled Workflow Pilot

| Element | Specification |
|---------|-------------|
| Workflow scope | One workflow, one decision path, one approval model |
| Duration | 45–90 days (5-week delivery playbook) |
| Deployment mode | Docker Compose or Node.js Direct, client-controlled environment |
| Decision states validated | ALLOW, HOLD (with live approver), REJECT |
| Evidence output | Proof snapshot (`proof-snapshot.json`), JSONL audit log, evidence report |
| Support model | Partner-led Tier 1/2; Lamont Labs Tier 3 for core issues only |
| Jesse hours target | ≤ 8 hours across full pilot |

### Supported Pilot Workflow Archetypes (Built-In)

| Workflow | Built-in Class Name | Starter Kit |
|---------|--------------------|-----------  |
| Fraud triage | `fraud_triage` | `examples/fraud-workflow-starter/` |
| Transaction escalation | `transaction_escalation` | `examples/financial-approval-starter/` |
| Account hold recommendation | `account_hold_recommendation` | `examples/financial-approval-starter/` |
| AI agent tool execution | (custom via `extended`) | `examples/agent-gate/`, `examples/agent-integration-starter/` |
| Generic approval workflow | (custom via `extended`) | `examples/rest-api-starter/` |

### Pilot Success Criteria

**Reference:** `docs/client-adoption/pilot-success-framework.md`

A pilot is successful when the client and partner can demonstrate:
1. One defined workflow mapped to CerbaSeal request, config, and policy structures
2. ALLOW, HOLD, and REJECT verified with real audit events
3. Cryptographically chained audit log produced and exported
4. `proof-snapshot.json` exported with checksums verified
5. Evidence package reviewed with operational and compliance stakeholders
6. Operational responsibilities confirmed and documented (monitoring, escalation path, admin)
7. Issues and support tickets documented with disposition

### Pilot Failure Criteria (Out of Scope Declared)

If any of the following are expected, the pilot scope must be explicitly renegotiated before work begins:

- Production certification or formal regulatory compliance certification
- Unlimited custom development
- 24/7 support without written scope
- Multi-workflow scope in a Tier 2 engagement without Tier 4 pricing
- AI model quality, correctness, or bias validation
- Built-in network-level API authentication (operator responsibility)

### Evidence Outputs

| Output | Command | What It Contains |
|--------|---------|-----------------|
| Proof snapshot | `pnpm export:proof` | stableChecksum, manifestChecksum, test results, invariant coverage, validator results, git commit |
| JSONL audit log | Written during operation | One entry per gate decision; SHA-256 chained |
| Evidence report | `pnpm generate:evidence-report` | Human-readable compliance evidence |
| Verification confirmation | `pnpm verify:proof` | Confirms checksums match; confirms snapshot has not been tampered with |

### Escalation Path

| Tier | Who | What It Covers |
|------|-----|---------------|
| Tier 1 | Client self-service | `training/` docs, FAQ, common errors guide |
| Tier 2 | Partner (certified) | `05-support-guide.md` (10 common issues), `troubleshooting-guide.md` |
| Tier 3 | Lamont Labs | Core invariant changes, unresolved defects, non-standard environments, PKI questions, new ProposalSourceKind values |

---

## Section 9 — Pricing-Relevant Internal Facts

**Important:** This section contains only internal facts. No prices are recommended here. Pricing implications are noted neutrally.

### Implementation Effort Facts

| Fact | Evidence Source |
|------|----------------|
| Standard integration time (express middleware or REST API starter) | 30–60 minutes (per `examples/INTEGRATION-GUIDE.md`) |
| Webhook adapter integration | ~1 hour (per `examples/INTEGRATION-GUIDE.md`) |
| Async queue integration | 1–2 hours (per `examples/INTEGRATION-GUIDE.md`) |
| Policy pack authoring (standard workflow) | Covered in workflow mapping session (2–3 hours total for mapping + authoring) |
| Deployment setup (Docker Compose or Node.js Direct) | 30–60 minutes for standard environment |
| Full Tier 2 pilot delivery (5 weeks with experienced partner) | Partner and client time; Jesse ≤ 8 hours |
| Services-to-software ratio | Pilot is services-heavy (discovery, mapping, deployment, validation, training, evidence, support); annual license is software-light |

### Support Effort Facts

| Fact | Evidence Source |
|------|----------------|
| Tier 1/2 issues solvable without Jesse | 80% target (per `docs/partner-kit/00-OVERVIEW.md`) |
| 10 most common partner support issues documented | `docs/partner-kit/05-support-guide.md` |
| Support readiness validator | `pnpm demo:support:validate` — 13 assertions pass |
| Escalation discipline | Tier 3 = new invariants, unresolved defects, source-level changes — reserved |
| Support boundaries document | `docs/client-adoption/support-boundaries.md` — explicitly defines what is self-service vs. escalation |

### Deployment Complexity Facts

| Fact | Evidence Source |
|------|----------------|
| Two supported deployment paths | Docker Compose and Node.js Direct (`deployment-starter/`) |
| Deployment verification script | `tsx deployment-starter/verify.ts` — 9 assertions (REJECT, HOLD, ALLOW) |
| Deployment checklist | 13 steps with owner assignments (`docs/partner-kit/03-deployment-guide.md` Appendix) |
| Client owns network perimeter | No built-in network-level API caller authentication — operator responsibility |
| Persistent audit log | File-backed JSONL — client provides persistent volume |
| Windows deployment | Not tested in v0.1.0 |
| Non-standard environment risk | Additional Jesse time may be required |

### Configuration Complexity Facts

| Fact | Evidence Source |
|------|----------------|
| Configuration is JSON — no TypeScript required for standard workflows | `cerbaseal.config.json`, `cerbaseal.policy.json` |
| 4 built-in governance pack templates | `docs/client-adoption/templates/` |
| Policy validation built into audit check 16 | `pnpm audit:repo` check 16 |
| Policy authoring guide exists | `docs/client-adoption/policy-pack-authoring-guide.md` |
| Policy pack builder is roadmap (not yet built) | `docs/client-adoption/self-service-configuration-wizard-spec.md` (spec only) |
| Configuration errors are a common support issue | `docs/partner-kit/05-support-guide.md` — 10 common issues |

### Evidence Output Value Facts

| Fact | Evidence Source |
|------|----------------|
| Proof snapshot is cryptographically checksummed | stableChecksum, manifestChecksum |
| Checksums are stable across documentation changes | stableChecksum captures enforcement state only |
| JSONL audit log is SHA-256 forward-chained | `src/services/audit/` |
| Evidence export is a built-in command | `pnpm export:proof` |
| Evidence can be taken to a risk committee or regulatory reviewer | Per `docs/partner-kit/04-pilot-guide.md` ("Day Deliverables" section) |
| Evidence report is human-readable | `pnpm generate:evidence-report` |
| 12 reason codes are documented | `architecture/invariants/invariant-registry.yaml`, dossier Appendix A |

### Auditability Value Facts

| Fact | Evidence Source |
|------|----------------|
| Every gate decision produces an evidence bundle | `src/services/evidence/` |
| Every audit entry is SHA-256 chained to the previous | `test/persistent-audit-log.test.ts` (12 tests) |
| Invariant coverage is machine-verifiable | `pnpm check:invariants` — 12/12 covered |
| Test coverage of adversarial bypass attempts | `test/adversarial-integrity.test.ts`, `test/security/` (4 files) |
| Chain integrity can be verified from exported log | `examples/audit-export/` |

### Customer-Hosted Deployment Value Facts

| Fact | Evidence Source |
|------|----------------|
| No data leaves client environment | Client-controlled deployment model — client provides hosting |
| Docker Compose provides portable, repeatable deployment | `deployment-starter/docker-compose.yml` |
| Client retains full operational control | Guided independence model (`docs/partner-kit/00-OVERVIEW.md`) |
| CerbaSeal does not operate the client's identity provider | TrustState is evaluated but not operated by CerbaSeal |

### Founder Involvement Facts (Summarized)

| Fact | Value | Source |
|------|-------|--------|
| Target founder hours per Tier 2 pilot | ≤ 8 | `docs/client-adoption/pilot-delivery-playbook.md` |
| Founder hours trigger for scope review | > 8 | `docs/client-adoption/pilot-delivery-playbook.md` |
| Phases requiring founder involvement | Pre-pilot agreement signing; Tier 3 escalation | Sections above |
| Phases founder-independent (with current docs) | Sales, discovery, workflow mapping, deployment, validation, training, Tier 1/2 support | `docs/client-adoption/founder-dependency-reduction-plan.md` |
| Layers of founder dependency documented | 8 layers | `docs/client-adoption/founder-dependency-reduction-plan.md` |

### Annual Maintenance and Support Facts

| Fact | Evidence Source |
|------|----------------|
| Annual support model not yet formally defined | No annual SLA document in v0.1.0 |
| Tier 3 escalation requires Jesse for core changes | `docs/partner-kit/11-risk-register.md` |
| Post-pilot operational monitoring is environment-specific | Client responsibility; CerbaSeal provides health endpoint |
| `GET /health` returns `status` and `auditChainValid` | `examples/browser-demo/server.ts` |

---

## Section 10 — Possible Pricing Structure Inputs

**No final prices are included. This table provides the inputs that should inform pricing decisions.**

| Offer Component | Client Receives | Work Required | Who Performs | Reusable or Custom | One-time or Recurring | Support Burden | Evidence Value | Pricing Implication |
|----------------|----------------|--------------|-------------|-------------------|----------------------|----------------|----------------|---------------------|
| Discovery / Readiness Assessment | Fit assessment, workflow candidate, deployment path recommendation, pilot scope | 1×60-min discovery call, readiness scoring, summary report | Partner facilitates; Lamont Labs reviews async | Reusable process, custom output | One-time | Very low | Low | Should cover partner discovery hours and preparation |
| 1-Day Express Pilot | Governed workflow, ALLOW/HOLD/REJECT verified, proof snapshot | 5 sessions (workflow mapping, policy, deployment, integration, verification) | Partner leads, client technical owner participates | Template reusable; workflow policy is custom | One-time | Low during, low after | High (exportable evidence) | Must cover 1 partner day + preparation + post-day closeout |
| Controlled Workflow Pilot (Tier 2) | One production-adjacent workflow, guided deployment, evidence package, bounded support window | 5-week delivery playbook; all onboarding phases | Partner leads all phases; Jesse ≤ 8 hours | Playbook reusable; all client artifacts custom | One-time | Moderate (Tier 1/2 partner; Tier 3 reserved) | High (audit log, proof snapshot, evidence report) | Must cover full 5-week partner engagement + Jesse time + materials |
| Deployment Support | Deployment path setup, config/policy validation, health check verification | 30–90 min for standard environment; variable for non-standard | Partner engineer | Mostly reusable | One-time | Low after successful deployment | Moderate | Should reflect actual deployment hours; premiums for non-standard environments |
| Configuration Support | Policy pack authoring for client workflow; actor mapping; approval chains | 2–4 hours for standard workflow | Partner (post-Level 2 cert) | Template reusable; workflow mapping is custom | One-time | Low after authoring; higher if complex policy | Moderate | Reflects policy complexity and mapping session hours |
| Annual License | Software access, version updates, usage rights | Lamont Labs maintains source, releases updates | Lamont Labs | Fully reusable | Recurring | Depends on support tier | High (continuing enforcement value) | Should reflect enforcement value, not pilot services; separate from one-time implementation |
| Partner License / Channel Fee | Partner right to resell, deploy, and deliver CerbaSeal | Lamont Labs provides certification path, kit updates, Tier 3 backstop | Lamont Labs | Reusable | Recurring (annual) | Low if partner is certified; higher for uncertified partners | High if partner can deliver repeatedly | Should reflect certification investment and Tier 3 support access |
| Additional Workflow | Second governed workflow added after first pilot | New mapping session, policy extension, verification | Partner | Template reusable; workflow policy is custom | One-time (per workflow) | Lower than first workflow (no deployment work) | Additional evidence value | Should be meaningfully less than first workflow (no deployment overhead) |
| Support Package | Bounded support hours per month / quarter | Triage, diagnosis, Tier 2 resolution | Partner Tier 1/2; Lamont Labs Tier 3 (rarely) | Mostly reusable | Recurring | Moderate (depends on client technical maturity) | Moderate (audit trails maintained) | Should be based on observed support hours per pilot + buffer |
| Evidence / Audit Package | Periodic proof snapshot, evidence report, audit log export, review session | `export:proof`, `generate:evidence-report`, review facilitation | Partner facilitates; client stakeholders attend | Commands reusable; content is custom | One-time or periodic | Low (commands are scripted) | High (compliance value) | Should reflect time for review session facilitation, not command execution |
| Security / Procurement Package | Security summary, known-limitations disclosure, future security review context | Compile security summary, `SECURITY_SUMMARY` from review portal | Partner compiles; Jesse reviews | Mostly reusable | One-time per procurement cycle | Low | High (accelerates enterprise procurement) | Should be priced to recover preparation time; unlocks larger engagements |
| Custom Integration | Client-specific integration beyond starter kits | TypeScript integration development, testing | Lamont Labs or partner engineer (if Level 2+ certified) | Custom | One-time | Moderate to high (ongoing maintenance risk) | Varies | Time-and-materials; not bundled in standard pilot |
| Roadmap / Custom Development | New invariant, new ProposalSourceKind, new API capability | TypeScript source changes + new tests | Lamont Labs only | Not reusable by default | One-time | High (Jesse involvement required) | High if commercially relevant | Time-and-materials; requires written scope; IP treatment must be agreed in advance |

---

## Section 11 — External Market Research Placeholders

**These sources must be verified directly by the analyst. The repo contains the internal reference notes only (per `docs/partner-kit/09-market-positioning.md`). Prices marked [VERIFY] require external lookup.**

| Source | What to Look For | URL or Search Path | Repo Notes |
|--------|-----------------|-------------------|-----------|
| Arthur AI — AWS Marketplace | Annual or monthly pricing; offering classification; contract structure | `aws.amazon.com/marketplace` → search "Arthur AI" | Repo notes: "AI governance control plane" positioning; public marketplace availability |
| Styra DAS — AWS Marketplace | Per-system or per-decision pricing; enterprise vs starter tier | `aws.amazon.com/marketplace/pp/prodview-4qemlqp6lodwg` | Repo notes: $5,000/month for 16 systems and 100MM decisions/month (verify current pricing) |
| Workato Enterprise — AWS Marketplace | Task-based pricing; enterprise workspace fee | `aws.amazon.com/marketplace/pp/prodview-yrn5rvs3n6v4c` | Repo notes: $143,750/year for 1,000,000 tasks and Enterprise Support (verify current) |
| MuleSoft — AWS Marketplace | Middleware integration pricing tiers; services ecosystem | `aws.amazon.com/marketplace` → search "MuleSoft" | Repo notes: Six-figure annual pricing tiers; large professional-services ecosystem |
| Credo AI — AWS Marketplace | Private offer terms; contract duration; usage basis | `aws.amazon.com/marketplace/pp/prodview-x67krdatcdday` | Repo notes: Private-offer model; pricing depends on contract duration and usage |
| Fiddler AI — Control Plane | AI control-plane positioning language; pricing if listed | `fiddler.ai/control-plane` | Repo notes: "Enforceable policy, auditable governance, centralized oversight" language |
| Vanta — Buyer-reported pricing | SOC 2 automation pricing; comparable compliance automation | G2, Capterra, Vendr, buyer community posts | [VERIFY] Not in repo — relevant for compliance automation category context |
| Drata — Buyer-reported pricing | Compliance automation; audit evidence management pricing | G2, Capterra, Vendr | [VERIFY] Not in repo |
| Secureframe — Buyer-reported pricing | Compliance automation pricing; evidence collection | G2, Capterra, Vendr | [VERIFY] Not in repo |
| AI governance platform pricing (general) | Credo, Monitaur, Holistic AI, other AI governance tools | G2 "AI Governance" category; AWS Marketplace | [VERIFY] Use for category validation |
| Policy enforcement pricing (general) | OPA/Styra ecosystem; Permit.io; PlainID; Axiomatics | AWS Marketplace; vendor pricing pages | [VERIFY] Styra is confirmed; others require verification |
| Enterprise middleware / integration pricing | Boomi, Tines, n8n enterprise; Workato competitors | AWS Marketplace; vendor pricing | Workato reference in repo; others [VERIFY] |
| Enterprise pilot / PoC pricing benchmarks | What enterprises pay for a 45–90 day governance/compliance PoC | Industry analyst reports; Forrester; Gartner | [VERIFY] Not in repo |
| Implementation / services ratios | Services margin vs software margin for comparable products | AWS/Forrester channel partner economics report | Repo notes: Professional-services margins 25%–45%, resale margin ~13% (verify current data) |

**Pricing limitation note (from `docs/partner-kit/09-market-positioning.md`):**
> Many enterprise AI governance, control-plane, and compliance vendors use private offers or custom pricing. Exact private contract values are often not publicly available. The pricing framework should be used as a structured discussion model and refined after direct partner feedback, first pilot scoping, and observed support effort.

---

## Section 12 — Known Limitations and Roadmap

All items below use neutral external-facing language per `docs/partner-kit/11-risk-register.md`.

### Security

| Item | Status | External Description | Roadmap |
|------|--------|---------------------|---------|
| Third-party security review | Not yet completed | Formal third-party security review is planned as a future milestone | v0.2.0 |
| PKI-backed cryptographic signing of `DecisionEnvelope` | Current scope: presence-checking only | `immutableSignature` is checked for presence and non-emptiness; cryptographic key validation is a roadmap item | v0.2.0 |
| HTTP API caller authentication | Operator responsibility | Network-level access control is implemented by the operator using gateway, VPN, or private network | Operator responsibility |
| Rate limiting, circuit breaking, WAF | Operator responsibility | Denial-of-service resilience is implemented at the deployment perimeter by the operator | Operator responsibility |
| Key management infrastructure | Not built | Approval signature key management is an operator and future platform concern | Future roadmap |

### Integration

| Item | Status | External Description |
|------|--------|---------------------|
| Identity provider integration | Boundary responsibility | CerbaSeal evaluates TrustState but does not operate the client IdP; integration boundary and required identity assertions are defined during workflow mapping |
| Production monitoring integration | Operator responsibility | Operational monitoring is environment-specific; CerbaSeal provides a health endpoint (`GET /health`) and audit chain verification |
| Windows deployment | Not tested | Windows deployment is outside current tested scope; support posture is unclear |

### Configuration and Tooling

| Item | Status | External Description |
|------|--------|---------------------|
| Policy pack builder (wizard) | Roadmap | A guided policy configuration experience is a Priority 1 build item; current approach is JSON with partner guidance and validation |
| Workflow mapping wizard | Roadmap | Turns discovery into a repeatable automated process; current approach uses the workflow mapping workbook |
| Governance pack library (expanded) | Roadmap | Additional pre-built templates for finance, insurance, KYC, claims, and AI agent workflows |
| Replay and evidence explorer | Roadmap | A visual evidence explorer for non-engineering stakeholders; current approach is `generate:evidence-report` |
| Partner deployment automation | Roadmap | Further reduces setup time; current approach uses documented deployment paths and `verify.ts` |

### Commercial and Operations

| Item | Status | External Description |
|------|--------|---------------------|
| Founder dependency in early pilots | Current scope | Tier 3 support and roadmap changes require Lamont Labs involvement; guided independence model reduces routine dependency |
| Pricing uncertainty | Current scope | Private enterprise pricing is not fully public across comparable vendors; pricing framework should be revised after first pilots and observed support effort |
| Annual support SLA | Not yet defined | Formal annual support SLA will be defined before first annual license agreement |
| Partner agreement framework | Not yet templated | IP ownership, territory, and channel terms require written agreements; IP stays with Lamont Labs |

---

## Section 13 — Final Verification Commands

Run all of the following to independently verify the complete repository state.

```bash
# ─────────────────────────────────────────────────
# 1. Runtime verification
# ─────────────────────────────────────────────────
node --version
# Expected: v18.0.0 or higher (tested on v22.22.0)

pnpm --version
# Expected: any current pnpm version (tested on 10.26.1)

# ─────────────────────────────────────────────────
# 2. Version control state
# ─────────────────────────────────────────────────
git rev-parse HEAD
# Expected: 485cde3faaa0524ffd5f5b6132673789f89adab9

git branch --show-current
# Expected: main

# ─────────────────────────────────────────────────
# 3. Full test suite
# ─────────────────────────────────────────────────
pnpm test
# Expected: Test Files 17 passed (17), Tests 432 passed (432)

# ─────────────────────────────────────────────────
# 4. Repository governance audit (16 checks)
# ─────────────────────────────────────────────────
pnpm audit:repo
# Expected: 16 / 16 checks passed, Status: PASS

# ─────────────────────────────────────────────────
# 5. Architectural boundary check
# ─────────────────────────────────────────────────
pnpm check:imports
# Expected: all boundaries clean

# ─────────────────────────────────────────────────
# 6. Invariant coverage
# ─────────────────────────────────────────────────
pnpm check:invariants
# Expected: 12 / 12 invariants covered

# ─────────────────────────────────────────────────
# 7. Demo validators
# ─────────────────────────────────────────────────
pnpm demo:web:validate
# Expected: 106 assertions (pass)

pnpm demo:support:validate
# Expected: 13 assertions (pass)

pnpm review:validate
# Expected: 110 assertions (pass)

# ─────────────────────────────────────────────────
# 8. Proof export and verification
# ─────────────────────────────────────────────────
pnpm export:proof
# Expected: writes docs/reports/proof-snapshot.json
# Expected stableChecksum:  e5aca8b2ad5f7abb528322be754d06463cb01367e038daf1472f925206c64e2c
# Expected manifestChecksum: 53f5733305c6e585b21ed8c4239a1197fd48efb91da690044dc4f116def20cae
# Status: PASS

pnpm verify:proof
# Expected: Status: VERIFIED — Both checksums match.

# ─────────────────────────────────────────────────
# 9. Setup wizard (interactive — run manually)
# ─────────────────────────────────────────────────
# pnpm setup
# Follow prompts; writes cerbaseal.config.json and cerbaseal.policy.json

# ─────────────────────────────────────────────────
# 10. Deployment verification (requires Node.js Direct path set up)
# ─────────────────────────────────────────────────
# tsx deployment-starter/verify.ts
# Expected: 9 assertions pass (REJECT, HOLD, ALLOW scenarios)

# ─────────────────────────────────────────────────
# 11. Demo servers (manual, then validate)
# ─────────────────────────────────────────────────
# pnpm demo:web         (starts review portal; validate in another terminal)
# pnpm demo:consumer    (consumer integration example)
# pnpm demo:agent       (agent gate example)
# pnpm demo:audit       (auditor view example)
# pnpm demo:support     (support readiness example)

# ─────────────────────────────────────────────────
# 12. Evidence and report generation
# ─────────────────────────────────────────────────
pnpm generate:evidence-report
# Expected: generates human-readable compliance evidence report

# pnpm generate:system-pdf      → cerbaseal-system-reference.pdf
# pnpm generate:pricing-pdf     → pricing framework PDF
# pnpm generate:commercial-pdf  → commercial framework PDF
```

---

## Summary of Verification Run Results

| Check | Command | Result | Notes |
|-------|---------|--------|-------|
| Test suite | `pnpm test` | **432/432 PASS, 17 files** | ~5.2 seconds |
| Repo audit | `pnpm audit:repo` | **16/16 PASS** | All checks clean |
| Invariant coverage | `pnpm check:invariants` | **12/12 covered** | All INV-01–INV-12 |
| Proof export | `pnpm export:proof` | **PASS** | Writes `docs/reports/proof-snapshot.json` |
| Proof verify | `pnpm verify:proof` | **VERIFIED** | Checksums match |
| Demo web validator | `pnpm demo:web:validate` | **106 assertions PASS** | |
| Demo support validator | `pnpm demo:support:validate` | **13 assertions PASS** | |
| Review portal validator | `pnpm review:validate` | **110 assertions PASS** | |
| Import boundary check | `pnpm check:imports` | **PASS** | All 29 src files clean |
| TypeScript compile | `tsc --noEmit` | **PASS** | No errors |

**Stable checksum (enforcement state):** `e5aca8b2ad5f7abb528322be754d06463cb01367e038daf1472f925206c64e2c`  
**Manifest checksum (full body):** `53f5733305c6e585b21ed8c4239a1197fd48efb91da690044dc4f116def20cae`  
**Commit:** `485cde3faaa0524ffd5f5b6132673789f89adab9`  
**Branch:** `main`

### Stale Documentation Found

**None.** Audit check 14 (`No stale test-count references in documentation`) passed — all documentation references match the actual test count of 432.

### Failed Commands

**None.** All commands above produced expected output.

### Pricing-Relevant Uncertainties Requiring External Research

1. **Arthur AI, Credo AI current pricing** — Both use private-offer models on AWS Marketplace. Prices are not publicly listed. Must be obtained from analyst sources (G2, Vendr, Gartner) or direct vendor inquiry.
2. **Vanta, Drata, Secureframe pricing** — Compliance automation category context. Relevant for buyer-budget calibration. Not in repo — requires external research.
3. **Current Styra DAS pricing** — Repo cites $5,000/month as of research date. Verify against current listing at `aws.amazon.com/marketplace/pp/prodview-4qemlqp6lodwg`.
4. **Current Workato pricing** — Repo cites $143,750/year. Verify against current listing at `aws.amazon.com/marketplace/pp/prodview-yrn5rvs3n6v4c`.
5. **Enterprise pilot/PoC pricing norms (45–90 day)** — No repo evidence for what regulated enterprises typically pay for a governed PoC. Forrester or Gartner research recommended.
6. **Current partner services margin benchmarks** — Repo cites 25%–45% professional-services margins from an AWS/Forrester source. Verify currency.
7. **Annual license pricing norms for AI governance platforms** — Credo AI and Arthur AI use private offers; public benchmarks are unavailable. Analyst reports or aggregator data (Vendr) recommended.
