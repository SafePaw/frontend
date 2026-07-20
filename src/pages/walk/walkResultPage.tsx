import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import WalkMap from '../../components/walk/walkMap'
import { getWalkDetail } from '../../api/walks'
import { ROUTES } from '../../constants/routes'
import type { WalkFinishResponse, WalkDetailResponse } from '../../types/walk'

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
  const [isLoading, setIsLoading] = useState(!finishResult)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    if (finishResult || !walkId) return
    setIsLoading(true)
    getWalkDetail(Number(walkId))
      .then(setDetail)
      .catch(() => setFetchError('산책 기록을 불러오지 못했습니다.'))
      .finally(() => setIsLoading(false))
  }, [walkId, finishResult])

  const stats = finishResult?.stats ?? detail?.stats ?? null
  const polylineCoords = detail?.polyline?.coordinates ?? null
  const territory = finishResult?.territory ?? null
  const dogTerritoryColor = undefined

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-cream">
        <div className="w-10 h-10 rounded-full border-4 border-navy-15 border-t-navy animate-spin" />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-cream px-6 gap-4">
        <p className="text-f16 text-navy-40 text-center">{fetchError}</p>
        <button
          onClick={() => navigate(ROUTES.HOME, { replace: true })}
          className="text-f14 text-navy underline"
        >
          홈으로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-cream">
      <div className="flex items-center px-6 pt-14 pb-4">
        <h1 className="text-f20 font-semibold text-navy">산책 결과</h1>
      </div>

      {/* 완료 경로 표시 */}
      {polylineCoords && polylineCoords.length > 0 && (
        <div className="mx-4 h-52 rounded-xl overflow-hidden mb-4">
          <WalkMap
            currentPosition={null}
            routeCoords={[]}
            isPaused={false}
            completedCoords={polylineCoords}
            territoryPolygon={territory?.polygon}
            territoryColor={dogTerritoryColor}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 pb-12 space-y-4">
        {/* 통계 */}
        <div className="bg-navy-8 rounded-xl px-5 py-5 space-y-3">
          <p className="text-f12 font-medium text-navy-40">산책 통계</p>
          <div className="grid grid-cols-2 gap-3">
            <StatItem label="거리" value={stats ? formatDistance(stats.distanceMeters) : '—'} />
            <StatItem label="시간" value={stats ? formatDuration(stats.durationSeconds) : '—'} />
            <StatItem label="좌표 수" value={stats ? `${stats.pointCount}개` : '—'} />
            {finishResult && stats && (
              <StatItem label="평균 속도" value={`${stats.averageSpeedKmh.toFixed(1)}km/h`} />
            )}
          </div>
        </div>

        {/* XP 및 랭크 */}
        {finishResult && (
          <div className="bg-navy-8 rounded-xl px-5 py-5 space-y-2">
            <p className="text-f12 font-medium text-navy-40">획득 보상</p>
            {finishResult.xpGained.map((xp, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-f14 text-navy-40">{xp.source}</span>
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
          className="w-full py-4 rounded-sm bg-navy text-white text-f16 font-medium active:opacity-70"
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
