# Browser Demo

The browser demo provides a minimal visual interface for the CerbaSeal enforcement loop.

It demonstrates the same three runtime states as the terminal demo:

- **REJECT** — AI self-authorization blocked
- **HOLD** — missing approval paused
- **ALLOW** — valid approved request released

---

## Run

```
pnpm demo:web
```

Then open the local URL printed by the server.

---

## What It Shows

The demo has three buttons:

- Run REJECT
- Run HOLD
- Run ALLOW

Each button triggers a real CerbaSeal evaluation.

The demo displays:

- final decision state
- reason codes
- whether a release authorization was issued
- whether a blocked action record was created
- full raw GateResult JSON

---

## Boundary

The demo shows authorization enforcement.

It does not show contextual correctness evaluation.

CerbaSeal determines whether an action is authorized to execute.

It does not determine whether the action is the correct action to take.

---

## Scope

This is a local demonstration surface only.

It is not a production API.

It is not an authentication layer.

It is not a persistence layer.

It is not a policy engine.

It is not a deployment surface.

Production integration should use an explicit client-controlled integration boundary.
