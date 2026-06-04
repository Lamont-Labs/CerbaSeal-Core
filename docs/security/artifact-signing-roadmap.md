# CerbaSeal Artifact Signing Roadmap

**Status:** Planned — v0.2.0  
**Classification:** Lamont Labs Internal  
**Related:** `docs/security/access-control-and-rate-limiting.md`, `scripts/export-proof.ts`

---

## 1. Current State (v0.1.0)

Proof snapshots are protected by two SHA-256 checksums:

- **`stableChecksum`** — seals the enforcement-state fields (test results, audit checks, invariants, validator counts). Stable across runs when the repo is unchanged.
- **`manifestChecksum`** — seals the full snapshot body including timestamp. Changes on every export.

These checksums verify *post-generation integrity* (has the file been altered?), but they do not prove *origin* (was this snapshot produced by a trusted node running trusted code?).

Individual audit log entries use a SHA-256 hash chain: each entry's `entryHash` covers the previous entry's hash, making retroactive insertion or deletion detectable.

---

## 2. Gap

Neither artifact signing (cryptographic binding of a proof snapshot to a key held by a known entity) nor log-entry signing (HMAC or asymmetric signature over each `AuditLogEntry`) is currently implemented.

This means:
- A party with file-system access can generate a new valid checksum pair by computing SHA-256 over modified content.
- There is no mechanism to prove that a given proof snapshot was produced by a system holding a particular key.

---

## 3. Optional HMAC Signing (v0.1.0 — Available Now)

An optional HMAC-SHA-256 signature over the `stableChecksum` is available in `scripts/export-proof.ts` and `scripts/verify-proof.ts` using the `CERBASEAL_SIGNING_KEY` environment variable.

**Usage:**
```bash
CERBASEAL_SIGNING_KEY=<32+ char secret> pnpm export:proof
CERBASEAL_SIGNING_KEY=<32+ char secret> pnpm verify:proof
```

When the key is present, the proof snapshot includes an `hmacSignature` field. Verification with the same key confirms the snapshot was produced by a system holding the key and has not been altered since.

Without the key, the snapshot is unsigned. All existing checksum verification continues to work.

**Limitation:** HMAC provides symmetric proof — any party with the key can generate a valid signature. It does not provide non-repudiation.

---

## 4. Full Signing Architecture (v0.2.0 Target)

### 4.1 Audit Log Entry Signing

Each `AuditLogEntry` will carry an HMAC-SHA-256 field (`entrySignature`) computed over `stableStringify(entry)` using a server-local signing key.

Verification: `log.verifyChain()` will also verify each entry's signature when a verification key is available.

### 4.2 Proof Snapshot Asymmetric Signing

Proof snapshots will support RSA-PSS or Ed25519 signing (TBD based on Line Axia key infrastructure):

```
signedBy: { keyId: string; algorithm: "ed25519" | "rsa-pss-sha256"; signature: string }
```

The signing key is held by Lamont Labs. Line Axia receives the corresponding public key to verify independently.

### 4.3 Evidence Bundle Signing

`EvidenceBundle` objects will include a signature over the bundle's `eventChain` hashes. This makes it impossible to forge a bundle from valid audit entries without the signing key.

---

## 5. Dependencies and Blockers

| Item | Status |
|---|---|
| Node.js `node:crypto` Ed25519 support | Available since Node 15 |
| Key management infrastructure | Client decision — Vault, KMS, or env-based |
| Line Axia key distribution agreement | Pending pilot scope agreement |
| Audit log signature verification performance impact | Estimated < 1 ms per entry; needs benchmarking at scale |

---

## 6. Priority

This is a **post-pilot hardening item**. The current hash-chain integrity model is sufficient for the v0.1.0 pilot scope. Full signing is a prerequisite for any production deployment handling real transaction decisions.

---

*Last updated: 2026-06-04 — CerbaSeal v0.1.0*
