# Agent Gate Demo

Shows CerbaSeal sitting between an AI-like agent and tool execution.

The agent proposes tool calls. CerbaSeal must authorize each one before the tool fires.

## Concept

```
Agent → ToolCallProposal → GovernedRequest → CerbaSeal → GateResult → Execute or Block
```

## Tools

| Tool | Maps To Action |
|---|---|
| escalate_case | escalate |
| apply_hold | account_hold |
| send_notification | escalate |

## Scenarios

| Scenario | Actor | Tool | Gate Decision | Tool Executed |
|---|---|---|---|---|
| AI Self-Authorization Attempt | AI | escalate_case | REJECT | false |
| Approval Required | Analyst | apply_hold | HOLD | false |
| Approved Tool Execution | Analyst | apply_hold | ALLOW | true |

## Run

```sh
pnpm demo:agent
pnpm demo:agent:validate
```

## Files

- `tools.ts` — tool registry and gated execution function
- `agent.ts` — scenario builders
- `run-agent-gate.ts` — demo entry point
- `validate-agent-gate.ts` — headless validation script

## Notes

- Core enforcement logic is not modified.
- GateResult is not manually constructed.
- No external agent framework dependency.
- Does not claim production readiness.
