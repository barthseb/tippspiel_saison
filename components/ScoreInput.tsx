'use client'

interface ScoreInputProps {
  homeValue: string
  awayValue: string
  onHomeChange: (val: string) => void
  onAwayChange: (val: string) => void
  homeTabIndex?: number
  awayTabIndex?: number
  disabled?: boolean
}

export default function ScoreInput({
  homeValue,
  awayValue,
  onHomeChange,
  onAwayChange,
  homeTabIndex,
  awayTabIndex,
  disabled = false,
}: ScoreInputProps) {
  function handleInput(
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (val: string) => void
  ) {
    const raw = e.target.value.replace(/\D/g, '')
    if (raw === '' || (Number(raw) >= 0 && Number(raw) <= 99)) {
      onChange(raw)
    }
  }

  const inputClass =
    'w-9 h-9 text-center text-sm font-semibold rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-zinc-100 disabled:text-zinc-400 transition-colors duration-150'

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={homeValue}
        onChange={(e) => handleInput(e, onHomeChange)}
        tabIndex={homeTabIndex}
        disabled={disabled}
        maxLength={2}
        className={inputClass}
        placeholder="_"
      />
      <span className="text-zinc-400 font-medium text-sm">:</span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={awayValue}
        onChange={(e) => handleInput(e, onAwayChange)}
        tabIndex={awayTabIndex}
        disabled={disabled}
        maxLength={2}
        className={inputClass}
        placeholder="_"
      />
    </div>
  )
}
