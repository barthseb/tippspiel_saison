# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # node node_modules/next/dist/bin/next dev  (npx/bin wrapper broken on Node 25)
npm run build    # production build
npm run test     # vitest run (all tests)
npx vitest run lib/scoring.test.ts   # single test file
```

## Architecture

**Admin-only** Next.js 16 App Router app. No public routes — everything under `/dashboard/*` is guarded by `proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`).

### Auth flow
`proxy.ts` → checks Supabase session → redirects unauthenticated users to `/login`. The dashboard layout (`app/dashboard/layout.tsx`) does a second server-side check and redirects as well. Admin accounts are created manually in the Supabase dashboard; no self-registration.

### Data flow: result → points
1. Admin saves a match result in `MatchResultModal` (client component)
2. Supabase UPDATE on `matches` fires the `recalculate_points_trigger` (defined in `supabase/migrations/003_functions.sql`)
3. Trigger calls `calculate_points(match_id)` which UPDATEs `tips.points` for every tip on that match
4. The `leaderboard` view (defined in `001_schema.sql`) aggregates points on read — no materialized state

### Scoring logic lives in two places (must stay in sync)
- `lib/scoring.ts` — `calculatePoints()` used for live preview badges in the TipGrid UI
- `supabase/migrations/003_functions.sql` — `calculate_points()` PostgreSQL function that writes to the DB

### Optimistic concurrency on participant edits
`ParticipantForm` includes `updated_at` in the UPDATE WHERE clause. Zero rows returned = another admin changed the record → shows conflict error. No autosave; explicit save button only.

### Supabase clients
- `lib/supabase/client.ts` — browser client (`createBrowserClient`), used in `'use client'` components
- `lib/supabase/server.ts` — server client (`createServerClient` with cookies), used in Server Components and route handlers

### Key types
All shared TypeScript interfaces are in `lib/types.ts`. The `leaderboard` Supabase view returns `LeaderboardEntry` rows ordered by `total_points DESC, exact_scores DESC, name ASC`.

## Database migrations

Run in order via Supabase SQL Editor:
1. `001_schema.sql` — tables + leaderboard view
2. `002_seed_matches.sql` — all 13 matches (idempotent via ON CONFLICT DO NOTHING)
3. `003_functions.sql` — `calculate_points()` RPC + trigger
4. `004_rls.sql` — RLS policies (authenticated users only)

## Environment

```
NEXT_PUBLIC_SUPABASE_URL=https://hpcielicjkethknlkptr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
