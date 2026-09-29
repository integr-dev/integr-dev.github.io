---
title: Osmium
---

Orchestration for a fleet of Minecraft agents that build a large schematic together. An operator uploads a schematic, picks the agents to work it, and Osmium splits it into segments and hands each agent its own slice. The dashboard shows what the fleet is doing: blocks left, throughput, the traffic every host moves, what needs attention, and what happened.

Agents can be sent anywhere by clicking the map or the 3D view. They walk there, or fly where the server allows it, and build what they are given one course at a time: stairs the right way round, slabs on the right half, doors hinged on the side they were drawn on.

## Modules

| Module | What it is | State |
|---|---|---|
| [`backend/`](https://github.com/integr-dev/osmium/blob/HEAD/backend/) | Spring Boot 4.1 / Kotlin. Auth, accounts, hosts, agents, schematics, build plans and jobs, and the WebSocket hosts dial into. | Built, 695 tests |
| [`frontend/`](https://github.com/integr-dev/osmium/blob/HEAD/frontend/) | Vue 3 / Vite SPA. Operator dashboard, the build pipeline, the live world viewer, the charted map and the storage breakdown. | Built, 665 tests |
| [`host/`](https://github.com/integr-dev/osmium/blob/HEAD/host/) | Runs on a machine you control, holds the Minecraft credentials and the proxies, drives the agents. TypeScript, on mineflayer. | Connects, plays, walks or flies where it is sent, reports its world, inventory and neighbours, streams what it sees, and builds the pieces it is given, 702 tests |
| [`testserver/`](https://github.com/integr-dev/osmium/blob/HEAD/testserver/) | A Paper server and the rig that builds on it: a schematic made of nothing but the block states that are hard to place, built for real and read back. | Two scripts; see its README |
| [`host/` → `osmium-link`](https://github.com/integr-dev/osmium/blob/HEAD/host/README.md) | The host's own command line: the accounts it can log in with, and the proxies it can route through. | Built |

## The one idea worth knowing

**Osmium never holds Minecraft credentials, and never performs the login.**

The backend sends a host a `setup_agent` command; that host logs the account in by whatever means it
prefers and reports back only the resulting username and UUID. A full database dump therefore
reveals *which* accounts you run, not the ability to run them.

That constraint shapes everything else: how agents are addressed, why hosts dial out instead of
being connected to, and why a host being unreachable makes an agent's state *unknown* rather than
offline.

[`FLEET_CONNECTIVITY.md`](https://github.com/integr-dev/osmium/blob/HEAD/FLEET_CONNECTIVITY.md) is the design document, credential custody, the
wire protocol, liveness, chat, and the alternatives that were rejected and why.

## Running it locally

Needs **JDK 25**, **Node 24** and **Docker**.

```bash
# 1. Postgres
docker compose -f backend/docker-compose.yml up -d

# 2. Backend on :8080
cd backend && ./gradlew bootRun          # gradlew.bat on Windows

# 3. Frontend on :5173, proxying /api to the backend
cd frontend && npm install && npm run dev

# 4. Optional: a mock host, once you have registered one and copied its token
cd backend && OSMIUM_HOST_TOKEN=osm_host_1_… ./gradlew mockHost
```

The mock host speaks the real protocol over the real socket, it connects, reports agents,
telemetry and chat, fetches segments and places blocks, so the whole pipeline can be exercised
without a Minecraft account. It is a development convenience, not a stand-in for the host program.

Sign in with `admin` / `admin`. Those are development defaults and are seeded only while the `users`
table is empty, override `OSMIUM_BOOTSTRAP_USERNAME` / `OSMIUM_BOOTSTRAP_PASSWORD`, and
`OSMIUM_JWT_SECRET`, before running this anywhere real.
