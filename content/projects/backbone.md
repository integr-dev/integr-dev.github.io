---
title: Backbone
tagline: A framework for Spigot servers with Kotlin scripts you can reload while the server runs.
tier: flagship
order: 4
why: Change server logic without a restart. Scripts get their own event bus, commands, inventory GUIs and storage, and reload in place.
built:
  problem: "Every change to server logic meant restarting the Minecraft server."
  solution: "Logic lives in Kotlin scripts that are compiled and reloaded in place with /bb scripting reload. Properties declared as sustained keep their value across reloads, so a script picks up where it left off."
stats:
  asOf: "2026-09-27"
  source: https://modrinth.com/plugin/backbone-lib
  items:
    - { label: commits, value: "118" }
    - { label: stars, value: "6" }
    - { label: downloads, value: "123" }
stack: [Kotlin, Kotlin Scripting, Coroutines, Spigot, SQLite]
links:
  - { label: Source, href: https://github.com/integr-dev/backbone }
  - { label: Modrinth, href: https://modrinth.com/plugin/backbone-lib }
visuals:
  - { kind: code, label: Script }
---
```kotlin
lifecycle {
    // survives script reloads
    var counter by sustained(0)

    onLoad {
        println("Script loaded. Counter: $counter")
    }

    listener<TickEvent> {
        counter++
        if (counter % 20 == 0) {
            Backbone.PLUGIN.server.onlinePlayers
                .forEach { it.sendMessage("Count: $counter") }
        }
    }
}
```
