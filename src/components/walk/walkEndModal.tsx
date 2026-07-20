import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { finishWalk, abortWalk, extractErrorCode } from '../../api/walks'
import { useWalkStore } from '../../stores/walkStore'
import { activeWalkStorage } from '../../utils/activeWalkStorage'
import { useAuthStore } from '../../stores/authStore'
import { ROUTES } from '../../constants/routes'
import type { WalkPointDto, WalkFinishResponse } from '../../types/walk'

interface WalkEndModalProps {
  onClose: () => void
  getPendingSnapshot: () => WalkPointDto[]
  clearQueue: () => void
  stopTracking: () => void
  startTracking: () => void
}

type ModalStep = 'confirm' | 'finishing' | 'error-too-short' | 'error-other'

export default function WalkEndModal({
  onClose,
  getPendingSnapshot,
  clearQueue,
  stopTracking,
  startTracking,
}: WalkEndModalProps) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { walkId, serverStatus, pendingAction, setPendingAction, clearWalkSession } = useWalkStore()

  const [step, setStep] = useState<ModalStep>('confirm')
  const [errorMessage, setErrorMessage] = useState('')

  const busy = pendingAction !== null

  async function handleFinish() {
    if (!walkId || busy) return

    // 1. 새 좌표 수집 차단 + watcher 중지
    stopTracking()
    setPendingAction('finish')

    // 2. 현재 큐 스냅샷을 lastPoints로 사용
    const lastPoints = getPendingSnapshot()
    const idempotencyKey = crypto.randomUUID()

    try {
      const result: WalkFinishResponse = await finishWalk(
        walkId,
        lastPoints.length > 0 ? lastPoints : null,
        idempotencyKey,
      )

      // 3. 산책 종료 성공: 큐 + localStorage 정리
      clearQueue()
      if (user) activeWalkStorage.clear(user.id)
      clearWalkSession()

      navigate(ROUTES.WALK.RESULT_OF(walkId), {
        replace: true,
        state: { finishResult: result },
      })
    } catch (err) {
      const code = extractErrorCode(err)
      setPendingAction(null)

      if (code === 'WALK_TOO_SHORT') {
        setStep('error-too-short')
      } else {
        setErrorMessage(
          err instanceof Error ? err.message : '산책 종료에 실패했습니다. 다시 시도해 주세요.',
        )
        setStep('error-other')
        if (serverStatus === 'ONGOING') {
          startTracking()
        }
        // PAUSED 상태에서 산책 종료 실패 시 PAUSED 유지
      }
    }
  }

  async function handleAbort() {
    if (!walkId || busy) return

    setPendingAction('abort')
    try {
      await abortWalk(walkId)
      stopTracking()
      clearQueue()
      if (user) activeWalkStorage.clear(user.id)
      clearWalkSession()
      navigate(ROUTES.HOME, { replace: true })
    } catch (err) {
      setPendingAction(null)
      setErrorMessage(err instanceof Error ? err.message : '산책 중단에 실패했습니다.')
      setStep('error-other')
    }
  }

  function handleContinueWalking() {
    if (serverStatus === 'ONGOING') {
      startTracking()
    }
    onClose()
  }

  // ── 산책 확인 ──
  if (step === 'confirm') {
    return (
      <ModalBackdrop onClose={onClose}>
        <h2 className="text-f18 font-semibold text-navy mb-1">산책을 종료할까요?</h2>
        <p className="text-f14 text-navy-40 mb-6">현재까지의 경로와 통계가 저장됩니다.</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleFinish}
            disabled={busy}
            aria-label="산책 종료하기"
            className="w-full py-4 rounded-sm bg-navy text-white text-f16 font-medium disabled:opacity-40 active:opacity-70 transition-opacity"
          >
            {pendingAction === 'finish' ? '종료 중...' : '종료하기'}
          </button>
          <button
            onClick={() => {
              if (!busy) {
                const confirmed = window.confirm(
                  '산책을 중단하면 기록이 저장되지 않습니다. 정말 중단할까요?',
                )
                if (confirmed) handleAbort()
              }
            }}
            disabled={busy}
            aria-label="산책 중단하기 (기록 저장 안 됨)"
            className="w-full py-3 rounded-sm bg-navy-8 text-navy-40 text-f14 font-medium disabled:opacity-40 active:opacity-70 transition-opacity"
          >
            {pendingAction === 'abort' ? '중단 중...' : '기록 없이 중단하기'}
          </button>
          <button onClick={onClose} disabled={busy} className="w-full py-3 text-f14 text-navy-40">
            계속 산책하기
          </button>
        </div>
      </ModalBackdrop>
    )
  }

  // ── 짧은 산책 시간 ──
  if (step === 'error-too-short') {
    return (
      <ModalBackdrop onClose={handleContinueWalking}>
        <h2 className="text-f18 font-semibold text-navy mb-1">산책 시간이 부족해요</h2>
        <p className="text-f14 text-navy-40 mb-6">
          영토 인정을 받으려면 5분 이상 산책해야 합니다.
          <br />
          조금 더 산책하거나 포기할 수 있습니다.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleContinueWalking}
            className="w-full py-4 rounded-sm bg-navy text-white text-f16 font-medium active:opacity-70"
          >
            조금 더 산책하기
          </button>
          <button
            onClick={() => {
              const confirmed = window.confirm('산책을 포기하면 기록이 저장되지 않습니다.')
              if (confirmed) handleAbort()
            }}
            disabled={pendingAction === 'abort'}
            className="w-full py-3 rounded-sm bg-navy-8 text-navy-40 text-f14 font-medium disabled:opacity-40 active:opacity-70"
          >
            {pendingAction === 'abort' ? '중단 중...' : '산책 포기하기'}
          </button>
        </div>
      </ModalBackdrop>
    )
  }

  // ── 일반 오류 ──
  return (
    <ModalBackdrop onClose={onClose}>
      <h2 className="text-f18 font-semibold text-navy mb-1">오류가 발생했습니다</h2>
      <p className="text-f14 text-navy-40 mb-6">{errorMessage}</p>
      <div className="flex flex-col gap-3">
        <button
          onClick={() => setStep('confirm')}
          className="w-full py-4 rounded-sm bg-navy text-white text-f16 font-medium active:opacity-70"
        >
          다시 시도
        </button>
        <button onClick={onClose} className="w-full py-3 text-f14 text-navy-40">
          계속 산책하기
        </button>
      </div>
    </ModalBackdrop>
  )
}

function ModalBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-md bg-cream rounded-t-2xl px-6 pt-6 pb-safe-or-8 pb-8">
        {children}
      </div>
    </div>
  )
}
