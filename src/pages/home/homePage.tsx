import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useWalkStore } from '../../stores/walkStore'
import { activeWalkStorage } from '../../utils/activeWalkStorage'
import { getDogs } from '../../api/dogs'
import { getActiveWalks, finishWalk, abortWalk, extractErrorCode } from '../../api/walks'
import HomeMap from '../../components/home/homeMap'
import HomeDogCard from '../../components/home/homeDogCard'
import BottomNav from '../../components/layout/bottomNav'
import { ROUTES } from '../../constants/routes'
import type { Dog } from '../../types/dog'
import type { ActiveWalkItem } from '../../types/walk'

export type ActiveWalkFetchState = 'loading' | 'success' | 'error'

export default function HomePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const clearWalkSession = useWalkStore((s) => s.clearWalkSession)

  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDogId, setSelectedDogId] = useState<number | null>(null)
  const [activeWalks, setActiveWalks] = useState<ActiveWalkItem[]>([])
  const [activeWalkFetchState, setActiveWalkFetchState] = useState<ActiveWalkFetchState>('loading')
  const [finishError, setFinishError] = useState<string | null>(null)

  useEffect(() => {
    getDogs()
      .then((list) => {
        setDogs(list)
        if (list.length >= 1) setSelectedDogId(list[0].id)
      })
      .catch(() => {})
  }, [])

  const fetchActiveWalks = useCallback(async () => {
    if (!user) return
    setActiveWalkFetchState('loading')
    try {
      const res = await getActiveWalks()
      if (res.walks.length === 0) {
        activeWalkStorage.clear(user.id)
        clearWalkSession()
      }
      setActiveWalks(res.walks)
      setActiveWalkFetchState('success')
    } catch {
      setActiveWalkFetchState('error')
    }
  }, [user, clearWalkSession])

  useEffect(() => {
    fetchActiveWalks()
  }, [fetchActiveWalks])

  async function handleFinishActiveWalk(walkId: number) {
    setFinishError(null)
    try {
      const result = await finishWalk(walkId, null)
      if (user) activeWalkStorage.clear(user.id)
      clearWalkSession()
      setActiveWalks([])
      navigate(ROUTES.WALK.RESULT_OF(walkId), { state: { finishResult: result } })
    } catch (err) {
      const code = extractErrorCode(err)
      if (code === 'WALK_TOO_SHORT') {
        setFinishError(
          '산책 시간이 짧아 영토가 생성되지 않아요. 중단하려면 "기록 없이 중단하기"를 선택해 주세요.',
        )
      } else {
        setFinishError(err instanceof Error ? err.message : '산책 종료에 실패했습니다.')
      }
    }
  }

  async function handleAbortActiveWalk(walkId: number) {
    setFinishError(null)
    try {
      await abortWalk(walkId)
      if (user) activeWalkStorage.clear(user.id)
      clearWalkSession()
      setActiveWalks([])
    } catch (err) {
      setFinishError(err instanceof Error ? err.message : '산책 중단에 실패했습니다.')
    }
  }

  const primaryActiveWalk: ActiveWalkItem | null =
    activeWalks.length > 0
      ? [...activeWalks].sort(
          (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
        )[0]
      : null

  if (activeWalks.length > 1) {
    console.warn('[SafePaw] 복수 활성 산책 감지:', activeWalks.length, activeWalks)
  }

  return (
    <div className="relative h-full overflow-hidden">
      <div className="absolute inset-0">
        <HomeMap />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="mx-4 mb-3 bg-cream rounded-xl border border-navy-15 shadow-md">
          <HomeDogCard
            dogs={dogs}
            selectedDogId={selectedDogId}
            onSelectDog={setSelectedDogId}
            activeWalk={primaryActiveWalk}
            activeWalkFetchState={activeWalkFetchState}
            onRetryActiveWalk={fetchActiveWalks}
            onFinishWalk={handleFinishActiveWalk}
            onAbortWalk={handleAbortActiveWalk}
            finishError={finishError}
            onClearFinishError={() => setFinishError(null)}
          />
        </div>

        <BottomNav />
      </div>
    </div>
  )
}
