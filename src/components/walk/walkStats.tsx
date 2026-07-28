import type { WalkLiveStats } from '../../types/walk'

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(2)}km`
}

function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds || 0))
  const h = Math.floor(safe / 3600)
  const m = Math.floor((safe % 3600) / 60)
  const s = safe % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatSpeed(kmh: number | null | undefined): string {
  if (!kmh) return '—'
  return `${kmh.toFixed(1)}km/h`
}

function formatCalories(kcal: number): string {
  return `${kcal.toFixed(1)}kcal`
}

interface WalkStatsProps {
  stats: WalkLiveStats | null
  isPaused: boolean
}

export default function WalkStats({ stats, isPaused }: WalkStatsProps) {
  const labelClass = isPaused ? 'text-navy-15' : 'text-navy-40'
  const valueClass = isPaused ? 'text-navy-40' : 'text-navy'

  return (
    <div className="px-6 pt-5 pb-4">
      <div className="grid grid-cols-2">
        <StatCell
          label="거리"
          value={stats ? formatDistance(stats.distanceMeters) : '—'}
          labelClass={labelClass}
          valueClass={valueClass}
          borderRight
        />
        <StatCell
          label="시간"
          value={stats ? formatDuration(stats.durationSeconds) : '—'}
          labelClass={labelClass}
          valueClass={valueClass}
        />
        <div className="col-span-2 h-px bg-navy-8 my-1" />
        <StatCell
          label="평균 속도"
          value={stats ? formatSpeed(stats.averageSpeedKmh) : '—'}
          labelClass={labelClass}
          valueClass={valueClass}
          borderRight
        />
        <StatCell
          label="칼로리"
          value={stats ? formatCalories(stats.caloriesKcal) : '—'}
          labelClass={labelClass}
          valueClass={valueClass}
        />
      </div>
    </div>
  )
}

function StatCell({
  label,
  value,
  labelClass,
  valueClass,
  borderRight,
}: {
  label: string
  value: string
  labelClass: string
  valueClass: string
  borderRight?: boolean
}) {
  return (
    <div
      className={[
        'flex flex-col items-center gap-1 py-2',
        borderRight ? 'border-r border-navy-8' : '',
      ].join(' ')}
    >
      <span className={`text-f12 ${labelClass}`}>{label}</span>
      <span className={`text-f20 font-light ${valueClass} tabular-nums`}>{value}</span>
    </div>
  )
}
