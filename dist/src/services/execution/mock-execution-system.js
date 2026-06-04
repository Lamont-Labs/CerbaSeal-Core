export function attemptExecution(_actionLabel, gateResult) {
    const state = gateResult.decisionEnvelope.finalState;
    const release = gateResult.releaseAuthorization;
    if (state === "ALLOW" && release !== null) {
        return {
            executed: true,
            actionClass: release.actionClass,
            releaseAuthorizationId: release.releaseAuthorizationId,
        };
    }
    return {
        executed: false,
        reason: state,
    };
}
