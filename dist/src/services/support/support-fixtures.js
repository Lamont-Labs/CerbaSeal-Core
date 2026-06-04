import { ExecutionGateService } from "../execution/execution-gate-service.js";
import { buildValidGovernedRequest } from "../../domain/builders/request-fixtures.js";
export function buildSupportRejectScenario() {
    const gate = new ExecutionGateService();
    const base = buildValidGovernedRequest();
    const request = {
        ...base,
        actorAuthorityClass: "ai",
        proposal: {
            ...base.proposal,
            proposalSourceKind: "ai"
        },
        approvalRequired: false,
        approvalArtifact: null
    };
    return { request, gateResult: gate.evaluate(request) };
}
export function buildSupportHoldScenario() {
    const gate = new ExecutionGateService();
    const base = buildValidGovernedRequest();
    const request = {
        ...base,
        actorAuthorityClass: "analyst",
        approvalRequired: true,
        approvalArtifact: null
    };
    return { request, gateResult: gate.evaluate(request) };
}
export function buildSupportAllowScenario() {
    const gate = new ExecutionGateService();
    const request = buildValidGovernedRequest();
    return { request, gateResult: gate.evaluate(request) };
}
