import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'docs/reports/LINE_AXIA_CALL_QA_BRIEF.pdf');
const doc = new PDFDocument({ margin: 0, size: 'LETTER', bufferPages: true });
doc.pipe(fs.createWriteStream(OUT));

const C = {
  navy:   '#0f172a', slate:  '#1e293b', blue:   '#1d4ed8',
  teal:   '#0f766e', green:  '#15803d', amber:  '#b45309',
  red:    '#b91c1c', body:   '#334155', muted:  '#64748b',
  rule:   '#e2e8f0', bgCool: '#f8fafc', bgBlue: '#eff6ff',
  bgGreen:'#f0fdf4', bgAmber:'#fffbeb', bgRed:  '#fef2f2',
  white:  '#ffffff',
};

const M = 58; const PW = 612; const PH = 792; const TW = PW - M * 2;

function newPage() { doc.addPage({ margin: 0, size: 'LETTER' }); chrome(); }
function chrome() {
  doc.rect(0, 0, PW, 5).fill(C.blue);
  doc.rect(M - 12, 5, 1, PH - 28).fill(C.rule);
  doc.y = 20;
}
function safe(n = 130) { if (doc.y > PH - n) newPage(); }

function coverStripe(color, h) { doc.rect(0, doc.y, PW, h).fill(color); }

// ── TYPE ─────────────────────────────────────────────────────────────────────
function h1(t, color = C.white) {
  doc.fontSize(28).fillColor(color).font('Helvetica-Bold').text(t, M, doc.y, { width: TW });
  doc.moveDown(0.15);
}
function h2(t, color = C.navy) {
  safe(100);
  doc.moveDown(0.5);
  doc.fontSize(10.5).fillColor(color).font('Helvetica-Bold').text(t, M, doc.y, { width: TW });
  doc.moveDown(0.2);
}
function h3(t, color = C.blue) {
  safe(80);
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor(color).font('Helvetica-Bold').text(t, M, doc.y, { width: TW });
  doc.moveDown(0.1);
}
function body(t, color = C.body) {
  doc.fontSize(9).fillColor(color).font('Helvetica').text(t, M, doc.y, { width: TW, lineGap: 2.5 });
  doc.moveDown(0.25);
}
function bodyBold(t, color = C.navy) {
  doc.fontSize(9).fillColor(color).font('Helvetica-Bold').text(t, M, doc.y, { width: TW, lineGap: 2 });
  doc.moveDown(0.2);
}
function bullets(items, color = C.body) {
  items.forEach(item => {
    const y = doc.y;
    doc.fontSize(8.5).fillColor(C.blue).font('Helvetica-Bold').text('›', M + 2, y, { width: 10 });
    doc.fontSize(9).fillColor(color).font('Helvetica').text(item, M + 14, y, { width: TW - 14, lineGap: 2 });
    doc.y += 3;
  });
  doc.moveDown(0.2);
}
function rule(color = C.rule) {
  doc.moveDown(0.35); doc.rect(M, doc.y, TW, 0.75).fill(color); doc.moveDown(0.4);
}

// ── CALLOUT BOXES ────────────────────────────────────────────────────────────
function box(title, text, bg, accent) {
  safe(80);
  const lines = Math.ceil(text.length / 88);
  const bH = Math.max(48, lines * 13 + 26);
  const bY = doc.y;
  doc.rect(M, bY, TW, bH).fill(bg);
  doc.rect(M, bY, 3, bH).fill(accent);
  doc.fontSize(7.5).fillColor(accent).font('Helvetica-Bold').text(title.toUpperCase(), M + 11, bY + 8, { width: TW - 16 });
  doc.fontSize(9).fillColor(C.navy).font('Helvetica').text(text, M + 11, bY + 20, { width: TW - 18, lineGap: 2.5 });
  doc.y = bY + bH + 10;
}
function infoBox(t, txt)   { box(t, txt, C.bgBlue,  C.blue); }
function warnBox(t, txt)   { box(t, txt, C.bgAmber, C.amber); }
function dangerBox(t, txt) { box(t, txt, C.bgRed,   C.red); }
function goodBox(t, txt)   { box(t, txt, C.bgGreen, C.green); }

// ── SECTION BANNER ───────────────────────────────────────────────────────────
function sectionBanner(num, title, sub, accent = C.blue) {
  const bY = doc.y;
  doc.rect(0, bY - 2, PW, 40).fill(C.navy);
  doc.rect(0, bY - 2, 5, 40).fill(accent);
  doc.fontSize(8).fillColor(accent).font('Helvetica-Bold').text('Q' + num, M + 4, bY + 4, { width: 24 });
  doc.fontSize(11).fillColor(C.white).font('Helvetica-Bold').text(title, M + 28, bY + 4, { width: TW - 28 });
  doc.fontSize(8).fillColor(C.muted).font('Helvetica').text(sub, M + 28, bY + 18, { width: TW - 28 });
  doc.y = bY + 46;
}

function appendixBanner(letter, title, accent = C.blue) {
  const bY = doc.y;
  doc.rect(0, bY - 2, PW, 32).fill(C.navy);
  doc.rect(0, bY - 2, 5, 32).fill(accent);
  doc.fontSize(8).fillColor(accent).font('Helvetica-Bold').text('SECTION ' + letter, M + 4, bY + 4);
  doc.fontSize(11).fillColor(C.white).font('Helvetica-Bold').text(title.toUpperCase(), M + 4, bY + 16, { width: TW });
  doc.y = bY + 38;
}

function qBlock(label, text, labelColor = C.blue) {
  safe(60);
  doc.moveDown(0.15);
  const bY = doc.y;
  doc.fontSize(7.5).fillColor(labelColor).font('Helvetica-Bold').text(label, M, bY, { width: TW });
  doc.moveDown(0.12);
  body(text);
}

// ═══════════════════════════════════════════════════════════════════════════════
// COVER
// ═══════════════════════════════════════════════════════════════════════════════
doc.rect(0, 0, PW, PH).fill(C.navy);
doc.rect(0, 0, PW, 5).fill(C.blue);
doc.rect(PW - 5, 0, 5, PH).fill(C.blue);
doc.rect(M, 100, TW, 1).fill(C.blue);

doc.fontSize(8).fillColor(C.muted).font('Helvetica-Bold')
   .text('LAMONT LABS  ·  CONFIDENTIAL  ·  2026-06-03', M, 82, { width: TW, align: 'right' });

doc.fontSize(34).fillColor(C.white).font('Helvetica-Bold').text('Technical Q&A', M, 116, { width: TW });
doc.fontSize(34).fillColor(C.blue).font('Helvetica-Bold').text('Call Brief', M, 152, { width: TW });
doc.rect(M, 202, TW, 1).fill(C.blue);
doc.fontSize(12).fillColor('#94a3b8').font('Helvetica-Bold')
   .text('Line Axia  —  Olivia Aréchiga, CTO', M, 214, { width: TW });
doc.fontSize(8.5).fillColor(C.muted).font('Helvetica')
   .text('10 structured questions  ·  5 supporting sections  ·  Evidence-based  ·  Founder-facing', M, 232, { width: TW });

// contents
doc.rect(M, 268, TW, 342).fill('#0a0f1e');
doc.rect(M, 268, 3, 342).fill(C.blue);
doc.fontSize(7.5).fillColor(C.blue).font('Helvetica-Bold').text('CONTENTS', M + 14, 280);
const contents = [
  ['Q1',  'Deployment Readiness & VeraSeal',    'MEDIUM RISK'],
  ['Q2',  'EU / Client-Controlled Deployment',  'MEDIUM RISK'],
  ['Q3',  'Operational Role & Support Model',   'LOW RISK'],
  ['Q4',  'Realistic Capacity',                 'LOW-MEDIUM RISK'],
  ['Q5',  'Dependencies & Supply Chain',        'LOW RISK'],
  ['Q6',  'Compensation Model',                 'HIGH RISK'],
  ['Q7',  'Division of Responsibility',         'MEDIUM-HIGH RISK'],
  ['Q8',  'IP Ownership',                       'LOW RISK'],
  ['Q9',  'Exclusivity Terms',                  'HIGH RISK'],
  ['Q10', 'Working Agreement Requirements',     'MEDIUM RISK'],
  ['A',   'Follow-Up Questions Olivia May Ask', ''],
  ['B',   'Questions Jesse Should Ask',         ''],
  ['C',   'Red Flags — Do Not Say',             ''],
  ['D',   'One Sentence Version',               ''],
  ['E',   'Call Risk Assessment',               ''],
];
contents.forEach(([n, t, r], i) => {
  const ry = 296 + i * 20;
  const isNum = !isNaN(parseInt(n));
  doc.fontSize(8).fillColor(isNum ? C.blue : C.teal).font('Helvetica-Bold').text(n, M + 14, ry, { width: 26 });
  doc.fontSize(8.5).fillColor(C.white).font('Helvetica').text(t, M + 42, ry, { width: 260 });
  if (r) {
    const rc = r.includes('HIGH') ? C.red : r.includes('LOW') ? C.green : C.amber;
    doc.fontSize(7).fillColor(rc).font('Helvetica-Bold').text(r, M + 310, ry, { width: 150 });
  }
});

// instruction box
doc.rect(M, 626, TW, 90).fill('#131b2e');
doc.rect(M, 626, 3, 90).fill(C.teal);
doc.fontSize(7.5).fillColor(C.teal).font('Helvetica-Bold').text('HOW TO USE THIS DOCUMENT', M + 14, 636);
doc.fontSize(8.5).fillColor('#94a3b8').font('Helvetica').text(
  'Every answer follows the same five-part structure: What She\'s Really Asking · My Answer · ' +
  'Risks/Caveats · Supporting Evidence From Repo · Question Back To Her.\n\n' +
  'All content is sourced from the repository, audit output, security brief, pilot operations model, ' +
  'EU deployment posture, and dependency analysis. Nothing is invented. If a capability does not ' +
  'exist in the codebase, this document says so.',
  M + 14, 650, { width: TW - 24, lineGap: 2.5 }
);

doc.fontSize(7).fillColor(C.muted).font('Helvetica')
   .text('CerbaSeal-Core v0.1.0  ·  Lamont Labs  ·  Technical Q&A Call Brief  ·  CONFIDENTIAL',
         M, PH - 16, { width: TW, align: 'center' });

// ═══════════════════════════════════════════════════════════════════════════════
// Q1
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
sectionBanner('1', 'Deployment Readiness & VeraSeal', '"Where is CerbaSeal right now relative to external deployment?"', C.red);

qBlock('WHAT SHE\'S REALLY ASKING', 'Is this real software or a prototype, and how far away are you from putting it in front of a real client with real data? The VeraSeal reference may mean she has seen other materials, heard a different name somewhere, or is testing whether you know your own product.');

dangerBox('Correct This First',
  '"VeraSeal" does not exist anywhere in this repository — not in source code, file names, tests, documentation, or comments. ' +
  'Correct it immediately: "The enforcement system is called CerbaSeal — specifically ExecutionGateService." Then move on. Do not improvise a definition.');

qBlock('MY ANSWER', 'What exists today: a working enforcement engine with 12 hard rules that every request must pass before any action is permitted. Three possible outcomes only: ALLOW, HOLD, REJECT. Fail-closed behavior — anything unexpected produces REJECT, never ALLOW. 372 passing tests, 0 failing. 66 of those tests are specifically designed to break the enforcement — all 66 fail to do so. 15 independent audit checks all passing. A live review portal where Olivia can observe the system running now.\n\nWhat does not yet exist: persistent audit storage (log is in-memory; lost on restart), any deployment outside Replit, a containerised build, a signed commercial agreement with any client, a third-party security review.\n\nPilot-ready means: one client, one workflow, one controlled environment, no production decisions, defined success criteria, signed agreement before real data is touched. The enforcement core is solid. The deployment infrastructure is the remaining gap.');

qBlock('RISKS / CAVEATS',
  '• The in-memory audit log is the most important gap. Must be fixed before any pilot begins.\n' +
  '• First external deployment would be the first deployment anywhere outside Replit.\n' +
  '• "Pilot-ready" must be defined carefully. It does not mean production-ready.\n' +
  '• VeraSeal does not exist. Do not improvise a definition under any circumstance.', C.amber);

qBlock('SUPPORTING EVIDENCE FROM REPO',
  '372 tests: confirmed by pnpm test. 15/15 audit checks: confirmed by pnpm audit:repo. ' +
  'Persistent storage gap: docs/security/security-review-brief.md, "Known Limitations." ' +
  'Pilot-ready definition: docs/pilot/pilot-readiness-brief.md, "First Pilot Shape." ' +
  'VeraSeal: grep of entire repository returns zero results.', C.muted);

qBlock('QUESTION BACK TO HER',
  '"When you mention VeraSeal — can you tell me where that name came from? I want to make sure we\'re looking at the same system."', C.teal);

// ═══════════════════════════════════════════════════════════════════════════════
// Q2
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
sectionBanner('2', 'EU / Client-Controlled Deployment', '"Can CerbaSeal be deployed without client data passing through US infrastructure?"', C.teal);

qBlock('WHAT SHE\'S REALLY ASKING', 'Data leaving EU infrastructure is a legal problem for a France-based firm with EU clients, not a preference. She wants to know whether this is solved or whether she is being asked to bet on something that has not been built yet. These are different risks.');

goodBox('Architecture Supports EU Deployment',
  'CerbaSeal makes zero outbound network calls. There are no cloud dependencies, no external APIs, no telemetry, no third-party services. ' +
  'The CerbaSeal-Core enforcement library has zero runtime dependencies — it brings nothing with it when installed. ' +
  'It runs wherever Node.js runs. Mode C (client-controlled environment) is the documented preferred EU pilot path.');

qBlock('MY ANSWER', 'The architecture makes EU deployment possible. The execution of a real EU deployment has not happened. Both facts are true and both must be stated.\n\nWhat is confirmed: zero outbound calls in any enforcement path, no cloud or external dependencies, four deployment modes documented with Mode C preferred for EU, no geographic restriction in the code.\n\nWhat has not been confirmed: no EU deployment executed, no Dockerfile exists, no deployment runbook exists, no DPA template exists, no GDPR analysis completed, no legal review of EU evidence retention requirements.');

qBlock('RISKS / CAVEATS',
  '• Architecture supports it ≠ proven to work. Be precise about which one you are claiming.\n' +
  '• A DPA must exist before real data enters the system. Non-negotiable.\n' +
  '• Legal review of EU evidence retention requirements must precede production use.\n' +
  '• First deployment will surface configuration issues that do not exist in the demo.', C.amber);

qBlock('SUPPORTING EVIDENCE FROM REPO',
  'Zero external calls: confirmed by source code review of all enforcement paths. ' +
  'Mode C: docs/deployment/eu-pilot-deployment-posture.md. ' +
  '"CerbaSeal does not require outbound network access" and "does not call external APIs" — stated explicitly in eu-pilot-deployment-posture.md. ' +
  'Zero runtime deps: confirmed by CerbaSeal-Core/node_modules audit. ' +
  'DPA requirement: eu-pilot-deployment-posture.md, "EU / Client-Controlled Infrastructure Posture."', C.muted);

qBlock('QUESTION BACK TO HER',
  '"What does Line Axia\'s current hosting environment look like — are you running EU cloud infrastructure today, or would this need to be provisioned as part of the pilot setup?"', C.teal);

// ═══════════════════════════════════════════════════════════════════════════════
// Q3
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
sectionBanner('3', 'Operational Role & Support Model', '"Would you need to be present throughout, or can the client operate independently?"', C.blue);

qBlock('WHAT SHE\'S REALLY ASKING', 'She is evaluating solo-founder risk. She wants to know whether this engagement depends on constant availability, and whether Line Axia would be blocked if Jesse becomes unavailable. She is also checking whether the support model is documented or being improvised.');

infoBox('This Is The Best-Documented Section', 'The pilot operations model was written before this call. Every commitment below exists in docs/pilot-operations-model.md. Jesse is reading from documentation, not improvising.');

qBlock('MY ANSWER — WEEK 1 (HIGHEST INTENSITY)',
  'One 60-minute kickoff call: define the workflow, success criteria, authority model. Deploy CerbaSeal in the agreed environment. Execute baseline scenarios: REJECT, HOLD, ALLOW confirmed in client context. Signed pilot scope document, workflow map, authority matrix, and baseline test scenarios all delivered in writing.');

qBlock('MY ANSWER — ONGOING (WEEKLY RHYTHM)',
  '30-minute weekly review call. Tracked issue queue: every issue receives an ID, severity, status, and written resolution. Weekly status update. Email support during the week. Decision log: every governance interpretation written down.');

h3('Documented Response Commitments');
const resp = [
  ['P1 — System unusable', 'Same business day'],
  ['P2 — Rule violation', 'Within 24 hours'],
  ['P3 — General question', 'Within 3 business days'],
  ['P4 — Enhancement', 'Reviewed at weekly planning'],
];
resp.forEach(([p, r]) => {
  const y = doc.y;
  doc.fontSize(9).fillColor(C.navy).font('Helvetica-Bold').text(p, M, y, { width: 220 });
  doc.fontSize(9).fillColor(C.green).font('Helvetica-Bold').text(r, M + 230, y, { width: 180 });
  doc.y += 14;
});
doc.moveDown(0.3);

qBlock('INDEPENDENCE OVER TIME', 'The system explains its own decisions. Every blocked action produces a reason code and diagnostic report. The full 15-check audit re-runs without the founder using one command. Proof snapshots verify independently. Evidence bundles are human-readable. Founder presence is highest at week one and decreases steadily.');

warnBox('Unavailability Limit', 'Up to 48 hours: system runs independently, audit re-runs, all documentation accessible. Beyond 48 hours: no formal contingency exists. Solo founder, no backup engineer. Must be named honestly and addressed in the working agreement if a stronger guarantee is required.');

qBlock('RISKS / CAVEATS',
  '• Solo founder. No second engineer for live issue response. Name this.\n' +
  '• Beyond 48 hours: no formal contingency in the documentation.\n' +
  '• 24/7 on-call is a different engagement structure. Scope and price it separately.', C.amber);

qBlock('SUPPORTING EVIDENCE FROM REPO',
  'Full support model: docs/pilot-operations-model.md. P1–P4 response times: same file. ' +
  '48-hour self-service model: "Founder Availability" section. ' +
  'Independence design: "What This Model Does Not Require." ' +
  'All artifacts owned by client: "Pilot Exit Deliverables."', C.muted);

qBlock('QUESTION BACK TO HER',
  '"Who on the Line Axia side would be the primary technical contact — someone who can read diagnostic output and run verification commands, or would that always come through me?"', C.teal);

// ═══════════════════════════════════════════════════════════════════════════════
// Q4
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
sectionBanner('4', 'Realistic Capacity', '"What is your realistic capacity alongside current portfolio development?"', C.blue);

qBlock('WHAT SHE\'S REALLY ASKING', 'Will you actually show up? Are there competing commitments that would reduce your availability? Is there a timing that optimises the start for both sides?');

warnBox('Sourcing Note', 'Personal schedule and portfolio constraints are not stored in the repository. The time estimates below are structured from the pilot operations model. Jesse provides the specifics about current commitments.');

h3('What The Pilot Requires — Hour Estimates');
bullets([
  'Week 1: 10–15 hours active founder work (scoping, deployment, baseline, documents)',
  'Weeks 2+: 3–5 hours per week in a normal week',
  'P1 spike: potentially a half-day',
  'P2 spike: 2–4 hours of root-cause analysis',
  'No competing active pilot deployments — this would be the first',
], C.body);

qBlock('PRE-PILOT BUILD ITEM', 'Persistent audit storage must be implemented before any pilot begins. Estimate: 2–5 days for file-backed or SQLite-backed implementation. This needs to be factored into the pilot start date.');

qBlock('RISKS / CAVEATS',
  '• Solo founder means capacity is real and finite. Do not imply otherwise.\n' +
  '• Pre-pilot build (persistent storage) must be scoped into the start timeline.\n' +
  '• Issue spikes in weeks 2–4 increase demand. Budget for it.\n' +
  '• No delegation path today.', C.amber);

qBlock('SUPPORTING EVIDENCE FROM REPO',
  'Pilot onboarding time structure: docs/pilot-operations-model.md. ' +
  'Scope boundaries: docs/pilot/pilot-readiness-brief.md. ' +
  'Pre-pilot requirement (persistent storage): docs/security/security-review-brief.md.', C.muted);

qBlock('QUESTION BACK TO HER',
  '"What is Line Axia\'s preferred timeline for pilot start — and is there a specific client workflow or decision type you already have in mind?"', C.teal);

// ═══════════════════════════════════════════════════════════════════════════════
// Q5
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
sectionBanner('5', 'Dependencies & Supply Chain', '"Are there open-source components or dependencies we should be aware of?"', C.teal);

goodBox('Zero Runtime Dependencies In The Enforcement Library',
  'CerbaSeal-Core (the enforcement library that a client actually installs) has zero runtime dependencies. Nothing ships with it. ' +
  'A client security review covers: Node.js runtime (client-provided) plus CerbaSeal source. That is the entire deployment stack. ' +
  'This is confirmed by direct audit of CerbaSeal-Core/node_modules — it contains only dev/test tooling.');

qBlock('WHAT SHE\'S REALLY ASKING', 'Does CerbaSeal bring any third-party software into her clients\' environments that could create license obligations, supply chain risk, or compliance issues? For EU regulated clients, this is a due diligence requirement.');

qBlock('TWO PACKAGES TO SEPARATE CLEARLY', '');

h3('CerbaSeal-Core — The Enforcement Library (What Clients Install)');
bullets(['Zero runtime dependencies. None.', 'Brings nothing with it into any client environment.', 'Security review surface: Node.js + CerbaSeal source only.'], C.green);

h3('cerbaseal-review — The Demo Wrapper (cerbaseal.replit.app Only)');
bullets([
  'tsx 4.21.0 (MIT) — runs TypeScript without a compile step. Demo convenience, not a client deployment component.',
  'esbuild 0.27.x (MIT) — used internally by tsx.',
  'get-tsconfig 4.13.x (MIT) — used by tsx.',
  'resolve-pkg-maps 1.0.0 (MIT) — used by get-tsconfig.',
], C.body);

h3('License Summary');
bullets([
  'All runtime licenses: MIT. No restrictions on commercial use.',
  'Zero GPL anywhere in the dependency tree.',
  'Zero copyleft in any client deployment.',
  'No source disclosure obligation to clients.',
  'TypeScript compiler: Apache 2.0 (dev/build only, not deployed).',
], C.green);

h3('External Services Audit');
const services = [
  'Cloud platform dependencies: NONE',
  'External API calls: NONE — confirmed by source code review',
  'Telemetry or analytics: NONE',
  'Authentication providers: NONE',
  'Outbound network calls: NONE — confirmed by source code review',
];
bullets(services, C.green);

qBlock('RISKS / CAVEATS',
  '• Zero-dependency claim applies to CerbaSeal-Core specifically. Be precise.\n' +
  '• npm used at install time — can be replaced with private registry or offline bundle if required.\n' +
  '• No formal SBOM generated. Can be produced on request.', C.amber);

qBlock('SUPPORTING EVIDENCE FROM REPO',
  'CerbaSeal-Core/node_modules: only vitest, vite, typescript, chai (dev/test only). ' +
  'Root package.json (cerbaseal-review): one production dep — tsx ^4.21.0. ' +
  'License MIT: confirmed for tsx 4.21.0. Zero GPL: full dependency tree audit completed.', C.muted);

qBlock('60-SECOND VERBAL ANSWER',
  '"The CerbaSeal enforcement library has zero runtime dependencies — nothing ships with it. The demo you\'re looking at uses one package called tsx to run TypeScript directly — that\'s MIT licensed and it\'s part of the demo, not the library. No cloud services, no external APIs, no telemetry. All licenses are MIT. No GPL anywhere. If your security team needed to review a client deployment, the surface is Node.js plus CerbaSeal source. That is it."', C.teal);

qBlock('QUESTION BACK TO HER',
  '"Does Line Axia have a standard supply-chain review process, or would this go through your clients\' security teams directly?"', C.teal);

// ═══════════════════════════════════════════════════════════════════════════════
// Q6
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
sectionBanner('6', 'Compensation Model', '"Fixed fee, percentage of engagement, or something else?"', C.red);

dangerBox('High Risk Question — No Repository Evidence', 'This question has no repository evidence to lean on. Jesse is negotiating commercial terms live, potentially without knowing Line Axia\'s fee structure. Do not anchor a number before understanding the deal economics from their side.');

qBlock('WHAT SHE\'S REALLY ASKING', 'She is testing whether Jesse has thought about this seriously and whether his commercial instincts are workable. She may also be assessing whether his model creates misaligned incentives — a percentage structure that makes him dependent on deal size rather than pilot quality.');

qBlock('WHAT THE DOCUMENTATION SUPPORTS',
  'The pilot scope is explicit: one client, one workflow, defined deliverables, defined support terms. A fixed fee reflects that. Week 1 is the highest-effort period. Ongoing weeks are lighter. Change requests outside the defined scope are priced separately — this is documented in the pilot model.');

qBlock('MY ANSWER (FRAMEWORK)',
  'A fixed-fee structure for a bounded pilot is the most defensible position. It matches the scoped, defined nature of the engagement. Both sides know what they are paying for and what they get.\n\nChange requests outside the agreed scope are priced separately — this is already documented in the pilot model.\n\nA percentage structure on a v0.1 product creates ambiguity about what counts as "the engagement" and makes compensation dependent on deal dynamics Jesse does not control. Avoid it.\n\nOpen-ended time-and-materials without a cap creates risk for both sides. Avoid it.');

qBlock('RISKS / CAVEATS',
  '• This question may reveal whether Line Axia sees Jesse as a vendor, a technical co-founder, or something in between. Listen carefully.\n' +
  '• If the advisory partner is taking a large commercial fee, Jesse needs to understand what percentage is reasonable given the technical contribution is the product itself.\n' +
  '• Do not anchor a number before understanding the deal size and structure.', C.amber);

qBlock('SUPPORTING EVIDENCE FROM REPO',
  'Pilot scope and deliverables: docs/pilot-operations-model.md. ' +
  'Change request process: same file. ' +
  '"This brief does not include pricing, revenue terms, or commercial commitments" — docs/pilot/pilot-readiness-brief.md.', C.muted);

qBlock('QUESTION BACK TO HER',
  '"What does the overall commercial structure of the engagement look like — is there a retainer, a project fee, or a success-based component? I want to make sure my fee structure aligns with yours rather than creates a different incentive."', C.teal);

// ═══════════════════════════════════════════════════════════════════════════════
// Q7
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
sectionBanner('7', 'Division of Responsibility', '"Advisory manages client + regulatory + commercial. Lamont Labs provides technical implementation."', C.amber);

qBlock('WHAT SHE\'S REALLY ASKING', 'She is proposing a structure and asking Jesse to confirm or push back. She wants to know whether Jesse has any objections — and whether he has thought through what "technical implementation" actually means and what it does not include.');

qBlock('MY ANSWER', 'The division is broadly accurate and workable — with two things made explicit.');

h3('What Lamont Labs Does');
bullets([
  'Delivers and operates the CerbaSeal enforcement layer',
  'Defines the pilot scope document and technical success criteria',
  'Manages issue tracking, response times, and evidence delivery',
  'Produces all technical documentation and the final findings report',
  'Owns the architecture, source code, and all underlying IP',
], C.green);

h3('What Lamont Labs Does NOT Do — And Must Say So');
bullets([
  'Does not provide legal or regulatory compliance opinions — documented explicitly',
  'Does not perform integration engineering into the client\'s internal systems',
  'Does not manage the client relationship or commercial negotiation',
  'Does not make production monitoring, data migration, or schema design commitments',
], C.red);

warnBox('Critical: "Technical Implementation" Must Be Scoped',
  '"Technical implementation" is vague. Configuring CerbaSeal for a defined workflow: in scope. ' +
  'Building custom integrations, new workflow classes, or acting as the client\'s engineering team: out of scope, different conversation. ' +
  'Jesse must retain the right to define what is technically in scope. The advisory partner cannot make technical commitments on CerbaSeal\'s behalf.');

qBlock('RISKS / CAVEATS',
  '• "Technical implementation" needs a defined boundary in the agreement.\n' +
  '• If the advisory partner escalates client technical questions informally, the support model breaks down.\n' +
  '• Regulatory framing for EU AI governance must not create implied technical compliance claims the system does not support.', C.amber);

qBlock('SUPPORTING EVIDENCE FROM REPO',
  'What support includes and excludes: docs/pilot-operations-model.md. ' +
  'Out-of-scope boundaries: docs/pilot/pilot-readiness-brief.md. ' +
  '"CerbaSeal does NOT claim: legal or regulatory compliance certification" — docs/security/security-review-brief.md.', C.muted);

qBlock('QUESTION BACK TO HER',
  '"When you say technical implementation — can you walk me through a specific scenario? I want to make sure I understand exactly where my scope begins and where it ends relative to your client relationship."', C.teal);

// ═══════════════════════════════════════════════════════════════════════════════
// Q8
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
sectionBanner('8', 'IP Ownership', '"Lamont Labs retains full IP ownership. Any other considerations?"', C.blue);

goodBox('Clean IP Position', 'The LICENSE file in the repository is unambiguous: "Copyright 2026 Jesse J. Lamont / Lamont Labs. All rights reserved. This repository and its contents are proprietary and confidential." No rights are granted by access or visibility. CerbaSeal-Core has zero third-party runtime dependencies — nothing brings external IP into the library.');

qBlock('WHAT SHE\'S REALLY ASKING', 'Are there hidden IP complications — open-source licenses requiring disclosure, third-party components with strings attached, co-inventor claims, or anything that would cloud her clients\' confidence in CerbaSeal\'s provenance?');

qBlock('MY ANSWER',
  'Lamont Labs retains full ownership. The LICENSE explicitly states: "CerbaSeal-Core is provided for review and evaluation only unless a separate written agreement grants additional rights."\n\n' +
  'IP facts: zero GPL or copyleft in any client deployment, no source disclosure obligations, all source code is original work, no third-party components licensed into the core.\n\n' +
  'Evidence artifacts and audit records produced during a pilot belong to the client — documented explicitly. Lamont Labs retains no access to client data or evidence records after the engagement.');

h3('One Consideration To Raise');
body('Work product produced specifically for a client pilot (custom workflow configurations, scenario definitions, client-specific authority matrices) needs to be addressed in the working agreement. The general architecture and source code belong to Lamont Labs. Client-specific configuration may be treated differently depending on the terms agreed.');

qBlock('RISKS / CAVEATS',
  '• No formal patent filing exists. If patentability is relevant to client conversations, Jesse needs to know his position.\n' +
  '• The repository is accessible for review. The LICENSE makes clear this grants no rights. Confirm this is understood before any third party views it.\n' +
  '• If the advisory partner\'s regulatory framing references CerbaSeal in client materials, those materials must not create implied licensing that contradicts the LICENSE.', C.amber);

qBlock('SUPPORTING EVIDENCE FROM REPO',
  'LICENSE file: root of repository, proprietary, all rights reserved, Jesse J. Lamont / Lamont Labs, 2026. ' +
  '"The pilot participant keeps all pilot artifacts" — docs/pilot-operations-model.md. ' +
  'Zero copyleft in deployment: confirmed by full dependency audit.', C.muted);

qBlock('QUESTION BACK TO HER',
  '"When you say the advisory partner manages the commercial structure — would that ever include sublicensing CerbaSeal to a client, or is the intent always that Lamont Labs holds the direct licensing relationship?"', C.teal);

// ═══════════════════════════════════════════════════════════════════════════════
// Q9
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
sectionBanner('9', 'Exclusivity Terms', '"12-month EU exclusivity converting to right of first refusal. Reasonable starting point?"', C.red);

dangerBox('High Risk — Do Not Agree On This Call', 'Exclusivity without defined terms, minimum activity, or compensation is a one-sided arrangement that limits Jesse\'s EU market for 12 months. Do not agree to anything on this call. Get every term in writing.');

qBlock('WHAT SHE\'S REALLY ASKING', 'She is trying to lock in a competitive advantage before CerbaSeal becomes available to other advisory partners or direct clients. She is also testing whether Jesse will accept exclusivity without negotiating terms — which would suggest he does not understand his own leverage.');

qBlock('WHAT "12-MONTH EU EXCLUSIVITY" MUST DEFINE BEFORE IT MEANS ANYTHING', '');
bullets([
  'What counts as "EU" — 27 member states? EEA? Switzerland included?',
  'What event activates the 12-month clock — signed agreement? First pilot start? First paid client?',
  'What keeps the exclusivity active — minimum commercial activity? A fee? A guaranteed number of pilots?',
  'What terminates exclusivity early — inactivity? Breach? Mutual agreement?',
  'What does "right of first refusal" mean after 12 months — on what deals, at what notice period, at what matching terms?',
], C.amber);

qBlock('THE HONEST LEVERAGE POSITION',
  'CerbaSeal has a working enforcement engine, 372 passing tests, 15 audit checks, and a documented pilot model. There is no other pilot client today. Exclusivity has value to Line Axia. That value should be reflected in the commercial structure. A 12-month exclusivity without a minimum commitment or a fee is a one-sided arrangement.');

qBlock('RISKS / CAVEATS',
  '• Do not agree to exclusivity on this call. Get it in writing with all terms defined first.\n' +
  '• "Right of first refusal" without defined notice periods and matching terms is unenforceable in practice.\n' +
  '• 12 months of EU exclusivity on a solo-founder product with no minimum activity threshold means Jesse cannot develop the EU market for a year even if Line Axia is inactive.\n' +
  '• Governing law must be defined. French law and Delaware law handle exclusivity differently.', C.red);

qBlock('SUPPORTING EVIDENCE FROM REPO',
  'Agreement prerequisites: docs/pilot/pilot-readiness-brief.md, "Agreement Prerequisites" section. ' +
  'Current pilot status: no signed commercial agreement, no pilot client — confirmed in pilot-readiness-brief.md current limitation notice.', C.muted);

qBlock('QUESTION BACK TO HER',
  '"What does Line Axia\'s typical exclusivity arrangement look like — is there a minimum number of pilots or a minimum commercial commitment attached, or is it purely time-based?"', C.teal);

// ═══════════════════════════════════════════════════════════════════════════════
// Q10
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
sectionBanner('10', 'Working Agreement Requirements', '"What else do you need to feel comfortable moving forward?"', C.blue);

qBlock('WHAT SHE\'S REALLY ASKING', 'She is asking Jesse to reveal his priorities before negotiation begins. This is an opportunity if Jesse is prepared — it shows he has clear requirements. It is a risk if Jesse appears to be figuring out his needs for the first time on the call.');

infoBox('These Are Documented — Not Improvised', 'All five requirements below exist in docs/pilot/pilot-readiness-brief.md, "Agreement Prerequisites" section. Jesse is reading from the repository, not improvising his needs live.');

h3('Five Non-Negotiable Requirements');
const reqs = [
  ['1. Evidence Ownership', 'The agreement must state that all evidence bundles, audit records, and findings reports produced during the pilot belong to the client. Lamont Labs retains no access to client data or evidence records after the engagement.'],
  ['2. Scope Boundary and Change Request Process', 'The agreement must define exactly what is in scope, what is out of scope, and how change requests are handled and priced. Verbal scope expansions are not acceptable.'],
  ['3. Liability Boundary', 'The agreement must define what Lamont Labs is and is not liable for. CerbaSeal is a governance layer — it is not liable for decisions made upstream or downstream of the enforcement gate.'],
  ['4. Support Period and Scope', 'The agreement must define the pilot duration, the support window, what P1–P4 response times cover, and what happens at pilot end.'],
  ['5. Governing Law and Jurisdiction', 'Must be agreed before signing. Jesse needs to know and state his position on this before the call ends.'],
];
reqs.forEach(([title, desc]) => {
  h3(title, C.navy);
  body(desc);
});

qBlock('RISKS / CAVEATS',
  '• Do not agree to open-ended support terms. The pilot has a defined end date.\n' +
  '• Do not accept undefined scope. The first thing an unhappy client does is claim something was implied.\n' +
  '• Do not agree to terms that make Lamont Labs\' compensation dependent on events outside Jesse\'s control.\n' +
  '• Know the single thing that would make Jesse walk away. Have that answer ready before the call.', C.amber);

qBlock('SUPPORTING EVIDENCE FROM REPO',
  'All five prerequisites: docs/pilot/pilot-readiness-brief.md, "Agreement Prerequisites." ' +
  'Scope boundaries: same file, "Pilot Scope Boundaries." ' +
  'Support period: docs/pilot-operations-model.md.', C.muted);

qBlock('QUESTION BACK TO HER',
  '"Can you share what a draft working agreement typically looks like from your side — or is this a case where both parties draft terms together from scratch?"', C.teal);

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION A — FOLLOW-UPS
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
appendixBanner('A', 'Questions Olivia Might Ask As Follow-Ups', C.blue);
body('Every difficult follow-up question that could realistically appear, based on documented repository gaps and the agenda.', C.muted);
doc.moveDown(0.3);

h2('Technical Follow-Ups', C.navy);
const techFU = [
  ['"Can you show CerbaSeal running on infrastructure we control — not Replit?"', 'First non-Replit deployment has not happened. Mode C pilot would be the first. Answer that clearly.'],
  ['"What happens to the audit log if the server restarts?"', 'It is lost. In-memory. Persistent storage is the top pre-pilot build item. Name it before she finds it.'],
  ['"Who else has reviewed your security?"', 'No third-party review. All review is internal. The security brief documents every known limitation honestly.'],
  ['"Does CerbaSeal evaluate the content of the policy document it references?"', 'No. It checks the reference exists. Content interpretation is upstream. Documented in source.'],
  ['"Can the audit chain be fabricated?"', 'SHA-256 hash-linked — proves consistency, not origin. HMAC signing is a documented future requirement.'],
  ['"What is your GDPR analysis?"', 'Not completed. Architecture keeps data in the deployment boundary. Legal review required before real data.'],
  ['"How does CerbaSeal handle a request type it doesn\'t recognise?"', 'Fail-closed REJECT with a documented reason code. No silent failures.'],
  ['"What does a failed pilot look like?"', 'Findings report, all artifacts returned to client, fee terms defined in the agreement upfront.'],
  ['"Can you integrate with our existing audit infrastructure?"', 'Not out of the box. Integration layer is pilot-scoped work defined at kickoff.'],
  ['"How does this scale to multiple clients or workflows?"', 'Not implemented. First pilot is one client, one workflow. Expansion is next-phase.'],
];
techFU.forEach(([q, a]) => {
  safe(55);
  doc.moveDown(0.2);
  doc.fontSize(9).fillColor(C.navy).font('Helvetica-Bold').text(q, M, doc.y, { width: TW });
  doc.fontSize(8.5).fillColor(C.muted).font('Helvetica').text('→  ' + a, M + 8, doc.y + 12, { width: TW - 8 });
  doc.y += 26;
});

h2('Commercial & Strategic Follow-Ups', C.navy);
const commFU = [
  ['"What is your day rate?"', 'Jesse answers. Know the number before the call.'],
  ['"Have you worked with advisory partners before?"', 'Honest answer. Do not overclaim prior arrangements.'],
  ['"Can we acquire CerbaSeal or take an exclusive license after 12 months?"', 'This is a material question. Do not answer without legal review. "That is a separate conversation."'],
  ['"Would you consider a success fee structure?"', 'Understand the deal economics first. Do not agree live.'],
  ['"Who else are you talking to right now?"', 'Jesse answers. Know your position on active investor conversations.'],
  ['"What is your long-term plan — venture-backed or consulting-driven?"', 'Jesse answers. Have a clear position.'],
  ['"What happens to our arrangement if you raise a round and bring in a board?"', 'Material question. "That would need to be addressed in the working agreement."'],
];
commFU.forEach(([q, a]) => {
  safe(55);
  doc.moveDown(0.2);
  doc.fontSize(9).fillColor(C.navy).font('Helvetica-Bold').text(q, M, doc.y, { width: TW });
  doc.fontSize(8.5).fillColor(C.muted).font('Helvetica').text('→  ' + a, M + 8, doc.y + 12, { width: TW - 8 });
  doc.y += 26;
});

h2('Regulatory Follow-Ups', C.navy);
const regFU = [
  ['"Have you had conversations with EU regulators about the AI Act?"', 'No. CerbaSeal is designed to support audit requirements. No regulatory conversations have occurred.'],
  ['"How does this map to DORA requirements for financial services?"', 'Not mapped. This would be part of the regulatory framing the advisory partner handles. Not Jesse\'s scope.'],
  ['"What is your position on evidence admissibility in a French court?"', 'No legal opinion on this. Hash-chained evidence is consistent. Admissibility is a legal question requiring review.'],
  ['"If a client\'s auditor wants to review the source code, what is the process?"', 'Defined in the working agreement. The LICENSE governs access. Jesse must approve any source code review.'],
];
regFU.forEach(([q, a]) => {
  safe(55);
  doc.moveDown(0.2);
  doc.fontSize(9).fillColor(C.navy).font('Helvetica-Bold').text(q, M, doc.y, { width: TW });
  doc.fontSize(8.5).fillColor(C.muted).font('Helvetica').text('→  ' + a, M + 8, doc.y + 12, { width: TW - 8 });
  doc.y += 26;
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION B — QUESTIONS JESSE SHOULD ASK
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
appendixBanner('B', 'Questions Jesse Should Ask', C.teal);
body('The strongest questions Jesse can ask. Each one reveals information Jesse needs before agreeing to anything.', C.muted);
doc.moveDown(0.3);

const jesseQ = [
  ['"Who is the specific client you have in mind for the first pilot — and can you describe their AI governance challenge?"',
   'Forces specificity. Reveals whether there is a real client or a hypothetical one. Do not commit to a partnership based on a hypothetical client.'],
  ['"What is the advisory partner\'s standard fee structure, and what percentage does the technical partner typically receive?"',
   'Must understand the deal economics before agreeing to exclusivity or any commercial term.'],
  ['"What does Tina Simpson\'s review process look like — what does she need to see and when?"',
   'Understand the legal gating process and the timeline before committing to a start date.'],
  ['"Has Line Axia run a technology pilot with an early-stage founder before — and what made it work or not work?"',
   'Due diligence on the partner, not just the deal. This protects Jesse from a mismatched operating model.'],
  ['"If the pilot is successful, what does a production engagement look like — another fixed scope, or an ongoing relationship?"',
   'Understand the revenue potential before committing 12 months of exclusivity.'],
  ['"What does \'managing the client relationship\' mean in practice — does Line Axia make commitments on CerbaSeal\'s behalf, or does every technical commitment come through me?"',
   'Critical scope question. Must be answered before any agreement.'],
  ['"If I build a feature during the exclusivity period that was not in the original pilot scope — who owns the roadmap decision?"',
   'Protects product autonomy. Jesse cannot let exclusivity become product control.'],
  ['"What is the minimum commercial activity that would keep the exclusivity arrangement active?"',
   'A 12-month exclusivity with no minimum commitment is a one-sided arrangement.'],
  ['"What governing law are you proposing for the working agreement?"',
   'Do not leave this ambiguous. It will be a sticking point with Tina Simpson.'],
  ['"Is there a cap on my liability exposure in the arrangement you are proposing?"',
   'Solo-founder liability exposure in an enterprise engagement can be existential. Must be defined.'],
];

jesseQ.forEach(([q, why], i) => {
  safe(75);
  doc.moveDown(0.25);
  const y = doc.y;
  doc.rect(M, y, 3, 40).fill(C.teal);
  doc.fontSize(9).fillColor(C.navy).font('Helvetica-Bold').text(`${i + 1}.  ${q}`, M + 10, y, { width: TW - 10 });
  doc.fontSize(8.5).fillColor(C.muted).font('Helvetica').text(why, M + 10, doc.y + 2, { width: TW - 10 });
  doc.y += 14;
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION C — RED FLAGS
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
appendixBanner('C', 'Red Flags — Answers Jesse Should Not Give', C.red);
body('Do not say these things. Each one is either false, overclaims, or surrenders negotiating position.', C.muted);
doc.moveDown(0.3);

const redFlags = [
  '"VeraSeal is our…" — and then improvising a definition.',
  '"We\'ve tested EU deployment" or "we\'ve deployed in EU environments."',
  '"The audit log is fully persistent and durable."',
  '"A third party has reviewed our security."',
  '"We\'re very close to production-ready."',
  'Agreeing to any exclusivity terms on this call without written terms.',
  'Giving a pricing number before understanding Line Axia\'s fee structure.',
  '"I can build anything you need during the pilot."',
  '"The evidence chain is cryptographically signed." (It is hash-linked. Different thing.)',
  '"We have other clients interested." (Do not manufacture competitive pressure.)',
  '"Governing law doesn\'t matter to me." or dismissing the jurisdiction question.',
  '"The advisory partner can make technical commitments on my behalf."',
  '"CerbaSeal is GDPR compliant" or "AI Act compliant."',
  'Agreeing to open-ended support with no defined end date.',
];

redFlags.forEach((flag, i) => {
  safe(35);
  const y = doc.y;
  doc.rect(M, y, TW, 22).fill(i % 2 === 0 ? C.bgRed : '#fef2f2');
  doc.rect(M, y, 3, 22).fill(C.red);
  doc.fontSize(8.5).fillColor(C.red).font('Helvetica-Bold').text('✕', M + 8, y + 6, { width: 12 });
  doc.fontSize(9).fillColor(C.navy).font('Helvetica').text(flag, M + 22, y + 6, { width: TW - 28 });
  doc.y = y + 26;
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION D — ONE SENTENCE VERSION
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
appendixBanner('D', 'One Sentence Version', C.blue);
body('Use these if you are nervous, interrupted, or need to reset quickly. One sentence per question.', C.muted);
doc.moveDown(0.4);

const oneLiners = [
  ['Q1 — Deployment Readiness',    '"The enforcement core is built and tested — 372 tests, 15 audit checks — and the remaining gap before a pilot is persistent audit storage, which is a bounded build item, not a redesign."'],
  ['Q2 — EU Deployment',           '"The architecture has no external calls and no geographic restrictions, so EU deployment is technically clear; what has not happened yet is the first actual deployment outside the demo environment."'],
  ['Q3 — Operational Role',        '"Week one is my most intensive week; after that it\'s a 30-minute weekly call and email support, with defined response times and a system built to explain itself without me."'],
  ['Q4 — Capacity',                '"I have the capacity for this pilot — 10 to 15 hours in week one, 3 to 5 hours per week ongoing — and there are no competing deployments."'],
  ['Q5 — Dependencies',            '"The CerbaSeal enforcement library has zero runtime dependencies — nothing ships with it — and all licenses in the demo environment are MIT with no copyleft anywhere."'],
  ['Q6 — Compensation',            '"I prefer a fixed fee for a bounded pilot because it matches the scope and creates clean incentives for both sides."'],
  ['Q7 — Division of Responsibility', '"That division is workable as long as \'technical implementation\' is precisely scoped and Line Axia cannot make technical commitments on CerbaSeal\'s behalf."'],
  ['Q8 — IP',                      '"Lamont Labs owns all of it — proprietary license in the repository, no third-party IP in the enforcement library, and client evidence artifacts go to the client."'],
  ['Q9 — Exclusivity',             '"Exclusivity is worth discussing, but I need the specific terms defined — what activates it, what keeps it active, and what the right of first refusal covers — before I can agree to anything."'],
  ['Q10 — Working Agreement',      '"The five things I need are: evidence ownership clarity, a defined scope boundary with a change request process, a clear liability limit, a defined support period, and governing law agreed in writing."'],
];

oneLiners.forEach(([label, sentence]) => {
  safe(50);
  const y = doc.y;
  doc.rect(M, y, TW, 36).fill(C.bgCool);
  doc.rect(M, y, 3, 36).fill(C.blue);
  doc.fontSize(7.5).fillColor(C.blue).font('Helvetica-Bold').text(label, M + 10, y + 6, { width: TW - 14 });
  doc.fontSize(9).fillColor(C.navy).font('Helvetica').text(sentence, M + 10, y + 18, { width: TW - 16, lineGap: 2 });
  doc.y = y + 42;
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION E — RISK ASSESSMENT
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
appendixBanner('E', 'Call Risk Assessment', C.amber);
body('Each question scored by risk level with the reason. Preparation eliminates most of the risk on Low and Medium questions.', C.muted);
doc.moveDown(0.3);

const risks = [
  { q: 'Q1 — Deployment Readiness & VeraSeal', level: 'MEDIUM', color: C.amber,
    why: 'The enforcement core is real and the answer is strong. The risk is the VeraSeal correction — if Jesse fumbles it or improvises a definition, credibility drops immediately. The persistent storage gap is also a real limitation a technical CTO will probe. Both are manageable with honest, prepared answers.' },
  { q: 'Q2 — EU / Client-Controlled Deployment', level: 'MEDIUM', color: C.amber,
    why: 'The architecture answer is clean. The risk is overclaiming — saying "it can do EU" without being precise that no EU deployment has been executed. If Olivia asks for a deployment timeline, have a specific estimate ready: 1–3 days once the environment is provisioned.' },
  { q: 'Q3 — Operational Role & Support Model', level: 'LOW', color: C.green,
    why: 'This is the best-documented section of the repository. The pilot operations model has specific response times, a weekly rhythm, a defined scope boundary, and an independence model. Jesse is reading from documentation. Very low risk of being caught out.' },
  { q: 'Q4 — Realistic Capacity', level: 'LOW-MEDIUM', color: C.amber,
    why: 'The answer is simple. The risk is the solo-founder question — what happens if Jesse is unavailable. The 48-hour self-service model is documented. Beyond that is an honest gap. Name it before she finds it.' },
  { q: 'Q5 — Dependencies & Supply Chain', level: 'LOW', color: C.green,
    why: 'The corrected answer — zero runtime deps in CerbaSeal-Core — is stronger than most enterprise software can claim. All licenses MIT. No GPL. Very low risk.' },
  { q: 'Q6 — Compensation Model', level: 'HIGH', color: C.red,
    why: 'No repository evidence. Jesse is negotiating commercial terms live, potentially without knowing the deal economics. Risk of anchoring too low or too high. Do not give a number before understanding Line Axia\'s fee structure.' },
  { q: 'Q7 — Division of Responsibility', level: 'MEDIUM-HIGH', color: C.red,
    why: '"Technical implementation" is deliberately vague. If Jesse agrees without defining scope, he may find himself obligated to build things outside CerbaSeal\'s current capability. Push for specificity before agreeing.' },
  { q: 'Q8 — IP Ownership', level: 'LOW', color: C.green,
    why: 'LICENSE file is clear. IP position is clean. No third-party IP, no copyleft, original work. Main risk: questions about patent status or sublicensing rights. Know the answers to those two before the call.' },
  { q: 'Q9 — Exclusivity Terms', level: 'HIGH', color: C.red,
    why: 'Most commercially consequential question on the agenda. Exclusivity without defined terms, minimum activity, or compensation limits Jesse\'s EU market for 12 months. Do not agree to anything on the call. Every term must be in writing.' },
  { q: 'Q10 — Working Agreement Requirements', level: 'MEDIUM', color: C.amber,
    why: 'Opportunity if Jesse is prepared — it shows he has thought through his requirements. Risk if Jesse appears to be figuring out his needs for the first time. All five documented prerequisites are in the repository. Name them without hesitation.' },
];

risks.forEach(r => {
  safe(90);
  doc.moveDown(0.2);
  const y = doc.y;
  const bH = Math.max(68, Math.ceil(r.why.length / 90) * 13 + 28);
  doc.rect(M, y, TW, bH).fill(C.bgCool);
  doc.rect(M, y, 3, bH).fill(r.color);
  doc.fontSize(9).fillColor(C.navy).font('Helvetica-Bold').text(r.q, M + 10, y + 8, { width: TW - 130 });
  const rBg = r.color === C.green ? C.bgGreen : r.color === C.red ? C.bgRed : C.bgAmber;
  doc.rect(M + TW - 108, y + 6, 100, 16).fill(rBg);
  doc.fontSize(8).fillColor(r.color).font('Helvetica-Bold').text(r.level, M + TW - 104, y + 10, { width: 96, align: 'center' });
  doc.fontSize(8.5).fillColor(C.body).font('Helvetica').text(r.why, M + 10, y + 26, { width: TW - 18, lineGap: 2.5 });
  doc.y = y + bH + 8;
});

// ── FOOTERS ───────────────────────────────────────────────────────────────────
const total = doc.bufferedPageRange().count;
for (let i = 0; i < total; i++) {
  doc.switchToPage(i);
  if (i === 0) continue;
  doc.rect(0, PH - 18, PW, 18).fill(C.bgCool);
  doc.rect(0, PH - 18, PW, 0.5).fill(C.rule);
  doc.fontSize(7).fillColor(C.muted).font('Helvetica')
     .text(
       `CerbaSeal-Core v0.1.0  ·  Lamont Labs  ·  Technical Q&A Call Brief — Line Axia  ·  2026-06-03  ·  CONFIDENTIAL  ·  Page ${i + 1} of ${total}`,
       M, PH - 10, { width: TW, align: 'center' }
     );
}

doc.end();
doc.on('end', () => console.log('Written:', OUT));
