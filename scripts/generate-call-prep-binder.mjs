import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const outputPath = path.join(process.cwd(), 'docs/reports/CTO_CALL_PREP_BINDER_LINE_AXIA.pdf');
const doc = new PDFDocument({ margin: 55, size: 'LETTER', bufferPages: true });
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const NAVY   = '#1a1a2e';
const BLUE   = '#2563eb';
const GREEN  = '#16a34a';
const RED    = '#b91c1c';
const AMBER  = '#d97706';
const MUTED  = '#555555';
const LIGHT  = '#888888';
const BG     = '#f8fafc';
const W      = doc.page.width - 110; // usable width

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const newPage = () => { doc.addPage(); topBar(); };
const topBar  = () => { doc.rect(0, 0, doc.page.width, 7).fill(BLUE); doc.moveDown(0.35); };

function sectionBanner(label, color = BLUE) {
  doc.moveDown(0.6);
  doc.rect(55, doc.y, W, 22).fill(color);
  const y = doc.y - 22;
  doc.fontSize(11).fillColor('white').font('Helvetica-Bold')
     .text(label.toUpperCase(), 62, y + 6, { width: W - 10 });
  doc.moveDown(0.5);
}

function h2(text, color = NAVY) {
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor(color).font('Helvetica-Bold').text(text, { width: W });
  doc.moveDown(0.2);
}

function h3(text, color = BLUE) {
  doc.moveDown(0.4);
  doc.fontSize(9.5).fillColor(color).font('Helvetica-Bold').text(text, { width: W });
  doc.moveDown(0.15);
}

function body(text, color = '#222222', bold = false) {
  doc.fontSize(9).fillColor(color).font(bold ? 'Helvetica-Bold' : 'Helvetica')
     .text(text, { width: W, lineGap: 2 });
  doc.moveDown(0.2);
}

function bullets(items, color = '#222222') {
  items.forEach(item => {
    doc.fontSize(9).fillColor(color).font('Helvetica')
       .text('•  ' + item, { width: W - 12, indent: 12, lineGap: 2 });
  });
  doc.moveDown(0.2);
}

function rule(color = '#e2e8f0') {
  doc.moveDown(0.3);
  doc.rect(55, doc.y, W, 1).fill(color);
  doc.moveDown(0.4);
}

function label(k, v, kColor = BLUE, vColor = '#222222') {
  doc.fontSize(9).fillColor(kColor).font('Helvetica-Bold')
     .text(k + '  ', { continued: true });
  doc.fillColor(vColor).font('Helvetica').text(v, { width: W });
  doc.moveDown(0.15);
}

function callout(title, text, bgColor = '#eff6ff', borderColor = BLUE) {
  const startY = doc.y;
  const lineCount = Math.ceil(text.length / 90) + 1;
  const boxH = Math.max(40, lineCount * 14 + 16);
  doc.rect(55, startY, W, boxH).fillAndStroke(bgColor, borderColor);
  doc.rect(55, startY, 4, boxH).fill(borderColor);
  doc.fontSize(8.5).fillColor(borderColor).font('Helvetica-Bold')
     .text(title, 65, startY + 7, { width: W - 16 });
  doc.fontSize(9).fillColor(NAVY).font('Helvetica')
     .text(text, 65, startY + 20, { width: W - 16, lineGap: 2 });
  doc.y = startY + boxH + 8;
}

function warningBox(title, text) {
  callout(title, text, '#fff7ed', AMBER);
}

function dangerBox(title, text) {
  callout(title, text, '#fef2f2', RED);
}

function goodBox(title, text) {
  callout(title, text, '#f0fdf4', GREEN);
}

function qaBlock(q, why, answer, avoid, followups) {
  if (doc.y > doc.page.height - 180) newPage();
  doc.moveDown(0.3);
  doc.rect(55, doc.y, W, 1).fill('#cbd5e1');
  doc.moveDown(0.3);
  h3('Q: ' + q, NAVY);
  if (why) { body('WHY SHE ASKS: ' + why, MUTED); }
  body('YOUR ANSWER: ' + answer, '#222222', true);
  if (avoid) { body('AVOID SAYING: ' + avoid, RED); }
  if (followups && followups.length) {
    body('If she follows up:', MUTED);
    bullets(followups, MUTED);
  }
  doc.moveDown(0.3);
}

function pageCheck(minSpace = 120) {
  if (doc.y > doc.page.height - minSpace) newPage();
}

// ═══════════════════════════════════════════════════════════════════════════════
// COVER
// ═══════════════════════════════════════════════════════════════════════════════
topBar();
doc.moveDown(1.8);
doc.rect(55, doc.y, W, 3).fill(BLUE); doc.moveDown(0.5);
doc.fontSize(26).fillColor(NAVY).font('Helvetica-Bold')
   .text('CTO Call Preparation Binder', { align: 'center' });
doc.fontSize(14).fillColor(BLUE).font('Helvetica-Bold')
   .text('Line Axia — Olivia Aréchiga', { align: 'center' });
doc.moveDown(0.4);
doc.rect(55, doc.y, W, 3).fill(BLUE); doc.moveDown(1.2);
doc.fontSize(10).fillColor(MUTED).font('Helvetica')
   .text('Prepared for: Jesse Lamont, Founder, Lamont Labs', { align: 'center' });
doc.text('Repository: CerbaSeal-Core v0.1.0  |  Date: 2026-06-02', { align: 'center' });
doc.moveDown(1.6);

doc.rect(55, doc.y, W, 105).fillAndStroke('#eff6ff', BLUE);
doc.rect(55, doc.y, 5, 105).fill(BLUE);
doc.fontSize(10).fillColor(NAVY).font('Helvetica-Bold')
   .text('How To Use This Binder', 68, doc.y - 100, { width: W - 20 });
doc.fontSize(9).fillColor('#222222').font('Helvetica')
   .text(
     'This binder prepares you for every question Olivia is likely to ask.\n\n' +
     'For each question: (1) What the technical reality is. (2) What it means in plain English. ' +
     '(3) What to say on the call. (4) What follow-ups she may ask. (5) What risks to be honest about.\n\n' +
     'Everything in here is sourced from the repository. No speculation. No marketing language. ' +
     'If it is not in the code, docs, or test output, it is not in this document.',
     68, doc.y - 82, { width: W - 20, lineGap: 3 }
   );
doc.y += 18;
doc.moveDown(1.2);

doc.fontSize(9).fillColor(MUTED).font('Helvetica-Bold').text('CONTENTS', { width: W });
doc.moveDown(0.3);
[
  ['Section 1', 'Where is CerbaSeal right now? (The VeraSeal question)'],
  ['Section 2', 'Can this be deployed in a client-controlled or EU environment?'],
  ['Section 3', 'What does your operational role look like during a pilot?'],
  ['Section 4', 'What is your realistic capacity for a pilot engagement?'],
  ['Section 5', 'Open-source components and third-party dependencies'],
  ['Section 6', '25 most likely follow-up questions — with answers'],
  ['Section 7', 'Founder Cheat Sheet — one page, plain English'],
].forEach(([s, t]) => {
  doc.fontSize(9).fillColor(BLUE).font('Helvetica-Bold')
     .text(s + '  ', { continued: true });
  doc.fillColor(NAVY).font('Helvetica').text('— ' + t);
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — WHERE IS CERBASEAL RIGHT NOW
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
sectionBanner('Section 1 — Where Is CerbaSeal Right Now?');
doc.fontSize(10).fillColor(NAVY).font('Helvetica-Bold')
   .text('Olivia\'s Question: "Where is CerbaSeal relative to external deployment, specifically VeraSeal as the first component? What does pilot-ready mean and what is the gap?"');
doc.moveDown(0.5);

h2('CRITICAL: What Is VeraSeal?');
dangerBox('VeraSeal Does Not Exist In The Repository',
  '"VeraSeal" does not appear anywhere in this repository — not in any file name, source code, ' +
  'test, documentation, or comment. There is no component, module, or system called VeraSeal. ' +
  'If Olivia asks about VeraSeal on the call, she has gotten the name from somewhere else. ' +
  'Correct it immediately and move on. Do not improvise a definition.');
doc.moveDown(0.3);
body('The enforcement core is called CerbaSeal — specifically a module called ExecutionGateService inside the src/services/execution/ folder. That is the only enforcement system in this repository.');

rule();
h2('What Is CerbaSeal? (Plain English)');
body('CerbaSeal is a gatekeeper. When an AI-assisted system wants to take an action — send a payment, approve a transaction, execute a process — CerbaSeal sits in between and answers one question: "Should this be allowed to happen right now?" It looks at who is asking, whether the right approvals are in place, and whether the request meets a set of rules. Then it issues a verdict: ALLOW (go ahead), HOLD (wait for approval), or REJECT (blocked).');
body('Every verdict is logged with evidence — a record of what was checked, what the outcome was, and why. That record cannot be altered after the fact.');

rule();
h2('What Is Currently Built and Working');
h3('The Enforcement Core — IMPLEMENTED');
bullets([
  '12 rules (called invariants) that every request must pass before ALLOW is issued',
  'Three possible outcomes: ALLOW, HOLD, or REJECT — nothing else',
  'Fail-closed behavior: if anything unexpected happens, the system blocks, not permits',
  'AI cannot authorize its own requests — this is a hard rule, not a setting',
  'Evidence bundle created for every decision — a verifiable record of what happened and why',
  'Hash-linked audit trail — each entry is mathematically connected to the one before it, so deletions are detectable',
  'Replay verification — any decision can be re-examined and confirmed as consistent',
  'Diagnostic reports — when something is blocked, the system explains exactly which rule was triggered and why',
]);
h3('The Test Suite — IMPLEMENTED');
bullets([
  '372 tests passing, 0 failing, across 15 test files',
  '66 adversarial tests specifically designed to try to break or bypass the enforcement',
  '27 misuse scenario tests based on real-world AI governance failure patterns',
  '25 contextual boundary tests probing edge cases',
  '15/15 audit checks passing (an independent automated verification of the whole system)',
]);
h3('The Review Portal — IMPLEMENTED');
bullets([
  'Live browser portal at cerbaseal.replit.app — technical reviewers can see the system running',
  '4 portal pages: review, pilot readiness, security controls, deployment posture',
  'All portal claims are tested — if a claim disappears from a page, a test fails',
]);

rule();
h2('What Is Demo-Only (Not Client-Ready)');
warningBox('Demo Infrastructure',
  'The live site at cerbaseal.replit.app runs on Replit\'s servers. This is appropriate for ' +
  'Olivia to look at and test. It is not appropriate for real client data or production decisions. ' +
  'It is a demonstration, not a deployment.');

rule();
h2('What Is NOT Implemented');
bullets([
  'Persistent storage — the audit log exists only in memory and is lost when the server restarts',
  'Cryptographic signing — the evidence chain is mathematically consistent but not key-signed or legally attested',
  'EU deployment — no deployment outside Replit has ever been executed',
  'Client-specific workflow — no client\'s actual workflow has been configured yet',
  'Third-party security review — all security review to date has been internal',
  'Production hardening — no container, no deployment runbook, no infrastructure configuration',
  'Signed commercial agreement with any client — none exists',
], RED);

rule();
h2('What Did VeraSeal / Cerba / Other Lamont Labs Systems Contribute?');
dangerBox('No Evidence of These Systems',
  '"VeraSeal" does not appear anywhere in this repository. "Cerba" as a standalone system ' +
  'does not appear. There are no references to other Lamont Labs products contributing to ' +
  'this codebase. If asked, the honest answer is: "Everything in this repository is CerbaSeal, ' +
  'built from scratch. I don\'t have a separate component called VeraSeal." Do not improvise.');

rule();
h2('What "Pilot-Ready" Actually Means');
goodBox('The Correct Definition',
  'Pilot-ready means: one client, one workflow, one controlled environment, no production decisions. ' +
  'It does NOT mean production-ready. It means the enforcement core is solid enough to evaluate ' +
  'in a controlled setting with defined success criteria and a signed agreement in place first.');

h3('What needs to exist before a pilot begins');
bullets([
  'Signed working agreement covering scope, evidence ownership, liability, and support terms',
  'Persistent storage solution (audit log must survive server restart)',
  'Client deployment environment identified and reviewed',
  'One specific client workflow defined and agreed',
  'Data processing agreement if EU client data is involved',
  'Success criteria agreed in writing — what does "governance working" look like?',
]);

rule();
callout('WHAT TO SAY ON THE CALL (Section 1)',
  '"CerbaSeal is the enforcement core — there isn\'t a separate component called VeraSeal in this build. ' +
  'What I have today is a working governance engine: 372 tests, 15 independent audit checks, 12 hard rules ' +
  'that every request must pass. The demo you can see running right now is not connected to any client data — ' +
  'it\'s a demonstration. Pilot-ready to me means one workflow, one client, controlled environment, no ' +
  'production decisions, and a signed agreement before we touch anything real. The main thing I need to build ' +
  'before a pilot is persistent audit storage — so the evidence log survives a server restart. That\'s a ' +
  'bounded piece of work, not a fundamental gap."', '#eff6ff', BLUE);

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — EU / CLIENT-CONTROLLED DEPLOYMENT
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
sectionBanner('Section 2 — EU / Client-Controlled Deployment');
doc.fontSize(10).fillColor(NAVY).font('Helvetica-Bold')
   .text('Olivia\'s Question: "Can CerbaSeal be deployed in a client-controlled or EU-hosted environment?"');
doc.moveDown(0.5);

h2('The Short Technical Answer');
goodBox('Architecture Supports It',
  'CerbaSeal makes no network calls, has no cloud dependencies, and has no external services of any kind. ' +
  'It runs as a Node.js package. If you can run Node.js in your infrastructure, you can run CerbaSeal. ' +
  'EU hosting is architecturally straightforward. The caveat is that it has never been done yet.');

h2('What Has Been Proven');
bullets([
  'No outbound network calls in any enforcement code path — confirmed by source code review',
  'No external API dependencies — confirmed by full dependency audit (1 runtime dep: tsx, MIT licensed)',
  'No cloud SDK, no authentication provider, no database driver',
  'Four deployment modes documented: embedded library, internal service, sidecar, air-gapped',
  'Mode C (client-controlled EU environment) is the documented preferred approach for EU pilots',
  'Package is deployable wherever Node.js runs — no geographic restriction in the code',
], GREEN);

h2('What Has NOT Been Proven');
bullets([
  'No EU deployment has ever been executed — this would be the first',
  'No Dockerfile or container configuration exists',
  'No deployment runbook or step-by-step guide exists',
  'No infrastructure-as-code (Terraform, Ansible, etc.) exists',
  'No DPA (Data Processing Agreement) template exists',
  'No GDPR analysis has been completed',
  'No legal review of EU jurisdiction requirements has been done',
], RED);

rule();
h2('The Four Deployment Options (Plain English)');
[
  ['Option 1 — Embedded', 'CerbaSeal runs inside the client\'s own system, at the point where decisions are made. Lowest overhead. Requires the client to have a Node.js application.'],
  ['Option 2 — Internal Service', 'CerbaSeal runs as a separate internal service that other systems call. Clean separation. Requires the client to run it on their internal network.'],
  ['Option 3 — Sidecar', 'CerbaSeal runs alongside the client\'s existing system, intercepting decisions before they execute. Good for regulated systems that need a clear audit boundary.'],
  ['Option 4 — Air-Gapped', 'CerbaSeal runs completely offline, with no network connection at all. Maximum isolation. Good for highly regulated environments. Manual process.'],
].forEach(([title, desc]) => {
  h3(title);
  body(desc);
});

rule();
h2('Data Residency — What This Means For Line Axia');
body('Data residency means: where does your data live, and does it ever leave that location? For an EU-based firm with EU clients, data residency is a legal requirement, not a preference.');
body('CerbaSeal\'s answer: if you deploy it in your EU infrastructure, your data never leaves. CerbaSeal does not call home. It does not send telemetry. It does not require a connection to anything outside the environment you put it in. The data stays where you put the system.');
warningBox('What Must Still Be Done Before EU Pilot',
  'Even though the architecture supports EU hosting, three things must happen before any real data touches it: ' +
  '(1) A Data Processing Agreement must be signed. (2) The specific EU hosting environment must be reviewed. ' +
  '(3) A legal review of EU evidence retention requirements must be completed. None of these have been done yet. ' +
  'This is an honest gap, not a showstopper.');

rule();
h2('EU AI Act Relevance');
body('The EU AI Act requires audit trails for high-risk AI systems. CerbaSeal produces an audit trail for every decision. However: the current audit trail is hash-linked for consistency, not cryptographically signed for legal attestation. For EU AI Act compliance, the evidence chain would need HMAC signing or an external attestation service. This is a documented future requirement, not a current implementation.');

rule();
callout('WHAT TO SAY ON THE CALL (Section 2)',
  '"Yes, the architecture supports EU deployment — there are no external calls, no cloud dependencies, ' +
  'nothing that sends data outside the environment you deploy it in. The preferred pilot approach is ' +
  'Mode C: you control the hosting environment and the data never leaves it. ' +
  'What I want to be honest about: I have not actually deployed CerbaSeal outside Replit yet. ' +
  'The path exists and the architecture is ready for it, but the first EU deployment would be the first ' +
  'deployment anywhere. We would need a DPA in place before touching real data, and I would want the ' +
  'deployment environment reviewed before we go live. Those are prerequisites, not obstacles."', '#eff6ff', BLUE);

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — OPERATIONAL ROLE
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
sectionBanner('Section 3 — Your Operational Role During A Pilot');
doc.fontSize(10).fillColor(NAVY).font('Helvetica-Bold')
   .text('Olivia\'s Question: "What would your operational role look like during a pilot?"');
doc.moveDown(0.5);

h2('Week 1 — Scoping (Highest Intensity)');
body('Week 1 is the busiest week. This is where the actual work of setting up the pilot gets done.');
bullets([
  'Kickoff call (60 minutes): identify the workflow to govern, define success criteria, agree the authority model',
  'Deploy CerbaSeal in the agreed pilot environment',
  'Run baseline tests: confirm REJECT, HOLD, and ALLOW all work as expected in the client\'s context',
  'Produce a signed pilot scope document — the contract for what is and isn\'t covered',
  'Produce a workflow map, an authority matrix, and a set of baseline test scenarios',
  'Agree the success metrics in writing — what does "governance working" look like for this workflow?',
]);

h2('Ongoing — Weekly Rhythm');
bullets([
  'One 30-minute review call per week — agenda: open issues, resolved issues, enforcement metrics',
  'Email support for questions during the week',
  'Tracked issue queue — every issue gets an ID, a severity, a status, and resolution notes',
  'Status update published weekly: what was open, what was resolved, what is deferred',
  'Decision log maintained: whenever a governance interpretation or scope call is made, it is written down',
]);

h2('Issue Response Times (Documented Commitments)');
[
  ['P1 — System Down', 'The pilot environment is not running or the gate is not producing outcomes.', 'Same business day'],
  ['P2 — Major Impact', 'The system is doing something that contradicts the documented rules.', 'Within 24 hours'],
  ['P3 — General Issue', 'Documentation question, configuration question, behavior clarification.', 'Within 3 business days'],
  ['P4 — Enhancement', 'Something new that was not in the original scope.', 'Reviewed at weekly planning'],
].forEach(([pri, def, res]) => {
  h3(pri + ' → ' + res);
  body(def, MUTED);
});

rule();
h2('What Happens If You Are Unavailable (Up To 48 Hours)');
goodBox('What Continues Without You',
  'Demo environment, all documentation, security docs, review portal, proof snapshots, ' +
  'invariant registry — all accessible. The system can be re-audited independently: ' +
  '"pnpm audit:repo" re-runs all 15 checks without the founder. ' +
  '"pnpm verify:proof" verifies the snapshot has not been tampered with. ' +
  'Evidence bundles and diagnostic outputs are all human-readable without you.');
warningBox('What Pauses',
  'New issue investigation requiring code changes, configuration changes to the pilot environment, ' +
  'and scheduled review calls (rescheduled on return). ' +
  'Beyond 48 hours: no contingency is documented. This is an honest gap for a solo-founder engagement.');

rule();
h2('What Is Out Of Scope (Important To State On The Call)');
bullets([
  'Custom feature development outside the pilot scope',
  'Production deployment work (pilot environment only)',
  'Legal or regulatory compliance opinions',
  'Integration engineering into Line Axia\'s internal systems',
  'Data migration, data modeling, or schema design for production',
  'Indefinite open-ended support',
  'Building new workflow classes not defined at kickoff',
], RED);
body('Changes outside scope become a next phase — defined in a separate agreement.');

rule();
h2('What Gets Handed Over At Pilot End');
bullets([
  'Final findings report: what governance outcomes were observed, what issues came up, how they were resolved',
  'Governance assessment: did the workflow get governed as agreed?',
  'Documented gaps: what CerbaSeal does not yet do that production would need',
  'Recommended next steps: specific and bounded — not a sales pitch',
  'All evidence bundles produced during the pilot',
  'Technical summary: architecture decisions, invariants exercised, enforcement metrics',
], GREEN);
body('Everything produced during the pilot is the client\'s. Nothing is withheld.');

rule();
h2('What Eventually Gets Handed Off');
body('CerbaSeal is designed so the pilot participant does not need the founder for every question. The system explains its own decisions — every blocked action comes with a reason code and a diagnostic report. Eventually: evidence review, audit re-runs, routine configuration questions, and day-to-day governance reading can all be done without founder involvement. Founder presence is highest at week one and decreases over time.');

rule();
callout('WHAT TO SAY ON THE CALL (Section 3)',
  '"Week one is my most intensive week — that\'s where we scope the workflow, deploy the system, run the baseline scenarios, and get the agreement signed. After that it\'s a weekly 30-minute call, email support, and a tracked issue queue. I have documented response times: same business day for a system outage, 24 hours for a rule violation, 3 days for general questions. I am a solo founder and I want to be honest about that — I have documented what happens if I\'m unavailable and built the system so you don\'t need me to interpret every outcome. The system explains itself. What I cannot promise is 24/7 on-call support — that would need a bigger structure, and we should define that in the agreement."', '#eff6ff', BLUE);

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — CAPACITY
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
sectionBanner('Section 4 — Your Realistic Capacity');
doc.fontSize(10).fillColor(NAVY).font('Helvetica-Bold')
   .text('Olivia\'s Question: "What is your realistic capacity for a pilot engagement?"');
doc.moveDown(0.5);

warningBox('No Repository Evidence For This Section',
  'The repository does not contain information about Jesse\'s personal schedule, current portfolio, ' +
  'or capacity constraints. Everything in this section is structured guidance for how to answer ' +
  'honestly based on what the repository documents as the pilot support model. Jesse fills in the blanks.');

h2('What The Pilot Actually Requires From You');
h3('Week 1 (Highest Demand)');
bullets([
  'Kickoff call: ~1 hour',
  'Deployment and baseline scenario execution: estimate 4–8 hours depending on client environment complexity',
  'Producing pilot scope document, workflow map, authority matrix, baseline scenarios: 4–6 hours',
  'Total week 1 estimate: 10–15 hours of active founder work',
]);
h3('Ongoing (Weeks 2 onward)');
bullets([
  '30-minute weekly review call',
  'Issue queue management: 1–3 hours/week depending on volume',
  'Email support: varies, but light in a well-scoped pilot',
  'Total ongoing estimate: 3–5 hours/week in a normal week',
]);
h3('Spikes (When Issues Occur)');
bullets([
  'P1 issue (system down): could require a half-day to investigate and resolve',
  'P2 issue (rule violation): could require 2–4 hours of investigation',
  'These are infrequent in a controlled pilot but must be budgeted',
]);

rule();
h2('Realistic Constraints To Name On The Call');
body('The right answer here is honest and direct. The repository documents a solo-founder model explicitly. The question is not whether you have capacity — it is whether you have defined it clearly enough that Olivia can plan around it.');
bullets([
  'You are a solo founder — no second engineer as a backup',
  'The 48-hour self-service model is the documented contingency',
  'Beyond 48 hours unavailability: no formal contingency exists',
  'Active pilot would be the first external client deployment',
  'No managed infrastructure exists — you deploy manually for each client',
]);

rule();
h2('Hardware and Software Needs');
bullets([
  'Node.js runtime (standard — most infrastructure already has this)',
  'tsx 4.21.0 (MIT licensed, installs via npm in seconds)',
  'No cloud accounts, no paid services, no proprietary tooling required',
  'Client provides the hosting environment for Mode C deployments',
  'Founder needs: standard developer laptop, internet connection, email',
]);
goodBox('Supply Chain Simplicity',
  'One runtime dependency (tsx). Five packages total in the deployment. This is genuinely unusual ' +
  'for enterprise governance software and works in your favour when discussing operational complexity.');

rule();
h2('What Support You Would Likely Need');
bullets([
  'Client\'s IT team to provision the deployment environment (Mode C)',
  'Client\'s engineering contact to construct workflow requests in the correct format',
  'Legal review from client side for DPA and working agreement',
  'Potentially: a deployment engineer for the first EU deployment if it\'s complex',
]);

rule();
callout('WHAT TO SAY ON THE CALL (Section 4)',
  '"Week one is my most demanding week — I estimate 10 to 15 hours of active work to scope, deploy, ' +
  'and baseline the pilot. After that I run at 3 to 5 hours a week in a normal week. I don\'t have ' +
  'other active pilot deployments right now. I\'m a solo founder, and I want to be explicit about ' +
  'what that means: I have defined response times, a documented self-service model, and I have built ' +
  'the system to be readable without me. What I cannot offer is 24/7 on-call support — if that is a ' +
  'requirement, it needs to be part of the engagement structure and priced accordingly."', '#eff6ff', BLUE);

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5 — DEPENDENCIES
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
sectionBanner('Section 5 — Open-Source Components & Third-Party Dependencies');
doc.fontSize(10).fillColor(NAVY).font('Helvetica-Bold')
   .text('Olivia\'s Question: "Are there any open-source components or third-party dependencies in the deployment stack we should be aware of?"');
doc.moveDown(0.5);

goodBox('Executive Summary',
  'CerbaSeal has one (1) production runtime dependency: tsx — a TypeScript execution runtime, ' +
  'MIT licensed. All other dependencies exist only at build and test time and are not present ' +
  'in a deployment. No cloud services, no SaaS APIs, no authentication providers, ' +
  'no telemetry, no database drivers. Zero external service calls at runtime.');

h2('Runtime Dependencies (Present In Deployment)');
[
  ['tsx 4.21.0', 'MIT', 'Runs the TypeScript enforcement code. Think of it as the engine that reads and executes the governance rules.', 'Low'],
  ['esbuild 0.27.3', 'MIT', 'Used internally by tsx to transform code. Not called directly by CerbaSeal. Only the version matching your server\'s operating system loads at runtime.', 'Low'],
  ['get-tsconfig 4.13.6', 'MIT', 'Utility used by tsx to find TypeScript configuration. Not visible to CerbaSeal logic.', 'Low'],
  ['resolve-pkg-maps 1.0.0', 'MIT', 'Package path resolution utility used by get-tsconfig.', 'Low'],
].forEach(([pkg, lic, desc, risk]) => {
  h3(pkg + '  (' + lic + ')  —  Risk: ' + risk);
  body(desc, MUTED);
});

h2('Development-Only Dependencies (NOT In Deployment)');
body('These packages are used to build and test CerbaSeal. They are not deployed to clients and a client security team does not need to review them.');
bullets([
  'TypeScript 5.9.3 — the compiler (Apache 2.0)',
  'Vitest 2.1.9 + test stack — the test framework that runs the 372 tests (MIT)',
  'pdfkit 0.18.0 — generates PDF reports like this one (MIT)',
  '@types/node 22.19.17 — TypeScript type definitions for Node.js (MIT)',
]);

rule();
h2('License Summary');
[
  ['MIT', 'Majority of all packages. No restrictions on commercial use, no source disclosure required.', GREEN],
  ['Apache 2.0', 'TypeScript compiler only (dev). No restrictions relevant to this use case.', GREEN],
  ['MPL-2.0', 'lightningcss — dev/build only, not in deployment. Weak file-scoped copyleft, does not affect CerbaSeal source.', AMBER],
  ['GPL / AGPL / LGPL', 'NOT PRESENT anywhere in the dependency tree.', GREEN],
].forEach(([lic, desc, color]) => {
  h3(lic, color);
  body(desc, MUTED);
});
goodBox('Copyleft Determination',
  'The production deployment of CerbaSeal contains ZERO copyleft-licensed software. ' +
  'All runtime licenses are MIT. Nothing requires CerbaSeal source code to be disclosed to clients. ' +
  'GPL is not present anywhere in the tree — runtime or development.');

rule();
h2('External Services Review');
const services = [
  ['Cloud dependencies', 'NONE'],
  ['SaaS dependencies', 'NONE'],
  ['External API calls', 'NONE — confirmed by source code review'],
  ['Database dependencies', 'NONE'],
  ['Telemetry / analytics', 'NONE'],
  ['Authentication providers', 'NONE'],
  ['CDN dependencies', 'NONE'],
  ['Outbound network calls', 'NONE — confirmed by source code review'],
];
services.forEach(([k, v]) => label(k + ':', v, MUTED, v === 'NONE' ? GREEN : RED));

rule();
h2('Supply Chain Questions — Direct Answers');
[
  ['Can CerbaSeal run entirely in a client-controlled environment?',
   'Yes. No component requires a Lamont Labs–operated service to function after installation.'],
  ['Can CerbaSeal run entirely in an EU-hosted environment?',
   'Yes, architecturally. No geographic restrictions in the code. Caveat: not yet executed.'],
  ['Does CerbaSeal require any US-operated services?',
   'No. npm is used at install time and can be replaced with a private registry or offline bundle.'],
  ['Does CerbaSeal require internet after deployment?',
   'No. Once installed, all enforcement runs offline. No connectivity needed.'],
  ['What would a client security review need to approve?',
   'Node.js runtime + tsx + esbuild (platform binary) + get-tsconfig + resolve-pkg-maps + CerbaSeal source. Five packages total.'],
].forEach(([q, a]) => {
  h3(q, NAVY);
  body(a, '#222222');
});

rule();
callout('60-SECOND VERBAL ANSWER FOR OLIVIA (Section 5)',
  '"CerbaSeal has one production dependency — tsx, which is a TypeScript runtime, MIT licensed. That\'s it. ' +
  'No cloud services, no external APIs, no telemetry, nothing that calls outside your environment. ' +
  'Every enforcement decision runs entirely inside the deployment boundary. ' +
  'All runtime licenses are MIT — no GPL, no copyleft, nothing that requires source disclosure. ' +
  'If your security team needed to review the deployment, the list is Node.js — which you probably already have — ' +
  'tsx, esbuild, and two small utilities. Five packages total."', '#eff6ff', BLUE);

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6 — 25 FOLLOW-UP QUESTIONS
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
sectionBanner('Section 6 — 25 Most Likely Follow-Up Questions');
body('Ranked by probability based on repository evidence gaps and what a technically sophisticated CTO would probe.', MUTED);
doc.moveDown(0.3);

const questions = [
  {
    q: '"Can you show me CerbaSeal running on infrastructure we control — not Replit?"',
    why: 'Replit is a developer sandbox, not enterprise infrastructure. Any serious CTO will want to see the system running where it would actually be used.',
    answer: '"Not yet — the first client deployment has not happened. What I can show you is the full system running on Replit right now, and I can walk you through exactly what a Mode C deployment to your environment would look like. The architecture has no barriers to it. The work is in the first execution, not the design."',
    avoid: 'Do not imply you have done this before. You have not.',
    followups: ['"How long would a first deployment take?" — Honest answer: 1–3 days for a controlled pilot environment once we agree on the hosting setup.'],
  },
  {
    q: '"What happens to the evidence log if the server restarts?"',
    why: 'Persistent storage is the single most important technical gap. Any CTO reading the security brief will find it. She will ask.',
    answer: '"Right now, the audit log is in-memory. If the process restarts, the log for that session is gone. This is the highest-priority item on my pre-pilot build list. For a pilot the fix is file-based or database-backed storage — bounded work, not a redesign. This must be in place before any client data touches the system."',
    avoid: 'Do not minimize this. It is a real gap. Naming it clearly builds more trust than hedging.',
    followups: ['"How long to fix it?" — Estimate: 2–5 days to implement file or SQLite-backed persistent audit log. Production-grade storage is a separate scoping discussion.'],
  },
  {
    q: '"Who else has reviewed the security of this system?"',
    why: 'A governance tool for regulated industries must have external validation. She will assume this is table stakes.',
    answer: '"No third-party security review has been completed yet. All security review to date is internal. I have a security brief that documents every known limitation honestly — I\'d rather you read that than have a false comfort level. An external review is on the roadmap and I would want it before any production use."',
    avoid: 'Do not imply any third-party validation has occurred. It has not.',
    followups: ['"Which firm would you use?" — Have a name or type ready: "Likely a boutique security firm specializing in AI governance or financial infrastructure."'],
  },
  {
    q: '"What happens if you\'re unavailable — hit by a bus, so to speak?"',
    why: 'Solo-founder risk is a standard diligence question. She needs to know the engagement can survive your absence.',
    answer: '"I\'ve documented this. Up to 48 hours: the system is self-contained. Your team can re-run all 15 audit checks independently, verify the proof snapshot, read all evidence output, and access all documentation without me. Beyond 48 hours: I don\'t have a backup engineer today. That is an honest gap. If the engagement requires a second resource, that becomes part of the structure we agree."',
    avoid: 'Do not claim you have a backup you don\'t have.',
    followups: [],
  },
  {
    q: '"What version of CerbaSeal would we be freezing for the pilot, and how do updates work?"',
    why: 'Any responsible CTO will want to know they\'re not signing up for a moving target.',
    answer: '"We would freeze a specific version at pilot start — version 0.1.0 today, and any later snapshot we agree. The version freeze policy would be defined in the working agreement. Updates during a pilot require a change log entry and your sign-off. No changes to enforcement behavior happen without notice."',
    avoid: 'Do not imply a formal update/versioning system exists that doesn\'t.',
    followups: ['"Is there a software update policy document?" — Not yet. This would be part of the working agreement.'],
  },
  {
    q: '"Can you show me a GDPR analysis for this system?"',
    why: 'Line Axia is EU-based with EU clients. GDPR is not optional for them.',
    answer: '"I don\'t have a completed GDPR analysis. What I can tell you is the architecture: no data leaves the deployment environment, no external services, no telemetry. Whether the evidence bundles produced during a pilot constitute personal data under GDPR depends on what workflows you run CerbaSeal on. That analysis requires a legal review — and a DPA between us — before we touch real client data."',
    avoid: 'Do not claim GDPR compliance. You have not done the analysis.',
    followups: [],
  },
  {
    q: '"What does \'policy pack reference\' actually mean? Does CerbaSeal evaluate the policy content?"',
    why: 'A technically sophisticated reviewer will look at the invariant model and notice that policyPackRef is required but the content is not evaluated. This looks like a gap.',
    answer: '"CerbaSeal requires a policy pack reference — a pointer to the policy governing the request. It checks that the reference exists. It does not evaluate what\'s inside the policy document. That evaluation is handled upstream by the client\'s system. CerbaSeal enforces the governance layer: is there approval, is the actor authorized, is the action known. Policy content interpretation is explicitly out of scope."',
    avoid: 'Do not imply CerbaSeal reads or interprets policy documents. It does not.',
    followups: [],
  },
  {
    q: '"Do you have cyber liability insurance?"',
    why: 'For an enterprise engagement in a regulated sector, this is standard diligence.',
    answer: 'Jesse answers this directly. If you have it, state the coverage. If you do not have it, be honest: "I don\'t currently have a cyber liability policy. For a production engagement in a regulated sector, that would need to be on the table. It\'s something I would want to address before a signed production agreement."',
    avoid: 'Do not bluff on this. Tina Simpson will verify.',
    followups: [],
  },
  {
    q: '"What does the working agreement look like?"',
    why: 'If this call goes well, the next thing is a term sheet or agreement. She will want to know you\'ve thought about this.',
    answer: '"The prerequisites list is documented: scope, evidence ownership, liability boundary, support terms, DPA if applicable, version freeze policy. The two items I\'d want to nail down early are: what counts as a change request and what it costs, and who owns the evidence artifacts produced during the pilot. I\'d want governing law defined before anything is signed."',
    avoid: 'Do not promise a draft agreement you don\'t have ready.',
    followups: ['"What jurisdiction for governing law?" — Jesse answers this. Know your preference before the call.'],
  },
  {
    q: '"How do we know the audit chain wasn\'t fabricated?"',
    why: 'This is the right question to ask about any governance system. A sophisticated reviewer will ask it.',
    answer: '"The audit chain uses SHA-256 hash linking — each entry contains the hash of the previous entry. If you delete or alter any entry, the chain breaks and verification fails. What it does not do yet is HMAC signing — meaning a technically sophisticated attacker who controls the whole system could recompute the hashes. For legal-weight evidence, you would need HMAC or external attestation. This is on the documented gap list. For a pilot evaluation context, the hash chain is sufficient to show consistency."',
    avoid: 'Do not claim cryptographic signing exists. It does not.',
    followups: [],
  },
  {
    q: '"What is your pricing model?"',
    why: 'If the technical case holds, she will move to commercial terms.',
    answer: 'Jesse answers this directly. Suggested framing: "I prefer a fixed-fee structure for a bounded pilot — cleaner for both sides. Week one is the highest effort. Ongoing is lighter. Change requests are priced separately. Percentage structures create ambiguity on a v0.1 product and I don\'t think they serve either of us well at this stage."',
    avoid: 'Do not give a number you haven\'t thought through.',
    followups: [],
  },
  {
    q: '"What happens when CerbaSeal encounters a request type it doesn\'t recognize?"',
    why: 'Edge cases and unknown inputs are where governance systems fail most visibly.',
    answer: '"Unknown action classes trigger a reject with a documented reason code. Unknown inputs at the structural level trigger a fail-closed reject. The system does not guess or default to allow. If it cannot categorize the request, it blocks it."',
    avoid: 'Do not imply the system handles all future input types gracefully. Unknown values in some fields produce warnings, not hard rejects.',
    followups: [],
  },
  {
    q: '"Can CerbaSeal integrate with our existing audit / logging infrastructure?"',
    why: 'Line Axia will have existing systems. They will want to know where CerbaSeal fits.',
    answer: '"Not out of the box — that is pilot-scoped integration work. CerbaSeal produces evidence bundles and a hash-linked audit log. Those can be exported and ingested into existing logging systems. The integration layer between CerbaSeal\'s output format and your infrastructure would be defined during scoping and would be part of the pilot scope definition."',
    avoid: 'Do not imply pre-built integrations exist. They do not.',
    followups: [],
  },
  {
    q: '"How does CerbaSeal handle multi-workflow or multi-client scenarios?"',
    why: 'If Line Axia wants to roll this out across multiple clients, they need to know the scalability story.',
    answer: '"Multi-client support is not yet implemented. The first pilot is explicitly one client, one workflow. Expanding to multiple workflows or clients is a next-phase discussion after a successful pilot. The architecture does not prevent it — but it has not been built or tested."',
    avoid: 'Do not imply multi-client capability exists.',
    followups: [],
  },
  {
    q: '"What does a failed pilot look like, and what do we owe each other if that happens?"',
    why: 'A smart CTO always asks about the failure scenario, not just the success case.',
    answer: '"If the pilot doesn\'t meet the agreed success criteria, you get a final findings report documenting what worked, what didn\'t, and why — with specific, bounded recommendations. You keep all artifacts. The agreement should specify: what \'failure\' means, what each party owes, and whether there\'s any fee adjustment. I\'d rather define that before we start than negotiate it at the end."',
    avoid: 'Do not promise a refund policy you haven\'t agreed to.',
    followups: [],
  },
  {
    q: '"Is there a production roadmap? What does CerbaSeal look like in 12 months?"',
    why: 'She\'s evaluating this as a long-term partnership, not a one-time experiment.',
    answer: '"There is a documented gap list — persistent storage, cryptographic signing, identity provider integration, third-party security review, multi-client support. Those are the building blocks for production. A 12-month roadmap would be shaped by what the pilot reveals. I\'d rather commit to specific outcomes based on what we learn than over-promise on a schedule."',
    avoid: 'Do not commit to a product roadmap you can\'t back up.',
    followups: [],
  },
  {
    q: '"What are the actual performance characteristics? How fast is the gate?"',
    why: 'For production AI governance, latency matters. She will want to know the enforcement doesn\'t slow down decision loops.',
    answer: '"The test suite runs 372 tests in under 300 milliseconds. Single gate evaluations are sub-millisecond. There is no network call in the enforcement path. No load or stress testing has been done yet — that would be part of pre-production qualification. For a pilot evaluation context, performance is not the constraint."',
    avoid: 'Do not claim production-validated performance numbers. Load testing has not been done.',
    followups: [],
  },
  {
    q: '"How do we know your documentation matches what the code actually does?"',
    why: 'A technically sophisticated reviewer will be suspicious of documentation that looks too good.',
    answer: '"That is exactly what the 15 audit checks test. Several of those checks specifically verify that the documented claims appear in the portal, that the test count matches the actual run, that every invariant is linked to a covering test, and that no forbidden phrases appear. The documentation is not separate from the code — it is tested against it."',
    avoid: 'Do not overclaim perfect documentation coverage. Some fields have nuances the docs don\'t fully capture.',
    followups: [],
  },
  {
    q: '"What happens if our client\'s AI system finds a way around CerbaSeal?"',
    why: 'An adversarial question about bypass resistance. Critical for a governance tool.',
    answer: '"66 of our 372 tests are specifically designed to try to break or bypass the enforcement. The core protections are hard — AI cannot authorize its own requests, forged results are rejected by a cryptographic registry, unexpected errors fail closed. The weaker points are the caller-supplied fields: if the calling system lies about logging state or prohibited-use flags, CerbaSeal trusts those. That is a documented architectural dependency on upstream trustworthiness. For a controlled pilot it is manageable. For production it requires additional verification."',
    avoid: 'Do not claim the system is bypass-proof. No system is, and the security brief says so.',
    followups: [],
  },
  {
    q: '"What would happen if one of our clients\' regulators audited the system?"',
    why: 'EU AI Act and financial regulation creates audit obligations. She needs to know the system is auditable.',
    answer: '"CerbaSeal is designed to be auditable — every decision has a reason code, an evidence bundle, and a verifiable chain of custody. What a regulator would not yet have is a third-party security review, cryptographic signatures on the evidence, or an official compliance certification. Those are the three things I\'d want in place before a regulator looked at it. A pilot is the step before that."',
    avoid: 'Do not claim regulatory compliance. It does not exist.',
    followups: [],
  },
  {
    q: '"What makes CerbaSeal different from what we could build ourselves?"',
    why: 'Any well-resourced firm might consider building in-house rather than adopting external governance infrastructure.',
    answer: '"Build-vs-buy is a legitimate question. What you get with CerbaSeal: a governance layer that has been adversarially tested with 66 bypass attempts, a documented invariant model with 12 hard rules, an evidence and audit system, and a clear architectural boundary between enforcement and business logic. What you would need to build: all of that, from scratch, plus the test suite, plus the invariant model. The question is whether governance enforcement is core to what Line Axia builds or core to what you sell."',
    avoid: 'Do not disparage in-house engineering. Make the case on merit.',
    followups: [],
  },
  {
    q: '"How do we handle a situation where CerbaSeal blocks something it should have allowed?"',
    why: 'False positives in a governance system are operationally painful. She will want to know the exception path.',
    answer: '"Every HOLD and REJECT comes with a diagnostic report explaining exactly which rule was triggered. For a HOLD: a human reviewer reads the diagnostic, decides whether to approve, and the system logs that decision. For a REJECT that seems wrong: the issue goes into the tracked queue, root cause is investigated, and if the rule is wrong the fix is scoped and documented. No \'override\' button. Everything is logged."',
    avoid: 'Do not imply there is an easy bypass or admin override. There isn\'t — by design.',
    followups: [],
  },
  {
    q: '"Can you tell us more about the a16z application or any other partnerships you\'re in?"',
    why: 'Potential conflict with an exclusivity arrangement. This is a strategic question, not a technical one.',
    answer: 'Jesse answers this directly. Know your position before the call. If you are in active conversations with investors, that is relevant context for an exclusivity discussion.',
    avoid: 'Do not get caught in an inconsistency about your current partnership conversations.',
    followups: [],
  },
  {
    q: '"What governing law would you want for the agreement?"',
    why: 'France-based firm, EU clients — they will want EU or French law. Jesse needs to know his position.',
    answer: 'Jesse answers this directly. Suggested framing: "I\'m open to French law or EU law given your client base. The things I\'d want to nail down regardless of jurisdiction: what constitutes a change request, evidence ownership, and liability cap. Those matter more to me than the governing law choice."',
    avoid: 'Do not dismiss the jurisdiction question. It will be a sticking point for Tina Simpson.',
    followups: [],
  },
  {
    q: '"What would exclusivity actually mean, and what would it cost us?"',
    why: 'If the conversation gets to 12-month EU exclusivity, she will want to understand what she\'s buying.',
    answer: '"EU exclusivity would mean I don\'t deploy CerbaSeal for another client in the EU for 12 months. What I\'d want to define: what counts as \'EU\' for this purpose, what event triggers the right of first refusal to extend, and what ends the exclusivity if the engagement is not active. The commercial value of exclusivity is a separate negotiation from the pilot fee — I\'d rather not bundle them."',
    avoid: 'Do not commit to exclusivity terms on the call. Get it in writing.',
    followups: [],
  },
];

questions.forEach((item, i) => {
  pageCheck(160);
  qaBlock(`${i + 1}. ${item.q}`, item.why, item.answer, item.avoid, item.followups);
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7 — FOUNDER CHEAT SHEET
// ═══════════════════════════════════════════════════════════════════════════════
newPage();
sectionBanner('Section 7 — Founder Cheat Sheet', NAVY);
doc.fontSize(9).fillColor(MUTED).font('Helvetica-Oblique')
   .text('Read this the morning of the call. One page. Plain English. No technical jargon.', { width: W });
doc.moveDown(0.4);

const cheatItems = [
  {
    q: '"Where is CerbaSeal / what is VeraSeal?"',
    short: '"CerbaSeal is the system. VeraSeal doesn\'t exist in the codebase."',
    honest: '"What I have is a working enforcement engine, fully tested, not yet deployed outside a demo environment."',
    danger: '"VeraSeal is our…" — stop. Do not finish this sentence.',
  },
  {
    q: '"Is this EU-deployable?"',
    short: '"Yes architecturally — no external calls, no cloud, it runs wherever Node.js runs."',
    honest: '"I haven\'t done it yet. The first client deployment would be the first deployment anywhere."',
    danger: '"We\'ve already tested this in EU environments." — you have not.',
  },
  {
    q: '"What do you actually do during the pilot?"',
    short: '"Heavy week one, then weekly 30-minute calls and email support."',
    honest: '"I\'m a solo founder with a documented 48-hour self-service model. Beyond that, I don\'t have a backup."',
    danger: '"I\'m available 24/7." — you are not.',
  },
  {
    q: '"How available are you?"',
    short: '"3–5 hours per week after week one, with defined response times for issues."',
    honest: '"Solo founder. If I\'m unavailable the system runs without me for 48 hours. Beyond that is a risk I\'ve been transparent about."',
    danger: '"Don\'t worry, I\'ll always be there." — do not promise what you cannot guarantee.',
  },
  {
    q: '"Any open-source risks?"',
    short: '"One runtime dependency, MIT licensed. No GPL anywhere in the tree."',
    honest: '"Five packages total in the deployment. All MIT. No copyleft. No external services."',
    danger: '"It\'s completely custom-built from scratch." — tsx is a dependency. Name it.',
  },
  {
    q: '"What happens to the evidence log if the server restarts?"',
    short: '"It\'s lost right now. Persistent storage is my top build priority before any pilot starts."',
    honest: '"This is a real gap. It must be fixed before client data touches the system."',
    danger: '"The evidence is fully durable." — it is not. In-memory means lost on restart.',
  },
  {
    q: '"Has anyone else reviewed your security?"',
    short: '"No external review yet. I have a security brief that documents every known limitation."',
    honest: '"All security review to date has been internal. External review is on the roadmap before production."',
    danger: '"We\'ve been reviewed by…" — do not name anyone unless it is true.',
  },
  {
    q: '"Is the audit chain cryptographically signed?"',
    short: '"Hash-linked, not key-signed. Proves consistency. Doesn\'t prove origin."',
    honest: '"For legal-weight evidence, we would need HMAC signing. That\'s documented as a future requirement."',
    danger: '"The evidence is cryptographically verified." — it is hash-chained, not signed. Different thing.',
  },
  {
    q: '"Do you have any existing clients?"',
    short: '"No. This call is the beginning of that conversation."',
    honest: '"No signed pilot client. No commercial agreement. CerbaSeal is a proof-stage product."',
    danger: '"We\'re in conversations with several firms." — do not imply clients you don\'t have.',
  },
  {
    q: '"Is CerbaSeal production-ready?"',
    short: '"No. It\'s pilot-ready — controlled environment, one workflow, no production decisions."',
    honest: '"Production requires persistent storage, cryptographic signing, external security review, and a signed agreement. Those are the gaps."',
    danger: '"We\'re very close to production-ready." — you are not. Say what you are.',
  },
];

cheatItems.forEach((item, i) => {
  pageCheck(90);
  doc.moveDown(0.2);
  doc.rect(55, doc.y, W, 1).fill('#e2e8f0'); doc.moveDown(0.25);
  doc.fontSize(9.5).fillColor(NAVY).font('Helvetica-Bold')
     .text(`${i + 1}. ${item.q}`, { width: W });
  doc.moveDown(0.15);
  doc.fontSize(8.5).fillColor(GREEN).font('Helvetica-Bold').text('SHORT ANSWER: ', { continued: true });
  doc.fillColor('#222222').font('Helvetica').text(item.short, { width: W });
  doc.fontSize(8.5).fillColor(AMBER).font('Helvetica-Bold').text('HONEST ANSWER: ', { continued: true });
  doc.fillColor('#222222').font('Helvetica').text(item.honest, { width: W });
  doc.fontSize(8.5).fillColor(RED).font('Helvetica-Bold').text('DANGER — DO NOT SAY: ', { continued: true });
  doc.fillColor(RED).font('Helvetica').text(item.danger, { width: W });
  doc.moveDown(0.2);
});

newPage();
sectionBanner('Pre-Call Checklist', GREEN);
[
  ['Confirmed', 'Test count: 372 passing, 0 failing — confirmed this morning with pnpm test'],
  ['Confirmed', 'Audit: 15/15 checks passing — confirmed with pnpm audit:repo'],
  ['Confirmed', 'LICENSE file exists — proprietary, Lamont Labs, all rights reserved'],
  ['Confirmed', 'Demo live at cerbaseal.replit.app — open it before the call'],
  ['Do Before Call', 'Know your position on: cyber liability insurance, governing law preference, exclusivity terms'],
  ['Do Before Call', 'Know your answer to: "how long to build persistent storage?" — estimate 2–5 days'],
  ['Do Before Call', 'Run through Section 8 questions in the CTO Review Pack verbally'],
  ['On The Call', 'If she says VeraSeal: correct it gently, move on, do not make it a moment'],
  ['On The Call', 'Lead with what is real. The enforcement core is real. The tests are real. The gap is real.'],
  ['On The Call', 'Do not overclaim. The claims you make will be checked. Make only ones you can defend.'],
  ['After The Call', 'Follow up in writing. Confirm the pilot shape, prerequisites, and next steps in an email.'],
].forEach(([status, item]) => {
  const color = status === 'Confirmed' ? GREEN : status === 'Do Before Call' ? AMBER : BLUE;
  doc.fontSize(9).fillColor(color).font('Helvetica-Bold')
     .text('[' + status + ']  ', { continued: true });
  doc.fillColor('#222222').font('Helvetica').text(item, { width: W });
  doc.moveDown(0.2);
});

rule();
callout('CLOSING POSITION — The honest competitive advantage',
  'The competitive position is not "we are production-ready." ' +
  'The competitive position is: we are honest about what we are, we have built the enforcement logic that most ' +
  'governance products only describe in slide decks, and we are ready to prove it in a controlled environment ' +
  'with defined success criteria. That is a stronger position than overclaiming. Olivia will test the claims. ' +
  'The ones above will hold.', '#eff6ff', BLUE);

// ─── FOOTERS ──────────────────────────────────────────────────────────────────
const total = doc.bufferedPageRange().count;
for (let i = 0; i < total; i++) {
  doc.switchToPage(i);
  doc.rect(0, doc.page.height - 24, doc.page.width, 24).fill('#f1f5f9');
  doc.fontSize(7.5).fillColor(LIGHT).font('Helvetica')
     .text(
       `CerbaSeal-Core v0.1.0  |  Lamont Labs  |  Call Prep Binder — Line Axia  |  2026-06-02  |  CONFIDENTIAL  |  Page ${i + 1} of ${total}`,
       55, doc.page.height - 14, { width: W, align: 'center' }
     );
}

doc.end();
stream.on('finish', () => console.log('PDF written to:', outputPath));
stream.on('error', e => { console.error(e); process.exit(1); });
