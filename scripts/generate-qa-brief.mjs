import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'docs/reports/LINE_AXIA_CALL_QA_BRIEF.pdf');
const doc = new PDFDocument({ margin: 0, size: 'LETTER', bufferPages: true });
doc.pipe(fs.createWriteStream(OUT));

const M = 56;
const PW = 612;
const PH = 792;
const TW = PW - M * 2;

const C = {
  navy:  '#0f172a', blue:  '#1d4ed8', teal:  '#0f766e',
  green: '#15803d', red:   '#b91c1c', amber: '#b45309',
  body:  '#334155', muted: '#64748b', rule:  '#e2e8f0',
  bgGray:'#f8fafc', bgBlue:'#eff6ff', bgRed: '#fef2f2',
  bgGrn: '#f0fdf4', bgAmb: '#fffbeb', white: '#ffffff',
};

function newPage() {
  doc.addPage({ margin: 0, size: 'LETTER' });
  doc.rect(0, 0, PW, 4).fill(C.blue);
  doc.y = 24;
}

function safe(n = 100) { if (doc.y > PH - n) newPage(); }

function heading(t, color = C.navy) {
  safe(80);
  doc.moveDown(0.4);
  doc.fontSize(13).fillColor(color).font('Helvetica-Bold').text(t, M, doc.y, { width: TW });
  doc.moveDown(0.15);
}

function label(t, color = C.blue) {
  safe(60);
  doc.moveDown(0.3);
  doc.fontSize(8).fillColor(color).font('Helvetica-Bold').text(t.toUpperCase(), M, doc.y, { width: TW });
  doc.moveDown(0.1);
}

function body(t) {
  doc.fontSize(10).fillColor(C.body).font('Helvetica').text(t, M, doc.y, { width: TW, lineGap: 3 });
  doc.moveDown(0.25);
}

function note(t, bg, accent) {
  safe(60);
  const lines = Math.ceil(t.length / 85);
  const h = Math.max(44, lines * 14 + 20);
  const y = doc.y;
  doc.rect(M, y, TW, h).fill(bg);
  doc.rect(M, y, 3, h).fill(accent);
  doc.fontSize(9.5).fillColor(C.navy).font('Helvetica').text(t, M + 12, y + 10, { width: TW - 18, lineGap: 3 });
  doc.y = y + h + 10;
}

function warn(t)  { note(t, C.bgAmb, C.amber); }
function danger(t){ note(t, C.bgRed, C.red); }
function good(t)  { note(t, C.bgGrn, C.green); }
function info(t)  { note(t, C.bgBlue, C.blue); }

function divider() {
  doc.moveDown(0.3);
  doc.rect(M, doc.y, TW, 0.75).fill(C.rule);
  doc.moveDown(0.35);
}

function qBanner(num, title, risk, riskColor) {
  const y = doc.y;
  doc.rect(0, y, PW, 44).fill(C.navy);
  doc.rect(0, y, 4, 44).fill(riskColor);
  doc.fontSize(10).fillColor(riskColor).font('Helvetica-Bold').text(`Q${num}`, M + 2, y + 8, { width: 24 });
  doc.fontSize(12).fillColor(C.white).font('Helvetica-Bold').text(title, M + 30, y + 8, { width: TW - 130 });
  doc.fontSize(8.5).fillColor(riskColor).font('Helvetica-Bold').text(risk, M + 30, y + 26, { width: TW - 30 });
  doc.y = y + 52;
}

function appBanner(letter, title) {
  const y = doc.y;
  doc.rect(0, y, PW, 36).fill(C.navy);
  doc.rect(0, y, 4, 36).fill(C.teal);
  doc.fontSize(9).fillColor(C.teal).font('Helvetica-Bold').text(`SECTION ${letter}`, M + 2, y + 7);
  doc.fontSize(12).fillColor(C.white).font('Helvetica-Bold').text(title, M + 2, y + 20, { width: TW });
  doc.y = y + 44;
}

function bullet(items) {
  items.forEach(item => {
    safe(30);
    const y = doc.y;
    doc.fontSize(10).fillColor(C.blue).font('Helvetica-Bold').text('·', M + 4, y, { width: 12 });
    doc.fontSize(10).fillColor(C.body).font('Helvetica').text(item, M + 18, y, { width: TW - 18, lineGap: 3 });
    doc.y += 4;
  });
  doc.moveDown(0.2);
}

function riskRow(q, level, color, why) {
  safe(80);
  const lines = Math.ceil(why.length / 88);
  const h = Math.max(58, lines * 14 + 30);
  const y = doc.y;
  doc.rect(M, y, TW, h).fill(C.bgGray);
  doc.rect(M, y, 3, h).fill(color);
  doc.fontSize(10).fillColor(C.navy).font('Helvetica-Bold').text(q, M + 10, y + 8, { width: TW - 120 });
  const rbg = color === C.green ? C.bgGrn : color === C.red ? C.bgRed : C.bgAmb;
  doc.rect(M + TW - 100, y + 6, 92, 18).fill(rbg);
  doc.fontSize(8.5).fillColor(color).font('Helvetica-Bold').text(level, M + TW - 96, y + 11, { width: 88, align: 'center' });
  doc.fontSize(9.5).fillColor(C.body).font('Helvetica').text(why, M + 10, y + 26, { width: TW - 16, lineGap: 3 });
  doc.y = y + h + 8;
}

// ══════════════════════════════════════════════════════════════════════════
// COVER
// ══════════════════════════════════════════════════════════════════════════
doc.rect(0, 0, PW, PH).fill(C.navy);
doc.rect(0, 0, PW, 4).fill(C.blue);

doc.fontSize(32).fillColor(C.white).font('Helvetica-Bold').text('Call Prep Guide', M, 110, { width: TW });
doc.fontSize(32).fillColor(C.blue).font('Helvetica-Bold').text('Line Axia · Olivia Aréchiga', M, 148, { width: TW });
doc.rect(M, 196, TW, 1).fill(C.blue);
doc.fontSize(11).fillColor('#94a3b8').font('Helvetica').text('10 questions, plain answers, what to say and what not to say', M, 208, { width: TW });

// Contents box
doc.rect(M, 248, TW, 330).fill('#0a0f1e');
doc.rect(M, 248, 3, 330).fill(C.blue);
doc.fontSize(8).fillColor(C.blue).font('Helvetica-Bold').text('WHAT\'S INSIDE', M + 14, 262);
const contents = [
  ['Q1', 'Are you ready to deploy?', 'MEDIUM'],
  ['Q2', 'Can it run in Europe without US servers?', 'MEDIUM'],
  ['Q3', 'How much of your time does this take?', 'LOW'],
  ['Q4', 'Can you actually fit this in right now?', 'LOW–MEDIUM'],
  ['Q5', 'Any third-party software to worry about?', 'LOW'],
  ['Q6', 'How do you want to be paid?', 'HIGH'],
  ['Q7', 'Who does what in this partnership?', 'MEDIUM–HIGH'],
  ['Q8', 'Who owns the technology?', 'LOW'],
  ['Q9', '12-month exclusivity — is that fair?', 'HIGH'],
  ['Q10', 'What do you need before saying yes?', 'MEDIUM'],
  ['A', 'Hard follow-up questions she might ask', ''],
  ['B', 'Questions Jesse should ask her', ''],
  ['C', 'Things Jesse must not say', ''],
  ['D', 'One-sentence version of each answer', ''],
  ['E', 'How risky is each question?', ''],
];
contents.forEach(([n, t, r], i) => {
  const ry = 280 + i * 19;
  const isQ = !isNaN(parseInt(n));
  doc.fontSize(8.5).fillColor(isQ ? C.blue : C.teal).font('Helvetica-Bold').text(n, M + 14, ry, { width: 28 });
  doc.fontSize(9).fillColor(C.white).font('Helvetica').text(t, M + 44, ry, { width: 270 });
  if (r) {
    const rc = r.includes('HIGH') ? C.red : r.includes('LOW') ? C.green : C.amber;
    doc.fontSize(7.5).fillColor(rc).font('Helvetica-Bold').text(r, M + 330, ry, { width: 130 });
  }
});

doc.rect(M, 594, TW, 72).fill('#131b2e');
doc.rect(M, 594, 3, 72).fill(C.teal);
doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text(
  'Every answer is based only on what actually exists in the repository and documentation. ' +
  'Nothing is made up. If something isn\'t built yet, this guide says so clearly.',
  M + 14, 608, { width: TW - 24, lineGap: 3 }
);

doc.fontSize(7.5).fillColor(C.muted).font('Helvetica')
   .text('CerbaSeal-Core v0.1.0  ·  Lamont Labs  ·  Confidential  ·  2026-06-04',
         M, PH - 16, { width: TW, align: 'center' });

// ══════════════════════════════════════════════════════════════════════════
// Q1
// ══════════════════════════════════════════════════════════════════════════
newPage();
qBanner(1, 'Are you ready to deploy?', 'MEDIUM RISK', C.amber);

label('What She\'s Really Asking');
body('Is this real software or just a demo? And how long before it can actually be used with a real client?');

danger('She may mention "VeraSeal." That name does not exist anywhere in the codebase. Correct it calmly: "The system is called CerbaSeal." Do not make up a definition for VeraSeal.');

label('My Answer');
body('The core software works and has been tested thoroughly:\n· 372 automated tests — all passing\n· 66 tests specifically tried to break it — none succeeded\n· 15 separate audit checks — all passing\n· A live demo anyone can look at right now at cerbaseal.replit.app\n\nWhat\'s not done yet:\n· The audit record disappears if the server restarts (needs a fix before any real client use)\n· No deployment has happened outside of the demo environment\n· No external security firm has reviewed it yet\n\nWhat "pilot-ready" means to me: one client, one specific use case, no live decisions, with a clear written agreement before any real data is involved.');

label('Risks / Caveats');
body('The disappearing audit log is the biggest gap. It must be fixed first. First deployment outside the demo will be the first real deployment anywhere. That\'s normal for a v0.1 product — but be honest about it.');

label('Supporting Evidence');
body('372 passing tests: verified by running pnpm test. 15/15 audit checks: verified by pnpm audit:repo. Disappearing log: documented in the security review brief. VeraSeal: search of the entire codebase returns zero results for that word.');

label('Question Back To Her');
body('"When you mentioned VeraSeal — where did that name come from? I want to make sure we\'re looking at the same system."');

// ══════════════════════════════════════════════════════════════════════════
// Q2
// ══════════════════════════════════════════════════════════════════════════
newPage();
qBanner(2, 'Can it run in Europe without US servers?', 'MEDIUM RISK', C.amber);

label('What She\'s Really Asking');
body('For EU-based clients, data leaving Europe can be a legal problem. She needs to know if this is already solved or if it still needs to be built.');

label('My Answer');
body('Two separate facts — both true:\n\n1. The software is designed to work entirely within whatever environment you put it in. It makes zero calls to outside services. No data ever leaves the system. It would run in a European data centre the same way it runs on a laptop.\n\n2. That said — no actual EU deployment has happened yet. The first one would happen as part of a pilot.\n\nThe preferred approach for a Europe-based pilot is Mode C: the client controls the hosting. CerbaSeal lives entirely in their environment. Nothing leaves.');

good('The enforcement library makes zero outbound network calls. This is confirmed by reading every line of enforcement code. There are no cloud services, no external APIs, no analytics pings — nothing.');

label('What Still Needs to Happen Before EU Deployment');
bullet([
  'A data processing agreement (DPA) must be signed before any real data is used',
  'Legal review of EU evidence storage requirements',
  'An actual first deployment (the pilot would be this)',
]);

label('Risks / Caveats');
body('"It\'s designed for this" is different from "it\'s been done." Be clear about which one you\'re claiming.');

label('Supporting Evidence');
body('"CerbaSeal does not require outbound network access" and "does not call external APIs" — both stated explicitly in eu-pilot-deployment-posture.md. Mode C documented in the same file. Zero runtime dependencies confirmed by package audit.');

label('Question Back To Her');
body('"Does Line Axia have EU hosting infrastructure already, or would that need to be set up as part of the pilot?"');

// ══════════════════════════════════════════════════════════════════════════
// Q3
// ══════════════════════════════════════════════════════════════════════════
newPage();
qBanner(3, 'How much of your time does this take?', 'LOW RISK', C.green);

label('What She\'s Really Asking');
body('Is the client dependent on Jesse being available all the time? What happens if he\'s unavailable? Is the support model written down or is he making it up?');

info('This is the most thoroughly documented part of the project. The support model was written before this call. Jesse is reading from it, not improvising.');

label('My Answer — Week 1');
body('One 60-minute setup call. Deploy the system. Confirm the three outcomes (allow, block, review) work in the client\'s context. Hand over a written document covering scope, how decisions are made, and what the test scenarios are. This week is the most work-intensive — roughly 10 to 15 hours from me.');

label('My Answer — Every Week After That');
body('A 30-minute check-in call. An open issue log with every problem tracked, given a severity level, and resolved in writing. A weekly update email. Response if something comes up during the week.');

label('Response Times — Written Commitments');
bullet([
  'System completely down: same business day',
  'A rule is being violated: within 24 hours',
  'General question: within 3 business days',
  'Feature request: reviewed at the weekly call',
]);

label('Can The Client Run It Without Me?');
body('Yes — and that\'s intentional. Every blocked action produces a written explanation. The full 15-point audit re-runs with a single command, no Jesse needed. The evidence reports are human-readable. My involvement is highest in week one and drops from there.');

warn('I\'m one person. There\'s no backup engineer. If I\'m unavailable for up to 48 hours, everything keeps running and the documentation covers it. Beyond 48 hours, there\'s no formal backup plan. This needs to be honest in any agreement.');

label('Question Back To Her');
body('"Who would be the main point of contact on Line Axia\'s side — someone technical who can read diagnostic reports, or would everything need to go through me?"');

// ══════════════════════════════════════════════════════════════════════════
// Q4
// ══════════════════════════════════════════════════════════════════════════
newPage();
qBanner(4, 'Can you actually fit this in right now?', 'LOW–MEDIUM RISK', C.amber);

label('What She\'s Really Asking');
body('Are there other things competing for Jesse\'s time? Is there a better time to start? Will he actually show up?');

label('My Answer');
body('Here\'s what this realistically requires from me:\n\n· Week 1: 10 to 15 hours (setup, deployment, documents)\n· Weeks 2 onward: 3 to 5 hours per week normally\n· If something urgent breaks: up to half a day to investigate\n\nThere are no other active pilot clients. This would be the first.\n\nOne thing to factor into the start date: the disappearing audit log needs to be fixed before we begin. That\'s an estimated 2 to 5 days of work. Not a big job, but it needs to happen first.\n\n[Jesse fills in anything about current schedule, travel, or other projects here.]');

label('Risks / Caveats');
body('Solo founder. Finite capacity. Don\'t imply otherwise. If an issue spike hits in weeks 2–4, the time commitment goes up. Worth naming that honestly.');

label('Question Back To Her');
body('"What\'s Line Axia\'s preferred timeline for starting — and do you have a specific client workflow already in mind?"');

// ══════════════════════════════════════════════════════════════════════════
// Q5
// ══════════════════════════════════════════════════════════════════════════
newPage();
qBanner(5, 'Any third-party software to worry about?', 'LOW RISK', C.green);

label('What She\'s Really Asking');
body('Does CerbaSeal bring in outside software that could create legal obligations, security risks, or supply-chain concerns for EU clients?');

label('My Answer');
body('Two things to separate:');

good('The actual enforcement library — the thing a client installs — has zero external dependencies. Nothing. A security team reviewing a client deployment would only need to look at Node.js (which the client already uses) and CerbaSeal\'s source code. That\'s the entire surface.');

label('The Demo Environment (cerbaseal.replit.app)');
body('Uses one package called tsx to run TypeScript directly without a compile step. It\'s MIT licensed. It\'s a demo tool — it\'s not part of any client installation.');

label('Licence Summary');
bullet([
  'Every licence in the entire project: MIT — no restrictions, no obligations',
  'Zero GPL (copyleft) anywhere — clients never need to share their source code',
  'No cloud services, no external APIs, no analytics, no outbound calls of any kind',
]);

label('What Could Be Done If Asked');
body('A formal Software Bill of Materials (SBOM) can be generated on request. The install process can be run from a private registry or offline bundle if the client requires it.');

label('Question Back To Her');
body('"Does Line Axia have a standard software review process, or would this go through the client\'s security team directly?"');

// ══════════════════════════════════════════════════════════════════════════
// Q6
// ══════════════════════════════════════════════════════════════════════════
newPage();
qBanner(6, 'How do you want to be paid?', 'HIGH RISK', C.red);

label('What She\'s Really Asking');
body('Has Jesse thought about this seriously? Does his model make sense? Does it create any weird incentives?');

danger('There\'s no pricing in the repository. This is Jesse\'s call. The most important rule: do not name a number before you understand what Line Axia is making on this deal.');

label('My Answer');
body('A fixed fee for a defined pilot makes the most sense. The scope is specific. The deliverables are written down. Both sides know exactly what they\'re paying for and getting.\n\nAnything outside the agreed scope would be priced separately — this is already documented in the pilot model.\n\nA percentage-of-deal structure makes Jesse\'s income dependent on things he doesn\'t control. A wide-open time-and-materials arrangement creates risk for both sides. Fixed fee avoids both problems.');

label('Before Naming a Number, Jesse Needs to Know');
bullet([
  'What is Line Axia\'s total fee for this engagement?',
  'What percentage does the technical partner typically receive?',
  'Is there a retainer, a project fee, or a success bonus involved?',
]);

warn('If the advisory partner is keeping a large portion of the commercial fee, Jesse needs to understand that before agreeing to any structure. The technology is the product. That has value.');

label('Question Back To Her');
body('"Can you walk me through what the overall commercial structure looks like from your side? I want to make sure my fee model lines up with yours rather than creating a mismatch."');

// ══════════════════════════════════════════════════════════════════════════
// Q7
// ══════════════════════════════════════════════════════════════════════════
newPage();
qBanner(7, 'Who does what in this partnership?', 'MEDIUM–HIGH RISK', C.amber);

label('What She\'s Really Asking');
body('She\'s proposing a structure: Line Axia handles the client, the regulations, and the commercial deal. Lamont Labs builds and runs the technology. Does that work for Jesse?');

label('My Answer');
body('Broadly yes — but "technical implementation" needs to be defined before Jesse agrees to it.');

label('What Lamont Labs Does');
bullet([
  'Delivers and runs the CerbaSeal enforcement system',
  'Defines what\'s in scope for the pilot, in writing',
  'Tracks every issue and resolves it with a written record',
  'Produces all technical documents and the final findings report',
  'Owns the technology and all the underlying code',
]);

label('What Lamont Labs Does NOT Do');
bullet([
  'Does not give legal or compliance opinions — documented explicitly',
  'Does not plug CerbaSeal into the client\'s existing internal systems',
  'Does not manage the client relationship or negotiate commercial terms',
  'Does not make commitments on Jesse\'s behalf',
]);

warn('"Technical implementation" is vague. If it means configuring CerbaSeal for a defined use case — that\'s in scope. If it means building custom integrations or acting as the client\'s engineering team — that\'s a different conversation with a different price. Jesse must define the line before agreeing.');

label('Risks / Caveats');
body('Line Axia cannot make technical commitments on CerbaSeal\'s behalf. If they do, those commitments are not binding. Every technical scope decision goes through Jesse.');

label('Question Back To Her');
body('"Can you describe a specific scenario? I want to be sure we both understand where my scope starts and ends."');

// ══════════════════════════════════════════════════════════════════════════
// Q8
// ══════════════════════════════════════════════════════════════════════════
newPage();
qBanner(8, 'Who owns the technology?', 'LOW RISK', C.green);

label('What She\'s Really Asking');
body('Are there any hidden complications — open-source licences, shared ownership, third-party components — that could cloud client confidence in who actually owns this?');

good('Clean and simple. The licence file in the repository says: "Copyright 2026 Jesse J. Lamont / Lamont Labs. All rights reserved." No one else has a claim. No third-party IP is embedded in the enforcement library.');

label('My Answer');
body('Lamont Labs owns all of it. The licence is proprietary — looking at it or using the demo does not give anyone rights to it. A separate written agreement is required for any other use.\n\nThe enforcement library has no third-party code in it. It\'s all original work. No licence obligations, no strings attached.\n\nAudit records and evidence bundles produced during a pilot belong to the client. Lamont Labs keeps no access to client data after the engagement ends. This is documented.');

label('One Thing To Clarify In The Agreement');
body('Custom configuration built specifically for a client (their workflow rules, their decision scenarios) — who owns that? The core technology is Lamont Labs\'s. Client-specific configuration may be treated differently. This needs to be written into the agreement.');

label('Risks / Caveats');
body('No patent has been filed. If patentability matters to Line Axia\'s client conversations, Jesse needs a clear position on that. Anyone viewing the repository is subject to the licence — access does not equal permission.');

label('Question Back To Her');
body('"When you say Line Axia manages the commercial structure — would that ever include licensing CerbaSeal to a client directly, or would Lamont Labs always hold that relationship?"');

// ══════════════════════════════════════════════════════════════════════════
// Q9
// ══════════════════════════════════════════════════════════════════════════
newPage();
qBanner(9, '12-month exclusivity — is that fair?', 'HIGH RISK', C.red);

label('What She\'s Really Asking');
body('She wants to lock down CerbaSeal in the EU market before anyone else gets access. She\'s also testing whether Jesse will agree without thinking it through.');

danger('Do not agree to exclusivity terms on this call. Get everything in writing with all the details defined first. "Sounds like a reasonable starting point to explore" is fine. "Yes, agreed" is not.');

label('My Answer');
body('Exclusivity is worth discussing — but the phrase "12-month EU exclusivity" doesn\'t mean anything without answers to these questions:');

bullet([
  'What counts as "EU" — France only? All 27 countries? Does Switzerland count?',
  'What starts the 12-month clock — the agreement? The first pilot? The first paying client?',
  'What keeps it active — a minimum number of pilots? A revenue threshold? A fixed fee?',
  'What ends it early — inactivity? Breach? Mutual agreement?',
  'What does "right of first refusal" mean — on which deals, with how much notice, on what terms?',
]);

label('The Honest Position on Leverage');
body('CerbaSeal is built, tested, and documented. There is no other pilot client today. That exclusivity has value to Line Axia — and that value should be reflected in the deal. Exclusivity with no minimum commitment and no compensation is a one-sided arrangement.');

label('Risks / Caveats');
body('12 months of EU exclusivity on a product with no minimum activity clause means Jesse can\'t develop the EU market for a year even if Line Axia doesn\'t run a single pilot. That\'s not acceptable. There must be a floor.');

label('Question Back To Her');
body('"What does Line Axia\'s typical exclusivity arrangement include — is there a minimum number of pilots or a revenue commitment attached, or is it purely based on time?"');

// ══════════════════════════════════════════════════════════════════════════
// Q10
// ══════════════════════════════════════════════════════════════════════════
newPage();
qBanner(10, 'What do you need before saying yes?', 'MEDIUM RISK', C.amber);

label('What She\'s Really Asking');
body('She\'s asking Jesse to reveal his priorities before negotiation begins. If Jesse has a clear, confident answer, it signals he\'s thought this through. If he\'s figuring it out on the call, it shows.');

info('All five requirements below come from the repository — docs/pilot/pilot-readiness-brief.md. Jesse is reading from a document, not guessing.');

label('My Answer — Five Things That Must Be In Any Agreement');
body('');

divider();
label('1. Clarity on evidence ownership');
body('Every audit record, evidence bundle, and report produced during the pilot belongs to the client. Lamont Labs retains no access to any of it after the engagement.');

divider();
label('2. A written scope boundary');
body('Exactly what\'s included. Exactly what\'s not. How requests for extra work are handled and priced. Verbal scope agreements during a pilot don\'t count.');

divider();
label('3. A clear liability limit');
body('CerbaSeal is a governance layer that sits before decisions are made. It\'s not responsible for what happens upstream or downstream of that gate. The agreement must define this boundary.');

divider();
label('4. A defined support period');
body('When does the pilot start, when does it end, what does support include, and what happens when it\'s over. Not open-ended.');

divider();
label('5. Agreed governing law');
body('Which country\'s law applies to this agreement? This must be defined before signing. Jesse should know his preferred position before the call.');

label('Question Back To Her');
body('"What does a working agreement typically look like from your side — do you have a template, or would we build terms from scratch together?"');

// ══════════════════════════════════════════════════════════════════════════
// SECTION A — OLIVIA'S FOLLOW-UPS
// ══════════════════════════════════════════════════════════════════════════
newPage();
appBanner('A', 'Hard Follow-Up Questions She Might Ask');
body('Every question that could realistically come up after the 10 main questions. Know the answer to each one before the call.', C.muted);
doc.moveDown(0.2);

heading('Technical Questions', C.navy);
const techFU = [
  ['"Can you show it running on servers we control — not your demo environment?"', 'Not yet. The pilot would be the first real deployment. Mode C means it lives entirely in your environment.'],
  ['"What happens to the audit log if the server restarts?"', 'Right now it\'s lost. Fixing this is the top priority before any pilot begins.'],
  ['"Has anyone outside your team reviewed the security?"', 'No third-party security firm has reviewed it. The security brief documents every known limitation honestly.'],
  ['"Does it actually read and understand the policy documents it references?"', 'No. It checks that a reference exists. Understanding the content of documents is handled upstream.'],
  ['"Could the audit trail be faked?"', 'The log is chained using SHA-256 hashes — it proves nothing was changed. It doesn\'t prove who created it. Cryptographic signing is a future requirement.'],
  ['"What\'s your GDPR analysis?"', 'Not completed. The architecture keeps data within the deployment boundary. Legal review must happen before any real data is involved.'],
  ['"What happens with a request type the system doesn\'t recognise?"', 'It blocks it with a written reason. The system always fails closed — never lets something through when uncertain.'],
  ['"What does a failed pilot look like?"', 'A findings report, all documents returned to the client, and fees as agreed upfront.'],
];
techFU.forEach(([q, a]) => {
  safe(55);
  doc.moveDown(0.15);
  doc.fontSize(10).fillColor(C.navy).font('Helvetica-Bold').text(q, M, doc.y, { width: TW });
  doc.fontSize(9.5).fillColor(C.muted).font('Helvetica').text('→  ' + a, M + 10, doc.y + 13, { width: TW - 10, lineGap: 2.5 });
  doc.y += 26;
});

heading('Commercial Questions', C.navy);
const commFU = [
  ['"What\'s your day rate?"', 'Jesse answers this. Have the number ready before the call.'],
  ['"Have you worked with advisory partners before?"', 'Honest answer. Don\'t overstate.'],
  ['"Could we buy CerbaSeal or take an exclusive licence after 12 months?"', 'That\'s a separate conversation requiring legal review. Don\'t answer live.'],
  ['"Would a success fee work instead?"', 'Understand the deal economics first.'],
  ['"Who else are you talking to?"', 'Jesse answers. Know your position.'],
  ['"What if you raise money and bring in a board — does that change our arrangement?"', '"That would need to be addressed in the working agreement."'],
];
commFU.forEach(([q, a]) => {
  safe(50);
  doc.moveDown(0.15);
  doc.fontSize(10).fillColor(C.navy).font('Helvetica-Bold').text(q, M, doc.y, { width: TW });
  doc.fontSize(9.5).fillColor(C.muted).font('Helvetica').text('→  ' + a, M + 10, doc.y + 13, { width: TW - 10, lineGap: 2.5 });
  doc.y += 26;
});

heading('Regulatory Questions', C.navy);
const regFU = [
  ['"Have you spoken with EU regulators about the AI Act?"', 'No. CerbaSeal is designed to support audit requirements. No regulatory conversations have occurred.'],
  ['"How does this map to DORA requirements for financial services?"', 'That mapping is part of the regulatory framing Line Axia handles — not Jesse\'s scope.'],
  ['"Is this evidence admissible in a French court?"', 'That\'s a legal question requiring a qualified legal opinion. The evidence is consistent and hash-linked — admissibility depends on jurisdiction.'],
  ['"If our auditor wants to review the source code, what\'s the process?"', 'That\'s defined in the licence and the working agreement. Jesse approves any source code access.'],
];
regFU.forEach(([q, a]) => {
  safe(50);
  doc.moveDown(0.15);
  doc.fontSize(10).fillColor(C.navy).font('Helvetica-Bold').text(q, M, doc.y, { width: TW });
  doc.fontSize(9.5).fillColor(C.muted).font('Helvetica').text('→  ' + a, M + 10, doc.y + 13, { width: TW - 10, lineGap: 2.5 });
  doc.y += 26;
});

// ══════════════════════════════════════════════════════════════════════════
// SECTION B — JESSE'S QUESTIONS
// ══════════════════════════════════════════════════════════════════════════
newPage();
appBanner('B', 'Questions Jesse Should Ask');
body('These reveal information Jesse needs before agreeing to anything. Ask at least the first four.', C.muted);
doc.moveDown(0.25);

const jesseQs = [
  ['"Who is the specific client you have in mind — and what\'s their actual AI governance problem?"', 'Forces specificity. Tells you if there\'s a real client or just a hypothesis.'],
  ['"What does Line Axia\'s fee structure look like for this engagement — and what portion goes to the technical partner?"', 'You must understand the economics before agreeing to any commercial term or exclusivity.'],
  ['"What does Tina Simpson\'s review look like — what does she need to see and when?"', 'Understand the legal gate and timeline before committing to a start date.'],
  ['"Has Line Axia done a technology pilot with an early-stage founder before — what made it work or not work?"', 'Due diligence on the partner, not just the deal.'],
  ['"If the pilot works — what does the next stage look like? Another fixed scope or an ongoing arrangement?"', 'Know the upside before trading away 12 months of EU market access.'],
  ['"What does \'managing the client relationship\' mean in practice? Can Line Axia make technical commitments without me?"', 'Critical. Must be answered before any agreement.'],
  ['"If I build something new during the exclusivity period that wasn\'t in the original scope — who decides the roadmap?"', 'Protects Jesse\'s ability to develop the product freely.'],
  ['"What keeps the exclusivity active — is there a minimum number of pilots or a revenue floor?"', 'No minimum = no accountability. There must be a floor.'],
  ['"What governing law are you proposing for the agreement?"', 'Don\'t leave this ambiguous.'],
  ['"Is there a cap on my liability exposure?"', 'Solo founder liability in an enterprise engagement needs a defined ceiling.'],
];

jesseQs.forEach(([q, why], i) => {
  safe(70);
  doc.moveDown(0.2);
  const y = doc.y;
  doc.rect(M, y, 3, 38).fill(C.teal);
  doc.fontSize(10).fillColor(C.navy).font('Helvetica-Bold').text(`${i + 1}.  ${q}`, M + 12, y, { width: TW - 12 });
  doc.fontSize(9).fillColor(C.muted).font('Helvetica').text(why, M + 12, doc.y + 2, { width: TW - 12 });
  doc.y += 14;
});

// ══════════════════════════════════════════════════════════════════════════
// SECTION C — RED FLAGS
// ══════════════════════════════════════════════════════════════════════════
newPage();
appBanner('C', 'Things Jesse Must Not Say');
body('Every one of these is either false, overstates what exists, or gives up negotiating ground.', C.muted);
doc.moveDown(0.2);

const redFlags = [
  '"VeraSeal is our first component…" — and then improvising a definition. VeraSeal does not exist.',
  '"We\'ve tested EU deployment" or "we\'ve deployed in European environments." Not yet.',
  '"The audit log is fully saved and persistent." It disappears when the server restarts.',
  '"A third-party security firm has reviewed this." They have not.',
  '"We\'re almost production-ready." There\'s a documented gap between pilot-ready and production-ready.',
  'Agreeing to any exclusivity terms on this call. Everything must be written first.',
  'Naming a compensation number before understanding Line Axia\'s fee structure.',
  '"I can build whatever you need during the pilot." Out-of-scope work is priced separately.',
  '"The evidence chain is cryptographically signed." It\'s hash-linked. Different thing.',
  '"We have other interested clients." Don\'t create false competitive pressure.',
  '"Governing law doesn\'t matter to me." It will matter in the agreement.',
  '"Line Axia can make technical commitments on my behalf." They cannot.',
  '"CerbaSeal is GDPR compliant" or "AI Act compliant." No compliance analysis has been done.',
  'Agreeing to open-ended support with no defined end date.',
];

redFlags.forEach((flag, i) => {
  safe(30);
  const y = doc.y;
  doc.rect(M, y, TW, 24).fill(i % 2 === 0 ? '#fef2f2' : C.bgRed);
  doc.rect(M, y, 3, 24).fill(C.red);
  doc.fontSize(10).fillColor(C.navy).font('Helvetica').text(flag, M + 14, y + 7, { width: TW - 20 });
  doc.y = y + 28;
});

// ══════════════════════════════════════════════════════════════════════════
// SECTION D — ONE LINERS
// ══════════════════════════════════════════════════════════════════════════
newPage();
appBanner('D', 'One Sentence Version');
body('Use these if you\'re nervous, get interrupted, or need to reset. One sentence per question.', C.muted);
doc.moveDown(0.3);

const oneLiners = [
  ['Q1 — Ready to deploy?',            '"The enforcement core is built and tested — 372 tests all passing — and the one remaining gap is saving the audit log persistently, which is a small, bounded fix."'],
  ['Q2 — EU without US servers?',      '"The software makes no external calls and has no geographic restrictions, so EU deployment is architecturally clear — the first actual deployment would happen as part of the pilot."'],
  ['Q3 — How much of your time?',      '"Week one is the most intensive at 10 to 15 hours; after that it\'s a 30-minute weekly call with written issue tracking and a system designed to explain itself without me."'],
  ['Q4 — Can you fit this in?',        '"Yes — this would be the first pilot client, there are no competing deployments, and the only pre-start item is a short fix for the audit log storage."'],
  ['Q5 — Third-party software?',       '"The enforcement library has zero external dependencies — nothing ships with it — and every licence in the project is MIT with no restrictions."'],
  ['Q6 — How to be paid?',             '"A fixed fee for a defined pilot makes the most sense, but I want to understand your fee structure first before I suggest a number."'],
  ['Q7 — Who does what?',              '"That division works as long as \'technical implementation\' is precisely defined and Line Axia can\'t make technical commitments on my behalf."'],
  ['Q8 — Who owns it?',                '"Lamont Labs owns all of it under a proprietary licence — no third-party IP in the enforcement library — and client evidence records belong to the client."'],
  ['Q9 — 12-month exclusivity?',       '"Worth discussing, but I need the specific terms defined — what activates it, what keeps it active, and what right of first refusal actually covers — before I can agree."'],
  ['Q10 — What do you need?',          '"Five things: written evidence ownership, a defined scope boundary, a clear liability limit, a fixed support period, and agreed governing law."'],
];

oneLiners.forEach(([label2, sentence]) => {
  safe(46);
  const y = doc.y;
  doc.rect(M, y, TW, 38).fill(C.bgGray);
  doc.rect(M, y, 3, 38).fill(C.blue);
  doc.fontSize(8).fillColor(C.blue).font('Helvetica-Bold').text(label2, M + 10, y + 6, { width: TW - 14 });
  doc.fontSize(9.5).fillColor(C.navy).font('Helvetica').text(sentence, M + 10, y + 18, { width: TW - 16, lineGap: 2.5 });
  doc.y = y + 44;
});

// ══════════════════════════════════════════════════════════════════════════
// SECTION E — RISK ASSESSMENT
// ══════════════════════════════════════════════════════════════════════════
newPage();
appBanner('E', 'How Risky Is Each Question?');
body('Scored by how likely each question is to cause a problem if Jesse isn\'t prepared.', C.muted);
doc.moveDown(0.3);

const risks = [
  { q: 'Q1 — Are you ready to deploy?', level: 'MEDIUM', color: C.amber,
    why: 'The software is real and the answer is strong. The only risk is the VeraSeal correction — if Jesse improvises a definition, he loses credibility immediately. Manageable with a prepared, honest answer.' },
  { q: 'Q2 — Can it run in Europe?', level: 'MEDIUM', color: C.amber,
    why: 'The architecture answer is clean. The risk is saying "it can do EU" without being clear that no EU deployment has actually happened yet. Prepare a specific timeline estimate for the first EU deployment.' },
  { q: 'Q3 — How much of your time?', level: 'LOW', color: C.green,
    why: 'Best-documented section in the whole project. The support model has written response times, a weekly rhythm, and a documented independence model. Very low risk if Jesse knows what\'s in the document.' },
  { q: 'Q4 — Can you fit this in?', level: 'LOW–MEDIUM', color: C.amber,
    why: 'Simple to answer. The risk is being pushed on the solo-founder question — what happens if Jesse is unavailable. The 48-hour model is documented; beyond that is an honest gap. Name it first.' },
  { q: 'Q5 — Third-party dependencies?', level: 'LOW', color: C.green,
    why: 'Zero runtime dependencies in the enforcement library is stronger than most enterprise software can claim. All licences are MIT. Very low risk — this is a good story to tell.' },
  { q: 'Q6 — How to be paid?', level: 'HIGH', color: C.red,
    why: 'No repository evidence. Jesse is negotiating live without knowing the deal size. Do not name a number first. Ask about Line Axia\'s fee structure, then respond.' },
  { q: 'Q7 — Who does what?', level: 'MEDIUM–HIGH', color: C.red,
    why: '"Technical implementation" is deliberately vague. If Jesse agrees without defining scope, he may end up obligated to build things CerbaSeal doesn\'t currently do. Push for a concrete example before agreeing.' },
  { q: 'Q8 — Who owns the technology?', level: 'LOW', color: C.green,
    why: 'Licence file is clear. Clean IP position. All original work, no third-party code in the library. Only risk: questions about patents or sublicensing. Know the answers before the call.' },
  { q: 'Q9 — 12-month exclusivity?', level: 'HIGH', color: C.red,
    why: 'Most commercially consequential question on the agenda. Exclusivity without a minimum commitment limits Jesse\'s EU market for a year with no guarantee of activity. Do not agree to anything on this call.' },
  { q: 'Q10 — What do you need?', level: 'MEDIUM', color: C.amber,
    why: 'Opportunity if Jesse is prepared. Risk if he\'s figuring it out live. All five requirements are documented. Jesse should be able to list them without hesitation.' },
];

risks.forEach(r => riskRow(r.q, r.level, r.color, r.why));

// ── FOOTERS ───────────────────────────────────────────────────────────────────
const total = doc.bufferedPageRange().count;
for (let i = 0; i < total; i++) {
  doc.switchToPage(i);
  if (i === 0) continue;
  doc.rect(0, PH - 18, PW, 18).fill(C.bgGray);
  doc.rect(0, PH - 18, PW, 0.75).fill(C.rule);
  doc.fontSize(7.5).fillColor(C.muted).font('Helvetica')
     .text(`CerbaSeal-Core v0.1.0  ·  Lamont Labs  ·  Line Axia Call Prep  ·  2026-06-04  ·  CONFIDENTIAL  ·  Page ${i + 1} of ${total}`,
           M, PH - 11, { width: TW, align: 'center' });
}

doc.end();
doc.on('end', () => console.log('Written:', OUT));
