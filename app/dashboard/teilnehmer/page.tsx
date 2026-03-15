import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ParticipantSearch from '@/components/ParticipantSearch'
import AutoRefresh from '@/components/AutoRefresh'

export default async function TeilnehmerPage() {
  const supabase = await createClient()

  const { data: participants } = await supabase
    .from('participants')
    .select('*')
    .order('ticket_number')

  return (
    <div className="space-y-6">
      <AutoRefresh />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Teilnehmer</h1>
          <p className="text-zinc-500 mt-1">{participants?.length ?? 0} eingetragen</p>
        </div>
        <Link href="/dashboard/teilnehmer/neu">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
            + Neuer Teilnehmer
          </Button>
        </Link>
      </div>

      <Card className="border border-zinc-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-zinc-900">Alle Teilnehmer</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ParticipantSearch participants={participants ?? []} />
        </CardContent>
      </Card>
    </div>
  )
}
