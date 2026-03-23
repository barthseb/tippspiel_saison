import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { participants?: unknown[]; tips?: unknown[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!Array.isArray(body.participants) || !Array.isArray(body.tips)) {
    return NextResponse.json(
      { error: 'JSON must contain "participants" and "tips" arrays' },
      { status: 400 }
    )
  }

  // Insert participants (skip duplicates by id)
  const { error: partError } = await supabase
    .from('participants')
    .upsert(body.participants as Record<string, unknown>[], { onConflict: 'id' })

  if (partError) {
    return NextResponse.json(
      { error: `Participants import failed: ${partError.message}` },
      { status: 500 }
    )
  }

  // Insert tips (skip duplicates by id)
  const { error: tipsError } = await supabase
    .from('tips')
    .upsert(body.tips as Record<string, unknown>[], { onConflict: 'id' })

  if (tipsError) {
    return NextResponse.json(
      { error: `Tips import failed: ${tipsError.message}` },
      { status: 500 }
    )
  }

  // Recalculate points for matches that already have results
  const { data: matchesWithResults } = await supabase
    .from('matches')
    .select('id')
    .not('home_goals_actual', 'is', null)
    .not('away_goals_actual', 'is', null)

  if (matchesWithResults) {
    for (const m of matchesWithResults) {
      await supabase.rpc('calculate_points', { p_match_id: m.id })
    }
  }

  return NextResponse.json({
    success: true,
    imported: {
      participants: body.participants.length,
      tips: body.tips.length,
    },
  })
}
