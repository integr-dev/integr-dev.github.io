---
title: Forkcast
tagline: Meal planning with a drag and drop week and a shopping list that writes itself.
tier: flagship
order: 3
why: A team product with real interface work. Drag and drop planning, ingredient lists merged across recipes, friends, and nine languages including right to left.
built:
  problem: "A week of recipes lists the same ingredient many times over, in amounts for different numbers of people."
  solution: "The shopping list is generated from the weekly plan: amounts are scaled to the portions of each meal, identical ingredients are merged and summed across the week, and anything already at home can be ticked off or reduced."
stats:
  asOf: "2026-09-27"
  source: https://github.com/e-reitbauer/forkcast/graphs/contributors
  items:
    - { label: commits, value: "473" }
    - { label: of them mine, value: "196" }
    - { label: people, value: "4" }
    - { label: languages, value: "9" }
stack: [Nuxt, Vue, Pinia, TypeScript, Express, SQLite]
links:
  - { label: Live demo, href: https://e-reitbauer.github.io/forkcast/ }
  - { label: Source, href: https://github.com/e-reitbauer/forkcast }
visuals:
  - { kind: diagram, label: Architecture, diagram: forkcast }
  - kind: images
    label: Screenshots
    images:
      - { src: /img/forkcast-schedule.webp, alt: Forkcast weekly schedule with recipes placed on days, width: 1400, height: 779 }
      - { src: /img/forkcast-dashboard.webp, alt: Forkcast dashboard, width: 1400, height: 778 }
      - { src: /img/forkcast-shopping.webp, alt: Forkcast generated shopping list, width: 1400, height: 770 }
---
Recipes come from the Spoonacular API. Portions scale ingredient amounts, identical ingredients are summed across the week, and anything already at home can be ticked off.
