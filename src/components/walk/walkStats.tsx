import type { WalkLiveStats } from '../../types/walk'

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(2)}km`
}

function formatArea(m2: number): string {
  return `${Math.round(m2).toLocaleString()}m²`
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
    <div className="flex px-6 pt-5 pb-4">
      <div className="flex-1 flex flex-col items-center gap-1">
        <span className={`text-f12 ${labelClass}`}>거리</span>
        <span className={`text-f20 font-light ${valueClass} tabular-nums`}>
          {stats ? formatDistance(stats.distanceMeters) : '—'}
        </span>
      </div>
      <div className="w-px bg-navy-8 self-stretch" />
      <div className="flex-1 flex flex-col items-center gap-1">
        <span className={`text-f12 ${labelClass}`}>획득 영토</span>
        <span className={`text-f20 font-light ${valueClass} tabular-nums`}>
          {stats ? formatArea(stats.estimatedTerritoryM2) : '—'}
        </span>
      </div>
      <div className="w-px bg-navy-8 self-stretch" />
      <div className="flex-1 flex flex-col items-center gap-1">
        <span className={`text-f12 ${labelClass}`}>칼로리</span>
        <span className={`text-f20 font-light ${valueClass} tabular-nums`}>
          {stats ? formatCalories(stats.caloriesKcal) : '—'}
        </span>
      </div>
    </div>
  )
}
