import dogCaloriesImg from '../../assets/dogCalories.png'
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
    <div className="flex px-4 pt-5 pb-4">
      <div className="flex-1 flex flex-col items-center gap-1">
        <span className={`text-f11 ${labelClass}`}>거리</span>
        <span className={`text-f18 font-light ${valueClass} tabular-nums`}>
          {stats ? formatDistance(stats.distanceMeters) : '—'}
        </span>
      </div>
      <div className="w-px bg-navy-8 self-stretch" />
      <div className="flex-1 flex flex-col items-center gap-1">
        <span className={`text-f11 ${labelClass}`}>시간</span>
        <span className={`text-f18 font-light ${valueClass} tabular-nums`}>
          {stats ? formatDuration(stats.durationSeconds) : '—'}
        </span>
      </div>
      <div className="w-px bg-navy-8 self-stretch" />
      <div className="flex-1 flex flex-col items-center gap-1">
        <span className={`text-f11 ${labelClass}`}>평균 속도</span>
        <span className={`text-f18 font-light ${valueClass} tabular-nums`}>
          {stats ? formatSpeed(stats.averageSpeedKmh) : '—'}
        </span>
      </div>
      <div className="w-px bg-navy-8 self-stretch" />
      <div className="flex-1 flex flex-col items-center gap-1">
        <span className={`flex items-center gap-0.5 text-f11 ${labelClass}`}>
          <img src={dogCaloriesImg} className="w-3.5 h-3.5" alt="" />
          칼로리
        </span>
        <span className={`text-f18 font-light ${valueClass} tabular-nums`}>
          {stats ? formatCalories(stats.caloriesKcal) : '—'}
        </span>
      </div>
    </div>
  )
}
