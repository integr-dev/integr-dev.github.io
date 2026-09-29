---
title: Changing a Minecraft server without restarting it
date: 2026-09-27
description: "Developing plugins for a Spigot server usually means the same loop: change code, build a jar, restart the server, rejoin, test. Backbone removes the restart. Server logic lives in Kotlin scripts (.bb.kts) that are compiled and reloaded while the server keeps running."
draft: false
summary: Backbone lets server logic live in Kotlin scripts that reload while the server keeps running. How the lifecycle DSL keeps state across reloads.
tags:
  - backbone
  - kotlin
  - minecraft
---

Developing plugins for a Spigot server usually means the same loop: change code, build a jar, restart the server, rejoin, test. [Backbone](https://github.com/integr-dev/backbone) removes the restart. Server logic lives in Kotlin scripts (`.bb.kts`) that are compiled and reloaded while the server keeps running.

## One lifecycle per script

Every script declares what happens when it loads and which events it listens to:

```kotlin
lifecycle {
    // 'sustained' properties persist across script reloads
    var counter by sustained(0)

    onLoad {
        println("Script loaded. Counter: $counter")
    }

    listener<TickEvent> {
        counter++
    }
}
```

`/bb scripting reload` swaps in the new version of every script without touching the rest of the server.

## Keeping state across reloads

Reloading would be much less useful if every counter, cache or cooldown reset each time. Properties declared with `sustained(...)` keep their value when the script is reloaded, so you can change behaviour while the state stays where it was.

## More than single files

- Scripts can pull Maven dependencies with `@DependsOn`.
- Shared code goes into utility scripts (`.bbu.kts`) that other scripts import.
- Scripts define commands, build inventory GUIs and talk to each other through inter-script messaging, and all of it is hot-reloadable.
- Around that sit a custom event bus, SQLite backed storage, typed config files, custom items and entities.

Backbone is on [Modrinth](https://modrinth.com/plugin/backbone-lib) and runs on Spigot based servers (Spigot, Paper) for Minecraft 1.21.11 and Java 17 or newer.
