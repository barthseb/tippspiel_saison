# Tippspiel Frühjahrssaison 2026

Admin dashboard for managing a football betting game (Tippspiel). Built with Next.js 16, Supabase, and Tailwind CSS.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### Database Setup

Run the migrations in order via the Supabase SQL Editor:

1. `supabase/migrations/001_schema.sql` — tables + leaderboard view
2. `supabase/migrations/002_seed_matches.sql` — all 13 matches
3. `supabase/migrations/003_functions.sql` — scoring function + trigger
4. `supabase/migrations/004_rls.sql` — row-level security policies

## Adding a New Participant

1. Log in to the dashboard
2. Navigate to **Teilnehmer** (`/dashboard/teilnehmer`)
3. Click the button to add a new participant (goes to `/dashboard/teilnehmer/neu`)
4. Fill in the **Losnummer** (ticket number) and **Name** (phone and notes are optional)
5. Enter the participant's tips for each match in the tip grid
6. Click **Speichern** to save

To edit an existing participant, click their name in the participant list.

## Adding a New Admin

There is no self-registration. Admin accounts are created manually in Supabase:

1. Open your [Supabase project](https://supabase.com/dashboard) → **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter an email and password for the new admin
4. The new admin can now log in at `/login`

All routes are protected — unauthenticated users are automatically redirected to `/login`.
