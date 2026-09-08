import type { WalkShareData } from '../../../types/walk'

interface Props {
  data: WalkShareData
  animationTriggered: boolean
  reducedMotion: boolean
}

function formatDistance(m: number): string {
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(2)}km`
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}시간 ${m}분`
  if (m > 0) return `${m}분 ${s}초`
  return `${s}초`
}

function formatPace(speedKmh: number): string {
  if (!speedKmh || speedKmh <= 0) return '—'
  const totalSeconds = Math.round(3600 / speedKmh)
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}'${secs.toString().padStart(2, '0')}"/km`
}

function formatArea(m2: number): string {
  return `${Math.round(m2).toLocaleString()} m²`
}

const STAT_DELAYS = ['2.3s', '2.45s', '2.6s', '2.75s', '2.9s']

function statStyle(
  index: number,
  animationTriggered: boolean,
  reducedMotion: boolean,
): React.CSSProperties {
  if (!animationTriggered) return { opacity: 0 }
  if (reducedMotion) return { opacity: 1 }
  return { animation: `fade-up 0.5s ease-out ${STAT_DELAYS[index]} both` }
}

export default function WalkShareStats({ data, animationTriggered, reducedMotion }: Props) {
  const stats = [
    { label: '거리', value: formatDistance(data.distanceMeters) },
    { label: '시간', value: formatDuration(data.durationSeconds) },
    { label: '페이스', value: formatPace(data.averageSpeedKmh) },
    {
      label: '점유 영토',
      value: data.territory ? formatArea(data.territory.areaSquareMeters) : '0 m²',
    },
    {
      label: '칼로리',
      value: data.caloriesKcal == null ? '—' : `${data.caloriesKcal.toFixed(1)} kcal`,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
      {stats.map((stat, i) => (
        <div key={stat.label} style={statStyle(i, animationTriggered, reducedMotion)}>
          <p className="text-f12 font-medium">{stat.label}</p>
          <p className="text-f18 font-light tabular-nums">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
