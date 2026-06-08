# CerbaSeal — Deployment Starter

A minimal, self-contained deployment template. Choose your deployment path:

- **Path A (Docker — recommended):** `docker compose up` — no local Node.js tooling required
- **Path B (Node.js direct):** `pnpm setup` — full local control with the interactive wizard

---

## Path A — Docker (Recommended)

**Prerequisites:** Docker and Docker Compose installed. No Node.js or pnpm required on your machine.

### Step 1 — Copy and configure `.env`

```bash
cp deployment-starter/.env.template deployment-starter/.env
```

Open `deployment-starter/.env` and set `CERBASEAL_ENV`:

```
CERBASEAL_ENV=production
PORT=3000
LOG_PATH=/app/data/audit.jsonl
```

The audit log is written to `./deployment-starter/data/audit.jsonl` on your host machine (via the `./data` volume mount).

### Step 2 — Start the gate

```bash
docker compose -f deployment-starter/docker-compose.yml up
```

Or from inside `deployment-starter/`:

```bash
cd deployment-starter && docker compose up
```

The first run builds the image (3–5 minutes). Subsequent starts are immediate.

**What a successful start looks like:**

```
cerbaseal-gate  | CerbaSeal enforcement gate
cerbaseal-gate  |   http://localhost:3000
cerbaseal-gate  |   POST /evaluate  — submit a GovernedRequest, receive a GateResult
cerbaseal-gate  |   GET  /health    — gate status and audit chain validity
cerbaseal-gate  |   Audit log  : /app/data/audit.jsonl
```

### Step 3 — Confirm the health check

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok",
  "gateReady": true,
  "auditChainValid": true,
  "uptime": 1.4
}
```

### Step 4 — Submit a test evaluation

```bash
curl -X POST http://localhost:3000/evaluate \
  -H "Content-Type: application/json" \
  -d @deployment-starter/sample-request.json
```

The gate returns a `GateResult` with `finalState` of `ALLOW`, `HOLD`, or `REJECT`.

### Customising the policy file

The image includes the default `cerbaseal.policy.json` from `deployment-starter/`. To deploy with a custom policy:

1. Edit `deployment-starter/cerbaseal.policy.json` (then rebuild: `docker compose build`)
2. Or mount a policy file without rebuilding — add to `docker-compose.yml`:
   ```yaml
   volumes:
     - ./data:/app/data
     - ./my-policy.json:/app/cerbaseal.policy.json
   ```

See `docs/client-adoption/policy-pack-authoring-guide.md` for policy authoring reference.

---

## Path B — Node.js Direct

**Prerequisites:** Node.js 18+, pnpm installed (`npm install -g pnpm`).

> **Dependency model:** `deployment-starter/package.json` declares `"cerbaseal-review": "file:../"` — a file reference to the CerbaSeal-Core root package. Running `pnpm install` inside `deployment-starter/` creates a `node_modules/cerbaseal-review` symlink pointing to the repo root. When CerbaSeal is published to npm (future), the reference changes from `file:../` to the npm package name — no other code changes required.

### Step 1 — Clone and install

```bash
git clone <cerbaseal-core-repo-url>
cd cerbaseal-core
pnpm install
```

Verify the installation:

```bash
pnpm test
# Expected: 432/432 tests passing

pnpm audit:repo
# Expected: 16/16 checks passing
```

### Step 2 — Run the setup wizard

```bash
pnpm setup
```

The wizard asks 6 questions:
1. Deployment mode (A/B/C)
2. Workflow name (→ becomes the workflow class identifier)
3. AI actor identifier
4. Number of approver roles (1–3) and their authority classes
5. Audit log storage path (file or in-memory)
6. Environment (dev/staging/production)

At the end, it writes `cerbaseal.config.json` and `cerbaseal.policy.json` to the repo root, then runs `pnpm audit:repo` automatically.

**What a successful setup looks like:**
```
✓ Setup complete — CerbaSeal is configured and all 16 audit checks pass.
```

### Step 3 — Review the generated config files

Open `cerbaseal.config.json` and `cerbaseal.policy.json` at the repo root.

Confirm:
- Your workflow class appears under `workflowClasses.extended`
- Your approver roles appear under `actorMappings`
- Your approval chains are correct under `approvalChains`

Edit either file if any values need adjustment, then re-run `pnpm audit:repo`.

### Step 4 — Run the audit to confirm

```bash
pnpm audit:repo
```

**What a passing result looks like:**
```
16 / 16 checks passed
Status: PASS
```

If any check fails, the output names the check and the reason. Fix the issue and re-run.

### Step 5 — Run verification scenarios

```bash
tsx deployment-starter/verify.ts
```

This runs 3 scenarios against the live gate:

1. **REJECT** — AI actor attempts self-authorization → must be rejected
2. **HOLD** — Request submitted without approval → must be held
3. **ALLOW** — Request with valid approval → must be allowed

**What a passing result looks like:**
```
Scenario 1: REJECT — AI actor cannot self-authorize
  [PASS] finalState is REJECT
  [PASS] releaseAuthorization is null
  [PASS] blockedActionRecord is present

Scenario 2: HOLD — approval required but not supplied
  [PASS] finalState is HOLD
  [PASS] humanApprovalRequired is true
  [PASS] releaseAuthorization is null

Scenario 3: ALLOW — valid request with analyst approval
  [PASS] finalState is ALLOW
  [PASS] releaseAuthorization is present
  [PASS] humanApprovalPresent is true

Results: 9 passed, 0 failed
✓ All 3 scenarios passed. Deployment verified.
```

When all 3 scenarios show `[PASS]`, your deployment is verified and ready for integration.

---

## Files in this directory

| File | Purpose |
|---|---|
| `README.md` | This guide |
| `index.ts` | HTTP server — `POST /evaluate` and `GET /health` endpoints |
| `Dockerfile` | Multi-stage Docker build (builder + runtime stages) |
| `docker-compose.yml` | Single-service Compose file with volume, health check, restart policy |
| `.env.template` | Environment variable template — copy to `.env` before `docker compose up` |
| `cerbaseal.config.json` | Configuration template — authority classes and workflow classes |
| `cerbaseal.policy.json` | Policy template — actor mappings, approval chains, action policies |
| `package.json` | Minimal dependencies: tsx and cerbaseal-review (file reference) |
| `verify.ts` | Standalone verification script (3 scenarios, 9 assertions) |

---

## Need help?

- Full operator guide: `docs/deployment/quickstart-operator-guide.md`
- Policy authoring: `docs/client-adoption/policy-pack-authoring-guide.md`
- Partner deployment guide: `docs/partner-kit/03-deployment-guide.md`
- Troubleshooting: `docs/client-adoption/troubleshooting-guide.md`
- Training: `docs/client-adoption/training/admin-guide.md`
