---
title: Clay
tagline: A documentation framework that drops into an existing repository.
tier: flagship
order: 2
why: A complete toolchain I designed and maintain under its own organisation. A Vue and Nuxt frontend plus a Go CLI that turns a folder of Markdown into a deployable site.
stats:
  asOf: "2026-09-27"
  source: https://github.com/clay-doc
  items:
    - { label: repositories, value: "3" }
    - { label: commits, value: "51" }
    - { label: stars, value: "5" }
stack: [Vue, Nuxt, TypeScript, Go, Shiki]
links:
  - { label: Live demo, href: https://clay-doc.github.io/clay-example-repo/ }
  - { label: Clay, href: https://github.com/clay-doc/clay }
  - { label: Clay Oven, href: https://github.com/clay-doc/clay-oven }
  - { label: Example, href: https://github.com/clay-doc/clay-example-repo }
visuals:
  - { kind: diagram, label: Diagram, diagram: clay }
  - kind: images
    label: Screenshot
    images:
      - { src: /img/clay-demo.webp, alt: The Clay example docs site showing the Advanced Features page with sidebar navigation and highlighted code, width: 1600, height: 910 }
---
Documentation lives in `docs/` as plain Markdown. Clay Oven scans it, writes the navigation structure and bundles it with a prebuilt Clay frontend. One `clay.yaml` sets title, navbar, languages and landing page.
