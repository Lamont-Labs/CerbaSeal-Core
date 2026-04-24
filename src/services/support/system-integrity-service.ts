import { createOperatorActionReport } from "./operator-action-service.js";
import {
  buildSupportRejectScenario,
  buildSupportHoldScenario,
  buildSupportAllowScenario
} from "./support-fixtures.js";

export interface IntegrityCheck {
  name: string;
  status: "PASS" | "FAIL";
  expected: string;
  actual: string;
}

export interface SystemIntegrityReport {
  status: "PASS" | "FAIL";
  checkedAt: string;
  summary: {
    totalChecks: number;
    passed: number;
    failed: number;
  };
  checks: IntegrityCheck[];
}

function integrityCheck(
  name: string,
  expected: string,
  fn: () => string
): IntegrityCheck {
  try {
    const actual = fn();
    const status = actual === expected ? "PASS" : "FAIL";
    return { name, status, expected, actual };
  } catch (err) {
    const actual = err instanceof Error ? err.message : String(err);
    return { name, status: "FAIL", expected, actual };
  }
}

export function runSystemIntegrityVerification(): SystemIntegrityReport {
  const checkedAt = new Date().toISOString();
  const checks: IntegrityCheck[] = [];

  const { gateResult: rejectResult } = buildSupportRejectScenario();
  const { gateResult: holdResult } = buildSupportHoldScenario();
  const { gateResult: allowResult } = buildSupportAllowScenario();

  checks.push(
    integrityCheck("reject_scenario_final_state", "REJECT", () =>
      rejectResult.decisionEnvelope.finalState
    )
  );

  checks.push(
    integrityCheck("hold_scenario_final_state", "HOLD", () =>
      holdResult.decisionEnvelope.finalState
    )
  );

  checks.push(
    integrityCheck("allow_scenario_final_state", "ALLOW", () =>
      allowResult.decisionEnvelope.finalState
    )
  );

  checks.push(
    integrityCheck("reject_has_blocked_record_no_release", "true", () =>
      String(
        rejectResult.blockedActionRecord !== null &&
          rejectResult.releaseAuthorization === null
      )
    )
  );

  checks.push(
    integrityCheck("hold_has_blocked_record_no_release", "true", () =>
      String(
        holdResult.blockedActionRecord !== null &&
          holdResult.releaseAuthorization === null
      )
    )
  );

  checks.push(
    integrityCheck("allow_has_release_no_blocked_record", "true", () =>
      String(
        allowResult.releaseAuthorization !== null &&
          allowResult.blockedActionRecord === null
      )
    )
  );

  const rejectReport = createOperatorActionReport(rejectResult);
  checks.push(
    integrityCheck("operator_report_reject_severity", "CRITICAL_or_WARNING", () =>
      rejectReport.severity === "CRITICAL" || rejectReport.severity === "WARNING"
        ? "CRITICAL_or_WARNING"
        : rejectReport.severity
    )
  );

  const holdReport = createOperatorActionReport(holdResult);
  checks.push(
    integrityCheck("operator_report_hold_severity", "WARNING", () => holdReport.severity)
  );

  const allowReport = createOperatorActionReport(allowResult);
  checks.push(
    integrityCheck("operator_report_allow_severity", "INFO", () => allowReport.severity)
  );

  checks.push(
    integrityCheck("repeatability_reject_3x", "true", () => {
      const states = [
        buildSupportRejectScenario().gateResult.decisionEnvelope.finalState,
        buildSupportRejectScenario().gateResult.decisionEnvelope.finalState,
        buildSupportRejectScenario().gateResult.decisionEnvelope.finalState
      ];
      return String(states.every((s) => s === "REJECT"));
    })
  );

  checks.push(
    integrityCheck("repeatability_hold_3x", "true", () => {
      const states = [
        buildSupportHoldScenario().gateResult.decisionEnvelope.finalState,
        buildSupportHoldScenario().gateResult.decisionEnvelope.finalState,
        buildSupportHoldScenario().gateResult.decisionEnvelope.finalState
      ];
      return String(states.every((s) => s === "HOLD"));
    })
  );

  checks.push(
    integrityCheck("repeatability_allow_3x", "true", () => {
      const states = [
        buildSupportAllowScenario().gateResult.decisionEnvelope.finalState,
        buildSupportAllowScenario().gateResult.decisionEnvelope.finalState,
        buildSupportAllowScenario().gateResult.decisionEnvelope.finalState
      ];
      return String(states.every((s) => s === "ALLOW"));
    })
  );

  const interleavedExpected = ["REJECT", "ALLOW", "HOLD", "REJECT", "ALLOW", "HOLD"];
  const interleavedBuilders = [
    buildSupportRejectScenario,
    buildSupportAllowScenario,
    buildSupportHoldScenario,
    buildSupportRejectScenario,
    buildSupportAllowScenario,
    buildSupportHoldScenario
  ];

  checks.push(
    integrityCheck("interleaving_r_a_h_r_a_h", "true", () => {
      const states = interleavedBuilders.map(
        (fn) => fn().gateResult.decisionEnvelope.finalState
      );
      const matched = states.every((s, i) => s === interleavedExpected[i]);
      return String(matched);
    })
  );

  const passed = checks.filter((c) => c.status === "PASS").length;
  const failed = checks.filter((c) => c.status === "FAIL").length;
  const status = failed === 0 ? "PASS" : "FAIL";

  return {
    status,
    checkedAt,
    summary: { totalChecks: checks.length, passed, failed },
    checks
  };
}
