'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Participant } from '@/lib/types'

interface Props {
  participants: Participant[]
}

export default function ParticipantSearch({ participants }: Props) {
  const [search, setSearch] = useState('')

  const filtered = participants.filter((p) => {
    const q = search.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      (p.ticket_number ?? '').toLowerCase().includes(q) ||
      (p.phone ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="px-4 pb-3">
        <Input
          placeholder="Nach Name oder Losnummer suchen…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border-zinc-200"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-zinc-400">
          Keine Teilnehmer gefunden
        </div>
      ) : (
        <div className="divide-y divide-zinc-100">
          {filtered.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/teilnehmer/${p.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition-colors duration-150 group"
            >
              <div className="flex items-center gap-3">
                {p.ticket_number && <span className="text-sm font-mono text-zinc-400 w-10">#{p.ticket_number}</span>}
                <div>
                  <p className="text-sm font-medium text-zinc-900">{p.name}</p>
                  {p.phone && <p className="text-xs text-zinc-400">{p.phone}</p>}
                </div>
              </div>
              <span className="text-zinc-300 group-hover:text-zinc-400 transition-colors">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
