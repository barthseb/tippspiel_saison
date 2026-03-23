'use client'

import { Match } from '@/lib/types'
import { calculatePoints } from '@/lib/scoring'
import ScoreInput from '@/components/ScoreInput'
import { Badge } from '@/components/ui/badge'

export interface TipEntry {
  matchId: string
  homeGoalsTip: string
  awayGoalsTip: string
}

interface TipGridProps {
  matches: Match[]
  tips: TipEntry[]
  onChange: (matchId: string, field: 'home' | 'away', value: string) => void
  disabled?: boolean
}

function PointsBadge({ points }: { points: number }) {
  if (points === 3) {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs font-semibold">
        3 Pkt
      </Badge>
    )
  }
  if (points === 1) {
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs font-semibold">
        1 Pkt
      </Badge>
    )
  }
  return (
    <Badge className="bg-red-100 text-red-700 border-red-200 text-xs font-semibold">
      0 Pkt
    </Badge>
  )
}

export default function TipGrid({ matches, tips, onChange, disabled = false }: TipGridProps) {
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[auto_1fr_auto_auto] gap-x-3 px-2 pb-1 text-xs font-medium text-zinc-400 uppercase tracking-wide">
        <span>#</span>
        <span>Spiel</span>
        <span>Tipp</span>
        <span>Pkt</span>
      </div>
      {matches.map((match) => {
        const tip = tips.find((t) => t.matchId === match.id)
        const homeVal = tip?.homeGoalsTip ?? ''
        const awayVal = tip?.awayGoalsTip ?? ''

        const hasResult =
          match.home_goals_actual !== null && match.away_goals_actual !== null
        const hasTip = homeVal !== '' && awayVal !== ''

        let livePoints: number | null = null
        if (hasResult && hasTip) {
          livePoints = calculatePoints(
            Number(homeVal),
            Number(awayVal),
            match.home_goals_actual!,
            match.away_goals_actual!
          )
        }

        return (
          <div
            key={match.id}
            className="grid grid-cols-[auto_1fr_auto_auto] gap-x-3 items-center px-2 py-2 rounded-lg hover:bg-zinc-50 transition-colors duration-150"
          >
            <span className="text-xs font-medium text-zinc-400 w-5 text-right">{match.match_number}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-800 truncate">
                {match.home_team} – {match.away_team}
              </p>
              <p className="text-xs text-zinc-400">
                {new Date(match.match_date).toLocaleDateString('de-AT', {
                  day: '2-digit',
                  month: '2-digit',
                })}
                {hasResult && (
                  <span className="ml-1.5 text-zinc-500 font-medium">
                    ({match.home_goals_actual}:{match.away_goals_actual})
                  </span>
                )}
              </p>
            </div>
            <ScoreInput
              homeValue={homeVal}
              awayValue={awayVal}
              onHomeChange={(v) => onChange(match.id, 'home', v)}
              onAwayChange={(v) => onChange(match.id, 'away', v)}
              disabled={disabled}
            />
            <div className="w-14 flex justify-end">
              {livePoints !== null && <PointsBadge points={livePoints} />}
            </div>
          </div>
        )
      })}
    </div>
  )
}
