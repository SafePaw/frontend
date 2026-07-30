import { useState, useEffect, useMemo } from 'react'
import { getMyTerritories, getTerritoryDetail } from '../../api/territories'
import TerritoryMap from '../../components/territory/territoryMap'
import TerritoryCard from '../../components/territory/territoryCard'
import BottomNav from '../../components/layout/bottomNav'
import { toTerritoryFeatureCollection, computeTerritoryBounds } from '../../utils/territoryGeoJson'
import type { TerritorySummary, TerritoryDetail } from '../../types/territory'

type FetchState = 'loading' | 'success' | 'error'

export default function TerritoryPage() {
  const [territories, setTerritories] = useState<TerritorySummary[]>([])
  const [fetchState, setFetchState] = useState<FetchState>('loading')
  const [retryCount, setRetryCount] = useState(0)

  const [selectedTerritoryId, setSelectedTerritoryId] = useState<number | null>(null)
  const [detail, setDetail] = useState<TerritoryDetail | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

  // 내 영토 목록 조회
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

  const featureCollection = useMemo(() => toTerritoryFeatureCollection(territories), [territories])

  const boundsData = useMemo(() => computeTerritoryBounds(territories), [territories])

  const totalArea = useMemo(
    () => territories.reduce((sum, t) => sum + t.areaSquareMeters, 0),
    [territories],
  )

  const selectedTerritory = territories.find((t) => t.id === selectedTerritoryId) ?? null

  function handleSelectTerritory(id: number | null) {
    if (id !== selectedTerritoryId) {
      setDetail(null)
    }
    setSelectedTerritoryId(id)
  }

  function handleRetry() {
    if (fetchState === 'loading') return
    setSelectedTerritoryId(null)
    setRetryCount((c) => c + 1)
  }

  return (
    <div className="relative h-full overflow-hidden">
      {/* 지도 — 내 영토 표시 */}
      <div className="absolute inset-0">
        <TerritoryMap
          featureCollection={featureCollection}
          selectedTerritoryId={selectedTerritoryId}
          onSelectTerritory={handleSelectTerritory}
          boundsData={boundsData}
        />
      </div>

      {/* 로딩 */}
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

      {/* 통계 */}
      {fetchState === 'success' && territories.length > 0 && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 bg-navy/90 text-cream rounded-full px-4 py-2 shadow-md pointer-events-none whitespace-nowrap">
          <p className="text-f12 font-medium">
            {territories.length}개 영토 · {Math.round(totalArea).toLocaleString()}㎡
          </p>
        </div>
      )}

      {/* 영토 없는 경우 */}
      {fetchState === 'success' && territories.length === 0 && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-cream/90 rounded-xl px-6 py-5 text-center shadow-md max-w-xs">
          <p className="text-f16 text-navy font-semibold">아직 획득한 영토가 없어요.</p>
          <p className="text-f12 text-navy-40 mt-1">산책으로 새로운 영토를 만들어 보세요.</p>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-10">
        {selectedTerritory && (
          <div className="mx-4 mb-3">
            <TerritoryCard
              territory={selectedTerritory}
              detail={detail}
              isLoadingDetail={isLoadingDetail}
              onClose={() => setSelectedTerritoryId(null)}
            />
          </div>
        )}
        <BottomNav />
      </div>
    </div>
  )
}
