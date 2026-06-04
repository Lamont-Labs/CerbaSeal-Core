import { ExecutionGateService } from "../../services/execution/execution-gate-service.js";
import { buildValidGovernedRequest } from "./request-fixtures.js";
export function getRejectScenario() {
    const gate = new ExecutionGateService();
    const base = buildValidGovernedRequest();
    const request = {
        ...base,
        actorAuthorityClass: "ai",
        proposal: {
            ...base.proposal,
            proposalSourceKind: "ai",
        },
        approvalRequired: false,
        approvalArtifact: null,
    };
    return gate.evaluate(request);
}
export function getHoldScenario() {
    const gate = new ExecutionGateService();
    const base = buildValidGovernedRequest();
    const request = {
        ...base,
        actorAuthorityClass: "analyst",
        approvalRequired: true,
        approvalArtifact: null,
    };
    return gate.evaluate(request);
}
export function getAllowScenario() {
    const gate = new ExecutionGateService();
    return gate.evaluate(buildValidGovernedRequest());
}
