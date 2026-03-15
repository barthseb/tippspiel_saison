-- 001_schema.sql

CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_number INTEGER NOT NULL UNIQUE CHECK (match_number BETWEEN 1 AND 13),
  match_date DATE NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_goals_actual INTEGER,
  away_goals_actual INTEGER,
  result_entered_by UUID REFERENCES auth.users(id),
  result_entered_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  home_goals_tip INTEGER NOT NULL CHECK (home_goals_tip >= 0),
  away_goals_tip INTEGER NOT NULL CHECK (away_goals_tip >= 0),
  points INTEGER,
  UNIQUE(participant_id, match_id)
);

CREATE INDEX IF NOT EXISTS tips_participant_idx ON tips(participant_id);
CREATE INDEX IF NOT EXISTS tips_match_idx ON tips(match_id);

CREATE OR REPLACE VIEW leaderboard AS
SELECT
  p.id,
  p.ticket_number,
  p.name,
  COALESCE(SUM(t.points), 0) AS total_points,
  COUNT(*) FILTER (WHERE t.points = 3) AS exact_scores,
  COUNT(*) FILTER (WHERE t.points = 1) AS correct_outcomes,
  COUNT(*) FILTER (WHERE t.points = 0) AS wrong_tips
FROM participants p
LEFT JOIN tips t ON t.participant_id = p.id
GROUP BY p.id, p.ticket_number, p.name
ORDER BY total_points DESC, exact_scores DESC, p.name;
