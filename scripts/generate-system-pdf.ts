/**
 * CerbaSeal-Core — Maximum Detail System & Repo Breakdown PDF Generator
 * Run: pnpm tsx scripts/generate-system-pdf.ts
 * Output: cerbaseal-system-breakdown.pdf
 */

import PDFDocument from "pdfkit";
import { createWriteStream } from "node:fs";
import { resolve } from "node:path";

const OUT_PATH = resolve(process.cwd(), "cerbaseal-system-breakdown.pdf");

// ─── Palette ────────────────────────────────────────────────────────────────
const BLACK      = "#0d0d0d";
const NAVY       = "#0f1e3d";
const BLUE       = "#1a3a6b";
const ACCENT     = "#2563eb";
const LIGHT_BLUE = "#dbeafe";
const MID_GRAY   = "#6b7280";
const LIGHT_GRAY = "#f3f4f6";
const WHITE      = "#ffffff";
const GREEN      = "#15803d";
const RED        = "#b91c1c";
const AMBER      = "#d97706";
const RULE_COLOR = "#cbd5e1";

const PAGE_W    = 595.28;
const PAGE_H    = 841.89;
const MARGIN    = 48;
const CONTENT_W = PAGE_W - MARGIN * 2;

// ─── Helpers ────────────────────────────────────────────────────────────────

function newDoc(): PDFKit.PDFDocument {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    info: {
      Title: "CerbaSeal-Core v0.1.0 — System & Repo Breakdown",
      Author: "Jesse Lamont / Lamont Labs",
      Subject: "Deterministic Execution Governance Infrastructure",
      Creator: "generate-system-pdf.ts"
    },
    autoFirstPage: false
  });
  return doc;
}

function addPage(doc: PDFKit.PDFDocument): void {
  doc.addPage();
}

function rule(doc: PDFKit.PDFDocument, y?: number, color = RULE_COLOR): void {
  const yPos = y ?? doc.y;
  doc.save()
    .moveTo(MARGIN, yPos)
    .lineTo(PAGE_W - MARGIN, yPos)
    .strokeColor(color)
    .lineWidth(0.5)
    .stroke()
    .restore();
}

function headerBar(doc: PDFKit.PDFDocument, text: string): void {
  const yStart = doc.y;
  doc.rect(MARGIN, yStart, CONTENT_W, 22).fill(NAVY);
  doc.fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(text.toUpperCase(), MARGIN + 8, yStart + 6, { width: CONTENT_W - 16 });
  doc.y = yStart + 28;
}

function sectionTitle(doc: PDFKit.PDFDocument, text: string, level: 1 | 2 | 3 = 1): void {
  if (level === 1) {
    doc.moveDown(0.6);
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(14).text(text);
    rule(doc, doc.y + 2, ACCENT);
    doc.y += 6;
  } else if (level === 2) {
    doc.moveDown(0.4);
    doc.fillColor(BLUE).font("Helvetica-Bold").fontSize(11).text(text);
    doc.y += 2;
  } else {
    doc.moveDown(0.2);
    doc.fillColor(BLACK).font("Helvetica-Bold").fontSize(9.5).text(text);
  }
}

function body(doc: PDFKit.PDFDocument, text: string, color = BLACK, size = 9): void {
  doc.fillColor(color).font("Helvetica").fontSize(size).text(text, { lineGap: 2 });
}

function bullet(doc: PDFKit.PDFDocument, text: string, indent = 0, color = BLACK): void {
  const x = MARGIN + indent;
  doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(9)
    .text("•", x, doc.y, { continued: true, width: 10 });
  doc.fillColor(color).font("Helvetica").fontSize(9)
    .text(" " + text, { width: CONTENT_W - indent - 10, lineGap: 1.5 });
}

function kv(doc: PDFKit.PDFDocument, key: string, value: string, indent = 0): void {
  const x = MARGIN + indent;
  doc.fillColor(MID_GRAY).font("Helvetica-Bold").fontSize(8.5)
    .text(key + ": ", x, doc.y, { continued: true, width: CONTENT_W - indent });
  doc.fillColor(BLACK).font("Helvetica").fontSize(8.5).text(value, { lineGap: 2 });
}

function codeBlock(doc: PDFKit.PDFDocument, lines: string[], label?: string): void {
  doc.moveDown(0.3);
  if (label) {
    doc.fillColor(MID_GRAY).font("Helvetica-Oblique").fontSize(7.5).text(label);
  }
  const blockLines = lines;
  const lineH = 12;
  const blockH = blockLines.length * lineH + 10;
  const yStart = doc.y;
  doc.rect(MARGIN, yStart, CONTENT_W, blockH).fill(LIGHT_GRAY);
  doc.rect(MARGIN, yStart, 3, blockH).fill(ACCENT);
  blockLines.forEach((line, i) => {
    doc.fillColor(BLACK).font("Courier").fontSize(7.5)
      .text(line, MARGIN + 8, yStart + 5 + i * lineH, { lineBreak: false, width: CONTENT_W - 16 });
  });
  doc.y = yStart + blockH + 6;
}

function badge(doc: PDFKit.PDFDocument, text: string, color: string, bg: string): void {
  const w = doc.widthOfString(text, { fontSize: 7.5 }) + 10;
  const h = 14;
  const yb = doc.y;
  doc.rect(doc.x, yb, w, h).fill(bg);
  doc.fillColor(color).font("Helvetica-Bold").fontSize(7.5)
    .text(text, doc.x + 5, yb + 3, { lineBreak: false });
  doc.x += w + 6;
}

function table(
  doc: PDFKit.PDFDocument,
  headers: string[],
  rows: string[][],
  colWidths?: number[]
): void {
  const widths = colWidths ?? headers.map(() => CONTENT_W / headers.length);
  const rowH = 18;
  const headerH = 20;
  let y = doc.y;

  // Header
  doc.rect(MARGIN, y, CONTENT_W, headerH).fill(NAVY);
  let x = MARGIN;
  headers.forEach((h, i) => {
    doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(8)
      .text(h, x + 4, y + 5, { width: widths[i] - 8, lineBreak: false });
    x += widths[i];
  });
  y += headerH;

  rows.forEach((row, ri) => {
    const bg = ri % 2 === 0 ? WHITE : LIGHT_GRAY;
    doc.rect(MARGIN, y, CONTENT_W, rowH).fill(bg);
    let cx = MARGIN;
    row.forEach((cell, ci) => {
      const color = cell.startsWith("✓") ? GREEN : cell.startsWith("✗") ? RED : BLACK;
      doc.fillColor(color).font(ci === 0 ? "Helvetica-Bold" : "Helvetica").fontSize(7.5)
        .text(cell, cx + 4, y + 4, { width: widths[ci] - 8, lineBreak: false });
      cx += widths[ci];
    });
    // row border
    doc.save().moveTo(MARGIN, y + rowH).lineTo(PAGE_W - MARGIN, y + rowH)
      .strokeColor(RULE_COLOR).lineWidth(0.3).stroke().restore();
    y += rowH;
  });
  doc.y = y + 8;
}

function pageFooter(doc: PDFKit.PDFDocument, pageNum: number): void {
  const y = PAGE_H - MARGIN + 10;
  rule(doc, y - 4, RULE_COLOR);
  doc.fillColor(MID_GRAY).font("Helvetica").fontSize(7)
    .text("CerbaSeal-Core v0.1.0  |  Jesse Lamont / Lamont Labs  |  CONFIDENTIAL", MARGIN, y, { continued: true, width: CONTENT_W - 60 });
  doc.fillColor(MID_GRAY).font("Helvetica").fontSize(7)
    .text(`Page ${pageNum}`, { align: "right", width: 60 });
}

// ─── Cover Page ──────────────────────────────────────────────────────────────

function drawCover(doc: PDFKit.PDFDocument): void {
  addPage(doc);

  // Dark header band
  doc.rect(0, 0, PAGE_W, 240).fill(NAVY);

  // Seal-style accent line
  doc.rect(0, 240, PAGE_W, 4).fill(ACCENT);

  // Title block
  doc.fillColor(LIGHT_BLUE).font("Helvetica").fontSize(10)
    .text("LAMONT LABS  ·  EXECUTION GOVERNANCE INFRASTRUCTURE", MARGIN, 60, { align: "center", width: CONTENT_W });

  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(32)
    .text("CerbaSeal-Core", MARGIN, 85, { align: "center", width: CONTENT_W });

  doc.fillColor(LIGHT_BLUE).font("Helvetica").fontSize(13)
    .text("v0.1.0  —  System & Repository Breakdown", MARGIN, 125, { align: "center", width: CONTENT_W });

  doc.fillColor(WHITE).font("Helvetica").fontSize(9)
    .text("MAXIMUM DETAIL TECHNICAL REFERENCE", MARGIN, 160, { align: "center", width: CONTENT_W });

  // Meta block
  const mx = MARGIN + 60;
  const mw = CONTENT_W - 120;
  doc.rect(mx, 190, mw, 36).fill(BLUE);
  doc.fillColor(LIGHT_BLUE).font("Helvetica").fontSize(8.5)
    .text(`Generated: ${new Date().toUTCString()}`, mx, 198, { align: "center", width: mw });
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(8.5)
    .text("Jesse Lamont  ·  jesse@lamontlabs.io", mx, 210, { align: "center", width: mw });

  // Summary boxes
  const boxes = [
    { label: "Test Suite", value: "391 / 391", sub: "16 files · zero regressions", color: GREEN },
    { label: "Repo Audit", value: "15 / 15", sub: "all checks passing", color: GREEN },
    { label: "Invariants", value: "INV-01 → 12", sub: "100% test coverage", color: ACCENT },
    { label: "Import Bounds", value: "0 violations", sub: "79 files scanned", color: GREEN }
  ];

  const bw = (CONTENT_W - 18) / 4;
  const by = 268;
  boxes.forEach((b, i) => {
    const bx = MARGIN + i * (bw + 6);
    doc.rect(bx, by, bw, 72).fill(LIGHT_GRAY);
    doc.rect(bx, by, bw, 3).fill(b.color);
    doc.fillColor(b.color).font("Helvetica-Bold").fontSize(18)
      .text(b.value, bx, by + 14, { align: "center", width: bw });
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(8)
      .text(b.label, bx, by + 40, { align: "center", width: bw });
    doc.fillColor(MID_GRAY).font("Helvetica").fontSize(7)
      .text(b.sub, bx, by + 53, { align: "center", width: bw });
  });

  // TOC preview
  const ty = 370;
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10)
    .text("CONTENTS", MARGIN, ty);
  rule(doc, ty + 14, ACCENT);

  const toc = [
    ["1", "System Purpose & Architecture Overview"],
    ["2", "Domain Type System — All Interfaces & Enums"],
    ["3", "Invariant Registry (INV-01 → INV-12) — Full Detail"],
    ["4", "Reason Code Registry — All 18 Codes"],
    ["5", "Execution Gate Service — Full Logic Flow"],
    ["6", "Authority Class System & Runtime Config"],
    ["7", "Audit & Evidence Pipeline"],
    ["8", "Supporting Services (Replay, Diagnostics, Export)"],
    ["9", "Test Suite — 16 Files, 391 Tests"],
    ["10", "Repo Audit — 15 Checks Explained"],
    ["11", "CLI Scripts & Commands"],
    ["12", "Integration Starter Kits (×4)"],
    ["13", "Adoption Layer — 5 Priorities"],
    ["14", "Demo App Routes"],
    ["15", "Full Repository File Tree"]
  ];

  toc.forEach(([n, title], i) => {
    const yt = ty + 22 + i * 18;
    doc.rect(MARGIN, yt, 22, 14).fill(i % 2 === 0 ? LIGHT_BLUE : "#e0e7ef");
    doc.fillColor(BLUE).font("Helvetica-Bold").fontSize(8)
      .text(n, MARGIN, yt + 3, { align: "center", width: 22 });
    doc.fillColor(BLACK).font("Helvetica").fontSize(8.5)
      .text(title, MARGIN + 28, yt + 3);
  });

  pageFooter(doc, 1);
}

// ─── Section 1: System Purpose ───────────────────────────────────────────────

function drawSection1(doc: PDFKit.PDFDocument, pg: { n: number }): void {
  addPage(doc);
  pg.n++;
  headerBar(doc, "Section 1 — System Purpose & Architecture Overview");

  sectionTitle(doc, "What CerbaSeal-Core Is");
  body(doc,
    "CerbaSeal-Core is a deterministic execution governance infrastructure library for AI-integrated " +
    "financial and enterprise workflows. It acts as a mandatory gate that sits between any AI proposal " +
    "and any consequential action. No action — payment, hold, escalation, account modification — may be " +
    "released without passing through the gate. The gate is not advisory: it issues ALLOW, HOLD, or REJECT " +
    "with a cryptographically chained audit trail that cannot be altered after the fact."
  );

  doc.moveDown(0.4);
  sectionTitle(doc, "Core Design Principles", 2);
  const principles = [
    ["Fail-closed by default", "Any unexpected error, malformed request, or missing field produces REJECT. There is no silent allow path."],
    ["AI is proposal-only", "An AI actor can submit a proposal but cannot bear authority. Attempting self-authorization produces an unconditional REJECT."],
    ["Human approval as a release precondition", "For workflows requiring human approval, no ALLOW is issued until a valid, signed, correctly-bound ApprovalArtifact is present."],
    ["Immutable decision envelopes", "Every GateResult is stamped with an immutable: true flag and registered in a module-private WeakSet. EvidenceBundleService rejects any result not in that set."],
    ["Cryptographic hash chain", "Every audit log entry includes a SHA-256 hash of its own payload and the hash of the previous entry, forming a tamper-evident chain verifiable at any time."],
    ["Deterministic replay", "Any past decision can be fed back through the gate (ReplayService) to verify that the same inputs produce the same output — proving no logic drift."],
    ["Zero external dependencies (core)", "The enforcement core has no runtime npm dependencies beyond Node.js built-ins. pdfkit and tsx are devDependencies only."]
  ];
  principles.forEach(([k, v]) => {
    doc.moveDown(0.15);
    doc.fillColor(BLUE).font("Helvetica-Bold").fontSize(9).text(`${k}:`, { continued: true });
    doc.fillColor(BLACK).font("Helvetica").fontSize(9).text("  " + v, { lineGap: 2 });
  });

  doc.moveDown(0.5);
  sectionTitle(doc, "Architecture Layers", 2);
  const layers = [
    ["Domain Layer", "src/domain/", "Types, constants, errors, formatters, builders. No business logic — pure structural definitions."],
    ["Enforcement Layer", "src/services/execution/", "ExecutionGateService — the single mandatory gate. assertIsGateIssued() — WeakSet bypass prevention."],
    ["Audit Layer", "src/services/audit/", "AppendOnlyLogService (in-memory). FileBackedAppendOnlyLogService (JSONL persistence). audit-hash-utils.ts — SHA-256 chain."],
    ["Evidence Layer", "src/services/evidence/", "EvidenceBundleService — assembles full decision context from gate result + audit entries."],
    ["Export Layer", "src/services/export/", "ExportManifestService — point-in-time snapshot of evidence hashes for external transfer."],
    ["Replay Layer", "src/services/replay/", "ReplayService — re-runs past decisions through the gate to verify determinism."],
    ["Diagnostics Layer", "src/services/diagnostics/", "DiagnosticReportService — operator-facing state analysis with recommended actions."],
    ["Support Layer", "src/services/support/", "OperatorActionService, SystemHealthService, SystemIntegrityService."],
    ["Config Layer", "src/config/", "cerbaseal-config.ts — loadCerbaSealConfig(), buildAllowedAuthorityClasses(). Reads cerbaseal.config.json."],
    ["Examples Layer", "examples/", "Working demos: browser-demo (HTTP server), consumer, agent-gate, auditor-view, support-readiness, 4 starter kits."],
    ["Scripts Layer", "scripts/", "repo-audit, export-proof, verify-proof, check-imports, check-invariants, generate-pilot-config, generate-evidence-report."]
  ];

  table(doc,
    ["Layer", "Location", "Responsibility"],
    layers,
    [90, 130, CONTENT_W - 220]
  );

  sectionTitle(doc, "Technology Stack", 2);
  table(doc,
    ["Component", "Choice", "Notes"],
    [
      ["Runtime", "Node.js 18+", "ESM module system (\"type\": \"module\" in package.json)"],
      ["Language", "TypeScript 5.6", "Strict mode, ES2022 target, NodeNext module resolution"],
      ["Test runner", "Vitest 2.1", "391 tests, 16 files, avg 7.7s full run"],
      ["Script runner", "tsx 4.21", "Direct TypeScript execution without compile step"],
      ["PDF generation", "pdfkit 0.18", "devDependency — used only for report generation"],
      ["Package manager", "pnpm", "Workspace monorepo with cerbaseal-demo artifact"],
      ["Demo UI", "Vite + React", "Browser-based review portal at /review, /pilot, /security"]
    ],
    [90, 100, CONTENT_W - 190]
  );

  pageFooter(doc, pg.n);
}

// ─── Section 2: Type System ──────────────────────────────────────────────────

function drawSection2(doc: PDFKit.PDFDocument, pg: { n: number }): void {
  addPage(doc);
  pg.n++;
  headerBar(doc, "Section 2 — Domain Type System — All Interfaces & Enums");

  sectionTitle(doc, "Primitive Union Types (src/domain/types/core.ts)");

  table(doc,
    ["Type", "Values", "Notes"],
    [
      ["AuthorityClass", "system | ai | analyst | reviewer | manager | compliance_officer", "Who is making the request. Extensible via config."],
      ["HumanAuthorityClass", "analyst | reviewer | manager | compliance_officer", "Subset used for approval artifacts — excludes system/ai."],
      ["WorkflowClass", "fraud_triage | transaction_escalation | account_hold_recommendation", "Which workflow envelope governs this request."],
      ["ActionClass", "allow | hold | reject | escalate | account_hold", "Concrete action the gate may permit."],
      ["UnknownableActionClass", "ActionClass | (string & {})", "Input type — gate validates and narrows to ActionClass or REJECTs."],
      ["ProposalSourceKind", "ai | deterministic_rule", "Origin of the proposal. Does not grant authority."],
      ["DecisionState", "ALLOW | HOLD | REJECT", "Final gate output. Produced once, immutable."]
    ],
    [100, 220, CONTENT_W - 320]
  );

  sectionTitle(doc, "Core Interfaces", 2);

  const interfaces = [
    {
      name: "GovernedRequest",
      file: "core.ts",
      desc: "Primary input to ExecutionGateService.evaluate(). Every field is validated before a decision is produced.",
      fields: [
        "requestId: string — non-empty unique identifier for this request",
        "workflowClass: WorkflowClass — determines which invariants apply",
        "jurisdiction: string — non-empty jurisdictional tag",
        "actorId: string — opaque actor identifier",
        "actorAuthorityClass: AuthorityClass — validated at runtime against allowed set",
        "proposedActionClass: UnknownableActionClass — must match proposal.requestedActionClass",
        "proposal: DecisionProposal — the AI/rule proposal being evaluated",
        "sensitive: boolean — if true, stale controls trigger REJECT",
        "prohibitedUse: boolean — if true, unconditional REJECT",
        "policyPackRef: PolicyPackRef | null — must be non-null to proceed",
        "provenanceRef: ProvenanceRef | null — must be non-null with all fields",
        "approvalRequired: boolean — caller-supplied flag (some workflows override)",
        "approvalArtifact: ApprovalArtifact | null — must be present if approval required",
        "loggingReady: boolean — must be true to proceed",
        "controlStatus: ControlStatus — stale check for sensitive flows",
        "trustState: TrustState — must be trusted to proceed",
        "createdAt: string — ISO timestamp validated against approval timestamp"
      ]
    },
    {
      name: "DecisionEnvelope",
      file: "core.ts",
      desc: "Immutable output produced by the gate. Registered in WeakSet. EvidenceBundleService rejects non-registered envelopes.",
      fields: [
        "envelopeId: string — deterministic: 'env_' + requestId",
        "requestId: string — back-reference to the request",
        "workflowClass: WorkflowClass — echoed from request",
        "finalState: DecisionState — ALLOW | HOLD | REJECT",
        "permittedActionClass: ActionClass | null — set on ALLOW; null on HOLD/REJECT",
        "humanApprovalRequired: boolean — echoed from request",
        "humanApprovalPresent: boolean — true if approvalArtifact was present",
        "proposalSourceKind: ProposalSourceKind — echoed from proposal",
        "immutable: true — literal type, always true",
        "evidenceBundleId: string — deterministic: 'evidence_' + requestId",
        "trace: DecisionTrace — checkedInvariants[], reasonCodes[], evaluatedAt",
        "issuedAt: string — ISO timestamp of gate evaluation"
      ]
    },
    {
      name: "ApprovalArtifact",
      file: "core.ts",
      desc: "Human approval record. Must be bound to a specific requestId. Timestamp must postdate request.createdAt.",
      fields: [
        "approvalId: string — unique approval identifier",
        "approverId: string — human reviewer identity",
        "forRequestId: string — must equal GovernedRequest.requestId",
        "approverAuthorityClass: HumanAuthorityClass — must be analyst|reviewer|manager|compliance_officer",
        "privilegedAuthSatisfied: boolean — must be true",
        "immutableSignature: string — non-empty signature string",
        "approvedAt: string — ISO timestamp; must be >= request.createdAt"
      ]
    },
    {
      name: "EvidenceBundle",
      file: "audit.ts",
      desc: "Full decision snapshot assembled by EvidenceBundleService. Contains the original request, envelope, release/blocked records, and full hash-linked event chain.",
      fields: [
        "evidenceBundleId: string — matches decisionEnvelope.evidenceBundleId",
        "request: GovernedRequest — deep-cloned original request",
        "decisionEnvelope: DecisionEnvelope — deep-cloned envelope",
        "releaseAuthorization: ReleaseAuthorization | null — present on ALLOW",
        "blockedActionRecord: BlockedActionRecord | null — present on HOLD/REJECT",
        "eventChain: AuditLogEntry[] — all log entries for this requestId",
        "createdAt: string — ISO timestamp of bundle creation"
      ]
    },
    {
      name: "AuditLogEntry",
      file: "audit.ts",
      desc: "Single entry in the tamper-evident hash chain. Every entry hashes its own payload and links to the previous entry hash.",
      fields: [
        "eventId: string — unique entry identifier",
        "requestId: string — request this event belongs to",
        "eventType: AuditEventType — REQUEST_EVALUATED | RELEASE_AUTHORIZED | ACTION_BLOCKED | EVIDENCE_BUNDLE_CREATED | EXPORT_MANIFEST_CREATED",
        "timestamp: string — ISO timestamp",
        "payloadHash: string — SHA-256 of the event payload JSON",
        "previousHash: string | null — null for genesis entry; hash of previous entry otherwise",
        "entryHash: string — SHA-256 of (payloadHash + previousHash + timestamp)"
      ]
    }
  ];

  interfaces.forEach((iface) => {
    doc.moveDown(0.4);
    sectionTitle(doc, `${iface.name}   ·   ${iface.file}`, 2);
    body(doc, iface.desc, MID_GRAY, 8.5);
    doc.moveDown(0.2);
    iface.fields.forEach((f) => bullet(doc, f, 8));
  });

  pageFooter(doc, pg.n);
}

// ─── Section 3: Invariants ───────────────────────────────────────────────────

function drawSection3(doc: PDFKit.PDFDocument, pg: { n: number }): void {
  addPage(doc);
  pg.n++;
  headerBar(doc, "Section 3 — Invariant Registry (INV-01 → INV-12) — Full Detail");

  body(doc,
    "Invariants are the non-negotiable rules of the system. Every check is applied on every evaluate() call. " +
    "A failed invariant throws a CerbaSealError (or produces a controlled REJECT result) — there is no path " +
    "to ALLOW that skips any invariant. All 12 invariants have explicit test coverage confirmed by " +
    "scripts/check-invariant-coverage.ts (run as part of pnpm audit:repo).",
    MID_GRAY
  );
  doc.moveDown(0.4);

  const invs = [
    {
      id: "INV-01",
      name: "NO_POLICY_PACK_NO_EXECUTION",
      trigger: "policyPackRef === null",
      outcome: "REJECT",
      reasonCode: "NO_POLICY_PACK",
      desc: "Every governed request must carry a reference to the policy pack under which it was evaluated. A request with no policy pack cannot proceed — there is no basis for determining what rules govern the action.",
      testRef: "execution-gate-service.test.ts — 'rejects when no policy pack'"
    },
    {
      id: "INV-02",
      name: "NO_PROVENANCE_NO_ACTION",
      trigger: "provenanceRef === null or any field empty",
      outcome: "REJECT",
      reasonCode: "NO_PROVENANCE",
      desc: "Every request must carry full provenance: model version, rule set version, and source hash. Empty provenance is treated as missing. Without provenance, the decision cannot be audited or replayed deterministically.",
      testRef: "execution-gate-service.test.ts — 'rejects when no provenance'"
    },
    {
      id: "INV-03",
      name: "NO_REQUIRED_APPROVAL_NO_RELEASE",
      trigger: "effectiveApprovalRequired && approvalArtifact === null",
      outcome: "HOLD (missing), REJECT (invalid/forged)",
      reasonCode: "REQUIRED_APPROVAL_MISSING / INVALID_APPROVAL_AUTHORITY",
      desc: "When approval is required (caller-set OR workflow-class-forced), no ALLOW is issued until a valid ApprovalArtifact is present. The artifact must: (a) be bound to this specific requestId, (b) have a timestamp ≥ request.createdAt, (c) carry a valid HumanAuthorityClass, (d) have privilegedAuthSatisfied: true, (e) have a non-empty immutableSignature.",
      testRef: "execution-gate-service.test.ts — approval binding, timestamp, forgery tests"
    },
    {
      id: "INV-04",
      name: "NO_LOGGING_NO_EXECUTION",
      trigger: "loggingReady === false",
      outcome: "REJECT",
      reasonCode: "LOGGING_NOT_READY",
      desc: "Before any action is released, the logging subsystem must be confirmed ready. This prevents situations where actions are taken but not recorded — a governance failure equivalent to acting without a paper trail.",
      testRef: "execution-gate-service.test.ts — 'rejects when logging not ready'"
    },
    {
      id: "INV-05",
      name: "AI_NON_AUTHORITATIVE",
      trigger: "proposal.authorityBearing === true  OR  (actorAuthorityClass === 'ai' AND proposalSourceKind === 'ai')",
      outcome: "REJECT",
      reasonCode: "AI_CANNOT_AUTHORIZE",
      desc: "AI actors are proposal-only. Two separate checks: (1) if the proposal itself claims authority-bearing status, REJECT; (2) if the actor is 'ai' AND the proposal source is 'ai', REJECT — regardless of the approvalRequired flag. Fix 4 closed a prior bypass where setting approvalRequired: false allowed an AI actor through.",
      testRef: "security/misuse-scenarios.test.ts, adversarial-integrity.test.ts"
    },
    {
      id: "INV-06",
      name: "NO_BYPASS_OF_EXECUTION_GATE",
      trigger: "EvidenceBundleService receives a GateResult not in _gateIssuedResults WeakSet",
      outcome: "REJECT (CerbaSealError thrown)",
      reasonCode: "MALFORMED_REQUEST",
      desc: "A module-private WeakSet (_gateIssuedResults) registers every GateResult produced by ExecutionGateService.evaluate(). EvidenceBundleService calls assertIsGateIssued() before accepting any result. A self-constructed GateResult cannot pass this check — the WeakSet is inaccessible outside the module.",
      testRef: "security/non-forgery.test.ts — 'rejects self-constructed gate result'"
    },
    {
      id: "INV-07",
      name: "IMMUTABLE_DECISION_ENVELOPE",
      trigger: "Always — structural guarantee",
      outcome: "Structural enforcement",
      reasonCode: "N/A — compile-time + runtime deep-clone",
      desc: "DecisionEnvelope carries immutable: true as a literal TypeScript type. EvidenceBundleService deep-clones all objects before returning them. The envelope is never mutated after construction. This invariant is checked in the trace even on ALLOW paths.",
      testRef: "execution-gate-service.test.ts — immutable flag assertions"
    },
    {
      id: "INV-08",
      name: "STALE_CONTROLS_BLOCK_SENSITIVE_RELEASE",
      trigger: "request.sensitive === true AND (controlStatus.stale OR !controlStatus.criticalControlsValid)",
      outcome: "REJECT",
      reasonCode: "CONTROL_STALE_OR_INVALID",
      desc: "For sensitive requests, the control status must be both current (not stale) and valid. This ensures that time-sensitive compliance controls (e.g. sanction list checks, credit limit verifications) cannot be bypassed by using an old control state.",
      testRef: "execution-gate-service.test.ts — stale controls tests"
    },
    {
      id: "INV-09",
      name: "TRUST_STATE_REQUIRED",
      trigger: "trustState.trusted === false",
      outcome: "REJECT",
      reasonCode: "TRUST_STATE_INVALID",
      desc: "Every request must carry a valid trust state. If the system's trust evaluation has determined the request context is not trusted (e.g. flagged actor, revoked credentials), the gate rejects unconditionally — before approval state is even checked.",
      testRef: "execution-gate-service.test.ts — 'rejects invalid trust state'"
    },
    {
      id: "INV-10",
      name: "PROHIBITED_USE_MUST_BLOCK",
      trigger: "request.prohibitedUse === true",
      outcome: "REJECT",
      reasonCode: "PROHIBITED_USE",
      desc: "If the request has been flagged as prohibited use (e.g. sanctioned jurisdiction, restricted action type, policy exclusion), the gate rejects unconditionally. This check runs after trust state but before approval state to ensure compliance blocks are absolute.",
      testRef: "execution-gate-service.test.ts — 'rejects prohibited use'"
    },
    {
      id: "INV-11",
      name: "REQUEST_SCHEMA_AND_ACTION_CLASS_VALID",
      trigger: "requestId empty | jurisdiction empty | createdAt empty | reasonCodes empty | unknown action class | unknown authority class",
      outcome: "REJECT",
      reasonCode: "MALFORMED_REQUEST / UNKNOWN_ACTION_CLASS",
      desc: "Shape validation runs first, before any semantic checks. Catches: empty required string fields, unknown action classes (not in ALLOWED_ACTION_CLASSES set), unknown authority classes (not in allowedAuthorityClasses set), mismatched proposedActionClass vs proposal.requestedActionClass. TypeScript enforces types at compile time; this closes the runtime gap for untyped callers.",
      testRef: "execution-gate-service.test.ts — schema validation suite"
    },
    {
      id: "INV-12",
      name: "PROPOSAL_AND_REQUEST_ACTION_MUST_MATCH",
      trigger: "proposedActionClass !== proposal.requestedActionClass",
      outcome: "REJECT",
      reasonCode: "INVALID_PROPOSAL",
      desc: "The action class at the request level and the action class inside the proposal must be identical. This prevents a request from claiming one action type externally while the proposal contains a different action type — a potential vector for action-class confusion attacks.",
      testRef: "execution-gate-service.test.ts — 'rejects mismatched action classes'"
    }
  ];

  invs.forEach((inv, i) => {
    if (i > 0 && i % 4 === 0) {
      pageFooter(doc, pg.n);
      addPage(doc);
      pg.n++;
      headerBar(doc, "Section 3 — Invariant Registry (continued)");
    }
    doc.moveDown(0.4);
    // Header row
    const iy = doc.y;
    doc.rect(MARGIN, iy, CONTENT_W, 18).fill(inv.outcome === "REJECT" ? "#fef2f2" : inv.outcome.includes("HOLD") ? "#fffbeb" : LIGHT_GRAY);
    doc.rect(MARGIN, iy, 48, 18).fill(BLUE);
    doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(9)
      .text(inv.id, MARGIN + 2, iy + 4, { width: 44, align: "center" });
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(9)
      .text(inv.name, MARGIN + 54, iy + 4, { continued: true });
    const outcomeColor = inv.outcome === "REJECT" ? RED : inv.outcome.includes("HOLD") ? AMBER : GREEN;
    doc.fillColor(outcomeColor).font("Helvetica-Bold").fontSize(9)
      .text("  →  " + inv.outcome, { lineBreak: false });
    doc.y = iy + 22;

    doc.fillColor(BLACK).font("Helvetica").fontSize(8.5).text(inv.desc, MARGIN + 4, doc.y, { width: CONTENT_W - 8, lineGap: 1.5 });
    doc.moveDown(0.2);
    kv(doc, "Trigger", inv.trigger, 4);
    kv(doc, "Reason Code", inv.reasonCode, 4);
    kv(doc, "Test reference", inv.testRef, 4);
  });

  pageFooter(doc, pg.n);
}

// ─── Section 4: Reason Codes ─────────────────────────────────────────────────

function drawSection4(doc: PDFKit.PDFDocument, pg: { n: number }): void {
  addPage(doc);
  pg.n++;
  headerBar(doc, "Section 4 — Reason Code Registry — All 18 Codes");

  body(doc,
    "Reason codes are emitted into DecisionEnvelope.trace.reasonCodes. Every ALLOW, HOLD, and REJECT " +
    "decision carries at least one reason code. HOLD and REJECT decisions always include a terminal code " +
    "(DECISION_HELD or DECISION_REJECTED) in addition to the trigger code.",
    MID_GRAY
  );
  doc.moveDown(0.3);

  table(doc,
    ["Code", "Final State", "Invariant", "Meaning"],
    [
      ["DECISION_ALLOWED", "ALLOW", "—", "All checks passed. Action is released."],
      ["DECISION_HELD", "HOLD", "—", "Terminal suffix on all HOLD outcomes."],
      ["DECISION_REJECTED", "REJECT", "—", "Terminal suffix on all REJECT outcomes."],
      ["NO_POLICY_PACK", "REJECT", "INV-01", "policyPackRef is null."],
      ["NO_PROVENANCE", "REJECT", "INV-02", "provenanceRef is null or any field is empty."],
      ["REQUIRED_APPROVAL_MISSING", "HOLD", "INV-03", "Approval required but approvalArtifact is null."],
      ["INVALID_APPROVAL_AUTHORITY", "REJECT", "INV-03", "Artifact bound to wrong request, or invalid authority class, or timestamp predates request."],
      ["PRIVILEGED_AUTH_NOT_SATISFIED", "REJECT", "INV-03", "privilegedAuthSatisfied is false."],
      ["APPROVAL_SIGNATURE_MISSING", "REJECT", "INV-03", "immutableSignature is empty."],
      ["LOGGING_NOT_READY", "REJECT", "INV-04", "loggingReady is false."],
      ["AI_CANNOT_AUTHORIZE", "REJECT", "INV-05", "AI actor or authority-bearing proposal attempted authorization."],
      ["PROHIBITED_USE", "REJECT", "INV-10", "prohibitedUse flag is true."],
      ["CONTROL_STALE_OR_INVALID", "REJECT", "INV-08", "Sensitive request with stale or invalid control status."],
      ["TRUST_STATE_INVALID", "REJECT", "INV-09", "trustState.trusted is false."],
      ["UNKNOWN_ACTION_CLASS", "REJECT", "INV-11", "proposedActionClass or proposal.requestedActionClass is not a known ActionClass."],
      ["MALFORMED_REQUEST", "REJECT", "INV-11/06", "Empty required field, or self-constructed GateResult, or non-ISO timestamp."],
      ["INVALID_PROPOSAL", "REJECT", "INV-12", "proposedActionClass ≠ proposal.requestedActionClass."],
      ["AI_CANNOT_AUTHORIZE (auth-bearing)", "REJECT", "INV-05", "proposal.authorityBearing is true (regardless of actor class)."]
    ],
    [130, 60, 60, CONTENT_W - 250]
  );

  pageFooter(doc, pg.n);
}

// ─── Section 5: Gate Service Logic Flow ──────────────────────────────────────

function drawSection5(doc: PDFKit.PDFDocument, pg: { n: number }): void {
  addPage(doc);
  pg.n++;
  headerBar(doc, "Section 5 — Execution Gate Service — Full Logic Flow");

  sectionTitle(doc, "evaluate(request: GovernedRequest): GateResult");
  body(doc,
    "This is the single mandatory entry point for all governed actions. The method runs a strict sequence " +
    "of invariant assertions. The first failure short-circuits evaluation and produces a controlled " +
    "HOLD or REJECT result. On success, ALLOW is issued and registered in the module-private WeakSet."
  );
  doc.moveDown(0.4);

  sectionTitle(doc, "Evaluation Sequence (in order)", 2);
  const steps = [
    ["1", "assertRequestShape()", "INV-11", "REJECT", "Validates requestId, jurisdiction, createdAt non-empty; proposal.reasonCodes non-empty"],
    ["2", "assertActorAuthorityClass()", "INV-11", "REJECT", "Validates actorAuthorityClass against allowedAuthorityClasses set (runtime check)"],
    ["3", "assertKnownActionClass(proposedActionClass)", "INV-11", "REJECT", "Must be one of: allow, hold, reject, escalate, account_hold"],
    ["4", "assertKnownActionClass(proposal.requestedActionClass)", "INV-11", "REJECT", "Same check on the proposal-side action class"],
    ["5", "proposal action === request action", "INV-12", "REJECT", "proposedActionClass must identically match proposal.requestedActionClass"],
    ["6", "assertPolicyPack()", "INV-01", "REJECT", "policyPackRef must be non-null"],
    ["7", "assertProvenance()", "INV-02", "REJECT", "provenanceRef non-null; modelVersion, ruleSetVersion, sourceHash all non-empty"],
    ["8", "assertLoggingReady()", "INV-04", "REJECT", "loggingReady must be true"],
    ["9", "assertProposalBoundary()", "INV-05", "REJECT", "Not authority-bearing; AI actor+AI proposal always rejects"],
    ["10", "assertProhibitedUse()", "INV-10", "REJECT", "prohibitedUse must be false"],
    ["11", "assertControlStatus()", "INV-08", "REJECT", "Sensitive request: controls must be current and valid"],
    ["12", "assertTrustState()", "INV-09", "REJECT", "trustState.trusted must be true"],
    ["13", "assertApprovalState()", "INV-03", "HOLD/REJECT", "Effective approval required? Artifact present, bound, timestamped, signed, valid authority?"],
    ["14", "buildDecisionEnvelope(ALLOW)", "INV-07", "ALLOW", "Construct immutable envelope; push to WeakSet; build ReleaseAuthorization; return GateResult"]
  ];

  table(doc,
    ["Step", "Function", "Invariant", "On fail", "What is checked"],
    steps,
    [28, 130, 50, 54, CONTENT_W - 262]
  );

  sectionTitle(doc, "Error Handling — Fail-Closed Guarantee", 2);
  body(doc,
    "The try/catch at the top of evaluate() guarantees two things:"
  );
  bullet(doc, "CerbaSealError (expected failures): produces a clean DecisionEnvelope with the error's finalState (HOLD or REJECT), the trigger reason code, and the terminal code.");
  bullet(doc, "Non-CerbaSealError (unexpected exceptions): converted to a REJECT DecisionEnvelope with MALFORMED_REQUEST + DECISION_REJECTED. If even this fallback fails (request too broken to read), the original error is re-thrown — still fail-closed at the caller boundary.");
  doc.moveDown(0.3);

  sectionTitle(doc, "Deterministic ID Functions", 2);
  codeBlock(doc, [
    "envelopeId          = 'env_'      + requestId",
    "evidenceBundleId    = 'evidence_' + requestId",
    "releaseAuthId       = 'release_'  + requestId",
  ], "All IDs are deterministic — replay produces identical identifiers for the same requestId");

  sectionTitle(doc, "WORKFLOWS_REQUIRING_APPROVAL (unconditional override)", 2);
  body(doc,
    "Certain workflow classes require human approval regardless of the caller-supplied approvalRequired flag. " +
    "The caller cannot opt out. Adding a workflow class to this set makes approval non-bypassable for that workflow."
  );
  codeBlock(doc, [
    "const WORKFLOWS_REQUIRING_APPROVAL = new Set<WorkflowClass>([",
    "  'fraud_triage'  // approval always required; caller flag is advisory only",
    "]);"
  ]);

  sectionTitle(doc, "assertIsGateIssued() — Bypass Prevention", 2);
  body(doc,
    "A module-private WeakSet (_gateIssuedResults) is populated only inside evaluate(). " +
    "EvidenceBundleService calls assertIsGateIssued(gateResult) before accepting any result. " +
    "A caller who constructs their own GateResult cannot add it to the WeakSet — the reference is not exported."
  );
  codeBlock(doc, [
    "const _gateIssuedResults = new WeakSet<object>();  // module-private, never exported",
    "",
    "export function assertIsGateIssued(result: GateResult): void {",
    "  if (!_gateIssuedResults.has(result)) {",
    "    throw new CerbaSealError({ ... finalState: 'REJECT' });",
    "  }",
    "}"
  ]);

  pageFooter(doc, pg.n);
}

// ─── Section 6: Authority Class System ───────────────────────────────────────

function drawSection6(doc: PDFKit.PDFDocument, pg: { n: number }): void {
  addPage(doc);
  pg.n++;
  headerBar(doc, "Section 6 — Authority Class System & Runtime Configuration");

  sectionTitle(doc, "Core Authority Classes");
  table(doc,
    ["Class", "Kind", "Can propose?", "Can authorize?", "Notes"],
    [
      ["system", "System actor", "Yes", "Yes (non-AI path)", "Internal system processes, deterministic rules"],
      ["ai", "AI actor", "Yes (proposal only)", "NEVER", "INV-05: AI actor + AI proposal = unconditional REJECT"],
      ["analyst", "Human approver", "Yes", "Yes (as approver)", "HumanAuthorityClass — valid approval authority"],
      ["reviewer", "Human approver", "Yes", "Yes (as approver)", "HumanAuthorityClass — valid approval authority"],
      ["manager", "Human approver", "Yes", "Yes (as approver)", "HumanAuthorityClass — valid approval authority"],
      ["compliance_officer", "Human approver", "Yes", "Yes (as approver)", "HumanAuthorityClass — highest human authority class"]
    ],
    [100, 80, 70, 70, CONTENT_W - 320]
  );

  sectionTitle(doc, "Runtime Extensibility — cerbaseal.config.json", 2);
  body(doc,
    "New client-specific authority classes (e.g. 'risk_officer', 'supervisor', 'credit_committee') can be added " +
    "to cerbaseal.config.json without modifying any TypeScript source code. The config is loaded at " +
    "ExecutionGateService construction time via loadCerbaSealConfig()."
  );
  doc.moveDown(0.3);
  codeBlock(doc, [
    '{',
    '  "_comment": "Add client roles to extended[] — no TypeScript changes required.",',
    '  "authorityClasses": {',
    '    "core": ["system", "ai", "analyst", "reviewer", "manager", "compliance_officer"],',
    '    "extended": []',
    '  },',
    '  "workflowClasses": {',
    '    "core": ["fraud_triage", "transaction_escalation", "account_hold_recommendation"],',
    '    "extended": []',
    '  },',
    '  "actionClasses": {',
    '    "core": ["allow", "hold", "reject", "escalate", "account_hold"],',
    '    "extended": []',
    '  }',
    '}'
  ], "cerbaseal.config.json — current state");

  sectionTitle(doc, "src/config/cerbaseal-config.ts — API Surface", 2);
  codeBlock(doc, [
    "interface GateConfig {",
    "  additionalAuthorityClasses?: string[];",
    "}",
    "",
    "function loadCerbaSealConfig(): GateConfig",
    "  // Reads cerbaseal.config.json from process.cwd()",
    "  // Returns { additionalAuthorityClasses: config.authorityClasses.extended }",
    "  // Falls back to {} if file not found (core classes only)",
    "",
    "function buildAllowedAuthorityClasses(config?: GateConfig): ReadonlySet<string>",
    "  // Returns Set of: CORE_AUTHORITY_CLASSES + (config?.additionalAuthorityClasses ?? [])"
  ]);

  sectionTitle(doc, "Usage Patterns", 2);
  codeBlock(doc, [
    "// Pattern 1: Default (core classes only — all existing tests unchanged)",
    "const gate = new ExecutionGateService();",
    "",
    "// Pattern 2: Inline extension",
    "const gate = new ExecutionGateService({",
    "  additionalAuthorityClasses: ['risk_officer', 'supervisor']",
    "});",
    "",
    "// Pattern 3: From cerbaseal.config.json",
    "import { loadCerbaSealConfig } from './src/config/cerbaseal-config.js';",
    "const gate = new ExecutionGateService(loadCerbaSealConfig());"
  ]);

  pageFooter(doc, pg.n);
}

// ─── Section 7: Audit & Evidence Pipeline ────────────────────────────────────

function drawSection7(doc: PDFKit.PDFDocument, pg: { n: number }): void {
  addPage(doc);
  pg.n++;
  headerBar(doc, "Section 7 — Audit & Evidence Pipeline");

  sectionTitle(doc, "AppendOnlyLogService (in-memory)");
  body(doc,
    "Implements IAuditLogService. All entries are stored in a private array. The public API provides " +
    "append, list, listByRequestId, and verifyChain. No entry can be deleted or modified via this API."
  );
  codeBlock(doc, [
    "interface IAuditLogService {",
    "  append(event: AuditEventPayload): AuditLogEntry;",
    "  list(): AuditLogEntry[];",
    "  listByRequestId(requestId: string): AuditLogEntry[];",
    "  verifyChain(): boolean;",
    "}"
  ]);

  sectionTitle(doc, "FileBackedAppendOnlyLogService (persistent)", 2);
  body(doc,
    "Same interface. Writes every entry as a newline-delimited JSON (JSONL) record to a file path " +
    "specified at construction. Entries are written synchronously on every append call (appendFileSync). " +
    "On construction, reads existing entries from the file to restore state across restarts. " +
    "Used by fraud-workflow-starter and any production deployment requiring durable audit logs."
  );
  codeBlock(doc, [
    "const log = new FileBackedAppendOnlyLogService('./audit/fraud-triage.jsonl');",
    "// File is created automatically if it does not exist.",
    "// Existing entries are loaded and chain is verified on init."
  ]);

  sectionTitle(doc, "Hash Chain Construction (audit-hash-utils.ts)", 2);
  body(doc,
    "Each entry carries three hashes, all using SHA-256 (Node.js crypto module):"
  );
  codeBlock(doc, [
    "payloadHash  = SHA256(JSON.stringify(eventPayload))",
    "previousHash = entryHash of the previous entry  (null for genesis)",
    "entryHash    = SHA256(payloadHash + '|' + (previousHash ?? 'genesis') + '|' + timestamp)",
    "",
    "verifyChain() re-computes every entryHash and checks the previousHash chain.",
    "Returns false if any entry has been tampered with or the chain is broken."
  ]);

  sectionTitle(doc, "Events Written Per Request (EvidenceBundleService)", 2);
  table(doc,
    ["Event Type", "When written", "Key payload fields"],
    [
      ["REQUEST_EVALUATED", "Always — on every evaluate() call", "requestId, finalState, envelopeId"],
      ["RELEASE_AUTHORIZED", "On ALLOW only", "requestId, releaseAuthorizationId, actionClass"],
      ["ACTION_BLOCKED", "On HOLD or REJECT", "requestId, finalState, reasonCodes[]"],
      ["EVIDENCE_BUNDLE_CREATED", "Always — after above events", "requestId, evidenceBundleId"]
    ],
    [130, 150, CONTENT_W - 280]
  );

  sectionTitle(doc, "EvidenceBundleService.createBundle() — Full Flow", 2);
  body(doc, "Steps executed in order:");
  const steps = [
    "1. Call assertIsGateIssued(gateResult) — rejects self-constructed results (INV-06)",
    "2. Append REQUEST_EVALUATED event to audit log",
    "3. If releaseAuthorization present: append RELEASE_AUTHORIZED event",
    "4. If blockedActionRecord present: append ACTION_BLOCKED event",
    "5. Append EVIDENCE_BUNDLE_CREATED event",
    "6. Call logService.listByRequestId(requestId) to get the full event chain for this request",
    "7. Assemble EvidenceBundle with deep-clones of all objects (no shared references)",
    "8. Return deep-cloned bundle (double-cloned — no reference to internal state)"
  ];
  steps.forEach((s) => bullet(doc, s));

  sectionTitle(doc, "ExportManifestService", 2);
  body(doc,
    "Creates a point-in-time snapshot of evidence hashes for external transfer (e.g. to a regulator, " +
    "auditor, or archival system). The manifest captures source event hashes but does not include " +
    "the request payload — suitable for sharing with parties who need proof of decision without " +
    "the underlying data."
  );
  codeBlock(doc, [
    "interface ExportManifest {",
    "  manifestId: string;",
    "  evidenceBundleId: string;",
    "  requestId: string;",
    "  envelopeId: string;",
    "  exportedAt: string;",
    "  exportType: 'authority_package';",
    "  sourceEventHashes: string[];       // one per AuditLogEntry",
    "  sourceEvidenceImmutable: true;     // literal type",
    "}"
  ]);

  pageFooter(doc, pg.n);
}

// ─── Section 8: Supporting Services ──────────────────────────────────────────

function drawSection8(doc: PDFKit.PDFDocument, pg: { n: number }): void {
  addPage(doc);
  pg.n++;
  headerBar(doc, "Section 8 — Supporting Services");

  sectionTitle(doc, "ReplayService (src/services/replay/)");
  body(doc,
    "Takes a past EvidenceBundle and re-runs the original GovernedRequest through a fresh " +
    "ExecutionGateService instance. Compares the replayed finalState against the original finalState. " +
    "Used to verify: (a) the gate is deterministic, (b) logic has not drifted since the original decision, " +
    "(c) the evidence bundle faithfully represents what happened."
  );
  codeBlock(doc, [
    "interface ReplayResult {",
    "  originalRequestId: string;",
    "  originalEnvelopeId: string;",
    "  replayedFinalState: 'ALLOW' | 'HOLD' | 'REJECT';",
    "  replayedPermittedActionClass: string | null;",
    "  matchedOriginalOutcome: boolean;   // true iff states match",
    "  replayedAt: string;",
    "}"
  ]);

  sectionTitle(doc, "DiagnosticReportService (src/services/diagnostics/)", 2);
  body(doc,
    "Generates a structured operator-facing diagnostic report from an EvidenceBundle. Includes: " +
    "system state snapshot, invariant check summary, recommended actions (e.g. 'obtain human approval', " +
    "'check control status'), and a risk assessment. Used by the browser-demo support-readiness view."
  );
  codeBlock(doc, [
    "interface DiagnosticReport {",
    "  reportId: string;",
    "  evidenceBundleId: string;",
    "  systemState: { ... };",
    "  invariantSummary: InvariantCheckSummary[];",
    "  recommendations: string[];",
    "  riskAssessment: string;",
    "  generatedAt: string;",
    "}"
  ]);

  sectionTitle(doc, "OperatorActionService (src/services/support/)", 2);
  body(doc,
    "Provides operator-level actions: acknowledge a blocked decision, escalate a held request, " +
    "request re-evaluation, generate a support ticket. All actions are recorded to the audit log."
  );

  sectionTitle(doc, "SystemHealthService (src/services/support/)", 2);
  body(doc,
    "Checks system preconditions: logging ready, control status valid, trust state valid, " +
    "audit chain integrity. Returns a HealthReport with individual check results and an overall status."
  );

  sectionTitle(doc, "SystemIntegrityService (src/services/support/)", 2);
  body(doc,
    "Runs integrity checks across the audit log chain. Verifies that all entries are chain-linked, " +
    "no gaps exist, and hash values are consistent. Used as a background health check and on " +
    "export to confirm evidence is untampered before sharing."
  );

  sectionTitle(doc, "CertificateFormatter (src/domain/formatters/)", 2);
  body(doc,
    "Generates a human-readable governance certificate from an EvidenceBundle. Used by the " +
    "auditor-view example to render a printable compliance record showing the decision, " +
    "approver identity, invariants checked, and audit chain summary."
  );

  pageFooter(doc, pg.n);
}

// ─── Section 9: Test Suite ────────────────────────────────────────────────────

function drawSection9(doc: PDFKit.PDFDocument, pg: { n: number }): void {
  addPage(doc);
  pg.n++;
  headerBar(doc, "Section 9 — Test Suite — 16 Files, 391 Tests");

  body(doc,
    "All tests run with Vitest 2.1. Full suite completes in ~7.7 seconds. " +
    "Zero mocks of the enforcement core — all tests use real ExecutionGateService instances.",
    MID_GRAY
  );
  doc.moveDown(0.3);

  table(doc,
    ["Test File", "Tests", "Coverage focus"],
    [
      ["test/execution-gate-service.test.ts", "~120", "All 12 invariants; every ALLOW/HOLD/REJECT path; approval binding; timestamp validation; authority class validation"],
      ["test/adversarial-integrity.test.ts", "~18", "Advanced attack scenarios: approval replay, cross-request binding, AI authority escalation, malformed envelope injection"],
      ["test/audit-evidence-export.test.ts", "~30", "AppendOnlyLogService chain construction; EvidenceBundleService assembly; ExportManifestService output"],
      ["test/persistent-audit-log.test.ts", "~20", "FileBackedAppendOnlyLogService: write, read-back, chain verify, multi-request interleave"],
      ["test/diagnostic-report-service.test.ts", "~18", "DiagnosticReportService output structure; recommendation generation; risk assessment"],
      ["test/snapshots/enforcement-loop.snapshot.test.ts", "~8", "Snapshot tests: full ALLOW/HOLD/REJECT flows serialized and compared across runs"],
      ["test/security/fail-closed.test.ts", "2", "Unexpected non-CerbaSealError inputs produce REJECT — never ALLOW"],
      ["test/security/non-forgery.test.ts", "2", "Self-constructed GateResult rejected by assertIsGateIssued (INV-06)"],
      ["test/security/misuse-scenarios.test.ts", "~15", "AI self-authorization; authority-bearing proposals; approval authority class forgery"],
      ["test/security/contextual-boundary.test.ts", "~12", "Boundary cases: empty strings, null fields, zero-length arrays, whitespace-only values"],
      ["test/integration/full-flow.test.ts", "1", "End-to-end: request → evaluate → evidence bundle → replay → verify chain"],
      ["test/integration/system-integration.test.ts", "1", "Full stack: gate + audit + evidence + diagnostic + health check + export"],
      ["test/integration/browser-demo-routes.test.ts", "~40", "All 9 demo HTTP server routes respond 200 with correct content"],
      ["test/integration/review-portal-routes.test.ts", "~40", "Review portal routes: /review, /pilot, /security, /deployment, /one-page"],
      ["test/integration/support-readiness.test.ts", "~30", "Support readiness demo: all operator action scenarios"],
      ["test/integration/external-signal-examples.test.ts", "~34", "External signal injection: trust state, control status, prohibited use, provenance"]
    ],
    [175, 40, CONTENT_W - 215]
  );

  sectionTitle(doc, "Test Commands", 2);
  codeBlock(doc, [
    "pnpm test              # run all 391 tests once",
    "pnpm test:watch        # watch mode",
    "pnpm check:invariants  # verify 12/12 invariants have covering tests",
    "pnpm audit:repo        # run all 15 repo audit checks (includes test count)"
  ]);

  pageFooter(doc, pg.n);
}

// ─── Section 10: Repo Audit ───────────────────────────────────────────────────

function drawSection10(doc: PDFKit.PDFDocument, pg: { n: number }): void {
  addPage(doc);
  pg.n++;
  headerBar(doc, "Section 10 — Repo Audit — 15 Checks Explained");

  body(doc,
    "pnpm audit:repo runs scripts/repo-audit.ts — a suite of 15 automated checks that verify the " +
    "repo is in a releasable, self-consistent state. All 15 currently pass.",
    MID_GRAY
  );
  doc.moveDown(0.3);

  table(doc,
    ["#", "Check", "What it verifies"],
    [
      ["1", "Full test suite passes", "Runs pnpm test — expects 391 tests, zero failures"],
      ["2", "TypeScript compiles without errors", "Runs tsc --noEmit — zero type errors"],
      ["3", "README anchor strings present", "Checks for 4 required anchor strings in README.md"],
      ["4", "All portal routes respond 200", "Starts browser-demo server, requests 9 routes, expects 200"],
      ["5", "No src/ file unreferenced in tests or examples", "Every file under src/ must appear in at least one test or example"],
      ["6", "Invariant registry exists and is non-empty", "Loads invariants.ts — verifies 12 invariants defined"],
      ["7", "Known-limitations section present in README", "README must contain '## Known Limitations' heading"],
      ["8", "Test count in README matches actual", "README's 'N tests' claim must match actual test run count"],
      ["9", "demo:web:validate passes", "Runs validate-demo.ts — all browser demo assertions pass"],
      ["10", "demo:support:validate passes", "Runs validate-support-readiness.ts — 13 assertions pass"],
      ["11", "review:validate passes", "Runs validate-review-portal.ts — 110 assertions pass"],
      ["12", "No architectural import boundary violations", "Runs check-imports.ts — 0 violations across 79 files"],
      ["13", "All invariants linked to covering tests", "Runs check-invariant-coverage.ts — 12/12 invariants covered"],
      ["14", "No stale test-count references in documentation", "All doc references to test counts match actual"],
      ["15", "Pilot documents exist and contain required sections", "3 pilot docs verified for required headings"]
    ],
    [24, 150, CONTENT_W - 174]
  );

  sectionTitle(doc, "Import Boundary Rules (check-imports.ts)", 2);
  body(doc, "The following boundaries are enforced across all 79 files:");
  const rules = [
    "examples/ and scripts/ must not import from test/",
    "src/ must not import from examples/, scripts/, or test/",
    "test/ must not import from examples/ or scripts/ (except for shared fixtures)",
    "No circular dependencies within src/services/"
  ];
  rules.forEach((r) => bullet(doc, r));

  sectionTitle(doc, "Proof Snapshot (export-proof.ts)", 2);
  body(doc,
    "pnpm export:proof generates docs/reports/proof-snapshot.json — a signed manifest of the repo state " +
    "including: test suite results, audit check results, invariant count, git commit hash, and a " +
    "SHA-256 manifestChecksum. The manifest can be independently verified with pnpm verify:proof."
  );
  codeBlock(doc, [
    "pnpm export:proof      # generate docs/reports/proof-snapshot.json",
    "pnpm verify:proof      # verify the snapshot's manifestChecksum",
    "pnpm generate:evidence-report  # generate evidence package from snapshot"
  ]);

  pageFooter(doc, pg.n);
}

// ─── Section 11: CLI Scripts ──────────────────────────────────────────────────

function drawSection11(doc: PDFKit.PDFDocument, pg: { n: number }): void {
  addPage(doc);
  pg.n++;
  headerBar(doc, "Section 11 — CLI Scripts & Commands");

  table(doc,
    ["Script / Command", "File", "Purpose"],
    [
      ["pnpm test", "vitest", "Run all 391 tests"],
      ["pnpm test:watch", "vitest", "Watch mode — re-runs on file changes"],
      ["pnpm typecheck", "tsc --noEmit", "TypeScript type check without emitting"],
      ["pnpm demo", "examples/run-demo.ts", "Console demo of all gate scenarios"],
      ["pnpm demo:web", "examples/browser-demo/server.ts", "Start browser-based review portal (HTTP server)"],
      ["pnpm demo:web:validate", "examples/browser-demo/validate-demo.ts", "Assert all demo routes and scenarios"],
      ["pnpm demo:consumer", "examples/consumer-example/consumer.ts", "Consumer pattern demo"],
      ["pnpm demo:agent", "examples/agent-gate/run-agent-gate.ts", "AI agent gate demo"],
      ["pnpm demo:audit", "examples/auditor-view/run-auditor-view.ts", "Auditor certificate view demo"],
      ["pnpm demo:support", "examples/support-readiness/run-support-readiness.ts", "Support readiness demo"],
      ["pnpm demo:all", "all above", "Run all demos sequentially"],
      ["pnpm check:imports", "scripts/check-imports.ts", "Verify import boundary rules (79 files)"],
      ["pnpm check:invariants", "scripts/check-invariant-coverage.ts", "Verify 12/12 invariants have test coverage"],
      ["pnpm export:proof", "scripts/export-proof.ts", "Generate proof-snapshot.json with SHA-256 checksum"],
      ["pnpm verify:proof", "scripts/verify-proof.ts", "Verify proof-snapshot.json manifestChecksum"],
      ["pnpm audit:repo", "scripts/repo-audit.ts", "Run all 15 repo audit checks"],
      ["pnpm generate:pilot-config", "scripts/generate-pilot-config.ts", "Generate pilot config package from wizard-input.json"],
      ["pnpm generate:evidence-report", "scripts/generate-evidence-report.ts", "Generate evidence package from proof-snapshot.json"],
      ["pnpm review:validate", "examples/browser-demo/validate-review-portal.ts", "Assert 110 review portal scenarios"]
    ],
    [145, 170, CONTENT_W - 315]
  );

  sectionTitle(doc, "generate:pilot-config — Output Files", 2);
  body(doc, "Reads wizard-input.json from project root. Writes to pilot-config/ directory:");
  const pilotOut = [
    ["cerbaseal-config.json", "Ready-to-use runtime config for the client's workflow and authority classes"],
    ["pilot-checklist.md", "Phase-by-phase onboarding checklist with owner and acceptance criteria per item"],
    ["scenario-test.ts", "Runnable TypeScript test of the client's specific workflow (approve/reject scenarios)"],
    ["deployment-summary.md", "One-page deployment summary with environment variables, pre-flight checklist, and next steps"]
  ];
  pilotOut.forEach(([file, desc]) => kv(doc, file, desc, 8));

  sectionTitle(doc, "generate:evidence-report — Output Files", 2);
  body(doc, "Reads docs/reports/proof-snapshot.json. Writes to evidence-package/ directory:");
  const evidOut = [
    ["governance-summary.md", "Narrative compliance evidence: test results, audit checks, invariant coverage, chain validity"],
    ["decision-summary.json", "Machine-readable enforcement state: gate config, invariants, proof snapshot metadata"],
    ["audit-integrity-summary.md", "Hash chain verification details: manifest checksum status, HMAC signature status"]
  ];
  evidOut.forEach(([file, desc]) => kv(doc, file, desc, 8));

  pageFooter(doc, pg.n);
}

// ─── Section 12: Starter Kits ─────────────────────────────────────────────────

function drawSection12(doc: PDFKit.PDFDocument, pg: { n: number }): void {
  addPage(doc);
  pg.n++;
  headerBar(doc, "Section 12 — Integration Starter Kits (×4)");

  body(doc,
    "Four complete working examples in examples/. Each runs standalone with pnpm tsx. " +
    "Each has a README.md explaining the pattern and how to adapt it.",
    MID_GRAY
  );
  doc.moveDown(0.3);

  const kits = [
    {
      name: "rest-api-starter",
      path: "examples/rest-api-starter/",
      pattern: "HTTP REST wrapper — expose the gate as an API",
      desc: "A Node.js HTTP server (no framework) that wraps ExecutionGateService as REST endpoints. Useful as a sidecar or internal service that other systems call over HTTP.",
      endpoints: [
        "POST /evaluate — evaluate a GovernedRequest, returns GateResult + EvidenceBundle",
        "GET  /decisions — list all decisions from the in-memory audit log",
        "GET  /decisions/:id — get a specific decision by requestId",
        "GET  /health — system health check (logging ready, chain valid, control status)"
      ],
      runCmd: "pnpm tsx examples/rest-api-starter/index.ts",
      verifyCmd: "curl -X POST http://localhost:3001/evaluate -d @examples/rest-api-starter/sample-request.json"
    },
    {
      name: "financial-approval-starter",
      pattern: "AI proposes → analyst holds → manager approves → ALLOW",
      path: "examples/financial-approval-starter/",
      desc: "Demonstrates the two-step human approval pattern for financial escalations. An AI flags a high-risk transaction; an analyst reviews; a manager provides the final ApprovalArtifact. Shows the full HOLD → ALLOW lifecycle with evidence bundle generation.",
      endpoints: [
        "Step 1: Submit without approval → HOLD (REQUIRED_APPROVAL_MISSING)",
        "Step 2: Manager reviews and constructs ApprovalArtifact",
        "Step 3: Resubmit with artifact → ALLOW + ReleaseAuthorization",
        "Step 4: Generate EvidenceBundle with 3-event chain",
        "Step 5: Verify: AI alone → REJECT (AI_CANNOT_AUTHORIZE)"
      ],
      runCmd: "pnpm tsx examples/financial-approval-starter/index.ts"
    },
    {
      name: "fraud-workflow-starter",
      pattern: "AI-scored triage with persistent file-backed audit log",
      path: "examples/fraud-workflow-starter/",
      desc: "Processes transactions through risk scoring (0–100) with risk-level routing. Uses FileBackedAppendOnlyLogService for durable JSONL audit logs. Demonstrates fraud_triage unconditional approval enforcement.",
      endpoints: [
        "Low risk (< 50): allow action, no approval — but fraud_triage overrides (HOLD)",
        "Medium risk (50–79): hold action, analyst approval required → ALLOW",
        "High risk (≥ 80): escalate action, compliance_officer approval required → ALLOW",
        "Audit log: ./audit/fraud-triage.jsonl (JSONL, persists across runs)"
      ],
      runCmd: "pnpm tsx examples/fraud-workflow-starter/index.ts"
    },
    {
      name: "agent-integration-starter",
      pattern: "AI agent proposes → system actor carries → human approves",
      path: "examples/agent-integration-starter/",
      desc: "Shows the correct pattern for integrating an AI agent: the AI never submits its own proposal as actor (INV-05 REJECT). Instead, a system actor carries the AI proposal. A human reviewer then provides the ApprovalArtifact. Includes a deliberate wrong-pattern demo showing why AI self-authorization always produces REJECT.",
      endpoints: [
        "Scenario 1: AI actor submits own proposal → REJECT (AI_CANNOT_AUTHORIZE)",
        "Scenario 2: System actor carries AI proposal → HOLD (waiting for human)",
        "Scenario 3: Human reviewer approves → ALLOW + EvidenceBundle",
        "Evidence: 3-event chain with model version + reviewer identity"
      ],
      runCmd: "pnpm tsx examples/agent-integration-starter/index.ts"
    }
  ];

  kits.forEach((kit, i) => {
    if (i > 0) doc.moveDown(0.5);
    sectionTitle(doc, `${kit.name}   ·   ${kit.path}`, 2);
    doc.fillColor(ACCENT).font("Helvetica-Oblique").fontSize(8.5).text(`Pattern: ${kit.pattern}`);
    doc.moveDown(0.15);
    body(doc, kit.desc);
    doc.moveDown(0.15);
    kit.endpoints.forEach((e) => bullet(doc, e));
    if (kit.runCmd) {
      doc.moveDown(0.15);
      codeBlock(doc, [kit.runCmd, ...(kit.verifyCmd ? [kit.verifyCmd] : [])]);
    }
  });

  pageFooter(doc, pg.n);
}

// ─── Section 13: Adoption Layer ───────────────────────────────────────────────

function drawSection13(doc: PDFKit.PDFDocument, pg: { n: number }): void {
  addPage(doc);
  pg.n++;
  headerBar(doc, "Section 13 — Adoption Layer — 5 Priorities");

  body(doc,
    "Five adoption-layer deliverables built in response to the Line Axia audit. " +
    "Together they allow a client to onboard, configure, pilot, and generate compliance evidence " +
    "without requiring Jesse to be present for every step.",
    MID_GRAY
  );
  doc.moveDown(0.3);

  const priorities = [
    {
      n: "Priority 1",
      name: "Authority Class Registry",
      files: ["cerbaseal.config.json", "src/config/cerbaseal-config.ts"],
      desc: "New client authority classes (e.g. 'risk_officer') added to cerbaseal.config.json with zero TypeScript source changes. ExecutionGateService constructor accepts optional GateConfig. Default (no-args) constructor uses core classes only — zero breaking changes.",
      impact: "Eliminates: 'Jesse must update the code every time we add a role'"
    },
    {
      n: "Priority 2",
      name: "Integration Starter Kits",
      files: ["examples/rest-api-starter/", "examples/financial-approval-starter/", "examples/fraud-workflow-starter/", "examples/agent-integration-starter/"],
      desc: "Four complete working examples covering the most common integration patterns. Each runs standalone, includes a README, and demonstrates the correct actor/approver pattern. Client developers can copy and adapt without needing to understand the full codebase.",
      impact: "Eliminates: 'We need Jesse on a call to show us how to integrate'"
    },
    {
      n: "Priority 3",
      name: "Workflow Config Generator",
      files: ["scripts/generate-pilot-config.ts", "scripts/wizard-input.example.json"],
      desc: "Client fills in wizard-input.json (wizard-style questionnaire about their workflow, roles, approval rules, environment). pnpm generate:pilot-config produces a complete 4-file pilot configuration package: cerbaseal-config.json, pilot-checklist.md, scenario-test.ts, deployment-summary.md.",
      impact: "Eliminates: 'Jesse needs to configure this for each client'"
    },
    {
      n: "Priority 4",
      name: "Pilot Evidence Package Generator",
      files: ["scripts/generate-evidence-report.ts"],
      desc: "After a successful pilot, run pnpm export:proof then pnpm generate:evidence-report to produce a compliance evidence package (3 files) from the cryptographically verified proof snapshot. Suitable for sharing with compliance officers, regulators, or auditors.",
      impact: "Eliminates: 'Jesse must produce the compliance evidence manually'"
    },
    {
      n: "Priority 5",
      name: "Founder Independence Kit",
      files: ["docs/FOUNDER-INDEPENDENCE-KIT.md", "docs/client-adoption/onboarding-sequence.md"],
      desc: "Single-page master index covering all 7 adoption stages from client qualification to compliance review. 8-phase onboarding sequence a client follows end-to-end without Jesse. Includes escalation table, common errors guide, and explicit list of what still requires Jesse.",
      impact: "Eliminates: 'The whole sales and onboarding process depends on Jesse's time'"
    }
  ];

  priorities.forEach((p) => {
    doc.moveDown(0.4);
    const py = doc.y;
    doc.rect(MARGIN, py, 70, 16).fill(ACCENT);
    doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(8)
      .text(p.n.toUpperCase(), MARGIN + 4, py + 4, { width: 62, align: "center" });
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10)
      .text(p.name, MARGIN + 76, py + 2);
    doc.y = py + 22;
    body(doc, p.desc);
    doc.moveDown(0.1);
    kv(doc, "Files", p.files.join("  ·  "), 4);
    doc.fillColor(GREEN).font("Helvetica-Oblique").fontSize(8).text("→ " + p.impact, MARGIN + 4, doc.y);
    doc.moveDown(0.1);
  });

  pageFooter(doc, pg.n);
}

// ─── Section 14: Demo App Routes ─────────────────────────────────────────────

function drawSection14(doc: PDFKit.PDFDocument, pg: { n: number }): void {
  addPage(doc);
  pg.n++;
  headerBar(doc, "Section 14 — Demo App Routes");

  body(doc,
    "The browser-demo server (examples/browser-demo/server.ts) is a plain Node.js HTTP server " +
    "with no web framework. It serves both HTML portal pages and JSON API endpoints. " +
    "Start with: pnpm demo:web   (default port: 3000 or $PORT)",
    MID_GRAY
  );
  doc.moveDown(0.3);

  sectionTitle(doc, "Portal Pages (HTML — for human review)", 2);
  table(doc,
    ["Route", "Title", "Content"],
    [
      ["/review", "CerbaSeal Review Portal", "Interactive governance decision review with live scenario evaluation"],
      ["/pilot", "Pilot Readiness", "Pilot readiness checklist and deployment status dashboard"],
      ["/security", "Security Summary", "Invariant summary, adversarial test results, security posture overview"],
      ["/deployment", "Deployment Guide", "Step-by-step deployment instructions and environment configuration"],
      ["/one-page", "One-Page Summary", "Executive-level one-page overview of CerbaSeal governance model"]
    ],
    [70, 110, CONTENT_W - 180]
  );

  sectionTitle(doc, "Scenario APIs (JSON — return gate decisions)", 2);
  table(doc,
    ["Route", "Scenario", "Expected outcome"],
    [
      ["POST /api/reject", "AI actor attempts self-authorization", "REJECT — AI_CANNOT_AUTHORIZE"],
      ["POST /api/hold", "System actor, approval required but missing", "HOLD — REQUIRED_APPROVAL_MISSING"],
      ["POST /api/allow", "System actor, approval present and valid", "ALLOW — DECISION_ALLOWED"]
    ],
    [100, 190, CONTENT_W - 290]
  );

  sectionTitle(doc, "Data APIs (JSON — return structured data for portal)", 2);
  table(doc,
    ["Route", "Returns"],
    [
      ["/api/review-summary", "Recent decisions, chain validity, invariant check summary"],
      ["/api/pilot-readiness", "Pilot checklist items with status, deployment mode, configuration summary"],
      ["/api/security-summary", "Invariant list with test coverage, adversarial test results, security score"]
    ],
    [120, CONTENT_W - 120]
  );

  sectionTitle(doc, "Validation Scripts", 2);
  codeBlock(doc, [
    "pnpm demo:web:validate   # validate-demo.ts — exercises all routes, checks JSON structure",
    "pnpm review:validate     # validate-review-portal.ts — 110 assertions across all portal routes"
  ]);

  sectionTitle(doc, "cerbaseal-demo Artifact (Vite + React)", 2);
  body(doc,
    "A separate React/Vite application in artifacts/cerbaseal-demo/ provides a production-grade " +
    "browser UI. Registered as a pnpm workspace artifact with its own dev server. " +
    "Start with: pnpm --filter @workspace/cerbaseal-demo run dev"
  );

  pageFooter(doc, pg.n);
}

// ─── Section 15: File Tree ────────────────────────────────────────────────────

function drawSection15(doc: PDFKit.PDFDocument, pg: { n: number }): void {
  addPage(doc);
  pg.n++;
  headerBar(doc, "Section 15 — Full Repository File Tree");

  body(doc, "All non-node_modules files organized by directory.", MID_GRAY);
  doc.moveDown(0.3);

  const tree: [string, string][] = [
    ["ROOT", ""],
    ["  package.json", "Root package — 18 scripts, tsx + pdfkit + vitest devDependencies"],
    ["  tsconfig.json", "Strict TypeScript — ES2022 target, NodeNext module, strict: true"],
    ["  cerbaseal.config.json", "Runtime authority/workflow/action class registry"],
    ["  vitest.config.ts", "Vitest configuration — include: test/**/*.test.ts"],
    ["  .gitignore", "Excludes: wizard-input.json, pilot-config/, evidence-package/, audit/"],
    ["  README.md", "Full public README with adoption layer section"],
    ["  CERBASEAL_PILOT_READINESS_BINDER.md", "Pilot readiness binder for client delivery"],
    ["", ""],
    ["src/", ""],
    ["  config/", ""],
    ["    cerbaseal-config.ts", "loadCerbaSealConfig(), buildAllowedAuthorityClasses(), GateConfig interface"],
    ["  domain/", ""],
    ["    types/core.ts", "All primary types: GovernedRequest, DecisionEnvelope, ApprovalArtifact, GateResult, ..."],
    ["    types/audit.ts", "Audit types: AuditLogEntry, EvidenceBundle, ExportManifest, ReplayResult"],
    ["    types/diagnostics.ts", "DiagnosticReport, HealthReport, SystemState types"],
    ["    constants/invariants.ts", "INVARIANTS object — INV-01 through INV-12"],
    ["    constants/reason-codes.ts", "REASON_CODES object — 18 reason codes"],
    ["    errors/cerbaseal-error.ts", "CerbaSealError class — carries invariant, reasonCode, finalState"],
    ["    formatters/certificate.ts", "CertificateFormatter — human-readable governance certificate"],
    ["    formatters/demo-response.ts", "DemoResponseFormatter — browser demo JSON shape"],
    ["    review-portal-data.ts", "Data builders for review portal API endpoints"],
    ["    builders/agent-scenarios.ts", "Agent gate test scenario builders"],
    ["    builders/consumer-scenarios.ts", "Consumer example scenario builders"],
    ["    builders/gate-scenarios.ts", "Core gate scenario builders (ALLOW/HOLD/REJECT)"],
    ["    builders/request-fixtures.ts", "GovernedRequest fixture builders for tests"],
    ["  services/execution/", ""],
    ["    execution-gate-service.ts", "ExecutionGateService — the mandatory enforcement gate"],
    ["    mock-execution-system.ts", "MockExecutionSystem — test helper for simulating callers"],
    ["    tools.ts", "Shared gate utility functions"],
    ["  services/audit/", ""],
    ["    append-only-log-service.ts", "AppendOnlyLogService (in-memory) + IAuditLogService interface"],
    ["    file-backed-append-only-log-service.ts", "FileBackedAppendOnlyLogService (JSONL persistence)"],
    ["    audit-hash-utils.ts", "SHA-256 chain construction and verification"],
    ["  services/evidence/", ""],
    ["    evidence-bundle-service.ts", "EvidenceBundleService — assembles full decision context"],
    ["  services/export/", ""],
    ["    export-manifest-service.ts", "ExportManifestService — point-in-time evidence hash snapshot"],
    ["  services/replay/", ""],
    ["    replay-service.ts", "ReplayService — determinism verification for past decisions"],
    ["  services/diagnostics/", ""],
    ["    diagnostic-report-service.ts", "DiagnosticReportService — operator analysis + recommendations"],
    ["  services/support/", ""],
    ["    operator-action-service.ts", "Operator-level actions: acknowledge, escalate, re-evaluate"],
    ["    system-health-service.ts", "SystemHealthService — precondition health checks"],
    ["    system-integrity-service.ts", "SystemIntegrityService — audit chain integrity verification"],
    ["    support-fixtures.ts", "Test fixtures for support services"],
    ["", ""],
    ["test/", ""],
    ["  execution-gate-service.test.ts", "~120 tests — all invariants and gate paths"],
    ["  adversarial-integrity.test.ts", "~18 tests — advanced attack scenarios"],
    ["  audit-evidence-export.test.ts", "~30 tests — audit chain and evidence assembly"],
    ["  persistent-audit-log.test.ts", "~20 tests — file-backed log"],
    ["  diagnostic-report-service.test.ts", "~18 tests — diagnostic report"],
    ["  security/fail-closed.test.ts", "2 tests — unexpected exceptions → REJECT"],
    ["  security/non-forgery.test.ts", "2 tests — WeakSet bypass prevention"],
    ["  security/misuse-scenarios.test.ts", "~15 tests — AI self-auth, forgery attempts"],
    ["  security/contextual-boundary.test.ts", "~12 tests — edge cases and boundary values"],
    ["  snapshots/enforcement-loop.snapshot.test.ts", "~8 tests — snapshot comparisons"],
    ["  integration/full-flow.test.ts", "1 test — full end-to-end flow"],
    ["  integration/system-integration.test.ts", "1 test — full stack integration"],
    ["  integration/browser-demo-routes.test.ts", "~40 tests — HTTP route assertions"],
    ["  integration/review-portal-routes.test.ts", "~40 tests — portal route assertions"],
    ["  integration/support-readiness.test.ts", "~30 tests — support readiness scenarios"],
    ["  integration/external-signal-examples.test.ts", "~34 tests — external signal injection"],
    ["", ""],
    ["examples/", ""],
    ["  run-demo.ts", "Console demo — all gate scenarios"],
    ["  http-wrapper.ts", "HTTP wrapper utility"],
    ["  rest-api-starter/", "REST API starter kit (index.ts + README.md + sample-request.json)"],
    ["  financial-approval-starter/", "Financial approval starter kit (index.ts + README.md)"],
    ["  fraud-workflow-starter/", "Fraud workflow starter kit (index.ts + README.md)"],
    ["  agent-integration-starter/", "Agent integration starter kit (index.ts + README.md)"],
    ["  browser-demo/", "HTTP review portal server (server.ts, scenarios.ts, review-portal.ts, ...)"],
    ["  consumer-example/", "Consumer pattern example"],
    ["  agent-gate/", "AI agent gate example"],
    ["  auditor-view/", "Auditor certificate view"],
    ["  support-readiness/", "Support readiness example"],
    ["", ""],
    ["scripts/", ""],
    ["  repo-audit.ts", "15-check automated repo audit"],
    ["  export-proof.ts", "Generate proof-snapshot.json with SHA-256 manifest checksum"],
    ["  verify-proof.ts", "Verify proof-snapshot.json"],
    ["  check-imports.ts", "Import boundary checker (79 files)"],
    ["  check-invariant-coverage.ts", "Invariant-to-test coverage checker"],
    ["  generate-pilot-config.ts", "Pilot configuration package generator"],
    ["  generate-evidence-report.ts", "Evidence package generator"],
    ["  wizard-input.example.json", "Example wizard-input.json for fraud triage workflow"],
    ["  hash-report.ts", "Report hash utility"],
    ["", ""],
    ["docs/", "(extensive — selected highlights)"],
    ["  FOUNDER-INDEPENDENCE-KIT.md", "Master index for all 7 adoption stages"],
    ["  client-adoption/onboarding-sequence.md", "8-phase client onboarding sequence"],
    ["  client-adoption/", "20+ client-facing guides, playbooks, templates, training materials"],
    ["  deployment/", "Deployment modes, EU pilot posture, runbook"],
    ["  security/", "Access control, artifact signing roadmap, security review brief"],
    ["  reports/", "Adversarial integrity reports, CTO review pack, proof-snapshot.json"],
    ["", ""],
    ["artifacts/cerbaseal-demo/", ""],
    ["  src/", "React + Vite browser UI (hooks, utils, components)"],
    ["  vite.config.ts", "Vite configuration — reads PORT env var"],
    ["  package.json", "@workspace/cerbaseal-demo"],
    ["", ""],
    ["specs/", ""],
    ["  approval_artifact.json", "JSON schema for ApprovalArtifact"],
    ["  approval_artifact.md", "Specification document for ApprovalArtifact"]
  ];

  tree.forEach(([path, desc]) => {
    if (path === "") { doc.moveDown(0.15); return; }
    if (!path.startsWith(" ") && path !== "ROOT") {
      doc.moveDown(0.2);
      doc.fillColor(BLUE).font("Helvetica-Bold").fontSize(8.5).text(path);
      return;
    }
    if (path === "ROOT") { return; }
    const indent = (path.match(/^ +/) ?? [""])[0].length;
    const name = path.trim();
    const x = MARGIN + Math.min(indent * 3, 30);
    if (desc) {
      doc.fillColor(NAVY).font("Courier").fontSize(7.5)
        .text(name, x, doc.y, { continued: true, width: 160 });
      doc.fillColor(MID_GRAY).font("Helvetica").fontSize(7.5)
        .text("  " + desc, { width: CONTENT_W - 160 - (x - MARGIN), lineGap: 1 });
    } else {
      doc.fillColor(NAVY).font("Courier").fontSize(7.5).text(name, x, doc.y, { lineGap: 1 });
    }
  });

  pageFooter(doc, pg.n);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("\nCerbaSeal-Core — System & Repo Breakdown PDF Generator\n");
  const doc = newDoc();
  const stream = createWriteStream(OUT_PATH);
  doc.pipe(stream);

  const pg = { n: 1 };

  drawCover(doc);
  drawSection1(doc, pg);
  drawSection2(doc, pg);
  drawSection3(doc, pg);
  drawSection4(doc, pg);
  drawSection5(doc, pg);
  drawSection6(doc, pg);
  drawSection7(doc, pg);
  drawSection8(doc, pg);
  drawSection9(doc, pg);
  drawSection10(doc, pg);
  drawSection11(doc, pg);
  drawSection12(doc, pg);
  drawSection13(doc, pg);
  drawSection14(doc, pg);
  drawSection15(doc, pg);

  doc.end();

  await new Promise<void>((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  const { statSync } = await import("node:fs");
  const size = (statSync(OUT_PATH).size / 1024).toFixed(0);
  console.log(`  ✓ ${OUT_PATH}`);
  console.log(`  Size: ${size} KB`);
  console.log(`  Pages: ~${pg.n}`);
  console.log(`\nDone.\n`);
}

main().catch((err) => {
  console.error("PDF generation failed:", err);
  process.exit(1);
});
