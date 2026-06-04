export const TOOLS = {
    escalate_case: { actionClass: "escalate", label: "Escalate Case" },
    apply_hold: { actionClass: "account_hold", label: "Apply Hold" },
    send_notification: { actionClass: "escalate", label: "Send Notification" },
};
export function executeIfAuthorized(toolName, gateResult) {
    const state = gateResult.decisionEnvelope.finalState;
    const release = gateResult.releaseAuthorization;
    if (state === "ALLOW" && release !== null) {
        return {
            toolName,
            executed: true,
            releaseAuthorizationId: release.releaseAuthorizationId,
        };
    }
    return {
        toolName,
        executed: false,
        blockedReason: state,
    };
}
