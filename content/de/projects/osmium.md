---
# German overrides for content/projects/osmium.md. DRAFT: check the wording.
tagline: Steuert eine Flotte von Minecraft-Agenten ohne Oberfläche, die gemeinsam eine große Schematic bauen.
why: Mein bisher größtes System. Eine Person lädt eine Schematic hoch, Osmium teilt sie in Segmente, gibt jedem Agenten seinen Teil, und ein Web-Dashboard verfolgt jeden Agenten live.
built:
  problem: Ein Abzug der Datenbank darf nie reichen, um die Minecraft-Accounts der Flotte zu übernehmen.
  solution: Osmium hält die Zugangsdaten nie und meldet sich nie selbst an. Das Backend schickt einem Host nur einen Setup-Befehl; der Host meldet den Account auf einem Rechner an, den sein Besitzer kontrolliert, und schickt nur Benutzernamen und UUID zurück. Hosts verbinden sich von sich aus zum Backend, statt angesprochen zu werden, und ist ein Host nicht erreichbar, gilt der Zustand seiner Agenten als unbekannt statt offline.
---
Agenten melden sich über einen Host-Prozess an, gehen oder fliegen zu ihrem Segment und setzen es Lage für Lage. Das Dashboard zeigt Live-3D-Ansichten, eine gemeinsame Karte, die die Agenten beim Bewegen erkunden, Inventare, Telemetrie und ein Audit-Log. Die Konfiguration liegt zentral und wird Hosts bei jeder Neuverbindung erneut übergeben.
