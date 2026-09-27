---
title: Osmium
tagline: Runs a fleet of headless Minecraft agents that build one large schematic together.
tier: flagship
order: 1
why: My largest system so far. One operator uploads a schematic, Osmium splits it into segments, hands each agent its slice, and a web dashboard follows every agent live.
stats:
  asOf: "2026-09-27"
  source: https://github.com/integr-dev/osmium
  items:
    - { label: commits, value: "352" }
    - { label: of them mine, value: "341" }
    - { label: first commit, value: "Aug 2026" }
stack: [TypeScript, Kotlin, Vue, Spring Boot, PostgreSQL, mineflayer]
links:
  - { label: Source, href: https://github.com/integr-dev/osmium }
visuals:
  - { kind: diagram, label: Architecture, diagram: osmium }
---
Agents sign in through a host process, walk or fly to their segment and place it course by course. The dashboard shows live 3D views, a shared map the agents chart as they move, inventories, telemetry and an audit log. Configuration is stored centrally and replayed to hosts on every reconnect.
