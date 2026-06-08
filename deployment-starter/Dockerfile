# CerbaSeal — Deployment Starter Dockerfile
#
# Build context must be the repo root (set in docker-compose.yml).
# Build from deployment-starter/:
#   docker compose up
# Or from repo root:
#   docker build -t cerbaseal-gate -f deployment-starter/Dockerfile .

# ── Stage 1: install + resolve dependencies ───────────────────────────────────
FROM node:22-alpine AS builder

RUN npm install -g pnpm@9

WORKDIR /workspace

# Copy root package manifest and source (cerbaseal-review)
COPY package.json pnpm-lock.yaml tsconfig.json ./
COPY src/ ./src/
COPY cerbaseal.config.json cerbaseal.policy.json ./

# Copy deployment-starter source
COPY deployment-starter/package.json ./deployment-starter/
COPY deployment-starter/index.ts ./deployment-starter/

# Install root dependencies (validates lockfile)
RUN pnpm install --frozen-lockfile

# Install deployment-starter dependencies
WORKDIR /workspace/deployment-starter
RUN pnpm install

# Resolve the file:../ symlink to concrete files so the runtime stage
# has no symlink dependencies outside its own directory tree.
RUN rm -rf node_modules/cerbaseal-review && \
    mkdir -p node_modules/cerbaseal-review && \
    cp /workspace/package.json node_modules/cerbaseal-review/ && \
    cp -r /workspace/src node_modules/cerbaseal-review/src

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime

WORKDIR /app

# Copy deployment-starter with resolved node_modules (no symlinks)
COPY --from=builder /workspace/deployment-starter ./deployment-starter

# Bake in default config and policy (operators override via volume mounts)
COPY deployment-starter/cerbaseal.config.json ./cerbaseal.config.json
COPY deployment-starter/cerbaseal.policy.json ./cerbaseal.policy.json

# Data directory — mounted as a volume for audit log persistence
RUN mkdir -p /app/data

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=10s \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Run from /app (WORKDIR) so CWD-based config lookup finds /app/cerbaseal.config.json
CMD ["deployment-starter/node_modules/.bin/tsx", "deployment-starter/index.ts"]
