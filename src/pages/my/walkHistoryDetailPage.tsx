import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import WalkMap from '../../components/walk/walkMap'
import { getWalkDetail } from '../../api/walks'
import { getTerritoryDetail } from '../../api/territories'
import { formatDuration, formatTerritory } from '../../utils/rankingFormat'
import { computeGeometryCentroid } from '../../utils/territoryGeoJson'
import { resolveMarkerImage } from '../../utils/markerImage'
import Button from '../../components/ui/button'
import type { WalkDetailResponse } from '../../types/walk'
import type { TerritoryDetail } from '../../types/territory'
import dogCaloriesImg from '../../assets/dogCalories.png'

function formatDetailDate(startedAt: string, endedAt: string | null): string {
  const start = new Date(startedAt)
  const y = start.getFullYear()
  const mo = start.getMonth() + 1
  const d = start.getDate()
  const t1 = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`
  if (endedAt) {
    const end = new Date(endedAt)
    const t2 = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`
    return `${y}년 ${mo}월 ${d}일  ${t1} – ${t2}`
  }
  return `${y}년 ${mo}월 ${d}일  ${t1}`
}

function getHttpStatus(err: unknown): number | null {
  return (err as { response?: { status?: number } }).response?.status ?? null
}

function StatCell({
  label,
  value,
  unit,
  icon,
}: {
  label: string
  value: string
  unit?: string
  icon?: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-baseline gap-0.5">
        {icon && <img src={icon} alt="" className="w-5 h-5 object-contain self-center" />}
        <span className="text-f18 font-semibold text-navy tabular-nums leading-tight">{value}</span>
        {unit && <span className="text-f12 text-navy-70">{unit}</span>}
      </div>
      <span className="text-f12 text-navy-70">{label}</span>
    </div>
  )
}

export default function WalkHistoryDetailPage() {
  const { walkId } = useParams<{ walkId: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const navState = (location.state ?? {}) as { dogName?: string; walkType?: string }
  const passedDogName = navState.dogName ?? null

  const [detail, setDetail] = useState<WalkDetailResponse | null>(null)
  const [territory, setTerritory] = useState<TerritoryDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!walkId) return
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const walkDetail = await getWalkDetail(Number(walkId))
        if (cancelled) return
        setDetail(walkDetail)

        if (walkDetail.territoryId !== null) {
          try {
            const terr = await getTerritoryDetail(walkDetail.territoryId)
            if (!cancelled) setTerritory(terr)
          } catch {
            // territory 없으면 산책 경로만 표시
          }
        }
      } catch (err) {
        if (cancelled) return
        const status = getHttpStatus(err)
        if (status === 404) setError('존재하지 않는 산책 기록입니다.')
        else if (status === 403) setError('접근 권한이 없습니다.')
        else setError('산책 기록을 불러오지 못했습니다.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [walkId])

  if (isLoading) {
    return (
      <div className="flex h-full bg-cream items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-navy-15 border-t-navy animate-spin" />
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="flex flex-col h-full bg-cream">
        <div className="flex items-center px-6 pt-14 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="mr-3 text-f20 text-navy-70 leading-none"
            aria-label="뒤로가기"
          >
            ←
          </button>
          <h1 className="text-f20 font-semibold text-navy">산책 상세</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <p className="text-f16 text-navy-70 text-center">
            {error ?? '산책 기록을 불러오지 못했습니다.'}
          </p>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            돌아가기
          </Button>
        </div>
      </div>
    )
  }

  const isTerritory = detail.territoryId !== null
  const polylineCoords = detail.polyline?.coordinates ?? null
  const territoryPolygon = isTerritory ? (territory?.polygon ?? null) : null
  const territoryColor = territory?.dog.territoryColor

  const dogMarkerPosition =
    isTerritory && territory?.polygon ? computeGeometryCentroid(territory.polygon) : null

  const dogMarkerSrc =
    isTerritory && territory?.dog
      ? resolveMarkerImage({
          markerImageType: territory.dog.markerImageType,
          markerImageValue: territory.dog.markerImageValue,
          markerImageUrl: territory.dog.markerImageUrl,
        })
      : null

  return (
    <div className="flex flex-col h-full bg-cream">
      <div className="flex items-center px-6 pt-14 pb-2 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 text-f20 text-navy-70 leading-none"
          aria-label="뒤로가기"
        >
          ←
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <div className="px-6 mb-3">
          <p className="text-f12 text-navy-70 mb-2">
            {formatDetailDate(detail.startedAt, detail.endedAt)}
          </p>
          <div className="flex items-center gap-2">
            {passedDogName && (
              <span className="text-f14 font-semibold text-navy">{passedDogName}</span>
            )}
            <span
              className={[
                'text-f12 font-medium px-2 py-0.5 rounded-pill',
                isTerritory ? 'bg-navy text-cream' : 'bg-navy-8 text-navy-70',
              ].join(' ')}
            >
              {isTerritory ? '영토 획득' : '일반 산책'}
            </span>
          </div>
        </div>

        <div className="px-6 mb-5">
          <p
            className="font-black text-navy leading-none"
            style={{ fontSize: '3.25rem', letterSpacing: '-0.02em' }}
          >
            {(detail.stats.distanceMeters / 1000).toFixed(2)}
          </p>
          <p className="text-f13 text-navy-70 mt-1">킬로미터</p>
        </div>

        <div className="px-6 mb-6">
          <div className="grid grid-cols-3 gap-x-4 gap-y-5 pb-6 border-b border-navy-8">
            <StatCell label="시간" value={formatDuration(detail.stats.durationSeconds)} />
            <StatCell
              label="평균 속도"
              value={detail.stats.averageSpeedKmh.toFixed(1)}
              unit=" km/h"
            />
            <StatCell
              label="칼로리"
              icon={dogCaloriesImg}
              value={
                detail.stats.caloriesKcal != null
                  ? Math.round(detail.stats.caloriesKcal).toLocaleString()
                  : '—'
              }
              unit={detail.stats.caloriesKcal != null ? ' kcal' : undefined}
            />
          </div>
        </div>

        {isTerritory && (
          <div className="px-6 mb-6">
            {territory ? (
              <div className="bg-navy-5 rounded-xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-f12 text-navy-70 mb-0.5">획득 영토</p>
                  <p className="text-f18 font-semibold text-navy">
                    {formatTerritory(territory.areaSquareMeters)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-f12 text-navy-70 mb-0.5">현재 상태</p>
                  <p
                    className={[
                      'text-f14 font-medium',
                      territory.status === 'ACTIVE' ? 'text-navy' : 'text-navy-70',
                    ].join(' ')}
                  >
                    {territory.status === 'ACTIVE' ? '보유 중' : '점령됨'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-f13 text-navy-70">영토 정보를 불러오지 못했습니다.</p>
            )}
          </div>
        )}

        {/* 지도 */}
        <div className="mx-4 rounded-xl overflow-hidden" style={{ height: '260px' }}>
          {polylineCoords && polylineCoords.length > 0 ? (
            <WalkMap
              currentPosition={null}
              routeCoords={[]}
              isPaused={false}
              completedCoords={polylineCoords}
              territoryPolygon={territoryPolygon}
              territoryColor={territoryColor}
              dogMarkerPosition={dogMarkerPosition}
              dogMarkerSrc={dogMarkerSrc}
            />
          ) : (
            <div className="h-full bg-navy-8 flex items-center justify-center">
              <p className="text-f13 text-navy-70">경로 데이터가 없습니다.</p>
            </div>
          )}
        </div>

        {detail.status === 'COMPLETED' && (
          <section
            className="mx-6 mt-6 border-t border-navy-8 pt-6"
            aria-labelledby="share-card-heading"
          >
            <h2 id="share-card-heading" className="text-f16 font-semibold text-navy">
              공유 카드
            </h2>
            <p className="mt-2 mb-4 text-f14 text-navy-70">
              산책 기록을 이미지 카드로 만들어 저장하거나 공유할 수 있습니다.
            </p>
            <Button fullWidth size="lg" onClick={() => navigate(ROUTES.WALK.SHARE_OF(detail.id))}>
              공유 카드 보기
            </Button>
          </section>
        )}
      </div>
    </div>
  )
}
