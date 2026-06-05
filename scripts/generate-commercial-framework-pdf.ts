/**
 * CerbaSeal — Commercial Framework PDF
 * Three-Model Partner Strategy Brief
 * Run: pnpm generate:commercial-pdf
 */

import PDFDocument from "pdfkit";
import { createWriteStream } from "node:fs";
import { resolve } from "node:path";

const OUT = resolve(process.cwd(), "cerbaseal-commercial-framework.pdf");

// ── Dimensions ────────────────────────────────────────────────────────────────
const PW  = 595.28;
const PH  = 841.89;
const ML  = 52;
const MR  = 52;
const MT  = 52;
const MB  = 58;
const CW  = PW - ML - MR;   // 491.28

// ── Colour palette ────────────────────────────────────────────────────────────
const C = {
  navy:     "#0B1E3E",
  blue:     "#1A3A6B",
  accent:   "#2563EB",
  midBlue:  "#93C5FD",
  ltBlue:   "#DBEAFE",
  white:    "#FFFFFF",
  offWht:   "#F8FAFC",
  light:    "#F1F5F9",
  rule:     "#E2E8F0",
  mid:      "#64748B",
  dark:     "#1E293B",
  black:    "#0F172A",
  green:    "#15803D",
  greenBg:  "#DCFCE7",
  red:      "#B91C1C",
  redBg:    "#FEE2E2",
  gold:     "#B45309",
  goldLt:   "#FEF3C7",
  teal:     "#0F766E",
  tealBg:   "#CCFBF1",
  purple:   "#6D28D9",
  purpleBg: "#EDE9FE",
  orange:   "#C2410C",
  orangeBg: "#FFEDD5",
};

// ── State ─────────────────────────────────────────────────────────────────────
let doc: PDFKit.PDFDocument;
let pageNum = 0;

// ── Init ──────────────────────────────────────────────────────────────────────
function init(): void {
  doc = new PDFDocument({
    size: "A4",
    margins: { top: MT, bottom: MB, left: ML, right: MR },
    info: {
      Title: "CerbaSeal — Commercial Framework",
      Author: "Jesse Lamont / Lamont Labs",
      Subject: "Three-Model Partner Strategy Brief",
    },
    autoFirstPage: false,
  });
}

// ── Page management ───────────────────────────────────────────────────────────
function newPage(): void {
  doc.addPage();
  pageNum++;
  doc.rect(0, 0, PW, 3).fill(C.accent);
  doc.y = MT + 6;
}

function footer(): void {
  const y = PH - 44;
  doc.save()
    .moveTo(ML, y).lineTo(PW - MR, y)
    .strokeColor(C.rule).lineWidth(0.4).stroke()
    .restore();
  doc.fillColor(C.mid).font("Helvetica").fontSize(7.5)
    .text(
      "CerbaSeal — Commercial Framework  ·  Partner Briefing  ·  CONFIDENTIAL",
      ML, y + 8, { width: CW - 30, lineBreak: false }
    );
  doc.fillColor(C.mid).font("Helvetica-Bold").fontSize(7.5)
    .text(String(pageNum), PW - MR - 14, y + 8, { width: 14, align: "right", lineBreak: false });
}

function ensureY(needed: number): void {
  if (doc.y + needed > PH - MB - 12) {
    footer();
    newPage();
  }
}

// ── Typography ────────────────────────────────────────────────────────────────
function sectionHeading(num: string, title: string, sub?: string): void {
  footer();
  newPage();
  const h = sub ? 48 : 38;
  doc.rect(0, MT + 4, PW, h).fill(C.navy);
  doc.rect(0, MT + 4, 5, h).fill(C.accent);
  doc.fillColor(C.midBlue).font("Helvetica").fontSize(8)
    .text(`SECTION ${num}`, ML, MT + 11, { lineBreak: false });
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(14)
    .text(title, ML, MT + 22, { lineBreak: false });
  if (sub) {
    doc.fillColor(C.ltBlue).font("Helvetica-Oblique").fontSize(9)
      .text(sub, ML, MT + 37, { lineBreak: false });
  }
  doc.y = MT + h + 16;
}

function h1(text: string): void {
  ensureY(36);
  doc.moveDown(0.5);
  doc.fillColor(C.navy).font("Helvetica-Bold").fontSize(12.5).text(text, ML, doc.y);
  const ly = doc.y + 1;
  doc.save().moveTo(ML, ly).lineTo(PW - MR, ly).strokeColor(C.accent).lineWidth(1.2).stroke().restore();
  doc.y = ly + 9;
}

function h2(text: string, color = C.blue): void {
  ensureY(22);
  doc.moveDown(0.35);
  doc.fillColor(color).font("Helvetica-Bold").fontSize(10.5).text(text, ML, doc.y);
  doc.moveDown(0.12);
}

function para(text: string, opts?: { color?: string; size?: number; italic?: boolean; bold?: boolean }): void {
  const { color = C.dark, size = 9, italic = false, bold = false } = opts ?? {};
  doc.fillColor(color)
    .font(bold ? "Helvetica-Bold" : italic ? "Helvetica-Oblique" : "Helvetica")
    .fontSize(size)
    .text(text, ML, doc.y, { width: CW, lineGap: 2.5 });
  doc.moveDown(0.2);
}

function bul(text: string, sub = false, color = C.dark): void {
  ensureY(14);
  const indent = sub ? 14 : 0;
  const x = ML + indent;
  const w = CW - indent;
  const dot = sub ? "–" : "·";
  const dotColor = sub ? C.mid : C.accent;
  const curY = doc.y;
  doc.fillColor(dotColor).font("Helvetica-Bold").fontSize(9)
    .text(dot + " ", x, curY, { continued: true, lineBreak: false, width: 12 });
  doc.fillColor(color).font("Helvetica").fontSize(9)
    .text(text, x + 12, curY, { width: w - 12, lineGap: 2 });
}

function gap(n = 0.4): void { doc.moveDown(n); }

function rule(): void {
  doc.moveDown(0.3);
  ensureY(8);
  doc.save().moveTo(ML, doc.y).lineTo(PW - MR, doc.y)
    .strokeColor(C.rule).lineWidth(0.4).stroke().restore();
  doc.y += 8;
}

// ── Callout box ────────────────────────────────────────────────────────────────
function callout(
  text: string,
  opts?: { bg?: string; border?: string; textColor?: string; size?: number; label?: string }
): void {
  const bg     = opts?.bg     ?? C.ltBlue;
  const border = opts?.border ?? C.accent;
  const tc     = opts?.textColor ?? C.navy;
  const fs     = opts?.size   ?? 9.5;
  const label  = opts?.label;
  doc.moveDown(0.3);
  const labelH = label ? 16 : 0;
  const textH  = doc.heightOfString(text, { width: CW - 28, fontSize: fs, lineGap: 2.5 });
  const totalH = textH + 20 + labelH;
  ensureY(totalH + 4);
  const y0 = doc.y;
  doc.rect(ML, y0, CW, totalH).fill(bg);
  doc.rect(ML, y0, 4, totalH).fill(border);
  if (label) {
    doc.fillColor(border).font("Helvetica-Bold").fontSize(7.5)
      .text(label, ML + 12, y0 + 5, { lineBreak: false });
  }
  doc.fillColor(tc).font("Helvetica").fontSize(fs)
    .text(text, ML + 12, y0 + 10 + labelH, { width: CW - 26, lineGap: 2.5 });
  doc.y = y0 + totalH + 8;
}

// ── Dynamic table ─────────────────────────────────────────────────────────────
function table(
  headers: string[],
  rows: string[][],
  widths: number[],
  opts?: {
    fontSize?: number;
    headerBg?: string;
    altRow?: boolean;
    colStyles?: Array<{ bold?: boolean; color?: string; align?: "left" | "center" | "right"; italic?: boolean } | null>;
    colBg?: Array<string | null>;
    compact?: boolean;
  }
): void {
  const fs       = opts?.fontSize ?? 8.5;
  const hBg      = opts?.headerBg ?? C.navy;
  const alt      = opts?.altRow !== false;
  const cs       = opts?.colStyles ?? [];
  const colBg    = opts?.colBg ?? [];
  const compact  = opts?.compact ?? false;
  const pad      = compact ? { x: 6, y: 3 } : { x: 8, y: 5 };
  const lg       = 2;

  function cellH(text: string, w: number): number {
    return doc.heightOfString(text, { width: w - pad.x * 2, fontSize: fs, lineGap: lg });
  }
  function rowH(row: string[]): number {
    let h = 0;
    row.forEach((cell, i) => { h = Math.max(h, cellH(cell, widths[i])); });
    return h + pad.y * 2;
  }
  function drawRow(row: string[], bg: string, bold: boolean): void {
    const rh = bold ? (compact ? 18 : 22) : rowH(row);
    ensureY(rh + 2);
    const ry = doc.y;
    doc.rect(ML, ry, CW, rh).fill(bg);
    if (!bold) {
      let bx = ML;
      colBg.forEach((cb, i) => {
        if (cb && widths[i]) doc.rect(bx, ry, widths[i], rh).fill(cb);
        bx += widths[i] || 0;
      });
    }
    doc.save().rect(ML, ry, CW, rh).strokeColor(C.rule).lineWidth(0.3).stroke().restore();
    let cx = ML;
    widths.forEach((w, i) => {
      if (i > 0) {
        doc.save().moveTo(cx, ry).lineTo(cx, ry + rh)
          .strokeColor(C.rule).lineWidth(0.3).stroke().restore();
      }
      cx += w;
    });
    cx = ML;
    row.forEach((cell, i) => {
      const cStyle = cs[i] ?? null;
      const isBold    = bold || (cStyle?.bold   ?? false);
      const isItalic  = !bold && (cStyle?.italic ?? false);
      const txtColor  = bold ? C.white : (cStyle?.color ?? C.dark);
      const align     = cStyle?.align ?? "left";
      doc.fillColor(txtColor)
        .font(isBold ? "Helvetica-Bold" : isItalic ? "Helvetica-Oblique" : "Helvetica")
        .fontSize(bold ? fs + 0.5 : fs)
        .text(cell, cx + pad.x, ry + pad.y, { width: widths[i] - pad.x * 2, lineGap: lg, align });
      cx += widths[i];
    });
    doc.y = ry + rh;
  }

  ensureY(28);
  drawRow(headers, hBg, true);
  rows.forEach((row, ri) => {
    drawRow(row, alt ? (ri % 2 === 0 ? C.white : C.offWht) : C.white, false);
  });
  doc.moveDown(0.5);
}

// ── Two-column stat strip ──────────────────────────────────────────────────────
function statStrip(
  items: { label: string; current: string; target: string; status: "ready" | "partial" | "needed" }[]
): void {
  const rowH = 40;
  const colW = (CW - 6) / 2;
  items.forEach((item, i) => {
    if (i % 2 === 0) ensureY(rowH + 4);
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x0 = ML + col * (colW + 6);
    const y0 = doc.y + (col === 0 ? 0 : -(rowH + 2));

    const statusColor = item.status === "ready" ? C.green
      : item.status === "partial" ? C.gold
      : C.red;
    const statusBg = item.status === "ready" ? C.greenBg
      : item.status === "partial" ? C.goldLt
      : C.redBg;
    const statusLabel = item.status === "ready" ? "READY"
      : item.status === "partial" ? "PARTIAL"
      : "NEEDED";

    doc.rect(x0, y0, colW, rowH).fill(C.light);
    doc.rect(x0, y0, colW, 3).fill(statusColor);

    doc.fillColor(C.navy).font("Helvetica-Bold").fontSize(8.5)
      .text(item.label, x0 + 8, y0 + 8, { width: colW - 70, lineBreak: false });

    doc.rect(x0 + colW - 54, y0 + 6, 50, 13).fill(statusBg);
    doc.fillColor(statusColor).font("Helvetica-Bold").fontSize(7)
      .text(statusLabel, x0 + colW - 54, y0 + 9, { width: 50, align: "center", lineBreak: false });

    doc.fillColor(C.mid).font("Helvetica").fontSize(7.5)
      .text("Now:", x0 + 8, y0 + 22, { continued: true, lineBreak: false });
    doc.fillColor(C.dark).font("Helvetica").fontSize(7.5)
      .text("  " + item.current, { lineBreak: false });

    doc.fillColor(C.green).font("Helvetica-Bold").fontSize(7.5)
      .text("Target:", x0 + 8, y0 + 30, { continued: true, lineBreak: false });
    doc.fillColor(C.green).font("Helvetica").fontSize(7.5)
      .text("  " + item.target, { lineBreak: false });

    if (col === 1 || i === items.length - 1) {
      doc.y = y0 + rowH + 4;
    }
  });
  gap(0.2);
}

// ── Model card ────────────────────────────────────────────────────────────────
function modelCard(
  n: string,
  name: string,
  tagline: string,
  bg: string,
  accent: string,
  priceRange: string,
  whatTheyPay: string[],
  whatTheyDontPay: string[] | null,
  note: string
): void {
  const itemH = 13;
  const headerH = 26;
  const noteH = doc.heightOfString(note, { width: CW - 24, fontSize: 8.5, lineGap: 2 }) + 14;
  const bodyH = (whatTheyPay.length + (whatTheyDontPay?.length ?? 0) + 4) * itemH + headerH + 36 + noteH;
  ensureY(bodyH + 8);

  const y0 = doc.y;

  // Card outline
  doc.rect(ML, y0, CW, bodyH).fill(C.white);
  doc.save().rect(ML, y0, CW, bodyH).strokeColor(accent).lineWidth(1.2).stroke().restore();

  // Header
  doc.rect(ML, y0, CW, headerH).fill(bg);
  doc.rect(ML, y0, 36, headerH).fill(C.navy);
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(14)
    .text(n, ML, y0 + 5, { width: 36, align: "center", lineBreak: false });
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(11)
    .text(name, ML + 42, y0 + 4, { lineBreak: false });
  doc.fillColor(C.white).font("Helvetica-Oblique").fontSize(8.5)
    .text(tagline, ML + 42, y0 + 16, { lineBreak: false });

  // Price badge
  const badgeY = y0 + headerH + 6;
  doc.rect(ML + 6, badgeY, CW - 12, 26).fill(C.light);
  doc.fillColor(accent).font("Helvetica-Bold").fontSize(15)
    .text(priceRange, ML + 6, badgeY + 6, { width: CW - 12, align: "center", lineBreak: false });

  // What they pay
  let ry = badgeY + 32;
  doc.fillColor(C.navy).font("Helvetica-Bold").fontSize(8)
    .text("WHAT THE CLIENT IS PAYING FOR:", ML + 10, ry);
  ry += 12;
  whatTheyPay.forEach((item) => {
    doc.rect(ML + 1, ry, CW - 2, itemH).fill(C.greenBg);
    doc.fillColor(C.green).font("Helvetica-Bold").fontSize(8)
      .text("✓", ML + 10, ry + 3, { lineBreak: false });
    doc.fillColor(C.dark).font("Helvetica").fontSize(8)
      .text(item, ML + 22, ry + 3, { lineBreak: false, width: CW - 30 });
    ry += itemH;
  });

  if (whatTheyDontPay && whatTheyDontPay.length > 0) {
    ry += 4;
    doc.fillColor(C.mid).font("Helvetica-Bold").fontSize(8)
      .text("NOT PAYING FOR (ALREADY DONE / NOT INCLUDED):", ML + 10, ry);
    ry += 12;
    whatTheyDontPay.forEach((item) => {
      doc.rect(ML + 1, ry, CW - 2, itemH).fill(C.light);
      doc.fillColor(C.mid).font("Helvetica").fontSize(8)
        .text("–", ML + 10, ry + 3, { lineBreak: false });
      doc.fillColor(C.mid).font("Helvetica-Oblique").fontSize(8)
        .text(item, ML + 22, ry + 3, { lineBreak: false, width: CW - 30 });
      ry += itemH;
    });
  }

  // Note
  ry += 6;
  doc.rect(ML + 1, ry, CW - 2, noteH).fill(C.ltBlue);
  doc.rect(ML + 1, ry, 3, noteH).fill(accent);
  doc.fillColor(C.navy).font("Helvetica").fontSize(8.5)
    .text(note, ML + 12, ry + 7, { width: CW - 22, lineGap: 2 });

  doc.y = y0 + bodyH + 10;
}

// ── Multiplier visual ─────────────────────────────────────────────────────────
function multiplierRow(
  label: string,
  beforeHours: number, beforePilots: number, beforeRevenue: string,
  afterHours: number,  afterPilots: number,  afterRevenue: string,
  change: string, changeColor: string
): void {
  ensureY(28);
  const rh = 24;
  const colW = CW / 7;
  const y0 = doc.y;

  const cols = [
    { text: label,          bold: true,  color: C.navy,  bg: C.light,   w: colW * 2 },
    { text: `${beforeHours}h/pilot`, bold: false, color: C.red,   bg: C.redBg,   w: colW },
    { text: `${beforePilots} pilots`,bold: false, color: C.dark,  bg: C.white,   w: colW },
    { text: beforeRevenue,  bold: false, color: C.dark,  bg: C.white,   w: colW },
    { text: `${afterHours}h/pilot`,  bold: false, color: C.green, bg: C.greenBg, w: colW },
    { text: `${afterPilots} pilots`, bold: false, color: C.dark,  bg: C.white,   w: colW },
    { text: afterRevenue,   bold: true,  color: C.accent,bg: C.ltBlue,  w: colW },
  ];

  let cx = ML;
  cols.forEach((col) => {
    doc.rect(cx, y0, col.w, rh).fill(col.bg);
    doc.fillColor(col.color).font(col.bold ? "Helvetica-Bold" : "Helvetica").fontSize(8)
      .text(col.text, cx + 4, y0 + 8, { width: col.w - 8, align: "center", lineBreak: false });
    doc.save().moveTo(cx + col.w, y0).lineTo(cx + col.w, y0 + rh)
      .strokeColor(C.rule).lineWidth(0.3).stroke().restore();
    cx += col.w;
  });
  doc.y = y0 + rh;
}

// ══════════════════════════════════════════════════════════════════════════════
// COVER
// ══════════════════════════════════════════════════════════════════════════════
function cover(): void {
  doc.addPage();
  pageNum++;

  // Navy header
  doc.rect(0, 0, PW, 210).fill(C.navy);
  doc.rect(0, 210, PW, 4).fill(C.accent);
  doc.rect(0, 0, 5, 210).fill(C.accent);

  doc.fillColor(C.midBlue).font("Helvetica").fontSize(8.5)
    .text("LAMONT LABS  ·  CONFIDENTIAL  ·  PARTNER STRATEGY BRIEF", 0, 44, { width: PW, align: "center" });

  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(30)
    .text("CerbaSeal", 0, 66, { width: PW, align: "center" });

  doc.fillColor(C.ltBlue).font("Helvetica-Bold").fontSize(15)
    .text("Commercial Framework", 0, 108, { width: PW, align: "center" });

  doc.fillColor(C.midBlue).font("Helvetica").fontSize(10)
    .text("Three-Model Partner Strategy Brief", 0, 130, { width: PW, align: "center" });

  // Key insight strip
  doc.rect(ML + 50, 154, CW - 100, 44).fill(C.blue);
  doc.fillColor(C.midBlue).font("Helvetica").fontSize(8)
    .text("KEY INSIGHT", ML + 50, 162, { width: CW - 100, align: "center" });
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(10)
    .text('"The actual tool is the thing I\'m least concerned about."', ML + 50, 173, { width: CW - 100, align: "center" });
  doc.fillColor(C.ltBlue).font("Helvetica-Oblique").fontSize(7.5)
    .text("She already believes the enforcement layer works. The question is now: can it be delivered?", ML + 50, 186, { width: CW - 100, align: "center" });

  doc.y = 232;

  // Three model summary
  const mw = (CW - 8) / 3;
  const mh = 80;
  const my = doc.y;
  const models = [
    { n: "1", name: "Pilot", sub: "Consulting engagement", color: C.blue, price: "€15k – €75k" },
    { n: "2", name: "Production License", sub: "Post-pilot software", color: C.accent, price: "€25k – €750k+/yr" },
    { n: "3", name: "Channel Partner", sub: "CerbaSeal to a consulting firm", color: C.navy, price: "Different question" },
  ];
  models.forEach((m, i) => {
    const x = ML + i * (mw + 4);
    doc.rect(x, my, mw, mh).fill(m.color);
    doc.rect(x, my, mw, 6).fill(C.accent);
    doc.fillColor(C.white).font("Helvetica-Bold").fontSize(22)
      .text(m.n, x, my + 10, { width: mw, align: "center", lineBreak: false });
    doc.fillColor(C.white).font("Helvetica-Bold").fontSize(9)
      .text(m.name, x, my + 38, { width: mw, align: "center", lineBreak: false });
    doc.fillColor(C.ltBlue).font("Helvetica-Oblique").fontSize(7.5)
      .text(m.sub, x, my + 50, { width: mw, align: "center", lineBreak: false });
    doc.fillColor(C.white).font("Helvetica-Bold").fontSize(8)
      .text(m.price, x, my + 64, { width: mw, align: "center", lineBreak: false });
  });
  doc.y = my + mh + 12;

  // TOC
  doc.fillColor(C.navy).font("Helvetica-Bold").fontSize(10.5).text("CONTENTS", ML, doc.y);
  const ty = doc.y + 1;
  doc.save().moveTo(ML, ty).lineTo(PW - MR, ty).strokeColor(C.accent).lineWidth(1.2).stroke().restore();
  doc.y = ty + 10;

  const toc = [
    ["1", "The Three Commercial Models — Why Separation Matters"],
    ["2", "Model 1 — Pilot as Consulting Engagement"],
    ["3", "Model 2 — Production Licensing (Post-Pilot)"],
    ["4", "Model 3 — Channel Partner Economics"],
    ["5", "The Hidden Pricing Multiplier"],
    ["6", "Operationalization Readiness — Answering Olivia's Questions"],
    ["7", "What This Means For The Next Call"],
  ];
  toc.forEach(([n, title], i) => {
    ensureY(18);
    const ry = doc.y;
    doc.rect(ML, ry, CW, 16).fill(i % 2 === 0 ? C.light : C.white);
    doc.rect(ML, ry, 28, 16).fill(C.accent);
    doc.fillColor(C.white).font("Helvetica-Bold").fontSize(8.5)
      .text(n, ML, ry + 4, { width: 28, align: "center", lineBreak: false });
    doc.fillColor(C.dark).font("Helvetica").fontSize(8.5)
      .text(title, ML + 36, ry + 4, { lineBreak: false });
    doc.y = ry + 16;
  });

  doc.moveDown(0.6);
  ensureY(26);
  const ay = doc.y;
  doc.rect(ML, ay, CW, 24).fill(C.light);
  doc.fillColor(C.mid).font("Helvetica").fontSize(8)
    .text("Jesse Lamont  ·  Lamont Labs  ·  jesse@lamontlabs.io  ·  " +
      new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" }),
      ML, ay + 8, { width: CW, align: "center", lineBreak: false });
  doc.y = ay + 24;
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — The Three Models
// ══════════════════════════════════════════════════════════════════════════════
function sec1(): void {
  sectionHeading("1", "The Three Commercial Models", "Why mixing them creates pricing confusion");

  para(
    "CerbaSeal currently has three distinct commercial models embedded in a single pricing discussion. " +
    "Each model has different buyers, different value propositions, different cost inputs, and " +
    "different pricing logics. Conflating them creates confusion — on both sides of the conversation."
  );

  table(
    ["Model", "Buyer", "What They're Buying", "Price Driver"],
    [
      ["1 · Pilot",            "The client",       "Discovery + workflow mapping + deployment + training + evidence + support + learning", "Jesse's time and IP applied to their specific problem"],
      ["2 · Production License","The client",       "Enforcement layer + updates + support + evidence tooling + future releases",           "Software value: scale, reliability, ongoing capability"],
      ["3 · Channel Partner",   "A consulting firm","CerbaSeal embedded in their practice: exclusivity, repeatability, support, tooling",   "What CerbaSeal is worth to a firm across many clients"],
    ],
    [66, 78, 210, CW - 354]
  );

  callout(
    "The most expensive mistake in early enterprise pricing is forcing a single number to represent all three models. " +
    "A pilot can cost more than Year 1 of the annual license — that is completely normal in enterprise software. " +
    "A channel partner deal is priced on capacity multiplied across many clients, not one.",
    { bg: C.goldLt, border: C.gold, textColor: C.gold, label: "KEY PRINCIPLE" }
  );

  h2("Where The Current Conversation Lives");
  para(
    "The current conversation with Olivia spans all three models simultaneously — which is why it feels " +
    "complex. She is asking pilot questions (first engagement), license questions (what happens after), " +
    "and channel questions (repeatability, exclusivity, scaling) in the same breath."
  );
  para(
    "The right move is not to answer all three in one number. The right move is to name the models " +
    "clearly and price each one separately. This document prepares that separation."
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — Model 1: Pilot
// ══════════════════════════════════════════════════════════════════════════════
function sec2(): void {
  sectionHeading("2", "Model 1 — Pilot as Consulting Engagement", "The pilot is not buying software");

  callout(
    "The client in a Tier 2 pilot is not paying for ALLOW/HOLD/REJECT. " +
    "They are paying to learn whether CerbaSeal can solve a governance problem inside their organization. " +
    "That distinction matters — and it changes how the price is justified.",
    { bg: C.ltBlue, border: C.accent, textColor: C.navy, label: "FRAMING" }
  );

  gap(0.2);
  modelCard(
    "1", "Pilot", "A consulting engagement enabled by CerbaSeal",
    C.blue, C.blue,
    "€15,000 – €75,000  (preferred anchor: €45,000 – €60,000)",
    [
      "Workflow discovery and requirements mapping",
      "Deployment assistance and environment configuration",
      "Runtime configuration and authority class setup",
      "Operator training and onboarding",
      "Evidence package generation and review",
      "Bounded support window during the pilot period",
      "Pilot completion review with stakeholders",
      "Learning: does CerbaSeal solve this client's governance problem?",
      "Risk reduction: pilot converts unknown into known before annual commitment",
    ],
    null,
    "The pilot price reflects implementation-weight work. It is not a software subscription — it is " +
    "a time-bounded engagement to prove value in one specific workflow. Enterprise software does this constantly. " +
    "Snowflake charges $25k–$50k for 90-day pilots. That fee is credited on conversion."
  );

  gap(0.3);
  h1("Why Pilot > Year 1 Annual License Is Normal");
  para(
    "A common instinct is to price the pilot below or at the annual license to make conversion feel " +
    "like a good deal. This is usually wrong for implementation-heavy products."
  );
  table(
    ["Scenario", "Pilot", "Year 1 License", "Logic"],
    [
      ["Correct framing", "€50,000", "€40,000/yr", "Pilot includes implementation. License is mostly software. Pilot can cost more."],
      ["Wrong framing", "€20,000", "€40,000/yr", "Severely underprices the implementation and training work. Creates wrong expectations."],
      ["Strategic framing", "€50,000 (credited)", "€40,000/yr", "Pilot fee credited on conversion. Reduces friction. Standard enterprise pattern."],
    ],
    [95, 60, 70, CW - 225],
    {
      colStyles: [null, { bold: true, color: C.accent, align: "center" }, { color: C.mid, align: "center" }, null],
    }
  );

  callout(
    "The implementation and training work happens once. After the pilot, Year 1 of the annual license " +
    "is mostly software — no discovery, no workflow mapping, no onboarding. That is why they are " +
    "priced differently and should be presented differently.",
    { bg: C.greenBg, border: C.green, textColor: C.green, label: "COMMERCIAL LOGIC" }
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — Model 2: Production License
// ══════════════════════════════════════════════════════════════════════════════
function sec3(): void {
  sectionHeading("3", "Model 2 — Production Licensing", "What happens after a successful pilot");

  para(
    "After the pilot, the client has proven CerbaSeal works for their workflow. They are no longer " +
    "paying for discovery, deployment, training, or onboarding — those already happened. " +
    "Now they are paying for ongoing access to the enforcement layer and its supporting infrastructure."
  );

  modelCard(
    "2", "Production License", "Ongoing access to the enforcement layer",
    C.accent, C.accent,
    "€25,000 – €750,000+ per year (based on client profile)",
    [
      "The enforcement gate — ExecutionGateService with all 12 invariants",
      "Audit trail and evidence pipeline (file-backed JSONL, hash chain, replay)",
      "Evidence package generation and export tooling",
      "Diagnostic and health services",
      "Support window and issue resolution",
      "Version updates and new capability releases",
      "Authority class configuration updates as client roles evolve",
    ],
    [
      "Workflow discovery (already done)",
      "Initial deployment (already done)",
      "Operator training (already done)",
      "Pilot stakeholder review (already done)",
    ],
    "Annual licensing should not be finalized until after at least one successful pilot produces real data on " +
    "usage volume, support burden, and ROI. The ranges below are directional — pilot data will anchor them."
  );

  gap(0.3);
  table(
    ["License Type", "Client Profile", "Annual Range", "Basis"],
    [
      ["Emerging Market", "Seed / Series A / small AI company", "€25k – €75k", "Low volume, single workflow, limited regulatory exposure"],
      ["Growth", "Series B / scale-up / mid-market", "€75k – €250k", "Multiple workflows or high decision volume"],
      ["Regulated Enterprise", "Financial services, insurance, healthcare, legal, government", "€250k – €750k+", "Regulatory scrutiny, evidence requirements, multi-team use"],
      ["Strategic Platform", "Multi-workflow, multi-entity, high-consequence", "€750k+", "Enterprise-wide deployment, multiple business units"],
    ],
    [95, 155, 80, CW - 330],
    { colStyles: [{ bold: true }, null, { bold: true, color: C.accent, align: "center" }, null] }
  );

  h2("The Critical Inflection Point");
  para(
    "The moment the first pilot converts to an annual license is the most important commercial event. " +
    "It produces: (1) a referenceable customer, (2) real usage data, (3) a proven conversion path, " +
    "(4) the ROI evidence needed to justify higher pricing to the next client."
  );
  [
    "Time saved in audit preparation per governed workflow",
    "Reduction in manual approval review burden",
    "Number of governed decisions processed per period",
    "Number of unauthorized actions prevented",
    "Evidence retrieval time vs. manual baseline",
    "Support hours required per quarter",
  ].forEach((item) => bul(item));
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — Model 3: Channel Partner
// ══════════════════════════════════════════════════════════════════════════════
function sec4(): void {
  sectionHeading("4", "Model 3 — Channel Partner Economics", "A completely different pricing question");

  callout(
    "Listen carefully to the call. Olivia repeatedly talks about future clients, multiple pilots, EU exclusivity, " +
    "hosting eventually, repeatability, scaling, and support boundaries. Those are not pilot discussions. " +
    "Those are channel discussions.",
    { bg: C.purpleBg, border: C.purple, textColor: C.purple, label: "FROM THE CALL" }
  );

  gap(0.2);
  para(
    "The channel model is not Client → CerbaSeal. It is Client → Partner → CerbaSeal. " +
    "This changes the pricing question fundamentally."
  );

  // Flow diagram as table
  table(
    ["Direct Model (Models 1 & 2)", "Channel Model (Model 3)"],
    [
      ["Jesse sells to each client individually", "Partner bundles CerbaSeal into their service offering"],
      ["Jesse deploys for each client", "Partner deploys using starter kits and config tools"],
      ["Jesse supports each client", "Partner provides first-line support; Jesse provides second-line"],
      ["Revenue: €35k–€75k per pilot", "Revenue: partner fee + per-pilot or per-seat royalty"],
      ["Ceiling: Jesse's available hours", "Ceiling: partner's client base × deal size"],
      ["Founder dependency: high", "Founder dependency: low (partner is the delivery layer)"],
    ],
    [(CW) / 2, (CW) / 2]
  );

  h1("What CerbaSeal Is Worth To A Consulting Firm");
  para(
    "The right pricing question for a channel partner is not 'what does a pilot cost?' " +
    "It is 'what is CerbaSeal worth to a firm that can embed it across 10, 20, or 50 client engagements?'"
  );
  table(
    ["Pricing Component", "What It Covers", "Example Structure"],
    [
      ["Platform access fee", "Rights to use CerbaSeal in client engagements; updates; roadmap input", "€30k–€80k/year depending on partner tier"],
      ["Per-pilot royalty", "Fee per client pilot delivered by the partner", "€5k–€15k per pilot (volume-scaled)"],
      ["Per-seat / per-decision", "Production usage at client sites (post-pilot)", "€X per governed decision per month or per active seat"],
      ["Exclusivity premium", "Geographic or vertical exclusivity (e.g. EU financial services)", "Negotiated — typically 1.5–3× standard access fee"],
      ["Training & certification", "Partner team onboarding, certification program", "€5k–€15k per cohort"],
      ["Co-delivery support", "Jesse's time on strategic accounts alongside partner", "Day rate or retained hours"],
    ],
    [120, 185, CW - 305]
  );

  callout(
    "What Olivia is describing is a channel partner relationship — not a series of individual client pilots. " +
    "The commercial value of a channel partner deal is: (partner client base) × (average deal size) × (royalty rate). " +
    "That is a materially different number than a single pilot fee, and it should be negotiated as a separate agreement.",
    { bg: C.navy, border: C.accent, textColor: C.white, label: "STRATEGIC IMPLICATION" }
  );

  h2("What A Channel Agreement Should Cover");
  [
    "Scope of rights — which workflows, which geographies, which verticals (exclusivity boundaries)",
    "Partner obligations — minimum pilots per year, certification requirements, support coverage",
    "Royalty structure — per-pilot fee, per-seat fee, or revenue share (which model depends on partner's preferred structure)",
    "Support boundary — what partner handles vs. what escalates to Jesse (critical for founder-time protection)",
    "Exclusivity terms — duration, renewal conditions, performance requirements to maintain exclusivity",
    "Co-marketing and reference rights — what the partner can say publicly about the relationship",
    "IP protections — what the partner can and cannot modify, white-label, or redistribute",
  ].forEach((item) => bul(item));
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 5 — The Hidden Pricing Multiplier
// ══════════════════════════════════════════════════════════════════════════════
function sec5(): void {
  sectionHeading("5", "The Hidden Pricing Multiplier", "Founder dependency reduction = revenue infrastructure");

  callout(
    "This is the thing neither the research report nor the pricing brief fully captures. " +
    "Reducing founder hours per pilot from 8 to 2 does not improve the product. " +
    "It multiplies revenue capacity — with the same founder, same product, same company.",
    { bg: C.navy, border: C.accent, textColor: C.white, label: "THE CORE INSIGHT" }
  );

  gap(0.3);
  h2("The Capacity Equation");

  // Header row for multiplier table
  ensureY(28);
  const mry = doc.y;
  const mh = 22;
  const labels = ["Scenario", "Founder hours", "Max pilots/yr", "Revenue @€50k", "Founder hours", "Max pilots/yr", "Revenue @€50k"];
  const mw = CW / 7;
  doc.rect(ML, mry, CW, mh).fill(C.navy);
  let cx = ML;
  // Group headers
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(8)
    .text("", ML, mry + 5, { lineBreak: false });
  doc.rect(ML + mw * 2, mry, mw * 3, 10).fill(C.redBg);
  doc.fillColor(C.red).font("Helvetica-Bold").fontSize(7.5)
    .text("TODAY (8h/pilot)", ML + mw * 2, mry + 2, { width: mw * 3, align: "center", lineBreak: false });
  doc.rect(ML + mw * 5 - 1, mry, mw * 2 + 1, 10).fill(C.greenBg);
  doc.fillColor(C.green).font("Helvetica-Bold").fontSize(7.5)
    .text("TARGET (2h/pilot)", ML + mw * 5, mry, { width: mw * 2, align: "center", lineBreak: false });
  doc.y = mry + mh;

  // Sub-header
  ensureY(16);
  const sh = 16;
  const shy = doc.y;
  doc.rect(ML, shy, CW, sh).fill(C.dark);
  const shLabels = ["Scenario", "h/pilot", "Pilots/yr", "Revenue", "h/pilot", "Pilots/yr", "Revenue"];
  cx = ML;
  shLabels.forEach((l) => {
    doc.fillColor(C.white).font("Helvetica-Bold").fontSize(8)
      .text(l, cx + 3, shy + 4, { width: mw - 6, align: "center", lineBreak: false });
    cx += mw;
  });
  doc.y = shy + sh;

  // Data rows
  [
    ["500h available/yr",  8, 62,  "€3.1M capacity", 2, 250, "€12.5M capacity"],
    ["200h available/yr",  8, 25,  "€1.25M capacity", 2, 100, "€5M capacity"],
    ["100h available/yr",  8, 12,  "€600k capacity",  2, 50,  "€2.5M capacity"],
    ["50h available/yr",   8, 6,   "€300k capacity",  2, 25,  "€1.25M capacity"],
  ].forEach(([label, bh, bp, brev, ah, ap, arev], ri) => {
    ensureY(18);
    const rry = doc.y;
    const rrh = 18;
    doc.rect(ML, rry, CW, rrh).fill(ri % 2 === 0 ? C.white : C.offWht);
    const vals = [label, `${bh}h`, `${bp}`, brev, `${ah}h`, `${ap}`, arev];
    cx = ML;
    vals.forEach((v, vi) => {
      const isHighlight = vi === 6;
      const isBad = vi === 1 || vi === 2 || vi === 3;
      const isGood = vi === 4 || vi === 5 || vi === 6;
      if (isBad) doc.rect(cx, rry, mw, rrh).fill(C.redBg);
      if (isGood) doc.rect(cx, rry, mw, rrh).fill(C.greenBg);
      doc.fillColor(
        isHighlight ? C.accent : isBad ? C.red : isGood ? C.green : C.dark
      ).font(isHighlight ? "Helvetica-Bold" : "Helvetica").fontSize(8)
        .text(v, cx + 3, rry + 5, { width: mw - 6, align: "center", lineBreak: false });
      doc.save().moveTo(cx + mw, rry).lineTo(cx + mw, rry + rrh)
        .strokeColor(C.rule).lineWidth(0.3).stroke().restore();
      cx += mw;
    });
    doc.y = rry + rrh;
  });
  doc.moveDown(0.5);

  callout(
    "Nothing changed technically. The enforcement gate is identical. The audit trail is identical. " +
    "The tests are identical. But 2 founder hours per pilot instead of 8 means the same founder, " +
    "same product, same company has 4× the revenue capacity. " +
    "That is why the onboarding work, the starter kits, the config wizard, and the deployment automation are " +
    "not documentation. They are revenue infrastructure.",
    { bg: C.greenBg, border: C.green, textColor: C.green, label: "WHY THIS MATTERS" }
  );

  h2("The Channel Multiplier On Top");
  para(
    "If the channel model activates — a partner is delivering pilots using CerbaSeal — the multiplier " +
    "applies to the partner's team, not just Jesse's hours. The partner has more capacity than Jesse alone. " +
    "Every hour Jesse invests in making CerbaSeal deliverable by others multiplies across the partner's practice."
  );
  table(
    ["Delivery model", "Who does the pilot hours", "Jesse's role", "Pilots/yr ceiling"],
    [
      ["Direct today (8h/pilot)", "Jesse", "Everything", "~12–62 depending on time available"],
      ["Direct (target, 2h/pilot)", "Jesse + tooling", "Strategy + oversight", "~25–250 depending on time available"],
      ["Channel (partner-delivered)", "Partner team + tooling", "Second-line support only", "Partner's capacity × their deal flow"],
    ],
    [130, 115, 110, CW - 355]
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 6 — Operationalization Readiness
// ══════════════════════════════════════════════════════════════════════════════
function sec6(): void {
  sectionHeading("6", "Operationalization Readiness", "Answering Olivia's actual questions");

  callout(
    "After reviewing the call, the biggest commercial risk Olivia sees is not whether CerbaSeal works. " +
    "It is whether CerbaSeal can be delivered repeatedly without consuming the founder. " +
    "These are the six questions she kept returning to — with current state, target, and status.",
    { bg: C.navy, border: C.accent, textColor: C.white, label: "CONTEXT" }
  );

  gap(0.3);

  // Q1
  h2("Q1 — How long does onboarding take?");
  statStrip([
    {
      label: "Onboarding duration",
      current: "Estimated 8–12h of founder involvement",
      target: "< 4 hours of founder involvement",
      status: "partial",
    },
    {
      label: "Self-service capability",
      current: "Starter kits + config wizard exist",
      target: "90% of onboarding self-served",
      status: "partial",
    },
  ]);
  para(
    "The Founder Independence Kit, 8-phase onboarding sequence, and 4 integration starter kits " +
    "already reduce onboarding burden significantly. What's still needed: a recorded walkthrough, " +
    "a deployment checklist with expected completion times, and timing data from a real pilot."
  );
  [
    "✓  8-phase client onboarding sequence (docs/client-adoption/onboarding-sequence.md)",
    "✓  4 integration starter kits with READMEs",
    "✓  Workflow config generator (pnpm generate:pilot-config)",
    "✓  Founder Independence Kit (docs/FOUNDER-INDEPENDENCE-KIT.md)",
    "○  Recorded walkthrough video (not yet built)",
    "○  Timed completion data from a real pilot",
  ].forEach((item) => {
    const isBuilt = item.startsWith("✓");
    bul(item.slice(2).trim(), false, isBuilt ? C.green : C.gold);
  });

  rule();

  // Q2
  h2("Q2 — How much founder involvement per pilot?");
  statStrip([
    {
      label: "Founder hours per pilot",
      current: "Unknown — not yet measured",
      target: "< 5 hours per pilot",
      status: "needed",
    },
    {
      label: "Delegation tools",
      current: "Starter kits reduce dev hours",
      target: "Partner delivers 80% without Jesse",
      status: "partial",
    },
  ]);
  para(
    "This is the most important number to establish. Until it is measured from a real pilot, any capacity " +
    "claim is theoretical. The first pilot should explicitly track founder hours by activity: " +
    "discovery, configuration, deployment, training, support, review."
  );
  [
    "○  Hour tracking by activity type (discovery / config / deploy / train / support / review)",
    "✓  Config generator reduces configuration time",
    "✓  Starter kits reduce deployment time",
    "○  Support playbook to reduce support hours",
    "○  Training materials to reduce training hours",
  ].forEach((item) => {
    bul(item.slice(2).trim(), false, item.startsWith("✓") ? C.green : C.gold);
  });

  rule();

  // Q3
  h2("Q3 — How much training is required?");
  statStrip([
    {
      label: "Operator training",
      current: "Documented; no video format",
      target: "30-min onboarding video + reference guide",
      status: "partial",
    },
    {
      label: "Developer integration",
      current: "4 starter kits + READMEs",
      target: "Developer self-serves with < 2h of guidance",
      status: "partial",
    },
  ]);
  [
    "✓  Onboarding sequence documentation",
    "✓  4 starter kits with working examples and README files",
    "✓  CLI script reference (all 24 pnpm commands documented)",
    "○  30-minute onboarding video for operators",
    "○  5-minute 'what is CerbaSeal' explainer for stakeholders",
    "○  Developer quickstart guide with step-by-step from zero",
  ].forEach((item) => {
    bul(item.slice(2).trim(), false, item.startsWith("✓") ? C.green : C.gold);
  });

  rule();

  // Q4
  h2("Q4 — Can a client deploy without Jesse?");
  statStrip([
    {
      label: "Self-deployment capability",
      current: "Probably — tools exist but untested end-to-end",
      target: "Yes — tested and documented",
      status: "partial",
    },
    {
      label: "Deployment documentation",
      current: "Deployment guide exists",
      target: "Step-by-step guide verified by non-Jesse run",
      status: "partial",
    },
  ]);
  [
    "✓  Runtime config in cerbaseal.config.json (no code changes for client roles)",
    "✓  Deployment modes document (docs/deployment/deployment-modes.md)",
    "✓  Pilot deployment checklist (docs/deployment/pilot-deployment-checklist.md)",
    "✓  Evidence package generator (pnpm generate:evidence-report)",
    "○  Deployment guide verified by a non-Jesse run (critical gap)",
    "○  Environment variable setup guide with expected values",
  ].forEach((item) => {
    bul(item.slice(2).trim(), false, item.startsWith("✓") ? C.green : C.gold);
  });

  rule();

  // Q5
  h2("Q5 — Can a client generate evidence without Jesse?");
  statStrip([
    {
      label: "Evidence generation",
      current: "Fully automated via CLI scripts",
      target: "Yes — runs in < 5 minutes",
      status: "ready",
    },
    {
      label: "Verification",
      current: "pnpm verify:proof validates output",
      target: "Client can verify independently",
      status: "ready",
    },
  ]);
  callout(
    "This is the strongest readiness answer. Evidence generation is fully automated and requires zero founder involvement: " +
    "pnpm export:proof → pnpm generate:evidence-report. Output: 3 files (governance summary, decision summary, " +
    "audit integrity summary). Client can run this independently after initial setup.",
    { bg: C.greenBg, border: C.green, textColor: C.green, label: "READY NOW" }
  );

  rule();

  // Q6
  h2("Q6 — Can a client troubleshoot without Jesse?");
  statStrip([
    {
      label: "Self-service troubleshooting",
      current: "Diagnostic service + health check exist",
      target: "80% of issues self-served",
      status: "partial",
    },
    {
      label: "Support playbook",
      current: "Operator action service built",
      target: "Documented decision tree for common issues",
      status: "needed",
    },
  ]);
  [
    "✓  DiagnosticReportService — operator-facing analysis with recommended actions",
    "✓  SystemHealthService — checks logging, controls, trust state, chain integrity",
    "✓  OperatorActionService — acknowledge, escalate, re-evaluate, generate support ticket",
    "✓  Troubleshooting guide (docs/client-adoption/troubleshooting-guide.md)",
    "○  Common error decision tree (what to do when X happens)",
    "○  Support tier definition (what is self-serve vs. escalate to Jesse)",
    "○  Response time SLAs documented for the support window",
  ].forEach((item) => {
    bul(item.slice(2).trim(), false, item.startsWith("✓") ? C.green : C.gold);
  });

  gap(0.3);
  h1("Readiness Summary");
  table(
    ["Question", "Status", "Key Gap"],
    [
      ["How long does onboarding take?", "PARTIAL", "No timing data from a real pilot; no recorded walkthrough"],
      ["How much founder involvement per pilot?", "NEEDED", "Not measured — first pilot must explicitly track this"],
      ["How much training is required?", "PARTIAL", "Tools exist; no video format; not tested with real client"],
      ["Can a client deploy without Jesse?", "PARTIAL", "Docs exist; not verified by a non-Jesse deployment"],
      ["Can a client generate evidence without Jesse?", "READY", "Fully automated; zero founder involvement required"],
      ["Can a client troubleshoot without Jesse?", "PARTIAL", "Services built; support playbook and decision tree needed"],
    ],
    [215, 65, CW - 280],
    {
      colStyles: [
        null,
        { bold: true, align: "center" },
        { italic: true, color: C.mid },
      ],
      colBg: [null, null, null],
    }
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 7 — Next Call Preparation
// ══════════════════════════════════════════════════════════════════════════════
function sec7(): void {
  sectionHeading("7", "What This Means For The Next Call", "Reframes, talking points, and priorities");

  callout(
    '"The actual tool itself is honestly the thing I\'m least concerned about. ' +
    'I\'m concerned about support, onboarding, operationalization, and deployment." — Olivia\n\n' +
    "She has already passed the technical credibility gate. The conversation is now about delivery confidence, " +
    "not technical validation. Price accordingly.",
    { bg: C.navy, border: C.accent, textColor: C.white, label: "THE MOST IMPORTANT THING SHE SAID" }
  );

  gap(0.3);
  h1("Key Reframes For The Conversation");
  table(
    ["Old framing", "Better framing"],
    [
      ["'Here is what CerbaSeal can do.'", "'Here is how a client deploys CerbaSeal and what we deliver during the pilot.'"],
      ["'391 tests passing, 15 audit checks.'", "'The technical layer is solved. The delivery question is: can your team adopt it without needing Jesse at every step?'"],
      ["'We charge €35k–€75k for a pilot.'", "'The pilot fee covers workflow mapping, deployment, training, evidence generation, and support — not just the software.'"],
      ["'After the pilot, you buy a license.'", "'The pilot converts to an annual license for ongoing access to the enforcement layer. The implementation work is already done.'"],
      ["'We're open to a channel relationship.'", "'What you're describing sounds like a channel model — which means we should talk about partner access fees, royalties, and support boundaries separately from the first pilot.'"],
    ],
    [(CW) / 2 - 2, (CW) / 2 - 2]
  );

  h1("What To Prioritize Building Next");
  para(
    "Stop researching competitors. The pricing data is sufficient to establish a defensible range. " +
    "The next investments should answer Olivia's actual questions — not add more pricing research.",
    { italic: true, color: C.mid }
  );
  table(
    ["Priority", "Deliverable", "Answers", "Time estimate"],
    [
      ["1 (highest)", "Founder-hour tracking template for first pilot", "Q2 — founder hours per pilot", "2–3 hours"],
      ["2", "30-minute operator onboarding video", "Q3 — how much training is required?", "1 day"],
      ["3", "Support decision tree — common issues and self-serve resolution", "Q6 — can client troubleshoot?", "3–4 hours"],
      ["4", "Deployment verification run by a non-Jesse person", "Q4 — can client deploy without Jesse?", "Half day"],
      ["5", "Channel partner term sheet template", "Model 3 discussion with Olivia", "3–4 hours"],
      ["6", "5-minute 'what is CerbaSeal' stakeholder explainer", "Olivia presenting to her clients", "Half day"],
    ],
    [70, 165, 130, CW - 365]
  );

  callout(
    "Pricing power comes from being able to answer 'yes' to all six of Olivia's questions " +
    "with specificity and evidence — not from another week of pricing research. " +
    "The technical credibility gate is passed. The delivery credibility gate is next.",
    { bg: C.goldLt, border: C.gold, textColor: C.gold, label: "FINAL RECOMMENDATION" }
  );

  h1("Recommended Opening For The Next Call");
  callout(
    "\"I want to separate three things we've been discussing in the same conversation, because they have " +
    "different structures and different price points.\n\n" +
    "The first is the pilot — which is a consulting engagement, not a software purchase. It covers " +
    "workflow mapping, deployment, training, and evidence generation. That's where €35k–€75k lives.\n\n" +
    "The second is the annual license after a successful pilot. That's ongoing access to the enforcement " +
    "layer — no implementation work, mostly software. That can be priced below the pilot, and that's normal.\n\n" +
    "The third is what I think you're actually describing — a channel relationship where you deliver " +
    "CerbaSeal to your clients. That has a completely different structure: partner access fee, per-pilot " +
    "royalty, support boundaries. Can we talk about which of these is the right frame for us right now?\"",
    { bg: C.ltBlue, border: C.accent, textColor: C.navy, label: "SUGGESTED OPENING", size: 9 }
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════════
async function main(): Promise<void> {
  console.log("\nCerbaSeal — Commercial Framework PDF\n");
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
  footer();

  doc.end();
  await new Promise<void>((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  const { statSync } = await import("node:fs");
  const kb = (statSync(OUT).size / 1024).toFixed(0);
  console.log(`  ✓  ${OUT}`);
  console.log(`  Size: ${kb} KB   Pages: ${pageNum}\n`);
}

main().catch((err) => { console.error(err); process.exit(1); });
