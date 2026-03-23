'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Match, Participant } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import TipGrid, { TipEntry } from '@/components/TipGrid'
import { toast } from 'sonner'

interface Props {
  matches: Match[]
  participant?: Participant
  initialTips?: TipEntry[]
}

export default function ParticipantForm({ matches, participant, initialTips }: Props) {
  const router = useRouter()
  const isEditing = !!participant

  const [ticketNumber, setTicketNumber] = useState(participant?.ticket_number ?? '')
  const [name, setName] = useState(participant?.name ?? '')
  const [phone, setPhone] = useState(participant?.phone ?? '')
  const [notes, setNotes] = useState(participant?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [conflictError, setConflictError] = useState(false)

  const [tips, setTips] = useState<TipEntry[]>(
    initialTips ??
      matches.map((m) => ({ matchId: m.id, homeGoalsTip: '', awayGoalsTip: '' }))
  )

  function handleTipChange(matchId: string, field: 'home' | 'away', value: string) {
    setTips((prev) =>
      prev.map((t) =>
        t.matchId === matchId
          ? { ...t, [field === 'home' ? 'homeGoalsTip' : 'awayGoalsTip']: value }
          : t
      )
    )
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setConflictError(false)

    const supabase = createClient()

    try {
      let participantId: string

      if (isEditing) {
        // Optimistic lock: only update if updated_at hasn't changed
        const { data, error } = await supabase
          .from('participants')
          .update({
            ticket_number: ticketNumber,
            name,
            phone: phone || null,
            notes: notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', participant.id)
          .eq('updated_at', participant.updated_at)
          .select()

        if (error) throw error
        if (!data || data.length === 0) {
          setConflictError(true)
          setSaving(false)
          return
        }
        participantId = participant.id
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        const { data, error } = await supabase
          .from('participants')
          .insert({
            ticket_number: ticketNumber,
            name,
            phone: phone || null,
            notes: notes || null,
            created_by: user?.id,
            created_by_email: user?.email ?? null,
          })
          .select()
          .single()

        if (error) {
          if (error.code === '23505') {
            toast.error(`Losnummer "${ticketNumber}" ist bereits vergeben.`)
            setSaving(false)
            return
          }
          throw error
        }
        participantId = data.id
      }

      // Upsert tips
      const tipsToSave = tips
        .filter((t) => t.homeGoalsTip !== '' && t.awayGoalsTip !== '')
        .map((t) => ({
          participant_id: participantId,
          match_id: t.matchId,
          home_goals_tip: Number(t.homeGoalsTip),
          away_goals_tip: Number(t.awayGoalsTip),
        }))

      if (tipsToSave.length > 0) {
        const { error: tipsError } = await supabase
          .from('tips')
          .upsert(tipsToSave, { onConflict: 'participant_id,match_id' })

        if (tipsError) throw tipsError
      }

      // Delete tips that were cleared
      const clearedMatchIds = tips
        .filter((t) => t.homeGoalsTip === '' || t.awayGoalsTip === '')
        .map((t) => t.matchId)

      if (clearedMatchIds.length > 0 && isEditing) {
        await supabase
          .from('tips')
          .delete()
          .eq('participant_id', participantId)
          .in('match_id', clearedMatchIds)
      }

      toast.success(isEditing ? 'Gespeichert' : 'Teilnehmer angelegt')
      router.push('/dashboard/teilnehmer')
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error('Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card className="border border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-zinc-900">Stammdaten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ticket" className="text-sm font-medium text-zinc-700">
                Losnummer
              </Label>
              <Input
                id="ticket"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                placeholder="042"
                required
                className="rounded-lg border-zinc-200 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-zinc-700">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Max Mustermann"
                required
                className="rounded-lg border-zinc-200"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium text-zinc-700">
              Telefon <span className="text-zinc-400 font-normal">(optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+43 664 123 456"
              className="rounded-lg border-zinc-200"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-sm font-medium text-zinc-700">
              Notizen <span className="text-zinc-400 font-normal">(optional)</span>
            </Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="z. B. Kopie /2"
              className="rounded-lg border-zinc-200"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-zinc-900">Tipps</CardTitle>
        </CardHeader>
        <CardContent className="px-2">
          <TipGrid
            matches={matches}
            tips={tips}
            onChange={handleTipChange}
          />
        </CardContent>
      </Card>

      {conflictError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          Eintrag wurde geändert — bitte neu laden.
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={saving}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
        >
          {saving ? 'Speichern…' : isEditing ? 'Änderungen speichern' : 'Teilnehmer anlegen'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/dashboard/teilnehmer')}
          className="text-zinc-500"
        >
          Abbrechen
        </Button>
      </div>
    </form>
  )
}
