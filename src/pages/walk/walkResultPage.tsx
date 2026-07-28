import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import WalkMap from '../../components/walk/walkMap'
import { getWalkDetail } from '../../api/walks'
import { ROUTES } from '../../constants/routes'
import type { WalkFinishResponse, WalkDetailResponse, WalkStats } from '../../types/walk'

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

const XP_SOURCE_LABELS: Record<string, string> = {
  BASE_WALK: '산책 완료',
  WALK_COMPLETE: '산책 완료',
  WALK_COMPLETED: '산책 완료',
  DISTANCE: '거리 스페셜 리워드',
  DISTANCE_BONUS: '거리 스페셜 리워드',
  WALK_DISTANCE: '거리 스페셜 리워드',
  TERRITORY: '영토 획득',
  TERRITORY_CLAIM: '영토 획득',
  TERRITORY_BONUS: '영토 스페셜 리워드',
  LOOP: '순환 스페셜 리워드',
  LOOP_BONUS: '순환 스페셜 리워드',
  LEVEL_UP: '레벨업 스페셜 리워드',
  FIRST_WALK: '첫 산책',
  CONSECUTIVE: '연속 산책',
  STREAK: '연속 산책',
}

function formatXpSource(source: string): string {
  return XP_SOURCE_LABELS[source.toUpperCase()] ?? source.replace(/_/g, ' ')
}

function getHttpStatus(err: unknown): number | null {
  return (err as { response?: { status?: number } }).response?.status ?? null
}

interface LocationState {
  finishResult?: WalkFinishResponse
}

export default function WalkResultPage() {
  const { walkId } = useParams<{ walkId: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const state = location.state as LocationState | null
  const finishResult = state?.finishResult

  const [detail, setDetail] = useState<WalkDetailResponse | null>(null)
  const [isMapLoading, setIsMapLoading] = useState(!!walkId)
  const [fetchError, setFetchError] = useState<string | null>(null)

  function handleDetailError(err: unknown) {
    const status = getHttpStatus(err)
    if (status === 404) {
      setFetchError('존재하지 않는 산책 기록입니다.')
    } else if (status === 403) {
      setFetchError('접근 권한이 없습니다.')
    } else {
      setFetchError('산책 기록을 불러오지 못했습니다. 다시 시도해 주세요.')
    }
  }

  useEffect(() => {
    if (!walkId) return

    let cancelled = false
    setIsMapLoading(true)
    setFetchError(null)

    const fetchDetail = async () => {
      try {
        const data = await getWalkDetail(Number(walkId))
        if (!cancelled) setDetail(data)
      } catch (err) {
        if (cancelled) return
        if (finishResult && getHttpStatus(err) === 404) {
          await new Promise<void>((r) => setTimeout(r, 800))
          if (cancelled) return
          try {
            const data = await getWalkDetail(Number(walkId))
            if (!cancelled) setDetail(data)
          } catch (retryErr) {
            if (!cancelled) handleDetailError(retryErr)
          }
        } else {
          handleDetailError(err)
        }
      } finally {
        if (!cancelled) setIsMapLoading(false)
      }
    }

    fetchDetail()
    return () => {
      cancelled = true
    }
  }, [walkId])

  const stats: WalkStats | null = (() => {
    if (!detail?.stats && !finishResult?.stats) return null
    return Object.assign({}, detail?.stats, finishResult?.stats) as WalkStats
  })()

  const polylineCoords = detail?.polyline?.coordinates ?? null
  const territory = finishResult?.territory ?? null

  const isPageLoading = !finishResult && isMapLoading

  if (isPageLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-cream">
        <div className="w-10 h-10 rounded-full border-4 border-navy-15 border-t-navy animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-cream">
      <div className="flex items-center px-6 pt-14 pb-4">
        <h1 className="text-f20 font-semibold text-navy">산책 결과</h1>
      </div>

      {/* 완료 경로 표시 */}
      <div className="mx-4 h-52 rounded-xl overflow-hidden mb-4">
        {isMapLoading ? (
          <div className="h-full bg-navy-8 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-navy-15 border-t-navy animate-spin" />
          </div>
        ) : fetchError ? (
          <div className="h-full bg-navy-8 flex items-center justify-center px-4">
            <p className="text-f13 text-navy-40 text-center">{fetchError}</p>
          </div>
        ) : polylineCoords && polylineCoords.length > 0 ? (
          <WalkMap
            currentPosition={null}
            routeCoords={[]}
            isPaused={false}
            completedCoords={polylineCoords}
            territoryPolygon={territory?.polygon}
            territoryColor={undefined}
          />
        ) : (
          <div className="h-full bg-navy-8 flex items-center justify-center">
            <p className="text-f13 text-navy-40">경로 데이터가 없습니다.</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-12 space-y-4">
        {/* 통계 */}
        <div className="bg-navy-8 rounded-xl px-5 py-5 space-y-3">
          <p className="text-f12 font-medium text-navy-40">산책 통계</p>
          <div className="grid grid-cols-2 gap-3">
            <StatItem label="거리" value={stats ? formatDistance(stats.distanceMeters) : '—'} />
            <StatItem label="시간" value={stats ? formatDuration(stats.durationSeconds) : '—'} />
            <StatItem
              label="평균 속도"
              value={stats?.averageSpeedKmh ? `${stats.averageSpeedKmh.toFixed(1)}km/h` : '—'}
            />
            <StatItem
              label="칼로리"
              value={stats?.caloriesKcal ? `${stats.caloriesKcal.toFixed(1)}kcal` : '—'}
            />
          </div>
        </div>

        {/* XP 및 랭크 */}
        {finishResult && (
          <div className="bg-navy-8 rounded-xl px-5 py-5 space-y-2">
            <p className="text-f12 font-medium text-navy-40">획득 보상</p>
            {finishResult.xpGained.map((xp, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-f14 text-navy-40">{formatXpSource(xp.source)}</span>
                <span className="text-f14 text-navy font-medium">+{xp.amount} XP</span>
              </div>
            ))}
            <div className="flex justify-between pt-1 border-t border-navy-15">
              <span className="text-f14 text-navy-40">총 XP</span>
              <span className="text-f14 text-navy font-semibold">
                {finishResult.totalXpAfter.toLocaleString()} XP
              </span>
            </div>
            {finishResult.rankUp && (
              <p className="text-f13 text-ok font-medium">
                🎉 랭크가 올랐습니다! → {finishResult.rankAfter}
              </p>
            )}
          </div>
        )}

        {/* 영토 획득 결과 */}
        {finishResult?.walkType === 'TERRITORY' && finishResult.territory && (
          <div className="bg-navy-8 rounded-xl px-5 py-5 space-y-1">
            <p className="text-f12 font-medium text-navy-40">영토 획득</p>
            <p className="text-f16 text-navy font-semibold">
              {Math.round(finishResult.territory.areaSquareMeters).toLocaleString()} m²
            </p>
            {finishResult.intrusions.length > 0 && (
              <p className="text-f13 text-navy-40">{finishResult.intrusions.length}개 영토 침입</p>
            )}
          </div>
        )}

        {/* 영토 인정 실패 사유 */}
        {finishResult?.ineligibleMessage && (
          <div className="bg-navy-8 rounded-xl px-5 py-3">
            <p className="text-f13 text-navy-40">{finishResult.ineligibleMessage}</p>
          </div>
        )}

        {/* 새로고침 */}
        {!finishResult && (
          <p className="text-f12 text-navy-40 text-center">
            페이지를 새로 고친 경우 XP·영토 상세는 표시되지 않습니다.
          </p>
        )}

        <button
          onClick={() => navigate(ROUTES.HOME, { replace: true })}
          className="w-full py-4 rounded-pill bg-navy text-white text-f16 font-medium active:opacity-70"
        >
          홈으로
        </button>
      </div>
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-f12 text-navy-40">{label}</span>
      <span className="text-f18 font-light text-navy tabular-nums">{value}</span>
    </div>
  )
}
