import { runSystemHealthCheck } from "../../src/services/support/system-health-service.js";
import { runSystemIntegrityVerification } from "../../src/services/support/system-integrity-service.js";
import { createOperatorActionReport } from "../../src/services/support/operator-action-service.js";
import {
  buildSupportRejectScenario,
  buildSupportHoldScenario,
  buildSupportAllowScenario
} from "../../src/services/support/support-fixtures.js";

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

console.log("[support-readiness] Running validation...");
console.log("");

const health = runSystemHealthCheck();
console.log("Health Checks:");
assert("health status PASS", health.status === "PASS", `got ${health.status}`);
assert(
  "health includes reject check",
  health.checks.some((c) => c.name.includes("reject"))
);
assert(
  "health includes hold check",
  health.checks.some((c) => c.name.includes("hold"))
);
assert(
  "health includes allow check",
  health.checks.some((c) => c.name.includes("allow"))
);
console.log("");

const integrity = runSystemIntegrityVerification();
console.log("Integrity Checks:");
assert(
  "integrity status PASS",
  integrity.status === "PASS",
  `got ${integrity.status}`
);
assert(
  "integrity totalChecks > 0",
  integrity.summary.totalChecks > 0,
  `got ${integrity.summary.totalChecks}`
);
assert(
  "integrity failed = 0",
  integrity.summary.failed === 0,
  `got ${integrity.summary.failed}`
);
console.log("");

const { gateResult: rejectResult } = buildSupportRejectScenario();
const { gateResult: holdResult } = buildSupportHoldScenario();
const { gateResult: allowResult } = buildSupportAllowScenario();

const rejectReport = createOperatorActionReport(rejectResult);
const holdReport = createOperatorActionReport(holdResult);
const allowReport = createOperatorActionReport(allowResult);

console.log("Operator Action Reports:");
assert(
  "REJECT report severity CRITICAL or WARNING",
  rejectReport.severity === "CRITICAL" || rejectReport.severity === "WARNING",
  `got ${rejectReport.severity}`
);
assert(
  "HOLD report severity WARNING",
  holdReport.severity === "WARNING",
  `got ${holdReport.severity}`
);
assert(
  "ALLOW report severity INFO",
  allowReport.severity === "INFO",
  `got ${allowReport.severity}`
);
assert(
  "REJECT report has recommendedAction",
  typeof rejectReport.recommendedAction === "string" &&
    rejectReport.recommendedAction.length > 0
);
assert(
  "HOLD report has recommendedAction",
  typeof holdReport.recommendedAction === "string" &&
    holdReport.recommendedAction.length > 0
);
assert(
  "ALLOW report has recommendedAction",
  typeof allowReport.recommendedAction === "string" &&
    allowReport.recommendedAction.length > 0
);
console.log("");

console.log(`Validation complete: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
