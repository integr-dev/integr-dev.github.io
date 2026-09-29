---
title: Why Osmium never holds a Minecraft login
date: "2026-09-27"
tags: [osmium, architecture, security]
summary: Osmium runs a fleet of Minecraft agents, but its backend never sees their credentials. That one rule shaped the protocol, the liveness model and how hosts connect.
---

Osmium coordinates a fleet of headless Minecraft agents that build one large schematic together. The obvious design would store each account's login in the backend and let the server start agents on demand. I went the other way, and it ended up shaping most of the system.

## The rule

**Osmium never holds Minecraft credentials, and never performs the login.**

When an agent should come online, the backend sends its host a `setup_agent` command. The host logs the account in by whatever means it prefers and reports back only the resulting username and UUID. The credentials stay on the machine that runs the host.

## What it buys

A full dump of the Osmium database reveals *which* accounts you run, but not the ability to run them. The backend simply has nothing that could log an account in.

## What it costs, and what followed from it

- **Hosts dial out.** The backend cannot start anything by itself, so hosts connect to it over a WebSocket and wait for commands, instead of the backend connecting to them.
- **Unknown is not offline.** If a host stops answering, the backend has no way of checking the account itself. An agent on an unreachable host is shown as *unknown*, not *offline*, because that is all the backend actually knows.
- **Agents are addressed through their host.** The host that holds an agent is also where its proxies and their credentials live. An operator can route an agent through a proxy by name, and the secret never leaves that machine.

The same idea keeps coming back while building features: if the backend would need a secret to do something, the host does it instead and reports what happened.

The full design lives in the [Osmium repository](https://github.com/integr-dev/osmium).
