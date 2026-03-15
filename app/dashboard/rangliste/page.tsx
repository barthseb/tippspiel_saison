import { createClient } from '@/lib/supabase/server'
import LeaderboardTable from '@/components/LeaderboardTable'

export default async function RanglistePage() {
  const supabase = await createClient()

  const [{ data: leaderboard }, { data: matches }] = await Promise.all([
    supabase.from('leaderboard').select('*'),
    supabase.from('matches').select('*').order('match_number'),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Rangliste</h1>
          <p className="text-zinc-500 mt-1">{leaderboard?.length ?? 0} Teilnehmer</p>
        </div>
      </div>
      <LeaderboardTable leaderboard={leaderboard ?? []} matches={matches ?? []} />
    </div>
  )
}
