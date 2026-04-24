/**
 * validate-demo.ts
 *
 * Validates the unified browser demo response shape by calling
 * the same scenario functions and buildDemoResponse used by the server.
 * No HTTP server required. Exits 0 on pass, 1 on failure.
 */

import { getRejectScenario, getHoldScenario, getAllowScenario } from "./scenarios.js";
import { buildDemoResponse } from "./response-builder.js";

type DemoResponse = ReturnType<typeof buildDemoResponse>;

let failed = false;

function check(label: string, actual: unknown, expected: unknown) {
  const pass = actual === expected;
  if (!pass) failed = true;
  console.log(`  [${pass ? "PASS" : "FAIL"}] ${label}: got ${JSON.stringify(actual)} (expected ${JSON.stringify(expected)})`);
}

function validateReject(r: DemoResponse, call: number) {
  const pfx = `reject call ${call}`;
  check(`${pfx} — scenario.id`,                    r.scenario.id,                    "reject");
  check(`${pfx} — outcome.finalState`,              r.outcome.finalState,             "REJECT");
  check(`${pfx} — outcome.displayState`,            r.outcome.displayState,           "BLOCKED");
  check(`${pfx} — execution.executed`,              r.execution.executed,             false);
  check(`${pfx} — execution.label`,                 r.execution.label,                "NOT EXECUTED");
  check(`${pfx} — proof.blockedActionRecordExists`, r.proof.blockedActionRecordExists, true);
  check(`${pfx} — proof.releaseAuthorizationExists`,r.proof.releaseAuthorizationExists, false);
}

function validateHold(r: DemoResponse, call: number) {
  const pfx = `hold call ${call}`;
  check(`${pfx} — scenario.id`,                    r.scenario.id,                    "hold");
  check(`${pfx} — outcome.finalState`,              r.outcome.finalState,             "HOLD");
  check(`${pfx} — outcome.displayState`,            r.outcome.displayState,           "PAUSED");
  check(`${pfx} — execution.executed`,              r.execution.executed,             false);
  check(`${pfx} — execution.label`,                 r.execution.label,                "PAUSED");
  check(`${pfx} — proof.blockedActionRecordExists`, r.proof.blockedActionRecordExists, true);
  check(`${pfx} — proof.releaseAuthorizationExists`,r.proof.releaseAuthorizationExists, false);
}

function validateAllow(r: DemoResponse, call: number) {
  const pfx = `allow call ${call}`;
  check(`${pfx} — scenario.id`,                    r.scenario.id,                    "allow");
  check(`${pfx} — outcome.finalState`,              r.outcome.finalState,             "ALLOW");
  check(`${pfx} — outcome.displayState`,            r.outcome.displayState,           "ALLOWED");
  check(`${pfx} — execution.executed`,              r.execution.executed,             true);
  check(`${pfx} — execution.label`,                 r.execution.label,                "EXECUTED");
  check(`${pfx} — proof.releaseAuthorizationExists`,r.proof.releaseAuthorizationExists, true);
  check(`${pfx} — proof.blockedActionRecordExists`, r.proof.blockedActionRecordExists, false);
}

console.log("\nCerbaSeal browser demo — unified response shape validation\n");

console.log("REJECT (x3):");
for (let i = 1; i <= 3; i++) validateReject(buildDemoResponse("reject", getRejectScenario()), i);

console.log("\nHOLD (x3):");
for (let i = 1; i <= 3; i++) validateHold(buildDemoResponse("hold", getHoldScenario()), i);

console.log("\nALLOW (x3):");
for (let i = 1; i <= 3; i++) validateAllow(buildDemoResponse("allow", getAllowScenario()), i);

console.log("\nInterleaved (reject → allow → hold → reject → allow → hold):");
const interleaved = [
  { id: "reject" as const, fn: getRejectScenario, v: validateReject },
  { id: "allow"  as const, fn: getAllowScenario,  v: validateAllow  },
  { id: "hold"   as const, fn: getHoldScenario,   v: validateHold   },
  { id: "reject" as const, fn: getRejectScenario, v: validateReject },
  { id: "allow"  as const, fn: getAllowScenario,  v: validateAllow  },
  { id: "hold"   as const, fn: getHoldScenario,   v: validateHold   },
];
interleaved.forEach(({ id, fn, v }, i) => v(buildDemoResponse(id, fn()), i + 1));

console.log(failed
  ? "\n[FAIL] One or more checks failed.\n"
  : "\n[PASS] All demo validation checks passed.\n");

process.exit(failed ? 1 : 0);
