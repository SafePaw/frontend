import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/button'
import GuideModal from '../../components/guide/guideModal'
import GuideVisual from '../../components/guide/walkReadyVisual'
import { PRE_WALK_GUIDE_STEPS } from '../../constants/guideSteps'
import { useGuideFlow } from '../../hooks/useGuideFlow'
import { ROUTES } from '../../constants/routes'
import { getDogs } from '../../api/dogs'
import { startWalk, extractErrorCode } from '../../api/walks'
import { useWalkStore } from '../../stores/walkStore'
import { useAuthStore } from '../../stores/authStore'
import { activeWalkStorage } from '../../utils/activeWalkStorage'
import { getInitialPosition } from '../../hooks/useGeolocationTracking'
import { WALK_GPS_CONFIG } from '../../constants/walk'
import type { Dog } from '../../types/dog'

type PageState = 'loading' | 'ready' | 'gps-check' | 'starting' | 'error'

export default function WalkReadyPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { setWalkSession, setInitialPoint } = useWalkStore()
  const { hasSeen, markSeen } = useGuideFlow('preWalk')

  const startingRef = useRef(false)

  const [isGuideOpen, setIsGuideOpen] = useState(!hasSeen)
  const [pageState, setPageState] = useState<PageState>('loading')
  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDogId, setSelectedDogId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null)

  // 강아지 목록
  useEffect(() => {
    getDogs()
      .then((list) => {
        setDogs(list)
        if (list.length === 1) setSelectedDogId(list[0].id)
        setPageState('ready')
      })
      .catch(() => {
        setErrorMessage('강아지 정보를 불러오지 못했습니다.')
        setPageState('error')
      })
  }, [])

  function handleGuideComplete() {
    markSeen()
    setIsGuideOpen(false)
  }

  async function handleStartWalk() {
    if (startingRef.current || !selectedDogId || !user) return
    startingRef.current = true
    setErrorMessage(null)
    setGpsAccuracy(null)

    // 1. GPS 권한 확인 + 최초 좌표
    setPageState('gps-check')
    let initialPoint
    try {
      initialPoint = await getInitialPosition(
        WALK_GPS_CONFIG.initialAccuracyThresholdMeters,
        WALK_GPS_CONFIG.initialFixTimeoutMs,
      )
      setGpsAccuracy(initialPoint.accuracyMeters)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'GPS 신호를 확인할 수 없습니다.')
      setPageState('ready')
      return
    }

    // 2. start API 호출
    setPageState('starting')
    try {
      const res = await startWalk(selectedDogId)
      const walkId = res.walkSessionId

      // 3. localStorage + store 저장
      activeWalkStorage.set(user.id, {
        walkId,
        dogId: selectedDogId,
        startedAt: res.startedAt,
        lastKnownStatus: 'ONGOING',
      })
      setWalkSession(walkId, selectedDogId, res.startedAt, 'ONGOING')
      setInitialPoint([initialPoint.lng, initialPoint.lat])

      // 4. walkActivePage로 이동
      navigate(ROUTES.WALK.ACTIVE, { replace: true })
    } catch (err) {
      const code = extractErrorCode(err)
      if (code === 'WALK_ONGOING_EXISTS') {
        // localStorage에 기존 walkId가 있으면 복귀 시도
        const stored = activeWalkStorage.get(user.id)
        if (stored) {
          setWalkSession(stored.walkId, stored.dogId, stored.startedAt, stored.lastKnownStatus)
          navigate(ROUTES.WALK.ACTIVE, { replace: true })
          return
        }
        setErrorMessage(
          '진행 중인 산책이 있지만 정보를 불러오지 못했습니다.\n현재는 새로운 산책을 시작할 수 없습니다.',
        )
      } else {
        setErrorMessage(
          err instanceof Error ? err.message : '산책 시작에 실패했습니다. 다시 시도해 주세요.',
        )
      }
      setPageState('ready')
    } finally {
      startingRef.current = false
    }
  }

  const isLoading = pageState === 'loading'
  const isBusy = pageState === 'gps-check' || pageState === 'starting'

  return (
    <div className="flex flex-col h-full bg-cream">
      <div className="flex items-center px-6 pt-14 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 text-f20 text-navy-70 leading-none"
          aria-label="뒤로가기"
        >
          ←
        </button>
        <h1 className="text-f20 font-semibold text-navy">산책 준비</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-navy-15 border-t-navy animate-spin" />
          </div>
        )}

        {/* 강아지 선택 */}
        {!isLoading && dogs.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-f16 text-navy-40 mb-4">등록된 강아지가 없습니다.</p>
            <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.DOGS.REGISTRATION)}>
              강아지 등록하기
            </Button>
          </div>
        )}

        {!isLoading && dogs.length >= 2 && (
          <div>
            <p className="text-f14 text-navy-40 mb-3">함께 산책할 강아지를 선택해 주세요</p>
            <div className="space-y-2">
              {dogs.map((dog) => (
                <button
                  key={dog.id}
                  onClick={() => setSelectedDogId(dog.id)}
                  className={[
                    'w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-all active:opacity-70',
                    selectedDogId === dog.id ? 'border-navy bg-navy-8' : 'border-navy-15 bg-navy-5',
                  ].join(' ')}
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: dog.territoryColor }}
                  />
                  <span className="text-f16 text-navy font-medium">{dog.name}</span>
                  {selectedDogId === dog.id && (
                    <span className="ml-auto text-navy text-f14">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {!isLoading && dogs.length === 1 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-navy-8 border border-navy-15">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: dogs[0].territoryColor }}
            />
            <span className="text-f16 text-navy font-medium">{dogs[0].name}</span>
          </div>
        )}

        {pageState === 'gps-check' && (
          <p className="text-f14 text-navy-40 text-center py-2">GPS 신호 확인 중...</p>
        )}
        {pageState === 'starting' && (
          <p className="text-f14 text-navy-40 text-center py-2">산책을 시작하는 중...</p>
        )}
        {gpsAccuracy !== null && pageState === 'ready' && (
          <p className="text-f12 text-ok text-center">GPS 정확도: 약 {Math.round(gpsAccuracy)}m</p>
        )}

        {errorMessage && (
          <div className="px-4 py-3 rounded-lg bg-err/10 border border-err/20">
            {errorMessage.includes('\n') ? (
              <>
                {errorMessage.split('\n').map((line, i) => (
                  <p
                    key={i}
                    className={`text-f14 text-err ${i > 0 ? 'mt-1 text-f12 text-navy-40' : ''}`}
                  >
                    {line}
                  </p>
                ))}
                <button onClick={handleStartWalk} className="mt-3 text-f13 text-navy underline">
                  다시 확인
                </button>
              </>
            ) : (
              <p className="text-f14 text-err">{errorMessage}</p>
            )}
          </div>
        )}
      </div>

      <div className="px-6 pb-12 pt-4">
        <Button
          variant="fill"
          size="lg"
          fullWidth
          disabled={isBusy || !selectedDogId || isLoading}
          onClick={handleStartWalk}
        >
          {isBusy ? '준비 중...' : '산책 시작'}
        </Button>
      </div>

      <GuideModal
        steps={PRE_WALK_GUIDE_STEPS}
        isOpen={isGuideOpen}
        onComplete={handleGuideComplete}
        onDismiss={() => setIsGuideOpen(false)}
        completeCta="산책 시작하기"
        dismissCta="나중에 보기"
        renderVisual={(type) => <GuideVisual type={type} />}
      />
    </div>
  )
}
