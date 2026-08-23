import { useState, useEffect, useCallback, useMemo } from 'react'
import { getCrewRanking, getMyCrewRanking } from '../../api/crewTerritory'
import { extractErrorCode } from '../../utils/apiError'
import type { CrewRankingEntry, MyCrewRanking } from '../../types/crewTerritory'

const CREW_PAGE_SIZE = 20

type FetchState = 'loading' | 'success' | 'error'
type MyCrewFetchState = 'idle' | 'loading' | 'success' | 'error'

export function useCrewRanking(
  enabled: boolean,
  scrollContainerRef: React.RefObject<HTMLDivElement>,
) {
  const [crewPage, setCrewPage] = useState(0)
  const [crewRankingItems, setCrewRankingItems] = useState<CrewRankingEntry[]>([])
  const [crewTotalElements, setCrewTotalElements] = useState(0)
  const [crewFetchState, setCrewFetchState] = useState<FetchState>('loading')
  const [crewRetryCount, setCrewRetryCount] = useState(0)

  const [myCrewRanking, setMyCrewRanking] = useState<MyCrewRanking | null>(null)
  const [myCrewFetchState, setMyCrewFetchState] = useState<MyCrewFetchState>('idle')

  const [myCrewRowEl, setMyCrewRowEl] = useState<HTMLDivElement | null>(null)
  const [myCrewRowVisible, setMyCrewRowVisible] = useState(false)
  const [shouldScrollToMyCrewRow, setShouldScrollToMyCrewRow] = useState(false)

  const crewTotalPages = useMemo(
    () => Math.ceil(crewTotalElements / CREW_PAGE_SIZE),
    [crewTotalElements],
  )

  const crewPodiumItems = useMemo(
    () => (crewPage === 0 && crewRankingItems.length > 0 ? crewRankingItems.slice(0, 3) : []),
    [crewPage, crewRankingItems],
  )

  const crewListItems = useMemo(
    () => (crewPage === 0 ? crewRankingItems.slice(crewPodiumItems.length) : crewRankingItems),
    [crewPage, crewRankingItems, crewPodiumItems.length],
  )

  const myCrewRankPage = useMemo(() => {
    const rank = myCrewRanking?.rank
    if (rank == null) return null
    return Math.floor((rank - 1) / CREW_PAGE_SIZE)
  }, [myCrewRanking?.rank])

  const showCrewFloating =
    myCrewFetchState === 'success' &&
    myCrewRanking !== null &&
    myCrewRanking.rank !== null &&
    !myCrewRowVisible

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setCrewRankingItems([])
    setCrewTotalElements(0)
    setCrewFetchState('loading')

    getCrewRanking({ page: crewPage, size: CREW_PAGE_SIZE })
      .then((data) => {
        if (cancelled) return
        setCrewRankingItems(data.content)
        setCrewTotalElements(data.totalElements)
        setCrewFetchState('success')
      })
      .catch(() => {
        if (cancelled) return
        setCrewFetchState('error')
      })

    return () => {
      cancelled = true
    }
  }, [enabled, crewPage, crewRetryCount])

  useEffect(() => {
    if (!enabled || myCrewFetchState !== 'idle') return
    let cancelled = false
    setMyCrewFetchState('loading')

    getMyCrewRanking()
      .then((data) => {
        if (cancelled) return
        setMyCrewRanking(data)
        setMyCrewFetchState('success')
      })
      .catch((err) => {
        if (cancelled) return
        const code = extractErrorCode(err)
        if (code === 'CREW_NOT_JOINED') {
          setMyCrewFetchState('success')
        } else {
          setMyCrewFetchState('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [enabled, myCrewFetchState])

  useEffect(() => {
    const el = myCrewRowEl
    const container = scrollContainerRef.current
    if (!el || !container) {
      setMyCrewRowVisible(false)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => setMyCrewRowVisible(entries[0].isIntersecting),
      { root: container, threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [myCrewRowEl, scrollContainerRef])

  useEffect(() => {
    if (shouldScrollToMyCrewRow && myCrewRowEl) {
      myCrewRowEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setShouldScrollToMyCrewRow(false)
    }
  }, [shouldScrollToMyCrewRow, myCrewRowEl])

  function handleCrewPageChange(page: number) {
    setCrewPage(page)
    setMyCrewRowEl(null)
    setMyCrewRowVisible(false)
  }

  function handleNavigateToMyCrewRank() {
    if (myCrewRankPage === null) return
    if (crewPage === myCrewRankPage) {
      myCrewRowEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      setCrewPage(myCrewRankPage)
      setShouldScrollToMyCrewRow(true)
    }
  }

  function handleCrewRetry() {
    setCrewRetryCount((c) => c + 1)
  }

  const myCrewRowRefCallback = useCallback((el: HTMLDivElement | null) => {
    setMyCrewRowEl(el)
  }, [])

  return {
    crewPage,
    crewRankingItems,
    crewTotalElements,
    crewFetchState,
    myCrewRanking,
    myCrewFetchState,
    crewTotalPages,
    crewPodiumItems,
    crewListItems,
    myCrewRankPage,
    myCrewRowVisible,
    showCrewFloating,
    handleCrewPageChange,
    handleNavigateToMyCrewRank,
    handleCrewRetry,
    myCrewRowRefCallback,
  }
}
