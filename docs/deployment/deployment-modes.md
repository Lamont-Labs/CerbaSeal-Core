# Deployment Modes

## Mode 1 — Embedded Library
- Runs inside application
- Lowest latency
- No network boundary

## Mode 2 — Internal Service
- HTTP wrapper around evaluate()
- Centralized enforcement
- Requires network trust

## Mode 3 — Sidecar
- Runs alongside service
- Enforces before execution
- Ideal for regulated systems

## Mode 4 — Air-Gapped Evaluation
- Manual submission
- Offline verification
- Regulatory use case

---

## Data Residency

CerbaSeal:
- does not require external calls
- can operate entirely in isolated infrastructure

---

## Security Posture

- No outbound network required
- Deterministic execution
- Full audit trace generation
