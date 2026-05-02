/**
 * validate-review-portal.ts
 *
 * Validates the review portal routes and JSON endpoints without starting an HTTP server.
 * Directly imports route data and page files to confirm correctness.
 * Mirrors the pattern used in validate-demo.ts.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { REVIEW_SUMMARY, PILOT_READINESS, SECURITY_SUMMARY } from "./review-portal.js";
import { getRejectScenario, getHoldScenario, getAllowScenario } from "./scenarios.js";
import { buildDemoResponse } from "./response-builder.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean, detail?: string): void {
  if (condition) {
    console.log(`  [PASS] ${name}`);
    passed++;
  } else {
    console.log(`  [FAIL] ${name}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

function readPage(filename: string): string {
  return readFileSync(join(__dirname, "pages", filename), "utf-8");
}

console.log("[review-portal] Running validation...\n");

// ── Page content checks ────────────────────────────────────────────────────
console.log("Page: /review");
const reviewHtml = readPage("review.html");
assert("/review contains enforcement spine definition",
  reviewHtml.includes("deterministic execution enforcement spine"));
assert("/review contains limitation notice",
  reviewHtml.includes("review-ready core demo, not a production client deployment"));
assert("/review contains nav links",
  reviewHtml.includes('href="/pilot"') && reviewHtml.includes('href="/security"'));
assert("/review contains maturity section",
  reviewHtml.includes("Currently implemented") && reviewHtml.includes("Not yet implemented"));
assert("/review contains scenario cards",
  reviewHtml.includes("INV-05") && reviewHtml.includes("INV-03"));
assert("/review contains proof table with code/test tags",
  reviewHtml.includes("tag-code") && reviewHtml.includes("tag-test"));
console.log("");

console.log("Page: /pilot");
const pilotHtml = readPage("pilot.html");
assert("/pilot contains one workflow language",
  pilotHtml.includes("one workflow"));
assert("/pilot contains pilot thesis",
  pilotHtml.includes("one client"));
assert("/pilot contains limitation notice",
  pilotHtml.includes("review-ready core demo, not a production client deployment"));
assert("/pilot contains intake checklist",
  pilotHtml.includes("intake-item"));
assert("/pilot contains client-related language",
  pilotHtml.toLowerCase().includes("client"));
assert("/pilot contains agreement section",
  pilotHtml.includes("working agreement"));
assert("/pilot does not claim production readiness",
  !pilotHtml.includes("production-ready") && !pilotHtml.includes("fully compliant"));
console.log("");

console.log("Page: /security");
const securityHtml = readPage("security.html");
assert("/security contains third-party language",
  securityHtml.includes("third-party") || securityHtml.includes("third party"));
assert("/security contains not-yet-reviewed status",
  securityHtml.includes("not_yet_third_party_reviewed") || securityHtml.includes("Not yet third-party"));
assert("/security contains limitation notice",
  securityHtml.includes("review-ready core demo, not a production client deployment"));
assert("/security contains known limitations",
  securityHtml.includes("Known limitations"));
assert("/security contains reviewer questions",
  securityHtml.includes("Recommended reviewer questions") || securityHtml.includes("reviewer questions"));
assert("/security does not claim production readiness",
  !securityHtml.includes("production-ready"));
console.log("");

console.log("Page: /deployment");
const deploymentHtml = readPage("deployment.html");
assert("/deployment contains client-controlled language",
  deploymentHtml.includes("client-controlled") || deploymentHtml.includes("client controls"));
assert("/deployment contains limitation notice",
  deploymentHtml.includes("review-ready core demo, not a production client deployment"));
assert("/deployment contains three deployment modes",
  deploymentHtml.includes("Mode A") && deploymentHtml.includes("Mode B") && deploymentHtml.includes("Mode C"));
assert("/deployment contains minimum readiness checklist",
  deploymentHtml.includes("Minimum deployment readiness"));
assert("/deployment contains update process",
  deploymentHtml.includes("Fix / update process") || deploymentHtml.includes("update process"));
assert("/deployment does not claim production readiness",
  !deploymentHtml.includes("production-ready"));
console.log("");

// ── JSON endpoint content checks ───────────────────────────────────────────
console.log("JSON: /api/review-summary");
assert("review-summary has status field",
  typeof REVIEW_SUMMARY.status === "string" && REVIEW_SUMMARY.status.length > 0);
assert("review-summary status is not production-ready",
  !REVIEW_SUMMARY.status.includes("production_ready"));
assert("review-summary has implemented array",
  Array.isArray(REVIEW_SUMMARY.implemented) && REVIEW_SUMMARY.implemented.length > 0);
assert("review-summary has notYetImplemented array",
  Array.isArray(REVIEW_SUMMARY.notYetImplemented) && REVIEW_SUMMARY.notYetImplemented.length > 0);
assert("review-summary has coreClaims array",
  Array.isArray(REVIEW_SUMMARY.coreClaims) && REVIEW_SUMMARY.coreClaims.length > 0);
assert("review-summary testStatus has passing count",
  REVIEW_SUMMARY.testStatus.reportedPassing >= 262);
assert("review-summary has limitationNotice",
  REVIEW_SUMMARY.limitationNotice.includes("not a production client deployment"));
assert("review-summary serializes to valid JSON",
  (() => { try { JSON.parse(JSON.stringify(REVIEW_SUMMARY)); return true; } catch { return false; } })());
console.log("");

console.log("JSON: /api/pilot-readiness");
assert("pilot-readiness has pilotReadinessStatus",
  typeof PILOT_READINESS.pilotReadinessStatus === "string");
assert("pilot-readiness status is not production-ready",
  !PILOT_READINESS.pilotReadinessStatus.includes("production_ready"));
assert("pilot-readiness has readyNow array",
  Array.isArray(PILOT_READINESS.readyNow) && PILOT_READINESS.readyNow.length > 0);
assert("pilot-readiness has requiresClientDefinition array",
  Array.isArray(PILOT_READINESS.requiresClientDefinition) && PILOT_READINESS.requiresClientDefinition.length > 0);
assert("pilot-readiness has requiresAgreement array",
  Array.isArray(PILOT_READINESS.requiresAgreement) && PILOT_READINESS.requiresAgreement.length > 0);
assert("pilot-readiness recommendedFirstPilotShape clients = 1",
  PILOT_READINESS.recommendedFirstPilotShape.clients === 1);
assert("pilot-readiness recommendedFirstPilotShape workflows = 1",
  PILOT_READINESS.recommendedFirstPilotShape.workflows === 1);
assert("pilot-readiness has limitationNotice",
  PILOT_READINESS.limitationNotice.includes("not a production client deployment"));
assert("pilot-readiness serializes to valid JSON",
  (() => { try { JSON.parse(JSON.stringify(PILOT_READINESS)); return true; } catch { return false; } })());
console.log("");

console.log("JSON: /api/security-summary");
assert("security-summary has securityReviewStatus",
  typeof SECURITY_SUMMARY.securityReviewStatus === "string");
assert("security-summary status indicates not yet reviewed",
  SECURITY_SUMMARY.securityReviewStatus.includes("not_yet"));
assert("security-summary has implementedControls array",
  Array.isArray(SECURITY_SUMMARY.implementedControls) && SECURITY_SUMMARY.implementedControls.length > 0);
assert("security-summary has knownLimitations array",
  Array.isArray(SECURITY_SUMMARY.knownLimitations) && SECURITY_SUMMARY.knownLimitations.length > 0);
assert("security-summary has recommendedReviewerQuestions array",
  Array.isArray(SECURITY_SUMMARY.recommendedReviewerQuestions) && SECURITY_SUMMARY.recommendedReviewerQuestions.length > 0);
assert("security-summary has threatsCovered array",
  Array.isArray(SECURITY_SUMMARY.threatsCovered) && SECURITY_SUMMARY.threatsCovered.length > 0);
assert("security-summary has limitationNotice",
  SECURITY_SUMMARY.limitationNotice.includes("not a production client deployment"));
assert("security-summary serializes to valid JSON",
  (() => { try { JSON.parse(JSON.stringify(SECURITY_SUMMARY)); return true; } catch { return false; } })());
console.log("");

// ── Existing scenario routes still work ────────────────────────────────────
console.log("Existing scenario routes:");
const rejectResult = getRejectScenario();
const holdResult   = getHoldScenario();
const allowResult  = getAllowScenario();

assert("/api/reject still returns REJECT",
  rejectResult.decisionEnvelope.finalState === "REJECT");
assert("/api/hold still returns HOLD",
  holdResult.decisionEnvelope.finalState === "HOLD");
assert("/api/allow still returns ALLOW",
  allowResult.decisionEnvelope.finalState === "ALLOW");

const rejectResp = buildDemoResponse("reject", rejectResult);
const holdResp   = buildDemoResponse("hold", holdResult);
const allowResp  = buildDemoResponse("allow", allowResult);

assert("reject response has displayState BLOCKED",
  rejectResp.outcome.displayState === "BLOCKED");
assert("hold response has displayState PAUSED",
  holdResp.outcome.displayState === "PAUSED");
assert("allow response has displayState ALLOWED",
  allowResp.outcome.displayState === "ALLOWED");
assert("reject response does not claim production readiness",
  !JSON.stringify(rejectResp).includes("production-ready"));
console.log("");

// ── Claim discipline check ────────────────────────────────────────────────
console.log("Claim discipline:");
const allPageContent = reviewHtml + pilotHtml + securityHtml + deploymentHtml;
assert("No page uses 'production-ready' as a claim",
  !allPageContent.includes("production-ready"));
assert("No page uses 'fully compliant'",
  !allPageContent.includes("fully compliant"));
assert("No page uses 'regulator-approved'",
  !allPageContent.includes("regulator-approved"));
assert("No page uses 'guaranteed' as absolute claim",
  !allPageContent.includes(">guaranteed<"));
assert("All pages include limitation notice",
  [reviewHtml, pilotHtml, securityHtml, deploymentHtml].every(
    h => h.includes("review-ready core demo, not a production client deployment")
  ));
console.log("");

// ── Final summary ────────────────────────────────────────────────────────
console.log(`\nValidation complete: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) {
  process.exit(1);
}
