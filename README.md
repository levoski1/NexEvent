# NexEvent

> Soroban-to-Web2 automation infrastructure. Detect smart contract events on Stellar and trigger real-world actions.

[![CI](https://github.com/your-org/nexevent/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/nexevent/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![Rust](https://img.shields.io/badge/rust-stable-orange)](https://rustup.rs)

---

## What is NexEvent?

NexEvent is a decentralized automation platform — think IFTTT for Soroban smart contracts.

When a Soroban contract emits an event (`transfer`, `SwapExecuted`, `LiquidityAdded`, etc.), NexEvent detects it and executes a configured action:

- **Webhooks** — POST to any HTTP endpoint
- **Discord** — Send a message via Discord webhook
- **Telegram** — Send a message via Telegram Bot API
- **Email** — Send an email via SMTP

Events are matched against user-defined **Triggers**, queued via **BullMQ**, and delivered with automatic retry and dead-letter handling.

---

## Architecture

```
Soroban RPC
    │
    ▼
┌─────────────┐     poll getEvents()     ┌──────────────────┐
│   Worker    │ ──────────────────────── │  Soroban Poller  │
│  (Node.js)  │                          │  (ledger cursor) │
└─────────────┘                          └──────────────────┘
    │
    │  match against active Triggers (MongoDB)
    │
    ▼
┌─────────────┐     BullMQ Job           ┌──────────────────┐
│   Queue     │ ──────────────────────── │  Action Executor │
│  (Redis)    │                          │  webhook/discord │
└─────────────┘                          │  telegram/email  │
                                         └──────────────────┘
┌─────────────┐
│   Backend   │  REST API + Swagger
│  (Express)  │  Trigger CRUD
│             │  Audit Log
│             │  Queue Metrics
└─────────────┘
┌─────────────┐
│  Frontend   │  Dashboard
│  (React)    │  Trigger Management
│             │  Queue Monitor
│             │  Audit Viewer
└─────────────┘
```

---

## Monorepo Structure

```
nexevent/
├── apps/
│   ├── backend/          # Express API server
│   ├── worker/           # Soroban poller + BullMQ processor
│   └── frontend/         # React + Vite dashboard
├── packages/
│   ├── shared-types/     # TypeScript domain types
│   ├── shared-utils/     # Hashing, interpolation, diff utilities
│   └── config/           # Zod-validated environment config
├── contracts/            # Soroban smart contracts (Rust)
│   ├── boilerplate/
│   ├── gas_estimator/
│   ├── stablecoin_emitter/
│   ├── nft_royalty_emitter/
│   ├── oracle_aggregator/
│   ├── token_vesting/
│   ├── staking/
│   └── reward_pool/
├── infrastructure/
│   ├── docker/           # Dockerfiles + nginx config
│   ├── docker-compose.yml
│   └── scripts/          # setup.sh, seed.ts
└── .github/workflows/    # CI/CD pipeline
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, TailwindCSS, React Query, Zustand |
| Backend | Node.js 20, Express, TypeScript, Mongoose, BullMQ, Zod, Pino, Swagger |
| Database | MongoDB 7 |
| Queue | Redis 7 + BullMQ |
| Blockchain | Stellar Soroban SDK, Soroban RPC |
| Contracts | Rust, soroban-sdk 21 |
| Infrastructure | Docker, Docker Compose, Nginx |
| CI/CD | GitHub Actions |

---

## Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10
- **Docker** + Docker Compose
- **Rust** stable + `wasm32-unknown-unknown` target (contracts only)

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-org/nexevent.git
cd nexevent

# 2. Run the automated setup
#    Copies .env, installs dependencies, starts MongoDB + Redis, seeds the DB
./infrastructure/scripts/setup.sh

# 3. Start all apps in development mode
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000/api/v1 |
| Swagger UI | http://localhost:4000/api/docs |
| MongoDB | mongodb://localhost:27017/nexevent |
| Redis | localhost:6379 |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values.

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | ✅ | Min 32 characters |
| `ADMIN_API_KEY` | ✅ | Min 16 characters — used for audit/queue endpoints |
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `SOROBAN_RPC_URL` | ✅ | Soroban RPC endpoint |
| `STELLAR_NETWORK_PASSPHRASE` | ✅ | Network passphrase |
| `REDIS_HOST` | ✅ | Redis host (default: `localhost`) |
| `TELEGRAM_BOT_TOKEN` | — | Required for Telegram actions |
| `SMTP_HOST` | — | Required for email actions |
| `DISCORD_BOT_TOKEN` | — | Required for Discord bot actions |

See `.env.example` for the full list.

---

## API Reference

Full OpenAPI documentation is available at `/api/docs` when the backend is running.

### Triggers

```
GET    /api/v1/triggers          List triggers (paginated)
POST   /api/v1/triggers          Create a trigger
GET    /api/v1/triggers/:id      Get a trigger
PATCH  /api/v1/triggers/:id      Update a trigger
DELETE /api/v1/triggers/:id      Delete a trigger
POST   /api/v1/triggers/:id/pause
POST   /api/v1/triggers/:id/resume
```

### Audit Log *(requires `x-admin-key` header)*

```
GET    /api/v1/audit             List audit logs (paginated)
GET    /api/v1/audit/:id/verify  Verify integrity hash
```

### Queue *(requires `x-admin-key` header)*

```
GET    /api/v1/queue/metrics     Live counts + metric history
```

### Health

```
GET    /api/v1/health            DB + Redis status
```

### Example: Create a Webhook Trigger

```bash
curl -X POST http://localhost:4000/api/v1/triggers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Transfer Alert",
    "filter": { "eventType": "transfer" },
    "actionType": "webhook",
    "actionConfig": {
      "url": "https://your-endpoint.com/hook",
      "method": "POST"
    },
    "batching": { "enabled": false }
  }'
```

---

## Trigger Configuration

A trigger matches Soroban events using an AND filter and executes one action.

```json
{
  "name": "Stablecoin Transfer → Discord",
  "filter": {
    "contractId": "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM",
    "eventType": "transfer"
  },
  "actionType": "discord",
  "actionConfig": {
    "webhookUrl": "https://discord.com/api/webhooks/...",
    "messageTemplate": "💸 Transfer on ledger {{ledger}} — tx: {{txHash}}"
  },
  "batching": {
    "enabled": true,
    "windowMs": 10000,
    "maxBatchSize": 20,
    "continueOnError": true
  },
  "maxRetries": 3
}
```

**Template variables:** `{{type}}`, `{{contractId}}`, `{{ledger}}`, `{{txHash}}`, `{{ledgerClosedAt}}`

**Filter fields** (all optional, AND logic):

| Field | Description |
|---|---|
| `contractId` | Match a specific contract address |
| `eventType` | Match event type string |
| `topicContains` | Array of topic strings that must all be present |

---

## Smart Contracts

All contracts are in `contracts/` as a Cargo workspace.

```bash
cd contracts

# Install Rust target
rustup target add wasm32-unknown-unknown

# Run all tests
cargo test

# Build all contracts (WASM)
cargo build --release --target wasm32-unknown-unknown
```

| Contract | Events Emitted |
|---|---|
| `boilerplate` | `init`, `increment` |
| `stablecoin_emitter` | `mint`, `burn`, `transfer` |
| `nft_royalty_emitter` | `nft_mint`, `nft_sale` |
| `oracle_aggregator` | `price_upd`, `price_dev` (deviation alert) |
| `token_vesting` | `vest_crt`, `vest_clm` |
| `staking` | `staked`, `unstaked` |
| `reward_pool` | `pool_fund`, `allocated`, `rwd_claim` |
| `gas_estimator` | `fee_rec`, `high_fee` (threshold alert) |

---

## Docker

### Full stack

```bash
# Start everything
docker compose -f infrastructure/docker-compose.yml up -d

# Stop everything
docker compose -f infrastructure/docker-compose.yml down
```

### Individual services

```bash
# Infrastructure only (for local dev)
docker compose -f infrastructure/docker-compose.yml up -d mongo redis
```

---

## Development

### Available scripts (root)

```bash
npm run dev          # Start all apps in parallel (watch mode)
npm run build        # Build all packages and apps
npm run test         # Run all test suites
npm run type-check   # TypeScript check across all packages
npm run lint         # ESLint across all packages
npm run clean        # Remove all dist/ and node_modules/
```

### Project-specific

```bash
# Backend only
npm run dev --workspace=@nexevent/backend

# Worker only
npm run dev --workspace=@nexevent/worker

# Frontend only
npm run dev --workspace=@nexevent/frontend
```

### Seed the database

```bash
npm run seed
```

---

## Audit & Compliance

Every mutation (trigger create/update/delete/pause) writes an immutable `AuditLog` document with:

- **SHA-256 integrity hash** of the action payload
- **Request fingerprint** (IP + user-agent, 1-minute bucket)
- **Change diff** (before/after for updates)

Verify a log entry hasn't been tampered with:

```bash
curl http://localhost:4000/api/v1/audit/<id>/verify \
  -H "x-admin-key: your_admin_key"
# → { "success": true, "data": { "valid": true } }
```

---

## CI/CD

The GitHub Actions pipeline (`.github/workflows/ci.yml`) runs on every push and PR:

| Job | What it does |
|---|---|
| `ts-build-test` | Type-check, build all TS packages, run Vitest |
| `contracts` | `cargo test` + `cargo build --target wasm32-unknown-unknown` |
| `docker` | Build all three Docker images (no push) |
| `deploy` | Push images to GHCR on `main` branch merges |

---

## Production Considerations

- **Secrets:** Use a secrets manager (AWS Secrets Manager, Vault) — never commit `.env`
- **MongoDB:** Enable authentication and use a replica set for oplog-based change streams
- **Redis:** Enable `requirepass` and use TLS in transit
- **Soroban RPC:** Use a dedicated RPC node or a provider with rate-limit headroom
- **Worker scaling:** Run multiple worker replicas — BullMQ handles distributed locking
- **TLS:** Terminate SSL at the load balancer or add Certbot to the Nginx container
- **Monitoring:** Add Prometheus metrics exporter + Grafana dashboard for queue depth

---

## License

MIT © NexEvent Contributors
