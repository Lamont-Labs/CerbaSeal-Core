import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'docs/reports/CTO_CALL_PREP_BINDER_LINE_AXIA.pdf');
const doc = new PDFDocument({ margin: 0, size: 'LETTER', bufferPages: true });
doc.pipe(fs.createWriteStream(OUT));

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const C = {
  navy:    '#0f172a',
  slate:   '#1e293b',
  blue:    '#1d4ed8',
  blueSoft:'#3b82f6',
  teal:    '#0f766e',
  green:   '#15803d',
  amber:   '#b45309',
  red:     '#b91c1c',
  ink:     '#1e293b',
  body:    '#334155',
  muted:   '#64748b',
  rule:    '#e2e8f0',
  bgCool:  '#f8fafc',
  bgBlue:  '#eff6ff',
  bgGreen: '#f0fdf4',
  bgAmber: '#fffbeb',
  bgRed:   '#fef2f2',
  white:   '#ffffff',
};

const M  = 60;           // left/right margin
const PW = 612;          // page width (LETTER)
const PH = 792;          // page height (LETTER)
const TW = PW - M * 2;  // text width

// ─── LOW-LEVEL HELPERS ────────────────────────────────────────────────────────
const X = () => M;
const Y = () => doc.y;

function moveY(n) { doc.moveDown(n); }

function newPage() {
  doc.addPage({ margin: 0, size: 'LETTER' });
  pageChrome();
}

function pageChrome() {
  // top accent strip
  doc.rect(0, 0, PW, 5).fill(C.blue);
  // left margin accent line
  doc.rect(M - 10, 5, 1, PH - 30).fill(C.rule);
  doc.y = 22;
}

function safeY(required = 140) {
  if (doc.y > PH - required) newPage();
}

// ─── TYPOGRAPHY ───────────────────────────────────────────────────────────────
function displayTitle(text) {
  doc.fontSize(28).fillColor(C.navy).font('Helvetica-Bold')
     .text(text, M, doc.y, { width: TW });
  moveY(0.15);
}

function displaySub(text) {
  doc.fontSize(13).fillColor(C.blue).font('Helvetica-Bold')
     .text(text, M, doc.y, { width: TW });
  moveY(0.2);
}

function sectionHeader(num, title, color = C.blue) {
  const bY = doc.y;
  doc.rect(0, bY - 2, PW, 36).fill(C.navy);
  doc.rect(0, bY - 2, 5, 36).fill(color);
  doc.fontSize(7.5).fillColor(color).font('Helvetica-Bold')
     .text('SECTION ' + num, M + 4, bY + 4, { width: TW });
  doc.fontSize(12).fillColor(C.white).font('Helvetica-Bold')
     .text(title.toUpperCase(), M + 4, bY + 14, { width: TW });
  doc.y = bY + 42;
}

function questionHeader(text) {
  safeY(200);
  const bY = doc.y;
  doc.rect(M - 10, bY, TW + 10, 28).fill(C.bgCool);
  doc.rect(M - 10, bY, 3, 28).fill(C.blue);
  doc.fontSize(9.5).fillColor(C.navy).font('Helvetica-Bold')
     .text(text, M + 4, bY + 8, { width: TW - 8 });
  doc.y = bY + 34;
}

function h2(text, color = C.navy) {
  safeY(120);
  moveY(0.45);
  doc.fontSize(10.5).fillColor(color).font('Helvetica-Bold')
     .text(text, M, doc.y, { width: TW });
  moveY(0.15);
}

function h3(text, color = C.blue) {
  safeY(80);
  moveY(0.3);
  doc.fontSize(9).fillColor(color).font('Helvetica-Bold')
     .text(text, M, doc.y, { width: TW });
  moveY(0.1);
}

function body(text, color = C.body) {
  doc.fontSize(9).fillColor(color).font('Helvetica')
     .text(text, M, doc.y, { width: TW, lineGap: 2.5 });
  moveY(0.25);
}

function bodyBold(text, color = C.ink) {
  doc.fontSize(9).fillColor(color).font('Helvetica-Bold')
     .text(text, M, doc.y, { width: TW, lineGap: 2 });
  moveY(0.2);
}

function bullets(items, color = C.body, indent = 16) {
  items.forEach(item => {
    const bY = doc.y;
    doc.fontSize(8).fillColor(C.blue).font('Helvetica-Bold')
       .text('›', M + 2, bY, { width: 10, continued: false });
    doc.fontSize(9).fillColor(color).font('Helvetica')
       .text(item, M + indent, bY, { width: TW - indent, lineGap: 2 });
    doc.y += 2;
  });
  moveY(0.2);
}

function rule(color = C.rule) {
  moveY(0.35);
  doc.rect(M, doc.y, TW, 0.75).fill(color);
  moveY(0.4);
}

// ─── CALLOUT BOXES ────────────────────────────────────────────────────────────
function callout(title, text, bg = C.bgBlue, accent = C.blue, textColor = C.ink) {
  safeY(90);
  const lines = Math.ceil(text.length / 85);
  const bH = Math.max(52, lines * 13.5 + 28);
  const bY = doc.y;
  doc.rect(M, bY, TW, bH).fill(bg);
  doc.rect(M, bY, 3, bH).fill(accent);
  doc.fontSize(7.5).fillColor(accent).font('Helvetica-Bold')
     .text(title.toUpperCase(), M + 12, bY + 9, { width: TW - 16 });
  doc.fontSize(9).fillColor(textColor).font('Helvetica')
     .text(text, M + 12, bY + 21, { width: TW - 20, lineGap: 2.5 });
  doc.y = bY + bH + 10;
}

function warningBox(title, text) {
  callout(title, text, C.bgAmber, C.amber, C.ink);
}

function dangerBox(title, text) {
  callout(title, text, C.bgRed, C.red, C.ink);
}

function goodBox(title, text) {
  callout(title, text, C.bgGreen, C.green, C.ink);
}

// ─── LABELLED ROW ────────────────────────────────────────────────────────────
function labelRow(k, v, vColor = C.body) {
  const rowY = doc.y;
  doc.fontSize(8).fillColor(C.muted).font('Helvetica-Bold')
     .text(k, M, rowY, { width: 130 });
  doc.fontSize(9).fillColor(vColor).font('Helvetica')
     .text(v, M + 135, rowY, { width: TW - 135 });
  doc.y += 14;
}

// ─── TABLE ────────────────────────────────────────────────────────────────────
function table(headers, rows, colWidths) {
  const tY = doc.y;
  const rowH = 18;
  const hH = 20;
  // header
  let cx = M;
  doc.rect(M, tY, TW, hH).fill(C.navy);
  headers.forEach((h, i) => {
    doc.fontSize(7.5).fillColor(C.white).font('Helvetica-Bold')
       .text(h.toUpperCase(), cx + 5, tY + 6, { width: colWidths[i] - 10 });
    cx += colWidths[i];
  });
  // rows
  rows.forEach((row, ri) => {
    const rY = tY + hH + ri * rowH;
    if (ri % 2 === 0) doc.rect(M, rY, TW, rowH).fill(C.bgCool);
    cx = M;
    row.forEach((cell, ci) => {
      const color = ci === 0 ? C.ink : C.body;
      doc.fontSize(8.5).fillColor(color).font(ci === 0 ? 'Helvetica-Bold' : 'Helvetica')
         .text(cell, cx + 5, rY + 5, { width: colWidths[ci] - 10 });
      cx += colWidths[ci];
    });
  });
  doc.y = tY + hH + rows.length * rowH + 10;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COVER PAGE
// ═══════════════════════════════════════════════════════════════════════════════
doc.rect(0, 0, PW, PH).fill(C.navy);
doc.rect(0, 0, PW, 6).fill(C.blue);
doc.rect(PW - 6, 0, 6, PH).fill(C.blue);

// large decorative rule
doc.rect(M, 110, TW, 1).fill(C.blue);

doc.fontSize(9).fillColor(C.blueSoft).font('Helvetica-Bold')
   .text('LAMONT LABS  ·  CONFIDENTIAL  ·  2026-06-02', M, 90, { width: TW, align: 'right' });

doc.fontSize(36).fillColor(C.white).font('Helvetica-Bold')
   .text('CTO Call', M, 128, { width: TW });
doc.fontSize(36).fillColor(C.blue).font('Helvetica-Bold')
   .text('Preparation', M, 166, { width: TW });
doc.fontSize(36).fillColor(C.white).font('Helvetica-Bold')
   .text('Binder', M, 204, { width: TW });

doc.rect(M, 252, TW, 1).fill(C.blue);

doc.fontSize(14).fillColor(C.blueSoft).font('Helvetica-Bold')
   .text('Line Axia  —  Olivia Aréchiga, CTO', M, 264, { width: TW });
doc.fontSize(9.5).fillColor(C.muted).font('Helvetica')
   .text('Prepared for Jesse Lamont, Founder, Lamont Labs', M, 284, { width: TW });
doc.fontSize(9.5).fillColor(C.muted).font('Helvetica')
   .text('CerbaSeal-Core v0.1.0  ·  372 tests  ·  15/15 audit checks', M, 298, { width: TW });

// contents panel
doc.rect(M, 340, TW, 310).fill('#0a0f1e');
doc.rect(M, 340, 3, 310).fill(C.blue);
doc.fontSize(7.5).fillColor(C.blue).font('Helvetica-Bold')
   .text('CONTENTS', M + 16, 354, { width: TW - 20 });

const contents = [
  ['01', 'Where Is CerbaSeal Right Now?',              'The VeraSeal question, current state, and pilot-ready gap'],
  ['02', 'EU / Client-Controlled Deployment',          'What is proven, what has not been executed, how to get there'],
  ['03', 'Operational Role During A Pilot',            'Onboarding, support, response times, and handover model'],
  ['04', 'Realistic Capacity',                         'What the pilot actually costs in time, constraints, and honesty'],
  ['05', 'Dependencies & Supply Chain',                'Zero-dep core library — full corrected analysis'],
  ['06', '25 Follow-Up Questions',                     'Most likely questions with answers, risks, and phrases to avoid'],
  ['07', 'Founder Cheat Sheet',                        'One-page pre-call reference: short / honest / danger answers'],
];

contents.forEach(([n, title, sub], i) => {
  const rowY = 372 + i * 36;
  doc.fontSize(18).fillColor(C.blue).font('Helvetica-Bold')
     .text(n, M + 16, rowY, { width: 28 });
  doc.fontSize(9.5).fillColor(C.white).font('Helvetica-Bold')
     .text(title, M + 48, rowY + 2, { width: TW - 60 });
  doc.fontSize(8).fillColor(C.muted).font('Helvetica')
     .text(sub, M + 48, rowY + 16, { width: TW - 60 });
});

// how to use box
doc.rect(M, 666, TW, 82).fill('#131b2e');
doc.rect(M, 666, 3, 82).fill(C.teal);
doc.fontSize(7.5).fillColor(C.teal).font('Helvetica-Bold')
   .text('HOW TO USE THIS BINDER', M + 16, 676, { width: TW - 20 });
doc.fontSize(8.5).fillColor('#94a3b8').font('Helvetica')
   .text(
     'Every answer in this document is sourced from the repository. No claims are invented or inflated. ' +
     'For each question: (1) the technical reality, (2) what it means in plain English, (3) what to say on the call, ' +
     '(4) likely follow-ups, and (5) risks to name honestly. If something is not in the code or docs, it is not in here.',
     M + 16, 690, { width: TW - 24, lineGap: 2.5 }
   );

doc.fontSize(7.5).fillColor(C.muted).font('Helvetica')
   .text(
     'CerbaSeal-Core v0.1.0  ·  Lamont Labs  ·  Prepared for Jesse Lamont  ·  CONFIDENTIAL',
     M, PH - 22, { width: TW, align: 'center' }
   );

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — WHERE IS CERBASEAL RIGHT NOW
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
sectionHeader('01', 'Where Is CerbaSeal Right Now?', C.blue);

questionHeader('Olivia\'s Question: "Where is CerbaSeal relative to external deployment, specifically VeraSeal as the first component? What does pilot-ready mean and what is the gap between current state and that bar?"');

dangerBox(
  'Critical — Correct This Before Anything Else',
  '"VeraSeal" does not exist anywhere in this repository — not in source code, file names, tests, documentation, or comments. ' +
  'There is no component, module, or system by that name. If Olivia references VeraSeal, she has the name from another source. ' +
  'Correct it calmly and immediately: the enforcement core is CerbaSeal — specifically the ExecutionGateService. Then move on.'
);

h2('What CerbaSeal Is (Plain English)');
body('CerbaSeal is a gatekeeper. When an AI-assisted system proposes an action — a payment, an approval, a process execution — CerbaSeal sits between the proposal and the execution and answers one question: should this be permitted right now? It checks who is asking, whether the required approvals exist, and whether the request satisfies a defined set of rules. It issues exactly one of three verdicts: ALLOW, HOLD, or REJECT. Every verdict is logged with a verifiable evidence record that cannot be altered after the fact.');

rule();
h2('What Is Currently Built and Working');

h3('The Enforcement Core');
bullets([
  '12 invariants — non-negotiable rules every request must pass before ALLOW is issued',
  'Three and only three outcomes: ALLOW, HOLD, REJECT',
  'Fail-closed: any unexpected condition produces REJECT, never ALLOW',
  'AI cannot authorize its own requests — hard rule, not a configuration option',
  'Evidence bundle produced for every decision — a structured, verifiable record',
  'SHA-256 hash-chained audit log — deletions or alterations break the chain and fail verification',
  'Replay verification — any prior decision can be re-examined for consistency',
  'Diagnostic output — every HOLD and REJECT includes a specific reason code and explanation',
], C.body);

h3('Test Coverage');
bullets([
  '372 tests passing, 0 failing, across 15 test files',
  '66 adversarial tests designed specifically to break or bypass the enforcement',
  '27 misuse-scenario tests based on documented AI governance failure patterns',
  '25 contextual boundary tests covering edge cases and input combinations',
  '15/15 independent audit checks passing (automated, re-runnable by any reviewer)',
], C.body);

h3('The Review Portal');
bullets([
  'Live at cerbaseal.replit.app — reviewers can observe the system running in real time',
  '4 portal pages: Review, Pilot Readiness, Security Controls, Deployment Posture',
  'All portal claims are backed by tests — a claim that disappears from a page fails a test',
], C.body);

rule();
h2('What Is Demo-Only');
warningBox(
  'Demo Infrastructure — Not Client Infrastructure',
  'cerbaseal.replit.app runs on Replit\'s servers. It is appropriate for Olivia\'s technical review. ' +
  'It is not appropriate for real client data or production decisions. It is a demonstration surface, not a deployment.'
);

rule();
h2('What Is Not Yet Implemented');
safeY(120);
bullets([
  'Persistent storage — the audit log is in-memory and is lost on process restart',
  'Cryptographic signing — the evidence chain is hash-consistent but not key-signed or legally attested',
  'Non-Replit deployment — no deployment outside the demo environment has been executed',
  'Client-specific workflow configuration — no external client workflow has been set up',
  'Third-party security review — all security review to date is internal',
  'Production hardening — no container, no infrastructure configuration, no deployment runbook',
  'Signed commercial agreement — no pilot client currently exists',
], C.red);

rule();
h2('What "Pilot-Ready" Actually Means');
goodBox(
  'The Correct Definition',
  'Pilot-ready means: one client, one workflow, one controlled environment, no production decisions, ' +
  'defined success criteria, and a signed agreement in place before a single piece of real data is touched. ' +
  'It does not mean production-ready. The enforcement core is sound. The deployment infrastructure is the gap.'
);

h3('Prerequisites Before Any Pilot Can Begin');
bullets([
  'Signed working agreement: scope, evidence ownership, liability boundary, support terms',
  'Persistent storage implemented — audit log must survive process restart',
  'Client deployment environment identified, provisioned, and reviewed',
  'One specific workflow defined and agreed with the client in writing',
  'Data Processing Agreement if any EU client data is involved',
  'Success criteria documented and signed — what does "governance working" look like?',
], C.amber);

rule();
callout(
  'What To Say On The Call — Section 1',
  '"The enforcement core is called CerbaSeal — there is no component called VeraSeal in this build. ' +
  'What exists today is a working governance engine: 372 passing tests, 15 independent audit checks, 12 hard rules that every request must pass. ' +
  'The live demo is not connected to any client data — it is a demonstration. ' +
  'Pilot-ready, as I define it, means one workflow, one client, controlled environment, no production decisions, and a signed agreement before we touch anything real. ' +
  'The primary remaining build item before a pilot is persistent audit storage — the log needs to survive a server restart. That is bounded work, not a redesign."',
  C.bgBlue, C.blue, C.ink
);

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — EU / CLIENT-CONTROLLED DEPLOYMENT
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
sectionHeader('02', 'EU / Client-Controlled Deployment', C.teal);

questionHeader('Olivia\'s Question: "Can CerbaSeal be deployed in a client-controlled or EU-hosted environment?"');

goodBox(
  'Architecture Supports It',
  'CerbaSeal makes no outbound network calls, has no cloud dependencies, and requires no external services of any kind. ' +
  'It runs as a Node.js library. Wherever Node.js runs, CerbaSeal runs. EU hosting is architecturally clear. ' +
  'The caveat is precise: it has never been deployed outside Replit. The path exists. The execution has not happened.'
);

rule();
h2('What Has Been Confirmed');
bullets([
  'Zero outbound network calls in any enforcement code path — confirmed by source code review',
  'Zero external API dependencies — confirmed by full dependency audit',
  'No cloud SDK, no authentication provider, no database driver, no telemetry',
  'Four deployment modes documented: embedded library, internal HTTP service, sidecar, air-gapped',
  'Mode C (client-controlled environment) is the documented preferred path for EU pilots',
  'No geographic restrictions in the code — runs wherever Node.js is present',
], C.green);

h2('What Has Not Been Confirmed');
bullets([
  'No EU deployment has been executed — this would be the first',
  'No Dockerfile or container configuration exists',
  'No deployment runbook or step-by-step operational guide exists',
  'No Data Processing Agreement template exists',
  'No GDPR analysis has been completed',
  'No legal review of EU jurisdiction evidence retention requirements has been done',
], C.red);

rule();
h2('The Four Deployment Modes');
safeY(140);
table(
  ['Mode', 'Description', 'EU Suitability'],
  [
    ['A — Embedded Library',       'CerbaSeal imported directly inside the client service at the decision point. Lowest overhead. Requires Node.js integration.', 'Suitable'],
    ['B — Internal HTTP Service',  'CerbaSeal runs as an internal enforcement service. Clean separation. Requires internal network controls.', 'Suitable'],
    ['C — Client-Controlled Env',  'Temporary pilot environment operated and controlled by the client. Preferred EU path.', 'Preferred'],
    ['D — Air-Gapped',             'Fully offline, no network connection. Maximum isolation for high-regulation contexts.', 'Maximum isolation'],
  ],
  [130, 270, 92]
);

rule();
h2('Data Residency — What This Means For Line Axia');
body('Data residency is a legal requirement for EU firms handling EU client data, not a preference. The question is: does data ever leave the environment you control?');
body('CerbaSeal\'s answer: if deployed in EU-controlled infrastructure, data does not leave. The system calls nothing external. It sends no telemetry. Once installed, it requires no network connectivity. Data residency is entirely determined by where you place the deployment.');

warningBox(
  'Three Prerequisites Before EU Pilot Execution',
  '(1) A Data Processing Agreement must be signed between the parties. ' +
  '(2) The specific EU hosting environment must be reviewed before real data enters it. ' +
  '(3) A legal review of EU evidence retention requirements must be completed. ' +
  'None of these have been done. All three are prerequisites, not optional steps.'
);

rule();
h2('EU AI Act — What Is Relevant');
body('The EU AI Act requires verifiable audit trails for high-risk AI systems. CerbaSeal produces a structured, hash-chained audit trail for every decision. Relevant gap: the chain is hash-linked for tamper detection, but not HMAC-signed or externally attested. For formal EU AI Act compliance, signed evidence would be required. This is a documented future requirement. For a pilot evaluation, the existing audit chain is sufficient to demonstrate the governance model.');

rule();
callout(
  'What To Say On The Call — Section 2',
  '"The architecture supports EU deployment — there are no external calls, no cloud dependencies, nothing that leaves the environment you deploy it in. ' +
  'The preferred pilot approach is Mode C: you control the hosting, you control the data. ' +
  'What I want to be precise about: I have not deployed CerbaSeal outside Replit yet. The first client deployment would be the first deployment anywhere. ' +
  'Before touching real data, we need a DPA in place and the deployment environment reviewed. ' +
  'Those are prerequisites I would insist on — not obstacles to negotiate around."',
  C.bgBlue, C.teal, C.ink
);

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — OPERATIONAL ROLE
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
sectionHeader('03', 'Operational Role During A Pilot', C.blue);

questionHeader('Olivia\'s Question: "What would your operational role look like during a pilot?"');

h2('Week 1 — Scoping and Baseline (Highest Intensity)');
bullets([
  'Kickoff call (60 minutes): identify the workflow, define success criteria, agree the authority model',
  'Deploy CerbaSeal in the agreed pilot environment',
  'Execute baseline enforcement scenarios: REJECT, HOLD, ALLOW — confirmed in client context',
  'Produce and sign the pilot scope document — the written contract for what is and is not covered',
  'Deliver: workflow map, authority matrix, baseline test scenarios, agreed success metrics',
], C.body);

h2('Ongoing — Weekly Rhythm');
bullets([
  '30-minute review call every week: open issues, resolved issues, enforcement metrics',
  'Email support for questions and clarifications',
  'Tracked issue queue: every issue receives an ID, severity, status, and documented resolution',
  'Weekly status update: open, resolved, and deferred items',
  'Decision log: every governance interpretation or scope decision is written down',
], C.body);

rule();
h2('Documented Response Commitments');
safeY(120);
table(
  ['Priority', 'Trigger', 'Commitment'],
  [
    ['P1 — Critical',    'Pilot environment down or gate not producing outcomes',           'Same business day'],
    ['P2 — Major',       'Enforcement behavior contradicts documented invariants',           'Within 24 hours'],
    ['P3 — General',     'Documentation question, configuration question, clarification',   'Within 3 business days'],
    ['P4 — Enhancement', 'Request for something outside the agreed pilot scope',            'Reviewed at weekly planning'],
  ],
  [105, 265, 122]
);

body('"Response" means: issue acknowledged, severity confirmed, investigation begun. Resolution timelines are communicated once the scope of the root cause is understood.', C.muted);

rule();
h2('Unavailability Model (Up To 48 Hours)');
goodBox(
  'What Continues Without Founder Involvement',
  'Demo environment, all documentation, security docs, review portal, proof snapshots, invariant registry — ' +
  'all remain accessible. The audit can be re-run independently: "pnpm audit:repo" executes all 15 checks. ' +
  '"pnpm verify:proof" verifies the snapshot has not been altered. All evidence output is human-readable.'
);
warningBox(
  'What Pauses During Unavailability',
  'New issue investigation requiring code changes, configuration changes, and scheduled review calls. ' +
  'Beyond 48 hours: no formal contingency exists. This is an honest limitation of a solo-founder engagement ' +
  'and must be addressed in the working agreement if Line Axia requires a stronger continuity guarantee.'
);

rule();
h2('What Is Explicitly Out Of Scope');
bullets([
  'Custom feature development beyond the agreed pilot scope',
  'Production deployment work — pilot environment only',
  'Legal or regulatory compliance opinions',
  'Integration engineering into Line Axia\'s internal systems',
  'Data migration, schema design, or data modeling for production use',
  'Indefinite open-ended support beyond the defined pilot period',
  'New workflow classes not defined at kickoff',
], C.red);
body('Changes outside scope become a next phase — defined in a separate written agreement.', C.muted);

rule();
h2('What Is Delivered At Pilot Completion');
bullets([
  'Final findings report: governance outcomes observed, issues encountered, resolutions documented',
  'Governance assessment: did the workflow get governed as agreed?',
  'Identified gaps: what CerbaSeal does not yet do that production use would require',
  'Recommended next steps: specific and bounded, not a sales document',
  'All evidence bundles produced during the pilot',
  'Technical summary: architecture decisions, invariants exercised, enforcement metrics',
], C.green);
goodBox('Artifact Ownership', 'Every document and artifact produced during the pilot belongs to the client. Nothing is withheld.');

rule();
callout(
  'What To Say On The Call — Section 3',
  '"Week one is my most intensive period — scoping, deployment, baseline scenarios, signed scope document. ' +
  'After that: a 30-minute weekly call, email support, and a tracked issue queue with defined response times. ' +
  'Same business day for a system outage, 24 hours for a rule violation, 3 days for general questions. ' +
  'I am a solo founder and I want to be explicit about what that means. I have built the system to be self-documenting — ' +
  'it explains its own decisions. What I cannot offer is 24/7 on-call support. ' +
  'If that is a requirement, it needs to be scoped and priced as part of the agreement."',
  C.bgBlue, C.blue, C.ink
);

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — CAPACITY
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
sectionHeader('04', 'Realistic Capacity', C.blue);

questionHeader('Olivia\'s Question: "What is your realistic capacity for a pilot engagement?"');

warningBox(
  'Sourcing Note',
  'Capacity and schedule constraints are not stored in the repository. ' +
  'This section provides structure for an honest answer based on what the pilot operations model documents. Jesse provides the specifics.'
);

rule();
h2('What The Pilot Requires — Hour Estimates');

h3('Week 1 (Peak Demand)');
bullets([
  'Kickoff call: ~1 hour',
  'Deployment and baseline scenario execution: 4–8 hours (depends on client environment complexity)',
  'Pilot scope document, workflow map, authority matrix, baseline scenario set: 4–6 hours',
  'Total week 1 estimate: 10–15 hours of active founder work',
], C.body);

h3('Ongoing — Weeks 2 Onward (Steady State)');
bullets([
  '30-minute weekly review call',
  'Issue queue management: 1–3 hours per week depending on issue volume',
  'Email support: light in a well-scoped pilot',
  'Steady-state estimate: 3–5 hours per week in a normal week',
], C.body);

h3('Issue Spikes (Infrequent But Must Be Planned For)');
bullets([
  'P1 (system down): potentially a half-day of investigation and resolution',
  'P2 (rule violation): 2–4 hours of root-cause analysis',
  'These are infrequent in a controlled, scoped pilot — but cannot be budgeted as zero',
], C.body);

rule();
h2('Constraints That Must Be Named On The Call');
bullets([
  'Solo founder — no second engineer as a backup for live issue response',
  'The 48-hour self-service model is the documented unavailability contingency',
  'No formal contingency beyond 48 hours exists',
  'Active pilot would be the first client deployment outside the demo environment',
  'No managed infrastructure exists — deployment is a manual, per-engagement process today',
], C.amber);

rule();
h2('Infrastructure Requirements');
goodBox(
  'Minimal Footprint',
  'Node.js runtime (standard in most infrastructure), pnpm (or npm), no cloud accounts, ' +
  'no paid services, no proprietary tooling. The client provides the hosting environment for Mode C deployments. ' +
  'Founder needs: a standard developer workstation and email.'
);

h2('What Support You Would Need From Line Axia');
bullets([
  'IT team to provision the pilot deployment environment',
  'Engineering contact to construct workflow requests in the correct input format',
  'Legal review from the Line Axia side for DPA and working agreement',
], C.body);

rule();
callout(
  'What To Say On The Call — Section 4',
  '"Week one is 10 to 15 hours of active work — scoping, deploying, running baseline scenarios. ' +
  'After that I run at 3 to 5 hours a week in a normal week. I don\'t have competing pilot deployments right now. ' +
  'I am a solo founder. I have defined response times, a documented self-service model, and a system built to be readable without me. ' +
  'What I cannot offer is 24/7 on-call support — if that is a hard requirement, it needs to be structured and priced explicitly."',
  C.bgBlue, C.blue, C.ink
);

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5 — DEPENDENCIES
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
sectionHeader('05', 'Dependencies & Supply Chain', C.teal);

questionHeader('Olivia\'s Question: "Are there any open-source components or third-party dependencies in the deployment stack we should be aware of?"');

goodBox(
  'Corrected Executive Summary',
  'The CerbaSeal-Core enforcement library has zero runtime dependencies. None. ' +
  'The library itself, as installed into a client environment, brings no third-party packages with it. ' +
  'The demo environment (cerbaseal.replit.app) uses one additional package to execute TypeScript directly — tsx, MIT licensed. ' +
  'That package is part of the demo runner, not the enforcement library. ' +
  'No cloud services. No external APIs. No telemetry. Zero external service calls at runtime.'
);

rule();
h2('The Two-Package Picture — Explained');

h3('CerbaSeal-Core (The Enforcement Library — What Clients Install)');
body('CerbaSeal-Core is a pure TypeScript library. Its node_modules directory in the repository contains only development and test tooling: vitest, vite, rollup, typescript, chai. None of these ship with a client installation. The production enforcement library itself has zero runtime dependencies.');
goodBox('Client Deployment Supply Chain', 'Node.js runtime (client-provided) + CerbaSeal-Core source. That is the complete deployment stack. No additional packages required.');

h3('cerbaseal-review (The Demo/Review Wrapper — cerbaseal.replit.app)');
body('The demo environment that Olivia can view at cerbaseal.replit.app runs on a separate package — cerbaseal-review — which uses tsx to execute TypeScript directly without a compile step. This is a development convenience, not part of a client deployment.');

safeY(140);
table(
  ['Package', 'Version', 'License', 'Scope', 'Client Deployment?'],
  [
    ['tsx',              '4.21.0', 'MIT', 'Demo runner', 'No — demo only'],
    ['esbuild',         '0.27.x', 'MIT', 'Used by tsx internally', 'No — demo only'],
    ['get-tsconfig',    '4.13.x', 'MIT', 'Used by tsx internally', 'No — demo only'],
    ['resolve-pkg-maps','1.0.0',  'MIT', 'Used by get-tsconfig',   'No — demo only'],
  ],
  [108, 56, 44, 150, 110]
);

rule();
h2('License Summary');
safeY(140);
table(
  ['License', 'Present Where', 'Commercial Risk'],
  [
    ['MIT',       'All runtime packages in demo wrapper',          'None — no restrictions on commercial use'],
    ['Apache 2.0','TypeScript compiler (dev/build only)',          'None — no restrictions relevant here'],
    ['MPL-2.0',   'lightningcss (dev/build only, not deployed)',   'None — file-scoped, does not affect CerbaSeal source'],
    ['GPL / AGPL','NOT PRESENT anywhere in the dependency tree',   'Not applicable'],
  ],
  [90, 220, 182]
);
goodBox('Copyleft Determination', 'Zero copyleft-licensed software in any client deployment. All runtime licenses are MIT. No source disclosure obligation to clients. GPL is not present anywhere in the dependency tree.');

rule();
h2('External Services Audit');
safeY(130);
[
  ['Cloud platform dependencies',   'None'],
  ['SaaS API dependencies',         'None'],
  ['Outbound network calls',        'None — confirmed by source code review'],
  ['External database connections', 'None'],
  ['Telemetry or analytics',        'None'],
  ['Identity / auth providers',     'None'],
  ['CDN dependencies',              'None'],
].forEach(([k, v]) => labelRow(k, v, C.green));

rule();
h2('Answers To Likely Supply Chain Questions');
const scq = [
  ['Can CerbaSeal-Core run entirely in a client-controlled environment?',
   'Yes. No component requires a Lamont Labs–operated service after installation.'],
  ['Can it run in EU-hosted infrastructure?',
   'Yes, architecturally. No geographic restrictions exist in the code. Caveat: not yet executed.'],
  ['Does it require US-operated services?',
   'No. npm is used at install time only and can be replaced with a private registry or offline bundle.'],
  ['Does it require internet after deployment?',
   'No. Once installed, enforcement runs offline. No connectivity required.'],
  ['What does a client security review need to cover?',
   'Node.js runtime (client-provided) + CerbaSeal-Core source. If the demo runner is in scope: add tsx and its three transitive packages.'],
];
scq.forEach(([q, a]) => {
  h3(q, C.navy);
  body(a);
});

rule();
callout(
  '60-Second Verbal Answer — Section 5',
  '"The CerbaSeal enforcement library has zero runtime dependencies — nothing ships with it. ' +
  'The demo you\'re looking at right now uses one package called tsx to run TypeScript directly, which is MIT licensed. ' +
  'That\'s part of the demo environment, not the library. ' +
  'No cloud services, no external APIs, no telemetry — nothing calls outside your environment. ' +
  'All licenses are MIT. No GPL anywhere. If your security team needed to review a client deployment, ' +
  'the surface is Node.js plus CerbaSeal source. That is it."',
  C.bgBlue, C.teal, C.ink
);

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6 — 25 FOLLOW-UP QUESTIONS
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
sectionHeader('06', '25 Most Likely Follow-Up Questions', C.blue);
body('Ranked by probability. Based on documented repository gaps and what a technically rigorous CTO would probe after reviewing the materials.', C.muted);
moveY(0.3);

const QS = [
  {
    q: '"Can you show CerbaSeal running on infrastructure we control — not Replit?"',
    why: 'Replit is a developer sandbox. Any enterprise CTO will require evidence that the system works outside a shared demo host.',
    answer: '"Not yet — the first non-Replit deployment has not happened. I can walk you through precisely what a Mode C deployment to your environment looks like, and we can execute that as the first step of a pilot. The architecture has no barriers. The work is in the first execution."',
    avoid: 'Do not imply this has been done. It has not.',
  },
  {
    q: '"What happens to the audit log if the server restarts?"',
    why: 'The single most important technical gap. Any reviewer reading the security brief will find it immediately.',
    answer: '"The audit log is currently in-memory. A process restart clears the log for that session. This is my highest-priority build item before any pilot. The fix is file-backed or database-backed storage — bounded work, not a redesign. This must be in place before client data enters the system."',
    avoid: 'Do not minimize this. It is a real gap. Naming it directly builds more trust than hedging.',
  },
  {
    q: '"Who else has reviewed the security of this system?"',
    why: 'A governance tool for a regulated sector without external validation is a red flag for a sophisticated buyer.',
    answer: '"No third-party review has been completed. All security review is internal. I have a security brief that documents every known limitation accurately — I\'d rather you read it than have false confidence. External review is on the roadmap before any production use."',
    avoid: 'Do not imply any external validation has occurred.',
  },
  {
    q: '"What is your contingency if you are unavailable — hit by a bus?"',
    why: 'Standard solo-founder diligence. She needs to know the engagement survives your absence.',
    answer: '"Documented up to 48 hours. The system re-audits itself, the proof verifies independently, all documentation is self-contained. Beyond 48 hours, I do not have a backup engineer today. If Line Axia requires a stronger continuity guarantee, that needs to be structured in the agreement."',
    avoid: 'Do not claim a backup you do not have.',
  },
  {
    q: '"What version are we freezing for the pilot, and how do updates work?"',
    why: 'Any responsible buyer will want to know they are not signing up for a moving target.',
    answer: '"We freeze a specific version at pilot start — v0.1.0 today, or a later agreed snapshot. Any update during the pilot requires a change log entry and your written sign-off. No enforcement behavior changes without notice."',
    avoid: 'Do not imply a formal update management system exists that does not.',
  },
  {
    q: '"Can you show me a GDPR analysis?"',
    why: 'Line Axia is EU-based with EU clients. GDPR compliance is not optional.',
    answer: '"I do not have a completed GDPR analysis. The architecture keeps data entirely within the deployment environment — no external calls, no telemetry. Whether evidence bundles constitute personal data under GDPR depends on what workflows CerbaSeal governs. That analysis requires legal review — and a DPA between us — before real data enters the system."',
    avoid: 'Do not claim GDPR compliance.',
  },
  {
    q: '"Does CerbaSeal evaluate the content of the policy document it references?"',
    why: 'A technically sophisticated reviewer will notice that policyPackRef is required but its content is not interpreted. This looks like a gap without an explanation.',
    answer: '"CerbaSeal requires a policy pack reference — a pointer to the governing policy. It checks that the reference exists. It does not evaluate the content of the policy document. Policy content interpretation is handled upstream by the client\'s system. CerbaSeal enforces the governance layer: is approval present, is the actor authorized, is the action known."',
    avoid: 'Do not imply CerbaSeal reads or interprets policy documents.',
  },
  {
    q: '"Do you have cyber liability insurance?"',
    why: 'Standard enterprise diligence for a governance product in a regulated sector.',
    answer: 'Jesse answers directly. If you have it, state the coverage. If not: "I do not currently have a cyber liability policy. For a production engagement in a regulated sector, that is something I would address before a signed production agreement."',
    avoid: 'Do not bluff on this.',
  },
  {
    q: '"What does the working agreement look like?"',
    why: 'If this call goes well, the next thing is a term sheet. She will want to know you have thought about this.',
    answer: '"The prerequisites are documented: scope, evidence ownership, liability boundary, support terms, DPA if applicable, version freeze policy. The two items I\'d want clear early are: what constitutes a change request and what it costs, and who owns the evidence artifacts. Governing law must be defined before anything is signed."',
    avoid: 'Do not promise a draft agreement you do not have ready to produce.',
  },
  {
    q: '"How do we know the audit chain was not fabricated?"',
    why: 'The correct adversarial question for any governance system.',
    answer: '"The chain uses SHA-256 hash linking — each entry contains the hash of the previous entry. Deleting or altering any entry breaks the chain and fails verification. What it does not do is HMAC signing: a technically sophisticated attacker controlling the entire system could recompute the hashes. For legal-weight evidence, signing or external attestation would be required. That is on the gap list. For a pilot evaluation, the hash chain is sufficient to demonstrate consistency."',
    avoid: 'Do not claim cryptographic signing exists.',
  },
  {
    q: '"What is your pricing model?"',
    why: 'If the technical case holds, she will move to commercial terms.',
    answer: 'Jesse answers directly. Suggested framing: "Fixed-fee structure for a bounded pilot — cleaner for both sides. Week one is the highest-effort period. Ongoing is lighter. Change requests priced separately. Percentage structures create ambiguity on a v0.1 product."',
    avoid: 'Do not give a number you have not thought through in advance.',
  },
  {
    q: '"What happens when CerbaSeal encounters a request type it does not recognise?"',
    why: 'Unknown inputs are where governance systems tend to fail silently.',
    answer: '"Unknown action classes produce a REJECT with a documented reason code. Unknown structural inputs trigger a fail-closed REJECT. The system does not guess or default to ALLOW. If it cannot categorize the request, it blocks it."',
    avoid: 'Do not imply all unknown inputs are handled with equal precision.',
  },
  {
    q: '"Can CerbaSeal integrate with our existing audit or logging infrastructure?"',
    why: 'Line Axia has existing systems and will want to know where CerbaSeal fits.',
    answer: '"Not out of the box — that is pilot-scoped integration work. CerbaSeal produces structured evidence bundles and a hash-linked log that can be exported and ingested into existing systems. The integration layer between CerbaSeal\'s output format and your infrastructure would be defined during scoping."',
    avoid: 'Do not imply pre-built integrations exist.',
  },
  {
    q: '"How does CerbaSeal scale to multiple workflows or multiple clients?"',
    why: 'If Line Axia wants to roll this out across their client base, they need to understand the expansion story.',
    answer: '"Multi-client support is not implemented. The first pilot is explicitly one client, one workflow. Expansion to multiple workflows or clients is a next-phase discussion after a successful pilot demonstrates the model. The architecture does not prevent it — but it has not been built or tested."',
    avoid: 'Do not imply multi-client capability exists.',
  },
  {
    q: '"What does a failed pilot look like, and what do we owe each other?"',
    why: 'A serious CTO always asks about the failure scenario.',
    answer: '"If the pilot does not meet the agreed success criteria, you receive a final findings report documenting what worked, what did not, and why — with specific recommendations. You keep all artifacts. The agreement must define what \'failure\' means, what each party owes, and any fee adjustment. I would rather define that before we start."',
    avoid: 'Do not promise a refund policy you have not agreed to.',
  },
  {
    q: '"Is there a product roadmap? What does CerbaSeal look like in 12 months?"',
    why: 'She is evaluating this as a long-term partnership, not a one-time experiment.',
    answer: '"There is a documented gap list: persistent storage, cryptographic signing, identity provider integration, third-party security review, multi-client support. A 12-month roadmap would be shaped by what the pilot reveals. I would rather commit to specific outcomes from pilot findings than over-promise on a schedule."',
    avoid: 'Do not commit to a product timeline you cannot defend.',
  },
  {
    q: '"What are the performance characteristics? How fast is the enforcement gate?"',
    why: 'For production AI governance in a workflow system, latency matters.',
    answer: '"372 tests complete in under 300 milliseconds total. Individual gate evaluations are sub-millisecond. There are no network calls in the enforcement path. Formal load and stress testing has not been done — that would be part of pre-production qualification."',
    avoid: 'Do not claim production-validated performance figures.',
  },
  {
    q: '"How do we know your documentation matches what the code actually does?"',
    why: 'A sophisticated reviewer is suspicious of documentation that is too polished.',
    answer: '"Several of the 15 independent audit checks specifically test this: portal claims are verified against test output, the test count matches the actual run, every invariant is linked to a covering test, and forbidden phrases that would indicate overclaiming are scanned. The documentation is tested against the code — not maintained separately."',
    avoid: 'Do not claim perfect documentation coverage.',
  },
  {
    q: '"What if our client\'s AI system finds a bypass?"',
    why: 'Adversarial question about bypass resistance — essential for a governance product.',
    answer: '"66 of the 372 tests are explicitly designed to break or bypass the enforcement. Core protections are structural: AI cannot authorize itself, forged results are rejected by an issuance registry, unexpected exceptions fail closed. The known weaker point: caller-supplied fields (loggingReady, prohibitedUse) are trusted without independent verification. That is documented and requires upstream trustworthiness. For a controlled pilot it is manageable. For production it requires additional verification."',
    avoid: 'Do not claim the system is bypass-proof.',
  },
  {
    q: '"What happens if one of our clients\' regulators audits the system?"',
    why: 'EU AI Act and financial regulation create audit obligations that flow downstream to vendors.',
    answer: '"Every decision has a reason code, an evidence bundle, and a verifiable chain of custody — designed to be auditable. What a regulator would not yet have: third-party security review, cryptographic signatures on the evidence, and a formal compliance certification. Those are the three items I would want in place before any regulator looks at a production deployment."',
    avoid: 'Do not claim regulatory compliance.',
  },
  {
    q: '"What makes CerbaSeal different from something we could build internally?"',
    why: 'Any well-resourced firm may consider building in-house.',
    answer: '"Build vs. buy is a legitimate question. What you get with CerbaSeal: an adversarially tested enforcement layer — 66 bypass attempts, 12 hard invariants, a hash-chained evidence system, and a clear boundary between enforcement and business logic. What you would build from scratch: all of that, plus the test suite, plus the invariant model. The real question is whether governance enforcement is core to what Line Axia builds or core to what Line Axia sells."',
    avoid: 'Do not dismiss in-house engineering capability.',
  },
  {
    q: '"How do we handle a CerbaSeal block that turns out to be wrong?"',
    why: 'False positives in a governance system are operationally painful.',
    answer: '"Every HOLD and REJECT includes a diagnostic report identifying exactly which rule was triggered. For a HOLD: a human reviewer reads the diagnostic, decides to approve or defer, and the system logs that decision. For a REJECT that appears incorrect: the issue enters the tracked queue, root cause is investigated, and if the rule is wrong the fix is documented and scoped. There is no override button — by design. Every outcome is logged."',
    avoid: 'Do not imply there is an administrative override.',
  },
  {
    q: '"Can you tell us about the a16z application or other active partnerships?"',
    why: 'Potential conflict with an exclusivity arrangement. Strategic, not technical.',
    answer: 'Jesse answers directly. Know your position on active investor conversations before the call.',
    avoid: 'Do not get caught in an inconsistency about current conversations.',
  },
  {
    q: '"What governing law would you want for the agreement?"',
    why: 'France-based firm with EU clients. They will want EU or French law. Jesse needs a clear position going in.',
    answer: 'Jesse answers directly. Suggested framing: "I\'m open to French law or EU law given your client base. What I\'d want clearly defined regardless of jurisdiction: what constitutes a change request, evidence ownership, and liability cap. Those matter more to me than the jurisdiction choice."',
    avoid: 'Do not dismiss the jurisdiction question — Tina Simpson will make it a point.',
  },
  {
    q: '"What would 12-month EU exclusivity actually mean and what would it cost?"',
    why: 'If the conversation reaches exclusivity, she will want to understand what she is buying and at what cost.',
    answer: '"EU exclusivity means I don\'t deploy CerbaSeal for another EU client for 12 months. What I\'d want defined: what counts as \'EU\' for this purpose, what event triggers a right-of-first-refusal to extend, and what terminates exclusivity if the engagement is inactive. The commercial value of exclusivity is a separate negotiation from the pilot fee — I\'d rather not bundle them."',
    avoid: 'Do not commit to exclusivity terms on the call. Get it in writing first.',
  },
];

QS.forEach((item, i) => {
  safeY(180);
  const blockY = doc.y;
  doc.rect(M - 10, blockY, 3, 8).fill(C.blue);
  doc.fontSize(7.5).fillColor(C.muted).font('Helvetica-Bold')
     .text(`Q${String(i + 1).padStart(2, '0')}`, M - 6, blockY, { width: 20 });
  doc.fontSize(9.5).fillColor(C.navy).font('Helvetica-Bold')
     .text(item.q, M + 18, blockY, { width: TW - 18 });
  doc.y += 4;

  doc.fontSize(8).fillColor(C.muted).font('Helvetica-Bold').text('WHY SHE ASKS:  ', M, doc.y, { continued: true, width: TW });
  doc.font('Helvetica').fillColor(C.muted).text(item.why, { width: TW });
  doc.y += 2;

  doc.fontSize(8).fillColor(C.green).font('Helvetica-Bold').text('YOUR ANSWER:  ', M, doc.y, { continued: true, width: TW });
  doc.font('Helvetica').fillColor(C.body).text(item.answer, { width: TW });
  doc.y += 2;

  doc.fontSize(8).fillColor(C.red).font('Helvetica-Bold').text('DO NOT SAY:  ', M, doc.y, { continued: true, width: TW });
  doc.font('Helvetica').fillColor(C.red).text(item.avoid, { width: TW });
  doc.y += 12;

  doc.rect(M, doc.y, TW, 0.5).fill(C.rule);
  doc.y += 8;
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7 — FOUNDER CHEAT SHEET
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
sectionHeader('07', 'Founder Cheat Sheet', C.navy);
body('Read this the morning of the call. One question at a time. Plain English. No technical jargon required.', C.muted);
moveY(0.35);

const CHEAT = [
  {
    q: '"Where is CerbaSeal / what is VeraSeal?"',
    s: '"CerbaSeal is the enforcement system. There is no component called VeraSeal in this build."',
    h: '"What I have is a working governance engine — 372 tests, 15 independent checks — not yet deployed outside a demo environment."',
    d: '"VeraSeal is our…" — stop. Do not finish that sentence.',
  },
  {
    q: '"Is this EU-deployable?"',
    s: '"Architecturally yes — no external calls, no cloud, runs wherever Node.js runs."',
    h: '"I have not deployed it outside Replit yet. First client deployment would be the first deployment anywhere."',
    d: '"We have tested this in EU environments." — false.',
  },
  {
    q: '"What do you actually do during the pilot?"',
    s: '"Intensive week one, then weekly 30-minute calls and tracked email support."',
    h: '"I\'m a solo founder. 48-hour self-service model documented. Beyond that, no backup engineer today."',
    d: '"I\'m available 24/7." — you are not.',
  },
  {
    q: '"How available are you?"',
    s: '"3–5 hours per week after week one, defined response times for every issue severity."',
    h: '"Solo founder. If unavailable, the system runs without me for 48 hours. Beyond that is a documented risk."',
    d: '"Don\'t worry, I\'ll always be there." — do not promise what you cannot guarantee.',
  },
  {
    q: '"Any open-source concerns?"',
    s: '"CerbaSeal-Core has zero runtime dependencies. The demo runner uses tsx — MIT licensed."',
    h: '"No GPL anywhere. Nothing ships with the library itself. Cleanest possible supply chain story."',
    d: '"It\'s built entirely from scratch with no dependencies at all." — tsx exists. Name it for the demo.',
  },
  {
    q: '"What happens to the audit log on restart?"',
    s: '"It\'s in-memory today. Persistent storage is my top pre-pilot build item."',
    h: '"This is a real gap. It must be fixed before any client data enters the system. No exceptions."',
    d: '"The evidence is fully durable." — in-memory means lost on restart. Do not say this.',
  },
  {
    q: '"Has anyone else reviewed your security?"',
    s: '"No external review yet. I have a security brief documenting every known limitation."',
    h: '"All review is internal. External review is a prerequisite before production use."',
    d: '"We\'ve been reviewed by…" — do not name anyone unless it is true.',
  },
  {
    q: '"Is the audit chain cryptographically signed?"',
    s: '"Hash-linked for tamper detection. Not key-signed. Proves consistency, not origin."',
    h: '"HMAC signing is on the gap list. For a pilot evaluation the hash chain is sufficient."',
    d: '"The evidence is cryptographically verified." — hash-chained is not the same as signed.',
  },
  {
    q: '"Do you have existing clients?"',
    s: '"No. This conversation is the beginning of that."',
    h: '"No signed pilot client. No commercial agreement. Proof-stage product."',
    d: '"We\'re in conversations with several firms." — do not imply clients you do not have.',
  },
  {
    q: '"Is CerbaSeal production-ready?"',
    s: '"No. Pilot-ready: one workflow, controlled environment, no production decisions."',
    h: '"Production requires persistent storage, cryptographic signing, external security review. Those are the gaps."',
    d: '"We\'re very close to production-ready." — you are not. Say exactly what you are.',
  },
];

CHEAT.forEach((item, i) => {
  safeY(100);
  const bY = doc.y;
  doc.rect(M - 10, bY, TW + 10, 14).fill(C.bgCool);
  doc.fontSize(8).fillColor(C.muted).font('Helvetica-Bold')
     .text(String(i + 1).padStart(2, '0'), M - 4, bY + 3, { width: 18 });
  doc.fontSize(9).fillColor(C.navy).font('Helvetica-Bold')
     .text(item.q, M + 14, bY + 3, { width: TW - 14 });
  doc.y = bY + 18;

  doc.fontSize(8).fillColor(C.green).font('Helvetica-Bold').text('SHORT:   ', M + 10, doc.y, { continued: true });
  doc.font('Helvetica').fillColor(C.body).text(item.s, { width: TW - 10 });
  doc.y += 2;
  doc.fontSize(8).fillColor(C.amber).font('Helvetica-Bold').text('HONEST:  ', M + 10, doc.y, { continued: true });
  doc.font('Helvetica').fillColor(C.body).text(item.h, { width: TW - 10 });
  doc.y += 2;
  doc.fontSize(8).fillColor(C.red).font('Helvetica-Bold').text('DANGER:  ', M + 10, doc.y, { continued: true });
  doc.font('Helvetica').fillColor(C.red).text(item.d, { width: TW - 10 });
  doc.y += 12;
});

// ─── PRE-CALL CHECKLIST ───────────────────────────────────────────────────────
safeY(220);
moveY(0.5);
const clY = doc.y;
doc.rect(M, clY, TW, 16).fill(C.navy);
doc.fontSize(8).fillColor(C.white).font('Helvetica-Bold')
   .text('PRE-CALL CHECKLIST', M + 8, clY + 5, { width: TW - 16 });
doc.y = clY + 22;

const checklist = [
  ['CONFIRMED',     C.green,  '372 tests passing, 0 failing — run pnpm test to confirm before the call'],
  ['CONFIRMED',     C.green,  '15/15 audit checks — run pnpm audit:repo to confirm'],
  ['CONFIRMED',     C.green,  'LICENSE file exists and is properly formed (proprietary, Lamont Labs)'],
  ['CONFIRMED',     C.green,  'Demo live at cerbaseal.replit.app — open it before the call starts'],
  ['DO BEFORE',     C.amber,  'Know your position: cyber liability insurance, governing law preference, exclusivity terms'],
  ['DO BEFORE',     C.amber,  'Know your estimate for persistent storage build: 2–5 days file-backed, longer for production-grade'],
  ['DO BEFORE',     C.amber,  'Run through Section 6 questions verbally — out loud, not just in your head'],
  ['ON THE CALL',   C.blue,   'If she says VeraSeal: correct it once, move on, do not labour the point'],
  ['ON THE CALL',   C.blue,   'Lead with what is real. Enforcement core, tests, audit checks are all real.'],
  ['ON THE CALL',   C.blue,   'Do not overclaim. Every claim you make will be checked by Tina Simpson.'],
  ['AFTER THE CALL',C.muted,  'Follow up in writing: confirmed pilot shape, prerequisites, and next steps within 24 hours'],
];
checklist.forEach(([status, color, text]) => {
  safeY(30);
  doc.fontSize(7.5).fillColor(color).font('Helvetica-Bold')
     .text('[' + status + ']', M, doc.y, { width: 80, continued: false });
  doc.fontSize(8.5).fillColor(C.body).font('Helvetica')
     .text(text, M + 85, doc.y - 10, { width: TW - 85 });
  doc.y += 4;
});

safeY(80);
moveY(0.6);
callout(
  'Closing Position — The Honest Competitive Advantage',
  'The competitive position is not "we are production-ready." ' +
  'The competitive position is: the enforcement logic that most governance products describe in slide decks is implemented, tested, and observable running right now. ' +
  'The gaps are documented accurately, not hidden. A pilot is the right next step — bounded scope, defined success criteria, signed agreement first. ' +
  'That is a stronger position than overclaiming. Olivia will verify every claim made on this call. The ones above will hold.',
  C.bgBlue, C.blue, C.ink
);

// ─── PAGE FOOTERS ─────────────────────────────────────────────────────────────
const total = doc.bufferedPageRange().count;
for (let i = 0; i < total; i++) {
  doc.switchToPage(i);
  if (i === 0) continue; // cover page has its own footer
  doc.rect(0, PH - 20, PW, 20).fill(C.bgCool);
  doc.rect(0, PH - 20, PW, 0.5).fill(C.rule);
  doc.fontSize(7).fillColor(C.muted).font('Helvetica')
     .text(
       `CerbaSeal-Core v0.1.0  ·  Lamont Labs  ·  CTO Call Preparation Binder — Line Axia  ·  2026-06-02  ·  CONFIDENTIAL  ·  Page ${i + 1} of ${total}`,
       M, PH - 12, { width: TW, align: 'center' }
     );
}

doc.end();
doc.on('end', () => console.log('Written:', OUT));
