import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { getDogs } from '../../api/dogs'
import { getRankingsByCategory, getMyRanking } from '../../api/rankings'
import MetricChipGroup from '../../components/ranking/metricChipGroup'
import RankingList from '../../components/ranking/rankingList'
import RankingPodium from '../../components/ranking/rankingPodium'
import RankingPagination from '../../components/ranking/rankingPagination'
import RankingInfoCard from '../../components/ranking/rankingInfoCard'
import MyRankingFloating from '../../components/ranking/myRankingFloating'
import RankingSkeleton from '../../components/ranking/rankingSkeleton'
import BottomNav from '../../components/layout/bottomNav'
import type { RankingCategoryKey, RankingItem, MyRankingData } from '../../types/ranking'

const PAGE_SIZE = 20

type FetchState = 'loading' | 'success' | 'error'

export default function RankingPage() {
  const [selectedCategory, setSelectedCategory] = useState<RankingCategoryKey>('xp')
  const [currentPage, setCurrentPage] = useState(0)

  const [rankingItems, setRankingItems] = useState<RankingItem[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [fetchState, setFetchState] = useState<FetchState>('loading')
  const [rankingRetryCount, setRankingRetryCount] = useState(0)

  const [myRanking, setMyRanking] = useState<MyRankingData | null>(null)
  const [myRankingFetchState, setMyRankingFetchState] = useState<FetchState>('loading')

  const [infoCardVisible, setInfoCardVisible] = useState(true)
  const [myRowEl, setMyRowEl] = useState<HTMLDivElement | null>(null)
  const [myRowVisible, setMyRowVisible] = useState(false)
  const [shouldScrollToMyRow, setShouldScrollToMyRow] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)

  const totalPages = useMemo(() => Math.ceil(totalElements / PAGE_SIZE), [totalElements])
  const currentMyRanking = myRanking?.rankings[selectedCategory]

  const myRankPage = useMemo(() => {
    const rank = currentMyRanking?.rank
    if (rank == null) return null
    return Math.floor((rank - 1) / PAGE_SIZE)
  }, [currentMyRanking?.rank])

  const podiumItems = useMemo(
    () => (currentPage === 0 && rankingItems.length > 0 ? rankingItems.slice(0, 3) : []),
    [currentPage, rankingItems],
  )

  const listItems = useMemo(
    () => (currentPage === 0 ? rankingItems.slice(podiumItems.length) : rankingItems),
    [currentPage, rankingItems, podiumItems.length],
  )

  const showFloating =
    myRankingFetchState === 'success' &&
    currentMyRanking != null &&
    currentMyRanking.rank !== null &&
    !myRowVisible

  // 랭킹 목록 조회
  useEffect(() => {
    let cancelled = false
    setRankingItems([])
    setTotalElements(0)
    setFetchState('loading')

    getRankingsByCategory(selectedCategory, { page: currentPage, size: PAGE_SIZE })
      .then((data) => {
        if (cancelled) return
        setRankingItems(data.content)
        setTotalElements(data.totalElements)
        setFetchState('success')
      })
      .catch(() => {
        if (cancelled) return
        setFetchState('error')
      })

    return () => {
      cancelled = true
    }
  }, [selectedCategory, currentPage, rankingRetryCount])

  // 내 랭킹 조회
  useEffect(() => {
    let cancelled = false
    setMyRankingFetchState('loading')

    getDogs()
      .then((dogs) => {
        if (cancelled) return null
        const dogId = dogs.length > 0 ? dogs[0].id : null
        if (!dogId) {
          setMyRankingFetchState('success')
          return null
        }
        return getMyRanking(dogId)
      })
      .then((myData) => {
        if (cancelled) return
        if (myData) {
          setMyRanking(myData)
        }
        setMyRankingFetchState('success')
      })
      .catch(() => {
        if (cancelled) return
        setMyRankingFetchState('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [selectedCategory, currentPage])

  useEffect(() => {
    const el = myRowEl
    const container = contentRef.current
    if (!el || !container) {
      setMyRowVisible(false)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => setMyRowVisible(entries[0].isIntersecting),
      { root: container, threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [myRowEl])

  // 내 순위 Row로
  useEffect(() => {
    if (shouldScrollToMyRow && myRowEl) {
      myRowEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setShouldScrollToMyRow(false)
    }
  }, [shouldScrollToMyRow, myRowEl])

  function handleCategorySelect(category: RankingCategoryKey) {
    if (category === selectedCategory) return
    setSelectedCategory(category)
    setCurrentPage(0)
    setMyRowEl(null)
    setMyRowVisible(false)
  }

  function handlePageChange(page: number) {
    setCurrentPage(page)
    setMyRowEl(null)
    setMyRowVisible(false)
  }

  function handleNavigateToMyRank() {
    if (myRankPage === null) return
    if (currentPage === myRankPage) {
      myRowEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      setCurrentPage(myRankPage)
      setShouldScrollToMyRow(true)
    }
  }

  const myRowRefCallback = useCallback((el: HTMLDivElement | null) => {
    setMyRowEl(el)
  }, [])

  return (
    <div className="flex flex-col h-full bg-cream">
      <div className="flex-shrink-0">
        <div className="flex items-center gap-3 px-4 pt-4 pb-1">
          <h1 className="text-f20 font-bold text-navy">랭킹</h1>
        </div>
        <MetricChipGroup selectedCategory={selectedCategory} onSelect={handleCategorySelect} />
        {infoCardVisible && <RankingInfoCard onDismiss={() => setInfoCardVisible(false)} />}
      </div>
      <div ref={contentRef} className="flex-1 overflow-y-auto pb-24">
        {fetchState === 'loading' && <RankingSkeleton showPodium={currentPage === 0} />}

        {fetchState === 'error' && (
          <div className="flex flex-col items-center justify-center h-64 gap-4 px-6">
            <p className="text-f16 text-navy text-center">
              랭킹을 불러오지 못했습니다.
              <br />
              잠시 후 다시 시도해 주세요.
            </p>
            <button
              type="button"
              onClick={() => setRankingRetryCount((c) => c + 1)}
              className="px-6 py-2.5 rounded-pill bg-navy text-cream text-f12 font-medium active:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
            >
              다시 시도
            </button>
          </div>
        )}

        {fetchState === 'success' && rankingItems.length === 0 && (
          <div className="flex items-center justify-center h-64 px-6">
            <p className="text-f16 text-navy-70 text-center">아직 랭킹 데이터가 없습니다.</p>
          </div>
        )}

        {fetchState === 'success' && rankingItems.length > 0 && (
          <>
            {podiumItems.length > 0 && <RankingPodium items={podiumItems} />}
            <RankingList
              items={listItems}
              myDogId={myRanking?.dogId ?? null}
              myRowRef={myRowRefCallback}
            />
            <RankingPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      {/* 내 순위 */}
      {currentMyRanking && (
        <MyRankingFloating
          categoryRanking={currentMyRanking}
          visible={showFloating}
          onNavigate={handleNavigateToMyRank}
        />
      )}

      <BottomNav />
    </div>
  )
}
