# Repository Inventory
**CerbaSeal-Core v0.1.0 — Phase 1 Audit**
Generated: 2026-06-05

---

## Summary Counts

| Layer | Files | Classification |
|---|---|---|
| Core enforcement engine | 28 TypeScript | CORE |
| Test suite | 16 TypeScript | CORE |
| Integration examples | ~50 files | ADOPTION |
| Scripts (reusable) | 8 files | DEPLOYMENT / COMMERCIAL |
| Scripts (Line Axia bespoke) | 4 .mjs files | LEGACY |
| Architecture registry | 1 YAML | CORE |
| Root docs (numbered) | 32 Markdown | CORE / LEGACY / DUPLICATE |
| client-adoption/ docs | 18+ Markdown | ADOPTION |
| deployment/ docs | 5 Markdown | DEPLOYMENT |
| demo/ docs | 8 Markdown | ADOPTION / LEGACY |
| pilot/ docs | 3 Markdown | PILOT |
| security/ docs | 3 Markdown | SECURITY |
| reports/ | 12 files (MD + PDF) | COMMERCIAL / LEGACY |
| training/ (inside client-adoption) | 8 Markdown | TRAINING |
| positioning/ | 2 Markdown | COMMERCIAL |
| operations/ | 2 Markdown | DEPLOYMENT |
| integration/ | 2 Markdown | ADOPTION |
| status/ | 2 Markdown | LEGACY |
| cerbaseal-demo artifact | ~80 files | ADOPTION |
| CerbaSeal-Core/ subdirectory | 3 docs + node_modules | DUPLICATE |
| lib/ directory | build artifacts only | ORPHANED |
| attached_assets/ | 30+ screenshots + 1 audio | ORPHANED |
| Commercial PDFs (root) | 3 PDFs | COMMERCIAL |

---

## CORE — Enforcement Engine

### src/ (28 files, ~2,600 lines)

| File | Purpose | Lines | Classification |
|---|---|---|---|
| src/config/cerbaseal-config.ts | Configuration loader, schema validation | 122 | CORE |
| src/domain/types/core.ts | Canonical type definitions (ExecutionRequest, GateDecision, etc.) | 138 | CORE |
| src/domain/types/audit.ts | Audit log entry types | ~60 | CORE |
| src/domain/types/diagnostics.ts | Diagnostic report types | 82 | CORE |
| src/domain/constants/invariants.ts | Invariant constant definitions | ~50 | CORE |
| src/domain/constants/reason-codes.ts | ALLOW/HOLD/REJECT reason code registry | ~70 | CORE |
| src/domain/errors/cerbaseal-error.ts | Error class hierarchy | ~30 | CORE |
| src/domain/formatters/certificate.ts | Audit certificate formatter | 63 | CORE |
| src/domain/formatters/demo-response.ts | Human-readable response formatter | 102 | CORE |
| src/domain/review-portal-data.ts | Data models for reviewer portal | 377 | CORE |
| src/domain/builders/agent-scenarios.ts | Test scenario builders (agent pattern) | 85 | CORE |
| src/domain/builders/consumer-scenarios.ts | Test scenario builders (consumer pattern) | 76 | CORE |
| src/domain/builders/gate-scenarios.ts | Test scenario builders (gate pattern) | ~50 | CORE |
| src/domain/builders/request-fixtures.ts | Canonical request fixtures | ~60 | CORE |
| **src/services/execution/execution-gate-service.ts** | **Primary enforcement gate — ALLOW/HOLD/REJECT decisions** | **571** | **CORE** |
| src/services/execution/mock-execution-system.ts | Test execution environment | ~80 | CORE |
| src/services/execution/tools.ts | Execution tool adapters | ~60 | CORE |
| src/services/audit/append-only-log-service.ts | In-memory append-only log | ~60 | CORE |
| src/services/audit/audit-hash-utils.ts | SHA-256 chain hashing | 112 | CORE |
| src/services/audit/file-backed-append-only-log-service.ts | Persistent file-backed log | 76 | CORE |
| src/services/diagnostics/diagnostic-report-service.ts | System health diagnostics | 407 | CORE |
| src/services/evidence/evidence-bundle-service.ts | Compliance evidence package generation | 91 | CORE |
| src/services/export/export-manifest-service.ts | Evidence export manifest | ~70 | CORE |
| src/services/replay/replay-service.ts | Decision replay from audit log | 62 | CORE |
| src/services/support/operator-action-service.ts | Operator hold-release / escalation | 233 | CORE |
| src/services/support/support-fixtures.ts | Support scenario fixtures | ~50 | CORE |
| src/services/support/system-health-service.ts | Runtime health monitoring | 129 | CORE |
| src/services/support/system-integrity-service.ts | Chain integrity verification | 176 | CORE |

**Central file:** `execution-gate-service.ts` (571 lines) — the ALLOW/HOLD/REJECT decision engine. All other services are support infrastructure.

### architecture/ (1 file)

| File | Purpose | Classification |
|---|---|---|
| architecture/invariants/invariant-registry.yaml | Registry of all enforcement invariants with test coverage mapping | CORE |

### Root config files

| File | Purpose | Classification |
|---|---|---|
| package.json | pnpm monorepo root — scripts, workspace config | CORE |
| pnpm-lock.yaml | Dependency lock | CORE |
| tsconfig.json | TypeScript project configuration | CORE |
| vitest.config.ts | Test runner configuration | CORE |
| cerbaseal.config.json | CerbaSeal runtime configuration example | CORE |
| CERBASEAL_PILOT_READINESS_BINDER.md | Comprehensive pilot readiness document | PILOT |
| README.md | (if present) Repository entry point | CORE |

---

## CORE — Test Suite

### test/ (16 files, ~5,582 lines, 419 tests)

| File | Purpose | Lines | Classification |
|---|---|---|---|
| test/execution-gate-service.test.ts | Core gate decision logic tests | ~200 | CORE |
| test/adversarial-integrity.test.ts | Adversarial bypass attempts | ~150 | SECURITY |
| test/audit-evidence-export.test.ts | Evidence bundle export | ~100 | CORE |
| test/diagnostic-report-service.test.ts | Diagnostics tests | ~150 | CORE |
| test/persistent-audit-log.test.ts | File-backed log tests | ~100 | CORE |
| test/integration/full-flow.test.ts | End-to-end enforcement flow | ~150 | CORE |
| test/integration/browser-demo-routes.test.ts | Demo server routes | 157 | ADOPTION |
| test/integration/review-portal-routes.test.ts | Review portal endpoints | 523 | CORE |
| test/integration/support-readiness.test.ts | Support readiness checks | 181 | CORE |
| test/integration/system-integration.test.ts | System integration | ~150 | CORE |
| test/integration/external-signal-examples.test.ts | External signal integration | 121 | ADOPTION |
| test/snapshots/enforcement-loop.snapshot.test.ts | Decision loop snapshots | 311 | CORE |
| test/security/contextual-boundary.test.ts | Boundary enforcement | 478 | SECURITY |
| test/security/fail-closed.test.ts | Fail-closed behavior | 63 | SECURITY |
| test/security/misuse-scenarios.test.ts | Misuse attempt scenarios | 779 | SECURITY |
| test/security/non-forgery.test.ts | Certificate non-forgery | 102 | SECURITY |

---

## ADOPTION — Integration Examples

### examples/ (~50 files, ~6MB including browser assets)

| Path | Purpose | Classification |
|---|---|---|
| examples/agent-gate/ | MCP-style agent gate pattern (5 files) | ADOPTION |
| examples/agent-integration-starter/ | AI agent integration template (2 files) | ADOPTION |
| examples/auditor-view/ | Auditor-facing certificate view (4 files) | ADOPTION |
| examples/browser-demo/ | HTML/JS demo portal — superseded by Vite app but still powers "Start application" workflow | ADOPTION / LEGACY |
| examples/consumer-example/ | Direct API consumer pattern (4 files) | ADOPTION |
| examples/financial-approval-starter/ | Finance workflow template (2 files) | ADOPTION |
| examples/fraud-workflow-starter/ | Fraud detection workflow template (2 files) | ADOPTION |
| examples/http-wrapper.ts | HTTP request adapter utility | ADOPTION |
| examples/rest-api-starter/ | REST API wrapper (4 files) | ADOPTION |
| examples/run-demo.ts | Demo runner entry point | ADOPTION |
| examples/support-readiness/ | Support readiness validation (2 files) | ADOPTION |

**Note:** `examples/browser-demo/` is still referenced by the "Start application" workflow and `test/integration/browser-demo-routes.test.ts`. It is legacy relative to the new cerbaseal-demo Vite artifact but cannot be archived until the workflow is migrated.

---

## DEPLOYMENT — Scripts

### scripts/ (16 files, ~9,116 lines)

| File | Purpose | Lines | Classification | Reusable? |
|---|---|---|---|---|
| generate-system-pdf.ts | Produces cerbaseal-system-breakdown.pdf | 1,710 | COMMERCIAL | Yes |
| generate-commercial-framework-pdf.ts | Produces cerbaseal-commercial-framework.pdf | 1,189 | COMMERCIAL | Yes |
| generate-pricing-pdf.ts | Produces cerbaseal-pricing-brief.pdf | 999 | COMMERCIAL | Yes |
| generate-pilot-config.ts | Generates pilot YAML configuration | 553 | PILOT | Yes |
| generate-evidence-report.ts | Produces evidence PDF for audit | 411 | DEPLOYMENT | Yes |
| repo-audit.ts | Repository audit tooling | 406 | CORE | Yes |
| export-proof.ts | Exports signed proof bundle | 211 | DEPLOYMENT | Yes |
| verify-proof.ts | Verifies proof bundle integrity | 179 | DEPLOYMENT | Yes |
| check-imports.ts | Validates import graph | 139 | CORE | Yes |
| check-invariant-coverage.ts | Checks invariant test coverage | 127 | CORE | Yes |
| hash-report.ts | Hashes a report for tamper evidence | 16 | CORE | Yes |
| git-push.sh | Git push utility | — | CORE | Yes |
| post-merge.sh | Post-merge setup | — | CORE | Yes |
| wizard-input.example.json | Example wizard input config | — | PILOT | Yes |
| **generate-call-prep-binder.mjs** | **Line Axia call prep binder — bespoke** | **1,060** | **LEGACY** | No |
| **generate-cto-pdf.mjs** | **Line Axia CTO review PDF — bespoke** | **498** | **LEGACY** | No |
| **generate-qa-brief.mjs** | **Line Axia QA brief — bespoke** | **402** | **LEGACY** | No |
| **generate-dependency-inventory.mjs** | **Line Axia dependency inventory — bespoke** | **717** | **LEGACY** | No |

---

## COMMERCIAL — Artifacts

| File | Purpose | Classification |
|---|---|---|
| cerbaseal-system-breakdown.pdf | Technical system overview for clients/reviewers | COMMERCIAL |
| cerbaseal-pricing-brief.pdf | Pricing and tier overview | COMMERCIAL |
| cerbaseal-commercial-framework.pdf | Full commercial framework | COMMERCIAL |
| docs/reports/CTO_REVIEW_PACK_LINE_AXIA.pdf | Line Axia bespoke review pack | LEGACY |
| docs/reports/CTO_REVIEW_PACK_LINE_AXIA.md | Source of above | LEGACY |
| docs/reports/CTO_CALL_PREP_BINDER_LINE_AXIA.pdf | Line Axia call prep | LEGACY |
| docs/reports/LINE_AXIA_CALL_QA_BRIEF.pdf | Line Axia QA brief | LEGACY |
| docs/reports/LINE_AXIA_DEPENDENCY_INVENTORY.pdf | Line Axia dependency inventory | LEGACY |
| docs/reports/FULL_AUDIT_REPORT_2026-06-04.md | Full system audit report 2026-06-04 | COMMERCIAL |
| docs/reports/proof-snapshot.json | Cryptographic proof snapshot | SECURITY |
| docs/reports/adversarial/ | Adversarial integrity report + hashes (4 files) | SECURITY |

---

## DOCUMENTATION — Root Level

### docs/ root (32 files)

| File | Purpose | Lines | Classification | Issue |
|---|---|---|---|---|
| 00-external-reviewer-brief.md | Reviewer entry point (external) | 120 | CORE | OVERLAPS with 00-reviewer-start-here |
| 00-quick-review-walkthrough.md | Reviewer walkthrough | 220 | CORE | OVERLAPS with above |
| 00-reviewer-start-here.md | Reviewer entry point | 183 | CORE | OVERLAPS — 3 "start here" docs |
| 01-system-definition.md | What CerbaSeal is | 90 | CORE | |
| 02-scope-boundary.md | In/out of scope | — | CORE | |
| 03-architecture-diagram.md | Architecture | — | CORE | DUPLICATE of CerbaSeal-Core/docs/03 |
| 04-threat-model-lite.md | Threat model | 80 | SECURITY | DUPLICATE of CerbaSeal-Core/docs/04 |
| 05-non-goals.md | Non-goals | — | CORE | DUPLICATE of CerbaSeal-Core/docs/05 |
| 06-adversarial-integrity-report.md | Adversarial test results | 208 | SECURITY | OVERLAPS with 06-adversarial-validation-summary |
| 06-adversarial-validation-summary.md | Same topic, different angle | 132 | SECURITY | OVERLAPS |
| 06-runtime-layer-stack.md | Runtime layers description | 146 | CORE | CONFLICTING 06 prefix |
| 07-diagnostic-support-model.md | Support/diagnostics model | — | CORE | |
| 07-invariant-model.md | Invariant system description | — | CORE | CONFLICTING 07 prefix |
| 09-deployment-model.md | Deployment modes | 281 | DEPLOYMENT | OVERLAPS with deployment/ subdir |
| 09-trust-boundary-and-limitations.md | Trust boundaries | 116 | SECURITY | CONFLICTING 09 prefix |
| 10-review-scope-clarification.md | Review scope limits | 100 | CORE | |
| 13-non-bypassability-model.md | Non-bypass guarantees | — | SECURITY | |
| 15-eu-deployment-posture.md | EU regulatory posture | — | DEPLOYMENT | DUPLICATE of docs/deployment/eu-pilot-deployment-posture |
| 17-pilot-boundary-and-client-binding.md | Pilot boundary definition | — | PILOT | |
| architecture/enforcement-boundary.md | Enforcement boundary | — | CORE | |
| bounded-autonomy-model.md | Bounded autonomy description | 198 | CORE | OVERLAPS with system_boundary, trust_boundaries |
| control_matrix.md | Control matrix | — | SECURITY | |
| current_maturity.md | Maturity assessment | 93 | CORE | |
| execution_boundary.md | Execution boundary | 91 | CORE | OVERLAPS with system_boundary |
| FOUNDER-INDEPENDENCE-KIT.md | Founder independence roadmap | 229 | COMMERCIAL | |
| governance-vocabulary.md | Canonical term definitions | 114 | CORE | |
| **line-axia-call-summary.md** | **Line Axia meeting notes** | **173** | **LEGACY** | ARCHIVE |
| one-page.md | One-page system summary | 163 | COMMERCIAL | |
| pilot-operations-model.md | Pilot operations | 153 | PILOT | |
| reconstructability.md | System reconstructability | 76 | SECURITY | |
| runtime_context.md | Runtime context description | — | CORE | |
| system_boundary.md | System boundary | — | CORE | OVERLAPS with trust_boundaries, execution_boundary |
| trust_boundaries.md | Trust boundaries | 66 | SECURITY | OVERLAPS with 09-trust-boundary-and-limitations |

---

## DOCUMENTATION — client-adoption/ (18 files + subdirs)

| File | Purpose | Lines | Classification | Issue |
|---|---|---|---|---|
| client-admin-guide.md | Admin configuration guide | 256 | TRAINING | OVERLAPS with training/admin-guide |
| client-discovery-script.md | Sales discovery call script | 226 | COMMERCIAL | |
| client-qualification-scorecard.md | Client qualification scoring | 177 | COMMERCIAL | OVERLAPS with assess page |
| client-readiness-assessment.md | Readiness assessment | 271 | ADOPTION | SUPERSEDED by /assess web page |
| eu-ai-act-nis2-mapping-support.md | EU compliance mapping | 250 | COMMERCIAL | |
| founder-dependency-reduction-plan.md | Plan to reduce Jesse involvement | 252 | COMMERCIAL | OVERLAPS with FOUNDER-INDEPENDENCE-KIT |
| frequently-asked-objections.md | Sales objection handling | 250 | COMMERCIAL | |
| **line-axia-partner-enablement-pack.md** | **Line Axia bespoke partner pack** | **265** | **LEGACY** | ARCHIVE |
| onboarding-sequence.md | Client onboarding steps | 205 | ADOPTION | OVERLAPS with quickstart-deployment-guide |
| pilot-delivery-playbook.md | Full pilot delivery playbook | 341 | PILOT | OVERLAPS with pilot/ subdir |
| pilot-sizing-and-pricing-framework.md | Pilot scope and pricing | 331 | COMMERCIAL | |
| pilot-success-framework.md | Success criteria | 182 | PILOT | OVERLAPS with pilot-intake-checklist |
| quickstart-deployment-guide.md | Fast deployment guide | 325 | DEPLOYMENT | OVERLAPS with deployment/ subdir |
| self-service-configuration-wizard-spec.md | Wizard spec (not yet built) | 339 | ADOPTION | SPEC document |
| support-boundaries.md | Support scope definition | 199 | ADOPTION | |
| templates/ (4 files) | Workflow template documents | — | PILOT | |
| train-the-trainer-program.md | Partner train-the-trainer | 245 | TRAINING | |
| troubleshooting-guide.md | Troubleshooting reference | 361 | TRAINING | PARTIALLY SUPERSEDED by /troubleshoot |
| workflow-mapping-workbook.md | Workflow mapping guide | 380 | PILOT | |

### client-adoption/training/ (8 files)

| File | Purpose | Classification | Issue |
|---|---|---|---|
| 10-minute-executive-overview.md | Executive training | TRAINING | PARTIALLY SUPERSEDED by /training |
| 30-minute-onboarding-agenda.md | Operator onboarding | TRAINING | PARTIALLY SUPERSEDED |
| admin-guide.md | Admin training | TRAINING | OVERLAPS with client-admin-guide |
| common-errors-and-fixes.md | Error reference | TRAINING | OVERLAPS with troubleshooting-guide |
| faq.md | Frequently asked questions | TRAINING | |
| getting-started-guide.md | Getting started | TRAINING | OVERLAPS with quickstart-deployment-guide |
| operator-guide.md | Operator training | TRAINING | OVERLAPS with client-admin-guide |
| reviewer-guide.md | Reviewer training | TRAINING | |

---

## DOCUMENTATION — Other subdirectories

### docs/deployment/ (5 files)

| File | Purpose | Classification |
|---|---|---|
| deployment-modes.md | Deployment mode descriptions | DEPLOYMENT |
| eu-pilot-deployment-posture.md | EU deployment posture | DEPLOYMENT — DUPLICATE of docs/15-eu-deployment-posture |
| mode-c-client-controlled.md | Mode C detail | DEPLOYMENT |
| pilot-deployment-checklist.md | Pre-deployment checklist | PILOT |
| runbook.md | Operational runbook | DEPLOYMENT |

### docs/demo/ (8 files)

| File | Purpose | Classification |
|---|---|---|
| README.md | Demo directory index | ADOPTION |
| browser-demo.md | Browser demo documentation | ADOPTION / LEGACY |
| client-context.md | Client context for demos | ADOPTION |
| client-workflow-canonical.md | Canonical workflow for demos | ADOPTION |
| enforcement-loop.md | Enforcement loop description | CORE |
| fraud-workflow.md | Fraud workflow demo | ADOPTION |
| workflow-diagram.md | Workflow diagram | ADOPTION |
| workflow-trace-mapping.md | Trace mapping for demos | ADOPTION |

### docs/pilot/ (3 files)

| File | Purpose | Classification |
|---|---|---|
| pilot-intake-checklist.md | Pilot intake checklist | PILOT |
| pilot-memo-template.md | Pilot memo template | PILOT |
| pilot-readiness-brief.md | Pilot readiness | PILOT — OVERLAPS with CERBASEAL_PILOT_READINESS_BINDER |

### docs/security/ (3 files)

| File | Purpose | Classification |
|---|---|---|
| access-control-and-rate-limiting.md | Access control | SECURITY |
| artifact-signing-roadmap.md | Signing roadmap | SECURITY |
| security-review-brief.md | Security review | SECURITY |

### docs/positioning/ (2 files)

| File | Purpose | Classification |
|---|---|---|
| cerbaseal-brand-system.md | Brand guidelines | COMMERCIAL |
| external-positioning.md | External positioning | COMMERCIAL |

### docs/operations/ (2 files)

| File | Purpose | Classification |
|---|---|---|
| pilot-safe-mode.md | Safe mode operations | DEPLOYMENT |
| solo-support-risk-reduction.md | Solo-founder risk reduction | COMMERCIAL |

### docs/status/ (2 files)

| File | Purpose | Classification |
|---|---|---|
| current-state.md | Current system state snapshot | LEGACY |
| **pre-call-summary.md** | **Pre-call status snapshot (Line Axia)** | **LEGACY — ARCHIVE** |

### docs/integration/ (2 files)

| File | Purpose | Classification |
|---|---|---|
| integration-spec.md | Integration specification | ADOPTION |
| system-flow.md | System flow description | ADOPTION |

---

## DUPLICATE — CerbaSeal-Core/ subdirectory

| File | Duplicate of | Classification |
|---|---|---|
| CerbaSeal-Core/docs/03-architecture-diagram.md | docs/03-architecture-diagram.md | DUPLICATE → ARCHIVE |
| CerbaSeal-Core/docs/04-threat-model-lite.md | docs/04-threat-model-lite.md | DUPLICATE → ARCHIVE |
| CerbaSeal-Core/docs/05-non-goals.md | docs/05-non-goals.md | DUPLICATE → ARCHIVE |
| CerbaSeal-Core/node_modules/ | (nested dependency install) | DUPLICATE → ARCHIVE |

**Verdict:** Entire `CerbaSeal-Core/` directory is a stale nested copy of the repository root. The only content is 3 docs files that are exact duplicates of docs/ root files. Archive the entire directory.

---

## ORPHANED — lib/ directory

| Path | Contents | Classification |
|---|---|---|
| lib/api-client-react/ | Build artifacts only (tsconfig.tsbuildinfo) — no source | ORPHANED → ARCHIVE |
| lib/api-spec/ | node_modules/.bin/orval — no source code | ORPHANED → ARCHIVE |
| lib/api-zod/ | Build artifacts only | ORPHANED → ARCHIVE |
| lib/db/ | Build artifacts + drizzle-kit binary | ORPHANED → ARCHIVE |

**Verdict:** These are workspace package build artifacts from a pnpm workspace that was never fully configured. No source code exists in these directories. Not referenced by the enforcement core or the cerbaseal-demo artifact. Archive entire `lib/` directory.

---

## ORPHANED — attached_assets/

| Type | Count | Classification |
|---|---|---|
| Screenshots (.jpg) | 30 | ORPHANED — development snapshots |
| PNG diagrams | 2 | ORPHANED |
| Call recording (.m4a) | 1 | ORPHANED |
| .docx call cheat sheet | 1 | ORPHANED |
| Audit result .txt files | 2 | ORPHANED |

**Verdict:** No production code references `attached_assets/`. These are Replit agent session artifacts. Do not move (Replit-managed directory) but classify as ORPHANED for awareness.

---

## Dependency Relationships

```
execution-gate-service.ts
  ← domain/types/core.ts (ExecutionRequest, GateDecision)
  ← domain/constants/invariants.ts
  ← domain/constants/reason-codes.ts
  ← services/audit/audit-hash-utils.ts
  ← services/audit/append-only-log-service.ts

evidence-bundle-service.ts
  ← services/audit/* (log access)
  ← domain/formatters/certificate.ts

diagnostic-report-service.ts
  ← services/support/system-health-service.ts
  ← services/support/system-integrity-service.ts
  ← services/audit/*

examples/ → src/ (all examples depend on core)
test/ → src/ (all tests depend on core)
scripts/ → src/ (PDF generators pull data from core)
cerbaseal-demo → standalone (no src/ dependency)
```

---

## Classification Summary

| Classification | Count | Action |
|---|---|---|
| CORE | 45 files | Maintain |
| ADOPTION | 40 files | Maintain / Consolidate |
| DEPLOYMENT | 12 files | Consolidate |
| TRAINING | 16 files | Consolidate into web app |
| PILOT | 15 files | Consolidate |
| SECURITY | 12 files | Maintain |
| COMMERCIAL | 12 files | Maintain |
| LEGACY | 12 files | Archive |
| DUPLICATE | 5 files | Archive |
| ORPHANED | 8 directories | Archive |
