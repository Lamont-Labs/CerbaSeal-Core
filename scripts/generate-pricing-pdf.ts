/**
 * CerbaSeal — Pilot Pricing Model PDF
 * Research-Supported Commercial Pricing Brief
 * Run: pnpm generate:pricing-pdf
 */

import PDFDocument from "pdfkit";
import { createWriteStream } from "node:fs";
import { resolve } from "node:path";

const OUT = resolve(process.cwd(), "cerbaseal-pricing-brief.pdf");

// ── Dimensions ──────────────────────────────────────────────────────────────
const PW = 595.28;   // A4 width
const PH = 841.89;   // A4 height
const ML = 52;
const MR = 52;
const MT = 52;
const MB = 58;
const CW = PW - ML - MR;  // 491.28

// ── Colours ──────────────────────────────────────────────────────────────────
const C = {
  navy:    "#0B1E3E",
  blue:    "#1A3A6B",
  accent:  "#2563EB",
  gold:    "#B45309",
  goldLt:  "#FEF3C7",
  white:   "#FFFFFF",
  offWht:  "#F8FAFC",
  light:   "#F1F5F9",
  rule:    "#E2E8F0",
  mid:     "#64748B",
  dark:    "#1E293B",
  black:   "#0F172A",
  green:   "#15803D",
  greenBg: "#DCFCE7",
  red:     "#B91C1C",
  redBg:   "#FEE2E2",
  midBlue: "#93C5FD",
  ltBlue:  "#DBEAFE",
  teal:    "#0F766E",
  tealBg:  "#CCFBF1",
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
      Title: "CerbaSeal — Pilot Pricing Model",
      Author: "Jesse Lamont / Lamont Labs",
      Subject: "Research-Supported Commercial Pricing Brief",
    },
    autoFirstPage: false,
  });
}

// ── Page helpers ──────────────────────────────────────────────────────────────
function newPage(): void {
  doc.addPage();
  pageNum++;
  // 3px accent bar at top
  doc.rect(0, 0, PW, 3).fill(C.accent);
  doc.y = MT + 4;
}

function footer(): void {
  const y = PH - 44;
  doc.save()
    .moveTo(ML, y).lineTo(PW - MR, y)
    .strokeColor(C.rule).lineWidth(0.4).stroke()
    .restore();
  doc.fillColor(C.mid).font("Helvetica").fontSize(7.5)
    .text(
      "CerbaSeal — Pilot Pricing Model  ·  Research-Supported Commercial Brief  ·  CONFIDENTIAL",
      ML, y + 7, { width: CW - 30, lineBreak: false }
    );
  doc.fillColor(C.mid).font("Helvetica-Bold").fontSize(7.5)
    .text(String(pageNum), PW - MR - 14, y + 7, { width: 14, align: "right", lineBreak: false });
}

function ensureY(needed: number): void {
  if (doc.y + needed > PH - MB - 12) {
    footer();
    newPage();
  }
}

// ── Typography ────────────────────────────────────────────────────────────────
function sectionHeading(num: string, title: string): void {
  footer();
  newPage();
  // Full-width navy bar
  const barH = 38;
  doc.rect(0, MT + 4, PW, barH).fill(C.navy);
  // Accent left stripe
  doc.rect(0, MT + 4, 5, barH).fill(C.accent);
  doc.fillColor(C.midBlue).font("Helvetica").fontSize(8)
    .text(`SECTION ${num}`, ML, MT + 10, { lineBreak: false });
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(14)
    .text(title, ML, MT + 21, { lineBreak: false });
  doc.y = MT + barH + 16;
}

function h1(text: string): void {
  ensureY(36);
  doc.moveDown(0.6);
  doc.fillColor(C.navy).font("Helvetica-Bold").fontSize(13).text(text, ML, doc.y);
  const lineY = doc.y + 1;
  doc.save().moveTo(ML, lineY).lineTo(PW - MR, lineY)
    .strokeColor(C.accent).lineWidth(1.2).stroke().restore();
  doc.y = lineY + 8;
}

function h2(text: string): void {
  ensureY(24);
  doc.moveDown(0.4);
  doc.fillColor(C.blue).font("Helvetica-Bold").fontSize(10.5).text(text, ML, doc.y);
  doc.moveDown(0.15);
}

function para(text: string, opts?: { color?: string; size?: number; italic?: boolean }): void {
  const { color = C.dark, size = 9, italic = false } = opts ?? {};
  doc.fillColor(color).font(italic ? "Helvetica-Oblique" : "Helvetica").fontSize(size)
    .text(text, ML, doc.y, { width: CW, lineGap: 2.5 });
  doc.moveDown(0.2);
}

function bul(text: string, sub = false): void {
  ensureY(14);
  const indent = sub ? 16 : 0;
  const x = ML + indent;
  const bulletChar = sub ? "–" : "·";
  const bulletColor = sub ? C.mid : C.accent;
  const w = CW - indent;
  const curY = doc.y;
  doc.fillColor(bulletColor).font("Helvetica-Bold").fontSize(9)
    .text(bulletChar + " ", x, curY, { continued: true, lineBreak: false, width: 12 });
  doc.fillColor(C.dark).font("Helvetica").fontSize(9)
    .text(text, x + 12, curY, { width: w - 12, lineGap: 2 });
}

function rule(): void {
  doc.moveDown(0.3);
  ensureY(8);
  doc.save().moveTo(ML, doc.y).lineTo(PW - MR, doc.y)
    .strokeColor(C.rule).lineWidth(0.4).stroke().restore();
  doc.y += 8;
}

function gap(size = 0.4): void {
  doc.moveDown(size);
}

// ── Callout box ────────────────────────────────────────────────────────────────
function callout(text: string, opts?: { bg?: string; border?: string; textColor?: string }): void {
  const bg = opts?.bg ?? C.ltBlue;
  const border = opts?.border ?? C.accent;
  const tc = opts?.textColor ?? C.navy;
  const pad = 10;
  doc.moveDown(0.3);
  const h = doc.heightOfString(text, { width: CW - pad * 2 - 4, fontSize: 9.5, lineGap: 2 }) + pad * 2;
  ensureY(h + 4);
  const y0 = doc.y;
  doc.rect(ML, y0, CW, h).fill(bg);
  doc.rect(ML, y0, 4, h).fill(border);
  doc.fillColor(tc).font("Helvetica-Bold").fontSize(9.5)
    .text(text, ML + pad + 4, y0 + pad, { width: CW - pad * 2 - 4, lineGap: 2 });
  doc.y = y0 + h + 8;
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
    colStyles?: Array<{ bold?: boolean; color?: string; align?: "left" | "center" | "right" } | null>;
    colBg?: Array<string | null>;
  }
): void {
  const fs = opts?.fontSize ?? 8.5;
  const hBg = opts?.headerBg ?? C.navy;
  const alt = opts?.altRow !== false;
  const pad = { x: 8, y: 5 };
  const lg = 1.8;
  const cs = opts?.colStyles ?? [];
  const colBg = opts?.colBg ?? [];

  function cellH(text: string, w: number): number {
    return doc.heightOfString(text, { width: w - pad.x * 2, fontSize: fs, lineGap: lg });
  }

  function rowH(row: string[]): number {
    let h = 0;
    row.forEach((cell, i) => { h = Math.max(h, cellH(cell, widths[i])); });
    return h + pad.y * 2;
  }

  function drawRow(row: string[], bg: string, bold: boolean): void {
    const rh = bold ? 22 : rowH(row);
    ensureY(rh + 2);
    const ry = doc.y;

    // Row background
    doc.rect(ML, ry, CW, rh).fill(bg);

    // Column backgrounds
    if (!bold) {
      let bx = ML;
      colBg.forEach((cb, i) => {
        if (cb && widths[i]) {
          doc.rect(bx, ry, widths[i], rh).fill(cb);
        }
        bx += widths[i] || 0;
      });
    }

    // Cell border lines
    doc.save().rect(ML, ry, CW, rh).strokeColor(C.rule).lineWidth(0.3).stroke().restore();
    let cx = ML;
    widths.forEach((w, i) => {
      if (i > 0) {
        doc.save().moveTo(cx, ry).lineTo(cx, ry + rh)
          .strokeColor(C.rule).lineWidth(0.3).stroke().restore();
      }
      cx += w;
    });

    // Text
    cx = ML;
    row.forEach((cell, i) => {
      const cStyle = cs[i] ?? null;
      const isBold = bold || (cStyle?.bold ?? false);
      const txtColor = bold ? C.white : (cStyle?.color ?? C.dark);
      const align = cStyle?.align ?? "left";
      doc.fillColor(txtColor)
        .font(isBold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(bold ? fs + 0.5 : fs)
        .text(cell, cx + pad.x, ry + pad.y, {
          width: widths[i] - pad.x * 2,
          lineGap: lg,
          align,
        });
      cx += widths[i];
    });

    doc.y = ry + rh;
  }

  ensureY(28);
  drawRow(headers, hBg, true);
  rows.forEach((row, ri) => {
    const bg = alt ? (ri % 2 === 0 ? C.white : C.offWht) : C.white;
    drawRow(row, bg, false);
  });
  doc.moveDown(0.5);
}

// ── Tier card ─────────────────────────────────────────────────────────────────
function tierCard(
  n: string,
  name: string,
  tagline: string,
  fee: string,
  anchor: string | null,
  conversion: string,
  rows: Array<[string, string]>,
  accentColor: string,
  feeColor: string
): void {
  // Pre-compute content height
  const rowH = 15;
  const headerH = 28;
  const feeBadgeH = 46;
  const contentH = rows.length * rowH + headerH + feeBadgeH + 20;
  ensureY(contentH + 10);

  const y0 = doc.y;
  const totalH = contentH;

  // Card border
  doc.rect(ML, y0, CW, totalH).fill(C.white);
  doc.save().rect(ML, y0, CW, totalH).strokeColor(accentColor).lineWidth(1).stroke().restore();

  // Header bar
  doc.rect(ML, y0, CW, headerH).fill(accentColor);
  doc.rect(ML, y0, 36, headerH).fill(C.navy);

  // Tier number
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(15)
    .text(`T${n}`, ML, y0 + 6, { width: 36, align: "center", lineBreak: false });

  // Tier name
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(11)
    .text(name, ML + 42, y0 + 4, { lineBreak: false });
  doc.fillColor(C.white).font("Helvetica-Oblique").fontSize(8)
    .text(tagline, ML + 42, y0 + 17, { lineBreak: false });

  // Fee badge
  const badgeY = y0 + headerH + 6;
  doc.rect(ML + 6, badgeY, CW - 12, feeBadgeH - 4).fill(C.light);
  doc.fillColor(feeColor).font("Helvetica-Bold").fontSize(16)
    .text(fee, ML + 6, badgeY + 6, { width: CW - 12, align: "center", lineBreak: false });
  if (anchor) {
    doc.fillColor(C.mid).font("Helvetica-Oblique").fontSize(8)
      .text("Preferred anchor: " + anchor, ML + 6, badgeY + 26, { width: CW - 12, align: "center", lineBreak: false });
  }

  // Rows
  let ry = y0 + headerH + feeBadgeH + 8;
  rows.forEach(([label, value], ri) => {
    const bg = ri % 2 === 0 ? C.white : C.offWht;
    doc.rect(ML + 1, ry, CW - 2, rowH).fill(bg);
    doc.fillColor(C.mid).font("Helvetica-Bold").fontSize(8)
      .text(label.toUpperCase(), ML + 10, ry + 4, { lineBreak: false, width: 85 });
    doc.fillColor(C.dark).font("Helvetica").fontSize(8)
      .text(value, ML + 98, ry + 4, { lineBreak: false, width: CW - 108 });
    ry += rowH;
  });

  // Conversion
  const convY = ry + 4;
  doc.rect(ML + 1, convY, CW - 2, 14).fill(C.ltBlue);
  doc.fillColor(C.blue).font("Helvetica-Bold").fontSize(8)
    .text("→  CONVERSION TARGET: ", ML + 10, convY + 3, { continued: true, lineBreak: false });
  doc.fillColor(C.navy).font("Helvetica").fontSize(8)
    .text(conversion, { lineBreak: false });

  doc.y = convY + 18;
  doc.moveDown(0.5);
}

// ═══════════════════════════════════════════════════════════════════════════
// COVER PAGE
// ═══════════════════════════════════════════════════════════════════════════
function cover(): void {
  doc.addPage();
  pageNum++;

  // Full-bleed navy header block
  const headerH = 220;
  doc.rect(0, 0, PW, headerH).fill(C.navy);
  doc.rect(0, headerH, PW, 4).fill(C.accent);
  doc.rect(0, 0, 5, headerH).fill(C.accent);

  // Label
  doc.fillColor(C.midBlue).font("Helvetica").fontSize(8.5)
    .text("LAMONT LABS  ·  EXECUTION GOVERNANCE INFRASTRUCTURE  ·  CONFIDENTIAL", 0, 50, { width: PW, align: "center" });

  // Main title
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(32)
    .text("CerbaSeal", 0, 72, { width: PW, align: "center" });

  // Subtitle
  doc.fillColor(C.ltBlue).font("Helvetica-Bold").fontSize(14)
    .text("Pilot Pricing Model", 0, 116, { width: PW, align: "center" });

  // Description
  doc.fillColor(C.midBlue).font("Helvetica").fontSize(10)
    .text("Research-Supported Commercial Pricing Brief", 0, 140, { width: PW, align: "center" });

  // Prepared for strip
  doc.rect(ML + 80, 162, CW - 160, 42).fill(C.blue);
  doc.fillColor(C.midBlue).font("Helvetica").fontSize(8)
    .text("PREPARED FOR", ML + 80, 170, { width: CW - 160, align: "center" });
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(10)
    .text("Partner Pricing Discussion", ML + 80, 182, { width: CW - 160, align: "center" });
  doc.fillColor(C.midBlue).font("Helvetica").fontSize(7.5)
    .text(`${new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}`, ML + 80, 194, { width: CW - 160, align: "center" });

  doc.y = headerH + 24;

  // Key message callout
  callout(
    "CerbaSeal is AI governance enforcement infrastructure. This document establishes a " +
    "research-supported commercial pricing model for partner discussions, informed by adjacent " +
    "market benchmarks across AI governance platforms, compliance automation, enterprise pilots, " +
    "and AI implementation consulting.",
    { bg: C.ltBlue, border: C.accent, textColor: C.navy }
  );

  // Recommended range box
  gap(0.2);
  const boxY = doc.y;
  const boxH = 78;
  doc.rect(ML, boxY, CW, boxH).fill(C.navy);
  doc.rect(ML, boxY, 5, boxH).fill(C.gold);
  doc.fillColor(C.midBlue).font("Helvetica").fontSize(8)
    .text("RECOMMENDED FIRST COMMERCIAL PILOT", ML, boxY + 12, { width: CW, align: "center", lineBreak: false });
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(26)
    .text("€35,000 – €75,000", ML, boxY + 26, { width: CW, align: "center", lineBreak: false });
  doc.fillColor(C.goldLt).font("Helvetica-Bold").fontSize(10)
    .text("Preferred anchor range: €45,000 – €60,000", ML, boxY + 57, { width: CW, align: "center", lineBreak: false });
  doc.y = boxY + boxH + 14;

  // Table of contents
  doc.fillColor(C.navy).font("Helvetica-Bold").fontSize(10.5).text("CONTENTS", ML, doc.y);
  const lineY2 = doc.y + 1;
  doc.save().moveTo(ML, lineY2).lineTo(PW - MR, lineY2)
    .strokeColor(C.accent).lineWidth(1.2).stroke().restore();
  doc.y = lineY2 + 10;

  const toc = [
    ["1", "Executive Summary"],
    ["2", "Pricing Methodology — Five Reference Markets"],
    ["3", "Source Pricing Anchors — AI Governance, GRC, Pilots, Consulting"],
    ["4", "CerbaSeal-Specific Pricing Inputs"],
    ["5", "Pilot Pricing Matrix — Tiers 0 through 4"],
    ["6", "Pricing Adjustment Matrix"],
    ["7", "Annual Licensing Framework"],
    ["8", "Pricing Constraints & Recommended Partner Guidance"],
  ];

  toc.forEach(([n, title], i) => {
    ensureY(18);
    const ry = doc.y;
    const bg = i % 2 === 0 ? C.light : C.white;
    doc.rect(ML, ry, CW, 16).fill(bg);
    doc.rect(ML, ry, 28, 16).fill(C.accent);
    doc.fillColor(C.white).font("Helvetica-Bold").fontSize(8.5)
      .text(n, ML, ry + 4, { width: 28, align: "center", lineBreak: false });
    doc.fillColor(C.dark).font("Helvetica").fontSize(8.5)
      .text(title, ML + 36, ry + 4, { lineBreak: false });
    doc.y = ry + 16;
  });

  // Author strip
  doc.moveDown(0.6);
  ensureY(28);
  const authorY = doc.y;
  doc.rect(ML, authorY, CW, 26).fill(C.light);
  doc.fillColor(C.mid).font("Helvetica").fontSize(8)
    .text("Author  ·  Jesse Lamont, Lamont Labs  ·  jesse@lamontlabs.io", ML, authorY + 5, { width: CW, align: "center", lineBreak: false });
  doc.fillColor(C.mid).font("Helvetica-Oblique").fontSize(7.5)
    .text(
      "This document contains commercially sensitive information. Distribution is limited to named partner contacts.",
      ML, authorY + 15, { width: CW, align: "center", lineBreak: false }
    );
  doc.y = authorY + 26;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1 — Executive Summary
// ═══════════════════════════════════════════════════════════════════════════
function sec1(): void {
  sectionHeading("1", "Executive Summary");

  callout(
    "CerbaSeal should not be priced as a generic SaaS tool. The most defensible pricing frame is: " +
    "AI governance enforcement infrastructure + pilot implementation + evidence generation + operational support.",
    { bg: C.ltBlue, border: C.accent, textColor: C.navy }
  );

  gap();
  para(
    "This is supported by the current system architecture. CerbaSeal includes a deterministic " +
    "execution gate, audit/evidence pipeline, replay service, diagnostic/support services, runtime " +
    "configuration, four integration starter kits, pilot configuration generation, evidence-report " +
    "generation, and a Founder Independence Kit."
  );

  h2("Recommended Commercial Bands");
  table(
    ["Band", "Price Range", "Applies When"],
    [
      ["Discovery / Readiness Assessment", "€5,000 – €15,000", "Client unclear on fit; early scoping; no confirmed workflow"],
      ["Validation Pilot", "€15,000 – €35,000", "Synthetic/test-only; technically capable early adopter"],
      ["Controlled Workflow Pilot (primary)", "€35,000 – €75,000", "One real or production-adjacent workflow; best first paid pilot"],
      ["Preferred anchor — first pilot", "€45,000 – €60,000", "Starting target for a well-scoped controlled workflow pilot"],
      ["Regulated Evidence Pilot", "€75,000 – €150,000", "Fintech, insurance, health, legal, government-adjacent"],
      ["Strategic Anchor Pilot", "€150,000 – €250,000+", "Flagship deployment; multiple stakeholder groups; executive visibility"],
    ],
    [155, 100, CW - 255],
    {
      colStyles: [
        { bold: false },
        { bold: true, color: C.navy, align: "center" },
        null,
      ],
      colBg: [null, C.ltBlue, null],
    }
  );

  callout(
    "Engagements below €25,000 should be treated as discovery, validation, or strategic discounting — " +
    "not a full operational pilot. The full pilot price reflects: one governed workflow + workflow mapping + " +
    "deployment support + training + evidence package + bounded support window.",
    { bg: C.goldLt, border: C.gold, textColor: C.gold }
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2 — Pricing Methodology
// ═══════════════════════════════════════════════════════════════════════════
function sec2(): void {
  sectionHeading("2", "Pricing Methodology");

  para(
    "CerbaSeal does not have a direct competitor with public pricing. Pricing is therefore " +
    "triangulated from five adjacent markets, each of which captures a dimension of the " +
    "value CerbaSeal delivers."
  );

  table(
    ["Reference Category", "Why Relevant to CerbaSeal"],
    [
      ["AI Governance Platforms", "CerbaSeal supports runtime governance, oversight, evidence generation, and control — the core functions of this category."],
      ["Compliance Automation / GRC Platforms", "CerbaSeal produces evidence and audit artifacts, though it is not a full compliance suite. GRC pricing establishes a lower bound."],
      ["Policy Enforcement Infrastructure", "CerbaSeal acts as a mandatory decision gate — closer to runtime control infrastructure than documentation tooling."],
      ["Enterprise Paid Pilots / POCs", "First deployments will likely be pilot-led, not self-service SaaS. Enterprise pilot pricing models are the most direct commercial parallel."],
      ["AI Consulting / Implementation", "Early pilots include workflow mapping, onboarding, deployment, training, and support — implementation-weight work that must be priced accordingly."],
    ],
    [148, CW - 148]
  );

  h2("Regulatory Context Supporting Demand");
  para(
    "The EU AI Act and NIS2 create direct demand for governance evidence. The European Commission " +
    "specifies that high-risk AI systems require logging for traceability, documentation, information " +
    "to deployers, human oversight, robustness, cybersecurity, and accuracy. Article 14 of the EU AI " +
    "Act centres human oversight on preventing or minimizing risks from high-risk AI systems. NIS2 " +
    "increases vendor and supply-chain scrutiny, including supply-chain security and cybersecurity " +
    "risk-management procedures."
  );

  callout(
    "Gartner projects global AI governance platform spending at $492 million in 2026 and over $1 billion " +
    "by 2030. This positions CerbaSeal in a growing and increasingly funded budget category — not a " +
    "discretionary add-on.",
    { bg: C.tealBg, border: C.teal, textColor: C.teal }
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3 — Source Pricing Anchors
// ═══════════════════════════════════════════════════════════════════════════
function sec3(): void {
  sectionHeading("3", "Source Pricing Anchors");

  h1("3.1 — AI Governance Platform Anchor");
  para(
    "Gartner defines AI governance platforms as tools that help organizations adhere to policy, " +
    "regulations, and standards across responsible AI principles, centralizing trust, risk, and security " +
    "controls. These platforms are enterprise-priced and frequently use custom or contract-specific pricing."
  );
  para(
    "Market research places AI governance platform spend in the tens of thousands to low six figures " +
    "annually for many buyers, with enterprise deployments potentially higher. Gartner's projected " +
    "market growth supports the argument that governance infrastructure is becoming a funded category."
  );
  callout(
    "Implication: CerbaSeal should not be priced below low-end compliance tooling when positioned as " +
    "runtime enforcement and evidence infrastructure — the higher-value function within this category.",
    { bg: C.ltBlue, border: C.accent, textColor: C.navy }
  );

  h1("3.2 — Compliance Automation / GRC Anchor");
  para(
    "Compliance automation platforms provide a useful lower-bound benchmark. These tools are less " +
    "capable than CerbaSeal (primarily documentation and evidence collection, not runtime enforcement), " +
    "which means their pricing should be treated as a floor, not a ceiling."
  );

  table(
    ["Vendor / Category", "Reported Pricing"],
    [
      ["Vanta", "Starting ~$10,000/year; scaling to $80,000+ at Scale/Enterprise. Median deal size ~$19,000/year; upper-tier contracts ~$49,000/year."],
      ["Drata", "Starter packages ~$15,000–$25,000/year for companies with 25–75 employees. Median buyer ~$25,000/year; reported range $10,250–$42,750/year."],
      ["Secureframe", "Small/mid-sized companies pursuing SOC 2 alone: ~$12,000–$25,000/year."],
      ["SOC 2 total cost (Secureframe estimate)", "Most companies spend $10,000–$150,000 to prepare and complete SOC 2. Full breakdown: $80,000–$350,000 depending on scope."],
    ],
    [155, CW - 155]
  );
  callout(
    "Implication: Companies already pay five figures annually for evidence automation and compliance " +
    "readiness — tooling less capable than CerbaSeal. A CerbaSeal pilot should not be priced as a " +
    "small add-on when it includes implementation, workflow mapping, evidence generation, and support.",
    { bg: C.ltBlue, border: C.accent, textColor: C.navy }
  );

  h1("3.3 — Enterprise Pilot / POC Anchor");
  para(
    "Paid enterprise pilots are commonly priced as a fraction of expected annual contract value. " +
    "A standard enterprise pilot model recommends charging 10–30% of annual contract value, " +
    "with the fee credited toward the full contract on conversion."
  );
  bul("Snowflake-style example: $25,000–$50,000 for a 90-day pilot");
  bul("Enterprise POCs commonly last 2–8 weeks and require solution engineers and implementation specialists");
  bul("Paid pilots are used for complex integrations, custom requirements, and technical validation");
  gap(0.3);
  callout(
    "Implication: A meaningful CerbaSeal pilot should be paid. A free or very low-cost pilot " +
    "underprices the integration, training, support, and evidence-generation work included in every " +
    "Tier 1 or Tier 2 engagement.",
    { bg: C.ltBlue, border: C.accent, textColor: C.navy }
  );

  h1("3.4 — AI Consulting / Implementation Anchor");
  para(
    "AI implementation work is expensive because it requires discovery, workflow mapping, deployment, " +
    "integration, training, and iteration. Implementation-weight work in a CerbaSeal pilot must be " +
    "priced accordingly."
  );

  table(
    ["Provider Type", "Reported Range"],
    [
      ["Independent AI consultants", "$150 – $350/hour"],
      ["Boutique AI consultancies", "$300 – $600/hour"],
      ["Major strategy firms", "$500 – $1,000+/hour"],
      ["AI strategy consulting (advisory source)", "$200 – $400/hour"],
      ["Full implementation support (monthly)", "$15,000 – $25,000/month"],
    ],
    [210, CW - 210]
  );
  callout(
    "Implication: If a CerbaSeal pilot is priced too close to ordinary SaaS, it fails to account " +
    "for workflow mapping, deployment support, training, support windows, and pilot review — " +
    "all of which are included in Tier 1 and Tier 2 engagements.",
    { bg: C.ltBlue, border: C.accent, textColor: C.navy }
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4 — CerbaSeal-Specific Inputs
// ═══════════════════════════════════════════════════════════════════════════
function sec4(): void {
  sectionHeading("4", "CerbaSeal-Specific Pricing Inputs");

  h1("4.1 — Technical Proof Base");
  para(
    "The following proof areas are directly verifiable from the repository. They reduce technical " +
    "credibility risk and support the higher end of the pricing range."
  );
  table(
    ["Proof Area", "Current Status"],
    [
      ["Test suite", "419/419 passing tests · 16 test files · zero regressions"],
      ["Repo audit", "15/15 checks passing"],
      ["Invariants", "12 invariants (INV-01→INV-12) · 100% test coverage verified"],
      ["Import boundaries", "0 violations · 79 files scanned"],
      ["Runtime dependencies", "Zero runtime npm dependencies in the enforcement core"],
      ["Audit trail", "File-backed append-only JSONL log with SHA-256 hash chain"],
      ["Replay service", "Re-runs past decisions through a fresh gate instance — proves determinism"],
      ["Support services", "Health, integrity, diagnostics, operator action, certificate formatting"],
    ],
    [145, CW - 145]
  );

  h1("4.2 — Adoption Layer & Founder-Dependency Reduction");
  para(
    "The adoption layer materially improves pricing confidence. Founder dependency normally suppresses " +
    "pricing — repeatable onboarding and handoff materials support higher pricing by reducing perceived " +
    "delivery risk."
  );
  table(
    ["Adoption Asset", "Pricing Impact"],
    [
      ["Authority Class Registry (cerbaseal.config.json)", "Reduces custom code needs for client-specific roles. No TypeScript source changes required to add new client authority classes."],
      ["Integration Starter Kits (×4)", "Reduces developer onboarding and implementation uncertainty. Four working examples cover REST API, financial approval, fraud workflow, and agent integration patterns."],
      ["Workflow Config Generator (generate-pilot-config)", "Reduces manual client setup effort. Client fills wizard-input.json; script generates complete 4-file pilot config package."],
      ["Pilot Evidence Package Generator (generate-evidence-report)", "Reduces manual reporting effort. Reads proof-snapshot.json and produces 3-file compliance evidence package automatically."],
      ["Founder Independence Kit", "Reduces perceived vendor/founder dependency. 8-phase onboarding sequence runnable by the client without requiring Jesse's involvement at each step."],
    ],
    [175, CW - 175]
  );

  callout(
    "The system breakdown explicitly states these five adoption priorities were built to let a client " +
    "onboard, configure, pilot, and generate compliance evidence without requiring Jesse to be present " +
    "at every step. This is the commercial argument for pricing at the higher end of the band.",
    { bg: C.greenBg, border: C.green, textColor: C.green }
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5 — Pilot Pricing Matrix
// ═══════════════════════════════════════════════════════════════════════════
function sec5(): void {
  sectionHeading("5", "Pilot Pricing Matrix — Tiers 0 through 4");

  para(
    "Five commercial tiers covering the full range from early discovery through strategic anchor " +
    "deployments. Tier 2 is the recommended first commercial pilot engagement.",
    { color: C.mid }
  );
  gap(0.2);

  // Tier 0
  tierCard(
    "0", "Discovery / Readiness Assessment",
    "Paid qualification and scoping — not a pilot",
    "€5,000 – €15,000",
    null,
    "Upgrade to Tier 1 or Tier 2 pilot",
    [
      ["Purpose", "Determine if the client is suitable for a CerbaSeal pilot"],
      ["Scope", "Workflow discovery, readiness assessment, deployment feasibility, compliance/evidence needs review"],
      ["Deployment", "None"],
      ["Duration", "1–2 weeks"],
      ["Client fit", "Interested but unclear fit; early-stage client; no confirmed workflow"],
    ],
    C.mid, C.mid
  );

  // Tier 1
  tierCard(
    "1", "Validation Pilot",
    "Demonstrate enforcement and evidence model in a limited setting",
    "€15,000 – €35,000",
    null,
    "Tier 2 controlled workflow pilot or annual license",
    [
      ["Purpose", "Demonstrate CerbaSeal's enforcement and evidence model in a limited setting"],
      ["Scope", "One workflow, synthetic/test data, starter-kit integration, limited training, basic evidence review"],
      ["Deployment", "Local, sandbox, or controlled non-production environment"],
      ["Duration", "30–45 days"],
      ["Client fit", "Early adopter; technically capable; low regulatory complexity"],
    ],
    C.blue, C.blue
  );

  // Tier 2 (hero)
  tierCard(
    "2", "Controlled Workflow Pilot",
    "PRIMARY — prove CerbaSeal against one real or production-adjacent workflow",
    "€35,000 – €75,000",
    "€45,000 – €60,000",
    "Annual license + implementation expansion",
    [
      ["Purpose", "Prove CerbaSeal against one real or production-adjacent workflow"],
      ["Scope", "Workflow mapping, deployment support, runtime config, operator training, support window, evidence package"],
      ["Deployment", "Client-controlled test environment, sandbox, or production-adjacent environment"],
      ["Duration", "45–90 days"],
      ["Client fit", "Best first paid pilot — has one defined workflow and wants to prove governed execution"],
    ],
    C.accent, C.accent
  );

  // Tier 3
  tierCard(
    "3", "Regulated Evidence Pilot",
    "Governance evidence for a regulated or high-consequence workflow",
    "€75,000 – €150,000",
    null,
    "Multi-workflow license or strategic implementation package",
    [
      ["Purpose", "Demonstrate governance evidence for a regulated or high-consequence workflow"],
      ["Scope", "All of Tier 2 + deeper stakeholder training, advisory evidence review, expanded reporting, governance mapping"],
      ["Deployment", "Client-controlled or EU-hosted environment preferred"],
      ["Duration", "60–120 days"],
      ["Client fit", "Fintech, insurance, health, legal, government-adjacent, AI compliance-sensitive environments"],
    ],
    C.gold, C.gold
  );

  // Tier 4
  tierCard(
    "4", "Strategic Anchor Pilot",
    "Flagship deployment and referenceable commercial proof point",
    "€150,000 – €250,000+",
    null,
    "Enterprise license, partner expansion, or multi-client channel offering",
    [
      ["Purpose", "Build a flagship deployment and referenceable commercial proof point"],
      ["Scope", "Executive reporting, multiple stakeholder groups, expanded onboarding, formal evidence package, roadmap planning, possible second workflow"],
      ["Deployment", "Client-controlled or sovereign-hosted architecture"],
      ["Duration", "90–180 days"],
      ["Client fit", "Larger regulated client or strategic reference account with high executive visibility"],
    ],
    C.navy, C.navy
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 6 — Adjustment Matrix
// ═══════════════════════════════════════════════════════════════════════════
function sec6(): void {
  sectionHeading("6", "Pricing Adjustment Matrix");

  h1("6.1 — Upward Adjustments");
  para("Apply these when the engagement complexity or client profile increases delivery burden.", { color: C.mid });
  table(
    ["Factor", "Adjustment", "Rationale"],
    [
      ["Client-controlled deployment", "+10–20%", "More deployment coordination, environment review, and support complexity"],
      ["Weak technical team", "+15–30%", "More onboarding, training, troubleshooting, and implementation burden on CerbaSeal side"],
      ["Regulated industry", "+15–30%", "More evidence review, stakeholder scrutiny, and documentation burden"],
      ["Security / procurement review", "+10–25%", "Requires additional materials, meetings, and response cycles"],
      ["Multiple stakeholder groups", "+10–25%", "More training, alignment, and approval-chain mapping required"],
      ["Poorly defined workflow", "+10–20%", "More discovery and mapping required before pilot can begin"],
      ["Extended support window", "+10–30%", "More operational commitment and founder/partner time"],
      ["Formal evidence package required", "+10–20%", "Increases reporting and review workload beyond standard output"],
    ],
    [175, 68, CW - 243],
    {
      colStyles: [null, { bold: true, color: C.red, align: "center" }, null],
      colBg: [null, C.redBg, null],
    }
  );

  h1("6.2 — Downward Adjustments");
  para("Apply these when client profile or scope reduces delivery burden — strategic discounts should always have a clear rationale.", { color: C.mid });
  table(
    ["Factor", "Adjustment", "Rationale"],
    [
      ["Strong technical team", "–5 to –15%", "Less onboarding and support burden on CerbaSeal side"],
      ["Synthetic / test-only pilot", "–10 to –20%", "Lower risk, less operational complexity, shorter review cycles"],
      ["Strategic reference client", "–10 to –20%", "Discount justified only with clear reference rights or confirmed follow-on path"],
      ["Clean one-workflow scope", "–5 to –10%", "Reduced discovery and implementation risk — faster to production"],
      ["Integration pattern matches starter kit", "–5 to –15%", "Faster deployment and validation — lower implementation lift"],
    ],
    [175, 75, CW - 250],
    {
      colStyles: [null, { bold: true, color: C.green, align: "center" }, null],
      colBg: [null, C.greenBg, null],
    }
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 7 — Annual Licensing Framework
// ═══════════════════════════════════════════════════════════════════════════
function sec7(): void {
  sectionHeading("7", "Annual Licensing Framework");

  callout(
    "Annual licensing should not be finalized until after at least one successful pilot. " +
    "The ranges below are directional — pilot data on usage, support burden, and client ROI " +
    "will produce the evidence needed to anchor these ranges with confidence.",
    { bg: C.goldLt, border: C.gold, textColor: C.gold }
  );
  gap(0.3);

  table(
    ["License Type", "Client Profile", "Annual Range"],
    [
      ["Emerging Market License", "Seed / Series A / small AI company", "€25,000 – €75,000"],
      ["Growth License", "Series B / scale-up / mid-market", "€75,000 – €250,000"],
      ["Regulated Enterprise License", "Financial services, insurance, healthcare, legal, government-adjacent", "€250,000 – €750,000+"],
      ["Strategic Platform License", "Multi-workflow, multi-entity, high-consequence deployment", "€750,000+"],
    ],
    [145, 185, CW - 330],
    {
      colStyles: [{ bold: true }, null, { bold: true, color: C.accent, align: "center" }],
      colBg: [null, null, C.ltBlue],
    }
  );

  h2("Future Quantified ROI Evidence");
  para("The strongest future pricing evidence for annual licensing would include:");
  [
    "Time saved in audit preparation per governed workflow",
    "Reduction in manual approval review burden",
    "Number of governed decisions processed per month",
    "Number of unauthorized actions prevented",
    "Evidence retrieval time vs. manual baseline",
    "Support hours required per client per quarter",
    "Client willingness to continue or expand post-pilot",
  ].forEach((item) => bul(item));
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 8 — Constraints & Partner Guidance
// ═══════════════════════════════════════════════════════════════════════════
function sec8(): void {
  sectionHeading("8", "Pricing Constraints & Partner Guidance");

  h1("Current Pricing Constraints");

  h2("Constraint 1 — No Completed Customer Pilot");
  para(
    "This is the largest pricing limiter. Technical proof is strong and verifiable, but " +
    "customer proof does not yet exist. The first successful pilot will be the single most " +
    "important pricing event — it converts internal evidence into external validation."
  );

  h2("Constraint 2 — No Quantified ROI");
  para(
    "Until at least one pilot has been completed and measured, ROI claims are directional. " +
    "The pilot design should explicitly plan for ROI data collection from day one — " +
    "support hours, decision volume, approval cycle time, evidence retrieval time."
  );

  h2("Constraint 3 — Emerging Category");
  para(
    "CerbaSeal sits between AI governance, enforcement infrastructure, compliance evidence, " +
    "and AI agent control. Buyers may require education before they understand the value category. " +
    "Category education is a commercial cost that must be factored into early pilot pricing."
  );

  h2("Constraint 4 — Not a Compliance Certification");
  para(
    "CerbaSeal can support governance evidence, human oversight records, and traceability, " +
    "but it should not be presented as AI Act compliance, GDPR compliance, SOC 2 compliance, " +
    "or legal certification. This aligns with the EU AI Act's emphasis on logging, documentation, " +
    "and human oversight, but does not replace legal or regulatory assessment."
  );

  rule();
  h1("Recommended Partner Language");
  callout(
    '"For a first CerbaSeal pilot, the recommended commercial range is €35,000–€75,000, with ' +
    '€45,000–€60,000 as the most realistic starting target for a controlled one-workflow pilot. ' +
    'Engagements below €25,000 should be treated as discovery or validation only, not a full ' +
    'operational pilot."',
    { bg: C.navy, border: C.accent, textColor: C.white }
  );

  gap(0.3);
  h2("What This Price Reflects");
  para("The pilot price is not for standalone software. It includes:");
  [
    "One governed workflow in a client environment",
    "Workflow mapping and approval-chain configuration",
    "Deployment assistance and runtime configuration",
    "Client and operator onboarding and training",
    "Role and approval authority mapping",
    "Evidence review and pilot completion documentation",
    "Bounded support window during the pilot period",
    "Pilot completion review with stakeholders",
    "Repeatable adoption assets (starter kits, config generator, evidence generator)",
    "Generation of a compliance-grade governance evidence package",
  ].forEach((item) => bul(item));

  h1("Final Summary — Recommended Commercial Positions");
  table(
    ["Stage", "Recommended Price"],
    [
      ["Discovery / Readiness Assessment", "€5,000 – €15,000"],
      ["Validation Pilot", "€15,000 – €35,000"],
      ["Controlled Workflow Pilot (first commercial pilot)", "€35,000 – €75,000"],
      ["Preferred first-pilot anchor", "€45,000 – €60,000"],
      ["Regulated Evidence Pilot", "€75,000 – €150,000"],
      ["Strategic Anchor Pilot", "€150,000 – €250,000+"],
      ["Annual (Emerging Market)", "€25,000 – €75,000"],
      ["Annual (Growth)", "€75,000 – €250,000"],
      ["Annual (Regulated Enterprise)", "€250,000 – €750,000+"],
      ["Annual (Strategic Platform)", "€750,000+"],
    ],
    [CW - 110, 110],
    {
      colStyles: [null, { bold: true, color: C.accent, align: "center" }],
      colBg: [null, C.ltBlue],
    }
  );

  callout(
    "CerbaSeal should be positioned as: AI governance enforcement infrastructure for controlled, " +
    "evidence-producing, human-overseen AI-assisted workflows. Priced as: software + workflow mapping + " +
    "deployment support + training + evidence package + bounded support. This is the most defensible " +
    "commercial structure based on source data, system capabilities, and adjacent market benchmarks.",
    { bg: C.navy, border: C.accent, textColor: C.white }
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════
async function main(): Promise<void> {
  console.log("\nCerbaSeal — Pilot Pricing Model PDF\n");
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
