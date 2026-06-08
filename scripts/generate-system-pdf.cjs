'use strict';
// CerbaSeal-Core — System Reference PDF (v2, clean layout engine)
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ── Palette ──────────────────────────────────────────────────────────────────
const NAVY   = '#0D1B2A';
const NAVY2  = '#1B3A5C';
const GOLD   = '#C9A84C';
const WHITE  = '#FFFFFF';
const LGRAY  = '#EEF2F7';
const MGRAY  = '#CBD5E0';
const DGRAY  = '#4A5568';
const BLACK  = '#1A2332';
const CODEBG = '#EDF2F7';
const ROWALT = '#F0F5FF';
const GREEN  = '#1A6B3C';
const AMBER  = '#92400E';

// ── Page geometry ─────────────────────────────────────────────────────────────
const PW = 595.28;   // A4 width
const PH = 841.89;   // A4 height
const ML = 52;       // margin left
const MR = 52;       // margin right
const CW = PW - ML - MR;  // content width  ≈ 491
const RE = PW - MR;       // right edge
const CTOP = 58;           // content top (below running head)
const CBOT = PH - 58;      // content bottom (above footer rule)

// ── Document ──────────────────────────────────────────────────────────────────
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: CTOP, bottom: 58, left: ML, right: MR },
  autoFirstPage: false,
  info: {
    Title:    'CerbaSeal-Core v0.1.0 — System Architecture & Technical Reference',
    Author:   'Jesse Lamont / Lamont Labs',
    Subject:  'Deterministic Execution Governance Infrastructure',
    Keywords: 'CerbaSeal, AI governance, enforcement gate, audit chain, compliance',
    Creator:  'Lamont Labs PDF Generator v2',
  },
});

const OUT = path.join(__dirname, '..', 'cerbaseal-system-reference.pdf');
doc.pipe(fs.createWriteStream(OUT));

// ── Page state ────────────────────────────────────────────────────────────────
let pageNum = 0;
let section = '';

function drawRunHead() {
  doc.save();
  doc.rect(ML, 20, CW, 0.5).fill(NAVY);
  doc.font('Helvetica').fontSize(7.5).fillColor(NAVY2);
  doc.text('CerbaSeal-Core  v0.1.0', ML, 10, { width: CW / 2 });
  doc.font('Helvetica').fontSize(7.5).fillColor(GOLD);
  doc.text(section, ML, 10, { width: CW, align: 'right' });
  doc.restore();
}

function drawFooter() {
  const fy = PH - 44;
  doc.save();
  doc.rect(ML, fy, CW, 0.5).fill(MGRAY);
  doc.font('Helvetica').fontSize(7.5).fillColor(DGRAY);
  doc.text('LAMONT LABS  ·  PARTNER CONFIDENTIAL', ML, fy + 7, { width: CW * 0.65 });
  doc.text(String(pageNum), ML, fy + 7, { width: CW, align: 'right' });
  doc.restore();
}

// Add a new content page (with running head + footer), reset doc.y
function newPage(sec) {
  if (sec !== undefined) section = sec;
  pageNum++;
  doc.addPage();
  drawRunHead();
  drawFooter();
  doc.y = CTOP;
}

// Add blank page with just footer (e.g. cover, back cover)
function rawPage() {
  pageNum++;
  doc.addPage();
}

// Check space; add new page if needed
function need(h) {
  if (doc.y + h > CBOT) newPage();
}

// ── Drawing primitives ────────────────────────────────────────────────────────

function sectionBanner(num, title) {
  need(52);
  const y = doc.y + 10;
  doc.rect(ML, y, CW, 36).fill(NAVY);
  doc.rect(ML, y + 36, CW, 2.5).fill(GOLD);
  doc.font('Helvetica').fontSize(8).fillColor(GOLD);
  doc.text(num, ML + 10, y + 6);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(WHITE);
  doc.text(title, ML + 10, y + 17, { width: CW - 20 });
  doc.y = y + 50;
}

function subBanner(title) {
  need(34);
  doc.y += 10;
  doc.rect(ML, doc.y, 3.5, 16).fill(GOLD);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(NAVY);
  doc.text(title, ML + 10, doc.y + 2, { width: CW - 10 });
  doc.y += 26;
}

function para(txt, opts) {
  need(30);
  doc.font('Helvetica').fontSize(9.5).fillColor(BLACK);
  doc.text(txt, ML, doc.y, Object.assign({ width: CW, lineGap: 3 }, opts || {}));
  doc.y += 5;
}

function bul(txt, indent) {
  indent = indent || 0;
  need(18);
  const x = ML + 10 + indent;
  doc.circle(x - 5, doc.y + 5, 1.8).fill(GOLD);
  doc.font('Helvetica').fontSize(9).fillColor(BLACK);
  doc.text(txt, x, doc.y, { width: CW - 10 - indent, lineGap: 2 });
  doc.y += 3;
}

function kv(k, v, indent) {
  indent = indent || 0;
  need(16);
  const kw = 130;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(NAVY2);
  doc.text(k, ML + indent, doc.y, { continued: true, width: kw });
  doc.font('Helvetica').fontSize(9).fillColor(BLACK);
  doc.text('  ' + v, { width: CW - kw - indent, lineGap: 2 });
  doc.y += 2;
}

function codeBlock(txt, label) {
  const lineCount = (txt.match(/\n/g) || []).length + 1;
  const bh = lineCount * 12 + 18;
  need(bh + (label ? 14 : 0));
  if (label) {
    doc.font('Helvetica').fontSize(7.5).fillColor(DGRAY);
    doc.text(label, ML, doc.y);
    doc.y += 2;
  }
  const y0 = doc.y;
  doc.rect(ML, y0, CW, bh).fill(CODEBG);
  doc.rect(ML, y0, 3, bh).fill(GOLD);
  doc.font('Courier').fontSize(7.8).fillColor(NAVY2);
  doc.text(txt, ML + 11, y0 + 8, { width: CW - 18, lineGap: 1.5 });
  doc.y = y0 + bh + 8;
}

// Table: headers[], rows[][], colWidths[], rowH
function tbl(headers, rows, colWidths, rowH) {
  rowH = rowH || 20;
  const hh = 24;
  const totalH = hh + rows.length * rowH;
  need(totalH + 10);

  let y = doc.y;
  const x = ML;

  // Header bar
  doc.rect(x, y, CW, hh).fill(NAVY);
  let cx = x;
  headers.forEach(function(h, i) {
    doc.font('Helvetica-Bold').fontSize(8).fillColor(WHITE);
    doc.text(h, cx + 5, y + 7, { width: colWidths[i] - 8, lineGap: 0 });
    cx += colWidths[i];
  });

  // Rows
  rows.forEach(function(row, ri) {
    y += (ri === 0 ? hh : rowH);
    doc.rect(x, y, CW, rowH).fill(ri % 2 === 0 ? WHITE : ROWALT);
    cx = x;
    row.forEach(function(cell, ci) {
      doc.font(ci === 0 ? 'Helvetica-Bold' : 'Helvetica')
         .fontSize(8)
         .fillColor(ci === 0 ? NAVY2 : BLACK);
      doc.text(String(cell), cx + 5, y + (rowH - 10) / 2 + 1, { width: colWidths[ci] - 8, lineGap: 0 });
      cx += colWidths[ci];
    });
  });

  // Outer border
  doc.rect(x, doc.y, CW, totalH).lineWidth(0.4).strokeColor(MGRAY).stroke();
  doc.y = y + rowH + 10;
}

// Callout box
function callout(txt, color) {
  color = color || GOLD;
  const lineCount = Math.ceil(txt.length / 90) + 1;
  const bh = lineCount * 13 + 14;
  need(bh + 12);
  doc.y += 4;
  const y0 = doc.y;
  doc.rect(ML, y0, CW, bh).fill(color + '18');
  doc.rect(ML, y0, 3, bh).fill(color);
  doc.font('Helvetica').fontSize(9).fillColor(BLACK);
  doc.text(txt, ML + 11, y0 + 7, { width: CW - 18, lineGap: 3 });
  doc.y = y0 + bh + 10;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COVER PAGE
// ═══════════════════════════════════════════════════════════════════════════════
rawPage();
doc.rect(0, 0, PW, PH).fill(NAVY);
doc.rect(0, 0, 6, PH).fill(GOLD);
doc.rect(6, 0, PW, 1).fill(GOLD + '40');

// Company
doc.font('Helvetica-Bold').fontSize(9).fillColor(GOLD);
doc.text('LAMONT LABS', 76, 70, { characterSpacing: 3 });
doc.font('Helvetica').fontSize(8).fillColor(WHITE + '66');
doc.text('DETERMINISTIC EXECUTION GOVERNANCE', 76, 86, { characterSpacing: 1.5 });

// Rule
doc.rect(76, 138, PW - 76, 1).fill(GOLD + '30');

// Title
doc.font('Helvetica-Bold').fontSize(54).fillColor(WHITE);
doc.text('CerbaSeal', 76, 158);
doc.font('Helvetica').fontSize(22).fillColor(GOLD);
doc.text('Core  ·  v0.1.0', 76, 225);
doc.font('Helvetica').fontSize(14).fillColor(WHITE + 'BB');
doc.text('System Architecture &\nTechnical Reference Manual', 76, 264, { lineGap: 5 });

// Gold rule
doc.rect(76, 326, 64, 3).fill(GOLD);

// Abstract
doc.font('Helvetica').fontSize(9.5).fillColor(WHITE + '77');
doc.text(
  'The authoritative technical reference for CerbaSeal-Core — the single deterministic\n' +
  'enforcement gate that makes it technically impossible to execute a consequential AI-assisted\n' +
  'action without satisfying every governance requirement. Covers invariant framework, domain\n' +
  'type system, policy layer, audit chain, HTTP API, deployment, and partner delivery.',
  76, 345, { width: PW - 176, lineGap: 5 }
);

// Meta row
const MY = PH - 110;
doc.rect(76, MY - 8, PW - 120, 0.8).fill(GOLD + '44');
[
  ['VERSION', '0.1.0', 76],
  ['STATUS', 'GENERALLY AVAILABLE', 172],
  ['DATE', 'June 2026', 340],
  ['AUTHOR', 'Jesse Lamont', 426],
].forEach(function(item) {
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(GOLD);
  doc.text(item[0], item[2], MY + 4);
  doc.font('Helvetica').fontSize(9).fillColor(WHITE + 'CC');
  doc.text(item[1], item[2], MY + 18);
});
doc.rect(76, PH - 38, PW - 120, 0.5).fill(GOLD + '25');
doc.font('Helvetica').fontSize(7).fillColor(WHITE + '33');
doc.text('© 2026 Lamont Labs. Partner Confidential. Authorised recipients only. Not for redistribution.', 76, PH - 26, { width: PW - 152 });

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE OF CONTENTS
// ═══════════════════════════════════════════════════════════════════════════════
newPage('Table of Contents');
// Overwrite header with a styled banner
doc.rect(0, 0, PW, 80).fill(NAVY);
doc.rect(0, 0, 6, 80).fill(GOLD);
doc.font('Helvetica-Bold').fontSize(20).fillColor(WHITE);
doc.text('Table of Contents', 76, 26);
doc.rect(76, 58, 52, 2.5).fill(GOLD);
doc.y = 94;

var tocItems = [
  ['1',   'Executive Summary',                                     '3'],
  ['2',   'System Overview',                                       '4'],
  ['3',   'Core Architecture',                                     '5'],
  ['3.1', '  Enforcement Gate — ExecutionGateService',             '5'],
  ['3.2', '  Invariant Assertion Functions',                       '6'],
  ['3.3', '  Policy Evaluation Stages',                            '7'],
  ['3.4', '  Gate-Issued Result Registry',                         '7'],
  ['3.5', '  Decision Flow Summary',                               '8'],
  ['4',   'Invariant Framework',                                   '9'],
  ['5',   'Domain Type Reference',                                 '10'],
  ['5.1', '  GovernedRequest',                                     '10'],
  ['5.2', '  DecisionProposal, PolicyPackRef, ProvenanceRef',      '11'],
  ['5.3', '  ApprovalArtifact',                                    '11'],
  ['5.4', '  ControlStatus & TrustState',                          '12'],
  ['5.5', '  GateResult',                                          '12'],
  ['5.6', '  DecisionEnvelope & DecisionTrace',                    '12'],
  ['5.7', '  ReleaseAuthorization & BlockedActionRecord',          '13'],
  ['5.8', '  Discriminated Union Types',                           '13'],
  ['6',   'Reason Code Reference',                                 '14'],
  ['7',   'Configuration System',                                  '15'],
  ['7.1', '  CerbaSealConfig & GateConfig',                        '15'],
  ['7.2', '  CerbaSealPolicy',                                     '16'],
  ['7.3', '  WorkflowRule & PolicyActionBehavior',                 '17'],
  ['8',   'Audit & Evidence Chain',                                '17'],
  ['8.1', '  IAuditLogService Interface',                          '17'],
  ['8.2', '  AppendOnlyLogService (In-Memory)',                    '18'],
  ['8.3', '  FileBackedAppendOnlyLogService (Persistent)',         '18'],
  ['8.4', '  EvidenceBundleService',                               '19'],
  ['8.5', '  Audit Event Types & AuditLogEntry',                   '19'],
  ['9',   'HTTP API Reference',                                    '20'],
  ['10',  'Deployment Architecture',                               '21'],
  ['10.1','  Path A — Docker Compose',                             '21'],
  ['10.2','  Path B — Node.js Direct',                             '22'],
  ['11',  'Test Coverage',                                         '23'],
  ['12',  'Partner Delivery Framework',                            '24'],
  ['13',  'Security Properties & Threat Model',                    '25'],
];

tocItems.forEach(function(item, idx) {
  need(16);
  var num = item[0], title = item[1], pg = item[2];
  var isMain = num.indexOf('.') === -1;
  var y0 = doc.y;

  if (isMain && idx > 0) { doc.y += 4; y0 = doc.y; }

  doc.font('Helvetica-Bold').fontSize(isMain ? 9.5 : 8.5).fillColor(GOLD);
  doc.text(num, ML, y0, { width: 20 });

  doc.font(isMain ? 'Helvetica-Bold' : 'Helvetica')
     .fontSize(isMain ? 9.5 : 8.5)
     .fillColor(isMain ? NAVY : DGRAY);
  doc.text(title, ML + 24, y0, { width: CW - 52 });

  doc.font('Helvetica').fontSize(isMain ? 9.5 : 8.5).fillColor(DGRAY);
  doc.text(pg, ML, y0, { width: CW, align: 'right' });

  doc.y = y0 + (isMain ? 16 : 13);
});

// ═══════════════════════════════════════════════════════════════════════════════
// §1  EXECUTIVE SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════
newPage('§1 — Executive Summary');
sectionBanner('1', 'Executive Summary');

para('CerbaSeal-Core is a deterministic execution governance library for organisations that use AI-assisted decision making in regulated workflows. It solves a structural problem: the path from "AI recommends" to "action executes" is almost always unenforced. CerbaSeal makes that bypass technically impossible.');
para('The enforcement gate evaluates every GovernedRequest against 12 hard invariants before issuing a ReleaseAuthorization. The invariants are unconditional — no configuration, no policy, no caller can relax them. A client-authored policy layer (CerbaSealPolicy) adds client-specific restrictions on top of the invariants, never below them.');

subBanner('Key Guarantees');
[
  ['Single enforcement point', 'Every consequential action must pass through ExecutionGateService.evaluate(). No secondary API, no override path, no bypass.'],
  ['Deterministic decisions', 'evaluate() is a pure, synchronous function. The same request evaluated twice always produces the same decision. No network calls, no randomness, no side effects.'],
  ['Gate-issued result integrity', 'A module-private WeakSet (_gateIssuedResults) tracks every GateResult issued by evaluate(). EvidenceBundleService rejects any result not in that registry.'],
  ['Immutable evidence', 'DecisionEnvelope carries immutable: true as a literal type. Envelopes are sealed at issuance and cannot be mutated through the public API.'],
  ['Tamper-evident audit log', 'SHA-256 forward chaining — each AuditLogEntry hash includes the previous entry hash. verifyChain() detects any historical modification instantly.'],
  ['AI non-authoritativeness', 'INV-05 is checked on every request. An actor with actorAuthorityClass "ai" cannot authorise its own proposals. An AI-sourced proposal (proposalSourceKind "ai") submitted by an "ai" actor is rejected unconditionally.'],
  ['Policy is additive only', 'CerbaSealPolicy can add approval requirements, block actions, and remap actors. It cannot grant exemptions to core invariants.'],
].forEach(function(item) { kv(item[0], item[1]); doc.y += 2; });

subBanner('What CerbaSeal Is Not');
['CerbaSeal is not an AI model, workflow engine, or case management system.',
 'It does not make decisions — it evaluates whether a proposed decision is authorised to execute.',
 'It is not a hosted service — it is a library deployed inside the client\'s own infrastructure.',
 'It is not a replacement for compliance tooling — it provides the enforcement foundation compliance tooling audits.'].forEach(bul);

subBanner('v0.1.0 Scope');
para('Drop 01 deliverables: enforcement gate (ExecutionGateService), in-memory and file-backed audit log, evidence bundle and export, configuration and policy loaders, HTTP deployment server, diagnostic report service, and the Partner Delivery Kit (7 documents, 3 certification levels). HMAC signing over DecisionEnvelope is available in source but not yet exposed as a first-class API. Third-party security review is planned for v0.2.0.');

// ═══════════════════════════════════════════════════════════════════════════════
// §2  SYSTEM OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════════
newPage('§2 — System Overview');
sectionBanner('2', 'System Overview');

subBanner('The 7-Layer Architecture');
para('CerbaSeal is structured as seven discrete layers. Each layer has a specific job. The request flows upward through the stack; evidence and audit records flow downward and are captured at every layer.');

codeBlock(
  '┌─────────────────────────────────────────────────────────────────┐\n' +
  '│  7. Evidence Layer   — EvidenceBundleService + ExportManifest  │\n' +
  '│  6. Audit Layer      — AppendOnlyLogService (JSONL + SHA-256)   │\n' +
  '│  5. Policy Layer     — CerbaSealPolicy (client-specific rules)  │\n' +
  '│  4. Enforcement Gate — ExecutionGateService (12 invariants)     │\n' +
  '│  3. Provenance Layer — ProvenanceRef (model + rule traceability)│\n' +
  '│  2. Trust Layer      — TrustState (actor identity + trust)      │\n' +
  '│  1. Request Layer    — GovernedRequest (structured input schema) │\n' +
  '└─────────────────────────────────────────────────────────────────┘',
  'CerbaSeal 7-layer stack'
);

subBanner('Layer Responsibilities');
tbl(
  ['Layer', 'Component', 'Job', 'Partner Integration Point'],
  [
    ['1 — Request',    'GovernedRequest',        'Structured input carrying actor, action, provenance, trust state, and control status', 'Client AI system constructs the request object from its output and session context'],
    ['2 — Trust',      'TrustState',             'Assert the requesting actor is currently trusted (no expired session, no revoked token)', 'Client IdP sets trusted: true/false; trustStateId provides audit traceability'],
    ['3 — Provenance', 'ProvenanceRef',          'Trace the AI model version, rule set version, and source hash that generated the proposal', 'Client AI pipeline exposes modelVersion, ruleSetVersion, and sourceHash'],
    ['4 — Gate',       'ExecutionGateService',   'Evaluate all 12 invariants + policy. Issue GateResult with ALLOW / HOLD / REJECT.', 'Partners instantiate the gate with config + policy; never modify gate source'],
    ['5 — Policy',     'CerbaSealPolicy',        'Apply client-specific approval chains, actor mappings, workflow rules, and action policies', 'Partners author cerbaseal.policy.json per client workflow during pilot'],
    ['6 — Audit',      'AppendOnlyLogService',   'Append-only JSONL log with SHA-256 forward chain. verifyChain() detects any tampering.', 'Partners configure LOG_PATH and persistence volume; log path in env var'],
    ['7 — Evidence',   'EvidenceBundleService',  'Assemble full proof bundle (request + envelope + chain). Drive ExportManifest for client handover.', 'Partners run pnpm export:proof at pilot close; pnpm verify:proof confirms integrity'],
  ],
  [38, 90, 176, 187], 26
);

subBanner('Decision Lifecycle');
tbl(
  ['Stage', 'Who', 'What Happens'],
  [
    ['Construct',        'Client integration', 'Builds GovernedRequest from AI output, identity context, provenance metadata, and control state'],
    ['Submit',           'Client integration', 'Calls gate.evaluate(request) — synchronous, pure, no await'],
    ['Schema check',     'Gate (INV-11,12)',    'assertRequestShape() + assertKnownActionClass() + assertActorAuthorityClass() + proposal/action match'],
    ['Policy stage 1',   'Gate',               'Actor mapping: client role name translated to canonical authority class via actorMappings'],
    ['Policy stage 2',   'Gate',               '"blocked" action policies cause immediate REJECT before any other invariant runs'],
    ['Policy stage 3',   'Gate',               'Compute effective approvalRequired from workflowRules + approvalChains + actionPolicies'],
    ['Invariant checks', 'Gate (INV-01..10)',   'assertPolicyPack, assertProvenance, assertLoggingReady, assertProposalBoundary, assertProhibitedUse, assertControlStatus, assertTrustState, assertApprovalState'],
    ['Policy stage 4',   'Gate',               'Approval chain authority enforcement: approver class must be in the configured chain for this workflow'],
    ['Decision',         'Gate',               'ALLOW → ReleaseAuthorization issued. HOLD/REJECT → BlockedActionRecord. DecisionEnvelope always produced.'],
    ['Registration',     'Gate',               'GateResult added to _gateIssuedResults WeakSet before return'],
    ['Audit',            'Caller / Evidence',  'Caller appends REQUEST_EVALUATED to IAuditLogService; EvidenceBundleService assembles bundle'],
    ['Export',           'Partner',            'pnpm export:proof generates ExportManifest with chain hashes and proof snapshot'],
  ],
  [72, 90, 329], 22
);

// ═══════════════════════════════════════════════════════════════════════════════
// §3  CORE ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════════════════
newPage('§3 — Core Architecture');
sectionBanner('3', 'Core Architecture');

subBanner('3.1  Enforcement Gate — ExecutionGateService');
para('ExecutionGateService is the only enforcement point. It is instantiated once per process at startup and its evaluate() method is the sole public mutation-bearing operation. The constructor accepts an optional GateConfig (which is a union of CerbaSealConfig | ExecutionGateConfig) and an optional CerbaSealPolicy.');

codeBlock(
  'import { ExecutionGateService }  from "./src/services/execution/execution-gate-service.js";\n' +
  'import { loadCerbaSealConfig }   from "./src/config/cerbaseal-config.js";\n' +
  'import { loadCerbaSealPolicy }   from "./src/config/cerbaseal-policy.js";\n' +
  '\n' +
  '// From files (recommended for deployment):\n' +
  'const gate = new ExecutionGateService(loadCerbaSealConfig(), loadCerbaSealPolicy());\n' +
  '\n' +
  '// Inline (useful in tests):\n' +
  'const gate = new ExecutionGateService(\n' +
  '  { additionalAuthorityClasses: ["risk_officer"] },\n' +
  '  { actorMappings: { "Head of Risk": "manager" } }\n' +
  ');\n' +
  '\n' +
  'const result = gate.evaluate(request);  // GateResult — synchronous, pure',
  'ExecutionGateService — instantiation and evaluation'
);

tbl(
  ['Constructor parameter', 'Type', 'Default', 'Purpose'],
  [
    ['config', 'GateConfig  (CerbaSealConfig | ExecutionGateConfig)', '{}', 'Extends allowed authority class set. CerbaSealConfig uses authorityClasses.extended; ExecutionGateConfig uses additionalAuthorityClasses.'],
    ['policy', 'CerbaSealPolicy | undefined', 'undefined', 'Supplies actor mappings, approval chains, workflow rules, and action policies. When undefined: gate operates on core invariants only.'],
  ],
  [100, 178, 60, 153], 28
);

kv('Private field: allowedAuthorityClasses', 'ReadonlySet<string> built at construction from CORE_AUTHORITY_CLASSES + config extensions + actorMappings keys from policy. Callers cannot access or modify it.');
doc.y += 4;
kv('Private field: policy', 'CerbaSealPolicy | undefined — stored for use in all four policy evaluation stages during evaluate().');
doc.y += 8;

subBanner('3.2  Invariant Assertion Functions');
para('Each invariant is implemented as a standalone function that pushes its InvariantCode onto the checkedInvariants array, then throws CerbaSealError on violation. CerbaSealError always carries { invariant, reasonCode, finalState }. The catch block in evaluate() converts any CerbaSealError into a controlled GateResult; non-CerbaSealError exceptions are caught by a second fallback that also produces a REJECT result.');

tbl(
  ['Function', 'Invariant(s)', 'Key checks performed'],
  [
    ['assertRequestShape()',      'INV-11', 'requestId non-empty, jurisdiction non-empty, createdAt non-empty, proposal.reasonCodes.length > 0'],
    ['assertActorAuthorityClass()','INV-11', 'actorAuthorityClass is in allowedAuthorityClasses set (after actor mapping resolution)'],
    ['assertKnownActionClass()',  'INV-11', 'proposedActionClass and proposal.requestedActionClass both in ALLOWED_ACTION_CLASSES set'],
    ['proposal/action match',    'INV-12', 'proposedActionClass === proposal.requestedActionClass (checked inline in evaluate())'],
    ['assertPolicyPack()',        'INV-01', 'policyPackRef !== null'],
    ['assertProvenance()',        'INV-02', 'provenanceRef !== null; modelVersion, ruleSetVersion, sourceHash all non-empty'],
    ['assertLoggingReady()',      'INV-04', 'loggingReady === true'],
    ['assertProposalBoundary()', 'INV-05', 'proposal.authorityBearing === false AND NOT (proposalSourceKind "ai" AND actorAuthorityClass "ai")'],
    ['assertProhibitedUse()',     'INV-10', 'prohibitedUse === false'],
    ['assertControlStatus()',     'INV-08', 'If sensitive: criticalControlsValid === true AND stale === false'],
    ['assertTrustState()',        'INV-09', 'trustState.trusted === true'],
    ['assertApprovalState()',     'INV-03', 'See §3.3 — complex multi-check function'],
  ],
  [132, 60, 299], 22
);

newPage('§3 — Core Architecture (cont.)');

subBanner('assertApprovalState() — Detail');
para('This is the most complex assertion. It first computes effectiveApprovalRequired = request.approvalRequired OR WORKFLOWS_REQUIRING_APPROVAL.has(workflowClass). The hardcoded set WORKFLOWS_REQUIRING_APPROVAL = { "fraud_triage" } — the caller cannot opt out of approval for fraud_triage by setting approvalRequired: false.');
tbl(
  ['Check', 'Failure', 'Error details'],
  [
    ['approvalArtifact === null (when effective approval required)', 'HOLD', 'REQUIRED_APPROVAL_MISSING — request is holdable (not terminal reject) awaiting human review'],
    ['approvalArtifact.forRequestId !== request.requestId',         'REJECT', 'INVALID_APPROVAL_AUTHORITY — prevents reuse of a valid approval across different requests'],
    ['approvedAt timestamp is invalid ISO or predates createdAt',   'REJECT', 'INVALID_APPROVAL_AUTHORITY or MALFORMED_REQUEST — forged or replayed approval artifact'],
    ['approverAuthorityClass not in HumanAuthorityClass set',       'REJECT', 'INVALID_APPROVAL_AUTHORITY — ai, system not valid approvers at this level'],
    ['privilegedAuthSatisfied === false',                           'REJECT', 'PRIVILEGED_AUTH_NOT_SATISFIED — MFA or step-up auth was not completed'],
    ['immutableSignature empty or whitespace',                      'REJECT', 'APPROVAL_SIGNATURE_MISSING — signature field required (content not validated in v0.1.0)'],
  ],
  [234, 60, 197], 24
);

subBanner('3.3  Policy Evaluation Stages');
para('Policy rules are evaluated in four stages interspersed with the invariant checks. They run only on the subset of requests that reach each stage (earlier failures short-circuit the evaluation).');
tbl(
  ['Stage', 'When', 'What it does'],
  [
    ['Stage 1 — Actor mapping',            'After assertRequestShape',                 'Translates client role names to canonical authority classes via policy.actorMappings. Resolved class is used for all downstream invariant checks.'],
    ['Stage 2 — Blocked action policies',  'After INV-12 match check',                '"blocked" action policies produce immediate REJECT before provenance, logging, or approval checks run. Fast-fail for categorically forbidden actions.'],
    ['Stage 3 — Effective approval',       'Before assertPolicyPack',                 'Computes effective approvalRequired from workflowRules + approvalChains + "requires_approval" action policies. If policy requires approval and request does not, request is patched before assertApprovalState runs.'],
    ['Stage 4 — Approval chain authority', 'After all invariants pass',               'If policy.approvalChains defines a chain for this workflow, the approver\'s class must be in that list. Narrows valid approvers beyond the core HumanAuthorityClass check.'],
  ],
  [100, 102, 289], 28
);

subBanner('3.4  Gate-Issued Result Registry');
para('A module-private WeakSet — const _gateIssuedResults = new WeakSet<object>() — is defined at module scope in execution-gate-service.ts. Every GateResult returned by evaluate() is registered: _gateIssuedResults.add(result) before return. The exported assertIsGateIssued(result) function checks membership and throws CerbaSealError(INV-06, MALFORMED_REQUEST, REJECT) if the result is absent.');
callout('The WeakSet is not exported. It is not accessible via any public API. A caller cannot register their own GateResult. This is the structural guarantee behind INV-06 (NO_BYPASS_OF_EXECUTION_GATE).', AMBER);

subBanner('3.5  Decision Flow Summary');
codeBlock(
  'gate.evaluate(request)\n' +
  '  │\n' +
  '  ├─ assertRequestShape / assertActorAuthorityClass / assertKnownActionClass fails\n' +
  '  │    → throw CerbaSealError → REJECT (caught, controlled GateResult)\n' +
  '  │\n' +
  '  ├─ Proposal/action mismatch (INV-12) → REJECT\n' +
  '  │\n' +
  '  ├─ Policy stage 2: action "blocked" → REJECT\n' +
  '  │\n' +
  '  ├─ assertPolicyPack null (INV-01) → REJECT\n' +
  '  ├─ assertProvenance null/incomplete (INV-02) → REJECT\n' +
  '  ├─ assertLoggingReady false (INV-04) → REJECT\n' +
  '  ├─ assertProposalBoundary (INV-05) → REJECT\n' +
  '  ├─ assertProhibitedUse true (INV-10) → REJECT\n' +
  '  ├─ assertControlStatus stale/invalid (INV-08) → REJECT\n' +
  '  ├─ assertTrustState untrusted (INV-09) → REJECT\n' +
  '  │\n' +
  '  ├─ assertApprovalState approval missing → HOLD\n' +
  '  ├─ assertApprovalState forRequestId mismatch → REJECT\n' +
  '  ├─ assertApprovalState timestamp invalid/predates → REJECT\n' +
  '  ├─ assertApprovalState invalid approver class → REJECT\n' +
  '  ├─ assertApprovalState privilegedAuthSatisfied false → REJECT\n' +
  '  ├─ assertApprovalState signature empty → REJECT\n' +
  '  │\n' +
  '  ├─ Policy stage 4: approver not in approval chain → REJECT\n' +
  '  │\n' +
  '  └─ All checks pass → ALLOW\n' +
  '       ReleaseAuthorization issued. Result registered in _gateIssuedResults.',
  'Complete evaluate() decision tree'
);

// ═══════════════════════════════════════════════════════════════════════════════
// §4  INVARIANT FRAMEWORK
// ═══════════════════════════════════════════════════════════════════════════════
newPage('§4 — Invariant Framework');
sectionBanner('4', 'Invariant Framework');

callout('Invariant contract: All 12 invariants are unconditional. They are evaluated before policy rules on every request. Policy cannot suppress or relax any invariant. This is the foundational guarantee CerbaSeal provides to compliance teams and auditors.', GREEN);
doc.y += 4;

tbl(
  ['Code', 'Constant Name', 'What It Enforces', 'State on Failure'],
  [
    ['INV-01', 'NO_POLICY_PACK_NO_EXECUTION',           'policyPackRef must be non-null. No policy reference means no execution path exists in CerbaSeal.', 'REJECT'],
    ['INV-02', 'NO_PROVENANCE_NO_ACTION',               'provenanceRef must be non-null with all three sub-fields (modelVersion, ruleSetVersion, sourceHash) non-empty.', 'REJECT'],
    ['INV-03', 'NO_REQUIRED_APPROVAL_NO_RELEASE',       'When approval is effectively required (caller flag OR WORKFLOWS_REQUIRING_APPROVAL OR policy), a valid ApprovalArtifact must be present and pass all sub-checks.', 'HOLD or REJECT'],
    ['INV-04', 'NO_LOGGING_NO_EXECUTION',               'loggingReady must be true. The caller asserts an audit log is ready to receive the outcome before the gate issues a release.', 'REJECT'],
    ['INV-05', 'AI_NON_AUTHORITATIVE',                  'proposal.authorityBearing must be false. An AI-sourced proposal (proposalSourceKind "ai") submitted by an "ai" actor is unconditionally rejected regardless of approval state.', 'REJECT'],
    ['INV-06', 'NO_BYPASS_OF_EXECUTION_GATE',           'GateResult objects used to assemble evidence must be in the _gateIssuedResults WeakSet. Hand-constructed or externally-sourced results are rejected by assertIsGateIssued().', 'REJECT'],
    ['INV-07', 'IMMUTABLE_DECISION_ENVELOPE',           'DecisionEnvelope.immutable is a literal type true, sealed at issuance. The type system and WeakSet registration together enforce no post-issuance mutation.', 'REJECT'],
    ['INV-08', 'STALE_CONTROLS_BLOCK_SENSITIVE_RELEASE','For requests with sensitive: true, controlStatus.criticalControlsValid must be true AND controlStatus.stale must be false.', 'REJECT'],
    ['INV-09', 'TRUST_STATE_REQUIRED',                  'trustState.trusted must be true. An untrusted actor (expired session, revoked token) is rejected unconditionally — no policy override is possible.', 'REJECT'],
    ['INV-10', 'PROHIBITED_USE_MUST_BLOCK',             'prohibitedUse: true triggers REJECT before any other checks after schema validation. No configuration, policy, or approval can unblock a prohibited use.', 'REJECT'],
    ['INV-11', 'REQUEST_SCHEMA_AND_ACTION_CLASS_VALID', 'requestId/jurisdiction/createdAt non-empty, proposal.reasonCodes non-empty, actorAuthorityClass registered, proposedActionClass and proposal.requestedActionClass known.', 'REJECT (throw)'],
    ['INV-12', 'PROPOSAL_AND_REQUEST_ACTION_MUST_MATCH','proposedActionClass must exactly equal proposal.requestedActionClass. A proposal for a different action than the request declares is structurally invalid.', 'REJECT'],
  ],
  [42, 138, 240, 71], 30
);

// ═══════════════════════════════════════════════════════════════════════════════
// §5  DOMAIN TYPE REFERENCE
// ═══════════════════════════════════════════════════════════════════════════════
newPage('§5 — Domain Type Reference');
sectionBanner('5', 'Domain Type Reference');

subBanner('5.1  GovernedRequest — All 17 Fields');
para('GovernedRequest is the sole input to gate.evaluate(). Every field carries a specific governance meaning evaluated by at least one invariant or policy rule. There is no purely informational field.');

tbl(
  ['Field', 'Type', 'Required by Invariant / Policy'],
  [
    ['requestId',           'string',                       'INV-11: must be non-empty after trim. Correlates audit log, evidence bundle, and release authorization.'],
    ['workflowClass',       'WorkflowClass',                'Core type. Determines approval chain lookup and WORKFLOWS_REQUIRING_APPROVAL membership check.'],
    ['jurisdiction',        'string',                       'INV-11: must be non-empty. Informational for evidence; extensible for future policy-level jurisdiction rules.'],
    ['actorId',             'string',                       'Included in audit log payload. No invariant check beyond schema; used for evidence and diagnostic reports.'],
    ['actorAuthorityClass', 'AuthorityClass',               'INV-11: must be in allowedAuthorityClasses. INV-05: must not be "ai" (after actor mapping resolution).'],
    ['proposedActionClass', 'UnknownableActionClass',       'INV-11: must be in ALLOWED_ACTION_CLASSES. INV-12: must match proposal.requestedActionClass.'],
    ['proposal',            'DecisionProposal',             'INV-05: proposal.authorityBearing must be false. INV-12: proposal.requestedActionClass must match proposedActionClass.'],
    ['sensitive',           'boolean',                      'INV-08: if true, controlStatus.criticalControlsValid must be true and controlStatus.stale must be false.'],
    ['prohibitedUse',       'boolean',                      'INV-10: if true, immediate REJECT unconditionally.'],
    ['policyPackRef',       'PolicyPackRef | null',         'INV-01: must be non-null.'],
    ['provenanceRef',       'ProvenanceRef | null',         'INV-02: must be non-null with all sub-fields non-empty.'],
    ['approvalRequired',    'boolean',                      'INV-03: when true (or overridden by policy), approvalArtifact must pass all checks.'],
    ['approvalArtifact',    'ApprovalArtifact | null',      'INV-03: required when effectiveApprovalRequired. Subject to 6 sub-checks (see §3.2).'],
    ['loggingReady',        'boolean',                      'INV-04: must be true. Caller asserts the audit log service is ready.'],
    ['controlStatus',       'ControlStatus',                'INV-08: { criticalControlsValid, stale, verificationRunId }. Checked for sensitive requests.'],
    ['trustState',          'TrustState',                   'INV-09: { trusted, trustStateId }. trusted must be true unconditionally.'],
    ['createdAt',           'string (ISO 8601)',             'INV-11: must be non-empty. INV-03: approvalArtifact.approvedAt must not predate this value.'],
  ],
  [105, 130, 256], 22
);

newPage('§5 — Domain Type Reference (cont.)');

subBanner('5.2  DecisionProposal, PolicyPackRef, ProvenanceRef');
tbl(
  ['Type', 'Fields', 'Notes'],
  [
    ['DecisionProposal',
     'proposalSourceKind: "ai" | "deterministic_rule"\nauthorityBearing: boolean\nrequestedActionClass: UnknownableActionClass\nconfidence: number | null\nreasonCodes: string[]\nproposalCreatedAt: string',
     'INV-05 checks authorityBearing (must be false) and the combination of proposalSourceKind + actorAuthorityClass. reasonCodes must be non-empty (INV-11). confidence is informational.'],
    ['PolicyPackRef',
     'id: string\nversion: string',
     'INV-01: object must be non-null. Individual field content is not validated by the gate — the policy pack is identified but not fetched at evaluation time.'],
    ['ProvenanceRef',
     'modelVersion: string\nruleSetVersion: string\nsourceHash: string',
     'INV-02: object must be non-null AND all three fields must be non-empty after trim. A partially populated ProvenanceRef fails the invariant.'],
  ],
  [100, 196, 195], 46
);

subBanner('5.3  ApprovalArtifact — All 7 Fields');
tbl(
  ['Field', 'Type', 'Invariant Check'],
  [
    ['approvalId',              'string',              'Identifies this specific approval record. Stored in evidence for audit trail.'],
    ['approverId',              'string',              'Identity of the approving human. Stored in evidence.'],
    ['forRequestId',            'string',              'INV-03: must exactly equal GovernedRequest.requestId. Prevents approval reuse across requests.'],
    ['approverAuthorityClass',  'HumanAuthorityClass', 'INV-03: must be one of analyst | reviewer | manager | compliance_officer. "ai" and "system" cannot approve.'],
    ['privilegedAuthSatisfied', 'boolean',             'INV-03: must be true. Represents completion of step-up authentication (MFA, privileged session, etc.).'],
    ['immutableSignature',      'string',              'INV-03: must be non-empty after trim. Content is not cryptographically validated in v0.1.0 (HMAC planned for v0.2.0).'],
    ['approvedAt',              'string (ISO 8601)',   'INV-03: must be a valid ISO date AND must not predate GovernedRequest.createdAt. Prevents replayed artifacts.'],
  ],
  [122, 106, 263], 22
);

subBanner('5.4  ControlStatus & TrustState');
tbl(
  ['Type', 'Field', 'Type', 'Invariant / Notes'],
  [
    ['ControlStatus', 'criticalControlsValid', 'boolean', 'INV-08: must be true for sensitive requests. Client control system asserts all mandatory controls are active.'],
    ['ControlStatus', 'stale',                'boolean', 'INV-08: must be false for sensitive requests. A stale control status is as dangerous as an invalid one.'],
    ['ControlStatus', 'verificationRunId',    'string',  'Identifies the control verification run. Informational for audit traceability — not checked by gate.'],
    ['TrustState',    'trusted',              'boolean', 'INV-09: must be true unconditionally. Single false value immediately rejects the request.'],
    ['TrustState',    'trustStateId',         'string',  'Identifies the trust evaluation event (session token hash, IdP assertion ID, etc.). For audit traceability.'],
  ],
  [76, 110, 60, 245], 22
);

newPage('§5 — Domain Type Reference (cont.)');

subBanner('5.5  GateResult');
para('GateResult is the return value of gate.evaluate(). All three fields are always present. releaseAuthorization and blockedActionRecord are mutually exclusive.');
codeBlock(
  'interface GateResult {\n' +
  '  decisionEnvelope:    DecisionEnvelope;          // always present; immutable: true\n' +
  '  releaseAuthorization: ReleaseAuthorization | null; // non-null iff finalState === "ALLOW"\n' +
  '  blockedActionRecord:  BlockedActionRecord  | null; // non-null iff finalState === "HOLD" | "REJECT"\n' +
  '}',
  'GateResult interface (src/domain/types/core.ts)'
);

subBanner('5.6  DecisionEnvelope & DecisionTrace');
tbl(
  ['Field', 'Type', 'Source / Notes'],
  [
    ['envelopeId',            'string',              'Deterministic: "env_" + requestId. Stable identifier for this decision record.'],
    ['requestId',             'string',              'Echoes GovernedRequest.requestId. Primary correlation key for audit log and evidence.'],
    ['workflowClass',         'WorkflowClass',       'Echoes the resolved workflowClass from the (possibly mapped) request.'],
    ['finalState',            '"ALLOW"|"HOLD"|"REJECT"', 'Terminal gate decision.'],
    ['permittedActionClass',  'ActionClass | null',  'Non-null only when finalState === "ALLOW". The specific validated action class.'],
    ['humanApprovalRequired', 'boolean',             'Reflects request.approvalRequired (the caller-supplied flag, not the effective value).'],
    ['humanApprovalPresent',  'boolean',             'True when approvalArtifact !== null on the request.'],
    ['proposalSourceKind',    '"ai"|"deterministic_rule"', 'Copied from proposal.proposalSourceKind for evidence classification.'],
    ['immutable',             'true',                'Literal type true. TypeScript enforces this at compile time; runtime behavior enforces it structurally.'],
    ['evidenceBundleId',      'string',              'Deterministic: "evidence_" + requestId. Cross-references the EvidenceBundle.'],
    ['trace',                 'DecisionTrace',       '{ checkedInvariants: InvariantCode[], reasonCodes: ReasonCode[], evaluatedAt: string }'],
    ['issuedAt',              'string (ISO)',         'Timestamp of gate evaluation (nowIso() call at the end of the happy path).'],
  ],
  [110, 120, 261], 20
);

subBanner('5.7  ReleaseAuthorization & BlockedActionRecord');
codeBlock(
  'interface ReleaseAuthorization {\n' +
  '  releaseAuthorizationId: string;   // "release_" + requestId\n' +
  '  requestId:              string;\n' +
  '  envelopeId:             string;\n' +
  '  actionClass:            ActionClass;  // the validated, permitted action\n' +
  '  releasedAt:             string;   // ISO timestamp\n' +
  '}\n' +
  '\n' +
  'interface BlockedActionRecord {\n' +
  '  requestId:         string;\n' +
  '  finalState:        "HOLD" | "REJECT";\n' +
  '  reasonCodes:       ReasonCode[];\n' +
  '  checkedInvariants: InvariantCode[];\n' +
  '  recordedAt:        string;   // ISO timestamp\n' +
  '}',
  'src/domain/types/core.ts'
);

subBanner('5.8  Discriminated Union Types');
tbl(
  ['Type', 'Values', 'Notes'],
  [
    ['AuthorityClass',       '"system" | "ai" | "analyst" | "reviewer" | "manager" | "compliance_officer"', 'Core set, always registered. Extended via CerbaSealConfig.authorityClasses.extended. "ai" blocked by INV-05 as approver.'],
    ['HumanAuthorityClass',  '"analyst" | "reviewer" | "manager" | "compliance_officer"', 'Subset of AuthorityClass valid in ApprovalArtifact.approverAuthorityClass. "system" and "ai" are excluded.'],
    ['WorkflowClass',        '"fraud_triage" | "transaction_escalation" | "account_hold_recommendation"', '"fraud_triage" is hardcoded in WORKFLOWS_REQUIRING_APPROVAL — always requires approval.'],
    ['ActionClass',          '"allow" | "hold" | "reject" | "escalate" | "account_hold"', 'Registered in ALLOWED_ACTION_CLASSES Set. Extended via CerbaSealConfig.actionClasses.extended.'],
    ['DecisionState',        '"ALLOW" | "HOLD" | "REJECT"', 'Terminal states. HOLD is the only recoverable state (missing approval that can be obtained).'],
    ['ProposalSourceKind',   '"ai" | "deterministic_rule"', 'INV-05 uses this in combination with actorAuthorityClass to detect AI self-authorisation attempts.'],
    ['UnknownableActionClass', 'ActionClass | (string & {})', 'Allows any string at the boundary (JSON deserialization). assertKnownActionClass() narrows it to ActionClass or throws INV-11.'],
  ],
  [110, 218, 163], 24
);

// ═══════════════════════════════════════════════════════════════════════════════
// §6  REASON CODE REFERENCE
// ═══════════════════════════════════════════════════════════════════════════════
newPage('§6 — Reason Code Reference');
sectionBanner('6', 'Reason Code Reference');

para('17 reason codes are defined in src/domain/constants/reason-codes.ts. They appear in DecisionTrace.reasonCodes and BlockedActionRecord.reasonCodes. Multiple codes may be present per decision — the specific violation code is always accompanied by a terminal decision code.');

tbl(
  ['Reason Code', 'Category', 'Produced by', 'Meaning'],
  [
    ['DECISION_ALLOWED',              'Terminal',        'ALLOW path',               'All invariants and policy rules passed. ReleaseAuthorization issued.'],
    ['DECISION_HELD',                 'Terminal',        'HOLD path',                'Request valid but approval required and absent. Resumable — approval can be obtained.'],
    ['DECISION_REJECTED',             'Terminal',        'REJECT path',              'An invariant or policy rule failed. Terminal — no release path without a new request.'],
    ['NO_POLICY_PACK',                'INV-01',          'assertPolicyPack()',        'policyPackRef is null.'],
    ['NO_PROVENANCE',                 'INV-02',          'assertProvenance()',        'provenanceRef is null or one of its three sub-fields is empty.'],
    ['REQUIRED_APPROVAL_MISSING',     'INV-03',          'assertApprovalState()',     'Approval effectively required but approvalArtifact is null → HOLD.'],
    ['INVALID_APPROVAL_AUTHORITY',    'INV-03',          'assertApprovalState()',     'forRequestId mismatch, approvedAt predates createdAt, or approver class invalid or not in chain.'],
    ['PRIVILEGED_AUTH_NOT_SATISFIED', 'INV-03',          'assertApprovalState()',     'privilegedAuthSatisfied is false on the ApprovalArtifact.'],
    ['APPROVAL_SIGNATURE_MISSING',    'INV-03',          'assertApprovalState()',     'immutableSignature is empty or whitespace.'],
    ['LOGGING_NOT_READY',             'INV-04',          'assertLoggingReady()',      'loggingReady is false.'],
    ['AI_CANNOT_AUTHORIZE',           'INV-05',          'assertProposalBoundary()', 'proposal.authorityBearing is true, OR proposalSourceKind "ai" with actorAuthorityClass "ai".'],
    ['PROHIBITED_USE',                'INV-10',          'assertProhibitedUse()',     'prohibitedUse is true — unconditional block.'],
    ['CONTROL_STALE_OR_INVALID',      'INV-08',          'assertControlStatus()',     'sensitive: true and controlStatus.stale is true or criticalControlsValid is false.'],
    ['TRUST_STATE_INVALID',           'INV-09',          'assertTrustState()',        'trustState.trusted is false.'],
    ['UNKNOWN_ACTION_CLASS',          'INV-11',          'assertKnownActionClass()',  'proposedActionClass or proposal.requestedActionClass not in ALLOWED_ACTION_CLASSES.'],
    ['MALFORMED_REQUEST',             'INV-11 / Fallback','assertRequestShape() / catch', 'Schema validation failure. Also used by assertIsGateIssued() fallback and non-CerbaSealError catch block.'],
    ['INVALID_PROPOSAL',              'INV-12',          'evaluate() inline check',  'proposedActionClass !== proposal.requestedActionClass.'],
  ],
  [128, 60, 102, 201], 22
);

// ═══════════════════════════════════════════════════════════════════════════════
// §7  CONFIGURATION SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════
newPage('§7 — Configuration System');
sectionBanner('7', 'Configuration System');

subBanner('7.1  CerbaSealConfig & GateConfig');
para('CerbaSealConfig registers extended authority, workflow, and action class identifiers. The core sets are hardcoded in constants and cannot be removed. Extended classes are additive. GateConfig is a discriminated union of CerbaSealConfig and the older ExecutionGateConfig (which uses additionalAuthorityClasses instead of the structured class extension format). Both are accepted by the constructor via buildAllowedAuthorityClasses().');

codeBlock(
  '// Three core sets (always registered, cannot be removed):\n' +
  'CORE_AUTHORITY_CLASSES = ["system","ai","analyst","reviewer","manager","compliance_officer"]\n' +
  'CORE_WORKFLOW_CLASSES  = ["fraud_triage","transaction_escalation","account_hold_recommendation"]\n' +
  'CORE_ACTION_CLASSES    = ["allow","hold","reject","escalate","account_hold"]\n' +
  '\n' +
  'interface CerbaSealClassExtension {\n' +
  '  core?:    readonly string[];   // documentation only; gate ignores at runtime\n' +
  '  extended: readonly string[];   // additional identifiers the gate will accept\n' +
  '}\n' +
  'interface CerbaSealConfig {\n' +
  '  authorityClasses?: CerbaSealClassExtension;\n' +
  '  workflowClasses?:  CerbaSealClassExtension;\n' +
  '  actionClasses?:    CerbaSealClassExtension;\n' +
  '}\n' +
  'interface ExecutionGateConfig {\n' +
  '  additionalAuthorityClasses?: readonly string[];\n' +
  '}\n' +
  'type GateConfig = CerbaSealConfig | ExecutionGateConfig;',
  'src/config/cerbaseal-config.ts'
);

codeBlock(
  '// cerbaseal.config.json — example\n' +
  '{\n' +
  '  "authorityClasses": {\n' +
  '    "core":     ["system","ai","analyst","reviewer","manager","compliance_officer"],\n' +
  '    "extended": ["risk_officer","senior_analyst","director"]\n' +
  '  },\n' +
  '  "workflowClasses": {\n' +
  '    "core":     ["fraud_triage","transaction_escalation","account_hold_recommendation"],\n' +
  '    "extended": ["insurance_claim_review","kyc_escalation"]\n' +
  '  }\n' +
  '}',
  'cerbaseal.config.json example'
);

para('loadCerbaSealConfig(configPath?) reads cerbaseal.config.json from the repo root (resolved via import.meta.url) or the explicit path. Returns {} (empty config = core classes only) if the file does not exist. Throws if the file exists but cannot be parsed.');

subBanner('7.2  CerbaSealPolicy');
para('CerbaSealPolicy carries four categories of client-specific rules. All are optional — an absent field means that category of policy is inactive. Policy rules are additive: they can narrow permissions but cannot bypass invariants.');

codeBlock(
  'interface CerbaSealPolicy {\n' +
  '  actorMappings?:  Record<string, AuthorityClass>;\n' +
  '     // e.g. { "Head of Risk": "manager", "Senior Fraud Analyst": "analyst" }\n' +
  '\n' +
  '  approvalChains?: Record<string, string[]>;\n' +
  '     // e.g. { "fraud_triage": ["manager","compliance_officer"] }\n' +
  '     // Also triggers approval requirement for the listed workflow\n' +
  '\n' +
  '  actionPolicies?: Record<string, Record<string, PolicyActionBehavior>>;\n' +
  '     // e.g. { "fraud_triage": { "allow": "requires_approval", "reject": "auto_allow" } }\n' +
  '\n' +
  '  workflowRules?:  WorkflowRule[];\n' +
  '     // e.g. [{ workflowClass: "kyc_escalation", requiresApproval: true }]\n' +
  '}',
  'src/config/cerbaseal-policy.ts — CerbaSealPolicy interface'
);

subBanner('7.3  WorkflowRule & PolicyActionBehavior');
tbl(
  ['Type / Field', 'Values / Type', 'Semantics'],
  [
    ['PolicyActionBehavior', '"requires_approval" | "auto_allow" | "blocked"', '"blocked" → REJECT immediately (stage 2). "requires_approval" → adds to effective approval requirement (stage 3). "auto_allow" → no policy-side approval added; core invariant evaluation still applies.'],
    ['WorkflowRule.workflowClass', 'string', 'The workflow class identifier this rule applies to. Must match the workflowClass field on GovernedRequest.'],
    ['WorkflowRule.requiresApproval', 'boolean', 'true → gate enforces approval even if caller set approvalRequired: false. false → documents intent; does NOT suppress an approvalChains requirement for the same workflow.'],
  ],
  [120, 152, 219], 32
);
para('Approval requirement is ADDITIVE. The gate requires approval if ANY of these are true: (1) request.approvalRequired === true, (2) workflowClass in WORKFLOWS_REQUIRING_APPROVAL ("fraud_triage"), (3) a workflowRules entry has requiresApproval: true, (4) workflow appears in approvalChains, (5) action has "requires_approval" policy. The most restrictive source always wins.');

// ═══════════════════════════════════════════════════════════════════════════════
// §8  AUDIT & EVIDENCE CHAIN
// ═══════════════════════════════════════════════════════════════════════════════
newPage('§8 — Audit & Evidence Chain');
sectionBanner('8', 'Audit & Evidence Chain');

subBanner('8.1  IAuditLogService Interface');
codeBlock(
  'interface IAuditLogService {\n' +
  '  append(event: AuditEventPayload): AuditLogEntry;\n' +
  '  list(): AuditLogEntry[];\n' +
  '  listByRequestId(requestId: string): AuditLogEntry[];\n' +
  '  verifyChain(): boolean;  // true iff every SHA-256 hash link is valid\n' +
  '}\n' +
  '\n' +
  'interface AuditEventPayload {\n' +
  '  requestId: string;\n' +
  '  eventType: AuditEventType;\n' +
  '  payload:   Record<string, unknown>;\n' +
  '}\n' +
  '\n' +
  'interface AuditLogEntry {\n' +
  '  eventId:       string;          // UUID\n' +
  '  requestId:     string;\n' +
  '  eventType:     AuditEventType;\n' +
  '  timestamp:     string;\n' +
  '  payloadHash:   string;          // SHA-256 of event payload\n' +
  '  previousHash:  string | null;   // null for first entry\n' +
  '  entryHash:     string;          // SHA-256 of (payloadHash + previousHash + metadata)\n' +
  '}',
  'src/services/audit/append-only-log-service.ts + src/domain/types/audit.ts'
);

subBanner('8.2  AppendOnlyLogService (In-Memory)');
para('In-memory implementation. Entries are held in a private AuditLogEntry[] array. append() calls buildEntry() (from audit-hash-utils.ts) which computes the SHA-256 chain link, pushes the entry, and returns a deepClone. verifyChain() traverses all entries and validates every hash link. All returned values are deepClone copies — callers cannot mutate internal state.');
callout('Use AppendOnlyLogService in development and tests. Use FileBackedAppendOnlyLogService in any client deployment where audit entries must survive process restarts.', AMBER);

subBanner('8.3  FileBackedAppendOnlyLogService (Persistent)');
para('Persistent implementation backed by a JSONL file. Constructor behavior: if the file exists, reads all lines and reconstitutes the in-memory chain. If the chain is broken on disk, verifyChain() returns false from the first call. append() calls buildEntry() then appendFileSync() — the entry is on disk before append() returns (crash-safe). deepClone applied to all returned values.');
tbl(
  ['Property', 'Detail'],
  [
    ['File format',      'JSONL — one JSON-serialised AuditLogEntry per line. Human-readable and grep-friendly.'],
    ['Write durability', 'appendFileSync() — synchronous write to disk. Process crash after append() returns means the entry is durably recorded.'],
    ['Constructor',      'constructor(filePath: string) — reads and reconstitutes the chain on startup. No options; the path is the only parameter.'],
    ['Chain loading',    'Each line is JSON.parse()d to AuditLogEntry and pushed to the in-memory array. Hashes are stored in the JSONL, not recomputed.'],
    ['Verification',     'verifyChain() delegates to verifyChainUtil from audit-hash-utils.ts — same algorithm as in-memory, same guarantee.'],
    ['Production setup', 'Set LOG_PATH env var to a persistent volume path (e.g. /app/data/audit.jsonl). Docker Compose mounts ./data:/app/data.'],
  ],
  [110, 381], 22
);

subBanner('8.4  EvidenceBundleService');
para('EvidenceBundleService.createBundle({ request, gateResult }) assembles an EvidenceBundle. It first calls assertIsGateIssued(gateResult) — any result not in _gateIssuedResults throws CerbaSealError(INV-06) before any log append occurs. It then appends multiple audit events and returns the complete bundle.');
tbl(
  ['Audit event appended', 'AuditEventType', 'Condition'],
  [
    ['Request evaluated',        '"REQUEST_EVALUATED"',       'Always — first event; includes finalState, workflowClass, evidenceBundleId, actorId in payload'],
    ['Release authorized',       '"RELEASE_AUTHORIZED"',      'When finalState === "ALLOW"'],
    ['Action blocked',           '"ACTION_BLOCKED"',          'When finalState === "HOLD" or "REJECT"'],
    ['Evidence bundle created',  '"EVIDENCE_BUNDLE_CREATED"', 'After full bundle assembly'],
  ],
  [140, 134, 217], 22
);
para('The returned EvidenceBundle contains: evidenceBundleId ("evidence_" + requestId), the original GovernedRequest (deepClone), the DecisionEnvelope, ReleaseAuthorization or null, BlockedActionRecord or null, eventChain (all AuditLogEntry objects for this requestId), and createdAt.');

subBanner('8.5  Audit Event Types');
codeBlock(
  'type AuditEventType =\n' +
  '  | "REQUEST_EVALUATED"       // gate.evaluate() called\n' +
  '  | "RELEASE_AUTHORIZED"      // ALLOW decision — action may proceed\n' +
  '  | "ACTION_BLOCKED"          // HOLD or REJECT — action blocked\n' +
  '  | "EVIDENCE_BUNDLE_CREATED" // EvidenceBundleService.createBundle() completed\n' +
  '  | "EXPORT_MANIFEST_CREATED" // pnpm export:proof completed',
  'src/domain/types/audit.ts — AuditEventType'
);

// ═══════════════════════════════════════════════════════════════════════════════
// §9  HTTP API REFERENCE
// ═══════════════════════════════════════════════════════════════════════════════
newPage('§9 — HTTP API Reference');
sectionBanner('9', 'HTTP API Reference');

para('The deployment-starter/index.ts HTTP server exposes the enforcement gate as a minimal REST API. The server is unauthenticated — network-level access control is the operator\'s responsibility. Both endpoints always return JSON. The server is implemented with Node.js core http.createServer() (no Express or other framework).');

subBanner('POST /evaluate');
tbl(
  ['Property', 'Detail'],
  [
    ['Method + Path',     'POST /evaluate'],
    ['Content-Type',      'application/json'],
    ['Request body',      'JSON-serialised GovernedRequest object (see §5.1 for all 17 fields)'],
    ['Success (200)',     'JSON-serialised GateResult { decisionEnvelope, releaseAuthorization, blockedActionRecord }'],
    ['Body parse error (400)', '{ "error": "Invalid JSON — expected a GovernedRequest object" }'],
    ['Read error (400)',  '{ "error": "Failed to read request body" }'],
    ['Gate exception (422)', '{ "error": "<CerbaSealError.message>" } — always a controlled message, never a raw stack trace'],
    ['Side effect',       'logService.append({ requestId, eventType: "REQUEST_EVALUATED", payload: { finalState, workflowClass, evidenceBundleId, actorId } })'],
    ['Not found (404)',   '{ "error": "Not found", "routes": ["POST /evaluate","GET /health"] }'],
  ],
  [110, 381], 22
);

codeBlock(
  '# ALLOW scenario — all invariants satisfied, manager approval present\n' +
  'curl -X POST http://localhost:3000/evaluate \\\n' +
  '  -H "Content-Type: application/json" \\\n' +
  '  -d \'{\n' +
  '    "requestId": "req-001",\n' +
  '    "workflowClass": "fraud_triage",\n' +
  '    "jurisdiction": "US-CA",\n' +
  '    "actorId": "analyst-jane",\n' +
  '    "actorAuthorityClass": "analyst",\n' +
  '    "proposedActionClass": "allow",\n' +
  '    "proposal": {\n' +
  '      "proposalSourceKind": "ai",\n' +
  '      "authorityBearing": false,\n' +
  '      "requestedActionClass": "allow",\n' +
  '      "confidence": 0.94,\n' +
  '      "reasonCodes": ["MODEL_HIGH_CONF"],\n' +
  '      "proposalCreatedAt": "2026-06-08T10:00:00Z"\n' +
  '    },\n' +
  '    "sensitive": true,\n' +
  '    "prohibitedUse": false,\n' +
  '    "policyPackRef":  { "id": "acme-policy", "version": "1.0.0" },\n' +
  '    "provenanceRef":  { "modelVersion": "v3.1", "ruleSetVersion": "v2.0", "sourceHash": "sha256:abc" },\n' +
  '    "approvalRequired": true,\n' +
  '    "approvalArtifact": {\n' +
  '      "approvalId": "appr-001", "approverId": "mgr-john",\n' +
  '      "forRequestId": "req-001",\n' +
  '      "approverAuthorityClass": "manager",\n' +
  '      "privilegedAuthSatisfied": true,\n' +
  '      "immutableSignature": "sig-abc",\n' +
  '      "approvedAt": "2026-06-08T10:01:00Z"\n' +
  '    },\n' +
  '    "loggingReady": true,\n' +
  '    "controlStatus": { "criticalControlsValid": true, "stale": false, "verificationRunId": "run-1" },\n' +
  '    "trustState": { "trusted": true, "trustStateId": "ts-001" },\n' +
  '    "createdAt": "2026-06-08T10:00:00Z"\n' +
  '  }\'',
  'curl — POST /evaluate (ALLOW scenario)'
);

subBanner('GET /health');
tbl(
  ['Property', 'Detail'],
  [
    ['Method + Path',  'GET /health'],
    ['Response',       '200 OK always (degraded state is signalled via status field, not HTTP code)'],
    ['Response body',  '{ "status": "ok" | "degraded", "gateReady": true, "auditChainValid": boolean, "uptime": number }'],
    ['status',         '"ok" when auditChainValid true; "degraded" when verifyChain() returns false (chain tampered or disk corrupted)'],
    ['gateReady',      'Always true if server started cleanly. Gate service loaded config and policy at module init time.'],
    ['auditChainValid','logService.verifyChain() — checks the full SHA-256 chain. "degraded" means the log has been tampered with.'],
    ['uptime',         '(Date.now() - START_MS) / 1000 — seconds since server start'],
  ],
  [90, 401], 22
);

codeBlock(
  '$ curl http://localhost:3000/health\n' +
  '{\n' +
  '  "status": "ok",\n' +
  '  "gateReady": true,\n' +
  '  "auditChainValid": true,\n' +
  '  "uptime": 142.7\n' +
  '}',
  'Healthy health response'
);

subBanner('Environment Variables');
tbl(
  ['Variable', 'Default', 'Purpose'],
  [
    ['PORT',        '3000',                              'TCP port the HTTP server binds to. Replit assigns PORT automatically; Docker Compose maps it from .env.'],
    ['LOG_PATH',    '"memory"',                          '"memory" → AppendOnlyLogService (in-process, not persistent). Any other value → FileBackedAppendOnlyLogService at that path.'],
    ['CONFIG_PATH', '<cwd>/cerbaseal.config.json',       'Explicit path to config file. join(process.cwd(), "cerbaseal.config.json") when not set.'],
    ['POLICY_PATH', '<cwd>/cerbaseal.policy.json',       'Explicit path to policy file. join(process.cwd(), "cerbaseal.policy.json") when not set.'],
  ],
  [72, 144, 275], 22
);

// ═══════════════════════════════════════════════════════════════════════════════
// §10  DEPLOYMENT ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════════════════
newPage('§10 — Deployment Architecture');
sectionBanner('10', 'Deployment Architecture');

subBanner('10.1  Path A — Docker Compose (Recommended)');
para('Docker Compose is the recommended deployment path. It requires Docker ≥ 20 and Docker Compose ≥ 2.0 on the target machine — no Node.js, pnpm, or TypeScript toolchain needed. The enforcement stack runs inside a self-contained container.');

tbl(
  ['Property', 'Detail'],
  [
    ['Base image (both stages)', 'node:22-alpine'],
    ['Build stage',              'Install pnpm@9 globally. Run pnpm install in deployment-starter/. Resolve the file:../ cerbaseal-review symlink to concrete files (cp -r) so the runtime image contains no symlinks.'],
    ['Runtime command',          'node_modules/.bin/tsx deployment-starter/index.ts from WORKDIR /app'],
    ['Audit log volume',         './data:/app/data — audit.jsonl persists across container restarts. Set LOG_PATH=/app/data/audit.jsonl in .env.'],
    ['Health check directive',   'wget -qO- http://localhost:3000/health — 30s interval, 5s timeout, 3 retries, 10s start period'],
    ['Config/policy override',   'Mount a custom file: -v ./client-policy.json:/app/cerbaseal.policy.json:ro'],
    ['Restart policy',           'restart: unless-stopped — container recovers from crashes without operator intervention'],
    ['Port mapping',             '"3000:3000" by default in docker-compose.yml. Change via PORT env var and port mapping together.'],
  ],
  [110, 381], 22
);

codeBlock(
  '# From the deployment-starter/ directory:\n' +
  'cp .env.template .env          # copy template\n' +
  '# Edit .env: CERBASEAL_ENV=production, LOG_PATH=/app/data/audit.jsonl\n' +
  'docker compose up              # builds image (~3-5 min first time)\n' +
  '\n' +
  '# Confirm healthy:\n' +
  'curl http://localhost:3000/health\n' +
  '# { "status": "ok", "gateReady": true, "auditChainValid": true, "uptime": 1.4 }',
  'Docker Compose quick start'
);

subBanner('10.2  Path B — Node.js Direct');
para('Used when the client environment has Node.js 18+ and pnpm available, or when the partner needs full source access during pilot configuration. This is also the path used by the Replit deployment starter.');

tbl(
  ['Step', 'Command', 'Expected Outcome'],
  [
    ['1', 'pnpm install',                     'node_modules populated; pnpm-lock.yaml unchanged'],
    ['2', 'pnpm test',                         '391 tests passing across 17 test files (all must pass)'],
    ['3', 'pnpm audit:repo',                   '16/16 automated governance checks passing'],
    ['4', 'pnpm setup',                        'Interactive wizard writes cerbaseal.config.json and cerbaseal.policy.json'],
    ['5', 'tsx deployment-starter/verify.ts', '9/9 assertions passing across 3 scenarios (ALLOW, HOLD, REJECT)'],
    ['6', 'pnpm export:proof',                 'cerbaseal-proof.json written with checksum and git provenance'],
    ['7', 'pnpm verify:proof',                 'Checksum match confirmed — proof snapshot integrity verified'],
    ['8', 'tsx deployment-starter/index.ts',   'Server listening — logs port, log path, config path, policy path'],
  ],
  [20, 172, 299], 22
);

para('Dependency model: deployment-starter/package.json declares "cerbaseal-review": "file:../" — a pnpm file: reference to the repo root. Running pnpm install inside deployment-starter/ creates a node_modules/cerbaseal-review symlink. When published to npm in v0.2.0+, this changes to "cerbaseal-review": "^0.2.0". All import paths in deployment-starter/index.ts remain identical — only the package.json line changes.');

// ═══════════════════════════════════════════════════════════════════════════════
// §11  TEST COVERAGE
// ═══════════════════════════════════════════════════════════════════════════════
newPage('§11 — Test Coverage');
sectionBanner('11', 'Test Coverage');

para('The test suite covers enforcement gate invariants, audit chain integrity, evidence assembly, configuration and policy layers, adversarial bypass attempts, integration scenarios, and regression snapshots. All tests run with Vitest. The suite must pass 391/391 before any client deployment.');

tbl(
  ['Test File', 'Category', 'Tests', 'Coverage Focus'],
  [
    ['execution-gate-service.test.ts',              'Unit',        '19',  'All 12 invariants, policy rules, ALLOW/HOLD/REJECT decision states, GateResult structure, actor mapping'],
    ['adversarial-integrity.test.ts',               'Security',   '66',  'Tamper attempts, hand-constructed GateResult, invariant circumvention, approval forgery patterns'],
    ['security/contextual-boundary.test.ts',        'Security',   '25',  'Authority class boundary isolation, cross-context access attempts, role escalation vectors'],
    ['security/fail-closed.test.ts',                'Security',    '2',  'Gate fails closed (REJECT) on schema error and on any unknown / unexpected input'],
    ['security/non-forgery.test.ts',                'Security',    '2',  'SHA-256 chain non-forgery — tampered AuditLogEntry detected by verifyChain()'],
    ['security/misuse-scenarios.test.ts',           'Security',   '34',  'Real-world misuse: AI self-auth, stale controls on sensitive, unsigned approval, prohibited use override'],
    ['audit-evidence-export.test.ts',               'Integration', '6',  'EvidenceBundle assembly, ExportManifest structure, export:proof + verify:proof round-trip'],
    ['persistent-audit-log.test.ts',                'Integration','12',  'FileBackedAppendOnlyLogService: crash recovery, JSONL persistence, chain reconstitution'],
    ['diagnostic-report-service.test.ts',           'Integration', '5',  'DiagnosticReport assembly, severity classification (CRITICAL/HIGH/MEDIUM/LOW), replay consistency'],
    ['config-policy-layer.test.ts',                 'Unit',        '—',  'CerbaSealConfig loading, class extension, CerbaSealPolicy validation, all four policy categories'],
    ['integration/full-flow.test.ts',               'Integration', '1',  'End-to-end: GovernedRequest → gate → audit → evidence → export → verify → proof match'],
    ['integration/browser-demo-routes.test.ts',     'Integration','28',  'Browser demo HTTP server routes: all API endpoints, portal pages, and navigation'],
    ['integration/review-portal-routes.test.ts',    'Integration','110', 'Review portal routes: decision summary, evidence retrieval, replay API, diagnostic API'],
    ['integration/external-signal-examples.test.ts','Integration','16',  'External actor integration: multi-tenant scenarios, role mapping, chain verify via HTTP'],
    ['integration/support-readiness.test.ts',       'Integration','23',  'Support scenarios: operator action reports, system health checks, all three decision states'],
    ['integration/system-integration.test.ts',      'Integration', '1',  'Full system integration: gate + policy + audit + evidence all working together end-to-end'],
    ['snapshots/enforcement-loop.snapshot.test.ts', 'Snapshot',   '41',  'Regression snapshots: specific GovernedRequest shapes always produce identical GateResult outputs'],
  ],
  [180, 52, 32, 227], 22
);

subBanner('pnpm audit:repo — 16 Automated Governance Checks');
para('The repo audit is a separate layer from the test suite. It verifies governance integrity properties of the repository itself, not just source behaviour. All 16 checks must pass before any client deployment. Check #1 requires the test suite to pass, so a failing test suite blocks all audit checks.');

tbl(
  ['#', 'What It Verifies'],
  [
    ['01', 'Test suite passes (391/391)'],
    ['02', 'No prohibited cross-layer imports in enforcement core (gate cannot import from evidence layer)'],
    ['03', 'Exactly 12 invariant codes defined in INVARIANTS constant'],
    ['04', 'Every InvariantCode referenced in tests is present in INVARIANTS'],
    ['05', 'Every ReasonCode referenced in tests is present in REASON_CODES'],
    ['06', 'ExecutionGateService does not export _gateIssuedResults or internal WeakSet'],
    ['07', 'IAuditLogService interface is satisfied by both AppendOnlyLogService and FileBackedAppendOnlyLogService'],
    ['08', 'FileBackedAppendOnlyLogService uses appendFileSync (not async writeFile)'],
    ['09', 'DecisionEnvelope.immutable field is literal type true in the type definition'],
    ['10', 'Tests import via public API surface only (no direct internal module coupling)'],
    ['11', 'cerbaseal.config.json parses without error and matches CerbaSealConfig schema'],
    ['12', 'cerbaseal.policy.json parses without error and matches CerbaSealPolicy schema'],
    ['13', 'CerbaSealError always carries invariant code, reason code, and finalState on every constructor call'],
    ['14', 'No stale test-count references in documentation files'],
    ['15', 'Partner kit documents exist and contain required section headings'],
    ['16', 'export:proof + verify:proof round-trip produces identical checksums (idempotent)'],
  ],
  [22, 469], 20
);

// ═══════════════════════════════════════════════════════════════════════════════
// §12  PARTNER DELIVERY FRAMEWORK
// ═══════════════════════════════════════════════════════════════════════════════
newPage('§12 — Partner Delivery Framework');
sectionBanner('12', 'Partner Delivery Framework');

subBanner('Partner Kit Documents (docs/partner-kit/)');
tbl(
  ['File', 'Title', 'Primary Audience', 'When to Use'],
  [
    ['00-OVERVIEW.md',            'Partner Delivery Kit Overview',    'All partners',         'Kit navigation, cert levels, tools, Tier 3 escalation boundaries'],
    ['01-sales-brief.md',         'Sales Brief',                      'Partner sales leads',  'ICP qualification, positioning, commercial model, opening objections'],
    ['02-technical-brief.md',     'Technical Brief',                  'Partner tech leads',   '7-layer architecture, invariants, evidence chain, integration patterns'],
    ['03-deployment-guide.md',    'Deployment Guide',                 'Partner engineers',    'Step-by-step: env setup, wizard, audit, verification, evidence export'],
    ['04-pilot-guide.md',         '1-Day Pilot Guide',                'Pilot leads',          'CerbaSeal Express Pilot — morning to evidence package in one day'],
    ['05-support-guide.md',       'Support Guide',                    'All partners',         '10 most common issues with root cause, diagnosis steps, resolution'],
    ['06-objection-handling.md',  'Objection Handling',               'Partner sales leads',  '8 enterprise objections with CTO / CISO / CPO / CFO calibrated responses'],
    ['07-certification-framework.md', 'Certification Framework',      'All partners',         '3 cert levels: competencies, practical exercises, pass/fail criteria'],
  ],
  [132, 122, 98, 139], 22
);

subBanner('Certification Levels');
tbl(
  ['Level', 'Name', 'Prerequisite', 'What a Pass Proves'],
  [
    ['Level 1', 'Deploy',      'None',                        'Clone repo, run pnpm install, pass pnpm test (391/391), pass pnpm audit:repo (16/16), run 3-scenario verify (9/9 assertions), export and verify proof snapshot.'],
    ['Level 2', 'Configure',   'Level 1',                     'Author a complete cerbaseal.policy.json for a new client workflow without assistance. All approval chains, actor mappings, action policies correct. Verification passes end-to-end.'],
    ['Level 3', 'Lead Pilots', 'Level 2 + one client delivery', 'Run a full pilot independently from kickoff to signed evidence package. Deliver all 7 audit-kit documents. Resolve support issues without Tier 3 escalation.'],
  ],
  [40, 68, 108, 275], 32
);

subBanner('Engagement Lifecycle');
tbl(
  ['Phase', 'Who', 'Deliverable'],
  [
    ['Pre-sales',      'Partner sales lead',    'Qualify client via ICP scorecard. Technical discovery meeting. Sales Brief objection handling.'],
    ['Scoping',        'Partner tech lead',     'Workflow mapping: governed workflow, AI actor, human approver roles, action classes, jurisdiction.'],
    ['Deployment',     'Partner engineer',      'Path A or B. pnpm test 391/391, pnpm audit:repo 16/16. Config and policy files written.'],
    ['Configuration',  'Partner engineer',      'cerbaseal.policy.json authored: approval chains, actor mappings, action policies per client workflow.'],
    ['Verification',   'Partner engineer',      '3-scenario verify.ts run. 9/9 assertions pass. Results reviewed with client.'],
    ['Pilot run',      'Partner + client',      'Real or representative requests submitted through gate. Evidence captured automatically by audit log.'],
    ['Evidence close', 'Partner',               'pnpm export:proof → cerbaseal-proof.json. pnpm verify:proof → checksum confirmed. Delivered to client.'],
    ['Handover',       'Partner',               'Client operations team trained on diagnostic portal, support guide, and pnpm audit:repo.'],
  ],
  [80, 94, 317], 22
);

subBanner('What Requires Lamont Labs Tier 3 Escalation');
para('Level 2+ partners are expected to resolve 80%+ of issues independently. The following items require direct Lamont Labs involvement:');
['New core enforcement invariants — adding a new hard rule requires TypeScript changes and new tests.',
 'New ProposalSourceKind values beyond "ai" and "deterministic_rule".',
 'PKI-backed cryptographic signing of DecisionEnvelope objects (HMAC is self-service; PKI requires implementation work).',
 'Third-party security review coordination — not completed for v0.1.0; scheduled for v0.2.0.',
 'Windows deployment — not tested in v0.1.0; support posture is unclear.'].forEach(bul);

// ═══════════════════════════════════════════════════════════════════════════════
// §13  SECURITY PROPERTIES & THREAT MODEL
// ═══════════════════════════════════════════════════════════════════════════════
newPage('§13 — Security Properties & Threat Model');
sectionBanner('13', 'Security Properties & Threat Model');

subBanner('Core Security Properties');
tbl(
  ['Property', 'Mechanism', 'Test Coverage'],
  [
    ['No execution without gate evaluation',    '_gateIssuedResults WeakSet + assertIsGateIssued() in EvidenceBundleService. Any GateResult not from evaluate() is rejected with INV-06.',                   'adversarial-integrity.test.ts, misuse-scenarios.test.ts'],
    ['AI cannot self-authorise',                'INV-05 checked unconditionally. "ai" actorAuthorityClass blocked as approver; AI-sourced proposal from AI actor always REJECT.',                               'INV-05, execution-gate-service.test.ts'],
    ['Tamper-evident audit log',                'SHA-256 forward chaining. Every AuditLogEntry.entryHash covers previousHash. verifyChain() detects any historical modification.',                             'security/non-forgery.test.ts'],
    ['Immutable decision envelopes',            'DecisionEnvelope.immutable: true is a literal type. WeakSet registration ties the envelope to a specific evaluate() call.',                                    'INV-07, adversarial-integrity.test.ts'],
    ['Prohibited use unconditional block',      'INV-10 fires after INV-11/12 but before all other invariants. prohibitedUse: true → REJECT regardless of approval, provenance, or policy.',                   'INV-10, misuse-scenarios.test.ts'],
    ['Fail-closed on all unknown input',        'Unknown action class → CerbaSealError throw (REJECT). Schema error → controlled REJECT. Non-CerbaSealError exceptions → fallback REJECT GateResult.',        'security/fail-closed.test.ts'],
    ['Policy cannot relax invariants',          'Policy stages 1–4 are evaluated around the invariant sequence. No policy stage can suppress or skip an invariant that has already been added to the check list.', 'adversarial-integrity.test.ts'],
    ['Approval non-reuse',                      'INV-03: approvalArtifact.forRequestId must equal request.requestId. A valid approval from request A cannot be replayed against request B.',                    'assertApprovalState(), adversarial-integrity.test.ts'],
    ['Approval timestamp integrity',            'INV-03: approvedAt must be a valid ISO date and must not predate request.createdAt. Prevents forged or replayed approval artifacts.',                           'assertApprovalState(), adversarial-integrity.test.ts'],
    ['No network dependency at evaluation',     'evaluate() is a pure synchronous function. No network calls, no file reads, no side effects. Gate availability is independent of external service availability.', 'execution-gate-service.test.ts'],
  ],
  [130, 208, 153], 28
);

subBanner('Threat Model — In Scope for v0.1.0');
tbl(
  ['Threat', 'Attacker Goal', 'Mitigation in v0.1.0'],
  [
    ['AI self-authorisation',       'AI system approves its own proposal, bypassing human review',                       'INV-05: actorAuthorityClass "ai" structurally blocked as approver; proposalSourceKind "ai" + actorClass "ai" always REJECT'],
    ['Approval forgery / replay',   'Attacker reuses a valid ApprovalArtifact across different requests',                'INV-03: forRequestId must match requestId; approvedAt must not predate createdAt'],
    ['Audit log tampering',         'Attacker modifies historical entries to hide a blocked decision',                   'SHA-256 forward chain; verifyChain() reported on GET /health'],
    ['Gate bypass via evidence',    'Caller hand-constructs GateResult, skips gate.evaluate(), feeds directly to evidence', 'assertIsGateIssued() + _gateIssuedResults WeakSet in EvidenceBundleService'],
    ['Policy relaxation',           'Partner misconfigures policy to exempt a workflow from invariant checks',            'Policy layer evaluated after invariants; no policy mechanism can suppress INV-01 through INV-12'],
    ['Stale control exploitation',  'Caller submits sensitive request after controls have expired',                       'INV-08: controlStatus.stale must be false and criticalControlsValid must be true for sensitive requests'],
    ['Prohibited use bypass',       'Caller submits prohibited use request with all other fields valid',                  'INV-10: prohibitedUse checked early in evaluation sequence — unconditional REJECT regardless of approval or policy'],
    ['AI authority boundary',       'AI sets authorityBearing: true on its proposal to claim execution authority',        'INV-05: proposal.authorityBearing === true always REJECT, regardless of actorAuthorityClass'],
  ],
  [100, 152, 239], 26
);

subBanner('Out of Scope for v0.1.0');
['PKI-backed cryptographic signing of DecisionEnvelope objects (HMAC available; PKI planned v0.2.0).',
 'Third-party penetration testing or independent security audit (scheduled for v0.2.0).',
 'Network-level access control and authentication of HTTP API callers (operator responsibility).',
 'Denial-of-service resilience — rate limiting, circuit breaking, WAF (operator responsibility).',
 'Key management infrastructure for approval signatures (v0.1.0 checks presence, not cryptographic validity).'].forEach(bul);

callout('Security review status: CerbaSeal-Core v0.1.0 has not undergone a formal third-party security review. Partners must communicate this to clients during pilot kickoff. An independent security assessment is a milestone gate for v0.2.0.', AMBER);

// ═══════════════════════════════════════════════════════════════════════════════
// BACK COVER
// ═══════════════════════════════════════════════════════════════════════════════
rawPage();
doc.rect(0, 0, PW, PH).fill(NAVY);
doc.rect(0, 0, 6, PH).fill(GOLD);

doc.font('Helvetica-Bold').fontSize(30).fillColor(WHITE);
doc.text('CerbaSeal-Core', 76, PH / 2 - 80);
doc.font('Helvetica').fontSize(14).fillColor(GOLD);
doc.text('v0.1.0  ·  System Architecture & Technical Reference', 76, PH / 2 - 40);
doc.rect(76, PH / 2 - 5, 80, 2.5).fill(GOLD);
doc.font('Helvetica').fontSize(9.5).fillColor(WHITE + '66');
doc.text(
  'This document is the authoritative technical reference for CerbaSeal-Core.\n' +
  'Issued under the Lamont Labs Partner Confidentiality Agreement.\n' +
  'Redistribution outside the authorised partner organisation is prohibited.',
  76, PH / 2 + 16, { width: PW - 200, lineGap: 5 }
);
doc.rect(76, PH - 90, PW - 130, 0.8).fill(GOLD + '33');
doc.font('Helvetica-Bold').fontSize(9).fillColor(GOLD);
doc.text('Lamont Labs', 76, PH - 74);
doc.font('Helvetica').fontSize(9).fillColor(WHITE + '55');
doc.text('© 2026 Lamont Labs  ·  All rights reserved', 76, PH - 58);

// ── Finalize ──────────────────────────────────────────────────────────────────
doc.end();
console.log('PDF written to: ' + OUT);
console.log('Total pages: ' + pageNum);
