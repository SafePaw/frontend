import { useState, useEffect, useRef } from 'react'
import { getDogs } from '../../api/dogs'
import { getRankingsByCategory, getMyRanking } from '../../api/rankings'
import RankingCategoryTabs from '../../components/ranking/rankingCategoryTabs'
import RankingList from '../../components/ranking/rankingList'
import MyRankingCard from '../../components/ranking/myRankingCard'
import BottomNav from '../../components/layout/bottomNav'
import type { RankingCategoryKey, RankingItem, MyRankingData } from '../../types/ranking'

type FetchState = 'loading' | 'success' | 'error'

const PAGE_SIZE = 10

export default function RankingPage() {
  const [selectedCategory, setSelectedCategory] = useState<RankingCategoryKey>('xp')

  // 랭킹 목록
  const [items, setItems] = useState<RankingItem[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [fetchState, setFetchState] = useState<FetchState>('loading')
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState(false)
  const [rankingRetryCount, setRankingRetryCount] = useState(0)

  //내 랭킹
  const [myRanking, setMyRanking] = useState<MyRankingData | null>(null)
  const [myRankingFetchState, setMyRankingFetchState] = useState<FetchState>('loading')
  const [myRankingRetryCount, setMyRankingRetryCount] = useState(0)

  const listContainerRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const isLoadingMoreRef = useRef(false)

  const hasMore = items.length < totalElements
  const currentMyRanking = myRanking?.rankings[selectedCategory]

  // 강아지 목록 + 내 랭킹 조회
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
          setMyRankingFetchState('success')
        }
      })
      .catch(() => {
        if (cancelled) return
        setMyRankingFetchState('error')
      })

    return () => {
      cancelled = true
    }
  }, [myRankingRetryCount])

  // 카테고리 랭킹
  useEffect(() => {
    let cancelled = false
    setItems([])
    setTotalElements(0)
    setCurrentPage(0)
    setIsLoadingMore(false)
    setLoadMoreError(false)
    setFetchState('loading')
    isLoadingMoreRef.current = false

    getRankingsByCategory(selectedCategory, { page: 0, size: PAGE_SIZE })
      .then((data) => {
        if (cancelled) return
        setItems(data.content)
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
  }, [selectedCategory, rankingRetryCount])

  useEffect(() => {
    listContainerRef.current?.scrollTo({ top: 0 })
  }, [selectedCategory])

  useEffect(() => {
    const sentinel = sentinelRef.current
    const container = listContainerRef.current
    if (!sentinel || !container || !hasMore || isLoadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMoreRef.current) {
          handleLoadMore()
        }
      },
      { root: container, rootMargin: '100px', threshold: 0 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isLoadingMore])

  async function handleLoadMore() {
    if (isLoadingMoreRef.current || !hasMore) return
    isLoadingMoreRef.current = true
    setIsLoadingMore(true)
    setLoadMoreError(false)

    try {
      const data = await getRankingsByCategory(selectedCategory, {
        page: currentPage + 1,
        size: PAGE_SIZE,
      })
      setItems((prev) => {
        const existingIds = new Set(prev.map((item) => item.dogId))
        const deduped = data.content.filter((item) => !existingIds.has(item.dogId))
        return [...prev, ...deduped]
      })
      setCurrentPage((p) => p + 1)
      setTotalElements(data.totalElements)
    } catch {
      setLoadMoreError(true)
    } finally {
      isLoadingMoreRef.current = false
      setIsLoadingMore(false)
    }
  }

  function handleCategorySelect(category: RankingCategoryKey) {
    if (category === selectedCategory) return
    setSelectedCategory(category)
  }

  return (
    <div className="flex flex-col h-full bg-cream">
      <RankingCategoryTabs selectedCategory={selectedCategory} onSelect={handleCategorySelect} />

      <div ref={listContainerRef} className="flex-1 overflow-y-auto">
        {fetchState === 'loading' && (
          <div className="flex items-center justify-center h-full">
            <div className="w-10 h-10 rounded-full border-4 border-navy-15 border-t-navy animate-spin" />
          </div>
        )}

        {fetchState === 'error' && (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
            <p className="text-f16 text-navy text-center">
              랭킹을 불러오지 못했습니다.
              <br />
              잠시 후 다시 시도해 주세요.
            </p>
            <button
              onClick={() => setRankingRetryCount((c) => c + 1)}
              className="px-6 py-2.5 rounded-pill bg-navy text-cream text-f12 font-medium active:opacity-70 transition-opacity"
            >
              다시 시도
            </button>
          </div>
        )}

        {fetchState === 'success' && items.length === 0 && (
          <div className="flex items-center justify-center h-full px-6">
            <p className="text-f16 text-navy-40 text-center">현재 시즌에 표시할 랭킹이 없어요.</p>
          </div>
        )}

        {fetchState === 'success' && items.length > 0 && (
          <>
            <RankingList items={items} myDogId={myRanking?.dogId ?? null} />
            <div ref={sentinelRef} className="h-1" />

            {isLoadingMore && (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 rounded-full border-2 border-navy-15 border-t-navy animate-spin" />
              </div>
            )}

            {loadMoreError && !isLoadingMore && (
              <div className="flex flex-col items-center gap-2 py-4">
                <p className="text-f12 text-navy-40">추가 목록을 불러오지 못했어요.</p>
                <button
                  onClick={handleLoadMore}
                  className="text-f12 text-navy underline active:opacity-70 transition-opacity"
                >
                  다시 시도
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <MyRankingCard
        categoryRanking={currentMyRanking}
        selectedCategory={selectedCategory}
        isLoading={myRankingFetchState === 'loading'}
        isError={myRankingFetchState === 'error'}
        onRetry={() => setMyRankingRetryCount((c) => c + 1)}
      />

      <BottomNav />
    </div>
  )
}
