'use client'

import { useState } from 'react'
import { Match } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import MatchResultModal from '@/components/MatchResultModal'

interface Props {
  initialMatches: Match[]
}

export default function MatchList({ initialMatches }: Props) {
  const [matches, setMatches] = useState(initialMatches)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)

  function handleMatchUpdated(updated: Match) {
    setMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
  }

  const now = new Date()

  return (
    <>
      <div className="space-y-3">
        {matches.map((match) => {
          const isPast = new Date(match.match_date) < now
          const hasResult =
            match.home_goals_actual !== null && match.away_goals_actual !== null
          const needsResult = isPast && !hasResult

          return (
            <Card
              key={match.id}
              className={`border shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-150 ${
                needsResult ? 'border-amber-300' : 'border-zinc-200'
              }`}
              onClick={() => setSelectedMatch(match)}
            >
              <CardContent className="py-4 px-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-zinc-400">
                        Spiel {match.match_number}
                      </span>
                      <span className="text-xs text-zinc-300">·</span>
                      <span className="text-xs text-zinc-400">
                        {new Date(match.match_date).toLocaleDateString('de-AT', {
                          weekday: 'short',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </span>
                      {needsResult && (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                          ⚠ Kein Ergebnis
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {match.home_team}
                      <span className="font-normal text-zinc-400 mx-2">vs.</span>
                      {match.away_team}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    {hasResult ? (
                      <div className="text-xl font-bold text-zinc-900">
                        {match.home_goals_actual}:{match.away_goals_actual}
                      </div>
                    ) : (
                      <div className="text-sm text-zinc-400 font-medium">
                        {isPast ? '– : –' : 'Ausstehend'}
                      </div>
                    )}
                    <span className="text-xs text-blue-500">Bearbeiten →</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedMatch && (
        <MatchResultModal
          match={selectedMatch}
          open={!!selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onSaved={handleMatchUpdated}
        />
      )}
    </>
  )
}
