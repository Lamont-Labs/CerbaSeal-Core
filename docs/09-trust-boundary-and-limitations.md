# Trust Boundary & Structural Limitations

CerbaSeal-Core is a deterministic enforcement layer designed to operate
within a trusted execution boundary. The system guarantees that:

- All governed actions passing through ExecutionGateService are evaluated
  against a complete invariant set.
- Invalid requests cannot produce an ALLOW outcome.
- Replay validation detects inconsistencies between evaluation and outcome.

However, the system does not attempt to enforce or prove:

---

## 1. Gate Invocation Provenance

CerbaSeal does not guarantee that `ExecutionGateService.evaluate()`
was invoked for a given outcome.

A caller may construct a `GateResult` or `ReleaseAuthorization` manually.

Replay validation verifies outcome consistency relative to the request,
but cannot distinguish between:

- a legitimate ALLOW produced by the gate
- a bypassed ALLOW for a valid request

This is an intentional boundary. CerbaSeal assumes that callers are
trusted application components.

---

## 2. Object Forgery Resistance

All core structures are plain TypeScript interfaces:

- `DecisionEnvelope`
- `ReleaseAuthorization`
- `EvidenceBundle`

These can be constructed externally without restriction.

CerbaSeal does not provide runtime sealing, branding, or cryptographic
attestation of these objects.

---

## 3. Audit Chain Authenticity

`AppendOnlyLogService` guarantees:

- internal immutability
- hash-chain consistency

However, the hash algorithm is public and unsalted.

A fully fabricated audit chain with recomputed hashes will pass
structural verification.

CerbaSeal verifies integrity, not origin authenticity.

---

## 4. Mutation Window

`DecisionEnvelope` objects are not frozen at runtime.

Between:

```
evaluate() → createBundle()
```

the caller may mutate the decision envelope before it is captured
in an evidence bundle.

Once bundled, all artifacts are deep-cloned and protected.

---

## 5. ID Determinism

All identifiers derive deterministically from `requestId`:

- `env_{requestId}`
- `evidence_{requestId}`
- `release_{requestId}`

Multiple evaluations of the same `requestId` will produce identical IDs.

CerbaSeal does not guarantee temporal uniqueness.

---

## 6. Trust Model

CerbaSeal-Core assumes:

- `ExecutionGateService` is invoked by trusted backend logic
- Requests are authenticated and validated upstream
- Identity, authorization, and cryptographic guarantees exist
  outside this layer

---

## Conclusion

CerbaSeal-Core provides enforcement correctness, not execution control.

It guarantees that:

> "If the gate is used, the outcome is correct and provable."

It does not guarantee:

> "That the gate was used."
