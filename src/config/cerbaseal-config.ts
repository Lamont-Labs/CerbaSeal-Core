/**
 * CerbaSeal Configuration
 *
 * Defines the extensible runtime configuration for the enforcement core.
 * Core classes are hardcoded and cannot be removed.
 * Extended classes are client-defined additions that require no TypeScript changes.
 *
 * Usage — inline config:
 *   const gate = new ExecutionGateService({
 *     additionalAuthorityClasses: ["risk_officer", "supervisor", "director"]
 *   });
 *
 * Usage — from cerbaseal.config.json:
 *   import { loadCerbaSealConfig } from "./src/config/cerbaseal-config.js";
 *   const config = loadCerbaSealConfig();
 *   const gate = new ExecutionGateService(config);
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const CORE_AUTHORITY_CLASSES = [
  "system",
  "ai",
  "analyst",
  "reviewer",
  "manager",
  "compliance_officer"
] as const;

export const CORE_WORKFLOW_CLASSES = [
  "fraud_triage",
  "transaction_escalation",
  "account_hold_recommendation"
] as const;

export const CORE_ACTION_CLASSES = [
  "allow",
  "hold",
  "reject",
  "escalate",
  "account_hold"
] as const;

export interface CerbaSealClassExtension {
  core?: readonly string[];
  extended: readonly string[];
}

export interface CerbaSealConfig {
  authorityClasses?: CerbaSealClassExtension;
  workflowClasses?: CerbaSealClassExtension;
  actionClasses?: CerbaSealClassExtension;
}

export interface ExecutionGateConfig {
  additionalAuthorityClasses?: readonly string[];
}

export type GateConfig = CerbaSealConfig | ExecutionGateConfig;

export function buildAllowedAuthorityClasses(
  config?: GateConfig
): ReadonlySet<string> {
  let extended: readonly string[] = [];

  if (config) {
    if ("additionalAuthorityClasses" in config) {
      extended = config.additionalAuthorityClasses ?? [];
    } else if ("authorityClasses" in config && config.authorityClasses) {
      extended = config.authorityClasses.extended ?? [];
    }
  }

  return new Set([...CORE_AUTHORITY_CLASSES, ...extended]);
}

export function loadCerbaSealConfig(
  configPath?: string
): CerbaSealConfig {
  try {
    const rootDir = configPath
      ? join(configPath, "..")
      : join(fileURLToPath(import.meta.url), "..", "..", "..");
    const path = configPath ?? join(rootDir, "cerbaseal.config.json");

    if (!existsSync(path)) return {};

    const raw = readFileSync(path, "utf-8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const result: CerbaSealConfig = {};

    if (parsed["authorityClasses"] && typeof parsed["authorityClasses"] === "object") {
      const ac = parsed["authorityClasses"] as Record<string, unknown>;
      result.authorityClasses = {
        core: Array.isArray(ac["core"]) ? (ac["core"] as string[]) : [...CORE_AUTHORITY_CLASSES],
        extended: Array.isArray(ac["extended"]) ? (ac["extended"] as string[]) : []
      };
    }

    if (parsed["workflowClasses"] && typeof parsed["workflowClasses"] === "object") {
      const wc = parsed["workflowClasses"] as Record<string, unknown>;
      result.workflowClasses = {
        core: Array.isArray(wc["core"]) ? (wc["core"] as string[]) : [...CORE_WORKFLOW_CLASSES],
        extended: Array.isArray(wc["extended"]) ? (wc["extended"] as string[]) : []
      };
    }

    if (parsed["actionClasses"] && typeof parsed["actionClasses"] === "object") {
      const ac2 = parsed["actionClasses"] as Record<string, unknown>;
      result.actionClasses = {
        core: Array.isArray(ac2["core"]) ? (ac2["core"] as string[]) : [...CORE_ACTION_CLASSES],
        extended: Array.isArray(ac2["extended"]) ? (ac2["extended"] as string[]) : []
      };
    }

    return result;
  } catch {
    return {};
  }
}
