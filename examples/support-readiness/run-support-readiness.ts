import { runSystemHealthCheck } from "../../src/services/support/system-health-service.js";
import { runSystemIntegrityVerification } from "../../src/services/support/system-integrity-service.js";
import { createOperatorActionReport } from "../../src/services/support/operator-action-service.js";
import {
  buildSupportRejectScenario,
  buildSupportHoldScenario,
  buildSupportAllowScenario
} from "../../src/services/support/support-fixtures.js";

const health = runSystemHealthCheck();
const integrity = runSystemIntegrityVerification();

const { gateResult: rejectResult } = buildSupportRejectScenario();
const { gateResult: holdResult } = buildSupportHoldScenario();
const { gateResult: allowResult } = buildSupportAllowScenario();

const rejectReport = createOperatorActionReport(rejectResult);
const holdReport = createOperatorActionReport(holdResult);
const allowReport = createOperatorActionReport(allowResult);

console.log("CERBASEAL SUPPORT READINESS REPORT");
console.log("");
console.log(`System Health: ${health.status}`);
console.log(`Integrity Verification: ${integrity.status}`);
console.log("");

console.log("Scenario: REJECT");
console.log(`Operator Action: ${rejectReport.recommendedAction}`);
console.log(`Severity: ${rejectReport.severity}`);
console.log("");

console.log("Scenario: HOLD");
console.log(`Operator Action: ${holdReport.recommendedAction}`);
console.log(`Severity: ${holdReport.severity}`);
console.log("");

console.log("Scenario: ALLOW");
console.log(`Operator Action: ${allowReport.recommendedAction}`);
console.log(`Severity: ${allowReport.severity}`);
console.log("");

console.log("Support Summary:");
console.log("- Fail-closed behavior available");
console.log("- Operator action reports available");
console.log("- Integrity verification available");
console.log("- Pilot-safe documentation available");
console.log("");

console.log("Limitations:");
console.log("- Not production monitoring");
console.log("- Not SLA");
console.log("- Not managed support");
console.log("- Not legal certification");
