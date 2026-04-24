import { runAgentRejectScenario, runAgentHoldScenario, runAgentAllowScenario } from "./agent.js";

console.log("\nCERBASEAL AGENT-GATE DEMO\n");

for (const run of [runAgentRejectScenario, runAgentHoldScenario, runAgentAllowScenario]) {
  const { toolName, gateResult, toolResult } = run();
  const state = gateResult.decisionEnvelope.finalState;
  console.log(`Agent attempted: ${toolName}`);
  console.log(`Gate decision: ${state}`);
  console.log(`Tool executed: ${toolResult.executed}`);
  console.log();
}
