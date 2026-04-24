import { runRejectScenario, runHoldScenario, runAllowScenario } from "./consumer.js";

let failed = false;

function check(label: string, actual: boolean, expected: boolean) {
  const pass = actual === expected;
  if (!pass) failed = true;
  console.log(`  [${pass ? "PASS" : "FAIL"}] ${label}: executed=${actual} (expected ${expected})`);
}

console.log("\nCerbaSeal consumer example — validation\n");

console.log("REJECT scenario (x3):");
for (let i = 1; i <= 3; i++) {
  const { gateResult, executionResult } = runRejectScenario();
  const stateOk = gateResult.decisionEnvelope.finalState === "REJECT";
  if (!stateOk) failed = true;
  check(`call ${i} — gate=REJECT, not executed`, executionResult.executed, false);
}

console.log("\nHOLD scenario (x3):");
for (let i = 1; i <= 3; i++) {
  const { gateResult, executionResult } = runHoldScenario();
  const stateOk = gateResult.decisionEnvelope.finalState === "HOLD";
  if (!stateOk) failed = true;
  check(`call ${i} — gate=HOLD, not executed`, executionResult.executed, false);
}

console.log("\nALLOW scenario (x3):");
for (let i = 1; i <= 3; i++) {
  const { gateResult, executionResult } = runAllowScenario();
  const stateOk = gateResult.decisionEnvelope.finalState === "ALLOW";
  if (!stateOk) failed = true;
  check(`call ${i} — gate=ALLOW, executed`, executionResult.executed, true);
}

console.log(failed ? "\n[FAIL] One or more checks failed.\n" : "\n[PASS] All consumer validation checks passed.\n");
process.exit(failed ? 1 : 0);
