/**
 * CerbaSeal Policy Pack
 *
 * A policy pack extends the enforcement gate with client-specific rules:
 * - actorMappings   — translate client role names to canonical authority classes
 * - approvalChains  — declare which workflows require human approval
 * - actionPolicies  — per-workflow, per-action behaviour overrides
 *
 * The policy layer adds restrictions ON TOP of the core invariants.
 * It can never relax them. AI non-authoritativeness, logging requirements,
 * provenance requirements etc. are unconditional regardless of policy.
 *
 * Usage — from cerbaseal.policy.json:
 *   import { loadCerbaSealPolicy } from "./src/config/cerbaseal-policy.js";
 *   const policy = loadCerbaSealPolicy();
 *   const gate = new ExecutionGateService({}, policy);
 *
 * Usage — inline:
 *   const policy: CerbaSealPolicy = {
 *     actorMappings: { "Head of Risk": "manager" },
 *     approvalChains: { "wire_transfer_approval": ["manager"] },
 *     actionPolicies: { "wire_transfer_approval": { "allow": "requires_approval" } }
 *   };
 *   const gate = new ExecutionGateService({}, policy);
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { AuthorityClass } from "../domain/types/core.js";

export type PolicyActionBehavior = "requires_approval" | "auto_allow" | "blocked";

export interface CerbaSealPolicy {
  /**
   * Maps client-specific role name strings to canonical CerbaSeal authority classes.
   * Allows clients to pass their own role names in requests without modifying source code.
   *
   * Example: { "Senior Fraud Analyst": "analyst", "Head of Risk": "manager" }
   */
  actorMappings?: Record<string, AuthorityClass>;

  /**
   * Declares which workflow classes require human approval.
   * Any workflow listed here will enforce approval presence even if the
   * caller does not set approvalRequired: true on the request.
   *
   * Value is the list of authority classes whose approval satisfies the chain.
   * Example: { "transaction_fraud_review": ["analyst", "manager"] }
   */
  approvalChains?: Record<string, string[]>;

  /**
   * Per-workflow, per-action-class behaviour overrides.
   * "requires_approval" — gate will HOLD if no approval artifact is present
   * "auto_allow"        — no policy-side approval requirement (natural gate behaviour applies)
   * "blocked"           — gate will REJECT this action class for this workflow regardless
   *
   * Example: { "fraud_triage": { "account_hold": "requires_approval", "reject": "auto_allow" } }
   */
  actionPolicies?: Record<string, Record<string, PolicyActionBehavior>>;
}

/**
 * Load a CerbaSeal policy pack from cerbaseal.policy.json.
 *
 * Returns undefined if the file does not exist (no policy = gate operates with
 * core invariants only, which is always safe).
 *
 * Throws a descriptive Error if the file exists but cannot be parsed —
 * a malformed policy is an operator error that should fail loudly.
 */
export function loadCerbaSealPolicy(policyPath?: string): CerbaSealPolicy | undefined {
  const rootDir = policyPath
    ? join(policyPath, "..")
    : join(fileURLToPath(import.meta.url), "..", "..", "..");
  const path = policyPath ?? join(rootDir, "cerbaseal.policy.json");

  if (!existsSync(path)) return undefined;

  let raw: string;
  try {
    raw = readFileSync(path, "utf-8");
  } catch (e) {
    throw new Error(
      `CerbaSeal: failed to read policy file at "${path}": ${e instanceof Error ? e.message : String(e)}`
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(
      `CerbaSeal: policy file at "${path}" contains invalid JSON: ${e instanceof Error ? e.message : String(e)}`
    );
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(
      `CerbaSeal: policy file at "${path}" must be a JSON object, got ${Array.isArray(parsed) ? "array" : typeof parsed}`
    );
  }

  const obj = parsed as Record<string, unknown>;
  const policy: CerbaSealPolicy = {};

  if (obj["actorMappings"] !== undefined) {
    if (typeof obj["actorMappings"] !== "object" || Array.isArray(obj["actorMappings"])) {
      throw new Error(`CerbaSeal: policy "actorMappings" must be an object`);
    }
    const mappings = obj["actorMappings"] as Record<string, unknown>;
    policy.actorMappings = {};
    for (const [key, val] of Object.entries(mappings)) {
      if (typeof val !== "string") {
        throw new Error(`CerbaSeal: policy actorMappings["${key}"] must be a string (authority class name)`);
      }
      policy.actorMappings[key] = val as AuthorityClass;
    }
  }

  if (obj["approvalChains"] !== undefined) {
    if (typeof obj["approvalChains"] !== "object" || Array.isArray(obj["approvalChains"])) {
      throw new Error(`CerbaSeal: policy "approvalChains" must be an object`);
    }
    const chains = obj["approvalChains"] as Record<string, unknown>;
    policy.approvalChains = {};
    for (const [wf, classes] of Object.entries(chains)) {
      if (!Array.isArray(classes) || !classes.every((c) => typeof c === "string")) {
        throw new Error(`CerbaSeal: policy approvalChains["${wf}"] must be an array of strings`);
      }
      policy.approvalChains[wf] = classes as string[];
    }
  }

  if (obj["actionPolicies"] !== undefined) {
    if (typeof obj["actionPolicies"] !== "object" || Array.isArray(obj["actionPolicies"])) {
      throw new Error(`CerbaSeal: policy "actionPolicies" must be an object`);
    }
    const ap = obj["actionPolicies"] as Record<string, unknown>;
    policy.actionPolicies = {};
    const valid = new Set<PolicyActionBehavior>(["requires_approval", "auto_allow", "blocked"]);
    for (const [wf, actions] of Object.entries(ap)) {
      if (typeof actions !== "object" || Array.isArray(actions) || actions === null) {
        throw new Error(`CerbaSeal: policy actionPolicies["${wf}"] must be an object`);
      }
      policy.actionPolicies[wf] = {};
      for (const [action, behaviour] of Object.entries(actions as Record<string, unknown>)) {
        if (!valid.has(behaviour as PolicyActionBehavior)) {
          throw new Error(
            `CerbaSeal: policy actionPolicies["${wf}"]["${action}"] must be one of: requires_approval, auto_allow, blocked`
          );
        }
        policy.actionPolicies[wf]![action] = behaviour as PolicyActionBehavior;
      }
    }
  }

  return policy;
}
