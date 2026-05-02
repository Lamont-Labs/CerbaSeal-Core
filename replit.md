# CerbaSeal

Deterministic execution enforcement spine for AI-assisted workflows. Sits between a decision system and an execution system, returning ALLOW / HOLD / REJECT with a hash-linked evidence trail.

## Current State

- 323 / 323 tests passing, 0 failing, 15 test files (`pnpm test`)
- 62 / 62 portal validation assertions passing (`pnpm review:validate`)
- External Reviewer & Pilot Readiness Portal live at `pnpm demo:web`
- Adversarial integrity audit complete
- No third-party security review yet — flagged on every portal page

## Repo Layout

- `src/` — core enforcement engine (do not modify without explicit request)
- `test/` — vitest test suites (15 files)
- `examples/browser-demo/` — demo server, portal pages, validation script
  - `server.ts` — express-style server, 10 routes total
  - `review-portal.ts` — exported `REVIEW_SUMMARY`, `PILOT_READINESS`, `SECURITY_SUMMARY` data
  - `pages/` — `review.html`, `pilot.html`, `security.html`, `deployment.html`
  - `validate-review-portal.ts` — headless validation
- `docs/` — reviewer brief, pilot brief, security brief, deployment posture, status
- `artifacts/cerbaseal-demo/` — registered web artifact, runs the same demo server

## Browser Routes

| Route | Type | Purpose |
|---|---|---|
| `/` | HTML | Demo homepage with nav, plain english, reviewer notes |
| `/review` | HTML | External reviewer portal |
| `/pilot` | HTML | Pilot readiness + intake checklist |
| `/security` | HTML | Security controls, threats, limitations |
| `/deployment` | HTML | Deployment posture and modes |
| `/api/reject` | JSON | Live REJECT scenario |
| `/api/hold` | JSON | Live HOLD scenario |
| `/api/allow` | JSON | Live ALLOW scenario |
| `/api/review-summary` | JSON | Machine-readable review data |
| `/api/pilot-readiness` | JSON | Machine-readable pilot data |
| `/api/security-summary` | JSON | Machine-readable security data |

## Scripts

- `pnpm test` — full vitest suite (323 tests)
- `pnpm demo:web` — start browser demo + portal on port 3001
- `pnpm demo:review` — alias for the portal
- `pnpm review:validate` — headless 62-point portal validation
- `pnpm demo:support` — support readiness demo
- `pnpm demo:support:validate` — support readiness validation

## Claim Discipline (Enforced By Tests)

Forbidden phrases anywhere in portal pages or JSON output:
- "production-ready"
- "fully compliant"
- "regulator-approved"
- "unhackable"
- "guaranteed" (uncaveated)

Forbidden names in any output: Line Axia, a16z, Speedrun, Replit Startups, Olivia, Jordan Mazer.

Every page must include a limitation notice ("not a production client deployment").

## Known Open Items (Surfaced In Portal)

- Third-party security review
- Client-specific workflow binding
- Working agreement with a pilot client
- Client deployment environment selection
- Persistent audit storage
- Cryptographic signing of decision artifacts
- Identity provider integration
- Legal / regulatory review
- Commercial and support terms

## Architecture Notes

- No external dependencies added for the portal
- No authentication, no database
- Core enforcement logic in `src/` is unchanged
- The artifact at `artifacts/cerbaseal-demo` and the root workflow both run the same `examples/browser-demo/server.ts`
- After modifying `review-portal.ts` or `pages/`, restart both `Start application` and `artifacts/cerbaseal-demo: web` workflows so the running servers pick up the new content
