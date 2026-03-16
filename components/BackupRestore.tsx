'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function BackupRestore() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [importData, setImportData] = useState<{
    participants: number
    tips: number
  } | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)

  function handleExport() {
    // Trigger download via the API route
    window.location.href = '/api/export'
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (!Array.isArray(data.participants) || !Array.isArray(data.tips)) {
          toast.error('Ungültige Backup-Datei')
          return
        }
        setFile(f)
        setImportData({
          participants: data.participants.length,
          tips: data.tips.length,
        })
      } catch {
        toast.error('Ungültige JSON-Datei')
      }
    }
    reader.readAsText(f)
    // Reset input so the same file can be selected again
    e.target.value = ''
  }

  async function handleImport() {
    if (!file) return
    setImporting(true)

    try {
      const text = await file.text()
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: text,
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? 'Import fehlgeschlagen')
        return
      }

      const result = await res.json()
      toast.success(
        `Import erfolgreich: ${result.imported.participants} Teilnehmer, ${result.imported.tips} Tipps`
      )
      setImportData(null)
      setFile(null)
      // Reload to show imported data
      window.location.reload()
    } catch {
      toast.error('Import fehlgeschlagen')
    } finally {
      setImporting(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="text-zinc-600"
        >
          Backup exportieren
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          className="text-zinc-600"
        >
          Backup importieren
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      <Dialog open={!!importData} onOpenChange={() => { setImportData(null); setFile(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Backup importieren?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-600">
            Die Datei enthält <strong>{importData?.participants}</strong> Teilnehmer
            und <strong>{importData?.tips}</strong> Tipps. Bestehende Einträge mit
            gleicher ID werden überschrieben.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => { setImportData(null); setFile(null) }}
              disabled={importing}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {importing ? 'Importieren…' : 'Importieren'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
