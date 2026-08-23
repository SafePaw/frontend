import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyCrew } from '../../api/crews'
import { getMyCrewTerritories, getCrewStats, getCrewTerritoryUnion } from '../../api/crewTerritory'
import { extractErrorCode } from '../../utils/apiError'
import { computePolygonBounds } from '../../utils/territoryGeoJson'
import CrewTerritoryMap from '../../components/crew/crewTerritoryMap'
import BottomNav from '../../components/layout/bottomNav'
import { ROUTES } from '../../constants/routes'
import type { CrewResponse } from '../../types/crew'
import type { CrewTerritoryItem, CrewStats } from '../../types/crewTerritory'
import type { TerritoryBoundsParams } from '../../types/territory'

type CrewFetchState = 'loading' | 'notJoined' | 'joined' | 'error'
type TerritoryFetchState = 'idle' | 'loading' | 'success' | 'empty' | 'error' | 'zoomRequired'

export default function CrewTerritoryPage() {
  const navigate = useNavigate()

  const [crew, setCrew] = useState<CrewResponse | null>(null)
  const [crewState, setCrewState] = useState<CrewFetchState>('loading')

  const [territories, setTerritories] = useState<CrewTerritoryItem[]>([])
  const [territoryState, setTerritoryState] = useState<TerritoryFetchState>('idle')

  const [stats, setStats] = useState<CrewStats | null>(null)
  const [fitBounds, setFitBounds] = useState<[[number, number], [number, number]] | null>(null)

  const latestReqRef = useRef(0)

  useEffect(() => {
    getMyCrew()
      .then((c) => {
        setCrew(c)
        setCrewState('joined')
      })
      .catch((err) => {
        const code = extractErrorCode(err)
        if (code === 'CREW_NOT_JOINED') {
          setCrewState('notJoined')
        } else {
          setCrewState('error')
        }
      })
  }, [])

  useEffect(() => {
    if (!crew) return
    getCrewStats(crew.id)
      .then(setStats)
      .catch(() => {})
    getCrewTerritoryUnion(crew.id)
      .then((union) => {
        if (!union.geometry) return
        const bounds = computePolygonBounds(union.geometry)
        if (bounds) setFitBounds(bounds)
      })
      .catch(() => {})
  }, [crew])

  const handleBoundsChange = useCallback(
    (bounds: TerritoryBoundsParams) => {
      if (!crew) return
      setTerritoryState('loading')
      const reqId = ++latestReqRef.current

      getMyCrewTerritories(bounds)
        .then((data) => {
          if (reqId !== latestReqRef.current) return
          setTerritories(data)
          setTerritoryState(data.length === 0 ? 'empty' : 'success')
        })
        .catch((err) => {
          if (reqId !== latestReqRef.current) return
          const code = extractErrorCode(err)
          if (code === 'TERRITORY_BBOX_TOO_LARGE') {
            setTerritoryState('zoomRequired')
          } else {
            setTerritoryState('error')
          }
        })
    },
    [crew],
  )

  if (crewState === 'loading') {
    return (
      <div className="flex flex-col h-full bg-cream">
        <PageHeader onBack={() => navigate(-1)} crewName="" />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-navy-15 border-t-navy animate-spin" />
        </div>
        <BottomNav />
      </div>
    )
  }

  if (crewState === 'notJoined') {
    return (
      <div className="flex flex-col h-full bg-cream">
        <PageHeader onBack={() => navigate(-1)} crewName="" />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          <p className="text-f16 text-navy-70 text-center">크루에 가입하면 영토를 볼 수 있어요.</p>
          <button
            onClick={() => navigate(ROUTES.CREW.INDEX)}
            className="px-6 py-2.5 rounded-pill bg-navy text-cream text-f14 font-medium active:opacity-70 transition-opacity"
          >
            크루 가입하기
          </button>
        </div>
        <BottomNav />
      </div>
    )
  }

  if (crewState === 'error') {
    return (
      <div className="flex flex-col h-full bg-cream">
        <PageHeader onBack={() => navigate(-1)} crewName="" />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          <p className="text-f16 text-navy-70 text-center">크루 정보를 불러오지 못했어요.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-pill bg-navy-8 text-navy text-f14 font-medium active:opacity-70 transition-opacity"
          >
            돌아가기
          </button>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="relative h-full overflow-hidden">
      {/* 지도 */}
      <div className="absolute inset-0">
        <CrewTerritoryMap
          territories={territories}
          onBoundsChange={handleBoundsChange}
          fitBoundsTarget={fitBounds}
        />
      </div>

      <div className="absolute top-0 left-0 right-0 z-20">
        <PageHeader onBack={() => navigate(-1)} crewName={crew?.name ?? ''} />
      </div>

      {territoryState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-10 h-10 rounded-full border-4 border-navy-15 border-t-navy animate-spin" />
        </div>
      )}

      {territoryState === 'zoomRequired' && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-cream/90 rounded-xl px-6 py-4 text-center shadow-md">
          <p className="text-f14 text-navy font-semibold">지도를 더 확대해주세요.</p>
        </div>
      )}

      {territoryState === 'empty' && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-cream/90 rounded-xl px-6 py-5 text-center shadow-md max-w-xs">
          <p className="text-f16 text-navy font-semibold break-keep">
            이 구역엔 <br /> 크루 영토가 없어요.
          </p>
          <p className="text-f12 text-navy-70 mt-1 break-keep">지도를 이동해 탐색해보세요.</p>
        </div>
      )}

      {territoryState === 'error' && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-cream/90 rounded-xl px-6 py-4 text-center shadow-md">
          <p className="text-f14 text-navy-70">영토를 불러오지 못했습니다.</p>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-10">
        {stats && (
          <div className="flex items-center justify-center gap-3 border-t border-navy-15 bg-cream/95 px-4 py-3 backdrop-blur">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: stats.territoryColor }}
            />
            <span className="text-f12 font-semibold text-navy truncate max-w-[120px]">
              {stats.name}
            </span>
            <span className="h-3 w-px bg-navy-15" />
            <span className="text-f12 text-navy-70">
              영토 <strong className="text-navy font-semibold">{stats.territoryCount}개</strong>
            </span>
            <span className="h-3 w-px bg-navy-15" />
            <span className="text-f12 text-navy-70">
              총 면적{' '}
              <strong className="text-navy font-semibold">
                {Math.round(stats.areaSquareMeters).toLocaleString()}㎡
              </strong>
            </span>
          </div>
        )}
        <BottomNav />
      </div>
    </div>
  )
}

function PageHeader({ onBack, crewName }: { onBack: () => void; crewName: string }) {
  return (
    <div className="flex items-center px-4 pt-14 pb-3 bg-cream/90 backdrop-blur">
      <button
        onClick={onBack}
        className="mr-3 text-f20 text-navy-70 leading-none"
        aria-label="뒤로가기"
      >
        ←
      </button>
      <h1 className="text-f18 font-semibold text-navy truncate">
        {crewName ? `${crewName} 영토` : '크루 영토'}
      </h1>
    </div>
  )
}
