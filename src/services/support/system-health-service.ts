import { AppendOnlyLogService } from "../audit/append-only-log-service.js";
import { EvidenceBundleService } from "../evidence/evidence-bundle-service.js";
import { createOperatorActionReport } from "./operator-action-service.js";
import {
  buildSupportRejectScenario,
  buildSupportHoldScenario,
  buildSupportAllowScenario
} from "./support-fixtures.js";

export interface SystemHealthCheck {
  name: string;
  status: "PASS" | "FAIL";
  detail: string;
}

export interface SystemHealthStatus {
  status: "PASS" | "FAIL";
  checkedAt: string;
  checks: SystemHealthCheck[];
}

function runCheck(name: string, fn: () => string): SystemHealthCheck {
  try {
    const detail = fn();
    return { name, status: "PASS", detail };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return { name, status: "FAIL", detail };
  }
}

export function runSystemHealthCheck(): SystemHealthStatus {
  const checkedAt = new Date().toISOString();
  const checks: SystemHealthCheck[] = [];

  checks.push(
    runCheck("reject_scenario_evaluates_to_reject", () => {
      const { gateResult } = buildSupportRejectScenario();
      if (gateResult.decisionEnvelope.finalState !== "REJECT") {
        throw new Error(`Expected REJECT, got ${gateResult.decisionEnvelope.finalState}`);
      }
      return "REJECT scenario returned REJECT";
    })
  );

  checks.push(
    runCheck("hold_scenario_evaluates_to_hold", () => {
      const { gateResult } = buildSupportHoldScenario();
      if (gateResult.decisionEnvelope.finalState !== "HOLD") {
        throw new Error(`Expected HOLD, got ${gateResult.decisionEnvelope.finalState}`);
      }
      return "HOLD scenario returned HOLD";
    })
  );

  checks.push(
    runCheck("allow_scenario_evaluates_to_allow", () => {
      const { gateResult } = buildSupportAllowScenario();
      if (gateResult.decisionEnvelope.finalState !== "ALLOW") {
        throw new Error(`Expected ALLOW, got ${gateResult.decisionEnvelope.finalState}`);
      }
      return "ALLOW scenario returned ALLOW";
    })
  );

  checks.push(
    runCheck("operator_action_report_reject", () => {
      const { gateResult } = buildSupportRejectScenario();
      const report = createOperatorActionReport(gateResult);
      if (!report.recommendedAction) throw new Error("No recommendedAction");
      return `severity=${report.severity}`;
    })
  );

  checks.push(
    runCheck("operator_action_report_hold", () => {
      const { gateResult } = buildSupportHoldScenario();
      const report = createOperatorActionReport(gateResult);
      if (!report.recommendedAction) throw new Error("No recommendedAction");
      return `severity=${report.severity}`;
    })
  );

  checks.push(
    runCheck("operator_action_report_allow", () => {
      const { gateResult } = buildSupportAllowScenario();
      const report = createOperatorActionReport(gateResult);
      if (!report.recommendedAction) throw new Error("No recommendedAction");
      return `severity=${report.severity}`;
    })
  );

  checks.push(
    runCheck("evidence_bundle_reject", () => {
      const logService = new AppendOnlyLogService();
      const evidenceService = new EvidenceBundleService(logService);
      const { request, gateResult } = buildSupportRejectScenario();
      const bundle = evidenceService.createBundle({ request, gateResult });
      if (!bundle.evidenceBundleId) throw new Error("No evidenceBundleId");
      return `evidenceBundleId=${bundle.evidenceBundleId}`;
    })
  );

  checks.push(
    runCheck("evidence_bundle_allow", () => {
      const logService = new AppendOnlyLogService();
      const evidenceService = new EvidenceBundleService(logService);
      const { request, gateResult } = buildSupportAllowScenario();
      const bundle = evidenceService.createBundle({ request, gateResult });
      if (!bundle.evidenceBundleId) throw new Error("No evidenceBundleId");
      return `evidenceBundleId=${bundle.evidenceBundleId}`;
    })
  );

  checks.push(
    runCheck("audit_chain_verifies", () => {
      const logService = new AppendOnlyLogService();
      const evidenceService = new EvidenceBundleService(logService);
      const { request, gateResult } = buildSupportAllowScenario();
      evidenceService.createBundle({ request, gateResult });
      const valid = logService.verifyChain();
      if (!valid) throw new Error("Audit chain verification failed");
      return "chain verified";
    })
  );

  const status = checks.every((c) => c.status === "PASS") ? "PASS" : "FAIL";
  return { status, checkedAt, checks };
}
