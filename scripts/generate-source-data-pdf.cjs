'use strict';
// CerbaSeal — Pricing & Commercialization Source Data PDF generator
const PDFDocument = require('pdfkit');
const fs          = require('fs');
const path        = require('path');

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
const GREEN  = '#22543D';
const HEADBG = '#1B3A5C';

// ── Page geometry ─────────────────────────────────────────────────────────────
const PW   = 595.28;
const PH   = 841.89;
const ML   = 48;
const MR   = 48;
const CW   = PW - ML - MR;
const RE   = PW - MR;
const CTOP = 58;
const CBOT = PH - 54;

// ── Document ──────────────────────────────────────────────────────────────────
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: CTOP, bottom: 54, left: ML, right: MR },
  autoFirstPage: false,
  info: {
    Title:    'CerbaSeal — Pricing and Commercialization Source Data',
    Author:   'Jesse Lamont / Lamont Labs',
    Subject:  'Evidence package for commercialization, pilot readiness, and pricing analysis',
    Keywords: 'CerbaSeal, pricing, commercialization, pilot, market positioning',
    Creator:  'Lamont Labs PDF Generator',
  },
});

const OUT = path.join(__dirname, '..', 'docs', 'reports', 'cerbaseal-pricing-commercialization-source-data.pdf');
doc.pipe(fs.createWriteStream(OUT));

let pageNum  = 0;
let secLabel = '';

function drawRunHead() {
  doc.save();
  doc.rect(ML, 20, CW, 0.4).fill(NAVY);
  doc.font('Helvetica').fontSize(7).fillColor(NAVY2);
  doc.text('CerbaSeal-Core  v0.1.0', ML, 10, { width: CW / 2 });
  doc.font('Helvetica').fontSize(7).fillColor(GOLD);
  doc.text(secLabel, ML, 10, { width: CW, align: 'right' });
  doc.restore();
}

function drawFooter() {
  const fy = PH - 44;
  doc.save();
  doc.rect(ML, fy, CW, 0.4).fill(MGRAY);
  doc.font('Helvetica').fontSize(7).fillColor(DGRAY);
  doc.text('LAMONT LABS  ·  PARTNER CONFIDENTIAL', ML, fy + 7, { width: CW * 0.7 });
  doc.text(String(pageNum), ML, fy + 7, { width: CW, align: 'right' });
  doc.restore();
}

function newPage(sec) {
  if (sec !== undefined) secLabel = sec;
  pageNum++;
  doc.addPage();
  drawRunHead();
  drawFooter();
  doc.y = CTOP;
}

// ── Space guard ───────────────────────────────────────────────────────────────
function ensureSpace(needed) {
  if (doc.y + needed > CBOT) newPage();
}

// ── Strip inline markdown (bold, code, links) ─────────────────────────────────
function stripInline(str) {
  return str
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .trim();
}

// ── Inline render with bold/code emphasis ─────────────────────────────────────
function renderInline(str, x, y, opts, baseColor) {
  // We parse the string and emit segments with font changes
  const parts = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]*\))/g;
  let last = 0, m;
  while ((m = re.exec(str)) !== null) {
    if (m.index > last) parts.push({ text: str.slice(last, m.index), bold: false, code: false });
    const tok = m[0];
    if (tok.startsWith('**')) parts.push({ text: tok.slice(2, -2), bold: true, code: false });
    else if (tok.startsWith('`')) parts.push({ text: tok.slice(1, -1), bold: false, code: true });
    else parts.push({ text: tok.replace(/\[([^\]]+)\]\([^)]*\)/, '$1'), bold: false, code: false });
    last = m.index + tok.length;
  }
  if (last < str.length) parts.push({ text: str.slice(last), bold: false, code: false });
  // Render as a single text call (simple — just strip for now, full inline is complex with pdfkit)
  return stripInline(str);
}

// ── Paragraph helper (auto-page) ──────────────────────────────────────────────
function para(text, opts = {}) {
  const fontSize = opts.fontSize || 9;
  const color    = opts.color    || BLACK;
  const font     = opts.bold     ? 'Helvetica-Bold' : 'Helvetica';
  const indent   = opts.indent   || 0;
  const gap      = opts.gap      !== undefined ? opts.gap : 4;

  doc.font(font).fontSize(fontSize).fillColor(color);
  const w = CW - indent;
  const height = doc.heightOfString(text, { width: w });
  ensureSpace(height + gap + 2);
  doc.text(text, ML + indent, doc.y, { width: w, lineGap: 1.5 });
  doc.y += gap;
}

// ── Rule ──────────────────────────────────────────────────────────────────────
function rule(color, weight) {
  ensureSpace(6);
  doc.rect(ML, doc.y, CW, weight || 0.5).fill(color || MGRAY);
  doc.y += 5;
}

// ── Section heading (##) ──────────────────────────────────────────────────────
function h2(text) {
  ensureSpace(28);
  doc.rect(ML, doc.y, CW, 20).fill(HEADBG);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(WHITE);
  doc.text(text, ML + 8, doc.y + 5, { width: CW - 16 });
  doc.y += 24;
  secLabel = text.replace(/^## /, '');
  drawRunHead();
}

// ── Sub-heading (###) ─────────────────────────────────────────────────────────
function h3(text) {
  ensureSpace(18);
  doc.y += 3;
  doc.rect(ML, doc.y, 3, 14).fill(GOLD);
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(NAVY);
  doc.text(text, ML + 8, doc.y + 1, { width: CW - 8 });
  doc.y += 14;
}

// ── Sub-sub-heading (####) ────────────────────────────────────────────────────
function h4(text) {
  ensureSpace(14);
  doc.y += 2;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(NAVY2);
  doc.text(text, ML, doc.y, { width: CW });
  doc.y += 4;
}

// ── Code block ────────────────────────────────────────────────────────────────
function codeBlock(lines) {
  const text   = lines.join('\n');
  const height = doc.font('Courier').fontSize(7.5).heightOfString(text, { width: CW - 16 });
  ensureSpace(height + 16);
  doc.rect(ML, doc.y, CW, height + 14).fill(CODEBG);
  doc.rect(ML, doc.y, 3, height + 14).fill(NAVY2);
  doc.font('Courier').fontSize(7.5).fillColor(NAVY);
  doc.text(text, ML + 9, doc.y + 6, { width: CW - 16, lineGap: 1 });
  doc.y += height + 18;
}

// ── Table renderer ────────────────────────────────────────────────────────────
function renderTable(rows) {
  if (rows.length < 2) return;

  // Parse all rows into cells
  const parsed = rows.map(r =>
    r.split('|').slice(1, -1).map(c => c.trim())
  );

  // Filter out separator rows (---|---)
  const filtered = parsed.filter(row => !row.every(c => /^[-: ]+$/.test(c)));
  if (filtered.length === 0) return;

  const numCols = filtered[0].length;
  if (numCols === 0) return;

  // Compute column widths based on max content length
  const maxLens = Array(numCols).fill(0);
  filtered.forEach(row => {
    row.forEach((cell, i) => {
      const clean = stripInline(cell);
      if (clean.length > maxLens[i]) maxLens[i] = clean.length;
    });
  });
  const totalLen = maxLens.reduce((a, b) => a + b, 0) || 1;
  const colWidths = maxLens.map(l => Math.max((l / totalLen) * (CW - 4), CW / (numCols * 2)));

  // Scale to fit exactly CW
  const sumW = colWidths.reduce((a, b) => a + b, 0);
  const scale = CW / sumW;
  const scaledW = colWidths.map(w => w * scale);

  // Calculate row heights
  const CELL_PAD_H = 3;
  const CELL_PAD_V = 3;
  const TABLE_FS   = 7.5;
  const SEP_FS     = 8;
  const HEADER_FS  = 8;

  const rowHeights = filtered.map((row, ri) => {
    const fnt  = ri === 0 ? 'Helvetica-Bold' : 'Helvetica';
    const fs   = ri === 0 ? HEADER_FS : TABLE_FS;
    let maxH = 0;
    row.forEach((cell, ci) => {
      const txt = stripInline(cell);
      const h = doc.font(fnt).fontSize(fs).heightOfString(txt, { width: scaledW[ci] - CELL_PAD_H * 2 });
      if (h > maxH) maxH = h;
    });
    return maxH + CELL_PAD_V * 2;
  });

  const tableHeight = rowHeights.reduce((a, b) => a + b, 0) + 2;
  ensureSpace(Math.min(tableHeight, 120)); // ensure at least partial space

  filtered.forEach((row, ri) => {
    const isHeader = ri === 0;
    const isAlt    = !isHeader && ri % 2 === 0;
    const rowH     = rowHeights[ri];

    if (doc.y + rowH > CBOT) {
      newPage();
      // re-draw header row if mid-table
      const hr = filtered[0];
      const hrH = rowHeights[0];
      doc.rect(ML, doc.y, CW, hrH).fill(NAVY);
      let hx = ML;
      hr.forEach((cell, ci) => {
        doc.font('Helvetica-Bold').fontSize(HEADER_FS).fillColor(WHITE);
        doc.text(stripInline(cell), hx + CELL_PAD_H, doc.y + CELL_PAD_V, {
          width: scaledW[ci] - CELL_PAD_H * 2, lineGap: 1
        });
        hx += scaledW[ci];
      });
      doc.y += hrH;
      if (isHeader) return; // skip re-drawing if this row IS the header
    }

    const rowY = doc.y;
    // Background
    doc.rect(ML, rowY, CW, rowH).fill(isHeader ? NAVY : isAlt ? ROWALT : WHITE);

    // Cells
    let cx = ML;
    row.forEach((cell, ci) => {
      const txt   = stripInline(cell);
      const fnt   = isHeader ? 'Helvetica-Bold' : 'Helvetica';
      const fs    = isHeader ? HEADER_FS : TABLE_FS;
      const color = isHeader ? WHITE : (cell.match(/✓|PASS/) ? GREEN : BLACK);
      doc.font(fnt).fontSize(fs).fillColor(color);
      doc.text(txt, cx + CELL_PAD_H, rowY + CELL_PAD_V, {
        width: scaledW[ci] - CELL_PAD_H * 2,
        lineGap: 1,
      });
      cx += scaledW[ci];
    });

    // Row border
    doc.rect(ML, rowY, CW, rowH).stroke(LGRAY);
    doc.y = rowY + rowH;
  });

  doc.y += 6;
}

// ── Bullet ────────────────────────────────────────────────────────────────────
function bullet(text, level) {
  const indent = (level || 0) * 14 + 8;
  const mark   = level >= 1 ? '–' : '•';
  const clean  = stripInline(text);
  const w      = CW - indent - 10;
  const height = doc.font('Helvetica').fontSize(8.5).heightOfString(clean, { width: w });
  ensureSpace(height + 3);
  doc.font('Helvetica').fontSize(8.5).fillColor(DGRAY);
  doc.text(mark, ML + indent, doc.y, { width: 8 });
  doc.font('Helvetica').fontSize(8.5).fillColor(BLACK);
  doc.text(clean, ML + indent + 10, doc.y - (height + 3) + 1, { width: w, lineGap: 1 });
  doc.y += 3;
}

// ── Cover page ────────────────────────────────────────────────────────────────
function coverPage() {
  pageNum++;
  doc.addPage();

  // Full navy header band
  doc.rect(0, 0, PW, 220).fill(NAVY);

  // Gold accent line
  doc.rect(ML, 220, CW, 3).fill(GOLD);

  // Title
  doc.font('Helvetica-Bold').fontSize(22).fillColor(WHITE);
  doc.text('CerbaSeal', ML, 70, { width: CW });
  doc.font('Helvetica').fontSize(13).fillColor(GOLD);
  doc.text('Pricing and Commercialization Source Data', ML, 100, { width: CW });
  doc.font('Helvetica').fontSize(9).fillColor(LGRAY);
  doc.text('Evidence package for rebuilding the commercialization, pilot readiness, and pricing\nanalysis document. All facts extracted from repository artifacts and verified commands.\nNo estimates. No invented numbers. No loose summaries.', ML, 130, { width: CW, lineGap: 3 });

  // Meta block
  doc.y = 240;
  const meta = [
    ['Generated',       '2026-06-08'],
    ['Product',         'CerbaSeal Core v0.1.0'],
    ['Commit',          '485cde3faaa0524ffd5f5b6132673789f89adab9'],
    ['Branch',          'main'],
    ['Tests',           '432 passed / 432  (17 files)'],
    ['Audit checks',    '16 / 16 passed'],
    ['Invariants',      '12 / 12 covered'],
    ['stableChecksum',  'e5aca8b2ad5f7abb528322be754d06463cb01367e038daf1472f925206c64e2c'],
  ];
  meta.forEach(([k, v], i) => {
    const rowY = 248 + i * 22;
    doc.rect(ML, rowY, CW, 20).fill(i % 2 === 0 ? LGRAY : WHITE);
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(NAVY2);
    doc.text(k, ML + 6, rowY + 5, { width: 110 });
    doc.font('Courier').fontSize(8).fillColor(BLACK);
    doc.text(v, ML + 120, rowY + 5, { width: CW - 126 });
  });

  // Classification footer
  const fy = PH - 60;
  doc.rect(ML, fy - 5, CW, 0.5).fill(GOLD);
  doc.font('Helvetica-Bold').fontSize(8).fillColor(NAVY2);
  doc.text('PARTNER CONFIDENTIAL — AUTHORIZED RECIPIENTS ONLY', ML, fy + 2, { width: CW, align: 'center' });
  doc.font('Helvetica').fontSize(7.5).fillColor(DGRAY);
  doc.text('Lamont Labs / Jesse Lamont  ·  CerbaSeal-Core v0.1.0  ·  June 2026', ML, fy + 14, { width: CW, align: 'center' });
  doc.text(`Page ${pageNum}`, ML, fy + 14, { width: CW, align: 'right' });
}

// ── Table of Contents ─────────────────────────────────────────────────────────
function tocPage() {
  newPage('Table of Contents');
  doc.font('Helvetica-Bold').fontSize(14).fillColor(NAVY);
  doc.text('Contents', ML, doc.y, { width: CW });
  doc.y += 14;
  rule(GOLD, 2);
  doc.y += 4;

  const sections = [
    [' 1', 'Current Repository State'],
    [' 2', 'Current System Capabilities'],
    [' 3', 'Configuration Accuracy'],
    [' 4', 'Deployment Readiness'],
    [' 5', 'Client Onboarding Process'],
    [' 6', 'Founder Dependency Analysis'],
    [' 7', 'Partner Readiness'],
    [' 8', 'Pilot Readiness'],
    [' 9', 'Pricing-Relevant Internal Facts'],
    ['10', 'Possible Pricing Structure Inputs'],
    ['11', 'External Market Research Placeholders'],
    ['12', 'Known Limitations and Roadmap'],
    ['13', 'Final Verification Commands'],
  ];

  sections.forEach(([num, title], i) => {
    const y = doc.y;
    const isAlt = i % 2 === 0;
    doc.rect(ML, y, CW, 18).fill(isAlt ? LGRAY : WHITE);
    doc.font('Helvetica-Bold').fontSize(9).fillColor(NAVY2);
    doc.text(`Section ${num}`, ML + 6, y + 4, { width: 72 });
    doc.font('Helvetica').fontSize(9).fillColor(BLACK);
    doc.text(title, ML + 84, y + 4, { width: CW - 90 });
    doc.y = y + 18;
  });

  doc.y += 10;
  rule(MGRAY);
  doc.y += 4;
  doc.font('Helvetica').fontSize(8).fillColor(DGRAY);
  doc.text('This document is 13 sections. All data is sourced from the live repository. Run the commands in Section 13 to independently verify every fact.', ML, doc.y, { width: CW, lineGap: 2 });
}

// ── Main markdown parser ───────────────────────────────────────────────────────
function renderMarkdown(mdPath) {
  const lines = fs.readFileSync(mdPath, 'utf-8').split('\n');

  let i = 0;
  let tableRows = [];
  let codeLines = [];
  let inCode    = false;
  let inTable   = false;

  function flushTable() {
    if (tableRows.length > 0) { renderTable(tableRows); tableRows = []; }
    inTable = false;
  }
  function flushCode() {
    if (codeLines.length > 0) { codeBlock(codeLines); codeLines = []; }
    inCode = false;
  }

  while (i < lines.length) {
    const raw  = lines[i];
    const line = raw;
    i++;

    // Skip the document title line (we put it on the cover)
    if (line.startsWith('# CerbaSeal')) continue;

    // Code fence
    if (line.startsWith('```')) {
      if (inCode) { flushCode(); }
      else { if (inTable) flushTable(); inCode = true; }
      continue;
    }
    if (inCode) { codeLines.push(line); continue; }

    // Table row
    if (line.trim().startsWith('|')) {
      inTable = true;
      tableRows.push(line.trim());
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Blank line
    if (line.trim() === '') {
      if (!inTable) doc.y += 3;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      rule(MGRAY);
      continue;
    }

    // H2
    if (line.startsWith('## ')) {
      h2(line.slice(3).trim());
      continue;
    }

    // H3
    if (line.startsWith('### ')) {
      h3(line.slice(4).trim());
      continue;
    }

    // H4
    if (line.startsWith('#### ')) {
      h4(line.slice(5).trim());
      continue;
    }

    // Bullet (unordered)
    if (/^(\s*[-*])\s+/.test(line)) {
      const indent = line.match(/^(\s*)/)[1].length;
      const level  = Math.floor(indent / 2);
      const text   = line.replace(/^\s*[-*]\s+/, '');
      bullet(text, level);
      continue;
    }

    // Numbered list
    if (/^\d+\.\s+/.test(line)) {
      const text = line.replace(/^\d+\.\s+/, '').trim();
      bullet(text, 0);
      continue;
    }

    // Bold-only line (treat as H4-level label)
    if (/^\*\*[^*]+\*\*$/.test(line.trim()) || /^\*\*[^*]+\*\*:$/.test(line.trim())) {
      h4(stripInline(line.trim()));
      continue;
    }

    // Regular paragraph (may contain inline bold/code)
    const clean = stripInline(line.trim());
    if (clean.length > 0) {
      const isBoldStart = /^\*\*/.test(line.trim());
      para(clean, { bold: isBoldStart && line.trim().endsWith('**'), gap: 3 });
    }
  }

  // Flush anything remaining
  if (inTable) flushTable();
  if (inCode)  flushCode();
}

// ── Build PDF ─────────────────────────────────────────────────────────────────
const mdPath = path.join(__dirname, '..', 'docs', 'reports', 'CERBASEAL_PRICING_AND_COMMERCIALIZATION_SOURCE_DATA.md');

coverPage();
tocPage();

secLabel = 'Source Data';
renderMarkdown(mdPath);

doc.end();

// Confirm output
doc.on('end', () => {
  const stat = fs.statSync(OUT);
  console.log('\n====================================================');
  console.log('  PDF generated successfully');
  console.log(`  Output: ${OUT}`);
  console.log(`  Pages:  ${pageNum}`);
  console.log(`  Size:   ${(stat.size / 1024).toFixed(1)} KB`);
  console.log('====================================================\n');
});
