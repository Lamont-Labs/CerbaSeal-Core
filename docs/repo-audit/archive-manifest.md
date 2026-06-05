# Archive Manifest
**CerbaSeal-Core v0.1.0 — Phase 8 Audit**
Generated: 2026-06-05

---

## Purpose

Record every file moved to `/archive` during the Phase 8 cleanup, with justification for each. Nothing is deleted — all artifacts are preserved in `/archive` with their original directory structure.

---

## Archive Groups

### Group 1: CerbaSeal-Core/ — Nested Repository Copy

**Justification:** `CerbaSeal-Core/` is a stale nested copy of the repository root. It was created during an earlier development phase when the project structure was being established. It contains only 3 markdown files (all exact duplicates of files in `docs/`) plus a complete `node_modules/` installation. It serves no current development, deployment, or documentation purpose.

| Source | Archive Destination |
|---|---|
| `CerbaSeal-Core/docs/03-architecture-diagram.md` | `archive/CerbaSeal-Core/docs/03-architecture-diagram.md` |
| `CerbaSeal-Core/docs/04-threat-model-lite.md` | `archive/CerbaSeal-Core/docs/04-threat-model-lite.md` |
| `CerbaSeal-Core/docs/05-non-goals.md` | `archive/CerbaSeal-Core/docs/05-non-goals.md` |
| `CerbaSeal-Core/node_modules/` | `archive/CerbaSeal-Core/node_modules/` |

**Status:** MOVED ✓

---

### Group 2: lib/ — Orphaned Workspace Build Artifacts

**Justification:** The `lib/` directory contains four workspace packages (`api-client-react`, `api-spec`, `api-zod`, `db`) that were created as part of a pnpm workspace scaffold. None of these packages contain source code — only build artifacts (`tsconfig.tsbuildinfo` files) and binary tools (`orval`, `drizzle-kit`). No file in `src/`, `test/`, or `artifacts/cerbaseal-demo/` imports from these packages. They add 296KB and confuse the repository structure.

| Source | Archive Destination |
|---|---|
| `lib/api-client-react/` | `archive/lib/api-client-react/` |
| `lib/api-spec/` | `archive/lib/api-spec/` |
| `lib/api-zod/` | `archive/lib/api-zod/` |
| `lib/db/` | `archive/lib/db/` |

**Status:** MOVED ✓

---

### Group 3: Line Axia Bespoke Scripts

**Justification:** These scripts were written specifically to generate documents for the Line Axia prospect engagement (CTO review pack, call prep binder, QA brief, dependency inventory). They are not reusable for other prospects — they contain Line Axia-specific content hardcoded into the script body. Their presence in the main `scripts/` directory implies to any future contributor that these are general-purpose tools, which they are not. The outputs (PDFs) are preserved in `archive/docs/reports/`.

| Source | Archive Destination | Output Archived? |
|---|---|---|
| `scripts/generate-cto-pdf.mjs` | `archive/scripts/generate-cto-pdf.mjs` | Yes — see Group 5 |
| `scripts/generate-call-prep-binder.mjs` | `archive/scripts/generate-call-prep-binder.mjs` | Yes — see Group 5 |
| `scripts/generate-qa-brief.mjs` | `archive/scripts/generate-qa-brief.mjs` | Yes — see Group 5 |
| `scripts/generate-dependency-inventory.mjs` | `archive/scripts/generate-dependency-inventory.mjs` | Yes — see Group 5 |

**Status:** MOVED ✓

---

### Group 4: Line Axia Docs — From docs/ Tree

**Justification:** These documents are specific to the Line Axia prospect relationship — meeting summaries, bespoke partner packs, and pre-call status snapshots. They should not be in the main documentation tree because: (1) they are not reusable templates, (2) they contain client-specific information, and (3) they create confusion for anyone navigating the docs tree expecting reusable product documentation.

| Source | Archive Destination | Reason |
|---|---|---|
| `docs/line-axia-call-summary.md` | `archive/docs/line-axia-call-summary.md` | Meeting notes — not reusable |
| `docs/client-adoption/line-axia-partner-enablement-pack.md` | `archive/docs/line-axia-partner-enablement-pack.md` | Bespoke partner pack |
| `docs/status/pre-call-summary.md` | `archive/docs/status/pre-call-summary.md` | Pre-call snapshot — stale |
| `docs/reports/FOUNDER_INDEPENDENCE_SESSION_SUMMARY.md` | `archive/docs/reports/FOUNDER_INDEPENDENCE_SESSION_SUMMARY.md` | Session notes |

**Status:** MOVED ✓

---

### Group 5: Line Axia Output PDFs and Docs — From docs/reports/

**Justification:** These are the outputs of the Line Axia bespoke scripts (Group 3). They are preserved here as a complete record of the Line Axia engagement but should not be in the main `docs/reports/` directory alongside reusable reports.

| Source | Archive Destination |
|---|---|
| `docs/reports/CTO_REVIEW_PACK_LINE_AXIA.md` | `archive/docs/reports/CTO_REVIEW_PACK_LINE_AXIA.md` |
| `docs/reports/CTO_REVIEW_PACK_LINE_AXIA.pdf` | `archive/docs/reports/CTO_REVIEW_PACK_LINE_AXIA.pdf` |
| `docs/reports/CTO_CALL_PREP_BINDER_LINE_AXIA.pdf` | `archive/docs/reports/CTO_CALL_PREP_BINDER_LINE_AXIA.pdf` |
| `docs/reports/LINE_AXIA_CALL_QA_BRIEF.pdf` | `archive/docs/reports/LINE_AXIA_CALL_QA_BRIEF.pdf` |
| `docs/reports/LINE_AXIA_DEPENDENCY_INVENTORY.pdf` | `archive/docs/reports/LINE_AXIA_DEPENDENCY_INVENTORY.pdf` |

**Status:** MOVED ✓

---

### Group 6: Duplicate EU Deployment Doc

**Justification:** `docs/15-eu-deployment-posture.md` is a duplicate of `docs/deployment/eu-pilot-deployment-posture.md`. The numbered root-level version predates the organized `deployment/` subdirectory. The `deployment/` version is the correct canonical location.

| Source | Archive Destination |
|---|---|
| `docs/15-eu-deployment-posture.md` | `archive/docs/15-eu-deployment-posture.md` |

**Status:** MOVED ✓

---

## Files Recommended for Future Archive (After Content Merge)

These files should be archived AFTER their content is merged into the consolidated documents described in `documentation-consolidation-plan.md`. They are not archived in this pass to avoid losing content before the merge is complete.

| File | Merge Into | Phase |
|---|---|---|
| `docs/00-reviewer-start-here.md` | `docs/00-reviewer-guide.md` (to be created) | Phase 3 |
| `docs/00-external-reviewer-brief.md` | `docs/00-reviewer-guide.md` (to be created) | Phase 3 |
| `docs/06-adversarial-validation-summary.md` | `docs/06-adversarial-integrity-report.md` | Phase 3 |
| `docs/bounded-autonomy-model.md` | `docs/architecture/enforcement-model.md` (to be created) | Phase 3 |
| `docs/execution_boundary.md` | `docs/architecture/enforcement-model.md` | Phase 3 |
| `docs/system_boundary.md` | `docs/architecture/enforcement-model.md` | Phase 3 |
| `docs/trust_boundaries.md` | `docs/architecture/trust-boundaries.md` (to be created) | Phase 3 |
| `docs/09-trust-boundary-and-limitations.md` | `docs/architecture/trust-boundaries.md` | Phase 3 |
| `docs/client-adoption/client-readiness-assessment.md` | `/assess` (web app supersedes) | Phase 3 |
| `docs/client-adoption/client-qualification-scorecard.md` | `/assess` (web app supersedes) | Phase 3 |
| `docs/client-adoption/onboarding-sequence.md` | `quickstart-deployment-guide.md` | Phase 3 |
| `docs/client-adoption/pilot-success-framework.md` | `pilot-delivery-playbook.md` | Phase 3 |
| `docs/client-adoption/founder-dependency-reduction-plan.md` | `FOUNDER-INDEPENDENCE-KIT.md` | Phase 3 |
| `docs/client-adoption/training/` (8 files) | `training-reference.md` (to be created) | Phase 3 |
| `docs/client-adoption/client-admin-guide.md` | `training-reference.md` | Phase 3 |
| `docs/09-deployment-model.md` | `docs/deployment/deployment-guide.md` (to be created) | Phase 3 |
| `docs/deployment/deployment-modes.md` | `docs/deployment/deployment-guide.md` | Phase 3 |
| `docs/deployment/mode-c-client-controlled.md` | `docs/deployment/deployment-guide.md` | Phase 3 |
| `docs/deployment/eu-pilot-deployment-posture.md` | `docs/deployment/deployment-guide.md` | Phase 3 |
| `docs/deployment/pilot-deployment-checklist.md` | `docs/deployment/deployment-guide.md` | Phase 3 |
| `docs/pilot/pilot-readiness-brief.md` | `CERBASEAL_PILOT_READINESS_BINDER.md` | Phase 3 |
| `docs/pilot-operations-model.md` | `pilot-delivery-playbook.md` | Phase 3 |
| `docs/operations/pilot-safe-mode.md` | `pilot-delivery-playbook.md` | Phase 3 |

---

## What Was NOT Archived

These items were considered but not archived:

| Item | Decision | Reason |
|---|---|---|
| `examples/browser-demo/` | KEEP | Still powers "Start application" workflow + browser-demo-routes.test.ts |
| `docs/status/current-state.md` | KEEP | Still current — review after next milestone |
| `docs/reports/FULL_AUDIT_REPORT_2026-06-04.md` | KEEP | Recent comprehensive audit — retain for continuity |
| `docs/reports/adversarial/` | KEEP | Security evidence — maintain permanently |
| `docs/reports/proof-snapshot.json` | KEEP | Cryptographic proof — maintain permanently |
| `scripts/repo-audit.ts` | KEEP | Active tool, distinct from this manual audit |
| `attached_assets/` | NOT MOVED | Replit-managed directory; classify as ORPHANED but do not move |

---

## Archive Index

```
archive/
├── CerbaSeal-Core/
│   ├── docs/
│   │   ├── 03-architecture-diagram.md    [duplicate of docs/03-*]
│   │   ├── 04-threat-model-lite.md       [duplicate of docs/04-*]
│   │   └── 05-non-goals.md              [duplicate of docs/05-*]
│   └── node_modules/                    [nested dependency install]
├── docs/
│   ├── 15-eu-deployment-posture.md      [duplicate of deployment/eu-pilot-*]
│   ├── line-axia-call-summary.md        [client-specific meeting notes]
│   ├── status/
│   │   └── pre-call-summary.md          [stale pre-call snapshot]
│   └── reports/
│       ├── CTO_REVIEW_PACK_LINE_AXIA.md
│       ├── CTO_REVIEW_PACK_LINE_AXIA.pdf
│       ├── CTO_CALL_PREP_BINDER_LINE_AXIA.pdf
│       ├── LINE_AXIA_CALL_QA_BRIEF.pdf
│       ├── LINE_AXIA_DEPENDENCY_INVENTORY.pdf
│       ├── FOUNDER_INDEPENDENCE_SESSION_SUMMARY.md
│       └── line-axia-partner-enablement-pack.md
├── lib/
│   ├── api-client-react/                [orphaned build artifacts]
│   ├── api-spec/                        [orphaned binary only]
│   ├── api-zod/                         [orphaned build artifacts]
│   └── db/                             [orphaned build artifacts]
└── scripts/
    ├── generate-cto-pdf.mjs             [Line Axia bespoke]
    ├── generate-call-prep-binder.mjs    [Line Axia bespoke]
    ├── generate-qa-brief.mjs            [Line Axia bespoke]
    └── generate-dependency-inventory.mjs [Line Axia bespoke]
```
