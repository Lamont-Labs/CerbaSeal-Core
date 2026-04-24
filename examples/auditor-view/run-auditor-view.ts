import { getRejectScenario, getHoldScenario, getAllowScenario } from "../browser-demo/scenarios.js";
import { renderCertificate } from "./render-certificate.js";

const scenarios = [
  { label: "REJECT",  fn: getRejectScenario },
  { label: "HOLD",    fn: getHoldScenario },
  { label: "ALLOW",   fn: getAllowScenario }
];

console.log("\nCERBASEAL AUDITOR VIEW DEMO\n");

for (const { label, fn } of scenarios) {
  console.log(`${"═".repeat(46)}`);
  console.log(`Scenario: ${label}`);
  console.log("─".repeat(46));
  const result = fn();
  console.log(renderCertificate(result));
  console.log();
}
