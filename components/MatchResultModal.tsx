'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Match } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import ScoreInput from '@/components/ScoreInput'
import { toast } from 'sonner'

interface Props {
  match: Match
  open: boolean
  onClose: () => void
  onSaved: (updated: Match) => void
}

export default function MatchResultModal({ match, open, onClose, onSaved }: Props) {
  const [homeGoals, setHomeGoals] = useState(
    match.home_goals_actual !== null ? String(match.home_goals_actual) : ''
  )
  const [awayGoals, setAwayGoals] = useState(
    match.away_goals_actual !== null ? String(match.away_goals_actual) : ''
  )
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()

    const homeVal = homeGoals === '' ? null : Number(homeGoals)
    const awayVal = awayGoals === '' ? null : Number(awayGoals)

    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('matches')
      .update({
        home_goals_actual: homeVal,
        away_goals_actual: awayVal,
        result_entered_by: user?.id,
        result_entered_at: new Date().toISOString(),
      })
      .eq('id', match.id)
      .select()
      .single()

    if (error) {
      toast.error('Fehler beim Speichern')
      setSaving(false)
      return
    }

    // Trigger points recalculation via RPC
    await supabase.rpc('calculate_points', { p_match_id: match.id })

    toast.success('Ergebnis gespeichert')
    onSaved(data)
    onClose()
    setSaving(false)
  }

  async function handleClear() {
    setSaving(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('matches')
      .update({
        home_goals_actual: null,
        away_goals_actual: null,
        result_entered_by: null,
        result_entered_at: null,
      })
      .eq('id', match.id)
      .select()
      .single()

    if (error) {
      toast.error('Fehler beim Zurücksetzen')
      setSaving(false)
      return
    }

    // Trigger recalc to clear points
    await supabase.rpc('calculate_points', { p_match_id: match.id })

    toast.success('Ergebnis zurückgesetzt')
    onSaved(data)
    onClose()
    setSaving(false)
  }

  const canSave = homeGoals !== '' && awayGoals !== ''

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-zinc-900">Ergebnis eintragen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="text-center">
            <p className="text-sm font-semibold text-zinc-700">{match.home_team}</p>
            <p className="text-xs text-zinc-400">vs.</p>
            <p className="text-sm font-semibold text-zinc-700">{match.away_team}</p>
            <p className="text-xs text-zinc-400 mt-1">
              {new Date(match.match_date).toLocaleDateString('de-AT', {
                weekday: 'long',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Label className="text-sm font-medium text-zinc-700">Ergebnis (Heim : Gast)</Label>
            <ScoreInput
              homeValue={homeGoals}
              awayValue={awayGoals}
              onHomeChange={setHomeGoals}
              onAwayChange={setAwayGoals}
              homeTabIndex={1}
              awayTabIndex={2}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {match.home_goals_actual !== null && (
            <Button
              variant="ghost"
              onClick={handleClear}
              disabled={saving}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 sm:mr-auto"
            >
              Zurücksetzen
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Abbrechen
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !canSave}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {saving ? 'Speichern…' : 'Speichern'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
