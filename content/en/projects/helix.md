---
title: Helix
tagline: A quality of life mod for Fabric.
tier: flagship
order: 5
why: Shipped to real players and still downloaded.
built:
  problem: "Server owners need a way to switch off modules they don't allow, without players changing their install."
  solution: "The server sends a plugin message on the helix:config channel with a JSON list of module ids; Helix disables those modules until the player rejoins. Invalid JSON and unknown ids are ignored."
badge: { value: "1,400+", label: downloads on Modrinth, href: https://modrinth.com/mod/helix, live: "modrinth:downloads:helix" }
stats:
  asOf: "2026-09-27"
  source: https://modrinth.com/mod/helix
  items:
    - { label: downloads, value: "1,454", live: "modrinth:downloads:helix" }
    - { label: followers, value: "16", live: "modrinth:followers:helix" }
    - { label: commits, value: "25", live: "github:commits:integr-dev/helix" }
stack: [Kotlin, Java, Fabric]
links:
  - { label: Source, href: https://github.com/integr-dev/helix }
  - { label: Modrinth, href: https://modrinth.com/mod/helix }
visuals:
  - kind: chart
    label: Downloads
    chart:
      title: Downloads per release
      note: 10 releases between 14 Apr and 31 May 2024, Fabric, Minecraft 1.20.4 and 1.20.5
      source: https://modrinth.com/mod/helix/versions
      bars:
        - { label: "1.2.1", value: 155 }
        - { label: "1.2.2", value: 78 }
        - { label: "1.2.3", value: 92 }
        - { label: "1.2.4", value: 81 }
        - { label: "1.2.5", value: 242 }
        - { label: "1.2.6", value: 66 }
        - { label: "1.2.7", value: 96 }
        - { label: "1.2.8", value: 82 }
        - { label: "1.2.9", value: 255 }
        - { label: "1.3.0", value: 307 }
  - kind: images
    label: Screenshots
    images:
      - { src: /img/helix-menu.webp, alt: Helix main menu, width: 1264, height: 502 }
      - { src: /img/helix.webp, alt: Helix settings menu in game, width: 515, height: 301 }
      - { src: /img/helix-config-2.webp, alt: Helix module config screen, width: 473, height: 505 }
      - { src: /img/helix-ui.webp, alt: Helix interface elements, width: 602, height: 255 }
      - { src: /img/helix-hotbar.webp, alt: Helix custom hotbar, width: 452, height: 138 }
      - { src: /img/helix-discord.webp, alt: Helix Discord presence, width: 306, height: 103 }
---
Free and open source. Themes, accent colours and a set of small features that make the game nicer to play.
