/**
 * CerbaSeal-Core — System & Repo Breakdown PDF
 * Clean rewrite with dynamic row heights, no text clipping.
 * Run: pnpm generate:system-pdf
 */

import PDFDocument from "pdfkit";
import { createWriteStream } from "node:fs";
import { resolve } from "node:path";

const OUT = resolve(process.cwd(), "cerbaseal-system-breakdown.pdf");

// ── Dimensions ──────────────────────────────────────────────────────────────
const PW = 595.28;
const PH = 841.89;
const ML = 50;
const MR = 50;
const MT = 50;
const MB = 55;
const CW = PW - ML - MR;   // 495.28

// ── Colours ─────────────────────────────────────────────────────────────────
const C = {
  navy:      "#0f1e3d",
  blue:      "#1a3a6b",
  accent:    "#2563eb",
  ltBlue:    "#dbeafe",
  midBlue:   "#93c5fd",
  black:     "#111827",
  dark:      "#1f2937",
  mid:       "#6b7280",
  rule:      "#e5e7eb",
  light:     "#f9fafb",
  white:     "#ffffff",
  green:     "#166534",
  greenBg:   "#dcfce7",
  red:       "#991b1b",
  redBg:     "#fee2e2",
  amber:     "#92400e",
  amberBg:   "#fef3c7",
  codeBg:    "#f1f5f9",
  codeBar:   "#2563eb",
};

// ── State ────────────────────────────────────────────────────────────────────
let doc: PDFKit.PDFDocument;
let pageNum = 0;

// ── Bootstrap ────────────────────────────────────────────────────────────────
function init(): void {
  doc = new PDFDocument({
    size: "A4",
    margins: { top: MT, bottom: MB, left: ML, right: MR },
    info: {
      Title: "CerbaSeal-Core v0.1.0 — System & Repo Breakdown",
      Author: "Jesse Lamont / Lamont Labs",
      Subject: "Deterministic Execution Governance",
    },
    autoFirstPage: false,
  });
}

function newPage(): void {
  doc.addPage();
  pageNum++;
  // Thin accent line at top
  doc.rect(0, 0, PW, 4).fill(C.accent);
  // Reset cursor below top margin
  doc.y = MT + 4;
}

function footer(): void {
  const y = PH - 36;
  doc.save()
    .moveTo(ML, y).lineTo(PW - MR, y)
    .strokeColor(C.rule).lineWidth(0.5).stroke()
    .restore();
  doc.fillColor(C.mid).font("Helvetica").fontSize(7.5)
    .text(
      `CerbaSeal-Core v0.1.0  ·  Jesse Lamont / Lamont Labs  ·  CONFIDENTIAL`,
      ML, y + 6,
      { width: CW - 40, lineBreak: false }
    );
  doc.fillColor(C.mid).font("Helvetica").fontSize(7.5)
    .text(`${pageNum}`, PW - MR - 20, y + 6, { width: 20, align: "right", lineBreak: false });
}

// ── Safe-Y: ensure we have room; if not, add page ────────────────────────────
function ensureY(needed: number): void {
  if (doc.y + needed > PH - MB - 10) {
    footer();
    newPage();
  }
}

// ── Typography helpers ───────────────────────────────────────────────────────
function h1(text: string): void {
  ensureY(40);
  doc.moveDown(0.6);
  doc.fillColor(C.navy).font("Helvetica-Bold").fontSize(16).text(text, ML, doc.y);
  const y = doc.y + 2;
  doc.save().moveTo(ML, y).lineTo(PW - MR, y).strokeColor(C.accent).lineWidth(1.5).stroke().restore();
  doc.y = y + 8;
}

function h2(text: string): void {
  ensureY(28);
  doc.moveDown(0.5);
  doc.fillColor(C.blue).font("Helvetica-Bold").fontSize(11.5).text(text, ML, doc.y);
  doc.moveDown(0.1);
}

function h3(text: string): void {
  ensureY(20);
  doc.moveDown(0.3);
  doc.fillColor(C.dark).font("Helvetica-Bold").fontSize(9.5).text(text, ML, doc.y);
  doc.moveDown(0.05);
}

function para(text: string, color = C.black, size = 9): void {
  doc.fillColor(color).font("Helvetica").fontSize(size)
    .text(text, ML, doc.y, { width: CW, lineGap: 2 });
  doc.moveDown(0.15);
}

function bul(text: string, indent = 0, bold = false): void {
  ensureY(14);
  const x = ML + indent;
  const w = CW - indent;
  doc.save();
  doc.fillColor(C.accent).font("Helvetica-Bold").fontSize(8.5)
    .text("·", x, doc.y, { lineBreak: false });
  doc.fillColor(C.black).font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(8.5)
    .text("  " + text, x + 10, doc.y, { width: w - 10, lineGap: 1.5 });
  doc.restore();
}

function kv(key: string, val: string, indent = 0): void {
  ensureY(14);
  const x = ML + indent;
  const w = CW - indent;
  const keyW = Math.min(doc.widthOfString(key + ": ", { fontSize: 8.5 }) + 2, 160);
  doc.fillColor(C.mid).font("Helvetica-Bold").fontSize(8.5)
    .text(key + ": ", x, doc.y, { lineBreak: false, width: keyW });
  doc.fillColor(C.black).font("Helvetica").fontSize(8.5)
    .text(val, x + keyW, doc.y, { width: w - keyW, lineGap: 1.5 });
}

function code(lines: string[], label?: string): void {
  doc.moveDown(0.25);
  ensureY(lines.length * 12 + 14);
  if (label) {
    doc.fillColor(C.mid).font("Helvetica-Oblique").fontSize(7.5).text(label, ML, doc.y);
    doc.moveDown(0.1);
  }
  // Measure actual heights to handle wrapping
  const lineH = 11;
  const pad = 8;
  const blockH = lines.length * lineH + pad * 2;
  const y0 = doc.y;
  doc.rect(ML, y0, CW, blockH).fill(C.codeBg);
  doc.rect(ML, y0, 3, blockH).fill(C.codeBar);
  lines.forEach((ln, i) => {
    doc.fillColor(C.dark).font("Courier").fontSize(7.5)
      .text(ln, ML + 10, y0 + pad + i * lineH, { width: CW - 14, lineBreak: false });
  });
  doc.y = y0 + blockH + 6;
  doc.moveDown(0.1);
}

function rule(): void {
  ensureY(10);
  doc.save()
    .moveTo(ML, doc.y + 2).lineTo(PW - MR, doc.y + 2)
    .strokeColor(C.rule).lineWidth(0.4).stroke()
    .restore();
  doc.y += 8;
}

// ── Dynamic table ─────────────────────────────────────────────────────────────
// Correctly wraps text and computes row height before drawing.
function table(
  headers: string[],
  rows: string[][],
  widths: number[],
  opts?: { fontSize?: number; headerBg?: string; altRow?: boolean }
): void {
  const fs = opts?.fontSize ?? 8;
  const hBg = opts?.headerBg ?? C.navy;
  const alt = opts?.altRow ?? true;
  const pad = { x: 5, y: 4 };
  const lineGap = 1.5;

  // Pre-compute each cell's wrapped height
  function cellH(text: string, colW: number): number {
    return doc.heightOfString(text, { width: colW - pad.x * 2, fontSize: fs, lineGap });
  }

  function rowH(row: string[]): number {
    let h = 0;
    row.forEach((cell, i) => { h = Math.max(h, cellH(cell, widths[i])); });
    return h + pad.y * 2;
  }

  // Draw one row
  function drawRow(row: string[], y: number, bg: string, bold: boolean): number {
    const rh = bold ? 20 : rowH(row);
    ensureY(rh + 2);
    const ry = doc.y;
    // background
    doc.rect(ML, ry, CW, rh).fill(bg);
    // subtle border
    doc.save().rect(ML, ry, CW, rh).strokeColor(C.rule).lineWidth(0.3).stroke().restore();
    // cells
    let cx = ML;
    row.forEach((cell, i) => {
      const color = bold ? C.white
        : cell.startsWith("✓") ? C.green
        : cell.startsWith("✗") ? C.red
        : cell.startsWith("ALLOW") ? C.green
        : cell.startsWith("HOLD") ? C.amber
        : cell.startsWith("REJECT") ? C.red
        : C.black;
      doc.fillColor(color)
        .font(bold || i === 0 ? "Helvetica-Bold" : "Helvetica")
        .fontSize(bold ? fs + 0.5 : fs)
        .text(cell, cx + pad.x, ry + pad.y, {
          width: widths[i] - pad.x * 2,
          lineGap,
        });
      cx += widths[i];
    });
    doc.y = ry + rh;
    return rh;
  }

  ensureY(24);
  drawRow(headers, doc.y, hBg, true);
  rows.forEach((row, ri) => {
    const bg = !alt ? C.white : ri % 2 === 0 ? C.white : C.light;
    drawRow(row, doc.y, bg, false);
  });
  doc.moveDown(0.4);
}

// ── Section header bar ───────────────────────────────────────────────────────
function sectionBar(n: string, title: string): void {
  footer();
  newPage();
  const barH = 34;
  doc.rect(0, MT + 4, PW, barH).fill(C.navy);
  doc.fillColor(C.midBlue).font("Helvetica").fontSize(8)
    .text(`SECTION ${n}`, ML, MT + 10, { lineBreak: false });
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(13)
    .text(title, ML, MT + 20, { lineBreak: false });
  doc.y = MT + barH + 14;
}

// ── Stat box row ─────────────────────────────────────────────────────────────
function statBoxes(items: { label: string; value: string; sub: string; color: string }[]): void {
  const bw = (CW - (items.length - 1) * 8) / items.length;
  const bh = 68;
  const y0 = doc.y;
  items.forEach((item, i) => {
    const x = ML + i * (bw + 8);
    doc.rect(x, y0, bw, bh).fill(C.light);
    doc.rect(x, y0, bw, 3).fill(item.color);
    doc.fillColor(item.color).font("Helvetica-Bold").fontSize(20)
      .text(item.value, x, y0 + 14, { width: bw, align: "center", lineBreak: false });
    doc.fillColor(C.navy).font("Helvetica-Bold").fontSize(8)
      .text(item.label, x, y0 + 40, { width: bw, align: "center", lineBreak: false });
    doc.fillColor(C.mid).font("Helvetica").fontSize(7)
      .text(item.sub, x, y0 + 52, { width: bw, align: "center", lineBreak: false });
  });
  doc.y = y0 + bh + 12;
}

// ═══════════════════════════════════════════════════════════════════════════
// COVER
// ═══════════════════════════════════════════════════════════════════════════
function cover(): void {
  doc.addPage();
  pageNum++;

  // Full bleed header
  doc.rect(0, 0, PW, 200).fill(C.navy);
  doc.rect(0, 200, PW, 4).fill(C.accent);

  // Eyebrow
  doc.fillColor(C.midBlue).font("Helvetica").fontSize(9)
    .text("LAMONT LABS  ·  EXECUTION GOVERNANCE INFRASTRUCTURE", 0, 56, { width: PW, align: "center" });

  // Title
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(36)
    .text("CerbaSeal-Core", 0, 78, { width: PW, align: "center" });

  // Subtitle
  doc.fillColor(C.ltBlue).font("Helvetica").fontSize(13)
    .text("v0.1.0  —  System & Repository Breakdown", 0, 124, { width: PW, align: "center" });

  // Label
  doc.fillColor(C.midBlue).font("Helvetica").fontSize(8.5)
    .text("MAXIMUM DETAIL TECHNICAL REFERENCE", 0, 152, { width: PW, align: "center" });

  // Date & author strip
  doc.rect(ML + 60, 168, CW - 120, 28).fill(C.blue);
  doc.fillColor(C.ltBlue).font("Helvetica").fontSize(8)
    .text(`Generated: ${new Date().toUTCString()}`, ML + 60, 174, { width: CW - 120, align: "center" });
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(8)
    .text("Jesse Lamont  ·  jesse@lamontlabs.io", ML + 60, 185, { width: CW - 120, align: "center" });

  // Stat boxes
  doc.y = 222;
  statBoxes([
    { label: "TEST SUITE", value: "415/415", sub: "16 test files · zero regressions", color: C.green },
    { label: "REPO AUDIT", value: "15/15", sub: "all checks passing", color: C.green },
    { label: "INVARIANTS", value: "INV-01→12", sub: "100% test coverage", color: C.accent },
    { label: "IMPORT BOUNDS", value: "0 violations", sub: "79 files scanned", color: C.green },
  ]);

  // TOC
  doc.moveDown(0.5);
  doc.fillColor(C.navy).font("Helvetica-Bold").fontSize(11).text("CONTENTS", ML, doc.y);
  doc.save().moveTo(ML, doc.y + 2).lineTo(PW - MR, doc.y + 2)
    .strokeColor(C.accent).lineWidth(1.5).stroke().restore();
  doc.y += 10;

  const toc = [
    ["1", "System Purpose & Architecture"],
    ["2", "Domain Type System — All Interfaces & Fields"],
    ["3", "Invariant Registry — INV-01 through INV-12"],
    ["4", "Reason Code Registry — All 18 Codes"],
    ["5", "Execution Gate Service — Full Logic Flow"],
    ["6", "Authority Class System & Runtime Config"],
    ["7", "Audit & Evidence Pipeline"],
    ["8", "Supporting Services"],
    ["9", "Test Suite — 16 Files, 415 Tests"],
    ["10", "Repo Audit — 15 Checks Explained"],
    ["11", "CLI Scripts & Commands"],
    ["12", "Integration Starter Kits (×4)"],
    ["13", "Adoption Layer — 5 Priorities"],
    ["14", "Demo App & Browser Portal Routes"],
    ["15", "Full Repository File Tree"],
  ];

  toc.forEach(([n, title]) => {
    ensureY(18);
    const y0 = doc.y;
    const numW = 28;
    const bg = parseInt(n) % 2 === 0 ? C.light : C.white;
    doc.rect(ML, y0, CW, 16).fill(bg);
    doc.rect(ML, y0, numW, 16).fill(C.accent);
    doc.fillColor(C.white).font("Helvetica-Bold").fontSize(8)
      .text(n, ML, y0 + 4, { width: numW, align: "center", lineBreak: false });
    doc.fillColor(C.dark).font("Helvetica").fontSize(8.5)
      .text(title, ML + numW + 8, y0 + 4, { lineBreak: false });
    doc.y = y0 + 16;
  });

  // No footer on cover
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1 — System Purpose & Architecture
// ═══════════════════════════════════════════════════════════════════════════
function sec1(): void {
  sectionBar("1", "System Purpose & Architecture");

  h1("What CerbaSeal-Core Is");
  para(
    "CerbaSeal-Core is a deterministic execution governance library for AI-integrated financial and " +
    "enterprise workflows. It acts as a mandatory gate between any AI proposal and any consequential " +
    "action. No payment, hold, escalation, or account modification may be released without passing " +
    "through the gate. The gate is not advisory — it produces ALLOW, HOLD, or REJECT with a " +
    "cryptographically chained audit trail that cannot be altered after the fact."
  );

  h2("Core Design Principles");
  const principles = [
    ["Fail-closed by default", "Any unexpected error, malformed request, or missing precondition produces REJECT. There is no silent allow path and no default-allow fallback."],
    ["AI is proposal-only", "An AI actor can submit a proposal but cannot bear authority. Any attempt at self-authorization produces an unconditional REJECT via INV-05."],
    ["Human approval as a release precondition", "For workflows requiring human approval, no ALLOW is issued until a valid, signed, correctly-bound ApprovalArtifact is present and verified."],
    ["Immutable decision envelopes", "Every GateResult is registered in a module-private WeakSet. EvidenceBundleService rejects any result not in that set — self-constructed results cannot bypass the gate."],
    ["Cryptographic hash chain", "Every audit log entry hashes its own payload and links to the previous entry hash, forming a tamper-evident chain verifiable at any time."],
    ["Deterministic replay", "Any past decision can be re-run through ReplayService to verify the same inputs produce the same output — proving no logic drift over time."],
    ["Zero runtime dependencies", "The enforcement core depends only on Node.js built-ins. No external npm packages are required at runtime."],
  ];
  principles.forEach(([k, v]) => {
    ensureY(18);
    doc.fillColor(C.blue).font("Helvetica-Bold").fontSize(9).text(k + ":  ", ML, doc.y, { continued: true, lineBreak: false });
    doc.fillColor(C.black).font("Helvetica").fontSize(9).text(v, { width: CW, lineGap: 2 });
    doc.moveDown(0.2);
  });

  h2("Architecture Layers");
  table(
    ["Layer", "Source Path", "Responsibility"],
    [
      ["Domain", "src/domain/", "Types, constants, errors, formatters, builders — structural definitions only, no business logic"],
      ["Enforcement", "src/services/execution/", "ExecutionGateService — the mandatory evaluation gate. assertIsGateIssued() — WeakSet bypass guard"],
      ["Audit", "src/services/audit/", "AppendOnlyLogService (in-memory) + FileBackedAppendOnlyLogService (JSONL). audit-hash-utils.ts — SHA-256 chain"],
      ["Evidence", "src/services/evidence/", "EvidenceBundleService — assembles full decision context from gate result and audit events"],
      ["Export", "src/services/export/", "ExportManifestService — point-in-time snapshot of evidence hashes for external transfer"],
      ["Replay", "src/services/replay/", "ReplayService — re-runs past decisions through a fresh gate instance to verify determinism"],
      ["Diagnostics", "src/services/diagnostics/", "DiagnosticReportService — operator-facing state analysis with recommended actions"],
      ["Support", "src/services/support/", "OperatorActionService, SystemHealthService, SystemIntegrityService"],
      ["Config", "src/config/", "cerbaseal-config.ts — loadCerbaSealConfig(), buildAllowedAuthorityClasses(). Reads cerbaseal.config.json"],
      ["Examples", "examples/", "Working demos: browser-demo, consumer, agent-gate, auditor-view, support-readiness, 4 starter kits"],
      ["Scripts", "scripts/", "repo-audit, export-proof, verify-proof, check-imports, check-invariants, generate-pilot-config, generate-evidence-report"],
    ],
    [70, 120, CW - 190]
  );

  h2("Technology Stack");
  table(
    ["Component", "Choice", "Notes"],
    [
      ["Runtime", "Node.js 18+", "ESM module system (\"type\": \"module\" in package.json)"],
      ["Language", "TypeScript 5.6", "Strict mode, target ES2022, module NodeNext"],
      ["Test runner", "Vitest 2.1", "415 tests, 16 files, avg 7.7s full run"],
      ["Script runner", "tsx 4.21", "Direct TypeScript execution without a compile step"],
      ["PDF generation", "pdfkit 0.18", "devDependency — used only for report generation"],
      ["Package manager", "pnpm workspace", "Monorepo with cerbaseal-demo React/Vite artifact"],
      ["Demo UI", "Vite + React", "Browser review portal at /review, /pilot, /security, /deployment, /one-page"],
    ],
    [90, 90, CW - 180]
  );

  footer();
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2 — Domain Type System
// ═══════════════════════════════════════════════════════════════════════════
function sec2(): void {
  sectionBar("2", "Domain Type System — All Interfaces & Fields");

  h1("Primitive Union Types  ·  src/domain/types/core.ts");
  table(
    ["Type Name", "Members", "Usage"],
    [
      ["AuthorityClass", "system | ai | analyst | reviewer | manager | compliance_officer", "Who is making the request. Validated at runtime. Extensible via config."],
      ["HumanAuthorityClass", "analyst | reviewer | manager | compliance_officer", "Subset used for ApprovalArtifact — excludes system and ai."],
      ["WorkflowClass", "fraud_triage | transaction_escalation | account_hold_recommendation", "Which workflow envelope governs the request."],
      ["ActionClass", "allow | hold | reject | escalate | account_hold", "Concrete action the gate may permit on ALLOW."],
      ["UnknownableActionClass", "ActionClass | (string & {})", "Input type on GovernedRequest. Gate validates and narrows or REJECTs."],
      ["ProposalSourceKind", "ai | deterministic_rule", "Origin of the proposal. Does not grant authority."],
      ["DecisionState", "ALLOW | HOLD | REJECT", "Final gate output. Produced once, immutable."],
    ],
    [100, 200, CW - 300]
  );

  h1("GovernedRequest  ·  Primary gate input");
  para("Every field is validated before a decision is produced. Fields are checked in the order listed.", C.mid, 8.5);
  [
    ["requestId", "string", "Non-empty. Unique identifier for this request. Used to derive all deterministic IDs."],
    ["workflowClass", "WorkflowClass", "Determines which workflows require unconditional approval (e.g. fraud_triage)."],
    ["jurisdiction", "string", "Non-empty jurisdictional tag. Required for audit provenance."],
    ["actorId", "string", "Opaque identity of the actor submitting the request."],
    ["actorAuthorityClass", "AuthorityClass", "Validated at runtime against the allowedAuthorityClasses set — closes the gap for untyped callers."],
    ["proposedActionClass", "UnknownableActionClass", "Must exactly match proposal.requestedActionClass (INV-12)."],
    ["proposal", "DecisionProposal", "The AI or rule-based proposal being evaluated (see below)."],
    ["sensitive", "boolean", "If true, stale or invalid control status triggers REJECT (INV-08)."],
    ["prohibitedUse", "boolean", "If true, unconditional REJECT regardless of other fields (INV-10)."],
    ["policyPackRef", "PolicyPackRef | null", "Must be non-null. Carries id and version. (INV-01)"],
    ["provenanceRef", "ProvenanceRef | null", "Must be non-null with modelVersion, ruleSetVersion, and sourceHash all non-empty. (INV-02)"],
    ["approvalRequired", "boolean", "Caller-supplied flag. Some workflows override this to true unconditionally."],
    ["approvalArtifact", "ApprovalArtifact | null", "Must be present and valid when approval is required (INV-03)."],
    ["loggingReady", "boolean", "Must be true. Prevents actions without an active audit trail (INV-04)."],
    ["controlStatus", "ControlStatus", "Contains criticalControlsValid and stale. Checked for sensitive requests (INV-08)."],
    ["trustState", "TrustState", "Contains trusted flag. Must be true (INV-09)."],
    ["createdAt", "string", "ISO 8601 timestamp. Validated against approvalArtifact.approvedAt (INV-03)."],
  ].forEach(([field, type, desc]) => {
    ensureY(16);
    doc.fillColor(C.navy).font("Courier").fontSize(8)
      .text(field, ML, doc.y, { continued: true, lineBreak: false, width: 130 });
    doc.fillColor(C.blue).font("Courier").fontSize(8)
      .text("  " + type, { continued: true, lineBreak: false, width: 110 });
    doc.fillColor(C.black).font("Helvetica").fontSize(8)
      .text("  " + desc, { width: CW - 250, lineGap: 1.5 });
  });

  h1("DecisionEnvelope  ·  Immutable gate output");
  para("Registered in the module-private WeakSet immediately after construction. Cannot be constructed outside evaluate().", C.mid, 8.5);
  [
    ["envelopeId", "string", "Deterministic: 'env_' + requestId"],
    ["requestId", "string", "Back-reference to the originating request"],
    ["workflowClass", "WorkflowClass", "Echoed from the request"],
    ["finalState", "DecisionState", "ALLOW | HOLD | REJECT — the gate's verdict"],
    ["permittedActionClass", "ActionClass | null", "Set on ALLOW; null on HOLD or REJECT"],
    ["humanApprovalRequired", "boolean", "Echoed from request.approvalRequired"],
    ["humanApprovalPresent", "boolean", "True if approvalArtifact was present and valid"],
    ["proposalSourceKind", "ProposalSourceKind", "Echoed from request.proposal.proposalSourceKind"],
    ["immutable", "true", "Literal type — always true, cannot be false"],
    ["evidenceBundleId", "string", "Deterministic: 'evidence_' + requestId"],
    ["trace.checkedInvariants", "InvariantCode[]", "Every INV code checked during this evaluation"],
    ["trace.reasonCodes", "ReasonCode[]", "Trigger code + terminal code (DECISION_ALLOWED / HELD / REJECTED)"],
    ["trace.evaluatedAt", "string", "ISO timestamp of gate evaluation"],
    ["issuedAt", "string", "ISO timestamp — when the envelope was issued"],
  ].forEach(([field, type, desc]) => {
    ensureY(16);
    doc.fillColor(C.navy).font("Courier").fontSize(8)
      .text(field, ML, doc.y, { continued: true, lineBreak: false, width: 130 });
    doc.fillColor(C.blue).font("Courier").fontSize(8)
      .text("  " + type, { continued: true, lineBreak: false, width: 110 });
    doc.fillColor(C.black).font("Helvetica").fontSize(8)
      .text("  " + desc, { width: CW - 250, lineGap: 1.5 });
  });

  h1("ApprovalArtifact  ·  Human approval record");
  [
    ["approvalId", "string", "Unique identifier for this approval record"],
    ["approverId", "string", "Human reviewer identity (opaque string)"],
    ["forRequestId", "string", "Must equal GovernedRequest.requestId — prevents cross-request reuse (INV-03 Fix 1)"],
    ["approverAuthorityClass", "HumanAuthorityClass", "Must be analyst | reviewer | manager | compliance_officer"],
    ["privilegedAuthSatisfied", "boolean", "Must be true — confirms the approver used privileged authentication"],
    ["immutableSignature", "string", "Non-empty signature string — empty string triggers REJECT (INV-03)"],
    ["approvedAt", "string", "ISO timestamp — must be >= request.createdAt (earlier timestamp = forged artifact)"],
  ].forEach(([field, type, desc]) => {
    ensureY(16);
    doc.fillColor(C.navy).font("Courier").fontSize(8)
      .text(field, ML, doc.y, { continued: true, lineBreak: false, width: 130 });
    doc.fillColor(C.blue).font("Courier").fontSize(8)
      .text("  " + type, { continued: true, lineBreak: false, width: 110 });
    doc.fillColor(C.black).font("Helvetica").fontSize(8)
      .text("  " + desc, { width: CW - 250, lineGap: 1.5 });
  });

  h1("EvidenceBundle  ·  Full decision snapshot  ·  src/domain/types/audit.ts");
  [
    ["evidenceBundleId", "string", "Matches decisionEnvelope.evidenceBundleId"],
    ["request", "GovernedRequest", "Deep-cloned original request — no shared reference"],
    ["decisionEnvelope", "DecisionEnvelope", "Deep-cloned envelope — no shared reference"],
    ["releaseAuthorization", "ReleaseAuthorization | null", "Present on ALLOW; null on HOLD/REJECT"],
    ["blockedActionRecord", "BlockedActionRecord | null", "Present on HOLD/REJECT; null on ALLOW"],
    ["eventChain", "AuditLogEntry[]", "All log entries for this requestId in insertion order"],
    ["createdAt", "string", "ISO timestamp of bundle creation"],
  ].forEach(([field, type, desc]) => {
    ensureY(16);
    doc.fillColor(C.navy).font("Courier").fontSize(8)
      .text(field, ML, doc.y, { continued: true, lineBreak: false, width: 130 });
    doc.fillColor(C.blue).font("Courier").fontSize(8)
      .text("  " + type, { continued: true, lineBreak: false, width: 110 });
    doc.fillColor(C.black).font("Helvetica").fontSize(8)
      .text("  " + desc, { width: CW - 250, lineGap: 1.5 });
  });

  h1("AuditLogEntry  ·  Hash-chained audit record");
  [
    ["eventId", "string", "Unique entry identifier"],
    ["requestId", "string", "Which request this event belongs to"],
    ["eventType", "AuditEventType", "REQUEST_EVALUATED | RELEASE_AUTHORIZED | ACTION_BLOCKED | EVIDENCE_BUNDLE_CREATED | EXPORT_MANIFEST_CREATED"],
    ["timestamp", "string", "ISO timestamp of event recording"],
    ["payloadHash", "string", "SHA-256 of the event payload JSON"],
    ["previousHash", "string | null", "null for genesis entry; entryHash of the previous entry otherwise"],
    ["entryHash", "string", "SHA-256 of (payloadHash + '|' + previousHash + '|' + timestamp)"],
  ].forEach(([field, type, desc]) => {
    ensureY(16);
    doc.fillColor(C.navy).font("Courier").fontSize(8)
      .text(field, ML, doc.y, { continued: true, lineBreak: false, width: 130 });
    doc.fillColor(C.blue).font("Courier").fontSize(8)
      .text("  " + type, { continued: true, lineBreak: false, width: 110 });
    doc.fillColor(C.black).font("Helvetica").fontSize(8)
      .text("  " + desc, { width: CW - 250, lineGap: 1.5 });
  });

  footer();
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3 — Invariant Registry
// ═══════════════════════════════════════════════════════════════════════════
function sec3(): void {
  sectionBar("3", "Invariant Registry — INV-01 through INV-12");

  para(
    "Invariants are the non-negotiable rules of the system. Every check runs on every evaluate() call. " +
    "A failed invariant throws a CerbaSealError that produces a controlled HOLD or REJECT — there is no " +
    "path to ALLOW that skips any invariant. All 12 have explicit test coverage (verified by " +
    "pnpm check:invariants, run as part of pnpm audit:repo).",
    C.mid, 8.5
  );
  doc.moveDown(0.3);

  const invs = [
    {
      id: "INV-01", name: "NO_POLICY_PACK_NO_EXECUTION",
      outcome: "REJECT", code: "NO_POLICY_PACK",
      trigger: "request.policyPackRef === null",
      desc: "Every governed request must carry a reference to the policy pack under which it operates. Without a policy pack there is no basis for determining which rules govern the action — the gate has no mandate to permit anything.",
      fix: "—",
      test: "execution-gate-service.test.ts — 'rejects when no policy pack'",
    },
    {
      id: "INV-02", name: "NO_PROVENANCE_NO_ACTION",
      outcome: "REJECT", code: "NO_PROVENANCE",
      trigger: "provenanceRef === null  OR  any of modelVersion / ruleSetVersion / sourceHash is empty string",
      desc: "Full provenance (model version, rule set version, source hash) is required. Without it the decision cannot be audited or replayed deterministically. An empty string in any field is treated as missing.",
      fix: "—",
      test: "execution-gate-service.test.ts — 'rejects when no provenance'",
    },
    {
      id: "INV-03", name: "NO_REQUIRED_APPROVAL_NO_RELEASE",
      outcome: "HOLD (missing)  ·  REJECT (invalid/forged)",
      code: "REQUIRED_APPROVAL_MISSING / INVALID_APPROVAL_AUTHORITY / PRIVILEGED_AUTH_NOT_SATISFIED / APPROVAL_SIGNATURE_MISSING",
      trigger: "effectiveApprovalRequired && (artifact null OR artifact invalid)",
      desc: "When approval is required — either by the caller flag OR by the workflow class (e.g. fraud_triage always requires approval regardless of the flag) — no ALLOW is issued unless a valid ApprovalArtifact is present. The artifact is validated on five dimensions: (1) forRequestId must equal requestId, (2) approvedAt must be >= request.createdAt, (3) approverAuthorityClass must be a valid HumanAuthorityClass, (4) privilegedAuthSatisfied must be true, (5) immutableSignature must be non-empty.",
      fix: "Fix 1: request-binding check (forRequestId). Fix 2: WORKFLOWS_REQUIRING_APPROVAL set. Phase 6: timestamp anti-replay check.",
      test: "execution-gate-service.test.ts — approval binding, timestamp, and forgery suites",
    },
    {
      id: "INV-04", name: "NO_LOGGING_NO_EXECUTION",
      outcome: "REJECT", code: "LOGGING_NOT_READY",
      trigger: "request.loggingReady === false",
      desc: "Before any action is released, the logging subsystem must be confirmed ready. Acting without an active audit trail is a governance failure — the gate will not permit it.",
      fix: "—",
      test: "execution-gate-service.test.ts — 'rejects when logging not ready'",
    },
    {
      id: "INV-05", name: "AI_NON_AUTHORITATIVE",
      outcome: "REJECT", code: "AI_CANNOT_AUTHORIZE",
      trigger: "proposal.authorityBearing === true  OR  (actorAuthorityClass === 'ai' AND proposalSourceKind === 'ai')",
      desc: "AI actors are proposal-only in two independent checks. Check A: if proposal.authorityBearing is true, REJECT — regardless of actor class. Check B: if the actor is 'ai' AND the proposal source is 'ai', REJECT — regardless of approvalRequired. Fix 4 closed a prior bypass where setting approvalRequired: false allowed an AI actor through check B.",
      fix: "Fix 4: removed approvalRequired condition from AI authority check. The approval flag is irrelevant to whether AI has execution authority.",
      test: "security/misuse-scenarios.test.ts, adversarial-integrity.test.ts",
    },
    {
      id: "INV-06", name: "NO_BYPASS_OF_EXECUTION_GATE",
      outcome: "REJECT (thrown by assertIsGateIssued)", code: "MALFORMED_REQUEST",
      trigger: "EvidenceBundleService.createBundle() called with a GateResult not in _gateIssuedResults WeakSet",
      desc: "A module-private WeakSet (_gateIssuedResults) is populated only inside ExecutionGateService.evaluate(). EvidenceBundleService calls assertIsGateIssued() before accepting any result. A caller who constructs their own GateResult cannot add it to the WeakSet — the set is never exported and the reference is not accessible outside the module.",
      fix: "Fix 3: WeakSet introduced to close the path where a caller self-constructs a GateResult and feeds it directly to the evidence layer.",
      test: "security/non-forgery.test.ts — 'rejects self-constructed gate result'",
    },
    {
      id: "INV-07", name: "IMMUTABLE_DECISION_ENVELOPE",
      outcome: "Structural guarantee", code: "N/A",
      trigger: "Always — structural enforcement on every ALLOW/HOLD/REJECT path",
      desc: "DecisionEnvelope carries immutable: true as a TypeScript literal type. EvidenceBundleService deep-clones all objects before returning them. The envelope is never mutated after construction. This invariant is explicitly pushed to checkedInvariants[] on every path including ALLOW — it is always true.",
      fix: "—",
      test: "execution-gate-service.test.ts — immutable flag assertions across all paths",
    },
    {
      id: "INV-08", name: "STALE_CONTROLS_BLOCK_SENSITIVE_RELEASE",
      outcome: "REJECT", code: "CONTROL_STALE_OR_INVALID",
      trigger: "request.sensitive === true  AND  (controlStatus.stale === true OR controlStatus.criticalControlsValid === false)",
      desc: "For sensitive requests (e.g. high-value transactions, cross-border payments), the control status must be both current (not stale) and valid (critical controls passing). This prevents time-sensitive compliance controls — such as sanction list checks or credit limit verifications — from being bypassed by using an old control state.",
      fix: "—",
      test: "execution-gate-service.test.ts — stale controls tests",
    },
    {
      id: "INV-09", name: "TRUST_STATE_REQUIRED",
      outcome: "REJECT", code: "TRUST_STATE_INVALID",
      trigger: "request.trustState.trusted === false",
      desc: "Every request must carry a valid trust state. If the system's trust evaluation has determined the request context is not trusted (e.g. flagged actor, revoked credentials, anomalous pattern), the gate rejects unconditionally — before approval state is even checked.",
      fix: "—",
      test: "execution-gate-service.test.ts — 'rejects invalid trust state'",
    },
    {
      id: "INV-10", name: "PROHIBITED_USE_MUST_BLOCK",
      outcome: "REJECT", code: "PROHIBITED_USE",
      trigger: "request.prohibitedUse === true",
      desc: "If the request has been flagged as prohibited use — e.g. sanctioned jurisdiction, restricted action type, policy exclusion — the gate rejects unconditionally. This check runs after trust state but before approval state to ensure compliance blocks are absolute and cannot be overridden by providing an approval artifact.",
      fix: "—",
      test: "execution-gate-service.test.ts — 'rejects prohibited use'",
    },
    {
      id: "INV-11", name: "REQUEST_SCHEMA_AND_ACTION_CLASS_VALID",
      outcome: "REJECT", code: "MALFORMED_REQUEST / UNKNOWN_ACTION_CLASS",
      trigger: "requestId/jurisdiction/createdAt empty  |  proposal.reasonCodes empty  |  unknown action class  |  unknown authority class",
      desc: "Shape validation runs first, before any semantic checks. Catches: empty required string fields (requestId, jurisdiction, createdAt), empty proposal.reasonCodes[], unknown action classes (proposedActionClass or proposal.requestedActionClass not in ALLOWED_ACTION_CLASSES set), unknown authority classes (actorAuthorityClass not in allowedAuthorityClasses set). TypeScript enforces these at compile time; this check closes the runtime gap for JavaScript or JSON-deserialized callers.",
      fix: "Fix 7: requestId non-empty validation added. Phase 5: runtime authority class validation added.",
      test: "execution-gate-service.test.ts — schema validation suite; security/contextual-boundary.test.ts",
    },
    {
      id: "INV-12", name: "PROPOSAL_AND_REQUEST_ACTION_MUST_MATCH",
      outcome: "REJECT", code: "INVALID_PROPOSAL",
      trigger: "request.proposedActionClass !== request.proposal.requestedActionClass",
      desc: "The action class at the request level and the action class inside the proposal must be identical. This prevents a request from claiming one action type externally while the proposal contains a different action type — a potential vector for action-class confusion attacks where the outer request claims 'allow' but the proposal specifies 'escalate'.",
      fix: "—",
      test: "execution-gate-service.test.ts — 'rejects mismatched action classes'",
    },
  ];

  invs.forEach((inv) => {
    ensureY(90);
    doc.moveDown(0.5);

    // Header bar
    const headerY = doc.y;
    const headerH = 22;
    const outcomeColor = inv.outcome.startsWith("REJECT") ? C.redBg
      : inv.outcome.startsWith("HOLD") ? C.amberBg
      : C.light;
    doc.rect(ML, headerY, CW, headerH).fill(outcomeColor);
    doc.rect(ML, headerY, 52, headerH).fill(C.navy);

    doc.fillColor(C.white).font("Helvetica-Bold").fontSize(9)
      .text(inv.id, ML, headerY + 6, { width: 52, align: "center", lineBreak: false });

    const outcomeTextColor = inv.outcome.startsWith("REJECT") ? C.red
      : inv.outcome.startsWith("HOLD") ? C.amber : C.green;
    doc.fillColor(C.navy).font("Helvetica-Bold").fontSize(9)
      .text(inv.name, ML + 58, headerY + 3, { lineBreak: false });
    doc.fillColor(outcomeTextColor).font("Helvetica-Bold").fontSize(8)
      .text("→ " + inv.outcome, ML + 58, headerY + 13, { lineBreak: false });
    doc.y = headerY + headerH + 6;

    // Body
    doc.fillColor(C.black).font("Helvetica").fontSize(8.5)
      .text(inv.desc, ML + 4, doc.y, { width: CW - 8, lineGap: 2 });
    doc.moveDown(0.2);
    kv("Trigger", inv.trigger);
    kv("Reason code(s)", inv.code);
    if (inv.fix !== "—") kv("Fixes applied", inv.fix);
    kv("Test reference", inv.test);

    rule();
  });

  footer();
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4 — Reason Codes
// ═══════════════════════════════════════════════════════════════════════════
function sec4(): void {
  sectionBar("4", "Reason Code Registry — All 18 Codes");

  para(
    "Reason codes appear in DecisionEnvelope.trace.reasonCodes[]. Every decision carries at least one code. " +
    "HOLD and REJECT decisions always include a terminal code (DECISION_HELD or DECISION_REJECTED) in addition " +
    "to the trigger code. All codes are defined in src/domain/constants/reason-codes.ts.",
    C.mid, 8.5
  );
  doc.moveDown(0.3);

  table(
    ["Reason Code", "Final State", "Invariant", "Meaning"],
    [
      ["DECISION_ALLOWED", "ALLOW", "—", "All checks passed. Action is released via ReleaseAuthorization."],
      ["DECISION_HELD", "HOLD", "—", "Terminal suffix emitted on all HOLD outcomes."],
      ["DECISION_REJECTED", "REJECT", "—", "Terminal suffix emitted on all REJECT outcomes."],
      ["NO_POLICY_PACK", "REJECT", "INV-01", "policyPackRef is null — no policy basis for execution."],
      ["NO_PROVENANCE", "REJECT", "INV-02", "provenanceRef is null or modelVersion / ruleSetVersion / sourceHash is empty."],
      ["REQUIRED_APPROVAL_MISSING", "HOLD", "INV-03", "Approval is required (by flag or workflow class) but approvalArtifact is null."],
      ["INVALID_APPROVAL_AUTHORITY", "REJECT", "INV-03", "Artifact bound to wrong requestId, invalid authority class, or approvedAt predates request.createdAt."],
      ["PRIVILEGED_AUTH_NOT_SATISFIED", "REJECT", "INV-03", "privilegedAuthSatisfied is false on the approval artifact."],
      ["APPROVAL_SIGNATURE_MISSING", "REJECT", "INV-03", "immutableSignature is an empty string on the approval artifact."],
      ["LOGGING_NOT_READY", "REJECT", "INV-04", "loggingReady is false on the request."],
      ["AI_CANNOT_AUTHORIZE", "REJECT", "INV-05", "AI actor attempted self-authorization, or proposal.authorityBearing is true."],
      ["PROHIBITED_USE", "REJECT", "INV-10", "request.prohibitedUse is true."],
      ["CONTROL_STALE_OR_INVALID", "REJECT", "INV-08", "Sensitive request with controlStatus.stale true or criticalControlsValid false."],
      ["TRUST_STATE_INVALID", "REJECT", "INV-09", "request.trustState.trusted is false."],
      ["UNKNOWN_ACTION_CLASS", "REJECT", "INV-11", "proposedActionClass or proposal.requestedActionClass is not a known ActionClass."],
      ["MALFORMED_REQUEST", "REJECT", "INV-11 / INV-06", "Empty required field, self-constructed GateResult, or non-ISO timestamp."],
      ["INVALID_PROPOSAL", "REJECT", "INV-12", "proposedActionClass does not identically match proposal.requestedActionClass."],
      ["AI_CANNOT_AUTHORIZE (auth-bearing)", "REJECT", "INV-05", "proposal.authorityBearing is true — applies regardless of actor class."],
    ],
    [145, 58, 60, CW - 263]
  );

  footer();
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5 — Execution Gate Service
// ═══════════════════════════════════════════════════════════════════════════
function sec5(): void {
  sectionBar("5", "Execution Gate Service — Full Logic Flow");

  h1("evaluate(request: GovernedRequest): GateResult");
  para(
    "This is the single mandatory entry point for all governed actions. The method runs a strict " +
    "ordered sequence of invariant assertions. The first failure short-circuits evaluation and " +
    "produces a controlled HOLD or REJECT result. On success (all 14 steps pass), ALLOW is issued " +
    "and registered in the module-private WeakSet."
  );

  h2("Evaluation Sequence (strict order)");
  table(
    ["Step", "Function", "INV", "On Fail", "What Is Checked"],
    [
      ["1", "assertRequestShape()", "INV-11", "REJECT", "requestId, jurisdiction, createdAt non-empty; proposal.reasonCodes non-empty"],
      ["2", "assertActorAuthorityClass()", "INV-11", "REJECT", "actorAuthorityClass in allowedAuthorityClasses set (runtime check — closes untyped caller gap)"],
      ["3", "assertKnownActionClass(proposedActionClass)", "INV-11", "REJECT", "Must be one of: allow | hold | reject | escalate | account_hold"],
      ["4", "assertKnownActionClass(proposal.requestedActionClass)", "INV-11", "REJECT", "Same check applied to the proposal-side action class"],
      ["5", "Action class match", "INV-12", "REJECT", "proposedActionClass must identically equal proposal.requestedActionClass"],
      ["6", "assertPolicyPack()", "INV-01", "REJECT", "policyPackRef must be non-null"],
      ["7", "assertProvenance()", "INV-02", "REJECT", "provenanceRef non-null; all three fields non-empty strings"],
      ["8", "assertLoggingReady()", "INV-04", "REJECT", "loggingReady must be true"],
      ["9", "assertProposalBoundary()", "INV-05", "REJECT", "Not authority-bearing; AI actor + AI proposal = REJECT (unconditional)"],
      ["10", "assertProhibitedUse()", "INV-10", "REJECT", "prohibitedUse must be false"],
      ["11", "assertControlStatus()", "INV-08", "REJECT", "Sensitive: controls current and valid"],
      ["12", "assertTrustState()", "INV-09", "REJECT", "trustState.trusted must be true"],
      ["13", "assertApprovalState()", "INV-03", "HOLD / REJECT", "Effective approval required? Artifact present, bound, timestamped, signed, valid authority class?"],
      ["14", "buildDecisionEnvelope(ALLOW)", "INV-07", "ALLOW", "Construct immutable envelope; add to WeakSet; build ReleaseAuthorization; return GateResult"],
    ],
    [28, 128, 42, 55, CW - 253]
  );

  h2("Error Handling — Fail-Closed Guarantee");
  para("The try/catch at the top of evaluate() guarantees two things:");
  bul("CerbaSealError (expected failures): produces a clean DecisionEnvelope with the error's finalState (HOLD or REJECT), the trigger reason code, and the terminal suffix code (DECISION_HELD or DECISION_REJECTED).");
  bul("Non-CerbaSealError (unexpected exceptions): converted to a REJECT DecisionEnvelope with MALFORMED_REQUEST + DECISION_REJECTED codes. If even this fallback fails (the request is too broken to read), the original error is re-thrown — still fail-closed at the caller boundary, never silently allowing.");

  h2("Deterministic IDs");
  code([
    "envelopeId          =  'env_'      + requestId",
    "evidenceBundleId    =  'evidence_' + requestId",
    "releaseAuthId       =  'release_'  + requestId",
  ], "All IDs are deterministic — replay produces the same identifiers for the same requestId");

  h2("WORKFLOWS_REQUIRING_APPROVAL — Unconditional Override");
  para(
    "Certain workflow classes require human approval unconditionally regardless of the caller-supplied " +
    "approvalRequired flag. The caller cannot opt out by setting approvalRequired: false."
  );
  code([
    "// src/services/execution/execution-gate-service.ts",
    "const WORKFLOWS_REQUIRING_APPROVAL = new Set<WorkflowClass>([",
    "  'fraud_triage'   // approval always required; caller flag is treated as advisory only",
    "]);",
    "",
    "// In assertApprovalState():",
    "const effectiveApprovalRequired =",
    "  request.approvalRequired || WORKFLOWS_REQUIRING_APPROVAL.has(request.workflowClass);",
  ]);

  h2("assertIsGateIssued() — Bypass Prevention (INV-06)");
  code([
    "// Module-private WeakSet — never exported, never accessible outside this file",
    "const _gateIssuedResults = new WeakSet<object>();",
    "",
    "// Registered only inside evaluate() on every outcome path (ALLOW, HOLD, REJECT)",
    "_gateIssuedResults.add(result);",
    "",
    "// Called by EvidenceBundleService before accepting any GateResult",
    "export function assertIsGateIssued(result: GateResult): void {",
    "  if (!_gateIssuedResults.has(result)) {",
    "    throw new CerbaSealError({ ..., finalState: 'REJECT' });",
    "  }",
    "}",
  ]);

  footer();
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 6 — Authority Class System
// ═══════════════════════════════════════════════════════════════════════════
function sec6(): void {
  sectionBar("6", "Authority Class System & Runtime Configuration");

  h1("Core Authority Classes");
  table(
    ["Class", "Kind", "Can propose?", "Can authorize?", "Notes"],
    [
      ["system", "System actor", "Yes", "Yes (non-AI path)", "Internal system processes, deterministic rules"],
      ["ai", "AI actor", "Yes — proposal only", "NEVER", "INV-05: AI actor + AI proposal = unconditional REJECT"],
      ["analyst", "Human approver", "Yes", "Yes (as approver)", "HumanAuthorityClass — valid approval authority"],
      ["reviewer", "Human approver", "Yes", "Yes (as approver)", "HumanAuthorityClass — valid approval authority"],
      ["manager", "Human approver", "Yes", "Yes (as approver)", "HumanAuthorityClass — valid approval authority"],
      ["compliance_officer", "Human approver", "Yes", "Yes (as approver)", "Highest human authority class"],
    ],
    [90, 80, 70, 70, CW - 310]
  );

  h1("Runtime Extensibility — cerbaseal.config.json");
  para(
    "New client-specific authority classes (e.g. 'risk_officer', 'supervisor', 'credit_committee') are " +
    "added to cerbaseal.config.json. No TypeScript source code changes are required. The config is " +
    "loaded at ExecutionGateService construction time via loadCerbaSealConfig()."
  );
  code([
    "// cerbaseal.config.json (current state — extended arrays are empty)",
    "{",
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
    '}',
  ]);

  h2("src/config/cerbaseal-config.ts — API Surface");
  code([
    "interface GateConfig {",
    "  additionalAuthorityClasses?: string[];",
    "}",
    "",
    "// Reads cerbaseal.config.json from process.cwd().",
    "// Returns { additionalAuthorityClasses: config.authorityClasses.extended }.",
    "// Falls back to {} if file not found (core classes only).",
    "function loadCerbaSealConfig(): GateConfig",
    "",
    "// Returns ReadonlySet<string> = CORE_AUTHORITY_CLASSES ∪ additionalAuthorityClasses",
    "function buildAllowedAuthorityClasses(config?: GateConfig): ReadonlySet<string>",
  ]);

  h2("Usage Patterns");
  code([
    "// Pattern 1: Default — core classes only (all existing tests unchanged)",
    "const gate = new ExecutionGateService();",
    "",
    "// Pattern 2: Inline extension",
    "const gate = new ExecutionGateService({",
    "  additionalAuthorityClasses: ['risk_officer', 'supervisor']",
    "});",
    "",
    "// Pattern 3: From cerbaseal.config.json",
    "import { loadCerbaSealConfig } from './src/config/cerbaseal-config.js';",
    "const gate = new ExecutionGateService(loadCerbaSealConfig());",
  ]);

  footer();
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 7 — Audit & Evidence Pipeline
// ═══════════════════════════════════════════════════════════════════════════
function sec7(): void {
  sectionBar("7", "Audit & Evidence Pipeline");

  h1("IAuditLogService Interface");
  code([
    "// src/services/audit/append-only-log-service.ts",
    "interface IAuditLogService {",
    "  append(event: AuditEventPayload): AuditLogEntry;   // write — no delete or update",
    "  list(): AuditLogEntry[];                           // returns deep-cloned copy",
    "  listByRequestId(requestId: string): AuditLogEntry[];",
    "  verifyChain(): boolean;                            // re-computes all hashes",
    "}",
  ]);

  h2("AppendOnlyLogService (in-memory)");
  para(
    "Stores entries in a private array. Returns deep-cloned copies from all read methods — " +
    "callers cannot mutate the internal log state. Suitable for development and short-lived processes."
  );

  h2("FileBackedAppendOnlyLogService (persistent)");
  para(
    "Same IAuditLogService interface. Writes every entry as a newline-delimited JSON record (JSONL) " +
    "to a file path specified at construction using appendFileSync (synchronous — every write is durable). " +
    "On construction, reads existing entries from the file to restore state and verifies chain integrity. " +
    "Used by the fraud-workflow-starter and any production deployment requiring durable audit logs."
  );
  code([
    "// Creates the file if it does not exist. Reads and restores state on construction.",
    "const log = new FileBackedAppendOnlyLogService('./audit/fraud-triage.jsonl');",
  ]);

  h1("Hash Chain Construction  ·  audit-hash-utils.ts");
  para("Three SHA-256 hashes per entry, computed using Node.js built-in crypto module:");
  code([
    "payloadHash  =  SHA256( JSON.stringify(eventPayload) )",
    "previousHash =  entryHash of the previous entry  (null string 'genesis' for first entry)",
    "entryHash    =  SHA256( payloadHash + '|' + previousHash + '|' + timestamp )",
    "",
    "// verifyChain() re-computes every entryHash from scratch and checks:",
    "// (a) computed hash matches stored hash  (b) previousHash matches prior entry's entryHash",
    "// Returns false on any mismatch — detects tampering, deletion, or reordering.",
  ]);

  h1("Events Written Per Request  ·  EvidenceBundleService");
  table(
    ["Event Type", "When Written", "Key Payload Fields"],
    [
      ["REQUEST_EVALUATED", "Always — on every evaluate() call", "requestId, finalState, envelopeId"],
      ["RELEASE_AUTHORIZED", "On ALLOW only", "requestId, releaseAuthorizationId, actionClass"],
      ["ACTION_BLOCKED", "On HOLD or REJECT", "requestId, finalState, reasonCodes[]"],
      ["EVIDENCE_BUNDLE_CREATED", "Always — after the above events", "requestId, evidenceBundleId"],
    ],
    [140, 150, CW - 290]
  );

  h1("EvidenceBundleService.createBundle() — Full Flow");
  [
    "1. Call assertIsGateIssued(gateResult) — throws CerbaSealError if result not in WeakSet (INV-06)",
    "2. Append REQUEST_EVALUATED event to audit log",
    "3. If releaseAuthorization present: append RELEASE_AUTHORIZED event",
    "4. If blockedActionRecord present: append ACTION_BLOCKED event",
    "5. Append EVIDENCE_BUNDLE_CREATED event",
    "6. Call logService.listByRequestId(requestId) — retrieve the full event chain for this request",
    "7. Assemble EvidenceBundle with deep-clones of all objects (no shared references to internal state)",
    "8. Return a deep-clone of the bundle — double-cloned to prevent any mutation of internal log state",
  ].forEach((s) => bul(s));

  h1("ExportManifestService");
  para(
    "Creates a point-in-time snapshot of evidence hashes for external transfer. The manifest " +
    "captures sourceEventHashes[] (one per AuditLogEntry) but does not include the request payload — " +
    "suitable for sharing with parties who need proof of decision without the underlying data."
  );
  code([
    "interface ExportManifest {",
    "  manifestId: string;",
    "  evidenceBundleId: string;",
    "  requestId: string;",
    "  envelopeId: string;",
    "  exportedAt: string;",
    "  exportType: 'authority_package';",
    "  sourceEventHashes: string[];       // one hash per AuditLogEntry",
    "  sourceEvidenceImmutable: true;     // literal type — always true",
    "}",
  ]);

  footer();
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 8 — Supporting Services
// ═══════════════════════════════════════════════════════════════════════════
function sec8(): void {
  sectionBar("8", "Supporting Services");

  h1("ReplayService  ·  src/services/replay/");
  para(
    "Takes a past EvidenceBundle and re-runs the original GovernedRequest through a fresh " +
    "ExecutionGateService instance. Compares replayed finalState against original finalState. " +
    "Used to verify: (a) the gate is deterministic, (b) logic has not drifted since the original " +
    "decision, (c) the evidence bundle faithfully represents what happened."
  );
  code([
    "interface ReplayResult {",
    "  originalRequestId: string;",
    "  originalEnvelopeId: string;",
    "  replayedFinalState: 'ALLOW' | 'HOLD' | 'REJECT';",
    "  replayedPermittedActionClass: string | null;",
    "  matchedOriginalOutcome: boolean;   // true iff replayedFinalState === original finalState",
    "  replayedAt: string;",
    "}",
  ]);

  h1("DiagnosticReportService  ·  src/services/diagnostics/");
  para(
    "Generates a structured operator-facing diagnostic report from an EvidenceBundle. Includes " +
    "system state snapshot, invariant check summary, recommended actions (e.g. 'obtain human approval', " +
    "'check control status'), and a risk assessment. Used by the browser-demo support-readiness view."
  );
  code([
    "interface DiagnosticReport {",
    "  reportId: string;",
    "  evidenceBundleId: string;",
    "  systemState: SystemState;",
    "  invariantSummary: InvariantCheckSummary[];",
    "  recommendations: string[];",
    "  riskAssessment: string;",
    "  generatedAt: string;",
    "}",
  ]);

  h1("SystemHealthService  ·  src/services/support/");
  para(
    "Checks system preconditions: logging ready, control status valid, trust state valid, " +
    "audit chain integrity. Returns a HealthReport with individual check results and an overall status. " +
    "Used by the /health route in the REST API starter kit."
  );

  h1("SystemIntegrityService  ·  src/services/support/");
  para(
    "Runs integrity checks across the audit log chain. Verifies all entries are chain-linked, " +
    "no gaps exist, and hash values are consistent. Used as a background health check and on " +
    "export to confirm evidence is untampered before sharing."
  );

  h1("OperatorActionService  ·  src/services/support/");
  para(
    "Provides operator-level actions: acknowledge a blocked decision, escalate a held request, " +
    "request re-evaluation, generate a support ticket. All actions are recorded to the audit log."
  );

  h1("CertificateFormatter  ·  src/domain/formatters/");
  para(
    "Generates a human-readable governance certificate from an EvidenceBundle. Used by the " +
    "auditor-view example to render a printable compliance record showing the decision, " +
    "approver identity, invariants checked, and audit chain summary."
  );

  footer();
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 9 — Test Suite
// ═══════════════════════════════════════════════════════════════════════════
function sec9(): void {
  sectionBar("9", "Test Suite — 16 Files, 415 Tests");

  para(
    "All tests run with Vitest 2.1. Full suite completes in ~7.7 seconds. " +
    "Zero mocks of the enforcement core — every test uses real ExecutionGateService instances.",
    C.mid, 8.5
  );
  doc.moveDown(0.3);

  table(
    ["Test File", "~Tests", "Coverage Focus"],
    [
      ["test/execution-gate-service.test.ts", "~120", "All 12 invariants; every ALLOW/HOLD/REJECT path; approval binding; timestamp validation; authority class validation; schema edge cases"],
      ["test/adversarial-integrity.test.ts", "~18", "Advanced attack scenarios: approval replay across requests, cross-request binding, AI authority escalation, malformed envelope injection"],
      ["test/audit-evidence-export.test.ts", "~30", "AppendOnlyLogService chain construction and verification; EvidenceBundleService assembly; ExportManifestService output structure"],
      ["test/persistent-audit-log.test.ts", "~20", "FileBackedAppendOnlyLogService: write, read-back, chain verify across restarts, multi-request interleaving"],
      ["test/diagnostic-report-service.test.ts", "~18", "DiagnosticReportService output structure; recommendation generation for each failure mode; risk assessment accuracy"],
      ["test/snapshots/enforcement-loop.snapshot.test.ts", "~8", "Full ALLOW/HOLD/REJECT flows serialized to snapshots and compared across runs — detects output shape changes"],
      ["test/security/fail-closed.test.ts", "2", "Unexpected non-CerbaSealError exceptions produce REJECT — the gate never silently allows on error"],
      ["test/security/non-forgery.test.ts", "2", "Self-constructed GateResult is rejected by assertIsGateIssued() — WeakSet bypass prevention (INV-06)"],
      ["test/security/misuse-scenarios.test.ts", "~15", "AI self-authorization; authority-bearing proposals; approval authority class forgery; privilege escalation attempts"],
      ["test/security/contextual-boundary.test.ts", "~12", "Boundary cases: empty strings, null fields, zero-length arrays, whitespace-only values, ISO timestamp edge cases"],
      ["test/integration/full-flow.test.ts", "1", "End-to-end: request → evaluate → evidence bundle → replay → verify chain — single comprehensive flow test"],
      ["test/integration/system-integration.test.ts", "1", "Full stack integration: gate + audit + evidence + diagnostic + health check + export"],
      ["test/integration/browser-demo-routes.test.ts", "~40", "All 9 demo HTTP server routes respond 200 with correct JSON structure and scenario outcomes"],
      ["test/integration/review-portal-routes.test.ts", "~40", "Review portal routes: /review, /pilot, /security, /deployment, /one-page — content assertions"],
      ["test/integration/support-readiness.test.ts", "~30", "Support readiness demo: all operator action scenarios, health check outcomes, diagnostic report structure"],
      ["test/integration/external-signal-examples.test.ts", "~34", "External signal injection: trust state overrides, control status variations, prohibited use, provenance permutations"],
    ],
    [175, 45, CW - 220]
  );

  h2("Test Commands");
  code([
    "pnpm test              # run all 415 tests once (~7.7s)",
    "pnpm test:watch        # watch mode — re-runs on file changes",
    "pnpm check:invariants  # verify 12/12 invariants have covering tests",
    "pnpm audit:repo        # run all 15 repo audit checks (includes test count verification)",
  ]);

  footer();
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 10 — Repo Audit
// ═══════════════════════════════════════════════════════════════════════════
function sec10(): void {
  sectionBar("10", "Repo Audit — 15 Checks Explained");

  para(
    "pnpm audit:repo runs scripts/repo-audit.ts — 15 automated checks that verify the repo is in " +
    "a releasable, self-consistent state. All 15 currently pass. The script exits non-zero on any failure.",
    C.mid, 8.5
  );
  doc.moveDown(0.3);

  table(
    ["#", "Check Name", "What It Verifies"],
    [
      ["1", "Full test suite passes", "Runs pnpm test — expects all 415 tests to pass with zero failures"],
      ["2", "TypeScript compiles without errors", "Runs tsc --noEmit — expects zero type errors across all source files"],
      ["3", "README anchor strings present", "Checks for 4 required anchor strings in README.md"],
      ["4", "All portal routes respond 200", "Starts the browser-demo HTTP server, requests all 9 routes, expects HTTP 200 on each"],
      ["5", "No src/ file unreferenced in tests or examples", "Every .ts file under src/ must appear in at least one test or example file"],
      ["6", "Invariant registry non-empty", "Loads src/domain/constants/invariants.ts — verifies 12 invariants are defined"],
      ["7", "Known-limitations section in README", "README.md must contain a '## Known Limitations' heading"],
      ["8", "Test count in README matches actual", "The '415 tests' claim in README must match the actual Vitest run count"],
      ["9", "demo:web:validate passes", "Runs examples/browser-demo/validate-demo.ts — all browser demo assertions pass"],
      ["10", "demo:support:validate passes", "Runs examples/support-readiness/validate-support-readiness.ts — 13 assertions pass"],
      ["11", "review:validate passes", "Runs examples/browser-demo/validate-review-portal.ts — 110 assertions pass"],
      ["12", "No import boundary violations", "Runs scripts/check-imports.ts — 0 violations across 79 files scanned"],
      ["13", "All invariants linked to covering tests", "Runs scripts/check-invariant-coverage.ts — 12/12 invariants have test coverage"],
      ["14", "No stale test-count references in docs", "All documentation references to test counts match the actual current count"],
      ["15", "Pilot documents exist with required sections", "3 pilot documents verified for required section headings"],
    ],
    [22, 155, CW - 177]
  );

  h2("Import Boundary Rules  ·  scripts/check-imports.ts");
  para("The following boundaries are enforced across all 79 scanned files:");
  [
    "examples/ and scripts/ must not import from test/",
    "src/ must not import from examples/, scripts/, or test/",
    "test/ must not import from examples/ or scripts/ (except for shared fixtures)",
    "No circular dependencies within src/services/",
  ].forEach((r) => bul(r));

  h2("Proof Snapshot  ·  scripts/export-proof.ts");
  para(
    "pnpm export:proof generates docs/reports/proof-snapshot.json — a signed manifest of the " +
    "repo state including test suite results, audit check results, invariant count, git commit hash, " +
    "branch, and a SHA-256 manifestChecksum of the manifest body. The snapshot can be independently " +
    "verified with pnpm verify:proof. The generate:evidence-report script reads this snapshot to " +
    "produce the compliance evidence package."
  );
  code([
    "pnpm export:proof              # generate docs/reports/proof-snapshot.json",
    "pnpm verify:proof              # verify the snapshot's manifestChecksum",
    "pnpm generate:evidence-report  # generate 3-file compliance evidence package",
  ]);

  footer();
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 11 — CLI Scripts
// ═══════════════════════════════════════════════════════════════════════════
function sec11(): void {
  sectionBar("11", "CLI Scripts & Commands");

  table(
    ["Script", "Entry File", "Purpose"],
    [
      ["pnpm test", "vitest", "Run all 415 tests"],
      ["pnpm test:watch", "vitest", "Watch mode — re-runs on file changes"],
      ["pnpm typecheck", "tsc --noEmit", "TypeScript type check without emitting JS"],
      ["pnpm demo", "examples/run-demo.ts", "Console demo of all gate scenarios"],
      ["pnpm demo:web", "examples/browser-demo/server.ts", "Start browser-based review portal (HTTP, reads $PORT)"],
      ["pnpm demo:web:validate", "examples/browser-demo/validate-demo.ts", "Assert all demo routes and scenario outcomes"],
      ["pnpm demo:consumer", "examples/consumer-example/consumer.ts", "Consumer pattern demo"],
      ["pnpm demo:consumer:validate", "examples/consumer-example/validate-consumer.ts", "Assert consumer demo outcomes"],
      ["pnpm demo:agent", "examples/agent-gate/run-agent-gate.ts", "AI agent gate demo"],
      ["pnpm demo:agent:validate", "examples/agent-gate/validate-agent-gate.ts", "Assert agent gate demo outcomes"],
      ["pnpm demo:audit", "examples/auditor-view/run-auditor-view.ts", "Auditor certificate view demo"],
      ["pnpm demo:audit:validate", "examples/auditor-view/validate-auditor-view.ts", "Assert auditor view outcomes"],
      ["pnpm demo:support", "examples/support-readiness/run-support-readiness.ts", "Support readiness demo"],
      ["pnpm demo:support:validate", "examples/support-readiness/validate-support-readiness.ts", "Assert support readiness outcomes (13 assertions)"],
      ["pnpm review:validate", "examples/browser-demo/validate-review-portal.ts", "Assert 110 review portal scenarios"],
      ["pnpm demo:all", "(all demos)", "Run all demos sequentially"],
      ["pnpm check:imports", "scripts/check-imports.ts", "Verify import boundary rules across 79 files"],
      ["pnpm check:invariants", "scripts/check-invariant-coverage.ts", "Verify 12/12 invariants have test coverage"],
      ["pnpm export:proof", "scripts/export-proof.ts", "Generate docs/reports/proof-snapshot.json with SHA-256 checksum"],
      ["pnpm verify:proof", "scripts/verify-proof.ts", "Verify proof-snapshot.json manifestChecksum"],
      ["pnpm audit:repo", "scripts/repo-audit.ts", "Run all 15 repo audit checks"],
      ["pnpm generate:pilot-config", "scripts/generate-pilot-config.ts", "Generate pilot config package from wizard-input.json"],
      ["pnpm generate:evidence-report", "scripts/generate-evidence-report.ts", "Generate evidence package from proof-snapshot.json"],
      ["pnpm generate:system-pdf", "scripts/generate-system-pdf.ts", "Generate this PDF"],
    ],
    [135, 170, CW - 305]
  );

  h2("generate:pilot-config — Output Files  ·  Written to pilot-config/");
  [
    ["cerbaseal-config.json", "Ready-to-use runtime config for the client's workflow and authority classes"],
    ["pilot-checklist.md", "Phase-by-phase onboarding checklist with owner and acceptance criteria per item"],
    ["scenario-test.ts", "Runnable TypeScript test of the client's specific workflow (approve and reject scenarios)"],
    ["deployment-summary.md", "One-page deployment summary with environment variables, pre-flight checklist, and next steps"],
  ].forEach(([f, d]) => kv(f, d, 8));

  h2("generate:evidence-report — Output Files  ·  Written to evidence-package/");
  [
    ["governance-summary.md", "Narrative compliance evidence: test results, audit checks, invariant coverage, chain validity"],
    ["decision-summary.json", "Machine-readable enforcement state: gate config, invariants, proof snapshot metadata"],
    ["audit-integrity-summary.md", "Hash chain verification details: manifest checksum status, HMAC signature status"],
  ].forEach(([f, d]) => kv(f, d, 8));

  footer();
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 12 — Starter Kits
// ═══════════════════════════════════════════════════════════════════════════
function sec12(): void {
  sectionBar("12", "Integration Starter Kits (×4)");

  para(
    "Four complete working examples in examples/. Each runs standalone with pnpm tsx. " +
    "Each has a README.md explaining the pattern and how to adapt it to a specific client workflow.",
    C.mid, 8.5
  );
  doc.moveDown(0.3);

  const kits = [
    {
      name: "rest-api-starter",
      path: "examples/rest-api-starter/",
      pattern: "HTTP REST wrapper — expose the gate as an API service",
      desc: "A plain Node.js HTTP server (no framework) that wraps ExecutionGateService as REST endpoints. Use as a sidecar or internal service that other systems call over HTTP.",
      points: [
        "POST /evaluate — accept a GovernedRequest JSON body, return GateResult + EvidenceBundle",
        "GET  /decisions — list all decisions from the in-memory audit log",
        "GET  /decisions/:id — retrieve a specific decision by requestId",
        "GET  /health — system health check (logging ready, chain valid, control status)",
        "sample-request.json — ready-to-use example request body for testing",
      ],
      cmd: "pnpm tsx examples/rest-api-starter/index.ts",
    },
    {
      name: "financial-approval-starter",
      path: "examples/financial-approval-starter/",
      pattern: "AI proposes → analyst holds → manager approves → ALLOW",
      desc: "Demonstrates the two-step human approval pattern for financial escalations. Shows the full HOLD → ALLOW lifecycle with EvidenceBundle generation and AI self-authorization prevention.",
      points: [
        "Step 1: Submit without approval → HOLD (REQUIRED_APPROVAL_MISSING)",
        "Step 2: Manager reviews and constructs ApprovalArtifact with privilegedAuthSatisfied: true",
        "Step 3: Resubmit with artifact → ALLOW + ReleaseAuthorization",
        "Step 4: Generate EvidenceBundle with 3-event hash chain",
        "Step 5: Verify AI alone → REJECT (AI_CANNOT_AUTHORIZE) — demonstrates unconditional enforcement",
      ],
      cmd: "pnpm tsx examples/financial-approval-starter/index.ts",
    },
    {
      name: "fraud-workflow-starter",
      path: "examples/fraud-workflow-starter/",
      pattern: "AI-scored triage with persistent file-backed audit log",
      desc: "Processes transactions through risk scoring (0–100) with risk-level routing. Uses FileBackedAppendOnlyLogService for durable JSONL audit logs. Demonstrates fraud_triage unconditional approval enforcement.",
      points: [
        "Low risk (< 50): allow action — note: fraud_triage workflow always requires approval (HOLD produced regardless)",
        "Medium risk (50–79): hold action, analyst approval required → resubmit → ALLOW",
        "High risk (≥ 80): escalate action, compliance_officer approval required → resubmit → ALLOW",
        "Audit log: ./audit/fraud-triage.jsonl (JSONL format, persists across runs)",
        "15 total audit entries generated across 3 transactions with verified hash chain",
      ],
      cmd: "pnpm tsx examples/fraud-workflow-starter/index.ts",
    },
    {
      name: "agent-integration-starter",
      path: "examples/agent-integration-starter/",
      pattern: "AI agent proposes → system actor carries → human approves",
      desc: "Shows the correct pattern for integrating an AI agent: the AI never submits its own proposal as actor. Instead a system actor carries the AI proposal. Includes a deliberate wrong-pattern demo showing why AI self-authorization always produces REJECT.",
      points: [
        "Scenario 1 (wrong pattern): AI actor submits own proposal → REJECT (AI_CANNOT_AUTHORIZE, INV-05)",
        "Scenario 2 (correct pattern): System actor carries AI proposal → HOLD (waiting for human review)",
        "Scenario 3: Human reviewer approves → ALLOW + EvidenceBundle with 3-event chain",
        "Evidence includes: model version, reviewer identity, approver authority class",
        "Explicit summary of integration boundary rules printed on each run",
      ],
      cmd: "pnpm tsx examples/agent-integration-starter/index.ts",
    },
  ];

  kits.forEach((kit) => {
    ensureY(60);
    doc.moveDown(0.4);

    const barY = doc.y;
    doc.rect(ML, barY, CW, 20).fill(C.navy);
    doc.rect(ML, barY, 3, 20).fill(C.accent);
    doc.fillColor(C.white).font("Helvetica-Bold").fontSize(10)
      .text(kit.name, ML + 10, barY + 5, { lineBreak: false });
    doc.fillColor(C.midBlue).font("Helvetica").fontSize(8)
      .text("  ·  " + kit.path, { continued: false, lineBreak: false });
    doc.y = barY + 24;

    doc.fillColor(C.accent).font("Helvetica-Oblique").fontSize(8.5)
      .text("Pattern: " + kit.pattern, ML, doc.y);
    doc.moveDown(0.15);
    doc.fillColor(C.dark).font("Helvetica").fontSize(8.5)
      .text(kit.desc, ML, doc.y, { width: CW, lineGap: 2 });
    doc.moveDown(0.2);
    kit.points.forEach((p) => bul(p));
    doc.moveDown(0.15);
    code([kit.cmd]);
  });

  footer();
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 13 — Adoption Layer
// ═══════════════════════════════════════════════════════════════════════════
function sec13(): void {
  sectionBar("13", "Adoption Layer — 5 Priorities");

  para(
    "Five deliverables built in response to the Line Axia audit. Together they allow a client to " +
    "onboard, configure, pilot, and generate compliance evidence without requiring Jesse to be " +
    "present at every step.",
    C.mid, 8.5
  );
  doc.moveDown(0.3);

  const priorities = [
    {
      n: "1",
      name: "Authority Class Registry",
      files: "cerbaseal.config.json  ·  src/config/cerbaseal-config.ts",
      desc: "New client authority classes added to cerbaseal.config.json extended array — zero TypeScript source code changes required. ExecutionGateService constructor accepts optional GateConfig. Default (no-args) constructor uses core classes only, making this a zero-breaking-change addition. buildAllowedAuthorityClasses() merges core + extended into a ReadonlySet used at runtime.",
      impact: "Eliminates: 'Jesse must update the code every time we add a new role to the client's workflow'",
    },
    {
      n: "2",
      name: "Integration Starter Kits",
      files: "examples/rest-api-starter/  ·  examples/financial-approval-starter/  ·  examples/fraud-workflow-starter/  ·  examples/agent-integration-starter/",
      desc: "Four complete working examples covering the most common integration patterns (REST API wrapper, financial approval flow, AI-scored fraud triage, AI agent governance). Each runs standalone with pnpm tsx, includes a README with adaptation guidance, and demonstrates the correct actor/approver boundary. Client developers can copy and adapt without needing to understand the full codebase.",
      impact: "Eliminates: 'We need Jesse on a call to show us how to integrate CerbaSeal'",
    },
    {
      n: "3",
      name: "Workflow Config Generator",
      files: "scripts/generate-pilot-config.ts  ·  scripts/wizard-input.example.json",
      desc: "Client fills in wizard-input.json (a questionnaire covering workflow name, actions, AI system description, approver roles, approval rules, evidence config, and deployment environment). pnpm generate:pilot-config reads the file and produces a complete 4-file pilot configuration package: cerbaseal-config.json, pilot-checklist.md, scenario-test.ts, deployment-summary.md — all tailored to the client's workflow.",
      impact: "Eliminates: 'Jesse must manually configure CerbaSeal for each client deployment'",
    },
    {
      n: "4",
      name: "Pilot Evidence Package Generator",
      files: "scripts/generate-evidence-report.ts",
      desc: "After a successful pilot, run pnpm export:proof (generates cryptographically verified proof-snapshot.json) then pnpm generate:evidence-report to produce a 3-file compliance evidence package: governance-summary.md (narrative), decision-summary.json (structured data), and audit-integrity-summary.md (hash chain verification). The manifest checksum is verified before output is produced.",
      impact: "Eliminates: 'Jesse must produce the compliance evidence package manually for each client'",
    },
    {
      n: "5",
      name: "Founder Independence Kit",
      files: "docs/FOUNDER-INDEPENDENCE-KIT.md  ·  docs/client-adoption/onboarding-sequence.md",
      desc: "FOUNDER-INDEPENDENCE-KIT.md is the master index covering all 7 adoption stages from client qualification through compliance review. onboarding-sequence.md is an 8-phase sequence (Phase 0 through Phase 8) that a client follows end-to-end without Jesse. Includes an escalation table (what to escalate vs. self-serve), integration starter kit selection guide, quick command reference, and an explicit list of what still requires Jesse.",
      impact: "Eliminates: 'The entire sales and onboarding process depends on Jesse's availability'",
    },
  ];

  priorities.forEach((p) => {
    ensureY(70);
    doc.moveDown(0.5);

    const barY = doc.y;
    doc.rect(ML, barY, CW, 22).fill(C.ltBlue);
    doc.rect(ML, barY, 30, 22).fill(C.accent);
    doc.fillColor(C.white).font("Helvetica-Bold").fontSize(12)
      .text(p.n, ML, barY + 5, { width: 30, align: "center", lineBreak: false });
    doc.fillColor(C.navy).font("Helvetica-Bold").fontSize(11)
      .text(p.name, ML + 36, barY + 6, { lineBreak: false });
    doc.y = barY + 26;

    doc.fillColor(C.mid).font("Helvetica-Oblique").fontSize(7.5)
      .text(p.files, ML, doc.y, { width: CW });
    doc.moveDown(0.15);
    doc.fillColor(C.black).font("Helvetica").fontSize(8.5)
      .text(p.desc, ML, doc.y, { width: CW, lineGap: 2 });
    doc.moveDown(0.2);
    doc.fillColor(C.green).font("Helvetica-Bold").fontSize(8.5)
      .text("→ " + p.impact, ML, doc.y, { width: CW });
    doc.moveDown(0.1);
  });

  footer();
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 14 — Demo App & Browser Portal
// ═══════════════════════════════════════════════════════════════════════════
function sec14(): void {
  sectionBar("14", "Demo App & Browser Portal Routes");

  h1("Browser Demo Server  ·  examples/browser-demo/server.ts");
  para(
    "A plain Node.js HTTP server (no framework) serving both HTML portal pages and JSON API endpoints. " +
    "Start with: pnpm demo:web   (reads PORT environment variable, defaults to 3000). " +
    "All 9 routes are tested in test/integration/browser-demo-routes.test.ts."
  );

  h2("Portal Pages — HTML for human review");
  table(
    ["Route", "Page Title", "Content"],
    [
      ["/review", "CerbaSeal Review Portal", "Interactive governance decision review with live scenario evaluation"],
      ["/pilot", "Pilot Readiness", "Pilot readiness checklist and deployment status dashboard"],
      ["/security", "Security Summary", "Invariant list, adversarial test results, security posture overview"],
      ["/deployment", "Deployment Guide", "Step-by-step deployment instructions and environment configuration"],
      ["/one-page", "One-Page Summary", "Executive-level one-page overview of the CerbaSeal governance model"],
    ],
    [60, 120, CW - 180]
  );

  h2("Scenario APIs — JSON, return real gate decisions");
  table(
    ["Route", "Scenario", "Expected Outcome"],
    [
      ["POST /api/reject", "AI actor attempts self-authorization", "REJECT — AI_CANNOT_AUTHORIZE (INV-05)"],
      ["POST /api/hold", "System actor, approval required but missing", "HOLD — REQUIRED_APPROVAL_MISSING (INV-03)"],
      ["POST /api/allow", "System actor, valid approval artifact present", "ALLOW — DECISION_ALLOWED (all invariants pass)"],
    ],
    [90, 190, CW - 280]
  );

  h2("Data APIs — JSON, supply data to the portal pages");
  table(
    ["Route", "Returns"],
    [
      ["/api/review-summary", "Recent decisions, hash chain validity status, invariant check summary for the review portal"],
      ["/api/pilot-readiness", "Pilot checklist items with status, deployment mode, configuration summary for the pilot page"],
      ["/api/security-summary", "Invariant list with test coverage, adversarial test results, overall security score for the security page"],
    ],
    [130, CW - 130]
  );

  h2("Validation Scripts");
  code([
    "pnpm demo:web:validate   # validate-demo.ts — exercises all routes, checks JSON structure and outcomes",
    "pnpm review:validate     # validate-review-portal.ts — 110 assertions across all portal routes",
  ]);

  h1("cerbaseal-demo Artifact  ·  Vite + React");
  para(
    "A separate React/Vite application in artifacts/cerbaseal-demo/ provides a production-grade " +
    "browser UI. Registered as a pnpm workspace artifact with its own dev server. " +
    "Start with: pnpm --filter @workspace/cerbaseal-demo run dev"
  );
  [
    ["Package name", "@workspace/cerbaseal-demo"],
    ["Dev server", "Vite — reads PORT environment variable to avoid port collisions"],
    ["Key files", "src/hooks/use-toast.ts, src/lib/utils.ts"],
    ["Config", "vite.config.ts, tsconfig.json, components.json"],
  ].forEach(([k, v]) => kv(k, v, 8));

  footer();
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 15 — File Tree
// ═══════════════════════════════════════════════════════════════════════════
function sec15(): void {
  sectionBar("15", "Full Repository File Tree");

  para("All source, test, script, documentation, and configuration files. node_modules excluded.", C.mid, 8.5);
  doc.moveDown(0.2);

  type TreeEntry = { path: string; desc: string; type: "dir" | "file" | "gap" };
  const tree: TreeEntry[] = [
    { type: "dir", path: "/ (root)", desc: "" },
    { type: "file", path: "  package.json", desc: "Root package — 24 scripts, tsx + pdfkit + vitest devDependencies, ESM module type" },
    { type: "file", path: "  tsconfig.json", desc: "Strict TypeScript — ES2022 target, NodeNext module, strict: true, exactOptionalPropertyTypes: true" },
    { type: "file", path: "  cerbaseal.config.json", desc: "Runtime authority/workflow/action class registry with core and extended arrays" },
    { type: "file", path: "  vitest.config.ts", desc: "Vitest configuration — include: test/**/*.test.ts" },
    { type: "file", path: "  .gitignore", desc: "Excludes: wizard-input.json, pilot-config/, evidence-package/, audit/, dist/, .env" },
    { type: "file", path: "  README.md", desc: "Full public README with system overview, adoption layer section, 415 test count" },
    { type: "file", path: "  CERBASEAL_PILOT_READINESS_BINDER.md", desc: "Pilot readiness binder for client delivery" },
    { type: "gap", path: "", desc: "" },

    { type: "dir", path: "src/", desc: "" },
    { type: "dir", path: "  src/config/", desc: "" },
    { type: "file", path: "    cerbaseal-config.ts", desc: "loadCerbaSealConfig(), buildAllowedAuthorityClasses(), GateConfig interface" },
    { type: "dir", path: "  src/domain/types/", desc: "" },
    { type: "file", path: "    core.ts", desc: "All primary types: GovernedRequest, DecisionEnvelope, ApprovalArtifact, GateResult, ReleaseAuthorization, BlockedActionRecord, DecisionProposal, ControlStatus, TrustState, PolicyPackRef, ProvenanceRef" },
    { type: "file", path: "    audit.ts", desc: "Audit types: AuditLogEntry, AuditEventPayload, EvidenceBundle, ExportManifest, ReplayResult" },
    { type: "file", path: "    diagnostics.ts", desc: "DiagnosticReport, HealthReport, SystemState, InvariantCheckSummary types" },
    { type: "dir", path: "  src/domain/constants/", desc: "" },
    { type: "file", path: "    invariants.ts", desc: "INVARIANTS const object — INV-01 through INV-12 with descriptions" },
    { type: "file", path: "    reason-codes.ts", desc: "REASON_CODES const object — all 18 reason codes as string literal union" },
    { type: "dir", path: "  src/domain/errors/", desc: "" },
    { type: "file", path: "    cerbaseal-error.ts", desc: "CerbaSealError class extending Error — carries invariant: InvariantCode, reasonCode: ReasonCode, finalState: 'HOLD' | 'REJECT'" },
    { type: "dir", path: "  src/domain/formatters/", desc: "" },
    { type: "file", path: "    certificate.ts", desc: "CertificateFormatter — human-readable governance certificate from EvidenceBundle" },
    { type: "file", path: "    demo-response.ts", desc: "DemoResponseFormatter — shapes GateResult for the browser demo JSON API" },
    { type: "file", path: "    review-portal-data.ts", desc: "Data builders for the /api/review-summary, /api/pilot-readiness, /api/security-summary endpoints" },
    { type: "dir", path: "  src/domain/builders/", desc: "" },
    { type: "file", path: "    agent-scenarios.ts", desc: "Agent gate test scenario builders" },
    { type: "file", path: "    consumer-scenarios.ts", desc: "Consumer example scenario builders" },
    { type: "file", path: "    gate-scenarios.ts", desc: "Core gate scenario builders for ALLOW, HOLD, and REJECT paths" },
    { type: "file", path: "    request-fixtures.ts", desc: "GovernedRequest fixture builders for tests — builds valid and invalid requests" },
    { type: "dir", path: "  src/services/execution/", desc: "" },
    { type: "file", path: "    execution-gate-service.ts", desc: "ExecutionGateService class + assertIsGateIssued() + _gateIssuedResults WeakSet — the mandatory enforcement gate" },
    { type: "file", path: "    mock-execution-system.ts", desc: "MockExecutionSystem — test helper for simulating caller systems" },
    { type: "file", path: "    tools.ts", desc: "Shared gate utility functions" },
    { type: "dir", path: "  src/services/audit/", desc: "" },
    { type: "file", path: "    append-only-log-service.ts", desc: "AppendOnlyLogService (in-memory) + IAuditLogService interface definition" },
    { type: "file", path: "    file-backed-append-only-log-service.ts", desc: "FileBackedAppendOnlyLogService — JSONL persistence using appendFileSync" },
    { type: "file", path: "    audit-hash-utils.ts", desc: "buildEntry(), verifyChain(), deepClone() — SHA-256 chain construction and verification" },
    { type: "dir", path: "  src/services/evidence/", desc: "" },
    { type: "file", path: "    evidence-bundle-service.ts", desc: "EvidenceBundleService — assembles full decision context, calls assertIsGateIssued" },
    { type: "dir", path: "  src/services/export/", desc: "" },
    { type: "file", path: "    export-manifest-service.ts", desc: "ExportManifestService — createAuthorityPackageManifest() — point-in-time evidence hash snapshot" },
    { type: "dir", path: "  src/services/replay/", desc: "" },
    { type: "file", path: "    replay-service.ts", desc: "ReplayService — replay() — re-runs past decisions through a fresh gate instance" },
    { type: "dir", path: "  src/services/diagnostics/", desc: "" },
    { type: "file", path: "    diagnostic-report-service.ts", desc: "DiagnosticReportService — createReport() — operator analysis with recommended actions" },
    { type: "dir", path: "  src/services/support/", desc: "" },
    { type: "file", path: "    operator-action-service.ts", desc: "Operator-level actions: acknowledge, escalate, re-evaluate, generate support ticket" },
    { type: "file", path: "    system-health-service.ts", desc: "SystemHealthService — checks logging, control status, trust state, chain integrity" },
    { type: "file", path: "    system-integrity-service.ts", desc: "SystemIntegrityService — runs integrity checks across the full audit log chain" },
    { type: "file", path: "    support-fixtures.ts", desc: "Test fixtures for support service tests" },
    { type: "gap", path: "", desc: "" },

    { type: "dir", path: "test/", desc: "" },
    { type: "file", path: "  execution-gate-service.test.ts", desc: "~120 tests — all 12 invariants, all outcome paths, approval binding, timestamp, schema edge cases" },
    { type: "file", path: "  adversarial-integrity.test.ts", desc: "~18 tests — approval replay, cross-request binding, AI escalation, malformed envelope injection" },
    { type: "file", path: "  audit-evidence-export.test.ts", desc: "~30 tests — audit chain, evidence assembly, export manifest" },
    { type: "file", path: "  persistent-audit-log.test.ts", desc: "~20 tests — FileBackedAppendOnlyLogService write, read-back, chain verify" },
    { type: "file", path: "  diagnostic-report-service.test.ts", desc: "~18 tests — report structure, recommendations, risk assessment" },
    { type: "file", path: "  security/fail-closed.test.ts", desc: "2 tests — unexpected exceptions never produce ALLOW" },
    { type: "file", path: "  security/non-forgery.test.ts", desc: "2 tests — self-constructed GateResult rejected by WeakSet check" },
    { type: "file", path: "  security/misuse-scenarios.test.ts", desc: "~15 tests — AI self-auth, authority-bearing proposals, forgery attempts" },
    { type: "file", path: "  security/contextual-boundary.test.ts", desc: "~12 tests — empty strings, null fields, whitespace-only values, ISO timestamp edge cases" },
    { type: "file", path: "  snapshots/enforcement-loop.snapshot.test.ts", desc: "~8 tests — snapshot comparisons across full ALLOW/HOLD/REJECT flows" },
    { type: "file", path: "  integration/full-flow.test.ts", desc: "1 test — end-to-end: request → gate → evidence → replay → chain verify" },
    { type: "file", path: "  integration/system-integration.test.ts", desc: "1 test — full stack: gate + audit + evidence + diagnostic + health + export" },
    { type: "file", path: "  integration/browser-demo-routes.test.ts", desc: "~40 tests — all 9 HTTP routes respond 200 with correct content" },
    { type: "file", path: "  integration/review-portal-routes.test.ts", desc: "~40 tests — portal route content assertions" },
    { type: "file", path: "  integration/support-readiness.test.ts", desc: "~30 tests — support readiness scenarios" },
    { type: "file", path: "  integration/external-signal-examples.test.ts", desc: "~34 tests — trust state, control status, prohibited use, provenance permutations" },
    { type: "gap", path: "", desc: "" },

    { type: "dir", path: "examples/", desc: "" },
    { type: "file", path: "  run-demo.ts", desc: "Console demo — all gate scenarios" },
    { type: "file", path: "  http-wrapper.ts", desc: "HTTP wrapper utility" },
    { type: "file", path: "  rest-api-starter/", desc: "REST API starter kit — index.ts + README.md + sample-request.json" },
    { type: "file", path: "  financial-approval-starter/", desc: "Financial approval starter kit — index.ts + README.md" },
    { type: "file", path: "  fraud-workflow-starter/", desc: "Fraud workflow starter kit — index.ts + README.md" },
    { type: "file", path: "  agent-integration-starter/", desc: "Agent integration starter kit — index.ts + README.md" },
    { type: "file", path: "  browser-demo/", desc: "HTTP review portal — server.ts, scenarios.ts, review-portal.ts, response-builder.ts, validate-demo.ts, validate-review-portal.ts" },
    { type: "file", path: "  consumer-example/", desc: "Consumer pattern — consumer.ts, mock-execution-system.ts, validate-consumer.ts, README.md" },
    { type: "file", path: "  agent-gate/", desc: "AI agent gate — agent.ts, tools.ts, run-agent-gate.ts, validate-agent-gate.ts, README.md" },
    { type: "file", path: "  auditor-view/", desc: "Auditor certificate view — render-certificate.ts, run-auditor-view.ts, validate-auditor-view.ts, README.md" },
    { type: "file", path: "  support-readiness/", desc: "Support readiness — run-support-readiness.ts, validate-support-readiness.ts" },
    { type: "gap", path: "", desc: "" },

    { type: "dir", path: "scripts/", desc: "" },
    { type: "file", path: "  repo-audit.ts", desc: "15-check automated repo audit — all checks must pass before release" },
    { type: "file", path: "  export-proof.ts", desc: "Generate docs/reports/proof-snapshot.json with SHA-256 manifest checksum + optional HMAC" },
    { type: "file", path: "  verify-proof.ts", desc: "Verify proof-snapshot.json manifest checksum" },
    { type: "file", path: "  check-imports.ts", desc: "Import boundary checker — scans 79 files for architectural violations" },
    { type: "file", path: "  check-invariant-coverage.ts", desc: "Verifies each of the 12 invariants appears in at least one test file" },
    { type: "file", path: "  generate-pilot-config.ts", desc: "Reads wizard-input.json → writes pilot-config/ (4 files)" },
    { type: "file", path: "  generate-evidence-report.ts", desc: "Reads proof-snapshot.json → writes evidence-package/ (3 files)" },
    { type: "file", path: "  generate-system-pdf.ts", desc: "Generates this PDF — cerbaseal-system-breakdown.pdf" },
    { type: "file", path: "  wizard-input.example.json", desc: "Fully filled example wizard-input.json for a Transaction Fraud Review workflow" },
    { type: "file", path: "  hash-report.ts", desc: "Report hash utility" },
    { type: "gap", path: "", desc: "" },

    { type: "dir", path: "docs/ (selected highlights)", desc: "" },
    { type: "file", path: "  FOUNDER-INDEPENDENCE-KIT.md", desc: "Master index for all 7 adoption stages — from client qualification to compliance review" },
    { type: "file", path: "  client-adoption/onboarding-sequence.md", desc: "8-phase client onboarding sequence (Phase 0–8) runnable without Jesse" },
    { type: "file", path: "  client-adoption/", desc: "20+ guides: admin-guide, discovery-script, qualification-scorecard, readiness-assessment, EU AI Act mapping, pilot-delivery-playbook, pricing-framework, success-framework, quickstart-guide, troubleshooting-guide, workflow-mapping-workbook, training materials, templates (×4)" },
    { type: "file", path: "  deployment/", desc: "deployment-modes.md, eu-pilot-deployment-posture.md, mode-c-client-controlled.md, pilot-deployment-checklist.md, runbook.md" },
    { type: "file", path: "  security/", desc: "access-control-and-rate-limiting.md, artifact-signing-roadmap.md, security-review-brief.md" },
    { type: "file", path: "  reports/", desc: "adversarial integrity reports, CTO review pack (LINE_AXIA), FULL_AUDIT_REPORT_2026-06-04.md, proof-snapshot.json" },
    { type: "gap", path: "", desc: "" },

    { type: "dir", path: "artifacts/cerbaseal-demo/", desc: "" },
    { type: "file", path: "  src/", desc: "React + Vite browser UI (hooks/use-toast.ts, lib/utils.ts)" },
    { type: "file", path: "  vite.config.ts", desc: "Vite config — reads PORT environment variable" },
    { type: "file", path: "  package.json", desc: "@workspace/cerbaseal-demo — registered as pnpm workspace artifact" },
    { type: "file", path: "  tsconfig.json", desc: "TypeScript config for the Vite artifact" },
    { type: "file", path: "  components.json", desc: "shadcn/ui component registry config" },
    { type: "gap", path: "", desc: "" },

    { type: "dir", path: "specs/", desc: "" },
    { type: "file", path: "  approval_artifact.json", desc: "JSON schema for the ApprovalArtifact structure" },
    { type: "file", path: "  approval_artifact.md", desc: "Specification document for ApprovalArtifact including validation rules" },
  ];

  tree.forEach((entry) => {
    if (entry.type === "gap") { doc.moveDown(0.3); return; }

    ensureY(14);

    if (entry.type === "dir") {
      doc.moveDown(0.2);
      doc.fillColor(C.navy).font("Helvetica-Bold").fontSize(8.5)
        .text(entry.path, ML, doc.y);
      return;
    }

    const indent = (entry.path.match(/^ +/) ?? [""])[0].length;
    const name = entry.path.trim();
    const x = ML + Math.min(indent * 2.5, 40);
    const nameW = 160;

    if (entry.desc) {
      doc.fillColor(C.dark).font("Courier").fontSize(7.5)
        .text(name, x, doc.y, { continued: true, lineBreak: false, width: nameW });
      doc.fillColor(C.mid).font("Helvetica").fontSize(7.5)
        .text("  " + entry.desc, {
          width: CW - nameW - (x - ML),
          lineGap: 1.5,
        });
    } else {
      doc.fillColor(C.dark).font("Courier").fontSize(7.5)
        .text(name, x, doc.y, { lineGap: 1.5 });
    }
  });

  footer();
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════
async function main(): Promise<void> {
  console.log("\nCerbaSeal-Core — System & Repo Breakdown PDF (clean rewrite)\n");
  init();
  const stream = createWriteStream(OUT);
  doc.pipe(stream);

  cover();
  sec1();
  sec2();
  sec3();
  sec4();
  sec5();
  sec6();
  sec7();
  sec8();
  sec9();
  sec10();
  sec11();
  sec12();
  sec13();
  sec14();
  sec15();
  footer(); // final page

  doc.end();

  await new Promise<void>((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  const { statSync } = await import("node:fs");
  const kb = (statSync(OUT).size / 1024).toFixed(0);
  console.log(`  ✓ ${OUT}`);
  console.log(`  Size: ${kb} KB   Pages: ${pageNum}\n`);
}

main().catch((err) => { console.error(err); process.exit(1); });
