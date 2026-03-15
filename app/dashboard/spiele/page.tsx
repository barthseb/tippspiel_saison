import { createClient } from '@/lib/supabase/server'
import MatchList from '@/components/MatchList'

export default async function SpielePage() {
  const supabase = await createClient()
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('match_number')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Spielverwaltung</h1>
        <p className="text-zinc-500 mt-1">Ergebnisse eintragen und bearbeiten</p>
      </div>
      <MatchList initialMatches={matches ?? []} />
    </div>
  )
}
