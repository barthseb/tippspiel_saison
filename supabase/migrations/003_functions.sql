-- 003_functions.sql

CREATE OR REPLACE FUNCTION calculate_points(p_match_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_home_actual INTEGER;
  v_away_actual INTEGER;
BEGIN
  SELECT home_goals_actual, away_goals_actual
  INTO v_home_actual, v_away_actual
  FROM matches
  WHERE id = p_match_id;

  IF v_home_actual IS NULL OR v_away_actual IS NULL THEN
    -- Clear points if result is removed
    UPDATE tips SET points = NULL WHERE match_id = p_match_id;
    RETURN;
  END IF;

  UPDATE tips
  SET points = CASE
    -- Exact score
    WHEN home_goals_tip = v_home_actual AND away_goals_tip = v_away_actual THEN 3
    -- Correct outcome (sign of difference matches)
    WHEN SIGN(home_goals_tip - away_goals_tip) = SIGN(v_home_actual - v_away_actual) THEN 1
    -- Wrong outcome
    ELSE 0
  END
  WHERE match_id = p_match_id;
END;
$$;

-- Trigger to auto-recalculate when match result is updated
CREATE OR REPLACE FUNCTION trigger_recalculate_points()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (OLD.home_goals_actual IS DISTINCT FROM NEW.home_goals_actual)
     OR (OLD.away_goals_actual IS DISTINCT FROM NEW.away_goals_actual) THEN
    PERFORM calculate_points(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS recalculate_points_trigger ON matches;
CREATE TRIGGER recalculate_points_trigger
AFTER UPDATE OF home_goals_actual, away_goals_actual ON matches
FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_points();
