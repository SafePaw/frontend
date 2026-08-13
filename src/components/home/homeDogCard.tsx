import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/button'
import { ROUTES } from '../../constants/routes'
import { resolveMarkerImage, DEFAULT_MARKER_IMAGE_SRC } from '../../utils/markerImage'
import type { Dog } from '../../types/dog'
import type { ActiveWalkItem } from '../../types/walk'
import type { ActiveWalkFetchState } from '../../pages/home/homePage'
import pawImg from '../../assets/paw.png'

function formatStartTime(startedAt: string): string {
  const date = new Date(startedAt)
  const h = date.getHours()
  const m = String(date.getMinutes()).padStart(2, '0')
  const ampm = h >= 12 ? '오후' : '오전'
  const h12 = h % 12 || 12
  return `${ampm} ${h12}:${m} 시작`
}

interface HomeDogCardProps {
  dogs: Dog[]
  selectedDogId: number | null
  onSelectDog: (dogId: number) => void
  activeWalk: ActiveWalkItem | null
  activeWalkFetchState: ActiveWalkFetchState
  onRetryActiveWalk: () => void
  onFinishWalk: (walkId: number) => Promise<void>
  onAbortWalk: (walkId: number) => Promise<void>
  finishError: string | null
  onClearFinishError: () => void
}

export default function HomeDogCard({
  dogs,
  selectedDogId,
  onSelectDog,
  activeWalk,
  activeWalkFetchState,
  onRetryActiveWalk,
  onFinishWalk,
  onAbortWalk,
  finishError,
  onClearFinishError,
}: HomeDogCardProps) {
  const navigate = useNavigate()
  const [confirmFinish, setConfirmFinish] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const [isAborting, setIsAborting] = useState(false)

  // ── 로딩 상태 ──
  if (activeWalkFetchState === 'loading') {
    return (
      <div className="flex items-center justify-between px-5 py-4 gap-3">
        <div className="min-w-0">
          <p className="text-f16 font-semibold text-navy">산책 정보 확인 중...</p>
          <p className="text-f12 text-navy-40 mt-0.5">잠시만 기다려 주세요</p>
        </div>
        <div className="w-7 h-7 rounded-full border-2 border-navy-15 border-t-navy animate-spin flex-shrink-0" />
      </div>
    )
  }

  // ── 조회 실패 ──
  if (activeWalkFetchState === 'error') {
    return (
      <div className="flex items-center justify-between px-5 py-4 gap-3">
        <div className="min-w-0">
          <p className="text-f16 font-semibold text-navy">산책 정보를 불러오지 못했어요</p>
          <p className="text-f12 text-navy-40 mt-0.5">진행 중인 산책이 있을 수 있습니다</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onRetryActiveWalk}>
          다시 시도
        </Button>
      </div>
    )
  }

  // ── 활성 산책 복구 ──
  if (activeWalk) {
    const isOngoing = activeWalk.status === 'ONGOING'
    const resumeLabel = isOngoing ? '계속하기' : '재개하기'
    const statusLabel = isOngoing ? '산책 진행 중' : '일시정지 중'

    async function handleFinish() {
      setIsFinishing(true)
      try {
        await onFinishWalk(activeWalk!.walkId)
      } finally {
        setIsFinishing(false)
        setConfirmFinish(false)
      }
    }

    async function handleAbort() {
      setIsAborting(true)
      try {
        await onAbortWalk(activeWalk!.walkId)
      } finally {
        setIsAborting(false)
        setConfirmFinish(false)
      }
    }

    // 종료 확인
    if (confirmFinish) {
      return (
        <div className="px-5 py-4 space-y-3">
          <p className="text-f16 font-semibold text-navy">산책을 종료할까요?</p>
          <p className="text-f12 text-navy-40">종료하면 서버에 기록된 경로로 결과를 계산합니다.</p>
          {finishError && <p className="text-f12 text-err">{finishError}</p>}
          <div className="flex flex-col gap-2">
            <Button
              variant="fill"
              size="sm"
              fullWidth
              disabled={isFinishing || isAborting}
              onClick={handleFinish}
            >
              {isFinishing ? '종료 중...' : '종료하기'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              disabled={isFinishing || isAborting}
              onClick={handleAbort}
            >
              {isAborting ? '중단 중...' : '기록 없이 중단하기'}
            </Button>
            <button
              disabled={isFinishing || isAborting}
              onClick={() => {
                setConfirmFinish(false)
                onClearFinishError()
              }}
              className="text-f12 text-navy-40 py-1 disabled:opacity-40"
            >
              계속 산책하기
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="flex-1 min-w-0">
          <p className={`text-f12 font-medium mb-0.5 ${isOngoing ? 'text-ok' : 'text-navy-40'}`}>
            {statusLabel}
          </p>
          <p className="text-f16 font-semibold text-navy truncate">{activeWalk.dogName}</p>
          <p className="text-f12 text-navy-40">{formatStartTime(activeWalk.startedAt)}</p>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          <Button
            variant="fill"
            size="sm"
            onClick={() => navigate(ROUTES.WALK.ACTIVE, { state: { activeWalk } })}
          >
            {resumeLabel}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmFinish(true)}>
            종료하기
          </Button>
        </div>
      </div>
    )
  }

  // ── 강아지 없음 ──
  if (dogs.length === 0) {
    return (
      <div className="flex items-center justify-between px-5 py-4 gap-3">
        <div className="min-w-0">
          <p className="text-f16 font-semibold text-navy">등록된 강아지가 없어요</p>
          <p className="text-f12 text-navy-40 mt-0.5">강아지를 등록하고 산책을 시작해 보세요</p>
        </div>
        <Button variant="fill" size="sm" onClick={() => navigate(ROUTES.DOGS.REGISTRATION)}>
          강아지 등록하기
        </Button>
      </div>
    )
  }

  // ── 정상 산책 시작 ──
  const selectedDog = dogs.find((d) => d.id === selectedDogId) ?? null
  const canCycle = dogs.length > 1

  const markerSrc = selectedDog
    ? resolveMarkerImage({
        markerImageType: selectedDog.markerImageType,
        markerImageValue: selectedDog.markerImageValue,
        markerImageUrl: selectedDog.markerImageUrl,
      })
    : DEFAULT_MARKER_IMAGE_SRC

  function cycleNext() {
    const currentIdx = dogs.findIndex((d) => d.id === selectedDogId)
    const nextIdx = (currentIdx + 1) % dogs.length
    onSelectDog(dogs[nextIdx].id)
  }

  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <button
        onClick={canCycle ? cycleNext : undefined}
        disabled={!canCycle}
        aria-label={canCycle ? '다른 강아지 선택' : (selectedDog?.name ?? '강아지')}
        className={[
          'w-12 h-12 rounded-full overflow-hidden bg-navy-5 flex-shrink-0',
          'flex items-center justify-center border-2',
          canCycle
            ? 'border-navy cursor-pointer active:opacity-70 transition-opacity'
            : 'border-navy-15',
        ].join(' ')}
      >
        <img
          src={markerSrc}
          alt={selectedDog?.name ?? '강아지'}
          className="w-9 h-9 object-contain"
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).src = DEFAULT_MARKER_IMAGE_SRC
          }}
        />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-f16 font-semibold text-navy truncate">{selectedDog?.name ?? '강아지'}</p>
        {canCycle && <p className="text-f12 text-navy-40">탭하여 변경</p>}
      </div>

      <Button variant="fill" size="md" onClick={() => navigate(ROUTES.WALK.READY)}>
        <img src={pawImg} alt="" className="w-4 h-4 inline-block mr-1" />산책 시작
      </Button>
    </div>
  )
}
