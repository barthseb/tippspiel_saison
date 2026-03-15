import { NextResponse } from 'next/server'

// Weekly ping to keep Supabase free-tier project active
export async function GET() {
  return NextResponse.json({ ok: true, ts: new Date().toISOString() })
}
