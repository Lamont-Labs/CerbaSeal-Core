# Duplicate Analysis
**CerbaSeal-Core v0.1.0 — Phase 2 Audit**
Generated: 2026-06-05

---

## Exact Duplicates

These files are byte-for-byte or functionally identical to another file in the repository.

### D-001: CerbaSeal-Core/docs/ — Nested Repository Copy

| Duplicate File | Original | Verdict |
|---|---|---|
| CerbaSeal-Core/docs/03-architecture-diagram.md | docs/03-architecture-diagram.md | **ARCHIVE** CerbaSeal-Core version |
| CerbaSeal-Core/docs/04-threat-model-lite.md | docs/04-threat-model-lite.md | **ARCHIVE** CerbaSeal-Core version |
| CerbaSeal-Core/docs/05-non-goals.md | docs/05-non-goals.md | **ARCHIVE** CerbaSeal-Core version |

**Justification:** `CerbaSeal-Core/` is a stale nested copy of the repository root from an earlier phase of development. It contains only 3 docs files (all exact duplicates) plus a full nested `node_modules/`. The directory serves no current purpose. Archive the entire `CerbaSeal-Core/` directory.

**Action:** `mv CerbaSeal-Core/ archive/CerbaSeal-Core/`

---

### D-002: EU Deployment Posture — Duplicate Across Doc Trees

| File | Lines | Verdict |
|---|---|---|
| docs/15-eu-deployment-posture.md | — | **ARCHIVE** (unnumbered version is the keeper) |
| docs/deployment/eu-pilot-deployment-posture.md | — | **KEEP** (in the correct subdirectory) |

**Justification:** Same topic, same content. The numbered root-level version predates the organized `deployment/` subdirectory. The `deployment/` version is the correct canonical location.

**Action:** `mv docs/15-eu-deployment-posture.md archive/docs/`

---

## Structural Duplicates (Same Prefix Number)

Numbered docs where multiple files share the same prefix, creating navigation confusion.

### D-003: Multiple 06-* Docs

| File | Topic | Lines | Verdict |
|---|---|---|---|
| docs/06-adversarial-integrity-report.md | Full adversarial test report | 208 | **KEEP** as primary |
| docs/06-adversarial-validation-summary.md | Summary of same report | 132 | **MERGE** into 06-adversarial-integrity-report, then archive |
| docs/06-runtime-layer-stack.md | Runtime layer description | 146 | **RENAME** to 06b-runtime-layer-stack.md or move to architecture/ |

**Action:** Merge the validation summary as an appendix section into the integrity report. Rename the runtime layer doc to avoid the 06 collision.

---

### D-004: Multiple 07-* Docs

| File | Topic | Verdict |
|---|---|---|
| docs/07-diagnostic-support-model.md | Support/diagnostics | **KEEP** |
| docs/07-invariant-model.md | Invariants | **RENAME** to 07b-invariant-model.md |

**Action:** Rename to resolve the prefix collision. Topics are distinct; no merge needed.

---

### D-005: Multiple 09-* Docs

| File | Topic | Lines | Verdict |
|---|---|---|---|
| docs/09-deployment-model.md | Deployment modes | 281 | **KEEP** — or supersede with deployment/ subdir |
| docs/09-trust-boundary-and-limitations.md | Trust limits | 116 | **RENAME** to 09b-trust-boundary-and-limitations.md |

**Action:** Rename to resolve prefix collision.

---

## Overlapping Documents (Same Topic, Different Angles)

These documents cover the same subject matter with partial overlap. They are not duplicates but create navigation confusion and maintenance burden.

### O-001: Three "Start Here" Entry Points

| File | Lines | Audience | Verdict |
|---|---|---|---|
| docs/00-external-reviewer-brief.md | 120 | External technical reviewer | **KEEP** |
| docs/00-reviewer-start-here.md | 183 | Same audience | **MERGE** into 00-external-reviewer-brief, then **ARCHIVE** |
| docs/00-quick-review-walkthrough.md | 220 | Same audience | **KEEP** as walkthrough companion |

**Justification:** Three documents all serve the same "reviewer just landed here" use case. Consolidate to two: a brief (external-reviewer-brief) and a walkthrough (quick-review-walkthrough). Merge the start-here content into the brief.

---

### O-002: Client Readiness Assessment — Document vs. Web App

| Asset | Type | Lines | Verdict |
|---|---|---|---|
| docs/client-adoption/client-readiness-assessment.md | Markdown doc | 271 | **ARCHIVE** |
| docs/client-adoption/client-qualification-scorecard.md | Markdown doc | 177 | **ARCHIVE** |
| `/assess` web page | Live interactive tool | — | **KEEP** |

**Justification:** The live `/assess` readiness assessment with 16 questions, 4-category scoring, and instant verdict supersedes both static markdown documents. Maintaining them as separate documents creates divergence risk. Archive the docs; update any references to point to the web app.

---

### O-003: Troubleshooting — Document vs. Web App

| Asset | Type | Lines | Verdict |
|---|---|---|---|
| docs/client-adoption/troubleshooting-guide.md | Markdown doc | 361 | **KEEP** (print reference) |
| docs/client-adoption/training/common-errors-and-fixes.md | Markdown doc | — | **MERGE** into troubleshooting-guide, then **ARCHIVE** |
| `/troubleshoot` web page | Live interactive tool | — | **KEEP** |

**Justification:** The web app decision tree is the preferred interactive tool. The markdown guide is still useful as a downloadable/printable reference. The `common-errors-and-fixes.md` training file overlaps significantly with the troubleshooting guide — merge it in.

---

### O-004: Onboarding — Three Overlapping Documents

| File | Lines | Verdict |
|---|---|---|
| docs/client-adoption/onboarding-sequence.md | 205 | **ARCHIVE** — superseded by quickstart |
| docs/client-adoption/quickstart-deployment-guide.md | 325 | **KEEP** as canonical onboarding reference |
| docs/client-adoption/training/getting-started-guide.md | — | **MERGE** into quickstart, then **ARCHIVE** |

**Justification:** Three documents all walk a new client through getting started. The quickstart guide is the most complete. Merge the getting-started guide into it and archive the onboarding-sequence.

---

### O-005: Pilot Delivery — Multiple Overlapping Documents

| File | Lines | Verdict |
|---|---|---|
| docs/client-adoption/pilot-delivery-playbook.md | 341 | **KEEP** as master pilot playbook |
| docs/pilot/pilot-readiness-brief.md | — | **MERGE** into CERBASEAL_PILOT_READINESS_BINDER, then **ARCHIVE** |
| docs/pilot/pilot-intake-checklist.md | — | **KEEP** as standalone checklist |
| docs/client-adoption/pilot-success-framework.md | 182 | **MERGE** into pilot-delivery-playbook, then **ARCHIVE** |
| CERBASEAL_PILOT_READINESS_BINDER.md | — | **KEEP** as master pilot binder |

**Justification:** Five pilot documents with overlapping coverage. The master binder and the delivery playbook should be the two canonical pilot documents. Others merge into them.

---

### O-006: Admin/Operator Training — Duplicate Guides

| File | Lines | Verdict |
|---|---|---|
| docs/client-adoption/client-admin-guide.md | 256 | **KEEP** |
| docs/client-adoption/training/admin-guide.md | — | **ARCHIVE** (duplicate) |
| docs/client-adoption/training/operator-guide.md | — | **MERGE** into client-admin-guide |

**Justification:** Two admin guides and one operator guide covering identical ground. Merge into the single `client-admin-guide.md`.

---

### O-007: Boundary and Trust Documents (4-Way Overlap)

| File | Lines | Verdict |
|---|---|---|
| docs/bounded-autonomy-model.md | 198 | **KEEP** — most architecturally complete |
| docs/execution_boundary.md | 91 | **MERGE** into bounded-autonomy-model, then **ARCHIVE** |
| docs/system_boundary.md | — | **MERGE** into bounded-autonomy-model, then **ARCHIVE** |
| docs/trust_boundaries.md | 66 | **MERGE** into 09b-trust-boundary-and-limitations, then **ARCHIVE** |

**Justification:** Four documents all describe where CerbaSeal's authority begins and ends. One authoritative document is enough.

---

### O-008: Founder Independence — Two Overlapping Documents

| File | Lines | Verdict |
|---|---|---|
| docs/FOUNDER-INDEPENDENCE-KIT.md | 229 | **KEEP** as definitive independence roadmap |
| docs/client-adoption/founder-dependency-reduction-plan.md | 252 | **MERGE** key content into FOUNDER-INDEPENDENCE-KIT, then **ARCHIVE** |
| docs/reports/FOUNDER_INDEPENDENCE_SESSION_SUMMARY.md | — | **ARCHIVE** (session notes, not reusable) |

---

### O-009: Line Axia Bespoke Content — Archive All

The following documents are specific to the Line Axia prospect. They should not be in the main documentation tree.

| File | Verdict |
|---|---|
| docs/line-axia-call-summary.md | **ARCHIVE** |
| docs/client-adoption/line-axia-partner-enablement-pack.md | **ARCHIVE** |
| docs/reports/CTO_REVIEW_PACK_LINE_AXIA.md | **ARCHIVE** |
| docs/reports/CTO_REVIEW_PACK_LINE_AXIA.pdf | **ARCHIVE** |
| docs/reports/CTO_CALL_PREP_BINDER_LINE_AXIA.pdf | **ARCHIVE** |
| docs/reports/LINE_AXIA_CALL_QA_BRIEF.pdf | **ARCHIVE** |
| docs/reports/LINE_AXIA_DEPENDENCY_INVENTORY.pdf | **ARCHIVE** |
| docs/status/pre-call-summary.md | **ARCHIVE** |
| scripts/generate-cto-pdf.mjs | **ARCHIVE** |
| scripts/generate-call-prep-binder.mjs | **ARCHIVE** |
| scripts/generate-qa-brief.mjs | **ARCHIVE** |
| scripts/generate-dependency-inventory.mjs | **ARCHIVE** |

**Justification:** These are bespoke deliverables for a single prospect relationship. They crowd the repository and could confuse future reviewers about what is product documentation vs. client-specific material.

---

## Dead Code

### DC-001: lib/ Directory — Orphaned Build Artifacts

| Path | Status |
|---|---|
| lib/api-client-react/ | Build artifacts only, no source, not referenced |
| lib/api-spec/ | orval binary only, no source |
| lib/api-zod/ | Build artifacts only |
| lib/db/ | Build artifacts + drizzle-kit binary |

**Verdict:** ARCHIVE. These appear to be remnants from a pnpm workspace scaffold that was never populated with source code. No file in `src/`, `test/`, or `cerbaseal-demo/` imports from these packages.

---

### DC-002: examples/browser-demo/ — Superseded but Still Active

| Status | Detail |
|---|---|
| Superseded by | cerbaseal-demo Vite artifact |
| Still referenced by | "Start application" workflow + browser-demo-routes.test.ts |
| Safe to archive | No — test coverage depends on it |

**Verdict:** KEEP for now. When the "Start application" workflow is migrated to the Vite artifact and the browser-demo-routes.test.ts is updated, this entire directory can be archived. Document this as a future cleanup task.

---

### DC-003: scripts/repo-audit.ts — Superseded by This Audit

| File | Status |
|---|---|
| scripts/repo-audit.ts | 406 lines, pre-existing audit script |

**Verdict:** KEEP — this is a programmatic audit tool distinct from this manual audit document. Maintain it as part of the CI toolchain.

---

## Unused Utilities

### U-001: examples/http-wrapper.ts

| File | Status |
|---|---|
| examples/http-wrapper.ts | Root-level utility file, not imported by any example |

**Verdict:** KEEP. It is a valid integration utility that a developer would use. Document it in the examples README.

---

## Summary of Recommendations

| Action | Count | Files |
|---|---|---|
| ARCHIVE (exact duplicates) | 3 | CerbaSeal-Core/docs/* |
| ARCHIVE (entire directory) | 2 | CerbaSeal-Core/, lib/ |
| ARCHIVE (Line Axia bespoke) | 12 | Various scripts + docs |
| ARCHIVE (session/status notes) | 4 | line-axia-call-summary, pre-call-summary, FOUNDER_INDEPENDENCE_SESSION_SUMMARY, various |
| ARCHIVE (superseded by web app) | 2 | client-readiness-assessment, client-qualification-scorecard |
| MERGE then ARCHIVE | 7 | Various overlapping docs |
| RENAME (prefix collision) | 3 | 06b, 07b, 09b prefix fixes |
| KEEP | All remaining | — |

**Net reduction:** ~25–30 files removed from active documentation tree, ~4 scripts archived, 2 entire directories cleaned out.
