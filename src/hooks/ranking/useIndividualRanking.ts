import { useState, useEffect, useCallback, useMemo } from 'react'
import { getDogs } from '../../api/dogs'
import { getRankingsByCategory, getMyRanking } from '../../api/rankings'
import type { RankingCategoryKey, RankingItem, MyRankingData } from '../../types/ranking'

const PAGE_SIZE = 20

type FetchState = 'loading' | 'success' | 'error'

export function useIndividualRanking(scrollContainerRef: React.RefObject<HTMLDivElement>) {
  const [selectedCategory, setSelectedCategory] = useState<RankingCategoryKey>('xp')
  const [currentPage, setCurrentPage] = useState(0)
  const [rankingItems, setRankingItems] = useState<RankingItem[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [fetchState, setFetchState] = useState<FetchState>('loading')
  const [rankingRetryCount, setRankingRetryCount] = useState(0)
  const [myRanking, setMyRanking] = useState<MyRankingData | null>(null)
  const [myRankingFetchState, setMyRankingFetchState] = useState<FetchState>('loading')
  const [myRowEl, setMyRowEl] = useState<HTMLDivElement | null>(null)
  const [myRowVisible, setMyRowVisible] = useState(false)
  const [shouldScrollToMyRow, setShouldScrollToMyRow] = useState(false)

  const totalPages = useMemo(() => Math.ceil(totalElements / PAGE_SIZE), [totalElements])
  const currentMyRanking = myRanking?.rankings[selectedCategory] ?? null

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

  // 개인 랭킹 목록 조회
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
        if (myData) setMyRanking(myData)
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
    const el = myRowEl
    const container = scrollContainerRef.current
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
  }, [myRowEl, scrollContainerRef])

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

  function handleRetry() {
    setRankingRetryCount((c) => c + 1)
  }

  const myRowRefCallback = useCallback((el: HTMLDivElement | null) => {
    setMyRowEl(el)
  }, [])

  return {
    selectedCategory,
    currentPage,
    rankingItems,
    totalElements,
    fetchState,
    myRanking,
    myRankingFetchState,
    currentMyRanking,
    podiumItems,
    listItems,
    totalPages,
    myRowVisible,
    showFloating,
    handleCategorySelect,
    handlePageChange,
    handleNavigateToMyRank,
    handleRetry,
    myRowRefCallback,
  }
}
