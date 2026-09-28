---
# German overrides for content/projects/backbone.md. DRAFT: check the wording.
tagline: Ein Framework für Spigot-Server mit Kotlin-Skripten, die sich im laufenden Betrieb neu laden lassen.
why: Serverlogik ändern ohne Neustart. Skripte bekommen ihren eigenen Event-Bus, Befehle, Inventar-Oberflächen und Speicher und werden an Ort und Stelle neu geladen.
built:
  problem: Jede Änderung an der Serverlogik bedeutete einen Neustart des Minecraft-Servers.
  solution: Die Logik steckt in Kotlin-Skripten, die mit /bb scripting reload an Ort und Stelle neu kompiliert und geladen werden. Als sustained deklarierte Eigenschaften behalten ihren Wert über das Neuladen hinweg, sodass ein Skript dort weitermacht, wo es war.
---
