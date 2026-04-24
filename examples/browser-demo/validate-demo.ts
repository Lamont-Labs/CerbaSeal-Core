/**
 * validate-demo.ts
 *
 * Validates the browser demo scenario functions directly — no HTTP server
 * required. Calls each scenario repeatedly and verifies correct output.
 * Exits cleanly with code 0 on pass, code 1 on failure.
 */

import { getRejectScenario, getHoldScenario, getAllowScenario } from "./scenarios.js";

const REPEAT = 3;
let failed = false;

function check(label: string, fn: () => string, expected: string) {
  for (let i = 1; i <= REPEAT; i++) {
    const actual = fn();
    const pass = actual === expected;
    if (!pass) failed = true;
    console.log(`  [${pass ? "PASS" : "FAIL"}] ${label} (call ${i}/${REPEAT}): got ${actual}`);
  }
}

console.log("\nCerbaSeal browser demo — validation\n");

console.log("REJECT scenario:");
check(
  "REJECT",
  () => getRejectScenario().decisionEnvelope.finalState,
  "REJECT"
);

console.log("\nHOLD scenario:");
check(
  "HOLD",
  () => getHoldScenario().decisionEnvelope.finalState,
  "HOLD"
);

console.log("\nALLOW scenario:");
check(
  "ALLOW",
  () => getAllowScenario().decisionEnvelope.finalState,
  "ALLOW"
);

console.log("\nInterleaved calls:");
const sequence: Array<[string, () => string, string]> = [
  ["REJECT", () => getRejectScenario().decisionEnvelope.finalState, "REJECT"],
  ["ALLOW",  () => getAllowScenario().decisionEnvelope.finalState,  "ALLOW"],
  ["HOLD",   () => getHoldScenario().decisionEnvelope.finalState,   "HOLD"],
  ["REJECT", () => getRejectScenario().decisionEnvelope.finalState, "REJECT"],
  ["ALLOW",  () => getAllowScenario().decisionEnvelope.finalState,  "ALLOW"],
];
for (const [label, fn, expected] of sequence) {
  const actual = fn();
  const pass = actual === expected;
  if (!pass) failed = true;
  console.log(`  [${pass ? "PASS" : "FAIL"}] ${label}: got ${actual}`);
}

console.log(failed ? "\n[FAIL] One or more checks failed.\n" : "\n[PASS] All demo validation checks passed.\n");

process.exit(failed ? 1 : 0);
