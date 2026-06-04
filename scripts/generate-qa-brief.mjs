import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'docs/reports/LINE_AXIA_CALL_QA_BRIEF.pdf');
const doc = new PDFDocument({ margin: 0, size: 'LETTER', bufferPages: true });
doc.pipe(fs.createWriteStream(OUT));

const M = 54;
const PW = 612;
const PH = 792;
const TW = PW - M * 2;

function newPage() {
  doc.addPage({ margin: 0, size: 'LETTER' });
  doc.rect(0, 0, PW, 3).fill('#1d4ed8');
  doc.y = 30;
}
function safe(n = 80) { if (doc.y > PH - n) newPage(); }

function title(t) {
  doc.fontSize(16).fillColor('#0f172a').font('Helvetica-Bold').text(t, M, doc.y, { width: TW });
  doc.moveDown(0.3);
}
function sub(t) {
  doc.fontSize(10).fillColor('#64748b').font('Helvetica').text(t, M, doc.y, { width: TW });
  doc.moveDown(0.5);
}
function body(t, color = '#334155') {
  doc.fontSize(10.5).fillColor(color).font('Helvetica').text(t, M, doc.y, { width: TW, lineGap: 3 });
  doc.moveDown(0.3);
}
function bold(t, color = '#0f172a') {
  doc.fontSize(10.5).fillColor(color).font('Helvetica-Bold').text(t, M, doc.y, { width: TW });
  doc.moveDown(0.15);
}
function tag(t, color) {
  doc.fontSize(8).fillColor(color).font('Helvetica-Bold').text(t.toUpperCase(), M, doc.y, { width: TW });
  doc.moveDown(0.1);
}
function line() {
  doc.moveDown(0.3);
  doc.rect(M, doc.y, TW, 0.5).fill('#e2e8f0');
  doc.moveDown(0.4);
}
function flag(t) {
  safe(36);
  const y = doc.y;
  doc.rect(M, y, TW, 26).fill('#fef2f2');
  doc.rect(M, y, 3, 26).fill('#b91c1c');
  doc.fontSize(10).fillColor('#0f172a').font('Helvetica').text(t, M + 12, y + 7, { width: TW - 16 });
  doc.y = y + 30;
}
function good(t) {
  safe(36);
  const y = doc.y;
  doc.rect(M, y, TW, 26).fill('#f0fdf4');
  doc.rect(M, y, 3, 26).fill('#15803d');
  doc.fontSize(10).fillColor('#0f172a').font('Helvetica').text(t, M + 12, y + 7, { width: TW - 16 });
  doc.y = y + 30;
}
function warn(t) {
  safe(36);
  const y = doc.y;
  doc.rect(M, y, TW, 26).fill('#fffbeb');
  doc.rect(M, y, 3, 26).fill('#b45309');
  doc.fontSize(10).fillColor('#0f172a').font('Helvetica').text(t, M + 12, y + 7, { width: TW - 16 });
  doc.y = y + 30;
}

function q(num, question, riskLabel, riskColor, reallyAsking, answer, watchOut, oneliner) {
  newPage();
  // Header bar
  const y0 = doc.y;
  doc.rect(0, y0 - 4, PW, 38).fill('#0f172a');
  doc.rect(0, y0 - 4, 4, 38).fill(riskColor);
  doc.fontSize(9).fillColor(riskColor).font('Helvetica-Bold').text(`Q${num}`, M, y0 + 4, { width: 22 });
  doc.fontSize(12).fillColor('#ffffff').font('Helvetica-Bold').text(question, M + 26, y0 + 4, { width: TW - 130 });
  doc.fontSize(8.5).fillColor(riskColor).font('Helvetica-Bold').text(riskLabel, M + TW - 90, y0 + 10, { width: 90, align: 'right' });
  doc.y = y0 + 42;

  tag('What she\'s really asking', '#1d4ed8');
  body(reallyAsking);
  line();
  tag('Answer', '#15803d');
  body(answer);
  line();
  tag('Watch out', '#b45309');
  body(watchOut);
  line();
  tag('If she cuts you off — one sentence', '#64748b');
  body(oneliner, '#0f172a');
}

// ── COVER ─────────────────────────────────────────────────────────────────────
doc.rect(0, 0, PW, PH).fill('#0f172a');
doc.rect(0, 0, PW, 3).fill('#1d4ed8');
doc.fontSize(38).fillColor('#ffffff').font('Helvetica-Bold').text('Call Prep', M, 130, { width: TW });
doc.fontSize(38).fillColor('#1d4ed8').font('Helvetica-Bold').text('Line Axia', M, 172, { width: TW });
doc.fontSize(11).fillColor('#94a3b8').font('Helvetica').text('Olivia Aréchiga, CTO  ·  10 questions  ·  plain answers', M, 222, { width: TW });
doc.rect(M, 250, TW, 1).fill('#1d4ed8');

const items = [
  'Q1   Are you ready to deploy?',
  'Q2   Can it run in Europe?',
  'Q3   How much of your time does this take?',
  'Q4   Can you fit this in right now?',
  'Q5   Any third-party software to worry about?',
  'Q6   How do you want to be paid?',
  'Q7   Who does what in this deal?',
  'Q8   Who owns the technology?',
  'Q9   Is 12-month exclusivity fair?',
  'Q10  What do you need before saying yes?',
  '',
  'A    Hard follow-up questions she might ask',
  'B    Questions Jesse should ask',
  'C    Things NOT to say',
  'D    Risk scores',
];
items.forEach((item, i) => {
  if (!item) { doc.y = 262 + i * 22 + 4; return; }
  const isQ = item.startsWith('Q');
  doc.fontSize(9.5).fillColor(isQ ? '#ffffff' : '#94a3b8').font('Helvetica').text(item, M, 262 + i * 22, { width: TW });
});

doc.fontSize(7.5).fillColor('#475569').font('Helvetica')
   .text('CerbaSeal-Core v0.1.0  ·  Lamont Labs  ·  Confidential  ·  2026-06-04', M, PH - 18, { width: TW, align: 'center' });

// ══════════════════════════════════════════════════════════════════════════════
q(1,
  'Are you ready to deploy?',
  'MEDIUM RISK', '#b45309',

  'Is this real software or just a demo — and how long until it\'s in front of a real client?',

  'The software works. 372 tests pass. 15 separate checks all pass. There\'s a live demo she can look at right now.\n\nTwo things not done yet: the audit log disappears if the server restarts (fix needed before any pilot), and no real deployment has happened outside the demo.\n\nPilot-ready means: one client, one use case, no live decisions, written agreement before any real data.',

  'She may say "VeraSeal." That word does not exist anywhere in the codebase. Say: "You might be thinking of CerbaSeal — that\'s the system." Then move on. Do not invent a definition.',

  '"The core software works and is tested — the only gap before a pilot is saving the audit log, which is a small fix."'
);

// ──────────────────────────────────────────────────────────────────────────────
q(2,
  'Can it run in Europe without US servers?',
  'MEDIUM RISK', '#b45309',

  'For EU clients, data leaving Europe is a legal problem, not just a preference. She needs to know if this is already solved.',

  'The software makes zero calls to any outside service. No cloud. No APIs. No data leaves wherever you install it. It would run in a European data centre exactly as it runs anywhere else.\n\nThat said — no actual EU deployment has happened yet. The first one would happen as part of a pilot, with the client controlling their own hosting.',

  'Don\'t say "it works in EU" — say "it\'s designed to work in EU, and the first deployment would happen as part of the pilot." Those are different claims.',

  '"The software makes no external calls and works wherever Node.js runs — the first EU deployment would be the pilot itself."'
);

// ──────────────────────────────────────────────────────────────────────────────
q(3,
  'How much of your time does this take?',
  'LOW RISK', '#15803d',

  'Is the client dependent on Jesse being around all the time? What if he\'s unavailable?',

  'Week 1 is the heaviest: about 10–15 hours. Setup, deployment, documents, one 60-minute call.\n\nAfter that: a 30-minute call each week, issue tracking, email responses.\n\nResponse times are written down: urgent issues same day, rule problems within 24 hours, general questions within 3 days.\n\nThe system explains itself — every blocked action gives a reason in plain English. It\'s designed to run without Jesse once it\'s set up.',

  'One person. No backup engineer. Honest about that: up to 48 hours without Jesse, everything still runs. Beyond 48 hours, there\'s no formal plan. Name this before she brings it up.',

  '"Week one is about 10–15 hours from me, then 3–5 hours a week after that, with written response times for anything that comes up."'
);

// ──────────────────────────────────────────────────────────────────────────────
q(4,
  'Can you actually fit this in right now?',
  'LOW–MEDIUM RISK', '#b45309',

  'Are there competing projects? Is there a better time to start?',

  'No other active pilots. This would be the first.\n\nTime needed: 10–15 hours in week one, 3–5 hours a week after that.\n\nOne thing to factor in: the audit log fix needs to happen before the pilot starts. That\'s about 2–5 days of work. It goes into the start timeline.\n\n[Jesse adds any specific scheduling notes here.]',

  'Don\'t imply unlimited capacity. One person, real constraints.',

  '"No competing pilots — this is the first — and the only pre-start item is a short fix that goes into the timeline."'
);

// ──────────────────────────────────────────────────────────────────────────────
q(5,
  'Any third-party software to worry about?',
  'LOW RISK', '#15803d',

  'Does CerbaSeal bring in outside software that could create licence problems or security concerns for EU clients?',

  'The enforcement library — the thing a client actually installs — has zero external packages. Nothing comes with it. A security team reviewing it only needs to look at Node.js and CerbaSeal\'s own code.\n\nThe demo site uses one package called tsx (MIT licence). That\'s only in the demo, not in anything a client installs.\n\nEvery licence in the project is MIT. No restrictions, no obligations, no copyleft.',

  'Be precise: zero dependencies in the library. One package in the demo. These are different things.',

  '"The enforcement library has zero external packages — nothing ships with it — and every licence in the project is MIT."'
);

// ──────────────────────────────────────────────────────────────────────────────
q(6,
  'How do you want to be paid?',
  'HIGH RISK', '#b91c1c',

  'Has Jesse thought about this seriously? Does his model create awkward incentives?',

  'A fixed fee for a defined pilot is the cleanest model. The scope is written down. Both sides know exactly what they\'re paying for.\n\nAnything outside the agreed scope gets priced separately.\n\nDo not anchor a number before knowing what Line Axia is making on this deal.',

  'If the advisory partner is keeping most of the commercial fee, Jesse needs to know that before agreeing to anything. Ask about their structure first.',

  '"A fixed fee for a defined scope — I just want to understand your fee structure first so the numbers line up."'
);

// ──────────────────────────────────────────────────────────────────────────────
q(7,
  'Who does what in this deal?',
  'MEDIUM–HIGH RISK', '#b45309',

  'She\'s proposing: Line Axia handles the client, regulations, commercial. Lamont Labs builds and runs the technology. Does that work?',

  'Broadly yes — but "technical implementation" needs a real definition.\n\nWhat Lamont Labs does: delivers and runs CerbaSeal, tracks issues, produces documents, owns the code.\n\nWhat Lamont Labs does NOT do: legal or compliance opinions, plugging into client\'s existing systems, managing the client relationship, making commitments when Jesse isn\'t in the room.',

  'Line Axia cannot make technical commitments on Jesse\'s behalf. Any technical scope goes through Jesse. This must be in writing.',

  '"That works, as long as we define exactly what \'technical implementation\' includes and who can make technical commitments."'
);

// ──────────────────────────────────────────────────────────────────────────────
q(8,
  'Who owns the technology?',
  'LOW RISK', '#15803d',

  'Are there hidden complications — shared ownership, open-source obligations, anything that could cause problems?',

  'Lamont Labs owns all of it. The licence in the repository is proprietary — looking at it or using the demo doesn\'t give anyone any rights.\n\nNo third-party code in the enforcement library. All original work. No obligations.\n\nAudit records produced during a pilot belong to the client. Lamont Labs keeps no access to client data after the engagement ends.',

  'One thing to settle in the agreement: who owns custom configuration built specifically for a client? The core technology is Lamont Labs\'. Client-specific setup needs a clear answer.',

  '"Lamont Labs owns the technology outright — proprietary licence, no third-party IP, and client evidence records go to the client."'
);

// ──────────────────────────────────────────────────────────────────────────────
q(9,
  'Is 12-month exclusivity fair?',
  'HIGH RISK', '#b91c1c',

  'She wants to lock down CerbaSeal in the EU market before anyone else gets access. She\'s also testing whether Jesse will just say yes.',

  'Exclusivity is worth discussing. But "12-month EU exclusivity" needs real answers before Jesse agrees:\n\n· What counts as EU? France? All 27 countries?\n· What starts the clock? The agreement? The first pilot?\n· What keeps it active? A minimum number of pilots? A revenue floor?\n· What\'s the right of first refusal actually on?\n\nCerbaSeal works and is tested. Exclusivity has value to Line Axia. That value should show up somewhere in the deal.',

  'Do not agree to anything on this call. "That sounds like a reasonable starting point" is fine. "Yes, agreed" is not. No minimum activity clause = Jesse can\'t develop the EU market for a year even if nothing happens.',

  '"Exclusivity is worth exploring — I just need the specific terms defined before I can agree to anything."'
);

// ──────────────────────────────────────────────────────────────────────────────
q(10,
  'What do you need before saying yes?',
  'MEDIUM RISK', '#b45309',

  'She\'s asking Jesse to reveal his priorities before negotiation starts. Prepared answer = confidence. Unprepared = weakness.',

  'Five things. All documented:\n\n1. Who owns the evidence — client keeps everything, Lamont Labs keeps nothing.\n2. Written scope — exactly what\'s in and what\'s out, with a process for anything extra.\n3. Liability limit — CerbaSeal sits before decisions are made, not responsible for what happens after.\n4. Defined support period — start date, end date, what support covers.\n5. Agreed governing law — which country\'s law applies.',

  'Know the one thing that would make Jesse walk away from this deal before the call starts.',

  '"Five things in writing: evidence ownership, scope boundary, liability limit, support period, and governing law."'
);

// ══════════════════════════════════════════════════════════════════════════════
// SECTION A
// ══════════════════════════════════════════════════════════════════════════════
newPage();
title('Section A — Hard Follow-Up Questions');
sub('Questions Olivia might ask after the 10 main ones. Know these before the call.');

const followUps = [
  ['"Can you show it running on our servers, not your demo?"', 'Not yet. The pilot would be the first real deployment outside the demo.'],
  ['"What happens to the audit log if the server restarts?"', 'Right now it\'s lost. Fixing this is the first thing before any pilot starts.'],
  ['"Has anyone outside your team reviewed the security?"', 'No external firm has reviewed it. The security brief is honest about every limitation.'],
  ['"Does it actually understand the policy documents it references?"', 'No — it checks a reference exists. Understanding the content happens upstream.'],
  ['"Could the audit trail be faked?"', 'It\'s hash-linked, which proves nothing changed. Cryptographic signing is a future item.'],
  ['"What\'s your GDPR analysis?"', 'Not done. Legal review must happen before any real data is involved.'],
  ['"What if it sees a request type it doesn\'t recognise?"', 'It blocks it. The system always fails closed — never lets something through when unsure.'],
  ['"What does a failed pilot look like?"', 'Findings report, everything returned to client, fees as agreed upfront.'],
  ['"What\'s your day rate?"', 'Jesse answers. Know the number before the call.'],
  ['"Could we buy CerbaSeal after 12 months?"', 'Separate conversation. Don\'t answer live.'],
  ['"Are you talking to other advisory partners?"', 'Jesse answers. Know your position.'],
  ['"Have you spoken with EU regulators about the AI Act?"', 'No. CerbaSeal supports audit requirements. No regulatory conversations have occurred.'],
  ['"Is this evidence admissible in a French court?"', 'That requires a legal opinion. The evidence is consistent and documented — admissibility depends on jurisdiction.'],
];

followUps.forEach(([q2, a]) => {
  safe(44);
  const y = doc.y;
  doc.fontSize(10).fillColor('#0f172a').font('Helvetica-Bold').text(q2, M, y, { width: TW });
  doc.fontSize(10).fillColor('#64748b').font('Helvetica').text('→  ' + a, M + 8, doc.y + 12, { width: TW - 8, lineGap: 2.5 });
  doc.y += 24;
});

// ══════════════════════════════════════════════════════════════════════════════
// SECTION B
// ══════════════════════════════════════════════════════════════════════════════
newPage();
title('Section B — Questions Jesse Should Ask');
sub('Ask at least the first three. These reveal what Jesse needs to know before agreeing to anything.');

const jQs = [
  ['"Who is the specific client — and what\'s their actual problem?"', 'Tells you if there\'s a real client or just a hypothesis.'],
  ['"What\'s Line Axia\'s fee structure — and what does the technical partner typically receive?"', 'Must know the economics before agreeing to any commercial term.'],
  ['"What does Tina Simpson\'s review process look like and when does it happen?"', 'Understand the legal gate before committing to a timeline.'],
  ['"Has Line Axia done a pilot with an early-stage founder before?"', 'Due diligence on the partner.'],
  ['"If the pilot works — what\'s the next stage?"', 'Know the upside before trading 12 months of EU market access.'],
  ['"Can Line Axia make technical commitments without me in the room?"', 'Must be no. Every technical scope goes through Jesse.'],
  ['"What minimum activity keeps the exclusivity active?"', 'No floor = no accountability.'],
  ['"What governing law are you proposing?"', 'Don\'t leave this open.'],
  ['"Is there a cap on my liability?"', 'Solo founder in an enterprise deal needs a ceiling.'],
];

jQs.forEach(([q2, why], i) => {
  safe(52);
  doc.moveDown(0.15);
  const y = doc.y;
  doc.rect(M, y, 3, 36).fill('#0f766e');
  doc.fontSize(10).fillColor('#0f172a').font('Helvetica-Bold').text(`${i + 1}.  ${q2}`, M + 12, y, { width: TW - 12 });
  doc.fontSize(9.5).fillColor('#64748b').font('Helvetica').text(why, M + 12, doc.y + 2, { width: TW - 12 });
  doc.y += 12;
});

// ══════════════════════════════════════════════════════════════════════════════
// SECTION C
// ══════════════════════════════════════════════════════════════════════════════
newPage();
title('Section C — Things NOT to Say');
sub('Every one of these is false, overstates what exists, or gives up negotiating ground.');
doc.moveDown(0.2);

const redFlags = [
  '"VeraSeal is our first component…" — that word does not exist in the codebase.',
  '"We\'ve already deployed in European environments." — not yet.',
  '"The audit log is fully saved and persistent." — it disappears on restart.',
  '"A third-party security firm has reviewed this." — they have not.',
  '"We\'re almost production-ready." — there\'s a documented gap.',
  'Agreeing to exclusivity terms on this call.',
  'Naming a compensation number before knowing Line Axia\'s fee structure.',
  '"I can build whatever you need during the pilot." — out-of-scope work is priced separately.',
  '"The evidence chain is cryptographically signed." — it\'s hash-linked. Different thing.',
  '"We have other interested clients." — don\'t create false pressure.',
  '"CerbaSeal is GDPR or AI Act compliant." — no compliance analysis has been done.',
  'Open-ended support with no defined end date.',
];

redFlags.forEach(f => flag(f));

// ══════════════════════════════════════════════════════════════════════════════
// SECTION D
// ══════════════════════════════════════════════════════════════════════════════
newPage();
title('Section D — Risk Scores');
sub('How prepared does Jesse need to be for each question?');
doc.moveDown(0.2);

const risks = [
  ['Q1  Ready to deploy?',               'MEDIUM', '#b45309', 'The VeraSeal correction is the only real trap. Answer honestly about the audit log gap and it\'s fine.'],
  ['Q2  Can it run in Europe?',           'MEDIUM', '#b45309', 'Architecture is clean. Just be precise: designed for EU ≠ deployed in EU yet.'],
  ['Q3  How much of your time?',          'LOW',    '#15803d', 'Fully documented. Know what\'s in the support model and this is easy.'],
  ['Q4  Can you fit this in?',            'LOW',    '#15803d', 'Simple. Just be honest about being one person.'],
  ['Q5  Third-party software?',           'LOW',    '#15803d', 'Zero dependencies in the library. Good story. Low risk.'],
  ['Q6  How to be paid?',                 'HIGH',   '#b91c1c', 'No number before knowing their fee structure. Highest risk of the call.'],
  ['Q7  Who does what?',                  'MEDIUM', '#b45309', 'Risk is agreeing to vague scope. Push for a specific example before saying yes.'],
  ['Q8  Who owns the technology?',        'LOW',    '#15803d', 'Clean position. Licence is clear.'],
  ['Q9  12-month exclusivity?',           'HIGH',   '#b91c1c', 'Most consequential question. Do not agree on the call. No minimum clause = bad deal.'],
  ['Q10 What do you need?',              'MEDIUM', '#b45309', 'Opportunity if prepared. The five requirements are documented — name them without hesitation.'],
];

risks.forEach(([q2, level, color, why]) => {
  safe(54);
  const y = doc.y;
  const h = Math.max(46, Math.ceil(why.length / 82) * 14 + 24);
  doc.rect(M, y, TW, h).fill('#f8fafc');
  doc.rect(M, y, 3, h).fill(color);
  doc.fontSize(10).fillColor('#0f172a').font('Helvetica-Bold').text(q2, M + 10, y + 8, { width: TW - 110 });
  const rbg = color === '#15803d' ? '#f0fdf4' : color === '#b91c1c' ? '#fef2f2' : '#fffbeb';
  doc.rect(M + TW - 90, y + 6, 82, 16).fill(rbg);
  doc.fontSize(8).fillColor(color).font('Helvetica-Bold').text(level, M + TW - 86, y + 10, { width: 78, align: 'center' });
  doc.fontSize(9.5).fillColor('#334155').font('Helvetica').text(why, M + 10, y + 24, { width: TW - 16, lineGap: 2.5 });
  doc.y = y + h + 8;
});

// ── FOOTERS ───────────────────────────────────────────────────────────────────
const total = doc.bufferedPageRange().count;
for (let i = 0; i < total; i++) {
  doc.switchToPage(i);
  if (i === 0) continue;
  doc.rect(0, PH - 16, PW, 16).fill('#f8fafc');
  doc.rect(0, PH - 16, PW, 0.5).fill('#e2e8f0');
  doc.fontSize(7.5).fillColor('#94a3b8').font('Helvetica')
     .text(`CerbaSeal v0.1.0  ·  Lamont Labs  ·  Confidential  ·  2026-06-04  ·  Page ${i + 1} of ${total}`,
           M, PH - 10, { width: TW, align: 'center' });
}

doc.end();
doc.on('end', () => console.log('Written:', OUT));
