# Forkcast
Forkcast is a web application that digitizes and simplifies meal planning. Instead of juggling paper lists, it combines a drag-and-drop weekly calendar with a smart shopping list, recipe discovery, and a small social layer around friends.

## Features
### Meal Planner & Calendar
- Interactive weekly calendar as the core of the app.
- Drag & drop recipes onto a weekday, categorized as breakfast, lunch, dinner, or a free-text label.
- Portions scale ingredient amounts to the number of people.

### Smart Shopping List
- Generated automatically from the weekly plan.
- Identical ingredients across recipes (e.g. onions) are merged and summed.
- Stock check: tick off or reduce quantities for items already at home.

### Discovery & Social
- Home page acts as an inspiration feed with a daily highlight.
- Friend network: add friends by username, send/accept/decline requests.
- Privacy: each user chooses whether their weekly plan is public or private.

### Recipes & Personalization
- Spoonacular API as recipe source, with detailed ingredients and nutrition.
- Search with filters, favorites, and per-recipe ratings.
- Allergy / dietary filters applied to recommendations.
- 9 UI languages including right-to-left (Arabic, Hebrew).

## Architecture
Monorepo with two independently deployed apps:

| Part | Stack | Deploy |
|------|-------|--------|
| `frontend/` | Nuxt 4 (Vue 3), Pinia, TailwindCSS 4 + DaisyUI, i18n | Static site → GitHub Pages |
| `backend/` | Express 5, better-sqlite3, JWT, Spoonacular | Docker image → GHCR |

The frontend is a static SPA: it talks to the backend REST API at `/api`, holds the JWT in `sessionStorage`, and renders the dashboard client-side. The backend owns auth, the SQLite database, recipe caching from Spoonacular, and email (verification / password reset).

## Quick Start
Run the backend and frontend in two terminals:

```bash
# Backend (REST API on :3000)
cd backend
cp example.env .env        # fill in JWT_SECRET, SPOONACULAR_API_KEY, ...
npm install && npm start

# Frontend (Nuxt dev server on :8080)
cd frontend
npm install
npm run dev -- --port 8080
```

## Team
Kerimcan Yagci, Lukas Grünzweil, Erik Reitbauer, Nico Haider — a WMC summer project.
