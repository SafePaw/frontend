import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import GuideModal from '../../components/guide/guideModal'
import GuideVisual from '../../components/guide/walkActiveVisual'
import { WALK_HELP_STEPS } from '../../constants/guideSteps'
import { ROUTES } from '../../constants/routes'
import WalkMap from '../../components/walk/walkMap'
import WalkStats from '../../components/walk/walkStats'
import WalkControls from '../../components/walk/walkControls'
import WalkErrorBanner from '../../components/walk/walkErrorBanner'
import WalkEndModal from '../../components/walk/walkEndModal'
import { useWalkStore } from '../../stores/walkStore'
import { useAuthStore } from '../../stores/authStore'
import { activeWalkStorage } from '../../utils/activeWalkStorage'
import { pauseWalk, resumeWalk, getActiveWalks } from '../../api/walks'
import { useGeolocationTracking } from '../../hooks/useGeolocationTracking'
import { useWalkLivePolling } from '../../hooks/useWalkLivePolling'
import { useWalkPointUploader } from '../../hooks/useWalkPointUploader'
import type { WalkPointDto, ActiveWalkItem } from '../../types/walk'
import Button from '../../components/ui/button'

type RecoveryState = 'pending' | 'recovered' | 'failed'

export default function WalkActivePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const {
    walkId,
    serverStatus,
    pendingAction,
    liveStats,
    error,
    initialPoint,
    setWalkSession,
    setServerStatus,
    setPendingAction,
    setError,
  } = useWalkStore()

  const [recoveryState, setRecoveryState] = useState<RecoveryState>('pending')
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isEndModalOpen, setIsEndModalOpen] = useState(false)
  const [routeCoords, setRouteCoords] = useState<[number, number][]>(
    initialPoint ? [initialPoint] : [],
  )
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(initialPoint)
  const startPointRef = useRef<[number, number] | undefined>(initialPoint ?? undefined)
  const addPointRef = useRef<((point: WalkPointDto) => void) | null>(null)

  const isPaused = serverStatus === 'PAUSED'
  const isActive = serverStatus === 'ONGOING'

  useEffect(() => {
    if (walkId) {
      setRecoveryState('recovered')
      return
    }

    const routeActiveWalk = (location.state as { activeWalk?: ActiveWalkItem } | null)?.activeWalk

    if (routeActiveWalk) {
      setWalkSession(
        routeActiveWalk.walkId,
        routeActiveWalk.dogId,
        routeActiveWalk.startedAt,
        routeActiveWalk.status,
      )
      setRecoveryState('recovered')
      return
    }

    // 서버 재조회 fallback (새로고침 또는 직접 URL 진입)
    getActiveWalks()
      .then((res) => {
        if (res.walks.length === 0) {
          setRecoveryState('failed')
          return
        }
        if (res.walks.length > 1) {
          console.warn('[SafePaw] 복수 활성 산책 감지 (WalkActivePage):', res.walks.length)
        }
        const walk = [...res.walks].sort(
          (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
        )[0]
        setWalkSession(walk.walkId, walk.dogId, walk.startedAt, walk.status)
        setRecoveryState('recovered')
      })
      .catch(() => setRecoveryState('failed'))
  }, [])

  const handleNewPoint = useCallback((point: WalkPointDto) => {
    const coord: [number, number] = [point.lng, point.lat]
    if (!startPointRef.current) startPointRef.current = coord
    setCurrentPosition(coord)
    setRouteCoords((prev) => [...prev, coord])
    addPointRef.current?.(point)
  }, [])

  const { isTracking, geoError, startTracking, stopTracking } = useGeolocationTracking({
    onPoint: handleNewPoint,
    onError: (msg) => setError({ code: 'GPS_ERROR', message: msg }),
  })

  const { addPoint, flush, getPendingSnapshot, clearQueue, queueWarning } = useWalkPointUploader({
    walkId,
    isActive,
  })

  addPointRef.current = addPoint

  useWalkLivePolling(walkId)

  useEffect(() => {
    if (recoveryState !== 'recovered') return
    if (serverStatus !== 'ONGOING') return
    startTracking()
    return () => stopTracking()
  }, [recoveryState, serverStatus, startTracking, stopTracking])

  // ── 산책 중지 ──
  async function handlePause() {
    if (!walkId || pendingAction) return
    setPendingAction('pause')

    // 1. 새 좌표 추가 차단
    stopTracking()
    await flush()

    // 2. 중단
    try {
      await pauseWalk(walkId)
      setServerStatus('PAUSED')
      if (user) activeWalkStorage.update(user.id, { lastKnownStatus: 'PAUSED' })
    } catch (err) {
      const code = (err as { code?: string }).code
      if (code === 'WALK_ALREADY_PAUSED') {
        setServerStatus('PAUSED')
      } else {
        setError({ code: code ?? 'PAUSE_FAIL', message: '일시정지에 실패했습니다.' })
        startTracking()
      }
    } finally {
      setPendingAction(null)
    }
  }

  // ── 산책 재개 ──
  async function handleResume() {
    if (!walkId || pendingAction) return
    setPendingAction('resume')
    try {
      await resumeWalk(walkId)
      setServerStatus('ONGOING')
      if (user) activeWalkStorage.update(user.id, { lastKnownStatus: 'ONGOING' })
      startTracking()
    } catch (err) {
      const code = (err as { code?: string }).code
      setError({ code: code ?? 'RESUME_FAIL', message: '재개에 실패했습니다.' })
    } finally {
      setPendingAction(null)
    }
  }

  if (recoveryState === 'pending') {
    return (
      <div className="flex h-full items-center justify-center bg-cream">
        <div className="w-10 h-10 rounded-full border-4 border-navy-15 border-t-navy animate-spin" />
      </div>
    )
  }

  if (recoveryState === 'failed') {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-cream gap-4 px-6">
        <p className="text-f16 text-navy-40 text-center">진행 중인 산책을 확인하지 못했습니다</p>
        <Button variant="ghost" size="md" onClick={() => navigate(ROUTES.HOME, { replace: true })}>
          홈으로 돌아가기
        </Button>
      </div>
    )
  }

  const errorMsg = error?.code === 'LIVE_POLL_FAIL' ? error.message : null
  const gpsErrorMsg = geoError
  const displayError =
    gpsErrorMsg ?? (queueWarning ? 'GPS 데이터 저장이 지연되고 있습니다.' : errorMsg)

  return (
    <div className="flex flex-col h-full bg-cream">
      <div className="flex items-center justify-between px-6 pt-14 pb-3">
        <div className="flex items-center gap-3">
          <h1 className="text-f20 font-semibold text-navy">산책 중</h1>
          {isPaused ? (
            <span className="px-3 py-1 rounded-pill bg-navy-8 text-f12 text-navy-40 font-medium">
              ⏸ 일시정지
            </span>
          ) : (
            <span className="px-3 py-1 rounded-pill bg-ok/10 text-f12 text-ok font-medium">
              산책 중 ●
            </span>
          )}
        </div>
        <button
          onClick={() => setIsHelpOpen(true)}
          className="w-9 h-9 rounded-full bg-navy-8 flex items-center justify-center active:opacity-70"
          aria-label="도움말"
        >
          <span className="text-navy font-semibold text-f16 leading-none">?</span>
        </button>
      </div>

      <WalkErrorBanner message={displayError} onDismiss={() => setError(null)} />

      {!isTracking && !isPaused && (
        <p className="text-center text-f12 text-navy-40 pb-1">GPS 신호 대기 중...</p>
      )}

      <div className="flex-1 mx-4 mb-2 rounded-xl overflow-hidden">
        <WalkMap
          currentPosition={currentPosition}
          routeCoords={routeCoords}
          isPaused={isPaused}
          startPoint={startPointRef.current}
        />
      </div>

      {/* 통계 */}
      <div className="bg-white border-t border-navy-8">
        <WalkStats stats={liveStats} isPaused={isPaused} />
        <div className="mx-6 h-px bg-navy-8" />
        <WalkControls
          serverStatus={serverStatus}
          pendingAction={pendingAction}
          onPause={handlePause}
          onResume={handleResume}
          onFinish={() => setIsEndModalOpen(true)}
        />
      </div>

      {/* 종료/중단 */}
      {isEndModalOpen && (
        <WalkEndModal
          onClose={() => setIsEndModalOpen(false)}
          getPendingSnapshot={getPendingSnapshot}
          clearQueue={clearQueue}
          stopTracking={stopTracking}
          startTracking={startTracking}
        />
      )}

      <GuideModal
        steps={WALK_HELP_STEPS}
        isOpen={isHelpOpen}
        onComplete={() => setIsHelpOpen(false)}
        onDismiss={() => setIsHelpOpen(false)}
        completeCta="확인"
        renderVisual={(type) => <GuideVisual type={type} />}
      />
    </div>
  )
}
