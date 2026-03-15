import { createClient } from '@/lib/supabase/server'
import ParticipantForm from '@/components/ParticipantForm'

export default async function NeuTeilnehmerPage() {
  const supabase = await createClient()
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('match_number')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Neuer Teilnehmer</h1>
        <p className="text-zinc-500 mt-1">Tippschein erfassen</p>
      </div>
      <ParticipantForm matches={matches ?? []} />
    </div>
  )
}
