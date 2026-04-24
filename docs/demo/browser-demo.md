# Browser Demo

## Hosted Demo

The browser demo is hosted on Replit.

It is accessible via the Replit preview pane when the `Start application` workflow is running.

After publishing, a stable `.replit.app` URL is assigned by Replit.

Run command: `pnpm demo:web`

This hosted demo runs the same browser demo as the local `pnpm demo:web` command.

---

The browser demo is the fastest way to understand CerbaSeal.

It shows one enforcement loop:

Attempted action → CerbaSeal evaluation → execution decision → evidence

## Run

```
pnpm demo:web
```

Open the local URL printed by the server.

## Scenarios

The demo includes three scenarios:

1. **AI tries to act without authority**
   - Expected outcome: REJECT
   - Display state: BLOCKED
   - Consequence: action never executed

2. **Human submits action without approval**
   - Expected outcome: HOLD
   - Display state: PAUSED
   - Consequence: execution paused until approval exists

3. **Approved action**
   - Expected outcome: ALLOW
   - Display state: ALLOWED
   - Consequence: action executed with release authorization

## What The Demo Proves

The demo proves:

- CerbaSeal blocks AI self-authorization
- CerbaSeal pauses actions when approval is missing
- CerbaSeal allows execution only when required checks pass
- Every result includes enforcement proof

Each result shows:

- final decision state (BLOCKED / PAUSED / ALLOWED)
- consequence of the decision
- enforcement reason
- reason codes from the evaluation
- release authorization: present or none
- blocked action record: present or none
- expandable enforcement certificate

## Boundary

CerbaSeal enforces authority — not judgment.

It does not determine whether the action is correct.

It determines whether the action is authorized to execute.

## Scope

This is a local demonstration surface only.

It is not a production API.
It is not an authentication layer.
It is not a persistence layer.
It is not a policy engine.
It is not customer validation.
It is not a production deployment.
