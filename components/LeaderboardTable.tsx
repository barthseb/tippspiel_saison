'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LeaderboardEntry, Match, Tip } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Props {
  leaderboard: LeaderboardEntry[]
  matches: Match[]
}

function PointsBadge({ points }: { points: number | null }) {
  if (points === null) return <span className="text-zinc-300">–</span>
  if (points === 3) return <Badge className="bg-green-100 text-green-700 border-green-200">3</Badge>
  if (points === 1) return <Badge className="bg-amber-100 text-amber-700 border-amber-200">1</Badge>
  return <Badge className="bg-red-100 text-red-700 border-red-200">0</Badge>
}

export default function LeaderboardTable({ leaderboard, matches }: Props) {
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null)
  const [participantTips, setParticipantTips] = useState<Tip[]>([])
  const [loadingTips, setLoadingTips] = useState(false)

  async function handleRowClick(entry: LeaderboardEntry) {
    setSelectedEntry(entry)
    setLoadingTips(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('tips')
      .select('*')
      .eq('participant_id', entry.id)
    setParticipantTips(data ?? [])
    setLoadingTips(false)
  }

  function exportCSV() {
    const headers = [
      'Rang',
      'Losnummer',
      'Name',
      'Punkte',
      'Exakt',
      'Tendenz',
      'Falsch',
      ...matches.map((m) => `Spiel ${m.match_number}`),
    ]

    // We need tips for export — we'll export what we have from leaderboard
    const rows = leaderboard.map((entry, idx) => [
      idx + 1,
      entry.ticket_number,
      entry.name,
      entry.total_points,
      entry.exact_scores,
      entry.correct_outcomes,
      entry.wrong_tips,
      ...matches.map(() => ''), // tips not loaded in this context
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rangliste_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Card className="border border-zinc-200 shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
            <span className="text-sm font-semibold text-zinc-700">Gesamtranking</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={exportCSV}
              className="text-zinc-500 hover:text-zinc-900 text-sm"
            >
              CSV exportieren
            </Button>
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide w-12">Rang</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide">Losnr.</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide">Name</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-zinc-400 uppercase tracking-wide">Punkte</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-zinc-400 uppercase tracking-wide">Exakt</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-zinc-400 uppercase tracking-wide">Tendenz</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-zinc-400 uppercase tracking-wide">Falsch</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, idx) => (
                  <tr
                    key={entry.id}
                    onClick={() => handleRowClick(entry)}
                    className="border-b border-zinc-50 hover:bg-zinc-50 cursor-pointer transition-colors duration-150"
                  >
                    <td className="px-4 py-3">
                      <span className={`font-bold ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-zinc-400' : idx === 2 ? 'text-amber-700' : 'text-zinc-500'}`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-500">#{entry.ticket_number}</td>
                    <td className="px-4 py-3 font-medium text-zinc-900">{entry.name}</td>
                    <td className="px-4 py-3 text-right font-bold text-zinc-900">{entry.total_points}</td>
                    <td className="px-4 py-3 text-right text-green-600">{entry.exact_scores}</td>
                    <td className="px-4 py-3 text-right text-amber-600">{entry.correct_outcomes}</td>
                    <td className="px-4 py-3 text-right text-red-500">{entry.wrong_tips}</td>
                  </tr>
                ))}
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-zinc-400 text-sm">
                      Noch keine Teilnehmer
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="sm:hidden divide-y divide-zinc-100">
            {leaderboard.map((entry, idx) => (
              <div
                key={entry.id}
                onClick={() => handleRowClick(entry)}
                className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold w-6 text-center ${idx === 0 ? 'text-yellow-500' : 'text-zinc-400'}`}>
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-medium text-zinc-900 text-sm">{entry.name}</p>
                    <p className="text-xs text-zinc-400">
                      #{entry.ticket_number} · {entry.exact_scores}× exakt · {entry.correct_outcomes}× Tendenz
                    </p>
                  </div>
                </div>
                <span className="font-bold text-zinc-900">{entry.total_points} Pkt</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Participant detail slide-over */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEntry?.name}
              <span className="text-zinc-400 font-normal text-sm ml-2">
                #{selectedEntry?.ticket_number}
              </span>
            </DialogTitle>
          </DialogHeader>

          {loadingTips ? (
            <p className="text-sm text-zinc-400 py-4">Lade Tipps…</p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-4 py-2 border-b border-zinc-100">
                <span className="text-2xl font-bold text-zinc-900">
                  {selectedEntry?.total_points} Pkt
                </span>
                <span className="text-sm text-zinc-500">
                  {selectedEntry?.exact_scores}× Exakt · {selectedEntry?.correct_outcomes}× Tendenz · {selectedEntry?.wrong_tips}× Falsch
                </span>
              </div>

              <div className="space-y-1">
                {matches.map((match) => {
                  const tip = participantTips.find((t) => t.match_id === match.id)
                  return (
                    <div
                      key={match.id}
                      className="grid grid-cols-[auto_1fr_auto_auto] gap-x-3 items-center py-1.5 border-b border-zinc-50"
                    >
                      <span className="text-xs text-zinc-400 w-4 text-right">{match.match_number}</span>
                      <p className="text-xs text-zinc-700 truncate">
                        {match.home_team} – {match.away_team}
                      </p>
                      <span className="text-xs text-zinc-500">
                        {tip ? `${tip.home_goals_tip}:${tip.away_goals_tip}` : '–'}
                      </span>
                      <PointsBadge points={tip?.points ?? null} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
