import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [participantsRes, matchesRes, tipsRes] = await Promise.all([
    supabase.from('participants').select('*').order('name'),
    supabase.from('matches').select('*').order('match_number'),
    supabase.from('tips').select('*'),
  ])

  if (participantsRes.error || matchesRes.error || tipsRes.error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }

  const backup = {
    exported_at: new Date().toISOString(),
    participants: participantsRes.data,
    matches: matchesRes.data,
    tips: tipsRes.data,
  }

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="tippspiel-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  })
}
