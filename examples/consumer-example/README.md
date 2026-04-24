# Consumer Example

Shows CerbaSeal being used as an enforcement dependency by an external application.

The consumer simulates a separate system that proposes actions and must route them through CerbaSeal before executing.

## Concept

```
External System → GovernedRequest → CerbaSeal → GateResult → Execute or Halt
```

## Scenarios

| Scenario | Actor | Approval | Gate Decision | Execution |
|---|---|---|---|---|
| Unauthorized AI Action | AI | None | REJECT | NOT EXECUTED |
| Missing Approval | Analyst | Missing | HOLD | NOT EXECUTED |
| Valid Approved Action | Analyst | Valid | ALLOW | EXECUTED |

## Run

```sh
pnpm demo:consumer
pnpm demo:consumer:validate
```

## Files

- `mock-execution-system.ts` — execution layer that only fires on ALLOW
- `consumer.ts` — scenario builders and demo runner
- `validate-consumer.ts` — headless validation script

## Notes

- Core enforcement logic is not modified.
- GateResult is not manually constructed.
- All decisions originate from real ExecutionGateService evaluation.
- Does not claim production readiness.
