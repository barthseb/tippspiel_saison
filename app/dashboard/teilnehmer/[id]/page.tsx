import { createClient } from '@/lib/supabase/server'
import ParticipantForm from '@/components/ParticipantForm'
import { notFound } from 'next/navigation'
import { TipEntry } from '@/components/TipGrid'
import DeleteParticipantButton from '@/components/DeleteParticipantButton'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditTeilnehmerPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: participant }, { data: matches }, { data: tips }] = await Promise.all([
    supabase.from('participants').select('*').eq('id', id).single(),
    supabase.from('matches').select('*').order('match_number'),
    supabase.from('tips').select('*').eq('participant_id', id),
  ])

  if (!participant) notFound()

  const initialTips: TipEntry[] = (matches ?? []).map((m) => {
    const existing = tips?.find((t) => t.match_id === m.id)
    return {
      matchId: m.id,
      homeGoalsTip: existing ? String(existing.home_goals_tip) : '',
      awayGoalsTip: existing ? String(existing.away_goals_tip) : '',
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{participant.name}</h1>
          <p className="text-zinc-500 mt-1">Losnummer #{participant.ticket_number}</p>
        </div>
        <DeleteParticipantButton id={id} name={participant.name} />
      </div>
      <ParticipantForm
        matches={matches ?? []}
        participant={participant}
        initialTips={initialTips}
      />
    </div>
  )
}
