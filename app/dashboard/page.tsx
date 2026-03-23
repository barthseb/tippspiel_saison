import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ count: participantCount }, { data: matches }, { data: leaderboard }] = await Promise.all([
    supabase.from('participants').select('*', { count: 'exact', head: true }),
    supabase.from('matches').select('*').order('match_number'),
    supabase.from('leaderboard').select('*').limit(1),
  ])

  const now = new Date()
  const scoredMatches = matches?.filter(
    (m) => m.home_goals_actual !== null && m.away_goals_actual !== null
  ) ?? []
  const missedMatches = matches?.filter((m) => {
    const matchDate = new Date(m.match_date)
    return matchDate < now && m.home_goals_actual === null
  }) ?? []

  const topPlayer = leaderboard?.[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-zinc-500 mt-1">Frühjahrssaison 2026 · Bezirksliga Nord</p>
      </div>

      {missedMatches.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-amber-500 text-lg">⚠️</span>
          <div>
            <p className="font-medium text-amber-900 text-sm">Fehlende Ergebnisse</p>
            <p className="text-amber-700 text-sm mt-0.5">
              {missedMatches.length} vergangene Spiel{missedMatches.length > 1 ? 'e haben' : ' hat'} noch kein eingetragenes Ergebnis.
            </p>
            <Link href="/dashboard/spiele" className="text-amber-600 text-sm font-medium underline mt-1 block">
              Zur Spielverwaltung →
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-zinc-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Teilnehmer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-zinc-900">{participantCount ?? 0}</p>
            <Link href="/dashboard/teilnehmer" className="text-xs text-blue-500 mt-1 block">
              Alle anzeigen →
            </Link>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Spiele bewertet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-zinc-900">
              {scoredMatches.length} <span className="text-lg text-zinc-400">/ 13</span>
            </p>
            <Link href="/dashboard/spiele" className="text-xs text-blue-500 mt-1 block">
              Ergebnisse eingeben →
            </Link>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Spitzenreiter</CardTitle>
          </CardHeader>
          <CardContent>
            {topPlayer ? (
              <>
                <p className="text-xl font-bold text-zinc-900 truncate">{topPlayer.name}</p>
                <p className="text-sm text-zinc-500 mt-0.5">
                  {topPlayer.total_points} Punkte{topPlayer.ticket_number ? ` · Nr. ${topPlayer.ticket_number}` : ''}
                </p>
                <Link href="/dashboard/rangliste" className="text-xs text-blue-500 mt-1 block">
                  Rangliste anzeigen →
                </Link>
              </>
            ) : (
              <p className="text-zinc-400 text-sm">Noch keine Daten</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-zinc-900">Nächste Spiele</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {matches
              ?.filter((m) => new Date(m.match_date) >= now)
              .slice(0, 3)
              .map((m) => (
                <div key={m.id} className="flex items-center justify-between py-1.5 border-b border-zinc-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-zinc-800">
                      {m.home_team} – {m.away_team}
                    </p>
                    <p className="text-xs text-zinc-400">
                      Spiel {m.match_number} · {new Date(m.match_date).toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            {!matches?.filter((m) => new Date(m.match_date) >= now).length && (
              <p className="text-sm text-zinc-400">Saison beendet</p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-zinc-900">Letzte Ergebnisse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {scoredMatches.slice(-3).reverse().map((m) => (
              <div key={m.id} className="flex items-center justify-between py-1.5 border-b border-zinc-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-zinc-800">
                    {m.home_team} – {m.away_team}
                  </p>
                  <p className="text-xs text-zinc-400">Spiel {m.match_number}</p>
                </div>
                <span className="text-sm font-bold text-zinc-900">
                  {m.home_goals_actual}:{m.away_goals_actual}
                </span>
              </div>
            ))}
            {!scoredMatches.length && (
              <p className="text-sm text-zinc-400">Noch keine Ergebnisse</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
