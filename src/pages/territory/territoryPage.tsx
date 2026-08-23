import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { getMyTerritories, getTerritoryDetail } from '../../api/territories'
import { getMyCrew } from '../../api/crews'
import { getMyCrewTerritories, getCrewStats, getCrewTerritoryUnion } from '../../api/crewTerritory'
import { extractErrorCode } from '../../utils/apiError'
import TerritoryMap from '../../components/territory/territoryMap'
import TerritoryCard from '../../components/territory/territoryCard'
import CrewTerritoryMap from '../../components/crew/crewTerritoryMap'
import BottomNav from '../../components/layout/bottomNav'
import {
  toTerritoryFeatureCollection,
  computeTerritoryBounds,
  computePolygonBounds,
} from '../../utils/territoryGeoJson'
import { ROUTES } from '../../constants/routes'
import type { TerritorySummary, TerritoryDetail } from '../../types/territory'
import type { CrewResponse } from '../../types/crew'
import type { CrewTerritoryItem, CrewStats } from '../../types/crewTerritory'
import type { TerritoryBoundsParams } from '../../types/territory'

type MyFetchState = 'loading' | 'success' | 'error'
type CrewFetchState = 'loading' | 'notJoined' | 'joined' | 'error'
type CrewTerritoryState = 'idle' | 'loading' | 'success' | 'empty' | 'error' | 'zoomRequired'
type ViewTab = 'my' | 'crew'

export default function TerritoryPage() {
  const navigate = useNavigate()
  const [territories, setTerritories] = useState<TerritorySummary[]>([])
  const [fetchState, setFetchState] = useState<MyFetchState>('loading')
  const [retryCount, setRetryCount] = useState(0)
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<number | null>(null)
  const [detail, setDetail] = useState<TerritoryDetail | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

  const [viewTab, setViewTab] = useState<ViewTab>('my')
  const [crewInitialized, setCrewInitialized] = useState(false)
  const [crew, setCrew] = useState<CrewResponse | null>(null)
  const [crewFetchState, setCrewFetchState] = useState<CrewFetchState>('loading')
  const [crewTerritories, setCrewTerritories] = useState<CrewTerritoryItem[]>([])
  const [crewTerritoryState, setCrewTerritoryState] = useState<CrewTerritoryState>('idle')
  const [crewStats, setCrewStats] = useState<CrewStats | null>(null)
  const [crewFitBounds, setCrewFitBounds] = useState<[[number, number], [number, number]] | null>(
    null,
  )
  const crewBoundsReqRef = useRef(0)

  //내 영토 조회
  useEffect(() => {
    let cancelled = false
    setFetchState('loading')

    getMyTerritories({ page: 0, size: 200 })
      .then((res) => {
        if (cancelled) return
        setTerritories(res.content)
        setFetchState('success')
      })
      .catch(() => {
        if (cancelled) return
        setFetchState('error')
      })

    return () => {
      cancelled = true
    }
  }, [retryCount])

  // 선택된 영토 상세 조회
  useEffect(() => {
    if (selectedTerritoryId === null) {
      setDetail(null)
      setIsLoadingDetail(false)
      return
    }

    let cancelled = false
    setIsLoadingDetail(true)
    setDetail(null)

    getTerritoryDetail(selectedTerritoryId)
      .then((data) => {
        if (cancelled) return
        setDetail(data)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoadingDetail(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedTerritoryId])

  useEffect(() => {
    if (viewTab !== 'crew' || crewInitialized) return
    setCrewInitialized(true)
    getMyCrew()
      .then((c) => {
        setCrew(c)
        setCrewFetchState('joined')
      })
      .catch((err) => {
        const code = extractErrorCode(err)
        setCrewFetchState(code === 'CREW_NOT_JOINED' ? 'notJoined' : 'error')
      })
  }, [viewTab, crewInitialized])

  useEffect(() => {
    if (!crew) return
    getCrewStats(crew.id)
      .then(setCrewStats)
      .catch(() => {})
    getCrewTerritoryUnion(crew.id)
      .then((union) => {
        if (!union.geometry) return
        const bounds = computePolygonBounds(union.geometry)
        if (bounds) setCrewFitBounds(bounds)
      })
      .catch(() => {})
  }, [crew])

  const handleCrewBoundsChange = useCallback(
    (bounds: TerritoryBoundsParams) => {
      if (!crew) return
      setCrewTerritoryState('loading')
      const reqId = ++crewBoundsReqRef.current

      getMyCrewTerritories(bounds)
        .then((data) => {
          if (reqId !== crewBoundsReqRef.current) return
          setCrewTerritories(data)
          setCrewTerritoryState(data.length === 0 ? 'empty' : 'success')
        })
        .catch((err) => {
          if (reqId !== crewBoundsReqRef.current) return
          const code = extractErrorCode(err)
          setCrewTerritoryState(code === 'TERRITORY_BBOX_TOO_LARGE' ? 'zoomRequired' : 'error')
        })
    },
    [crew],
  )
  const featureCollection = useMemo(() => toTerritoryFeatureCollection(territories), [territories])
  const boundsData = useMemo(() => computeTerritoryBounds(territories), [territories])
  const totalArea = useMemo(
    () => territories.reduce((sum, t) => sum + t.areaSquareMeters, 0),
    [territories],
  )
  const selectedTerritory = territories.find((t) => t.id === selectedTerritoryId) ?? null

  function handleSelectTerritory(id: number | null) {
    if (id !== selectedTerritoryId) setDetail(null)
    setSelectedTerritoryId(id)
  }

  function handleRetry() {
    if (fetchState === 'loading') return
    setSelectedTerritoryId(null)
    setRetryCount((c) => c + 1)
  }

  function handleViewTabChange(tab: ViewTab) {
    if (tab === viewTab) return
    setViewTab(tab)
    if (tab === 'my') setSelectedTerritoryId(null)
  }

  return (
    <div className="relative h-full overflow-hidden">
      <div className="absolute top-12 left-0 right-0 z-20 flex justify-center pointer-events-none">
        <div className="bg-white/95 backdrop-blur-sm rounded-full shadow p-1 flex gap-0.5 pointer-events-auto">
          <button
            onClick={() => handleViewTabChange('my')}
            className={`px-4 py-1.5 rounded-full text-f13 font-medium transition-colors focus-visible:outline-none ${
              viewTab === 'my' ? 'bg-navy text-cream' : 'text-navy-70'
            }`}
          >
            내 영토
          </button>
          <button
            onClick={() => handleViewTabChange('crew')}
            className={`px-4 py-1.5 rounded-full text-f13 font-medium transition-colors focus-visible:outline-none ${
              viewTab === 'crew' ? 'bg-navy text-cream' : 'text-navy-70'
            }`}
          >
            크루
          </button>
        </div>
      </div>

      {/* 내 영토 */}
      {viewTab === 'my' && (
        <>
          <div className="absolute inset-0">
            <TerritoryMap
              featureCollection={featureCollection}
              selectedTerritoryId={selectedTerritoryId}
              onSelectTerritory={handleSelectTerritory}
              boundsData={boundsData}
              territories={territories}
            />
          </div>

          {fetchState === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-cream/60 z-20 pointer-events-none">
              <div className="w-10 h-10 rounded-full border-4 border-navy-15 border-t-navy animate-spin" />
            </div>
          )}

          {fetchState === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-cream/90 gap-4 px-6">
              <p className="text-f16 text-navy text-center">
                영토 정보를 불러오지 못했습니다.
                <br />
                잠시 후 다시 시도해 주세요.
              </p>
              <button
                onClick={handleRetry}
                className="px-6 py-2.5 rounded-pill bg-navy text-cream text-f12 font-medium active:opacity-70 transition-opacity"
              >
                다시 시도
              </button>
            </div>
          )}

          <AnimatePresence>
            {fetchState === 'success' && territories.length === 0 && (
              <motion.div
                key="my-empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-cream/90 rounded-xl px-6 py-5 text-center shadow-md max-w-xs"
              >
                <p className="text-f16 text-navy font-semibold break-keep">
                  아직 획득한 영토가 없어요.
                </p>
                <p className="text-f12 text-navy-70 mt-1 break-keep">
                  산책으로 새로운 영토를 만들어 보세요.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/*크루 영토 뷰*/}
      {viewTab === 'crew' && (
        <>
          {crewFetchState === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-cream/60 z-10 pointer-events-none">
              <div className="w-10 h-10 rounded-full border-4 border-navy-15 border-t-navy animate-spin" />
            </div>
          )}
          {crewFetchState === 'notJoined' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-cream/90 gap-4 px-6">
              <p className="text-f16 text-navy text-center break-keep">
                크루에 가입하면 영토를 볼 수 있어요.
              </p>
              <button
                onClick={() => navigate(ROUTES.CREW.INDEX)}
                className="px-6 py-2.5 rounded-pill bg-navy text-cream text-f14 font-medium active:opacity-70 transition-opacity"
              >
                크루 가입하기
              </button>
            </div>
          )}
          {crewFetchState === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-cream/90 gap-4 px-6">
              <p className="text-f16 text-navy-70 text-center break-keep">
                크루 정보를 불러오지 못했습니다.
              </p>
            </div>
          )}
          {crewFetchState === 'joined' && (
            <div className="absolute inset-0">
              <CrewTerritoryMap
                territories={crewTerritories}
                onBoundsChange={handleCrewBoundsChange}
                fitBoundsTarget={crewFitBounds}
              />
            </div>
          )}
          {crewFetchState === 'joined' && crewTerritoryState === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="w-10 h-10 rounded-full border-4 border-navy-15 border-t-navy animate-spin" />
            </div>
          )}

          <AnimatePresence>
            {crewFetchState === 'joined' && crewTerritoryState === 'zoomRequired' && (
              <motion.div
                key="crew-zoom"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-cream/90 rounded-xl px-6 py-4 text-center shadow-md"
              >
                <p className="text-f14 text-navy font-semibold">지도를 더 확대해주세요.</p>
              </motion.div>
            )}
            {crewFetchState === 'joined' && crewTerritoryState === 'empty' && (
              <motion.div
                key="crew-empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-cream/90 rounded-xl px-6 py-5 text-center shadow-md max-w-xs"
              >
                <p className="text-f16 text-navy font-semibold break-keep">
                  이 구역엔 <br /> 크루 영토가 없어요.
                </p>
                <p className="text-f12 text-navy-70 mt-1 break-keep">지도를 이동해 탐색해보세요.</p>
              </motion.div>
            )}
            {crewFetchState === 'joined' && crewTerritoryState === 'error' && (
              <motion.div
                key="crew-error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-cream/90 rounded-xl px-6 py-4 text-center shadow-md"
              >
                <p className="text-f14 text-navy-70">영토를 불러오지 못했습니다.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <AnimatePresence>
          {viewTab === 'my' && selectedTerritory && (
            <motion.div
              key={selectedTerritory.id}
              className="mx-4 mb-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <TerritoryCard
                territory={selectedTerritory}
                detail={detail}
                isLoadingDetail={isLoadingDetail}
                onClose={() => setSelectedTerritoryId(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
        {viewTab === 'my' && fetchState === 'success' && territories.length > 0 && (
          <div className="flex items-center justify-center gap-3 border-t border-navy-15 bg-cream/95 px-4 py-3 backdrop-blur pointer-events-none">
            <span className="text-f12 text-navy-70">
              내 영토 <strong className="text-navy font-semibold">{territories.length}개</strong>
            </span>
            <span className="h-3 w-px bg-navy-15" />
            <span className="text-f12 text-navy-70">
              총 면적{' '}
              <strong className="text-navy font-semibold">
                {Math.round(totalArea).toLocaleString()}㎡
              </strong>
            </span>
          </div>
        )}

        {viewTab === 'crew' && crewFetchState === 'joined' && crewStats && (
          <div className="flex items-center justify-center gap-3 border-t border-navy-15 bg-cream/95 px-4 py-3 backdrop-blur">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: crewStats.territoryColor }}
            />
            <span className="text-f12 font-semibold text-navy truncate max-w-[100px]">
              {crewStats.name}
            </span>
            <span className="h-3 w-px bg-navy-15" />
            <span className="text-f12 text-navy-70">
              영토 <strong className="text-navy font-semibold">{crewStats.territoryCount}개</strong>
            </span>
            <span className="h-3 w-px bg-navy-15" />
            <span className="text-f12 text-navy-70">
              총 면적{' '}
              <strong className="text-navy font-semibold">
                {Math.round(crewStats.areaSquareMeters).toLocaleString()}㎡
              </strong>
            </span>
          </div>
        )}

        <BottomNav />
      </div>
    </div>
  )
}
