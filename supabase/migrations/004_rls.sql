-- 004_rls.sql
-- All tables are only accessible to authenticated users (admins)

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

-- admin_profiles: only own row
CREATE POLICY "admins_own_profile" ON admin_profiles
  FOR ALL USING (auth.uid() = id);

-- participants: any authenticated user can CRUD
CREATE POLICY "authenticated_participants" ON participants
  FOR ALL USING (auth.role() = 'authenticated');

-- matches: any authenticated user can read and update (result entry)
CREATE POLICY "authenticated_matches" ON matches
  FOR ALL USING (auth.role() = 'authenticated');

-- tips: any authenticated user can CRUD
CREATE POLICY "authenticated_tips" ON tips
  FOR ALL USING (auth.role() = 'authenticated');
