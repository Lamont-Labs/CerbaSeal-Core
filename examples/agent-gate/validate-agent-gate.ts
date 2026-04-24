import { runAgentRejectScenario, runAgentHoldScenario, runAgentAllowScenario } from "./agent.js";

let failed = false;

function check(label: string, actual: boolean, expected: boolean) {
  const pass = actual === expected;
  if (!pass) failed = true;
  console.log(`  [${pass ? "PASS" : "FAIL"}] ${label}: executed=${actual} (expected ${expected})`);
}

console.log("\nCerbaSeal agent-gate demo — validation\n");

console.log("REJECT scenario (x3):");
for (let i = 1; i <= 3; i++) {
  const { gateResult, toolResult } = runAgentRejectScenario();
  if (gateResult.decisionEnvelope.finalState !== "REJECT") failed = true;
  check(`call ${i} — tool blocked`, toolResult.executed, false);
}

console.log("\nHOLD scenario (x3):");
for (let i = 1; i <= 3; i++) {
  const { gateResult, toolResult } = runAgentHoldScenario();
  if (gateResult.decisionEnvelope.finalState !== "HOLD") failed = true;
  check(`call ${i} — tool blocked`, toolResult.executed, false);
}

console.log("\nALLOW scenario (x3):");
for (let i = 1; i <= 3; i++) {
  const { gateResult, toolResult } = runAgentAllowScenario();
  if (gateResult.decisionEnvelope.finalState !== "ALLOW") failed = true;
  check(`call ${i} — tool executed`, toolResult.executed, true);
}

console.log("\nInterleaved calls:");
const sequence = [
  { run: runAgentRejectScenario, expectedExec: false, label: "REJECT" },
  { run: runAgentAllowScenario,  expectedExec: true,  label: "ALLOW" },
  { run: runAgentHoldScenario,   expectedExec: false, label: "HOLD" },
  { run: runAgentRejectScenario, expectedExec: false, label: "REJECT" },
  { run: runAgentAllowScenario,  expectedExec: true,  label: "ALLOW" }
];
for (const { run, expectedExec, label } of sequence) {
  const { toolResult } = run();
  check(label, toolResult.executed, expectedExec);
}

console.log(failed ? "\n[FAIL] One or more checks failed.\n" : "\n[PASS] All agent-gate validation checks passed.\n");
process.exit(failed ? 1 : 0);
