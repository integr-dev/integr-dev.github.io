# Granum
Persistent semantic memory for Claude Code. Replaces context-window-based memory with a local vector + graph database that survives compaction, branch switches, and new sessions.

Claude saves decisions, preferences, constraints, and file state as typed chunks. Before each response, relevant chunks are retrieved via semantic search and graph traversal and injected automatically. You get a normal Claude Code conversation — granum runs invisibly in the background.

## How it works
Each chunk has a **type**, a **title**, and **content**. Claude assigns importance (1–5) and declares relationships (depends on, supersedes, contradicts, derived from). At retrieval, granum runs a two-phase search: cosine-similarity seeds, then BFS graph expansion — so related chunks surface even when their query similarity is low.

Chunks are stored in a local [Kuzu](https://kuzudb.com) graph database and exported to `.granum/chunks.ndjson` for git portability. Memory is branch-isolated: `project_id = md5(git_root:branch)`.

## Install
```bash
pip install -e .
granum init
```

Requires Python 3.9+. First run downloads the `all-MiniLM-L6-v2` embedding model (~90 MB). The MCP server starts automatically via `.mcp.json` when Claude Code loads the project.

## Chunk types
| Type | Used for |
|---|---|
| `decision` | Architectural and implementation choices |
| `preference` | User style, workflow, naming, tool preferences |
| `constraint` | Hard limits, version pins, gotcha behaviors |
| `file_state` | Current state of files, modules, systems |
| `spec` | Read-only — indexed from spec files |

## Retrieval
Two separate queries per turn, never pooled:
- **Memory chunks:** `similarity × 0.8 + freshness × 0.2`, weighted by importance, top 7. Seeds BFS graph expansion (depth ≤ 2).
- **Spec chunks:** similarity only, no freshness decay, top 3.

## Persistence
`.granum/chunks.ndjson` — one chunk per line, committed to git. NDJSON gives line-level diffs that auto-merge cleanly. Soft deletes only. Kuzu is the runtime store; NDJSON is the portability layer.
