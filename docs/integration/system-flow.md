# System Flow (Generic)

## End-to-End Flow

1. Upstream system generates proposal
2. Proposal converted into GovernedRequest
3. Request sent to CerbaSeal.evaluate()
4. GateResult returned
5. EvidenceBundle created
6. Downstream system reacts based on result

---

## Flow Variants

### REJECT
→ no execution
→ audit stored

### HOLD
→ approval required
→ re-submit loop

### ALLOW
→ execution triggered
→ releaseAuthorization used

---

## Replay Flow

1. Retrieve EvidenceBundle
2. Re-run verification
3. Confirm consistency

---

## Failure Flow

If upstream fails:
→ no request sent

If CerbaSeal fails:
→ REJECT (fail-closed)

If downstream fails:
→ execution failure outside CerbaSeal scope
