import PDFDocument from "pdfkit";
import { createWriteStream } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../cerbaseal-repo-breakdown.pdf");

const doc = new PDFDocument({ size: "A4", margin: 56, info: {
  Title: "CerbaSeal-Core v0.1.0 — System & Repository Breakdown",
  Author: "Jesse Lamont / Lamont Labs",
  Subject: "Technical reference document"
}});
doc.pipe(createWriteStream(OUT));

// ─── Palette ───────────────────────────────────────────────────────────────
const C = {
  black:    "#0A0A0A",
  white:    "#FFFFFF",
  slate:    "#1E2430",
  accent:   "#4F6EF7",
  accentDk: "#2E4AC0",
  muted:    "#6B7280",
  rule:     "#D1D5DB",
  codeBg:   "#F3F4F6",
  codeText: "#1F2937",
  tagBg:    "#EFF6FF",
  tagText:  "#1D4ED8",
  red:      "#DC2626",
  green:    "#16A34A",
  amber:    "#D97706",
};

const W = doc.page.width - 112; // usable width

// ─── Helpers ───────────────────────────────────────────────────────────────
function rule(gap = 8) {
  doc.moveDown(gap / 12);
  doc.moveTo(56, doc.y).lineTo(56 + W, doc.y).strokeColor(C.rule).lineWidth(0.5).stroke();
  doc.moveDown(gap / 12);
}

function sectionHeader(title, subtitle) {
  if (doc.y > doc.page.height - 160) doc.addPage();
  doc.moveDown(0.6);
  doc.rect(56, doc.y, W, 36).fill(C.slate);
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(13)
     .text(title, 68, doc.y - 30, { width: W - 80 });
  if (subtitle) {
    doc.fillColor(C.accent).font("Helvetica").fontSize(8.5)
       .text(subtitle, 68, doc.y + 2, { width: W - 80 });
  }
  doc.moveDown(1.1);
}

function h3(text) {
  doc.moveDown(0.5);
  doc.fillColor(C.accentDk).font("Helvetica-Bold").fontSize(10.5).text(text, 56);
  doc.moveDown(0.2);
}

function body(text, opts = {}) {
  doc.fillColor(C.black).font("Helvetica").fontSize(9.5)
     .text(text, 56, doc.y, { width: W, lineGap: 2.5, ...opts });
}

function bullet(items, indent = 68) {
  for (const item of items) {
    const label = typeof item === "string" ? item : item.label;
    const detail = typeof item === "object" ? item.detail : null;
    const color  = typeof item === "object" && item.color ? item.color : C.black;
    doc.rect(indent, doc.y + 4.5, 4, 4).fill(C.accent);
    if (detail) {
      doc.fillColor(color).font("Helvetica-Bold").fontSize(9)
         .text(label + "  ", indent + 10, doc.y, { continued: true, width: W - (indent - 56) });
      doc.fillColor(C.muted).font("Helvetica").fontSize(9)
         .text(detail, { lineGap: 2 });
    } else {
      doc.fillColor(color).font("Helvetica").fontSize(9)
         .text(label, indent + 10, doc.y, { width: W - (indent - 56), lineGap: 2 });
    }
  }
  doc.moveDown(0.2);
}

function tag(text, color = C.tagText, bg = C.tagBg) {
  const tw = doc.widthOfString(text, { fontSize: 8 }) + 10;
  doc.rect(doc.x, doc.y + 1, tw, 14).fill(bg);
  doc.fillColor(color).font("Helvetica-Bold").fontSize(8)
     .text(text, doc.x + 5, doc.y - 12, { lineBreak: false });
  doc.x += tw + 6;
}

function codeBlock(lines) {
  const h = lines.length * 13 + 10;
  doc.rect(56, doc.y, W, h).fill(C.codeBg);
  let y = doc.y + 6;
  for (const line of lines) {
    doc.fillColor(C.codeText).font("Courier").fontSize(8).text(line, 62, y, { lineBreak: false });
    y += 13;
  }
  doc.y = doc.y + h + 4;
  doc.moveDown(0.3);
}

function invRow(code, name, trigger, outcome) {
  const rowH = 18;
  const x0 = 56;
  const cols = [42, 160, 190, 55]; // widths
  let x = x0;
  const y = doc.y;
  // code
  doc.rect(x, y, cols[0], rowH).fill(C.tagBg);
  doc.fillColor(C.tagText).font("Helvetica-Bold").fontSize(8)
     .text(code, x + 4, y + 5, { width: cols[0] - 8, lineBreak: false });
  x += cols[0];
  // name
  doc.rect(x, y, cols[1], rowH).fill(C.white);
  doc.fillColor(C.black).font("Helvetica-Bold").fontSize(8)
     .text(name, x + 4, y + 5, { width: cols[1] - 8, lineBreak: false });
  x += cols[1];
  // trigger
  doc.rect(x, y, cols[2], rowH).fill(C.white);
  doc.fillColor(C.muted).font("Helvetica").fontSize(8)
     .text(trigger, x + 4, y + 5, { width: cols[2] - 8, lineBreak: false });
  x += cols[2];
  // outcome
  const outColor = outcome === "REJECT" ? C.red : outcome === "HOLD" ? C.amber : C.green;
  doc.rect(x, y, cols[3], rowH).fill(C.white);
  doc.fillColor(outColor).font("Helvetica-Bold").fontSize(8)
     .text(outcome, x + 4, y + 5, { width: cols[3] - 8, lineBreak: false });
  doc.moveTo(x0, y + rowH).lineTo(x0 + W, y + rowH).strokeColor(C.rule).lineWidth(0.4).stroke();
  doc.y = y + rowH + 1;
}

// ═══════════════════════════════════════════════════════════════════════════
// COVER PAGE
// ═══════════════════════════════════════════════════════════════════════════
doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.slate);

doc.fillColor(C.accent).font("Helvetica-Bold").fontSize(9)
   .text("LAMONT LABS  ·  CONFIDENTIAL", 56, 52, { width: W, align: "right" });

doc.fillColor(C.white).font("Helvetica-Bold").fontSize(42)
   .text("CerbaSeal", 56, 180, { width: W });
doc.fillColor(C.accent).font("Helvetica-Bold").fontSize(20)
   .text("Core v0.1.0", 56, 232);
doc.fillColor(C.white).font("Helvetica").fontSize(14)
   .text("System & Repository Breakdown", 56, 265, { width: W });

doc.moveTo(56, 305).lineTo(56 + W, 305).strokeColor(C.accent).lineWidth(2).stroke();

doc.fillColor("#CBD5E1").font("Helvetica").fontSize(10).lineGap(5)
   .text([
     "Deterministic execution governance infrastructure for consequential",
     "AI-assisted workflows. Fail-closed by design.",
   ].join("\n"), 56, 322, { width: W });

// Stats bar
const stats = [
  ["419", "Tests"],
  ["12", "Invariants"],
  ["16", "Audit Checks"],
  ["8", "Starter Kits"],
  ["17", "Reason Codes"],
];
const sw = W / stats.length;
stats.forEach(([n, l], i) => {
  const sx = 56 + i * sw;
  doc.rect(sx, 430, sw - 8, 60).fill(C.accentDk);
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(22)
     .text(n, sx + 8, 442, { width: sw - 16, align: "center" });
  doc.fillColor("#94A3B8").font("Helvetica").fontSize(8)
     .text(l, sx + 8, 466, { width: sw - 16, align: "center" });
});

doc.fillColor("#64748B").font("Helvetica").fontSize(8)
   .text(`Jesse Lamont  ·  Lamont Labs  ·  Generated ${new Date().toDateString()}`,
         56, doc.page.height - 48, { width: W, align: "center" });

// ═══════════════════════════════════════════════════════════════════════════
// PAGE 2 — TABLE OF CONTENTS
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
doc.rect(0, 0, doc.page.width, 70).fill(C.slate);
doc.fillColor(C.white).font("Helvetica-Bold").fontSize(18).text("Contents", 56, 22);
doc.fillColor(C.accent).font("Helvetica").fontSize(9).text("CerbaSeal-Core v0.1.0 — System & Repository Breakdown", 56, 47);

doc.y = 90;
const toc = [
  ["1", "Project Overview & Purpose"],
  ["2", "Repository Structure"],
  ["3", "Architecture"],
  ["4", "Core Services"],
  ["5", "Domain Model & Types"],
  ["6", "Configuration & Policy"],
  ["7", "The 12 Core Invariants"],
  ["8", "Reason Codes"],
  ["9", "Integration Starter Kits (8 kits)"],
  ["10", "Audit & Evidence System"],
  ["11", "CLI Scripts & pnpm Commands"],
  ["12", "Test Coverage"],
  ["13", "Deployed Artifacts"],
];
for (const [num, title] of toc) {
  const y = doc.y;
  doc.fillColor(C.accent).font("Helvetica-Bold").fontSize(10)
     .text(`${num}.`, 56, y, { width: 24, lineBreak: false });
  doc.fillColor(C.black).font("Helvetica").fontSize(10)
     .text(title, 80, y, { width: W - 40 });
  doc.moveTo(80, doc.y).lineTo(56 + W, doc.y).strokeColor(C.rule).lineWidth(0.3).dash(2, { space: 3 }).stroke();
  doc.undash();
  doc.moveDown(0.15);
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. PROJECT OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
sectionHeader("1. Project Overview & Purpose", "What CerbaSeal is and why it exists");

body(
  "CerbaSeal is a structural enforcement layer for consequential AI-assisted workflows. " +
  "It answers one question at every decision point: may this proposed action proceed? " +
  "The answer is always one of three deterministic outcomes — ALLOW, HOLD (pending human " +
  "review), or REJECT — and every decision is recorded in a tamper-evident, hash-linked " +
  "audit log."
);
doc.moveDown(0.5);
body(
  "The core design philosophy is organised around invariants — non-negotiable rules that " +
  "cannot be overridden by configuration, policy, or caller behaviour — rather than features. " +
  "AI systems are explicitly restricted to proposal-only roles; they can never self-authorise."
);

doc.moveDown(0.7);
h3("Key Design Principles");
bullet([
  { label: "Fail-closed", detail: "Any unrecognised or malformed input produces REJECT, never silent pass-through." },
  { label: "AI non-authoritative", detail: "AI actors may propose actions but can never carry final authority. This is an unconditional invariant (INV-05)." },
  { label: "gate.evaluate() never throws", detail: "All internal errors are caught and returned as structured GateResult with REJECT or HOLD." },
  { label: "Deterministic & replayable", detail: "Decisions can be re-evaluated against the same request via ReplayService for independent verification." },
  { label: "No silent fallbacks", detail: "Every failure mode surfaces as an explicit reason code on the DecisionEnvelope." },
]);

doc.moveDown(0.5);
h3("Maturity & Scope");
body(
  "CerbaSeal-Core v0.1.0 is described as a review-ready enforcement spine — architecturally " +
  "real and covered by 419 tests, but not yet production-hardened. It is intended for " +
  "pilot integrations, compliance demonstrations, and partner evaluation."
);

// ═══════════════════════════════════════════════════════════════════════════
// 2. REPOSITORY STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
sectionHeader("2. Repository Structure", "Top-level directory layout");

codeBlock([
  "cerbaseal-review/",
  "├── src/                     Core enforcement library",
  "│   ├── config/              CerbaSeal config & policy loaders",
  "│   ├── domain/              Types, constants, formatters, builders",
  "│   └── services/            7 service modules (gate, evidence, audit, …)",
  "├── examples/                8 integration starter kits + shared utilities",
  "│   ├── INTEGRATION-GUIDE.md Decision tree for choosing the right kit",
  "│   └── …/                  One directory per kit",
  "├── artifacts/               Deployed web applications",
  "│   └── cerbaseal-demo/      Partner portal & live demo (React + Vite)",
  "├── tests/                   419 tests across 15 test files",
  "├── scripts/                 Repo-audit, proof export/verify, generators",
  "├── docs/                    Pilot documents, pricing, commercial framework",
  "├── cerbaseal.policy.json    Default policy pack (parseable at runtime)",
  "├── package.json             pnpm workspace root",
  "└── tsconfig.json            TypeScript project configuration",
]);

doc.moveDown(0.3);
h3("Architectural Boundaries (enforced by audit:repo)");
bullet([
  "tests/ may not import from src/ directly (only via public surface).",
  "examples/ may not import private internals; only the public service API.",
  "No circular imports within src/.",
]);

// ═══════════════════════════════════════════════════════════════════════════
// 3. ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader("3. Architecture", "Seven layers from input to evidence");

const layers = [
  ["Input Layer", "Schema validation, actor authority class resolution, loggingReady check."],
  ["Decision Layer", "Maps proposals (AI / Deterministic) to policy behaviours; enforces AI non-authority rule."],
  ["Execution Gate", "Single entry point. Evaluates all 12 invariants. Returns GateResult (ALLOW / HOLD / REJECT)."],
  ["Audit Layer", "Append-only, SHA-256 hash-linked log. Every event produces a chain-linked AuditLogEntry."],
  ["Evidence Layer", "Assembles EvidenceBundle: request + DecisionEnvelope + ReleaseAuthorization + eventChain."],
  ["Export / Replay Layer", "ReplayService re-runs original requests to verify recorded outcomes still hold."],
  ["Support / Diagnostic Layer", "DiagnosticReport, OperatorActionReport — human-readable analysis of gate decisions."],
];

for (let i = 0; i < layers.length; i++) {
  const [name, desc] = layers[i];
  const y = doc.y;
  doc.rect(56, y, 18, 18).fill(C.accent);
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(9)
     .text(String(i + 1), 56, y + 5, { width: 18, align: "center", lineBreak: false });
  doc.fillColor(C.black).font("Helvetica-Bold").fontSize(9.5)
     .text(name, 82, y + 2, { width: 120, lineBreak: false });
  doc.fillColor(C.muted).font("Helvetica").fontSize(9)
     .text(desc, 82, y + 13, { width: W - 28 });
  doc.y = doc.y + 6;
  doc.moveTo(82, doc.y).lineTo(56 + W, doc.y).strokeColor(C.rule).lineWidth(0.3).stroke();
  doc.moveDown(0.3);
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. CORE SERVICES
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
sectionHeader("4. Core Services", "src/services/ — seven modules");

const services = [
  {
    dir: "execution/",
    name: "ExecutionGateService",
    role: "Primary enforcement engine",
    desc: "Evaluates GovernedRequest objects against all 12 invariants in strict order. The single point of entry for all governed actions. Returns GateResult containing DecisionEnvelope plus either ReleaseAuthorization (ALLOW) or BlockedActionRecord (HOLD/REJECT). Never throws — internal errors surface as structured REJECT results.",
  },
  {
    dir: "evidence/",
    name: "EvidenceBundleService",
    role: "Decision artifact assembly",
    desc: "Assembles immutable EvidenceBundle snapshots from a GateResult and GovernedRequest. Records 3–4 audit events per evaluation (REQUEST_EVALUATED, RELEASE_AUTHORIZED or ACTION_BLOCKED, EVIDENCE_BUNDLE_CREATED). Rejects GateResult objects not produced by ExecutionGateService.evaluate() to prevent self-constructed forgeries.",
  },
  {
    dir: "audit/",
    name: "AppendOnlyLogService  /  FileBackedAppendOnlyLogService",
    role: "Hash-linked audit log",
    desc: "Maintains the SHA-256 hash chain of AuditLogEntry records. In-memory implementation for tests; file-backed implementation for deployments. Each entry stores: eventId, requestId, eventType, timestamp, payloadHash, previousHash, entryHash. Chain integrity is verifiable without the original payloads.",
  },
  {
    dir: "diagnostics/",
    name: "DiagnosticReportService",
    role: "Decision analysis",
    desc: "Generates DiagnosticReport artifacts containing status, severity (INFO / WARNING / CRITICAL), operator explanation, and per-invariant pass/fail detail. Used by the partner portal Operator View and by support-readiness validation.",
  },
  {
    dir: "support/",
    name: "SystemIntegrityService  /  OperatorActionService",
    role: "System health & operator guidance",
    desc: "SystemIntegrityService runs internal verification scenarios to confirm predictable gate behaviour. OperatorActionService translates gate results into actionable remediation steps for human operators.",
  },
  {
    dir: "replay/",
    name: "ReplayService",
    role: "Decision verification",
    desc: "Re-runs original GovernedRequest objects through the gate and compares outcomes to previously recorded DecisionEnvelopes. Enables independent auditors to verify that recorded decisions remain consistent with current enforcement logic.",
  },
  {
    dir: "export/",
    name: "ExportManifestService",
    role: "Proof & export",
    desc: "Generates ExportManifest artifacts and cryptographic proof snapshots of the current system state. Used by pnpm export:proof / pnpm verify:proof workflows.",
  },
];

for (const s of services) {
  if (doc.y > doc.page.height - 120) doc.addPage();
  h3(`${s.name}   —   ${s.role}`);
  doc.fillColor(C.muted).font("Courier").fontSize(8).text(`src/services/${s.dir}`, 56);
  doc.moveDown(0.2);
  body(s.desc);
  doc.moveDown(0.4);
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. DOMAIN MODEL
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
sectionHeader("5. Domain Model & Types", "src/domain/ — core type contracts");

h3("Primary Types (src/domain/types/core.ts)");
const types = [
  { label: "GovernedRequest", detail: "The gate's input. Contains: requestId, workflowClass, jurisdiction, actorId, actorAuthorityClass, proposal (AI/Deterministic), sensitive, prohibitedUse, policyPackRef, provenanceRef, approvalRequired, approvalArtifact, loggingReady, controlStatus, trustState." },
  { label: "GateResult", detail: "Gate output. Contains: decisionEnvelope, releaseAuthorization (or null), blockedActionRecord (or null), diagnosticReport, triggeredInvariants." },
  { label: "DecisionEnvelope", detail: "Immutable outcome record. Contains: envelopeId, evidenceBundleId, requestId, finalState (ALLOW/HOLD/REJECT), workflowClass, reasonCodes[], immutableSignature, decidedAt." },
  { label: "ReleaseAuthorization", detail: "The authoritative permission token. Present only on ALLOW. Contains: releaseAuthorizationId, requestId, actionClass, authorizedBy, releaseSignature, expiresAt, issuedAt." },
  { label: "BlockedActionRecord", detail: "Present on HOLD and REJECT. Contains: requestId, finalState, reasonCodes[], blockedAt." },
  { label: "ApprovalArtifact", detail: "Evidence of human review. Contains: approvalId, approverId, forRequestId, approverAuthorityClass, privilegedAuthSatisfied, immutableSignature, approvedAt." },
  { label: "ApprovalProposal", detail: "AI or deterministic proposal embedded in GovernedRequest. Contains: proposalSourceKind, authorityBearing, requestedActionClass, confidence, reasonCodes, proposalCreatedAt." },
];
bullet(types);

doc.moveDown(0.4);
h3("Audit Types (src/domain/types/audit.ts)");
const auditTypes = [
  { label: "AuditLogEntry", detail: "Hash-chain node: eventId, requestId, eventType, timestamp, payloadHash, previousHash, entryHash." },
  { label: "AuditEventType", detail: 'Union: "REQUEST_EVALUATED" | "RELEASE_AUTHORIZED" | "ACTION_BLOCKED" | "EVIDENCE_BUNDLE_CREATED" | "EXPORT_MANIFEST_CREATED".' },
  { label: "EvidenceBundle", detail: "Self-contained decision artifact: evidenceBundleId, request, decisionEnvelope, releaseAuthorization, blockedActionRecord, eventChain, createdAt." },
  { label: "ExportManifest", detail: "Proof export record: manifestId, evidenceBundleId, requestId, envelopeId, exportedAt, schemaVersion." },
];
bullet(auditTypes);

doc.moveDown(0.4);
h3("Authority Classes");
body("The gate recognises six actor authority classes, defined in cerbaseal-config.ts:");
bullet([
  { label: "system", detail: "Automated governance processes. May perform most actions without human approval." },
  { label: "ai", detail: "AI models and agents. Proposal-only. Cannot self-authorise under any circumstances (INV-05)." },
  { label: "analyst", detail: "Human analysts. May approve certain workflows when explicit ApprovalArtifact is provided." },
  { label: "reviewer", detail: "Compliance reviewers. Elevated approval authority." },
  { label: "manager", detail: "Management-level approvers." },
  { label: "compliance_officer", detail: "Highest authority class for approval chains." },
]);

// ═══════════════════════════════════════════════════════════════════════════
// 6. CONFIGURATION & POLICY
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
sectionHeader("6. Configuration & Policy", "src/config/ — system settings and policy packs");

h3("CerbaSealConfig (cerbaseal-config.ts)");
body("System-wide settings loaded by ExecutionGateService. Defines the set of valid authority classes and hardcoded workflow constraints.");
doc.moveDown(0.3);
bullet([
  { label: "WORKFLOWS_REQUIRING_APPROVAL", detail: 'Hardcoded set. Currently includes "fraud_triage". Always requires human ApprovalArtifact regardless of actor class.' },
  { label: "authorityClasses", detail: "Registered set of valid actorAuthorityClass values." },
]);

doc.moveDown(0.4);
h3("CerbaSealPolicy (cerbaseal-policy.ts  +  cerbaseal.policy.json)");
body(
  "Optional client-specific policy layer applied on top of the invariant core. " +
  "Parsed from cerbaseal.policy.json at runtime (check 16 in audit:repo verifies it parses without error)."
);
doc.moveDown(0.3);
bullet([
  { label: "actorMappings", detail: 'Map client role labels to core authority classes, e.g. "VP Risk" → "manager".' },
  { label: "approvalChains", detail: "Define which authority classes may approve specific workflow/action combinations." },
  { label: "actionPolicies", detail: 'Per workflow+action rules: "requires_approval", "auto_allow", or "blocked".' },
]);

doc.moveDown(0.4);
h3("loadCerbaSealConfig()");
body(
  "Factory function that returns the active CerbaSealConfig. Used by ExecutionGateService, " +
  "all validation scripts, and the demo portal."
);

// ═══════════════════════════════════════════════════════════════════════════
// 7. THE 12 CORE INVARIANTS
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
sectionHeader("7. The 12 Core Invariants", "Non-negotiable enforcement rules — cannot be overridden by config or caller");

body(
  "Invariants are evaluated in strict order by ExecutionGateService. The first violated " +
  "invariant determines the outcome. 100% of invariants are covered by tests (12/12). " +
  "Invariant codes are registered in src/domain/constants/invariants.ts."
);
doc.moveDown(0.5);

// Table header
const y0 = doc.y;
const cols = [42, 160, 190, 55];
let x = 56;
const headers = ["Code", "Invariant", "Condition that triggers it", "Outcome"];
doc.rect(56, y0, W, 20).fill(C.slate);
for (let i = 0; i < headers.length; i++) {
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(8.5)
     .text(headers[i], x + 4, y0 + 6, { width: cols[i] - 8, lineBreak: false });
  x += cols[i];
}
doc.y = y0 + 21;

const invs = [
  ["INV-01", "No Policy Pack → No Execution",        "policyPackRef missing or null",                  "REJECT"],
  ["INV-02", "No Provenance → No Action",             "provenanceRef missing or null",                  "REJECT"],
  ["INV-03", "No Required Approval → No Release",     "approvalRequired=true but no valid artifact",    "HOLD"],
  ["INV-04", "No Logging → No Execution",             "loggingReady=false",                             "REJECT"],
  ["INV-05", "AI Non-Authoritative",                  "actorAuthorityClass='ai'",                       "REJECT"],
  ["INV-06", "No Bypass of Execution Gate",           "Structural — enforced by module boundaries",     "N/A"],
  ["INV-07", "Immutable Decision Envelope",           "Structural — DecisionEnvelope sealed at issue",  "N/A"],
  ["INV-08", "Stale Controls Block Sensitive Release","controlStatus.stale=true on sensitive request",  "REJECT"],
  ["INV-09", "Trust State Required",                  "trustState.trusted=false",                       "REJECT"],
  ["INV-10", "Prohibited Use Must Block",             "prohibitedUse=true",                             "REJECT"],
  ["INV-11", "Request Schema & Action Class Valid",   "Unknown proposedActionClass or malformed req",   "REJECT"],
  ["INV-12", "Proposal & Request Action Must Match",  "proposal.requestedActionClass ≠ proposedActionClass", "REJECT"],
];
for (const [code, name, trigger, outcome] of invs) {
  invRow(code, name, trigger, outcome);
}

doc.moveDown(0.8);
h3("Hardcoded Workflow Constraints");
bullet([
  { label: "fraud_triage workflow", detail: "ALWAYS requires human approval regardless of actor class or policy. Encoded in WORKFLOWS_REQUIRING_APPROVAL constant." },
  { label: "Approval authority check", detail: "ApprovalArtifact.privilegedAuthSatisfied must be true. Approver authority class must meet the chain requirement." },
]);

// ═══════════════════════════════════════════════════════════════════════════
// 8. REASON CODES
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
sectionHeader("8. Reason Codes", "src/domain/constants/reason-codes.ts — 17 codes");

body(
  "Every GateResult carries one or more reason codes on the DecisionEnvelope. " +
  "Codes are stable string constants — safe to match in downstream code."
);
doc.moveDown(0.4);

const reasons = [
  ["DECISION_ALLOWED",              "ALLOW",  "Request passed all invariant checks."],
  ["DECISION_HELD",                 "HOLD",   "Approval required; withheld pending human review."],
  ["DECISION_REJECTED",             "REJECT", "One or more invariants violated; action blocked."],
  ["NO_POLICY_PACK",                "REJECT", "policyPackRef missing (INV-01)."],
  ["NO_PROVENANCE",                 "REJECT", "provenanceRef missing (INV-02)."],
  ["REQUIRED_APPROVAL_MISSING",     "HOLD",   "approvalRequired=true but no ApprovalArtifact (INV-03)."],
  ["INVALID_APPROVAL_AUTHORITY",    "HOLD",   "Approver authority class insufficient."],
  ["PRIVILEGED_AUTH_NOT_SATISFIED", "HOLD",   "ApprovalArtifact.privilegedAuthSatisfied=false."],
  ["APPROVAL_SIGNATURE_MISSING",    "HOLD",   "ApprovalArtifact.immutableSignature absent."],
  ["LOGGING_NOT_READY",             "REJECT", "loggingReady=false (INV-04)."],
  ["AI_CANNOT_AUTHORIZE",           "REJECT", "Actor is 'ai' authority class (INV-05)."],
  ["PROHIBITED_USE",                "REJECT", "prohibitedUse=true (INV-10)."],
  ["CONTROL_STALE_OR_INVALID",      "REJECT", "Stale controls on sensitive request (INV-08)."],
  ["TRUST_STATE_INVALID",           "REJECT", "trustState.trusted=false (INV-09)."],
  ["UNKNOWN_ACTION_CLASS",          "REJECT", "proposedActionClass not registered (INV-11)."],
  ["MALFORMED_REQUEST",             "REJECT", "Request structure invalid (INV-11)."],
  ["INVALID_PROPOSAL",              "REJECT", "Proposal/request action mismatch (INV-12)."],
];

for (const [code, outcome, desc] of reasons) {
  const oc = outcome === "REJECT" ? C.red : outcome === "HOLD" ? C.amber : C.green;
  const y = doc.y;
  doc.rect(56, y, W, 16).fill(y % 32 < 16 ? C.codeBg : C.white);
  doc.fillColor(C.codeText).font("Courier").fontSize(8)
     .text(code, 60, y + 4, { width: 210, lineBreak: false });
  doc.fillColor(oc).font("Helvetica-Bold").fontSize(8)
     .text(outcome, 275, y + 4, { width: 46, lineBreak: false });
  doc.fillColor(C.muted).font("Helvetica").fontSize(8)
     .text(desc, 325, y + 4, { width: W - 272, lineBreak: false });
  doc.y = y + 17;
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. INTEGRATION STARTER KITS
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
sectionHeader("9. Integration Starter Kits", "examples/ — 8 kits + INTEGRATION-GUIDE.md");

body(
  "Each kit is a self-contained directory with index.ts (the integration pattern), " +
  "validate-*.ts (runnable smoke test), and README.md. All validate scripts produce " +
  "100% PASS on a clean checkout. See INTEGRATION-GUIDE.md for the decision tree " +
  "routing clients to the right kit."
);
doc.moveDown(0.5);

const kits = [
  {
    name: "fraud-workflow-starter",
    label: "Fraud Workflow Starter",
    summary: "End-to-end reference: GovernedRequest → gate.evaluate() → EvidenceBundleService → DiagnosticReport. The canonical starting point for new integrations.",
    tags: ["Reference", "All outcomes"],
  },
  {
    name: "financial-approval-starter",
    label: "Financial Approval",
    summary: "Multi-step approval flow. AI proposes → analyst reviews → manager approves. Demonstrates ApprovalArtifact construction and HOLD → ALLOW lifecycle.",
    tags: ["HOLD → ALLOW", "ApprovalArtifact"],
  },
  {
    name: "agent-gate / agent-integration-starter",
    label: "Agent Gate",
    summary: "MCP-style pattern. CerbaSeal gates tool-execution calls from an AI agent before any action is dispatched. Shows how AI agents stay proposal-only.",
    tags: ["AI agents", "INV-05"],
  },
  {
    name: "consumer-example",
    label: "Consumer Example",
    summary: "Minimal direct integration. Import gate, build GovernedRequest, call evaluate(), handle all three outcomes. Lowest-friction entry point.",
    tags: ["Minimal", "All outcomes"],
  },
  {
    name: "auditor-view",
    label: "Auditor View",
    summary: "Renders hash-linked audit certificates for external reviewers. Demonstrates how EvidenceBundle is formatted as a human-readable compliance certificate.",
    tags: ["Compliance", "EvidenceBundle"],
  },
  {
    name: "webhook-adapter",
    label: "Webhook Adapter",
    summary: "Node.js HTTP server. POST /event → gate.evaluate() → async POST to CALLBACK_URL. No framework dependency. Handles all three outcomes; returns 202 immediately.",
    tags: ["HTTP", "Async callback", "NEW"],
  },
  {
    name: "express-middleware",
    label: "Express Middleware",
    summary: "cerbaSealGate() returns an Express-compatible middleware. ALLOW → next() + res.locals. REJECT → 403 + reason codes. HOLD → 202 + envelopeId. Custom onHold() supported.",
    tags: ["Express", "Middleware", "NEW"],
  },
  {
    name: "async-queue",
    label: "Async Queue",
    summary: "JobQueue class. enqueue() evaluates immediately. approve() attaches ApprovalArtifact and re-evaluates. Pure in-memory — swap internals for Bull/BullMQ/SQS without touching gate logic.",
    tags: ["Queue", "HOLD lifecycle", "NEW"],
  },
  {
    name: "audit-export",
    label: "Audit Export",
    summary: "Reads FileBackedAppendOnlyLogService JSONL. Verifies chain integrity. Infers outcomes from event types. Optional EvidenceBundle enrichment adds workflow/actor grouping.",
    tags: ["Audit", "Compliance export", "NEW"],
  },
  {
    name: "rest-api-starter",
    label: "REST API Starter",
    summary: "Thin HTTP API wrapper showing how to expose gate evaluation over a REST endpoint, with request parsing, response shaping, and error handling.",
    tags: ["REST", "HTTP API"],
  },
  {
    name: "support-readiness",
    label: "Support Readiness",
    summary: "Demonstrates SystemIntegrityService and OperatorActionService. Generates DiagnosticReport for a HOLD decision and produces actionable operator guidance.",
    tags: ["Diagnostics", "Operator view"],
  },
];

for (const k of kits) {
  if (doc.y > doc.page.height - 100) doc.addPage();
  const y = doc.y;
  const isNew = k.tags.includes("NEW");
  doc.rect(56, y, W, isNew ? 58 : 52).fill(isNew ? C.tagBg : C.codeBg);
  doc.fillColor(C.black).font("Helvetica-Bold").fontSize(9.5)
     .text(k.label, 68, y + 7, { width: W - 80, lineBreak: false });
  doc.fillColor(C.muted).font("Courier").fontSize(7.5)
     .text(`examples/${k.name}/`, 68, y + 19, { width: W - 80, lineBreak: false });
  doc.fillColor(C.black).font("Helvetica").fontSize(8.5)
     .text(k.summary, 68, y + 30, { width: W - 90 });
  doc.y = y + (isNew ? 58 : 52) + 4;
}

// ═══════════════════════════════════════════════════════════════════════════
// 10. AUDIT & EVIDENCE SYSTEM
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
sectionHeader("10. Audit & Evidence System", "Hash-linked chain + EvidenceBundle artifacts");

h3("Hash Chain Algorithm");
body(
  "Every audit event is recorded as an AuditLogEntry. Each entry's entryHash is computed " +
  "from: eventId + requestId + eventType + timestamp + payloadHash + previousHash. " +
  "The payload itself is hashed (SHA-256) but not stored inline, so the chain can be " +
  "verified from the JSONL file alone without the original request data."
);
doc.moveDown(0.4);

h3("Events per Gate Evaluation");
const events = [
  { label: "REQUEST_EVALUATED",       detail: "Always written. Payload: requestId, finalState, envelopeId." },
  { label: "RELEASE_AUTHORIZED",      detail: "ALLOW outcomes only. Payload: releaseAuthorizationId, actionClass." },
  { label: "ACTION_BLOCKED",          detail: "HOLD / REJECT outcomes only. Payload: finalState, reasonCodes[]." },
  { label: "EVIDENCE_BUNDLE_CREATED", detail: "Always written. Payload: evidenceBundleId." },
];
bullet(events);

doc.moveDown(0.4);
h3("FileBackedAppendOnlyLogService");
body(
  "The file-backed implementation appends one JSON line per event to a JSONL file. " +
  "Each line is a full AuditLogEntry. The in-memory AppendOnlyLogService uses the same " +
  "buildEntry() and verifyChain() logic, so chains produced by one are verifiable by the other."
);
doc.moveDown(0.4);

h3("EvidenceBundle");
body(
  "Self-contained decision artifact produced by EvidenceBundleService.createBundle(). " +
  "Contains the full GovernedRequest, DecisionEnvelope, ReleaseAuthorization (or null), " +
  "BlockedActionRecord (or null), and eventChain (AuditLogEntry[]). " +
  "Suitable for export to compliance systems, independent auditors, or long-term archival. " +
  "EvidenceBundleService rejects GateResult objects not issued by ExecutionGateService.evaluate() " +
  "to prevent self-constructed forgeries."
);
doc.moveDown(0.4);

h3("Proof Snapshots");
body(
  "pnpm export:proof generates a cryptographic proof snapshot of the current system state. " +
  "pnpm verify:proof validates a snapshot against the live codebase. " +
  "Used for 'Proven at Runtime' claims in compliance documentation."
);

// ═══════════════════════════════════════════════════════════════════════════
// 11. CLI SCRIPTS
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
sectionHeader("11. CLI Scripts & pnpm Commands", "Development, validation, and maintenance commands");

const commands = [
  ["pnpm test",                "Run all 419 tests (Vitest)."],
  ["pnpm audit:repo",          "Run all 16 repo-audit health checks: tests, tsc, docs, routes, invariants, boundaries, pilot docs, policy file."],
  ["pnpm check:imports",       "Enforce architectural import boundaries (no tests→src, no examples→private)."],
  ["pnpm check:invariants",    "Verify every registered invariant has at least one covering test."],
  ["pnpm export:proof",        "Generate a cryptographic proof snapshot of the current system state."],
  ["pnpm verify:proof",        "Validate a previously exported proof against the live codebase."],
  ["pnpm demo:web",            "Start the partner portal (React + Vite) demo application."],
  ["pnpm demo:web:validate",   "Run assertions against all partner portal routes."],
  ["pnpm demo:support:validate","Validate 13 support-readiness scenarios."],
  ["pnpm review:validate",     "Run 110 assertions covering the review portal and all gate outcomes."],
  ["pnpm tsx examples/<kit>/validate-*.ts", "Run a specific starter kit's validation script."],
];

for (const [cmd, desc] of commands) {
  const y = doc.y;
  doc.rect(56, y, W, 26).fill(C.codeBg);
  doc.fillColor(C.codeText).font("Courier").fontSize(8.5)
     .text(cmd, 62, y + 5, { width: W - 12, lineBreak: false });
  doc.fillColor(C.muted).font("Helvetica").fontSize(8.5)
     .text(desc, 62, y + 16, { width: W - 12 });
  doc.y = doc.y + 4;
}

doc.moveDown(0.6);
h3("Repo-Audit Checks (16 / 16 PASS)");
const checks = [
  "1. Full test suite passes",
  "2. TypeScript compiles without errors (tsc --noEmit)",
  "3. README anchor strings present",
  "4. All portal routes respond 200",
  "5. No src/ file unreferenced in tests or examples",
  "6. Invariant registry exists and is non-empty",
  "7. Known-limitations section in README",
  "8. Test count in README matches actual",
  "9. demo:web:validate passes",
  "10. demo:support:validate passes",
  "11. review:validate passes",
  "12. No architectural import boundary violations",
  "13. All invariants linked to covering tests",
  "14. No stale test-count references in documentation",
  "15. Pilot documents exist with required sections",
  "16. cerbaseal.policy.json parses without error",
];
const half = Math.ceil(checks.length / 2);
for (let i = 0; i < half; i++) {
  const left = checks[i];
  const right = checks[i + half];
  const y = doc.y;
  doc.rect(56, y, 4, 4).fill(C.green); doc.fillColor(C.green).font("Helvetica").fontSize(8).text("✓  " + left, 64, y, { width: W / 2 - 16, lineBreak: false });
  if (right) {
    doc.rect(56 + W / 2, y, 4, 4).fill(C.green); doc.fillColor(C.green).font("Helvetica").fontSize(8).text("✓  " + right, 64 + W / 2, y, { width: W / 2 - 16, lineBreak: false });
  }
  doc.y = doc.y + 14;
}

// ═══════════════════════════════════════════════════════════════════════════
// 12. TEST COVERAGE
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
sectionHeader("12. Test Coverage", "419 tests across 15 test files — 100% invariant coverage");

body(
  "CerbaSeal's test suite is organised around invariants and adversarial scenarios " +
  "rather than code paths. The goal is to verify that every forbidden state is correctly " +
  "blocked, every allowed state is correctly released, and that no combination of inputs " +
  "can bypass the gate logic."
);
doc.moveDown(0.5);

const testHighlights = [
  { label: "419",  detail: "Total tests (Vitest)." },
  { label: "12/12",detail: "Invariants with at least one covering test — 100% coverage." },
  { label: "122+", detail: "Tests specifically targeting adversarial bypass, fail-closed behaviour, and non-forgery." },
  { label: "110",  detail: "Assertions validated by review:validate across all gate outcomes and portal routes." },
  { label: "13",   detail: "Assertions validated by demo:support:validate." },
  { label: "15",   detail: "Test files total." },
];
for (const item of testHighlights) {
  const y = doc.y;
  doc.rect(56, y, 48, 32).fill(C.accentDk);
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(14)
     .text(item.label, 56, y + 8, { width: 48, align: "center", lineBreak: false });
  doc.fillColor(C.black).font("Helvetica").fontSize(9.5)
     .text(item.detail, 114, y + 10, { width: W - 60 });
  doc.y = y + 36;
}

doc.moveDown(0.5);
h3("Test Categories");
bullet([
  { label: "Invariant tests", detail: "One or more tests per invariant verifying the exact reject/hold behaviour." },
  { label: "Happy-path tests", detail: "Full ALLOW flows for system, analyst, reviewer, and manager authority classes." },
  { label: "Adversarial tests", detail: "Self-constructed GateResult forgery attempts, modified decision envelopes, invalid approval artifacts." },
  { label: "Chain-integrity tests", detail: "Tampered JSONL files, missing links, out-of-order entries." },
  { label: "Replay tests", detail: "Verifying that ReplayService detects outcome drift between recorded and re-evaluated decisions." },
  { label: "Portal validation", detail: "All 9 partner portal routes confirm 200 OK; all demo scenarios assert exact gate outcomes." },
]);

// ═══════════════════════════════════════════════════════════════════════════
// 13. DEPLOYED ARTIFACTS
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage();
sectionHeader("13. Deployed Artifacts", "artifacts/ — React + Vite web applications");

h3("CerbaSeal Demo  (artifacts/cerbaseal-demo/)");
body(
  "The partner portal and live demo application. Built with React + Vite. " +
  "Serves as the primary commercial-facing surface for CerbaSeal-Core v0.1.0."
);
doc.moveDown(0.4);
bullet([
  { label: "Partner Portal (/partner)", detail: "Resource library with 21 items: pilot docs, starter kits, integration guide. Lists all 8 integration kits and links to the decision tree." },
  { label: "Reviewer View",            detail: "Shows EvidenceBundle certificates rendered for external auditors. Demonstrates hash-chain output." },
  { label: "Operator View",            detail: "Displays DiagnosticReport for HOLD and REJECT decisions with actionable remediation steps." },
  { label: "Demo Scenarios",           detail: "Interactive walkthrough of all three gate outcomes across multiple workflow classes." },
  { label: "9 routes, all 200 OK",     detail: "Verified by audit:repo check #4 on every run." },
]);

doc.moveDown(0.5);
h3("Pilot Documents (docs/)");
body("Three pilot documents are verified by audit:repo check #15:");
bullet([
  "Pilot onboarding guide",
  "Commercial framework / pricing reference",
  "Integration readiness checklist",
]);

// ─── FINAL PAGE ─────────────────────────────────────────────────────────────
doc.addPage();
doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.slate);

doc.fillColor(C.white).font("Helvetica-Bold").fontSize(22)
   .text("CerbaSeal-Core v0.1.0", 56, 180, { width: W });
doc.fillColor(C.accent).font("Helvetica").fontSize(13)
   .text("System & Repository Breakdown", 56, 212);
doc.moveTo(56, 240).lineTo(56 + W, 240).strokeColor(C.accent).lineWidth(1.5).stroke();

doc.fillColor("#CBD5E1").font("Helvetica").fontSize(10).lineGap(6)
   .text([
     "Deterministic execution governance for consequential AI-assisted workflows.",
     "419 tests  ·  12 invariants  ·  16 audit checks  ·  8 integration starter kits",
     "All tests PASS  ·  audit:repo 16/16 PASS  ·  tsc --noEmit clean",
   ].join("\n"), 56, 260, { width: W });

doc.fillColor("#64748B").font("Helvetica").fontSize(8.5)
   .text(
     `Jesse Lamont  ·  Lamont Labs  ·  Confidential\nGenerated ${new Date().toUTCString()}`,
     56, doc.page.height - 70, { width: W, align: "center", lineGap: 4 }
   );

doc.end();
console.log("PDF written to:", OUT);
