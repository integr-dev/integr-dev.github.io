# Backbone
Backbone is a powerful and flexible plugin for Spigot-based Minecraft servers. Its core idea: write, test, and update server logic on a live server without restarts, dramatically speeding up the development lifecycle.

Whether you are an admin adding custom features with simple scripts or a developer prototyping new ideas, Backbone gives you the tools to be more productive.

## Features
- **Hot-Loadable Scripts:** Write and reload Kotlin scripts without restarting the server.
- **Advanced Scripting:** Inter-script imports, Maven dependencies, and custom compiler options.
- **Event System:** A custom event bus that complements Bukkit's, with more control inside scripts.
- **Command Framework:** A simple but powerful system to create commands directly from scripts.
- **Storage Abstraction:** Flexible storage with SQLite databases and typed configuration files.
- **GUI Framework:** A declarative framework for building interactive inventories.
- **Custom Items & Entities:** Stateful items with abilities and custom entities via the goals API.
- **Display Entity Rendering:** Create custom visuals in the world.
- **PlaceholderAPI Integration**, **HTTP Client DSL**, **memory-leak detection**, and much more.

## Getting Started
1. Download the latest release and drop the `.jar` into your server's `plugins` directory.
2. Start the server — Backbone generates its folders automatically.
3. Write custom logic in `.bb.kts` script files inside `scripts/`.

Requires Minecraft Java 1.21.11+, a Spigot-based server (Spigot, Paper), and Java 17+.

## Scripting Example
Every script uses the lifecycle DSL for hooks and event listeners:

```kotlin
lifecycle {
    // 'sustained' properties persist across script reloads.
    var counter by sustained(0)

    onLoad {
        println("Script loaded! Counter: $counter")
    }

    // Fires every server tick while the script is enabled.
    listener<TickEvent> { event ->
        counter++
        if (counter % 20 == 0) {
            Backbone.PLUGIN.server.onlinePlayers
                .forEach { it.sendMessage("Count: $counter") }
        }
    }
}
```

Scripts can pull Maven dependencies with `@DependsOn`, share code through `.bbu.kts` utility scripts, define commands, build GUIs, and talk to each other through inter-script messaging — all hot-reloadable with `/bb scripting reload`.
