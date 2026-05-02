/**
 * review-portal-routes.test.ts
 *
 * Tests for all review portal pages and JSON endpoints.
 * No HTTP server started — imports route data and page files directly.
 * Preserves all existing scenario route coverage.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { REVIEW_SUMMARY, PILOT_READINESS, SECURITY_SUMMARY } from "../../examples/browser-demo/review-portal.js";
import { getRejectScenario, getHoldScenario, getAllowScenario } from "../../examples/browser-demo/scenarios.js";
import { buildDemoResponse } from "../../examples/browser-demo/response-builder.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

function readPage(filename: string): string {
  return readFileSync(join(__dirname, "../../examples/browser-demo/pages", filename), "utf-8");
}

function readIndex(): string {
  return readFileSync(join(__dirname, "../../examples/browser-demo/index.html"), "utf-8");
}

// ── / (entry surface) ────────────────────────────────────────────────────
describe("/ entry surface", () => {
  const html = readIndex();

  it("contains the system name CerbaSeal", () => {
    expect(html).toContain("CerbaSeal");
  });
  it("contains the deterministic execution enforcement subtitle", () => {
    expect(html).toContain("Deterministic execution enforcement");
  });
  it("contains the one-line definition", () => {
    expect(html).toContain("AI systems can propose actions");
    expect(html).toContain("CerbaSeal decides whether those actions are allowed to execute");
  });
  it("contains the three core function bullets", () => {
    expect(html).toContain("Blocks unauthorized execution attempts");
    expect(html).toContain("Enforces approval, control, and trust requirements");
    expect(html).toContain("Produces verifiable evidence for every decision");
  });
  it("contains the Live Enforcement Scenarios section label", () => {
    expect(html).toContain("Live Enforcement Scenarios");
  });
  it("contains all three scenario buttons", () => {
    expect(html).toContain('id="btn-reject"');
    expect(html).toContain('id="btn-hold"');
    expect(html).toContain('id="btn-allow"');
  });
  it("contains the Review-ready core status", () => {
    expect(html).toContain("Review-ready core");
    expect(html).toContain("Not yet client deployed");
  });
  it("contains currently implemented and not-yet-implemented lists", () => {
    expect(html).toContain("Currently implemented");
    expect(html).toContain("Not yet implemented");
    expect(html).toContain("Deterministic execution gate");
    expect(html).toContain("Third-party security review");
  });
  it("contains links to all reviewer pages", () => {
    expect(html).toContain('href="/review"');
    expect(html).toContain('href="/pilot"');
    expect(html).toContain('href="/security"');
    expect(html).toContain('href="/deployment"');
  });
  it("contains For Reviewers section with review buttons", () => {
    expect(html).toContain("For Reviewers");
    expect(html).toContain("Review Portal");
    expect(html).toContain("Pilot Readiness");
    expect(html).toContain("Security Summary");
    expect(html).toContain("Deployment Posture");
  });
  it("contains the canonical limitation notice", () => {
    expect(html).toContain("review-ready core demo, not a production client deployment");
  });
  it("loads the client.js script", () => {
    expect(html).toContain('src="/client.js"');
  });
  it("does not claim production readiness", () => {
    expect(html).not.toContain("production-ready");
    expect(html).not.toContain("fully compliant");
    expect(html).not.toContain("regulator-approved");
    expect(html).not.toContain("enterprise-grade");
  });
});

// ── /review page ──────────────────────────────────────────────────────────
describe("/review page content", () => {
  const html = readPage("review.html");

  it("contains the enforcement spine definition", () => {
    expect(html).toContain("deterministic execution enforcement spine");
  });
  it("contains the limitation notice", () => {
    expect(html).toContain("review-ready core demo, not a production client deployment");
  });
  it("contains nav links to all portal pages", () => {
    expect(html).toContain('href="/pilot"');
    expect(html).toContain('href="/security"');
    expect(html).toContain('href="/deployment"');
  });
  it("contains implemented / not-yet sections", () => {
    expect(html).toContain("Currently implemented");
    expect(html).toContain("Not yet implemented");
  });
  it("contains scenario cards with invariant references", () => {
    expect(html).toContain("INV-05");
    expect(html).toContain("INV-03");
  });
  it("does not claim production readiness", () => {
    expect(html).not.toContain("production-ready");
    expect(html).not.toContain("fully compliant");
  });
});

// ── /pilot page ──────────────────────────────────────────────────────────
describe("/pilot page content", () => {
  const html = readPage("pilot.html");

  it("contains 'one workflow' language", () => {
    expect(html).toContain("one workflow");
  });
  it("contains the pilot thesis with 'one client'", () => {
    expect(html).toContain("one client");
  });
  it("contains the limitation notice", () => {
    expect(html).toContain("review-ready core demo, not a production client deployment");
  });
  it("contains intake checklist items", () => {
    expect(html).toContain("intake-item");
  });
  it("contains client-controlled language", () => {
    expect(html.toLowerCase()).toContain("client");
  });
  it("contains working agreement section", () => {
    expect(html).toContain("working agreement");
  });
  it("does not claim production readiness", () => {
    expect(html).not.toContain("production-ready");
    expect(html).not.toContain("fully compliant");
  });
});

// ── /security page ──────────────────────────────────────────────────────
describe("/security page content", () => {
  const html = readPage("security.html");

  it("contains 'third-party' review language", () => {
    expect(html.toLowerCase()).toContain("third-party");
  });
  it("contains not-yet-reviewed status", () => {
    expect(html).toContain("Not yet third-party");
  });
  it("contains the limitation notice", () => {
    expect(html).toContain("review-ready core demo, not a production client deployment");
  });
  it("contains known limitations section", () => {
    expect(html).toContain("Known limitations");
  });
  it("contains reviewer questions section", () => {
    expect(html.toLowerCase()).toContain("reviewer question");
  });
  it("does not claim production readiness", () => {
    expect(html).not.toContain("production-ready");
  });
});

// ── /deployment page ──────────────────────────────────────────────────────
describe("/deployment page content", () => {
  const html = readPage("deployment.html");

  it("contains 'client-controlled' language", () => {
    expect(html.toLowerCase()).toContain("client");
  });
  it("contains the limitation notice", () => {
    expect(html).toContain("review-ready core demo, not a production client deployment");
  });
  it("contains three deployment modes", () => {
    expect(html).toContain("Mode A");
    expect(html).toContain("Mode B");
    expect(html).toContain("Mode C");
  });
  it("contains minimum readiness checklist", () => {
    expect(html).toContain("Minimum deployment readiness");
  });
  it("does not claim production readiness", () => {
    expect(html).not.toContain("production-ready");
  });
});

// ── /api/review-summary ──────────────────────────────────────────────────
describe("/api/review-summary JSON", () => {
  it("has a status field", () => {
    expect(typeof REVIEW_SUMMARY.status).toBe("string");
    expect(REVIEW_SUMMARY.status.length).toBeGreaterThan(0);
  });
  it("status does not claim production readiness", () => {
    expect(REVIEW_SUMMARY.status).not.toContain("production_ready");
  });
  it("has non-empty implemented array", () => {
    expect(Array.isArray(REVIEW_SUMMARY.implemented)).toBe(true);
    expect(REVIEW_SUMMARY.implemented.length).toBeGreaterThan(0);
  });
  it("has non-empty notYetImplemented array", () => {
    expect(Array.isArray(REVIEW_SUMMARY.notYetImplemented)).toBe(true);
    expect(REVIEW_SUMMARY.notYetImplemented.length).toBeGreaterThan(0);
  });
  it("has coreClaims with backing evidence", () => {
    expect(Array.isArray(REVIEW_SUMMARY.coreClaims)).toBe(true);
    expect(REVIEW_SUMMARY.coreClaims.length).toBeGreaterThan(0);
    REVIEW_SUMMARY.coreClaims.forEach(c => {
      expect(typeof c.claim).toBe("string");
      expect(typeof c.support).toBe("string");
    });
  });
  it("testStatus reportedPassing is at least 323", () => {
    expect(REVIEW_SUMMARY.testStatus.reportedPassing).toBeGreaterThanOrEqual(323);
  });
  it("testStatus reportedFailing is 0", () => {
    expect(REVIEW_SUMMARY.testStatus.reportedFailing).toBe(0);
  });
  it("has limitationNotice mentioning not a production deployment", () => {
    expect(REVIEW_SUMMARY.limitationNotice).toContain("not a production client deployment");
  });
  it("serializes to valid JSON", () => {
    expect(() => JSON.parse(JSON.stringify(REVIEW_SUMMARY))).not.toThrow();
  });
});

// ── /api/pilot-readiness ─────────────────────────────────────────────────
describe("/api/pilot-readiness JSON", () => {
  it("has pilotReadinessStatus field", () => {
    expect(typeof PILOT_READINESS.pilotReadinessStatus).toBe("string");
  });
  it("pilotReadinessStatus does not claim production readiness", () => {
    expect(PILOT_READINESS.pilotReadinessStatus).not.toContain("production_ready");
  });
  it("has non-empty readyNow array", () => {
    expect(PILOT_READINESS.readyNow.length).toBeGreaterThan(0);
  });
  it("has non-empty requiresClientDefinition array", () => {
    expect(PILOT_READINESS.requiresClientDefinition.length).toBeGreaterThan(0);
  });
  it("has non-empty requiresAgreement array", () => {
    expect(PILOT_READINESS.requiresAgreement.length).toBeGreaterThan(0);
  });
  it("recommendedFirstPilotShape clients = 1", () => {
    expect(PILOT_READINESS.recommendedFirstPilotShape.clients).toBe(1);
  });
  it("recommendedFirstPilotShape workflows = 1", () => {
    expect(PILOT_READINESS.recommendedFirstPilotShape.workflows).toBe(1);
  });
  it("has limitationNotice mentioning not a production deployment", () => {
    expect(PILOT_READINESS.limitationNotice).toContain("not a production client deployment");
  });
  it("serializes to valid JSON", () => {
    expect(() => JSON.parse(JSON.stringify(PILOT_READINESS))).not.toThrow();
  });
});

// ── /api/security-summary ────────────────────────────────────────────────
describe("/api/security-summary JSON", () => {
  it("has securityReviewStatus field", () => {
    expect(typeof SECURITY_SUMMARY.securityReviewStatus).toBe("string");
  });
  it("securityReviewStatus indicates not yet reviewed", () => {
    expect(SECURITY_SUMMARY.securityReviewStatus).toContain("not_yet");
  });
  it("has non-empty implementedControls array", () => {
    expect(SECURITY_SUMMARY.implementedControls.length).toBeGreaterThan(0);
  });
  it("implementedControls entries have control and invariant fields", () => {
    SECURITY_SUMMARY.implementedControls.forEach(c => {
      expect(typeof c.control).toBe("string");
      expect(typeof c.invariant).toBe("string");
    });
  });
  it("has non-empty knownLimitations array", () => {
    expect(SECURITY_SUMMARY.knownLimitations.length).toBeGreaterThan(0);
  });
  it("has non-empty recommendedReviewerQuestions array", () => {
    expect(SECURITY_SUMMARY.recommendedReviewerQuestions.length).toBeGreaterThan(0);
  });
  it("has non-empty threatsCovered array", () => {
    expect(SECURITY_SUMMARY.threatsCovered.length).toBeGreaterThan(0);
  });
  it("has limitationNotice mentioning not a production deployment", () => {
    expect(SECURITY_SUMMARY.limitationNotice).toContain("not a production client deployment");
  });
  it("serializes to valid JSON", () => {
    expect(() => JSON.parse(JSON.stringify(SECURITY_SUMMARY))).not.toThrow();
  });
});

// ── Existing scenario routes preserved ───────────────────────────────────
describe("Existing scenario routes preserved", () => {
  it("/api/reject still returns REJECT", () => {
    expect(getRejectScenario().decisionEnvelope.finalState).toBe("REJECT");
  });
  it("/api/hold still returns HOLD", () => {
    expect(getHoldScenario().decisionEnvelope.finalState).toBe("HOLD");
  });
  it("/api/allow still returns ALLOW", () => {
    expect(getAllowScenario().decisionEnvelope.finalState).toBe("ALLOW");
  });
  it("reject buildDemoResponse has displayState BLOCKED", () => {
    expect(buildDemoResponse("reject", getRejectScenario()).outcome.displayState).toBe("BLOCKED");
  });
  it("hold buildDemoResponse has displayState PAUSED", () => {
    expect(buildDemoResponse("hold", getHoldScenario()).outcome.displayState).toBe("PAUSED");
  });
  it("allow buildDemoResponse has displayState ALLOWED", () => {
    expect(buildDemoResponse("allow", getAllowScenario()).outcome.displayState).toBe("ALLOWED");
  });
});

// ── Claim discipline across all pages ────────────────────────────────────
describe("Claim discipline — all portal pages", () => {
  const allHtml = ["review.html", "pilot.html", "security.html", "deployment.html"]
    .map(f => readPage(f))
    .join("\n");

  it("no page uses 'production-ready' as a claim", () => {
    expect(allHtml).not.toContain("production-ready");
  });
  it("no page uses 'fully compliant'", () => {
    expect(allHtml).not.toContain("fully compliant");
  });
  it("no page uses 'regulator-approved'", () => {
    expect(allHtml).not.toContain("regulator-approved");
  });
  it("all pages include the limitation notice", () => {
    ["review.html", "pilot.html", "security.html", "deployment.html"].forEach(f => {
      expect(readPage(f)).toContain("review-ready core demo, not a production client deployment");
    });
  });
});
