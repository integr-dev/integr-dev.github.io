---
# German overrides for content/projects/clay.md. DRAFT: check the wording.
tagline: Ein Dokumentations-Framework, das sich in ein bestehendes Repository einfügt.
why: Eine komplette Toolchain, die ich unter einer eigenen Organisation entworfen habe und pflege. Ein Frontend mit Vue und Nuxt plus ein Go-CLI, das aus einem Ordner voller Markdown eine fertige Website macht.
built:
  problem: Die meisten Doku-Tools verlangen, dass ein Projekt einen Static Site Generator und dessen Build übernimmt.
  solution: 'Das Clay-Frontend kommt fertig gebaut und liest zur Laufzeit alles aus zwei Dateien: clay.yaml, von Hand geschrieben, und clay-structure.yaml, die Clay Oven, ein Go-CLI, beim Durchsuchen von docs/ erzeugt. Ein Repository bekommt nur Markdown und eine Konfigurationsdatei dazu.'
alts:
- Die Clay-Beispieldoku mit der Seite Advanced Features, Seitenleiste und hervorgehobenem Code
---
Die Dokumentation liegt als einfaches Markdown in `docs/`. Clay Oven durchsucht sie, schreibt die Navigationsstruktur und bündelt sie mit einem fertig gebauten Clay-Frontend. Eine `clay.yaml` legt Titel, Navigationsleiste, Sprachen und Startseite fest.
