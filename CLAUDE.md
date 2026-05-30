# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev          # Start dev server on port 3000
yarn build        # vite build + tsc type check
yarn test         # Run tests with vitest
yarn lint         # Biome lint
yarn format       # Biome format
yarn check        # Biome lint + format check together
```

## Architecture

**Stack:** Vite + React 19 + TypeScript, TanStack Router (file-based), TanStack Query, Tailwind CSS v4, Biome, Zod, Leaflet/react-leaflet, shadcn/ui.

**Routing** — File-based via TanStack Router. Add a file to `src/routes/` and the router auto-generates `src/routeTree.gen.ts` (never edit manually). Route groups use parentheses: `(app)/submit.tsx`. Nested params use `$`: `bidets/$bidetId.tsx`.

**Data fetching pattern:**
1. `src/services/` — raw `fetch` functions with Zod schema validation. All authenticated requests include `credentials: 'include'` and `X-CSRFToken` header (read from the `csrftoken` cookie via `getCookie` in `src/services/user.ts`).
2. `src/hooks/` — wrap service functions with `useQuery`/`useMutation` from TanStack Query.
3. Routes/components consume hooks and render with `<QueryResolver>` for consistent loading/error UI.

**API URL** is constructed as `` `http://${import.meta.env.VITE_BASE_API_URL}/api` `` in `src/utils/constants.ts`. Set `VITE_BASE_API_URL` in `.env`.

**Auth** — Django session-based. `getCurrentUser()` hits `/users/me/`. The `useUser()` hook (query key `['user']`) is the source of truth for auth state. `getCookie('csrftoken')` provides the CSRF token for mutating requests.

**UI components** — shadcn/ui primitives live in `src/components/ui/`. `<QueryResolver query={query}>{(data) => ...}</QueryResolver>` handles pending/error/success states uniformly.

**Maps** — Leaflet via `react-leaflet`. `CustomTileLayer` wraps the tile provider. `BOUNDS`, `DAVAO_CITY_COORDS`, and `CUSTOM_MARKER_ICON` are shared from `src/utils/constants.ts`.

**Formatting** — Biome with tabs and double quotes. Run `yarn check` before committing.

> Note: `src/lib/auth.ts` is legacy — prefer `src/services/user.ts` for auth helpers.
