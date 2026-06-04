/**
 * Core invariant identifiers enforced in Drop 01.
 * These intentionally mirror the CerbaSeal proof boundary:
 * - no policy, no execution
 * - no provenance, no action
 * - no required approval, no release
 * - no logging, no execution
 * - AI is proposal-only, never authority
 * - stale controls block sensitive release
 * - trust state is a release precondition
 * - prohibited use must block
 * - malformed / unknown action state must reject
 */
export const INVARIANTS = {
    NO_POLICY_PACK_NO_EXECUTION: "INV-01",
    NO_PROVENANCE_NO_ACTION: "INV-02",
    NO_REQUIRED_APPROVAL_NO_RELEASE: "INV-03",
    NO_LOGGING_NO_EXECUTION: "INV-04",
    AI_NON_AUTHORITATIVE: "INV-05",
    NO_BYPASS_OF_EXECUTION_GATE: "INV-06",
    IMMUTABLE_DECISION_ENVELOPE: "INV-07",
    STALE_CONTROLS_BLOCK_SENSITIVE_RELEASE: "INV-08",
    TRUST_STATE_REQUIRED: "INV-09",
    PROHIBITED_USE_MUST_BLOCK: "INV-10",
    REQUEST_SCHEMA_AND_ACTION_CLASS_VALID: "INV-11",
    PROPOSAL_AND_REQUEST_ACTION_MUST_MATCH: "INV-12"
};
