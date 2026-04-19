# Runtime Context

## Purpose

Describes the technical runtime context for the CerbaSeal proof slice. This is factual context for reviewers, not a deployment specification.

---

## Language and runtime

- **Language:** TypeScript (strict mode)
- **Runtime:** Node.js
- **Module system:** ESM (`"type": "module"` in `package.json`)
- **Test framework:** Vitest

---

## Key dependencies

| Dependency | Purpose |
|---|---|
| Node.js `node:crypto` | SHA-256 hashing for audit chain entries |
| TypeScript | Static type enforcement across all interfaces |
| Vitest | Test runner for unit and adversarial tests |

No external network dependencies. No database dependency. No framework dependency beyond the test runner.

---

## What is intentionally omitted

The following are absent by design in the proof slice:

- **No HTTP layer.** There is no API server, REST layer, or RPC layer in the enforcement core. The services are libraries, not deployed endpoints.
- **No persistence layer.** `AppendOnlyLogService` stores entries in memory for the duration of a process. There is no database, file store, or message queue.
- **No authentication layer.** No JWT validation, no session handling, no identity provider integration.
- **No secrets management.** No credentials, no signing keys, no external configuration stores.
- **No environment-specific configuration.** The enforcement logic does not branch on `NODE_ENV` or any environment variable.

---

## Running the proof slice

```bash
pnpm install
pnpm test
```

All 88 tests pass against the current implementation. No network access, no environment setup, and no external services are required.

---

## What this context means for a reviewer

The proof slice is fully self-contained. A reviewer can inspect and run every enforcement claim in this repository from a local checkout with no external dependencies. The absence of infrastructure is intentional — it keeps the review surface narrow and the enforcement claim directly inspectable.
