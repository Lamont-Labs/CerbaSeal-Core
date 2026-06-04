import { renderCertificate } from "./certificate.js";
const SCENARIO_META = {
    reject: {
        title: "AI tries to act without authority",
        attemptedAction: "AI attempts to execute an action using an AI-sourced proposal",
        plainMeaning: "The AI attempted to authorize its own action. CerbaSeal blocked execution.",
        expectedOutcome: "REJECT",
        consequence: "Action never executed.",
        reason: "AI cannot authorize its own actions.",
    },
    hold: {
        title: "Human submits action without approval",
        attemptedAction: "A human-originated action is submitted without required approval",
        plainMeaning: "The action may be valid, but required approval is missing. CerbaSeal pauses execution.",
        expectedOutcome: "HOLD",
        consequence: "Execution paused until approval exists.",
        reason: "Approval is required before execution.",
    },
    allow: {
        title: "Approved action",
        attemptedAction: "A valid action is submitted with required approval",
        plainMeaning: "All required checks passed. CerbaSeal issued release authorization.",
        expectedOutcome: "ALLOW",
        consequence: "Action executed with release authorization.",
        reason: "All required invariants passed.",
    },
};
function toDisplayState(finalState) {
    if (finalState === "REJECT")
        return "BLOCKED";
    if (finalState === "HOLD")
        return "PAUSED";
    return "ALLOWED";
}
function toExecutionLabel(finalState, executed) {
    if (executed)
        return "EXECUTED";
    if (finalState === "HOLD")
        return "PAUSED";
    return "NOT EXECUTED";
}
export function buildDemoResponse(scenarioId, gateResult) {
    const meta = SCENARIO_META[scenarioId];
    const env = gateResult.decisionEnvelope;
    const finalState = env.finalState;
    const release = gateResult.releaseAuthorization;
    const blocked = gateResult.blockedActionRecord;
    const executed = finalState === "ALLOW" && release !== null;
    let certificate = null;
    try {
        certificate = renderCertificate(gateResult);
    }
    catch {
        certificate = null;
    }
    return {
        scenario: {
            id: scenarioId,
            title: meta.title,
            attemptedAction: meta.attemptedAction,
            plainMeaning: meta.plainMeaning,
            expectedOutcome: meta.expectedOutcome,
        },
        outcome: {
            displayState: toDisplayState(finalState),
            finalState,
            consequence: meta.consequence,
            reason: meta.reason,
            reasonCodes: env.trace.reasonCodes,
        },
        execution: {
            executed,
            label: toExecutionLabel(finalState, executed),
        },
        proof: {
            releaseAuthorizationExists: release !== null,
            blockedActionRecordExists: blocked !== null,
            releaseAuthorization: release,
            blockedActionRecord: blocked,
            certificate,
        },
        raw: {
            gateResult,
        },
    };
}
