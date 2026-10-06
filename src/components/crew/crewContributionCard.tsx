import { useEffect, useState } from 'react'
import { getCrewStats } from '../../api/crewTerritory'
import type { CrewMember } from '../../types/crew'
import type { CrewStats } from '../../types/crewTerritory'
import {
  clampContributionPercent,
  formatContributionArea,
  formatContributionPercent,
} from '../../utils/crewContribution'

interface Props {
  crewId: number
  member: CrewMember | undefined
}

export default function CrewContributionCard({ crewId, member }: Props) {
  const [stats, setStats] = useState<CrewStats | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStats(null)
    setState('loading')
    getCrewStats(crewId)
      .then((data) => {
        if (cancelled) return
        setStats(data)
        setState('ready')
      })
      .catch(() => {
        if (!cancelled) setState('error')
      })
    return () => {
      cancelled = true
    }
  }, [crewId, retry])

  const percent = clampContributionPercent(member?.contributionPercent)

  return (
    <section
      aria-label="내 기여도"
      className="bg-navy-5 border border-navy-8 rounded-xl px-5 py-5 shadow-sm space-y-3"
    >
      <h2 className="text-f16 font-semibold text-navy">내 기여도</h2>
      <div className="space-y-1 min-w-0">
        <p className="text-f32 font-semibold text-navy tabular-nums break-all">
          {formatContributionPercent(member?.contributionPercent)}
        </p>
        <p className="text-f12 text-navy-70 break-words">
          활성 영토 면적 {formatContributionArea(member?.activeAreaSquareMeters)} 기여
        </p>
      </div>
      <div
        role="progressbar"
        aria-label="크루 전체 영토 기준 내 기여도"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent ?? undefined}
        aria-valuetext={percent === null ? '기여도 정보 없음' : `${percent}%`}
        className="h-2 w-full overflow-hidden rounded-pill bg-navy-8"
      >
        <div className="h-full rounded-pill bg-navy" style={{ width: `${percent ?? 0}%` }} />
      </div>
      <p className="text-f12 text-navy-70">크루 전체 영토 기준</p>
      {!member && <p className="text-f12 text-navy-70">내 기여 정보를 확인할 수 없어요.</p>}
      {state === 'loading' && (
        <p role="status" className="text-f12 text-navy-70">
          크루 통계를 불러오는 중이에요.
        </p>
      )}
      {state === 'error' && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-f12 text-err">크루 통계를 불러오지 못했어요.</p>
          <button
            onClick={() => setRetry((value) => value + 1)}
            className="text-f12 text-navy underline"
          >
            다시 시도
          </button>
        </div>
      )}
      {state === 'ready' && stats?.crewId === crewId && (
        <p className="text-f12 text-navy-70">
          크루 전체 영토{' '}
          {Number.isSafeInteger(stats.territoryCount) && stats.territoryCount >= 0
            ? `${stats.territoryCount}개`
            : '—'}
          {' · '}
          {formatContributionArea(stats.areaSquareMeters)}
        </p>
      )}
    </section>
  )
}
